import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
export const sb=createClient(SUPABASE_URL,SUPABASE_KEY);
export const LOGIN='login.html',HOME='index.html',TEACHER='teacher.html';

// A real session = signed in with email and password. Leftover anonymous guest sessions do not count.
export async function currentUser(){const{data:{session}}=await sb.auth.getSession();const u=session?.user;return u&&!u.is_anonymous?u:null}
export async function roleOf(u){try{const{data}=await sb.from('profiles').select('role').eq('id',u.id).maybeSingle();return data?.role||'student'}catch{return 'student'}}
export const destFor=role=>role==='teacher'?TEACHER:HOME;

// Redirect with a hop counter so a bug can never become an endless redirect loop.
export function go(url){const h=+sessionStorage.getItem('pq_hops')||0;if(h>=4){sessionStorage.removeItem('pq_hops');return false}sessionStorage.setItem('pq_hops',h+1);location.replace(url);return true}
export const settle=()=>setTimeout(()=>sessionStorage.removeItem('pq_hops'),3000);
export async function signOut(){await sb.auth.signOut();sessionStorage.removeItem('pq_hops');location.replace(LOGIN)}
