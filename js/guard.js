import {sb,currentUser,go,settle,signOut} from './auth.js';
const u=await currentUser();
if(!u){
  if(!go('login.html'))document.body.innerHTML='<p style="padding:24px">Could not verify your session. <a href="login.html">Go to the login page</a>.</p>';
}else{
  settle();
  sb.auth.onAuthStateChange(e=>{if(e==='SIGNED_OUT')location.replace('login.html')});
  await import('./app.js');
  // Put "Sign out" in the workspace's top bar. The app re-renders its bar on each page, so re-add it when needed.
  const app=document.getElementById('app');
  const inject=()=>{const s=document.querySelector('.status');if(s&&!s.querySelector('.signout-btn')){const b=document.createElement('button');b.className='signout-btn';b.type='button';b.textContent='Sign out';b.onclick=signOut;s.append(b)}};
  new MutationObserver(inject).observe(app,{childList:true,subtree:true});inject();
  setTimeout(()=>{if(!document.querySelector('.signout-btn')){const b=document.createElement('button');b.className='signout-fab';b.type='button';b.textContent='Sign out';b.onclick=signOut;document.body.append(b)}},1500);
}
