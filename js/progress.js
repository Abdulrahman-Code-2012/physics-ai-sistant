const esc = value => String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#39;');
const dateLabel = value => value ? new Date(value).toLocaleDateString(undefined,{year:'numeric',month:'short',day:'numeric'}) : '—';
const pct = value => Math.max(0,Math.min(100,Number(value)||0));

export function progressPage(view='progress') {
  const isPlanner = view === 'planner';
  return `<main class="wrap learning-wrap"><div class="pagehead"><div><div class="eyebrow">YOUR LEARNING</div><h1>${isPlanner?'Smart revision planner':'My progress'}</h1><p>${isPlanner?'A practical plan built from your quiz mistakes and paper-checking results.':'See your real quiz results, paper-checking scores and topic progress in one place.'}</p></div><button class="back" data-page="home">← Dashboard</button></div><div class="learning-tabs"><button class="${isPlanner?'':'active'}" data-page="progress">Progress overview</button><button class="${isPlanner?'active':''}" data-page="planner">Revision planner</button></div><section id="learningView" class="learning-view"><div class="learning-loading">Loading your saved learning data…</div></section></main>`;
}

async function currentStudent(sb) {
  const {data:{session},error} = await sb.auth.getSession();
  if (error) throw error;
  const user = session?.user;
  if (!user || user.is_anonymous) throw new Error('Sign in with your email to view and save your personal progress.');
  return user;
}
async function fetchLearningData(sb,user) {
  const [quizRes,paperRes] = await Promise.all([
    sb.from('quiz_attempts').select('id,score,total,percentage,paper,topic,topic_results,mistakes,created_at').eq('student_id',user.id).order('created_at',{ascending:false}).limit(100),
    sb.from('paper_checks').select('id,marks_awarded,marks_total,percentage,grade,feedback,created_at,question_text').eq('student_id',user.id).order('created_at',{ascending:false}).limit(50)
  ]);
  if(quizRes.error) throw quizRes.error;
  if(paperRes.error) throw paperRes.error;
  return {quizzes:quizRes.data||[],papers:paperRes.data||[]};
}
function topicStats(quizzes) {
  const stats = new Map();
  for (const attempt of quizzes) for (const topic of (Array.isArray(attempt.topic_results)?attempt.topic_results:[])) {
    const label = topic.label || 'Other';
    const row = stats.get(label) || {label,correct:0,total:0};
    row.correct += Number(topic.ok)||0; row.total += Number(topic.total)||0; stats.set(label,row);
  }
  return [...stats.values()].filter(x=>x.total>0).map(x=>({...x,pct:Math.round(x.correct/x.total*100)})).sort((a,b)=>b.pct-a.pct);
}
function trendBars(quizzes) {
  const rows = [...quizzes].slice(0,8).reverse();
  if (!rows.length) return '<div class="learning-empty">Complete a quiz and your progress trend will appear here.</div>';
  return `<div class="learning-trend">${rows.map((r,i)=>`<div class="trend-column" title="${esc(dateLabel(r.created_at))}: ${pct(r.percentage)}%"><div class="trend-value">${pct(r.percentage)}%</div><div class="trend-track"><i style="height:${Math.max(5,pct(r.percentage))}%"></i></div><small>${esc(dateLabel(r.created_at))}</small></div>`).join('')}</div>`;
}
function topicBars(rows) {
  if (!rows.length) return '<div class="learning-empty">Topic strengths will appear after you complete quizzes.</div>';
  const ordered = [...rows].sort((a,b)=>a.pct-b.pct);
  return `<div class="topic-progress-list">${ordered.map(r=>`<div class="topic-progress-row"><div><span>${esc(r.label)}</span><b>${r.pct}%</b></div><div class="topic-progress-track"><i class="${r.pct<70?'weak':r.pct>=85?'strong':''}" style="width:${r.pct}%"></i></div><small>${r.correct}/${r.total} correct</small></div>`).join('')}</div>`;
}
function progressMarkup(data) {
  const {quizzes,papers}=data;
  const quizAvg=quizzes.length?Math.round(quizzes.reduce((sum,r)=>sum+pct(r.percentage),0)/quizzes.length):null;
  const validPapers=papers.filter(r=>Number(r.marks_total)>0 && Number.isFinite(Number(r.marks_awarded)));
  const paperAvg=validPapers.length?Math.round(validPapers.reduce((sum,r)=>sum+(Number(r.percentage)||Number(r.marks_awarded)/Number(r.marks_total)*100),0)/validPapers.length):null;
  const topics=topicStats(quizzes);
  const recent=quizzes.slice(0,6).map(r=>`<tr><td>${esc(dateLabel(r.created_at))}</td><td>${esc(r.paper||'Quiz')}</td><td>${esc(r.topic||'All topics')}</td><td>${Number(r.score)||0}/${Number(r.total)||0}</td><td><span class="learning-score ${pct(r.percentage)<70?'score-low':pct(r.percentage)>=85?'score-high':''}">${pct(r.percentage)}%</span></td></tr>`).join('');
  const paperRows=validPapers.slice(0,5).map(r=>`<tr><td>${esc(dateLabel(r.created_at))}</td><td>${Number(r.marks_awarded)||0}/${Number(r.marks_total)||0}</td><td>${pct(r.percentage||((Number(r.marks_awarded)||0)/(Number(r.marks_total)||1)*100))}%</td><td>${esc(r.grade||'—')}</td></tr>`).join('');
  const strength=topics[0],weakness=topics.length?topics[topics.length-1]:null;
  return `<div class="learning-kpis"><article class="learning-kpi kpi-blue"><span>Quiz average</span><strong>${quizAvg===null?'—':quizAvg+'%'}</strong><small>${quizzes.length} saved attempt${quizzes.length===1?'':'s'}</small></article><article class="learning-kpi kpi-purple"><span>Paper-check average</span><strong>${paperAvg===null?'—':paperAvg+'%'}</strong><small>${validPapers.length} readable result${validPapers.length===1?'':'s'}</small></article><article class="learning-kpi kpi-green"><span>Strongest topic</span><strong>${strength?esc(strength.label):'—'}</strong><small>${strength?strength.pct+'% accuracy':'Complete a quiz to discover it'}</small></article><article class="learning-kpi kpi-orange"><span>Needs revision</span><strong>${weakness?esc(weakness.label):'—'}</strong><small>${weakness?weakness.pct+'% accuracy':'More results needed'}</small></article></div><div class="learning-grid"><section class="learning-panel"><div class="learning-panel-head"><div><h2>Progress over time</h2><p>Your last eight saved quizzes, oldest to newest.</p></div></div>${trendBars(quizzes)}</section><section class="learning-panel"><div class="learning-panel-head"><div><h2>Topic accuracy</h2><p>Combined results from your saved quizzes.</p></div></div>${topicBars(topics)}</section></div><section class="learning-panel learning-table-panel"><div class="learning-panel-head"><div><h2>Recent quizzes</h2><p>Only completed quizzes successfully saved to your account are shown.</p></div><button class="secondary" data-page="planner">Build my revision plan →</button></div><div class="learning-table-scroll"><table class="learning-table"><thead><tr><th>Date</th><th>Paper</th><th>Topic</th><th>Score</th><th>Accuracy</th></tr></thead><tbody>${recent||'<tr><td colspan="5" class="learning-empty">No saved quizzes yet. Complete a quiz to start tracking progress.</td></tr>'}</tbody></table></div></section><section class="learning-panel learning-table-panel"><div class="learning-panel-head"><div><h2>Paper-checking results</h2><p>Unreadable or unmarked uploads are excluded from averages.</p></div></div><div class="learning-table-scroll"><table class="learning-table"><thead><tr><th>Date</th><th>Marks</th><th>Accuracy</th><th>Grade</th></tr></thead><tbody>${paperRows||'<tr><td colspan="4" class="learning-empty">No valid paper-checking results saved yet.</td></tr>'}</tbody></table></div></section>`;
}

