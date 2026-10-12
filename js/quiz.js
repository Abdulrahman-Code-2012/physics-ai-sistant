const QUIZ_TOPICS = [
  ['all','All topics'],['forces','Forces and motion'],['energy','Energy'],['thermal','Thermal physics'],['waves','Waves'],['electricity','Electricity'],['magnetism','Magnetism'],['radioactivity','Radioactivity'],['space','Space physics']
];

const QUESTION_BANK = [
 {id:'f1',topic:'forces',paper:'2',type:'mcq',q:'A cyclist travels 180 m in 12 s. What is the average speed?',o:['12 m/s','15 m/s','18 m/s','21 m/s'],a:1},
 {id:'f2',topic:'forces',paper:'4',type:'number',q:'A resultant force of 12 N acts on a 3.0 kg object. Calculate its acceleration. Give your answer in m/s².',a:4,t:0.01},
 {id:'f3',topic:'forces',paper:'4',type:'number',q:'A 0.50 kg ball moves at 6.0 m/s. Calculate its momentum. Give your answer in kg m/s.',a:3,t:0.01},
 {id:'e1',topic:'energy',paper:'2',type:'mcq',q:'Which quantity is measured in joules?',o:['Power','Energy','Force per unit area','Current'],a:1},
 {id:'e2',topic:'energy',paper:'4',type:'number',q:'A 2.0 kg object is raised vertically through 5.0 m. Take g = 10 N/kg. Calculate the increase in gravitational potential energy.',a:100,t:0.01},
 {id:'e3',topic:'energy',paper:'4',type:'number',q:'A device transfers 600 J of energy in 20 s. Calculate its power.',a:30,t:0.01},
 {id:'t1',topic:'thermal',paper:'2',type:'mcq',q:'Which statement best describes specific heat capacity?',o:['Energy needed to melt 1 kg','Energy needed to raise 1 kg by 1 °C','Energy transferred per second','Temperature at which a substance boils'],a:1},
 {id:'t2',topic:'thermal',paper:'4',type:'number',q:'Calculate the energy needed to heat 0.50 kg of water by 20 °C. Use c = 4200 J/(kg °C).',a:42000,t:1},
 {id:'t3',topic:'thermal',paper:'4',type:'number',q:'A heater transfers 3000 J to an object whose temperature rises by 15 °C. Calculate the thermal capacity of the object in J/°C.',a:200,t:0.01},
 {id:'w1',topic:'waves',paper:'2',type:'mcq',q:'A wave makes 50 complete oscillations in 2.0 s. What is its frequency?',o:['10 Hz','25 Hz','50 Hz','100 Hz'],a:1},
 {id:'w2',topic:'waves',paper:'4',type:'number',q:'A wave has frequency 50 Hz and wavelength 0.80 m. Calculate its speed.',a:40,t:0.01},
 {id:'w3',topic:'waves',paper:'4',type:'number',q:'A medium has refractive index 1.50. Calculate the sine of the critical angle using sin(c) = 1/n. Give 2 decimal places.',a:0.67,t:0.01},
 {id:'el1',topic:'electricity',paper:'2',type:'mcq',q:'In a series circuit, which quantity is the same at every point?',o:['Voltage','Current','Resistance','Electrical power'],a:1},
 {id:'el2',topic:'electricity',paper:'4',type:'number',q:'A 6.0 V supply is connected across a 3.0 Ω resistor. Calculate the current.',a:2,t:0.01},
 {id:'el3',topic:'electricity',paper:'4',type:'number',q:'A device operates at 12 V and draws 2.0 A. Calculate its electrical power.',a:24,t:0.01},
 {id:'m1',topic:'magnetism',paper:'2',type:'mcq',q:'A transformer has more turns on its secondary coil than its primary coil. What type is it?',o:['Step-down','Step-up','Isolation only','DC transformer'],a:1},
 {id:'m2',topic:'magnetism',paper:'4',type:'number',q:'A transformer has 500 turns on the primary and 100 turns on the secondary. The primary voltage is 250 V. Calculate the secondary voltage.',a:50,t:0.01},
 {id:'m3',topic:'magnetism',paper:'4',type:'number',q:'A wire of length 0.30 m carries 2.0 A at right angles to a magnetic field of 0.40 T. Calculate the magnetic force on the wire.',a:0.24,t:0.001},
 {id:'r1',topic:'radioactivity',paper:'2',type:'mcq',q:'Which change occurs when an alpha particle is emitted from a nucleus?',o:['Mass number decreases by 4','Mass number increases by 4','Atomic number increases by 2','Atomic number decreases by 1'],a:0},
 {id:'r2',topic:'radioactivity',paper:'4',type:'number',q:'A radioactive sample has an initial count rate of 160 counts/min and a half-life of 8 h. What is the count rate after 24 h, ignoring background radiation?',a:20,t:0.01},
 {id:'r3',topic:'radioactivity',paper:'4',type:'number',q:'A detector measures 140 counts/min from a source and the background count is 20 counts/min. Calculate the corrected count rate.',a:120,t:0.01},
 {id:'s1',topic:'space',paper:'2',type:'mcq',q:'What does a redshift observed from a distant galaxy provide evidence for?',o:['The galaxy is approaching Earth','The galaxy is moving away from Earth','The galaxy has no motion','The galaxy is inside the Solar System'],a:1},
 {id:'s2',topic:'space',paper:'4',type:'number',q:'Use v = H₀d. If H₀ = 70 km/s/Mpc and a galaxy is 3.0 Mpc away, calculate its recession speed in km/s.',a:210,t:0.01},
 {id:'s3',topic:'space',paper:'4',type:'number',q:'A star emits light with wavelength 600 nm. Its observed wavelength is 630 nm. Calculate the percentage increase in wavelength.',a:5,t:0.01}
];

