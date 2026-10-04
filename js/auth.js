import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_URL, SUPABASE_KEY } from './config.js';

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
const form = document.querySelector('#loginForm');
const status = document.querySelector('#loginStatus');

async function route(user) {
  const { data: profile } = await sb.from('profiles').select('role').eq('id', user.id).maybeSingle();
  const destination = profile?.role === 'teacher' ? 'teacher.html' : 'main.html';
  if (location.pathname.endsWith('/' + destination) || location.pathname.endsWith(destination)) return;
  location.replace(destination);
}

async function start() {
  const { data: { session } } = await sb.auth.getSession();
  if (session?.user) await route(session.user);
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  status.className = 'status-box';
  status.textContent = 'Signing in…';
  const { data, error } = await sb.auth.signInWithPassword({
    email: form.email.value.trim(),
    password: form.password.value
  });
  if (error) {
    status.className = 'status-box error';
    status.textContent = error.message;
    return;
  }
  await route(data.user);
});

start();
