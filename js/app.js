import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {SUPABASE_URL,SUPABASE_KEY,GUEST} from './config.js';

const sb=createClient(SUPABASE_URL,SUPABASE_KEY);
const app=document.querySelector('#app');
const topics=[
['Forces and motion','Motion, forces, momentum and pressure'],['Energy','Energy stores, transfers, work, power and efficiency'],['Thermal physics','Particle model, temperature, heating and cooling'],['Waves','Wave properties, sound, light and electromagnetic waves'],['Electricity','Circuits, current, voltage, resistance and electrical power'],['Magnetism','Magnetic fields, motors, generators and transformers'],['Radioactivity','Atomic structure, radiation, decay and safety'],['Space physics','Earth, satellites, stars and the wider universe']
];
let state={page:'home',topic:0,question:0,answer:'',result:null};

function header(){return '<header class="topbar"><button class="brand" style="border:0;background:none;padding:0" data-page="home">Physics<span>IQ</span></button><div class="header-right"><div class="model-chip"><span class="model-dot"></span><span>PhysicsIQ AI</span><small>IGCSE Physics</small></div><div class="status"><i class="dot"></i> Workspace</div></div></header>'}
function shell(content){app.innerHTML='<div class="shell">'+header()+content+'</div>';bind()}
function home(){shell('<main class="wrap"><section class="hero"><div class="eyebrow">IGCSE Physics workspace</div><h1>Choose what you want to do.</h1><p>No clutter. Pick a Physics task and go straight into the work.</p></section><section class="choices"><button class="choice" data-page="topic"><span class="num">01</span><div class="icon">◈</div><h2>Full Classified Topic Checker</h2><p>Choose a topic and subtopic, practise questions, get AI checking and build topic progress.</p><span class="arrow">Open topic checker →</span></button><button class="choice" data-page="syllabus"><span class="num">02</span><div class="icon">⌁</div><h2>Syllabus Questions</h2><p>Ask questions by board, specification and topic, with syllabus-focused answers.</p><span class="arrow">Open syllabus questions →</span></button><button class="choice" data-page="papers"><span class="num">03</span><div class="icon">▤</div><h2>Full Past Papers Checker</h2><p>Work through complete papers and check answers against the official mark scheme.</p><span class="arrow">Open past papers →</span></button></section><div class="footer-note">Login and teacher tools can be added later without changing these three workspaces.</div></main>')}
function top(title,sub){return '<main class="wrap"><div class="pagehead"><div><div class="eyebrow">PhysicsIQ</div><h1>'+title+'</h1><p class="hero p">'+sub+'</p></div><button class="back" data-page="home">← Dashboard</button></div>'}
function topicPage(){shell(top('Full Classified Topic Checker','Pick a syllabus route, then work topic by topic.')+'<div class="panel"><div class="filters"><div class="field"><label>Exam board</label><select><option>Cambridge IGCSE Physics</option><option>Edexcel International GCSE Physics</option></select></div><div class="field"><label>Specification</label><select><option>Current specification</option><option>My saved specification</option></select></div><div class="field"><label>Mode</label><select><option>Practice + AI checking</option><option>Review progress</option></select></div></div><div class="topic-grid">'+topics.map((t,i)=>'<button class="topic '+(i===state.topic?'active':'')+'" data-topic="'+i+'"><strong>'+t[0]+'</strong><small>'+t[1]+'</small></button>').join('')+'</div></div><div class="workspace" style="margin-top:18px"><aside class="panel side"><h3>Selected topic</h3><p><strong>'+topics[state.topic][0]+'</strong></p><p style="color:var(--muted);font-size:13px">'+topics[state.topic][1]+'</p><div class="notice">Progress<br><strong>0%</strong> · ready to start</div></aside><section class="panel"><div class="eyebrow">Question 1</div><div class="question">A car increases its velocity from 8 m/s to 20 m/s in 4 seconds. Calculate its acceleration.</div><div class="field" style="margin-top:18px"><label>Your answer</label><textarea id="topicAnswer" class="answer" placeholder="Show your working and include units...">'+state.answer+'</textarea></div><div class="actions"><button class="primary" id="checkTopic">Check with AI</button><button class="secondary" id="clearAnswer">Clear</button></div><div id="topicResult" class="result">'+(state.result||'')+'</div></section></div></main>')}
function syllabusPage(){shell(top('Syllabus Questions','Choose the academic boundary first, then ask your question.')+'<div class="panel"><div class="filters"><div class="field"><label>Board</label><select id="board"><option>Cambridge</option><option>Edexcel</option></select></div><div class="field"><label>Specification</label><select id="spec"><option>IGCSE Physics</option></select></div><div class="field"><label>Topic</label><select id="syTopic">'+topics.map(t=>'<option>'+t[0]+'</option>').join('')+'</select></div></div><div class="field" style="margin-top:18px"><label>Your syllabus question</label><textarea id="syQuestion" class="answer" placeholder="Ask a Physics question..."></textarea></div><div class="actions"><button class="primary" id="askSyllabus">Ask PhysicsIQ</button></div><div class="notice">The syllabus is the boundary. Teacher resources can be connected later and used as additional context without replacing the specification.</div><div id="syResult" class="result"></div></div></main>')}
function papersPage(){shell(top('Full Past Papers Checker','Select a paper, answer each question, then use the official mark scheme for marking.')+'<div class="panel"><div class="filters"><div class="field"><label>Board</label><select><option>Cambridge</option><option>Edexcel</option></select></div><div class="field"><label>Session</label><select><option>Choose session</option><option>May/June</option><option>Oct/Nov</option><option>March</option></select></div><div class="field"><label>Paper</label><select><option>Choose paper</option><option>Paper 2</option><option>Paper 4</option></select></div></div><div class="empty" style="margin-top:18px"><strong>Past-paper library connection</strong><br>Paper files and official mark schemes will appear here when they are imported into the PhysicsIQ materials library.</div></div></main>')}
async function ensureGuest(){if(!GUEST)return;const {data}=await sb.auth.getSession();if(!data.session){const {error}=await sb.auth.signInAnonymously();if(error)console.warn(error.message)}}
async function ai(question){const {data,error}=await sb.functions.invoke('ai-route',{body:{mode:'text',question}});if(error)throw new Error(error.message||'AI service unavailable');if(data?.error)throw new Error(data.error);return data}
function bind(){
document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;render()});
document.querySelectorAll('[data-topic]').forEach(b=>b.onclick=()=>{state.topic=+b.dataset.topic;state.result=null;render()});
const ca=document.querySelector('#clearAnswer');if(ca)ca.onclick=()=>{state.answer='';state.result=null;render()};
const ct=document.querySelector('#checkTopic');if(ct)ct.onclick=async()=>{const a=document.querySelector('#topicAnswer').value.trim();if(!a)return;ct.disabled=true;ct.textContent='Checking…';try{const r=await ai('IGCSE Physics topic: '+topics[state.topic][0]+'\nQuestion: A car increases its velocity from 8 m/s to 20 m/s in 4 seconds. Calculate its acceleration.\nStudent answer: '+a+'\nCheck the working, units and final answer. Give concise student-friendly feedback.');state.result='<div class="ai-result-head"><span class="ai-avatar">IQ</span><div><strong>PhysicsIQ AI</strong><small>Marking feedback</small></div></div><div class="ai-answer">'+renderAI(r.answer||r.result||JSON.stringify(r))+'</div>';state.answer=a}catch(e){state.result='<strong>Could not check yet</strong><p>'+escape(e.message)+'</p>'}render()};
const as=document.querySelector('#askSyllabus');if(as)as.onclick=async()=>{const q=document.querySelector('#syQuestion').value.trim();if(!q)return;as.disabled=true;as.textContent='Thinking…';const out=document.querySelector('#syResult');try{const r=await ai('Answer as an IGCSE Physics tutor. Board: '+document.querySelector('#board').value+'. Specification: '+document.querySelector('#spec').value+'. Topic: '+document.querySelector('#syTopic').value+'. Academic boundary is the syllabus. Question: '+q);out.innerHTML='<div class="ai-result-head"><span class="ai-avatar">IQ</span><div><strong>PhysicsIQ AI</strong><small>IGCSE Physics tutor</small></div></div><div class="ai-answer">'+renderAI(r.answer||r.result||JSON.stringify(r))+'</div>'}catch(e){out.innerHTML='<strong>Could not answer yet</strong><p>'+escape(e.message)+'</p>'}as.disabled=false;as.textContent='Ask PhysicsIQ'};
}
function escape(v){return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('\n','<br>')}
function renderAI(value){
  const source=String(value??'').trim();
  if(!source)return '';
  const math=[];
  function stash(tex,display){
    const id='@@MATH_'+math.length+'@@';
    math.push({tex:tex.trim(),display:display});
    return id;
  }
  function extract(text,open,close,display){
    let out='',i=0;
    while(i<text.length){
      const s=text.indexOf(open,i);
      if(s<0){out+=text.slice(i);break;}
      out+=text.slice(i,s);
      const e=text.indexOf(close,s+open.length);
      if(e<0){out+=text.slice(s);break;}
      out+=stash(text.slice(s+open.length,e),display);
      i=e+close.length;
    }
    return out;
  }
  let text=source;
  text=extract(text,'\\[','\\]',true);
  text=extract(text,'$$','$$',true);
  text=extract(text,'\\(','\\)',false);
  text=extract(text,'$','$',false);
  let html=marked.parse(text,{breaks:true});
  html=html.replace(/@@MATH_(\d+)@@/g,function(_,n){
    const m=math[Number(n)];
    try{return katex.renderToString(m.tex,{displayMode:m.display,throwOnError:false})}
    catch(e){return '<code>'+escape(m.tex)+'</code>'}
  });
  return DOMPurify.sanitize(html,{USE_PROFILES:{html:true}});
}

function render(){if(state.page==='home')home();if(state.page==='topic')topicPage();if(state.page==='syllabus')syllabusPage();if(state.page==='papers')papersPage()}
ensureGuest().finally(render);
