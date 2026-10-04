import {sb,currentUser,go,settle,signOut} from './auth.js';
const u=await currentUser();
if(!u){
  if(!go('login.html'))document.body.innerHTML='<p style="padding:24px">Could not verify your session. <a href="login.html">Go to the login page</a>.</p>';
}else{
  settle();
  sb.auth.onAuthStateChange(e=>{if(e==='SIGNED_OUT')location.replace('login.html')});
  const b=document.createElement('button');b.className='signout-fab';b.type='button';b.textContent='Sign out';b.onclick=signOut;document.body.append(b);
  await import('./app.js');
}
