// Reliable browser boot bridge for the published static app.
// It guarantees that the game action has a live app.js module before invoking guestPlay().
let booting = null;
async function ensureAppLoaded(){
  if(typeof window.guestPlay==='function') return true;
  if(!booting){
    booting = import('./app.js?v=20260825-boot').catch(err=>{
      console.error('app.js boot failed',err);
      return false;
    });
  }
  const ok = await booting;
  return ok !== false && typeof window.guestPlay==='function';
}
async function launchGuest(event){
  if(event){event.preventDefault();event.stopImmediatePropagation();}
  try{
    const ok=await ensureAppLoaded();
    if(!ok) throw new Error('تعذر تشغيل محرك اللعبة. أعد تحميل الصفحة وحاول مرة أخرى.');
    window.guestPlay();
  }catch(e){
    console.error('Guest game launch failed',e);
    alert(e.message||'تعذر فتح طاولة طرنيب');
  }
}
document.addEventListener('click',event=>{
  const el=event.target?.closest?.('button');
  if(!el)return;
  const onclick=el.getAttribute('onclick')||'';
  if(onclick.includes('guestPlay')) launchGuest(event);
},true);
