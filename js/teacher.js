import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
const sb=createClient(SUPABASE_URL,SUPABASE_KEY),root=document.querySelector('#teacherApp'),$=s=>document.querySelector(s);
const TOPICS=['Motion','Forces and Newton laws','Work, energy and power','Pressure','Thermal physics','Waves, light and sound','Electricity','Magnetism and electromagnetism','Atomic and nuclear physics','Space physics'];
const DROP='＋ Choose a PDF, PowerPoint, Word or text file';
let user,profile;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const say=(el,t,bad)=>{el.textContent=t;el.className='teacher-message'+(bad?' error':'')};

// Turn an uploaded file into plain text the AI can read.
async function extractText(f){
  const n=f.name.toLowerCase();
  if(/\.(txt|md)$/.test(n))return f.text();
  if(n.endsWith('.pdf')){
    const mod=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/+esm'),lib=mod.default||mod;
    lib.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    const doc=await lib.getDocument({data:new Uint8Array(await f.arrayBuffer())}).promise;let out='';
    for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i);out+=(await pg.getTextContent()).items.map(x=>x.str).join(' ')+'\n'}
    return out;
  }
  const{default:JSZip}=await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm'),z=await JSZip.loadAsync(f),num=k=>parseInt(k.match(/\d+/g).pop());
  const names=n.endsWith('.pptx')?Object.keys(z.files).filter(k=>/^ppt\/slides\/slide\d+\.xml$/.test(k)).sort((a,b)=>num(a)-num(b)):['word/document.xml'];
  let out='';
  for(const k of names){const x=await z.file(k).async('string');out+=x.replace(/<\/a:p>|<\/w:p>/g,'\n').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>')+'\n'}
  return out;
}

function render(){
  root.innerHTML=`<div class="teacher-shell">
<header class="teacher-top"><div><div class="eyebrow">PhysicsIQ</div><h1>Teacher Portal</h1><div class="muted">${esc(profile.full_name||user.email)}</div></div><button id="logout" class="ghost-btn">Sign out</button></header>
<section class="teacher-card"><h2>Add to the AI knowledge base</h2><p class="muted">The AI uses everything you add here to answer students. Upload notes, slides or a PDF, or paste text. For a YouTube video, add the link and paste its transcript, because the AI learns from text and cannot watch videos.</p>
<form id="kbForm" class="teacher-form">
<div class="row2"><label>Title<input class="portal-input" name="title" required placeholder="e.g. Newton's laws summary"></label><label>Topic<select class="portal-input" name="unit">${TOPICS.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label></div>
<label class="drop"><input type="file" id="kbFile" accept=".pdf,.pptx,.docx,.txt,.md" hidden><span id="dropLbl">${DROP}</span></label>
<label>YouTube link (optional)<input class="portal-input" name="yt" placeholder="https://youtu.be/..."></label>
<label>Notes, or the video transcript<textarea class="portal-input" name="text" rows="5" placeholder="Paste text here"></textarea></label>
<button class="primary-btn" type="submit">Add to knowledge base</button><div id="kbMsg" class="teacher-message"></div></form></section>
<section class="teacher-card"><h2>Your knowledge base <span class="muted" id="kbCount"></span></h2><div id="kbList"></div></section></div>`;
  $('#logout').onclick=async()=>{await sb.auth.signOut();location.href='login.html'};
  $('#kbFile').onchange=e=>{$('#dropLbl').textContent=e.target.files[0]?'✓ '+e.target.files[0].name:DROP};
  $('#kbForm').onsubmit=async e=>{
    e.preventDefault();
    const f=e.currentTarget,fd=new FormData(f),file=$('#kbFile').files[0],yt=(fd.get('yt')||'').trim(),txt=(fd.get('text')||'').trim(),m=$('#kbMsg'),btn=f.querySelector('button');
    if(!file&&!txt)return say(m,'Add a file, or paste some notes or a transcript.',1);
    if(yt&&!/^https?:\/\//.test(yt))return say(m,'The video link must start with https://',1);
    btn.disabled=true;say(m,'Reading and adding...');
    try{
      const body=((file?await extractText(file):'')+'\n'+txt).trim();
      if(!body)throw new Error('No readable text found in that file. A scanned PDF has no text, so type or paste it instead.');
      const{error}=await sb.from('materials').insert({teacher_id:user.id,title:fd.get('title').trim(),type:'unit',unit_name:fd.get('unit'),file_name:file?.name||null,file_size:file?.size||null,file_url:yt||null,description:yt?'video':'notes',content_text:body.slice(0,80000)});
      if(error)throw error;
      f.reset();$('#dropLbl').textContent=DROP;say(m,'Added. The AI can now use this when answering students.');refresh();
    }catch(x){say(m,x.message,1)}
    btn.disabled=false;
  };
  refresh();
}

async function refresh(){
  const{data,error}=await sb.from('materials').select('id,title,unit_name,file_name,file_url,created_at').eq('teacher_id',user.id).order('created_at',{ascending:false});
  if(error){$('#kbList').textContent=error.message;return}
  $('#kbCount').textContent='· '+data.length;
  $('#kbList').innerHTML=data.length?data.map(r=>`<div class="mat"><div><b>${esc(r.title)}</b><div class="muted">${esc(r.unit_name||'')}${r.file_name?' · '+esc(r.file_name):''}${r.file_url?' · <a href="'+esc(r.file_url)+'" target="_blank" rel="noopener">video</a>':''}</div></div><button class="ghost-btn" data-id="${esc(r.id)}">Delete</button></div>`).join(''):'<p class="muted">Nothing added yet. Add your first material above.</p>';
  $('#kbList').querySelectorAll('button').forEach(b=>b.onclick=async()=>{if(!confirm('Delete this material from the knowledge base?'))return;await sb.from('materials').delete().eq('id',b.dataset.id);refresh()});
}

async function start(){
  const{data:{session}}=await sb.auth.getSession();
  if(!session?.user||session.user.is_anonymous){location.href='login.html';return}
  user=session.user;
  const{data,error}=await sb.from('profiles').select('role,full_name,email').eq('id',user.id).maybeSingle();
  if(error||!data||data.role!=='teacher'){await sb.auth.signOut();location.href='login.html';return}
  profile=data;render();
}
start();
