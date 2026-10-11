import { createClient } from "jsr:@supabase/supabase-js@2";

const OPENROUTER_KEY = Deno.env.get("OPENROUTER_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? (() => { try { return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}").default ?? null; } catch { return null; } })();

// OpenRouter free models with vision (for image/pdf fallback)
const OR_FREE_VISION = ["google/gemma-4-26b-a4b-it:free", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free", "thinkingmachines/inkling:free"];
const OR_FREE_TEXT = ["nvidia/nemotron-3-ultra-550b-a55b:free", "nvidia/nemotron-3-super-120b-a12b:free", "google/gemma-4-31b-it:free", "apodex/apodex-1.1-mini:free", "liquid/lfm-2.5-2.6b:free"];

const SYSTEM_TUTOR = "You are a precise Cambridge IGCSE Physics tutor. Answer the student's question clearly, show calculations with units, and keep the answer student-friendly and focused. Infer the topic from the question — never ask the student to select one.";
const SYSTEM_MARKER = "You are a Cambridge IGCSE Physics exam marker. The supplied mark scheme is the only authority. Award marks strictly per the scheme including accepted alternatives. Return ONLY valid JSON: {marks_awarded, marks_total, percentage, grade, feedback:[{point, awarded, explanation}]}. percentage = marks_awarded/marks_total*100 rounded to 1dp. Keep each explanation to one sentence.";
const SYSTEM_RECHECK = "You are an independent second examiner for Cambridge IGCSE Physics. Audit the first marker result against the attached student answer and official mark scheme; do not assume the first result is correct. Return ONLY JSON with keys status (agree, disagree, unable_to_verify), summary (short), disagreements (array of {point,reason}). Identify concrete disagreements and missing-page/denominator problems. Never invent unreadable content or a replacement total unless the full scheme supports it.";

function cors() { return { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" }; }
function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", ...cors() } }); }
function log(sb: ReturnType<typeof createClient>, model: string, modality: string, status: string) { sb.from("model_usage_log").insert({ model_id: model, modality, status }).then(() => {}, () => {}); }

function tokenize(text: string) { return [...new Set((text || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(x => x.length > 2))].slice(0, 60); }

async function getTeacherKnowledge(sb: ReturnType<typeof createClient>, question: string) {
  const { data } = await sb.from("materials").select("title,unit_name,content_text,created_at").not("content_text", "is", null).order("created_at", { ascending: false }).limit(50);
  if (!data?.length) return "";
  const tokens = tokenize(question);
  const ranked = data.map((r: {title:string,unit_name:string,content_text:string,created_at:string}) => ({ ...r, score: tokens.reduce((n: number, t: string) => n + ((r.title + " " + r.unit_name + " " + r.content_text).toLowerCase().includes(t) ? 1 : 0), 0) })).sort((a: {score:number}, b: {score:number}) => b.score - a.score);
  let total = 0; const parts: string[] = [];
  for (const r of ranked) { if (total >= 14000) break; const body = String(r.content_text || "").slice(0, 3500); if (!body) continue; const part = `[${r.title || "Material"} · ${r.unit_name || "General"}]\n${body}`; total += part.length; parts.push(part); }
  return parts.length ? `\n\nTEACHER KNOWLEDGE BASE (use when relevant, say so when you do):\n${parts.join("\n---\n")}` : "";
}

async function fetchBase64(url: string) {
  const res = await fetch(url); if (!res.ok) throw new Error("fetch_failed:" + res.status);
  const ct = (res.headers.get("content-type") || "application/octet-stream").split(";")[0];
  const buf = await res.arrayBuffer(); const bytes = new Uint8Array(buf);
  let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, Math.min(i + 0x8000, bytes.length)));
  return { b64: btoa(bin), mime: ct };
}

// ── OpenRouter free ───────────────────────────────────────────────────────────
async function callOpenRouter(body: Record<string,unknown>, mode: string, hasImage: boolean) {
  if (!OPENROUTER_KEY) throw new Error("OPENROUTER_API_KEY not set. Free-only mode is active; no other AI provider will be called.");
  const req = body as {question?:string,conversationHistory?:{role:string,content:string}[],answerText?:string,imageUrl?:string,pdfUrl?:string,audioUrl?:string,answerImageUrl?:string,answerPdfUrl?:string,markSchemeUrl?:string,markSchemeMimeType?:string};
  const hasPdf = !!(req.pdfUrl || req.answerPdfUrl || req.markSchemeUrl);
  const models = ["openrouter/free"];
  const system = mode === "mark" ? SYSTEM_MARKER : mode === "recheck" ? SYSTEM_RECHECK : SYSTEM_TUTOR;
  const history = mode === "tutor" ? (req.conversationHistory || []).map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })) : [];
  const parts: Record<string,unknown>[] = [];
  const userText = mode === "mark"
    ? ("Mark the student's work against the official mark scheme only. Student typed answer: " + (req.answerText || "(see attached answer file)") + ". Compare the answer with the supplied official mark scheme. Return the required JSON only.")
    : (req.question || "");
  if (userText) parts.push({type:"text",text:userText});
  async function addFile(url:string|undefined, filename:string, mimeOverride?:string) {
    if (!url) return;
    const f = await fetchBase64(url);
    const mime = mimeOverride || f.mime;
    if (mime === "application/pdf") parts.push({type:"file",file:{filename,file_data:"data:application/pdf;base64,"+f.b64}});
    else if (mime.startsWith("image/")) parts.push({type:"image_url",image_url:{url:"data:"+mime+";base64,"+f.b64}});
    else parts.push({type:"text",text:"[Attachment "+filename+" has unsupported media type "+mime+"]"});
  }
  if (mode === "mark" || mode === "recheck") {
    await addFile(req.answerPdfUrl,"student-submission.pdf","application/pdf");
    await addFile(req.answerImageUrl,"student-answer-image");
    await addFile(req.markSchemeUrl,"official-mark-scheme.pdf",req.markSchemeMimeType || "application/pdf");
  } else {
    await addFile(req.imageUrl,"student-question-image");
    await addFile(req.pdfUrl,"student-question.pdf","application/pdf");
    if (req.audioUrl) parts.push({type:"text",text:"[A voice recording was attached, but this free-model route currently needs the question transcribed as text.]"});
  }
  const userContent:unknown = parts.length === 1 && parts[0].type === "text" ? parts[0].text : parts;
  const messages = [{role:"system",content:system}, ...history, {role:"user",content:userContent}];
  const errors:string[] = [];
  for (const model of models) {
    const payload:Record<string,unknown> = {model,messages,temperature:mode === "mark" || mode === "recheck" ? 0.1 : 0.4,max_tokens:mode === "mark" ? 6000 : mode === "recheck" ? 1800 : 1800,provider:{allow_fallbacks:false}};
    if (hasPdf) payload.plugins = [{id:"file-parser",pdf:{engine:"native"}}];
    if (mode === "mark" || mode === "recheck") payload.response_format = {type:"json_object"};
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+OPENROUTER_KEY,"Content-Type":"application/json","HTTP-Referer":"https://ai-sistant-alharony.netlify.app","X-Title":"physics AI-sistant"},body:JSON.stringify(payload),signal:AbortSignal.timeout(mode === "mark" ? 60000 : mode === "recheck" ? 20000 : 40000)});
      if ([400,402,404,408,429,500,502,503,504].includes(res.status)) { const detail=(await res.text()).slice(0,260); errors.push(model+" HTTP "+res.status+": "+detail); continue; }
      if (!res.ok) throw new Error("OpenRouter free-model request failed (HTTP "+res.status+"): "+(await res.text()).slice(0,300));
      const data = await res.json();
      const raw = data?.choices?.[0]?.message?.content;
      const text = typeof raw === "string" ? raw : Array.isArray(raw) ? raw.map((x:Record<string,unknown>)=>String(x.text||"")).join("\n") : "";
      if (!text.trim()) { errors.push(model+": empty response"); continue; }
      return {text:text.trim(),modelUsed:"openrouter/"+String(data?.model||model)};
    } catch (e) {
      const message=String((e as Error)?.message||e);
      errors.push(model+": "+message.slice(0,220));
      if (/HTTP 401|HTTP 403/.test(message)) throw new Error("OpenRouter rejected the API key or access (free-only route): "+message);
    }
  }
  throw new Error("The OpenRouter free-model router failed; no paid provider was tried. "+errors.join(" | "));
}

