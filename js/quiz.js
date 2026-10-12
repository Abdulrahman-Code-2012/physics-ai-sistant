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

const QUIZ_EXPLANATIONS={
 f1:'Average speed = total distance ÷ total time = 180 ÷ 12 = 15 m/s.',f2:'Use F = ma. Rearrange to a = F ÷ m = 12 ÷ 3.0 = 4.0 m/s².',f3:'Momentum = mass × velocity = 0.50 × 6.0 = 3.0 kg m/s.',
 e1:'Energy is measured in joules (J). Power is measured in watts (W), and force in newtons (N).',e2:'Gravitational potential energy change = mgh = 2.0 × 10 × 5.0 = 100 J.',e3:'Power = energy transferred ÷ time = 600 ÷ 20 = 30 W.',
 t1:'Specific heat capacity is the energy needed to raise the temperature of 1 kg of a substance by 1 °C.',t2:'Use E = mcΔT = 0.50 × 4200 × 20 = 42 000 J.',t3:'Thermal capacity = energy transferred ÷ temperature rise = 3000 ÷ 15 = 200 J/°C.',
 w1:'Frequency = number of oscillations ÷ time = 50 ÷ 2.0 = 25 Hz.',w2:'Wave speed = frequency × wavelength = 50 × 0.80 = 40 m/s.',w3:'sin(c) = 1 ÷ n = 1 ÷ 1.50 = 0.666… ≈ 0.67.',
 el1:'In a series circuit, the current is the same at every point. The supply voltage is shared between components.',el2:'Using V = IR, current I = V ÷ R = 6.0 ÷ 3.0 = 2.0 A.',el3:'Electrical power P = VI = 12 × 2.0 = 24 W.',
 m1:'A step-up transformer has more turns on the secondary coil, so its secondary voltage is higher.',m2:'Vs ÷ Vp = Ns ÷ Np, so Vs = 250 × (100 ÷ 500) = 50 V.',m3:'For a wire at right angles to the field, F = BIL = 0.40 × 2.0 × 0.30 = 0.24 N.',
 r1:'Alpha emission releases 2 protons and 2 neutrons, so the mass number decreases by 4 and the atomic number by 2.',r2:'24 h is three half-lives: 160 → 80 → 40 → 20 counts/min.',r3:'Corrected count rate = measured count rate − background = 140 − 20 = 120 counts/min.',
 s1:'Redshift means the observed wavelength is longer, providing evidence that the galaxy is moving away from us.',s2:'Using v = H₀d = 70 × 3.0 = 210 km/s.',s3:'Percentage increase = (630 − 600) ÷ 600 × 100% = 5%.'
};
const QUIZ_MISTAKE_TYPES={f1:'Formula / substitution',f2:'Rearranging equations',f3:'Formula / substitution',e1:'Physics definitions',e2:'Formula / substitution',e3:'Formula / substitution',t1:'Physics definitions',t2:'Formula / substitution',t3:'Formula / substitution',w1:'Formula / substitution',w2:'Formula / substitution',w3:'Rounding / calculation',el1:'Circuit concepts',el2:'Rearranging equations',el3:'Formula / substitution',m1:'Physics definitions',m2:'Transformer ratio',m3:'Formula / substitution',r1:'Nuclear changes',r2:'Half-life',r3:'Data processing',s1:'Interpreting evidence',s2:'Formula / substitution',s3:'Percentage calculation'};
let quizState={questions:[],index:0,score:0,answers:[],paper:'mix',topic:'all',count:10,startedAt:null};

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
  quizState.answers.push({id:q.id,correct,value,expected:q.type==='mcq'?q.o[q.a]:q.a,question:q.q,topic:q.topic,paper:q.paper,type:QUIZ_MISTAKE_TYPES[q.id]||'Concept / calculation',explanation:QUIZ_EXPLANATIONS[q.id]||'Review the relevant Physics principle.'});
  document.querySelectorAll('.quiz-option').forEach(b=>{b.disabled=true;if(q.type==='mcq'){const n=Number(b.dataset.answer);if(n===q.a)b.classList.add('correct');if(n===value&&!correct)b.classList.add('wrong')}});
  if(button)button.disabled=true;
  const f=document.querySelector('#quizFeedback');f.classList.remove('hidden');f.innerHTML=`<strong>${correct?'Correct!':'Not quite.'}</strong> ${correct?'Nice work.':'The correct answer is '+quizEscape(q.type==='mcq'?q.o[q.a]:quizFormatNumber(q.a))+'.'}`+`<button class="secondary quiz-next">${quizState.index+1===quizState.questions.length?'See result':'Next question →'}</button>`;
  f.querySelector('.quiz-next').onclick=()=>{if(quizState.index+1===quizState.questions.length)quizFinish();else{quizState.index++;quizRenderQuestion()}};
}
function quizDownload(filename,content,type){const blob=new Blob([content],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
function quizCsvCell(value){return '"'+String(value??'').replace(/"/g,'""')+'"'}
function quizBuildReport(){
 const total=quizState.questions.length,pct=total?Math.round(quizState.score/total*100):0;
 const rows=quizState.questions.map((q,i)=>{const a=quizState.answers[i]||{};return {n:i+1,topic:QUIZ_TOPICS.find(x=>x[0]===q.topic)?.[1]||q.topic,paper:'Paper '+q.paper,question:q.q,your:a.value===undefined?'Not answered':(q.type==='mcq'?q.o[a.value]:quizFormatNumber(a.value)),correct:q.type==='mcq'?q.o[q.a]:quizFormatNumber(q.a),result:a.correct?'Correct':'Incorrect',mistake:a.correct?'—':(a.type||QUIZ_MISTAKE_TYPES[q.id]||'Concept / calculation'),explanation:QUIZ_EXPLANATIONS[q.id]||''}});
 const topicRows=QUIZ_TOPICS.filter(x=>x[0]!=='all').map(([id,label])=>{const rs=rows.filter(r=>quizState.questions[r.n-1]?.topic===id);const ok=rs.filter(r=>r.result==='Correct').length;return {id,label,total:rs.length,ok,pct:rs.length?Math.round(ok/rs.length*100):0,miss:rs.length-ok}}).filter(x=>x.total);
 const misses=rows.filter(r=>r.result==='Incorrect');const mistakeCounts={};misses.forEach(r=>mistakeCounts[r.mistake]=(mistakeCounts[r.mistake]||0)+1);
 return {total,pct,rows,topicRows,misses,mistakeCounts,startedAt:quizState.startedAt||new Date().toISOString(),paper:quizState.paper==='mix'?'Paper 2 + Paper 4':'Paper '+quizState.paper,topic:QUIZ_TOPICS.find(x=>x[0]===quizState.topic)?.[1]||'All topics',score:quizState.score};
}
function quizFinish(){
 const report=quizBuildReport();
 const graph=report.topicRows.map(t=>`<div class=\"report-bar-row\"><div class=\"report-bar-label\"><span>${quizEscape(t.label)}</span><b>${t.pct}% · ${t.ok}/${t.total}</b></div><div class=\"report-bar-track\"><i style=\"width:${t.pct}%\"></i></div></div>`).join('');
 const mistakeRows=Object.entries(report.mistakeCounts).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`<tr><td>${quizEscape(k)}</td><td>${v}</td></tr>`).join('')||'<tr><td colspan=\"2\">No mistakes this time — great work!</td></tr>';
 const sheet=report.rows.map(r=>`<tr><td>${r.n}</td><td>${quizEscape(r.topic)}</td><td>${r.paper}</td><td class=\"report-question\">${quizEscape(r.question)}</td><td>${quizEscape(r.your)}</td><td>${quizEscape(r.correct)}</td><td><span class=\"sheet-status ${r.result==='Correct'?'is-correct':'is-wrong'}\">${r.result}</span></td><td>${quizEscape(r.mistake)}</td></tr>`).join('');
 document.querySelector('#quizRun').innerHTML=`<section class=\"quiz-report\"><div class=\"report-heading\"><div><div class=\"eyebrow\">QUIZ REPORT</div><h2>Quiz performance</h2><p>${quizEscape(report.paper)} · ${quizEscape(report.topic)} · ${new Date(report.startedAt).toLocaleString()}</p></div><div class=\"report-grade\"><strong>${report.score}/${report.total}</strong><span>${report.pct}% correct</span></div></div><div class=\"report-kpis\"><div><span>Correct</span><strong>${report.score}</strong></div><div><span>Incorrect</span><strong>${report.misses.length}</strong></div><div><span>Mistakes to review</span><strong>${report.misses.length}</strong></div><div><span>Accuracy</span><strong>${report.pct}%</strong></div></div><div class=\"report-grid\"><section class=\"report-panel\"><h3>Topic performance graph</h3><p class=\"muted\">Accuracy for the topics tested in this quiz.</p>${graph||'<p>No topic data available.</p>'}</section><section class=\"report-panel\"><h3>Mistake counter</h3><p class=\"muted\">Counts are based on the questions answered incorrectly.</p><table class=\"report-table compact\"><thead><tr><th>Mistake type</th><th>Count</th></tr></thead><tbody>${mistakeRows}</tbody></table></section></div><section class=\"report-panel report-sheet-panel\"><div class=\"report-sheet-head\"><div><h3>Answer sheet</h3><p class=\"muted\">Spreadsheet-style review of every answer.</p></div><span class=\"sheet-hint\">CSV opens in Excel</span></div><div class=\"report-sheet-scroll\"><table class=\"report-table report-sheet\"><thead><tr><th>#</th><th>Topic</th><th>Paper</th><th>Question</th><th>Your answer</th><th>Correct answer</th><th>Result</th><th>Mistake type</th></tr></thead><tbody>${sheet}</tbody></table></div></section><section class=\"report-panel\"><h3>Explanations and corrections</h3><div class=\"report-explanations\">${report.rows.map(r=>`<article class=\"report-explanation ${r.result==='Correct'?'':'needs-review'}\"><div><b>Q${r.n}. ${quizEscape(r.result)}</b><span>${quizEscape(r.topic)} · ${quizEscape(r.paper)}</span></div><p>${quizEscape(r.question)}</p><p><b>Your answer:</b> ${quizEscape(r.your)} · <b>Correct answer:</b> ${quizEscape(r.correct)}</p><p><b>Explanation:</b> ${quizEscape(r.explanation)}</p>${r.result==='Incorrect'?`<p class=\"mistake-label\">Review: ${quizEscape(r.mistake)}</p>`:''}</article>`).join('')}</div></section><div class=\"report-actions\"><button class=\"primary\" id=\"exportQuizCsv\">Export Excel sheet (.csv)</button><button class=\"secondary\" id=\"exportQuizJson\">Export full report (.json)</button><button class=\"secondary\" id=\"printQuizReport\">Print / Save as PDF</button><button class=\"secondary\" id=\"retryQuiz\">Try another quiz</button><button class=\"secondary\" id=\"changeQuiz\">Change settings</button></div></section>`;
 document.querySelector('#exportQuizCsv').onclick=()=>{const headings=['Question #','Topic','Paper','Question','Your answer','Correct answer','Result','Mistake type','Explanation'];const csv=[headings,...report.rows.map(r=>[r.n,r.topic,r.paper,r.question,r.your,r.correct,r.result,r.mistake,QUIZ_EXPLANATIONS[quizState.questions[r.n-1].id]||''])].map(row=>row.map(quizCsvCell).join(',')).join('\r\n');quizDownload('physics-quiz-report.csv','\ufeff'+csv,'text/csv;charset=utf-8')};
 document.querySelector('#exportQuizJson').onclick=()=>quizDownload('physics-quiz-report.json',JSON.stringify({...report,rows:report.rows},null,2),'application/json');
 document.querySelector('#printQuizReport').onclick=()=>window.print();
 document.querySelector('#retryQuiz').onclick=()=>startQuiz();document.querySelector('#changeQuiz').onclick=()=>{document.querySelector('#quizRun').classList.add('hidden');document.querySelector('#quizSetup').classList.remove('hidden')};
}

function startQuiz(){
  const paper=document.querySelector('#quizPaper').value,topic=document.querySelector('#quizTopic').value,count=Number(document.querySelector('#quizCount').value);
  let pool=QUESTION_BANK.filter(q=>(paper==='mix'||q.paper===paper)&&(topic==='all'||q.topic===topic));
  pool=quizShuffle(pool);if(pool.length<count){const extra=quizShuffle(QUESTION_BANK.filter(q=>(paper==='mix'||q.paper===paper))).filter(q=>!pool.some(x=>x.id===q.id));pool=pool.concat(extra)}
  quizState={questions:pool.slice(0,Math.min(count,pool.length)),index:0,score:0,answers:[],paper,topic,count,startedAt:new Date().toISOString()};
  document.querySelector('#quizSetup').classList.add('hidden');document.querySelector('#quizRun').classList.remove('hidden');quizRenderQuestion();
}

export function initQuiz(){
  const start=document.querySelector('#startQuiz');if(start)start.onclick=startQuiz;
}
export { quizPage };