let quizState={questions:[],index:0,score:0,answers:[],paper:'mix',topic:'all',count:10};

function quizPage(){
  const topicOptions=QUIZ_TOPICS.map(([v,l])=>`<option value="${v}">${l}</option>`).join('');
  return `<main class="wrap quiz-page"><div class="pagehead"><div><div class="eyebrow">Physics AI-sistant</div><h1>Quiz Maker</h1><p class="hero p">Build a Cambridge IGCSE Physics-style quiz by paper and topic.</p></div><button class="back" data-page="home">← Dashboard</button></div>
  <section id="quizSetup" class="quiz-setup panel"><div class="quiz-intro"><span class="quiz-badge">NEW</span><h2>Make your quiz</h2><p>Choose Paper 2, Paper 4, or mix both. Then focus on one topic or the whole syllabus.</p></div>
  <div class="quiz-controls"><label><span>Paper</span><select id="quizPaper"><option value="2">Paper 2 · Multiple choice</option><option value="4">Paper 4 · Structured style</option><option value="mix" selected>Mix Paper 2 + Paper 4</option></select></label><label><span>Topic</span><select id="quizTopic">${topicOptions}</select></label><label><span>Questions</span><select id="quizCount"><option>5</option><option selected>10</option><option>15</option><option>20</option></select></label></div>
  <button class="primary quiz-start" id="startQuiz">Start quiz →</button></section><section id="quizRun" class="quiz-run hidden"></section></main>`;
}

