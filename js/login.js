import {sb,currentUser,roleOf,destFor,go,settle} from './auth.js';
import {SUPABASE_URL,SUPABASE_KEY} from './config.js';
const $=s=>document.querySelector(s);
const msg=(t,bad=true)=>{$('#msg').textContent=t;$('#msg').className='teacher-message'+(t&&bad?' error':'')};
async function route(u){
  if(!u)return;
  const r=await roleOf(u);
  if(!go(destFor(r)))msg('Redirect stopped to avoid a loop. Please reload the page.');
}
(async()=>{
  const {data:{session}}=await sb.auth.getSession();
  if(session?.user?.is_anonymous)await sb.auth.signOut();
  const u=await currentUser();
  if(u)return route(u);
  settle();
})();
$('#form').onsubmit=async e=>{
  e.preventDefault();
  const username=$('#username').value.trim(),password=$('#pw').value;
  if(!username||!password)return msg('Enter your username/email and password.');
  $('#go').disabled=true;msg('');
  try{
    let data,error;
    if(username.includes('@')){
      const res=await sb.auth.signInWithPassword({email:username,password});
      data=res.data;error=res.error;
    }else{
      const res=await fetch(`${SUPABASE_URL}/functions/v1/username-login`,{
        method:'POST',
        headers:{'Content-Type':'application/json',apikey:SUPABASE_KEY},
        body:JSON.stringify({username,password})
      });
      data=await res.json();
      if(!res.ok||!data.access_token)throw new Error('Invalid username/email or password.');
      const result=await sb.auth.setSession({access_token:data.access_token,refresh_token:data.refresh_token});
      error=result.error;
    }
    if(error)throw error;
    await route(await currentUser());
  }catch(x){msg(x.message||'Could not sign in.')}finally{$('#go').disabled=false}
};