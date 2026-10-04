import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const root = document.querySelector('#teacherApp');
let user = null;
let profile = null;

function esc(value){
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}
function initials(value){
  const parts = String(value || 'Teacher').trim().split(/\s+/).filter(Boolean);
  return (parts.slice(0,2).map(p => p[0]).join('') || 'T').toUpperCase();
}
function formatDate(value){
  if(!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'});
}
function pageShell(body){
  const name = profile?.full_name || user?.email || 'Teacher';
  root.innerHTML = `
    <div class="teacher-app">
      <aside class="teacher-sidebar" id="teacherSidebar">
        <div class="teacher-brand">
          <div class="teacher-brand-mark">P</div>
          <div><strong>PhysicsIQ</strong><span>Teacher Portal</span></div>
        </div>
        <nav class="teacher-nav" aria-label="Teacher navigation">
          <a href="#overview" class="active"><span class="teacher-nav-icon">⌂</span>Overview</a>
          <a href="#classes"><span class="teacher-nav-icon">▦</span>Classes</a>
          <a href="#assignments"><span class="teacher-nav-icon">✓</span>Assignments</a>
          <a href="#materials"><span class="teacher-nav-icon">▤</span>Materials</a>
        </nav>
        <div class="teacher-sidebar-footer">
          <div class="teacher-user-mini">
            <div class="teacher-avatar">${esc(initials(name))}</div>
            <div><strong>${esc(name)}</strong><span>Teacher account</span></div>
          </div>
          <button class="teacher-signout" id="logout">Sign out</button>
        </div>
      </aside>

      <main class="teacher-main">
        <header class="teacher-topbar">
          <div style="display:flex;align-items:center;gap:10px">
            <button class="teacher-mobile-menu" id="menuBtn" aria-label="Open menu">☰</button>
            <div class="teacher-breadcrumb"><strong>Teacher Portal</strong> <span>/ Overview</span></div>
          </div>
          <div class="teacher-top-actions">
            <a class="teacher-secondary-btn" href="index.html">Student workspace</a>
          </div>
        </header>

        <div class="teacher-content">
          ${body}
        </div>
      </main>
    </div>`;

  document.querySelector('#logout').onclick = async () => {
    await sb.auth.signOut();
    location.href = 'index.html';
  };
  document.querySelector('#menuBtn').onclick = () => document.querySelector('#teacherSidebar').classList.toggle('open');
  document.querySelectorAll('.teacher-nav a').forEach(a => a.addEventListener('click', () => {
    document.querySelector('#teacherSidebar')?.classList.remove('open');
    document.querySelectorAll('.teacher-nav a').forEach(x => x.classList.remove('active'));
    a.classList.add('active');
  }));
}

function renderDashboard(classes, assignments, materials){
  const name = profile?.full_name || user?.email || 'Teacher';
  const classCount = classes?.length || 0;
  const assignmentCount = assignments?.length || 0;
  const materialCount = materials?.length || 0;
  const boardCount = new Set((classes || []).map(c => c.board).filter(Boolean)).size;

  pageShell(`
    <section class="teacher-hero teacher-section-anchor" id="overview">
      <div>
        <div class="teacher-kicker">Teacher workspace</div>
        <h1>Good to see you, ${esc(name.split(' ')[0])}.</h1>
        <p>Manage your classes, assignments and PhysicsIQ resources from one place.</p>
      </div>
      <a class="teacher-primary-btn" href="#new-class">＋ Create class</a>
    </section>

    <section class="teacher-stats" aria-label="Teaching overview">
      <article class="teacher-stat"><div class="teacher-stat-top"><span>Classes</span><span class="teacher-stat-icon">▦</span></div><div class="teacher-stat-value">${classCount}</div><div class="teacher-stat-note">Active classes you manage</div></article>
      <article class="teacher-stat"><div class="teacher-stat-top"><span>Assignments</span><span class="teacher-stat-icon">✓</span></div><div class="teacher-stat-value">${assignmentCount}</div><div class="teacher-stat-note">Recent assignments</div></article>
      <article class="teacher-stat"><div class="teacher-stat-top"><span>Materials</span><span class="teacher-stat-icon">▤</span></div><div class="teacher-stat-value">${materialCount}</div><div class="teacher-stat-note">Teaching resources</div></article>
      <article class="teacher-stat"><div class="teacher-stat-top"><span>Boards</span><span class="teacher-stat-icon">◎</span></div><div class="teacher-stat-value">${boardCount}</div><div class="teacher-stat-note">Exam boards in your classes</div></article>
    </section>

    <div class="teacher-grid">
      <section class="teacher-panel teacher-section-anchor" id="classes">
        <div class="teacher-panel-head">
          <div><h2>Your classes</h2><p>Quick view of the classes assigned to you.</p></div>
          <a class="teacher-secondary-btn" href="#new-class">New class</a>
        </div>
        <div class="teacher-panel-body">
          ${classCount ? `<div class="teacher-class-list">${classes.map(c => `
            <div class="teacher-class-row">
              <div><div class="teacher-class-name">${esc(c.name)}</div><div class="teacher-class-meta">${esc(c.subject || 'Physics')} · Created ${esc(formatDate(c.created_at))}</div></div>
              <span class="teacher-pill blue">${esc(c.board || 'Board not set')}</span>
              <span class="teacher-pill">${esc(c.specification || 'IGCSE')}</span>
            </div>`).join('')}</div>` : `
            <div class="teacher-empty"><strong>No classes yet</strong>Create your first class below to start organizing your teaching.</div>`}
        </div>
      </section>

      <section class="teacher-panel teacher-section-anchor" id="assignments">
        <div class="teacher-panel-head">
          <div><h2>Recent assignments</h2><p>Latest tasks you've created.</p></div>
        </div>
        <div class="teacher-panel-body">
          ${assignmentCount ? `<div class="teacher-list">${assignments.map(a => `
            <div class="teacher-list-item"><div class="teacher-list-title">${esc(a.title)}</div><div class="teacher-list-meta">Due ${esc(formatDate(a.due_at))}</div></div>`).join('')}</div>` : `
            <div class="teacher-empty"><strong>No assignments yet</strong>Your latest assignments will appear here.</div>`}
        </div>
      </section>
    </div>

    <section class="teacher-panel teacher-section teacher-section-anchor" id="new-class">
      <div class="teacher-panel-head">
        <div><h2>Create a class</h2><p>Add a class to your teaching workspace.</p></div>
      </div>
      <div class="teacher-panel-body">
        <form id="classForm" class="teacher-create">
          <input class="teacher-input" name="name" placeholder="Class name e.g. 10A" required>
          <input class="teacher-input" name="board" placeholder="Exam board e.g. Cambridge IGCSE" required>
          <button class="teacher-primary-btn" type="submit">Create class</button>
        </form>
        <div id="classMsg" class="teacher-message"></div>
      </div>
    </section>

    <section class="teacher-panel teacher-section teacher-section-anchor" id="materials">
      <div class="teacher-panel-head">
        <div><h2>Your materials</h2><p>Resources connected to your teacher account.</p></div>
      </div>
      <div class="teacher-panel-body">
        ${materialCount ? `<div class="teacher-material-grid">${materials.map(m => `
          <div class="teacher-material"><strong>${esc(m.title)}</strong><span>${esc(m.type || 'Material')} · ${esc(m.unit_name || 'General')}</span></div>`).join('')}</div>` : `
          <div class="teacher-empty"><strong>No materials yet</strong>Teacher resources will appear here when added.</div>`}
      </div>
    </section>
  `);

  document.querySelector('#classForm').onsubmit = createClass;
}

async function createClass(event){
  event.preventDefault();
  const msg = document.querySelector('#classMsg');
  const form = event.currentTarget;
  msg.className = 'teacher-message';
  msg.textContent = 'Creating class…';

  const formData = new FormData(form);
  const { error } = await sb.from('classes').insert({
    teacher_id:user.id,
    name:String(formData.get('name') || '').trim(),
    board:String(formData.get('board') || '').trim(),
    subject:'Physics'
  });

  if(error){
    msg.className = 'teacher-message error';
    msg.textContent = error.message;
    return;
  }

  msg.className = 'teacher-message ok';
  msg.textContent = 'Class created successfully.';
  form.reset();
  await load();
}

async function load(){
  const results = await Promise.all([
    sb.from('classes').select('id,name,subject,board,specification,created_at').eq('teacher_id',user.id).order('created_at',{ascending:false}),
    sb.from('assignments').select('id,title,due_at,class_id,created_at').eq('teacher_id',user.id).order('created_at',{ascending:false}).limit(8),
    sb.from('materials').select('id,title,type,unit_name,created_at').eq('teacher_id',user.id).order('created_at',{ascending:false}).limit(9)
  ]);

  const [classResult, assignmentResult, materialResult] = results;
  if(classResult.error || assignmentResult.error || materialResult.error){
    throw new Error((classResult.error || assignmentResult.error || materialResult.error).message);
  }
  renderDashboard(classResult.data || [], assignmentResult.data || [], materialResult.data || []);
}

async function start(){
  root.innerHTML = '<div class="teacher-loading">Loading your teacher workspace…</div>';
  const {data:{session}} = await sb.auth.getSession();

  if(!session?.user){
    location.href = 'index.html';
    return;
  }

  user = session.user;
  const {data,error} = await sb.from('profiles').select('role,full_name,email').eq('id',user.id).maybeSingle();

  if(error || !data || data.role !== 'teacher'){
    await sb.auth.signOut();
    root.innerHTML = `<div class="teacher-error"><h1>Teacher access required</h1><p>This page is restricted to teacher accounts.</p><a class="teacher-primary-btn" href="index.html">Back to PhysicsIQ</a></div>`;
    return;
  }

  profile = data;
  try{
    await load();
  }catch(error){
    root.innerHTML = `<div class="teacher-error"><h1>Could not load the teacher portal</h1><p>${esc(error.message)}</p><a class="teacher-primary-btn" href="index.html">Back to PhysicsIQ</a></div>`;
  }
}

start();