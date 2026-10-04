import {sb,currentUser,roleOf,destFor,go,settle} from './auth.js';
const $=s=>document.querySelector(s);
let signup=false;
const msg=(t,bad=true)=>{$('#msg').textContent=t;$('#msg').className='teacher-message'+(t&&bad?' error':'')};
function mode(s){signup=s;$('#title').textContent=s?'Create your account':'Sign in';$('#sub').textContent=s?'Students and teachers can register here.':'Sign in to open your IGCSE Physics workspace.';$('#go').textContent=s?'Create account':'Sign in';$('#swap').textContent=s?'Have an account? Sign in':'New here? Create an account';$('#nameRow').hidden=$('#codeRow').hidden=!s;$('#pw').autocomplete=s?'new-password':'current-password';msg('')}
$('#swap').onclick=()=>mode(!signup);

async function route(u){if(!u)return;const r=await roleOf(u);if(!go(destFor(r)))msg('Redirect stopped to avoid a loop. Please reload the page.')}

(async()=>{
  const{data:{session}}=await sb.auth.getSession();
  if(session?.user?.is_anonymous)await sb.auth.signOut();
  const u=await currentUser();
  if(u)return route(u);
  settle();
})();

$('#form').onsubmit=async e=>{
  e.preventDefault();
  const email=$('#email').value.trim(),password=$('#pw').value;
  if(!email||password.length<6)return msg('Enter your email and a password of at least 6 characters.');
  $('#go').disabled=true;msg('');
  try{
    if(signup){
      const name=$('#name').value.trim();
      const{data,error}=await sb.auth.signUp({email,password,options:{data:{full_name:name}}});
      if(error)throw error;
      if(!data.session)throw new Error('Account created. Confirm your email, then sign in.');
      await sb.from('profiles').upsert({id:data.user.id,email,full_name:name||email,role:'student'},{onConflict:'id',ignoreDuplicates:true});
      const code=$('#code').value.trim();
      if(code)await sb.rpc('claim_teacher',{code});
    }else{
      const{error}=await sb.auth.signInWithPassword({email,password});
      if(error)throw error;
    }
    await route(await currentUser());
  }catch(x){msg(x.message)}
  $('#go').disabled=false;
};
