// Reliable browser boot bridge for the published static app.
// It guarantees that the game action has a live app.js module before invoking guestPlay().
let booting=null;
let launching=false;
let lastLaunchAt=0;
function revealGameShell(){
  const hide=['approvedHome','landing','home','room','socialHub','auth'];
  for(const id of hide){const el=document.getElementById(id);if(el)el.classList.add('hidden');}
  const game=document.getElementById('game');
  if(game)game.classList.remove('hidden');
  document.body.classList.add('game-active');
  const state=document.getElementById('stateInfo');
  if(state)state.textContent='جاري فتح طاولة طرنيب…';
}
async function ensureAppLoaded(){
  if(typeof window.guestPlay==='function') return true;
  if(!booting){
    booting=import('./app.js?v=20260825-boot5').catch(err=>{
      console.error('app.js boot failed',err);
      booting=null;
      return false;
    });
  }
  const ok=await booting;
  return ok!==false&&typeof window.guestPlay==='function';
}
async function launchGuest(event){
  const now=Date.now();
  if(now-lastLaunchAt<700)return;
  lastLaunchAt=now;
  if(event){event.preventDefault();event.stopImmediatePropagation();}
  if(launching)return;
  launching=true;
  revealGameShell();
  try{
    const ok=await ensureAppLoaded();
    if(!ok)throw new Error('تعذر تحميل تشغيل اللعبة.');
    const result=window.guestPlay();
    if(result&&typeof result.then==='function')await result;
  }catch(e){
    console.error('Guest game launch failed',e);
    const state=document.getElementById('stateInfo');
    if(state)state.textContent=e.message||'تعذر فتح طاولة طرنيب';
    const log=document.getElementById('log');
    if(log)log.textContent='خطأ تشغيل اللعبة: '+(e.message||e);
    alert(e.message||'تعذر فتح طاولة طرنيب');
  }finally{
    launching=false;
  }
}
// Expose the same launcher used by the enhanced UI so every entry point shares one path.
window.__launchGuest=launchGuest;
function isGuestButton(el){
  return !!el&&el.tagName==='BUTTON'&&((el.getAttribute('onclick')||'').includes('guestPlay'));
}
document.addEventListener('click',event=>{
  const el=event.target?.closest?.('button');
  if(isGuestButton(el))launchGuest(event);
},true);
document.addEventListener('pointerup',event=>{
  const el=event.target?.closest?.('button');
  if(isGuestButton(el))launchGuest(event);
},true);