function slug(text) { return String(text||'topic').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'topic'; }
function addDays(date,days) { if(!date)return null; const d=new Date(date+'T12:00:00'); d.setDate(d.getDate()+days); return d.toISOString().slice(0,10); }
async function buildRecommendations(sb,user,quizzes,papers,examDate,existing) {
  const rows=[]; const topics=topicStats(quizzes);
  for(const t of topics.filter(x=>x.pct<70)) rows.push({user_id:user.id,recommendation_key:'topic:'+slug(t.label),title:'Revise '+t.label,topic:t.label,reason:`Your saved quiz accuracy is ${t.pct}% (${t.correct}/${t.total} correct). Review the topic, then take another quiz.`,priority:t.pct<50?'high':'medium',due_date:examDate||null,source_type:'quiz_topic'});
  for(const p of papers.filter(x=>Number(x.marks_total)>0 && (Number(x.percentage)||Number(x.marks_awarded)/Number(x.marks_total)*100)<70).slice(0,3)) rows.push({user_id:user.id,recommendation_key:'paper-check:'+p.id,title:'Review paper-checking feedback',topic:'Past-paper practice',reason:`Your latest saved result was ${Number(p.marks_awarded)||0}/${Number(p.marks_total)}. Revisit the feedback before attempting similar questions.`,priority:Number(p.percentage)<50?'high':'medium',due_date:examDate||null,source_type:'paper_check',source_id:p.id});
  if(!quizzes.length && !papers.some(p=>Number(p.marks_total)>0)) rows.push({user_id:user.id,recommendation_key:'starter:diagnostic',title:'Complete a baseline Physics quiz',topic:'All topics',reason:'There are not enough saved results to identify weak topics yet. A quiz will help personalise your plan.',priority:'medium',due_date:examDate||null,source_type:'starter'});
  const existingKeys=new Set(existing.map(t=>t.recommendation_key));
  const missing=rows.filter(t=>!existingKeys.has(t.recommendation_key));
  if(missing.length){const{error}=await sb.from('revision_tasks').insert(missing);if(error)throw error;}
  if(examDate){const{error}=await sb.from('revision_tasks').update({due_date:examDate}).eq('user_id',user.id).is('completed_at',null);if(error)throw error;}
  return rows;
}
function taskMarkup(tasks) {
  if(!tasks.length)return '<div class="learning-empty">No recommended tasks right now. Complete a quiz or paper check and the planner will use those results to suggest what to revise.</div>';
  const open=tasks.filter(t=>!t.completed_at),done=tasks.filter(t=>t.completed_at);
  const render=t=>`<label class="revision-task ${t.completed_at?'task-done':''}"><input type="checkbox" data-task-id="${esc(t.id)}" ${t.completed_at?'checked':''}><span class="task-checkmark"></span><span class="task-copy"><b>${esc(t.title)}</b><small>${esc(t.topic||'Physics')} · ${esc(t.reason||'Recommended revision')}</small>${t.due_date?`<small class="task-due">Target date: ${esc(dateLabel(t.due_date))}</small>`:''}</span><span class="task-priority priority-${esc(t.priority||'medium')}">${esc(t.priority||'medium')}</span></label>`;
  return `${open.length?`<div class="revision-task-list">${open.map(render).join('')}</div>`:'<div class="learning-empty">All recommended tasks are complete. Great work!</div>'}${done.length?`<details class="completed-tasks"><summary>Completed tasks (${done.length})</summary><div class="revision-task-list">${done.map(render).join('')}</div></details>`:''}`;
}
async function plannerMarkup(sb,user) {
  const [data,prefRes,taskRes]=await Promise.all([
    fetchLearningData(sb,user),
    sb.from('revision_preferences').select('exam_date').eq('user_id',user.id).maybeSingle(),
    sb.from('revision_tasks').select('id,user_id,recommendation_key,title,topic,reason,priority,due_date,completed_at,source_type,created_at').eq('user_id',user.id).order('created_at',{ascending:false})
  ]);
  if(prefRes.error)throw prefRes.error;if(taskRes.error)throw taskRes.error;
  const examDate=prefRes.data?.exam_date||'';const existing=taskRes.data||[];
  await buildRecommendations(sb,user,data.quizzes,data.papers,examDate,existing);
  const {data:tasks,error}=await sb.from('revision_tasks').select('id,user_id,recommendation_key,title,topic,reason,priority,due_date,completed_at,source_type,created_at').eq('user_id',user.id).order('completed_at',{ascending:true,nullsFirst:true}).order('priority',{ascending:true}).order('created_at',{ascending:false});
  if(error)throw error;
  const taskRows=tasks||[];const openCount=taskRows.filter(t=>!t.completed_at).length;const topicRows=topicStats(data.quizzes);const weak=topicRows.filter(t=>t.pct<70).length;
  return `<div class="planner-intro"><div><span class="planner-icon">✦</span><div><h2>Recommended for you</h2><p>Tasks update from your saved quiz mistakes and paper-checking results. Tick a task when you finish it.</p></div></div><div class="planner-count"><strong>${openCount}</strong><span>tasks left</span></div></div><section class="learning-panel exam-date-panel"><form id="examDateForm" class="exam-date-form"><label for="examDate"><b>Upcoming exam date</b><small>Set your target date so revision tasks can be scheduled around it.</small></label><input id="examDate" type="date" value="${esc(examDate)}" min="${new Date().toISOString().slice(0,10)}"><button class="primary" type="submit">Save date</button><span id="examDateStatus" role="status"></span></form></section><div class="planner-summary"><div><b>${weak}</b><span>topics under 70%</span></div><div><b>${data.quizzes.length}</b><span>saved quizzes analysed</span></div><div><b>${data.papers.filter(p=>Number(p.marks_total)>0).length}</b><span>marked papers analysed</span></div></div><section class="learning-panel"><div class="learning-panel-head"><div><h2>Your revision checklist</h2><p>Higher-priority tasks appear first. Your completion status is saved to your account.</p></div></div><div id="revisionTasks">${taskMarkup(taskRows)}</div><p id="taskStatus" class="learning-status" role="status"></p></section><section class="learning-panel"><div class="learning-panel-head"><div><h2>What the plan is using</h2><p>Recommendations are based on saved results, not guessed scores.</p></div></div>${topicBars(topicRows)}</section>`;
}

