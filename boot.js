// Reliable browser boot bridge for the published static app.
// It guarantees that the game action has a live app.js module before invoking guestPlay().
let booting=null;
let launching=false;
async function ensureAppLoaded(){
  if(typeof window.guestPlay==='function') return true;
  if(!booting){
    booting=import('./app.js?v=20260825-boot2').catch(err=>{
      console.error('app.js boot failed',err);
      return false;
    });
  }
  const ok=await booting;
  return ok!==false&&typeof window.guestPlay==='function';
}
async function launchGuest(event){
  if(event){event.preventDefault();event.stopImmediatePropagation();}
  if(launching)return;
  launching=true;
  try{
    const ok=await ensureAppLoaded();
    if(!ok)throw new Error('تعذر تشغيل اللعبة. أعد تحميل الصفحة وحاول مرة أخرى.');
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
document.addEventListener('click',event=>{
  const el=event.target?.closest?.('button');
  if(!el)return;
  const onclick=el.getAttribute('onclick')||'';
  if(onclick.includes('guestPlay'))launchGuest(event);
},true);