function quizShuffle(a){return [...a].sort(()=>Math.random()-0.5)}
function quizEscape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function quizFormatNumber(n){return Number.isInteger(n)?String(n):String(Number(n.toFixed(2)))}
function quizRenderQuestion(){
  const q=quizState.questions[quizState.index];
  const pct=Math.round((quizState.index/quizState.questions.length)*100);
  const options=q.type==='mcq'?q.o.map((x,i)=>`<button class="quiz-option" data-answer="${i}"><span>${String.fromCharCode(65+i)}</span><b>${quizEscape(x)}</b></button>`).join(''):`<div class="quiz-number-answer"><input id="quizNumberInput" type="number" step="any" inputmode="decimal" placeholder="Enter your answer"><span>${q.q.includes('m/s²')?'m/s²':q.q.includes('kg m/s')?'kg m/s':q.q.includes('J/°C')?'J/°C':q.q.includes('J.')||q.q.includes('energy')?'J':q.q.includes('power')?'W':q.q.includes('current')?'A':q.q.includes('voltage')?'V':q.q.includes('force')?'N':' '}</span></div><button class="primary quiz-submit-number" id="submitNumber">Check answer</button>`;
  document.querySelector('#quizRun').innerHTML=`<div class="quiz-top"><div><span class="quiz-kicker">${q.paper==='2'?'PAPER 2':'PAPER 4'} · ${quizEscape(QUIZ_TOPICS.find(x=>x[0]===q.topic)?.[1]||'Physics')}</span><h2>Question ${quizState.index+1} of ${quizState.questions.length}</h2></div><div class="quiz-score">${quizState.score} correct</div></div><div class="quiz-progress"><i style="width:${pct}%"></i></div><article class="quiz-card"><h3>${quizEscape(q.q)}</h3><div class="quiz-answer-area">${options}</div><div id="quizFeedback" class="quiz-feedback hidden"></div></article>`;
  bindQuizQuestion(q);
}
function bindQuizQuestion(q){
  if(q.type==='mcq')document.querySelectorAll('.quiz-option').forEach(b=>b.onclick=()=>quizAnswer(Number(b.dataset.answer),b));
  else document.querySelector('#submitNumber').onclick=()=>{const v=Number(document.querySelector('#quizNumberInput').value);if(!Number.isFinite(v))return;quizAnswer(v,document.querySelector('#submitNumber'))};
}
function quizAnswer(value,button){
  const q=quizState.questions[quizState.index];let correct=false;
  if(q.type==='mcq')correct=value===q.a;else correct=Math.abs(value-q.a)<=Math.max(q.t||0.01,Math.abs(q.a)*0.005);
  if(correct)quizState.score++;
  quizState.answers.push({id:q.id,correct});
  document.querySelectorAll('.quiz-option').forEach(b=>{b.disabled=true;if(q.type==='mcq'){const n=Number(b.dataset.answer);if(n===q.a)b.classList.add('correct');if(n===value&&!correct)b.classList.add('wrong')}});
  if(button)button.disabled=true;
  const f=document.querySelector('#quizFeedback');f.classList.remove('hidden');f.innerHTML=`<strong>${correct?'Correct!':'Not quite.'}</strong> ${correct?'Nice work.':'The correct answer is '+quizEscape(q.type==='mcq'?q.o[q.a]:quizFormatNumber(q.a))+'.'}`+`<button class="secondary quiz-next">${quizState.index+1===quizState.questions.length?'See result':'Next question →'}</button>`;
  f.querySelector('.quiz-next').onclick=()=>{if(quizState.index+1===quizState.questions.length)quizFinish();else{quizState.index++;quizRenderQuestion()}};
}
function quizFinish(){
  const total=quizState.questions.length,pct=Math.round(quizState.score/total*100);
  document.querySelector('#quizRun').innerHTML=`<section class="quiz-result"><div class="quiz-result-icon">✓</div><div class="eyebrow">QUIZ COMPLETE</div><h2>${quizState.score} / ${total}</h2><p>${pct}% correct</p><div class="quiz-result-actions"><button class="primary" id="retryQuiz">Try another quiz</button><button class="secondary" id="changeQuiz">Change settings</button></div></section>`;
  document.querySelector('#retryQuiz').onclick=()=>startQuiz();document.querySelector('#changeQuiz').onclick=()=>{document.querySelector('#quizRun').classList.add('hidden');document.querySelector('#quizSetup').classList.remove('hidden')};
}
function startQuiz(){
  const paper=document.querySelector('#quizPaper').value,topic=document.querySelector('#quizTopic').value,count=Number(document.querySelector('#quizCount').value);
  let pool=QUESTION_BANK.filter(q=>(paper==='mix'||q.paper===paper)&&(topic==='all'||q.topic===topic));
  pool=quizShuffle(pool);if(pool.length<count){const extra=quizShuffle(QUESTION_BANK.filter(q=>(paper==='mix'||q.paper===paper))).filter(q=>!pool.some(x=>x.id===q.id));pool=pool.concat(extra)}
  quizState={questions:pool.slice(0,Math.min(count,pool.length)),index:0,score:0,answers:[],paper,topic,count};
  document.querySelector('#quizSetup').classList.add('hidden');document.querySelector('#quizRun').classList.remove('hidden');quizRenderQuestion();
}

export function initQuiz(){
  const start=document.querySelector('#startQuiz');if(start)start.onclick=startQuiz;
}
export { quizPage };