// Free-only provider routing: never call Gemini or Groq.
async function route(body: Record<string,unknown>, mode: string) {
  const hasImage = !!(body.imageUrl || body.answerImageUrl);
  return await callOpenRouter(body, mode, hasImage);
}

async function callOpenRouterRecheck(body: Record<string,unknown>, primaryResult: Record<string,unknown>) {
  const auditBody:Record<string,unknown> = {
    mode:"recheck",
    question:"Independently audit this first marker result. Treat it as a claim to check, not ground truth. First marker JSON: "+JSON.stringify(primaryResult)+". Recheck the attached answer against the official mark scheme and flag only concrete disagreements.",
    answerPdfUrl:body.answerPdfUrl,
    answerImageUrl:body.answerImageUrl,
    markSchemeUrl:body.markSchemeUrl,
    markSchemeMimeType:body.markSchemeMimeType
  };
  const hasImage=!!body.answerImageUrl;
  const response=await callOpenRouter(auditBody,"recheck",hasImage);
  try {
    const cleaned=response.text.trim().replace(/^\x60\x60\x60(?:json)?\s*/i,"").replace(/\s*\x60\x60\x60$/i,"");
    const a=cleaned.indexOf("{"),b=cleaned.lastIndexOf("}");
    const parsed=JSON.parse(a>=0&&b>a?cleaned.slice(a,b+1):cleaned);
    const status=["agree","disagree","unable_to_verify"].includes(String(parsed.status||"").toLowerCase())?String(parsed.status).toLowerCase():"unable_to_verify";
    return {status,model:response.modelUsed,summary:String(parsed.summary||"No summary provided.").slice(0,700),disagreements:Array.isArray(parsed.disagreements)?parsed.disagreements.slice(0,15).map((x:Record<string,unknown>)=>({point:String(x.point||"Unspecified point").slice(0,180),reason:String(x.reason||"").slice(0,450)})):[]};
  } catch {
    return {status:"unable_to_verify",model:response.modelUsed,summary:"The free second reviewer returned a response that could not be parsed safely.",disagreements:[]};
  }
}

