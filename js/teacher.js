import{createClient}from'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import{SUPABASE_URL,SUPABASE_KEY}from'./config.js';
const sb=createClient(SUPA_URL,SUPA_KEY),root=document.querySelector('#teacherApp'),$=s=>document.querySelector(s);let user,profile,students=[],history=[];
