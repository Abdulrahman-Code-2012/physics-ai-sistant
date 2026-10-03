import {sb} from './app.js';
const $=s=>document.querySelector(s);
const esc=t=>String(t??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
let uid=null,cid=null;
sb.auth.onAuthStateChange((_e,s)=>{uid=s?.user?.id||null;if(!uid)cid=null;loadChats();loadMarks()});
addEventListener('hashchange',()=>{if(location.hash==='#marks')loadMarks()});

document.addEventListener('turn',async e=>{if(!uid)return;try{if(!cid){const{data}=await sb.from('conversations').insert({student_id:uid,section:'unit',title:(e.detail.q||'Attachment question').slice(0,60)}).select('id').single();cid=data.id}await sb.from('messages').insert([{conversation_id:cid,role:'user',content:e.detail.q||'(attachment)'},{conversation_id:cid,role:'assistant',content:e.detail.a,model_used:e.detail.model}]);loadChats()}catch{}});

function chat(role,text){const d=document.createElement('div');d.className='b '+(role==='user'?'user':'bot');d.innerHTML=`<small>${role==='user'?'You':'Tutor'}</small>`;const p=document.createElement('p');p.textContent=text;d.append(p);return d}

async function loadChats(){const box=$('#chats');if(!box)return;box.innerHTML='';if(!uid)return;const n=document.createElement('button');n.className='chip';n.textContent='＋ New chat';n.onclick=()=>{cid=null;$('#thread').innerHTML=`<p class='empty'>New chat started. Ask anything.</p>`;document.dispatchEvent(new CustomEvent('loadchat',{detail:[]}))};box.append(n);try{const{data}=await sb.from('conversations').select('id,title').eq('student_id',uid).order('created_at',{ascending:false}).limit(8);(data||[]).forEach(c=>{const b=document.createElement('button');b.className='chip';b.textContent=c.title||'Chat';b.onclick=()=>openChat(c.id);box.append(b)})}catch{}}

async function openChat(id){const{data}=await sb.from('messages').select('role,content').eq('conversation_id',id).order('created_at');cid=id;const t=$('#thread');t.innerHTML='';(data||[]).forEach(m=>t.append(chat(m.role,m.content)));document.dispatchEvent(new CustomEvent('loadchat',{detail:(data||[]).map(m=>({role:m.role,content:m.content}))}))}

async function loadMarks(){const box=$('#marksList');if(!box)return;if(!uid){box.innerHTML=`<p class='empty'>Sign in to see your marked work.</p>`;return}const{data}=await sb.from('paper_checks').select('marks_awarded,marks_total,percentage,grade,feedback,created_at').eq('student_id',uid).order('created_at',{ascending:false}).limit(30);if(!data?.length){box.innerHTML=`<p class='empty'>Nothing marked yet. Try Mark my work.</p>`;return}const avg=Math.round(data.reduce((a,r)=>a+(r.percentage||0),0)/data.length);box.innerHTML=`<p class='sub'>Average ${avg}% across ${data.length} marked answers</p>`+data.map(r=>`<details class='card hist'><summary><strong>${esc(r.marks_awarded)} / ${esc(r.marks_total)}</strong><span>Grade ${esc(r.grade)}</span><em>${new Date(r.created_at).toLocaleDateString()}</em></summary>${(r.feedback||[]).map(f=>`<div class='fb ${f.awarded?'y':'n'}'><b>${f.awarded?'✓':'✗'}</b><div><p>${esc(f.point)}</p><small>${esc(f.explanation)}</small></div></div>`).join('')}</details>`).join('')}