// ── Parse mark JSON ───────────────────────────────────────────────────────────
function parseMark(text: string) {
  try {
    const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    let parsed: Record<string,unknown>;
    try { parsed = JSON.parse(cleaned); } catch { const a = cleaned.indexOf("{"), b = cleaned.lastIndexOf("}"); if (a < 0 || b <= a) return null; parsed = JSON.parse(cleaned.slice(a, b + 1)); }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
    const num = (v: unknown): number => { if (typeof v === "number") return v; const m = String(v || "").match(/-?\d+(?:\.\d+)?/); return m ? Number(m[0]) : NaN; };
    const pick = (...keys: string[]) => { for (const k of keys) if (parsed[k] != null && parsed[k] !== "") return parsed[k]; return undefined; };
    const ma = num(pick("marks_awarded", "marksAwarded", "awarded_marks", "score"));
    const mt = num(pick("marks_total", "marksTotal", "total_marks", "max_marks", "out_of"));
    if (!Number.isFinite(ma) || !Number.isFinite(mt) || mt <= 0 || ma < 0 || ma > mt) return null;
    const fb = Array.isArray(parsed.feedback) ? parsed.feedback.map((x: Record<string,unknown>) => ({ point: String(x?.point ?? x?.criterion ?? ""), awarded: x?.awarded === true || x?.awarded === 1 || String(x?.awarded).toLowerCase() === "true", explanation: String(x?.explanation ?? x?.reason ?? "") })) : [];
    return { marks_awarded: ma, marks_total: mt, percentage: Math.round(ma / mt * 1000) / 10, grade: String(pick("grade", "level") ?? ""), feedback: fb };
  } catch { return null; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors() });
  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) return json({ error: "supabase_config_missing" }, 500);
    const auth = req.headers.get("Authorization");
    if (!auth?.startsWith("Bearer ")) return json({ error: "unauthorized" }, 401);
    const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
    const userClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { global: { headers: { Authorization: auth } } });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "unauthorized" }, 401);
    const body = await req.json() as Record<string,unknown>;
    if (body.mode === "mark" && !body.markSchemeUrl && !body.answerPdfUrl) return json({ error: "mark_scheme_required" }, 400);
    const tk = body.mode !== "mark" ? await getTeacherKnowledge(admin, String(body.question || "")) : "";
    if (tk && body.question) body.question = String(body.question) + tk;
    try {
      const { text, modelUsed } = await route(body, String(body.mode || "tutor"));
      log(admin, modelUsed, String(body.modality || "text"), "ok");
      if (body.mode === "mark") {
        const parsed = parseMark(text);
        if (!parsed) return json({ error: "invalid_marker_response", rawPreview: text.slice(0, 600), modelUsed }, 502);
        await admin.from("paper_checks").insert({ student_id: user.id, marks_awarded: parsed.marks_awarded, marks_total: parsed.marks_total, percentage: parsed.percentage, grade: parsed.grade || null, feedback: parsed.feedback, model_used: modelUsed, mark_scheme_url: String(body.markSchemeUrl || "") }).catch(() => {});
        let secondReview:Record<string,unknown> = {status:"unavailable",model:"openrouter/free",summary:"Second review unavailable.",disagreements:[]};
        try { secondReview = await callOpenRouterRecheck(body, parsed as unknown as Record<string,unknown>); log(admin, String(secondReview.model || "openrouter/free"), "mark_recheck", String(secondReview.status || "error")); }
        catch (reviewError) { secondReview = {status:"unavailable",model:"openrouter/free",summary:String((reviewError as Error)?.message || reviewError).slice(0,700),disagreements:[]}; log(admin,"openrouter/free","mark_recheck","error"); }
        return json({ result: parsed, modelUsed, teacherSources: false, secondReview });
      }
      return json({ answer: text, modelUsed, teacherSources: !!tk });
    } catch (e) {
      log(admin, "all", String(body.modality || "text"), "error");
      return json({ error: "Could not answer yet", detail: String((e as Error)?.message || e) }, 502);
    }
  } catch (e) { return json({ error: String((e as Error)?.message || "unexpected_error") }, 500); }
});