export async function initProgress(sb,view='progress') {
  const root=document.querySelector('#learningView');if(!root)return;
  root.innerHTML='<div class="learning-loading">Loading your saved learning data…</div>';
  try {
    const user=await currentStudent(sb);
    if(view==='progress') { const data=await fetchLearningData(sb,user);root.innerHTML=progressMarkup(data);return; }
    root.innerHTML=await plannerMarkup(sb,user);
    const form=document.querySelector('#examDateForm');
    if(form)form.onsubmit=async e=>{e.preventDefault();const status=document.querySelector('#examDateStatus');const date=document.querySelector('#examDate').value||null;const{error}=await sb.from('revision_preferences').upsert({user_id:user.id,exam_date:date},{onConflict:'user_id'});if(error){status.textContent='Could not save the date: '+error.message;return;}status.textContent='Saved. Updating your plan…';await initProgress(sb,'planner');};
    root.querySelectorAll('[data-task-id]').forEach(input=>input.onchange=async()=>{input.disabled=true;const status=document.querySelector('#taskStatus');const completed_at=input.checked?new Date().toISOString():null;const{error}=await sb.from('revision_tasks').update({completed_at}).eq('id',input.dataset.taskId).eq('user_id',user.id);if(error){input.checked=!input.checked;status.textContent='Could not update this task: '+error.message;input.disabled=false;return;}await initProgress(sb,'planner');});
  } catch(error) {
    root.innerHTML=`<div class="learning-error"><b>Could not load your learning data.</b><p>${esc(error?.message||'Unknown error')}</p><small>Check your connection and try again. The dashboard will not invent scores when data cannot be loaded.</small><div><button class="secondary" id="retryLearning">Try again</button></div></div>`;
    document.querySelector('#retryLearning')?.addEventListener('click',()=>initProgress(sb,view));
  }
}
