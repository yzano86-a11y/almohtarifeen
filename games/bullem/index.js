// Al-Molook Bull game integration.
//
// The integration is intentionally branded for Al-Molook and does not ship
// Bull 'Em's original visual identity or third-party assets. Its local game
// model follows the verified MIT-licensed Bull 'Em rules reviewed for this
// project. Preserve the upstream MIT notice when reusing upstream source.

const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const SUITS = ['♠','♥','♦','♣'];
const HANDS = [
  ['high','ورقة عالية'],
  ['pair','زوج'],
  ['twoPair','زوجان'],
  ['flush','فلاش'],
  ['trips','ثلاثة متشابهة'],
  ['straight','تسلسل'],
  ['fullHouse','فول هاوس'],
  ['quads','أربعة متشابهة'],
  ['straightFlush','تسلسل فلاش'],
  ['royalFlush','رويال فلاش'],
];
const HAND_VALUE = Object.fromEntries(HANDS.map(([id], i) => [id, i]));

function deck() {
  return SUITS.flatMap(s => RANKS.map((r, i) => ({ rank:r, suit:s, value:i + 2 })));
}
function shuffle(cards) {
  const a = cards.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function rankCounts(cards) {
  const m = new Map();
  for (const c of cards) m.set(c.value, (m.get(c.value) || 0) + 1);
  return [...m.entries()].sort((a,b) => b[1]-a[1] || b[0]-a[0]);
}
function isStraight(values) {
  const u = [...new Set(values)].sort((a,b) => b-a);
  if (u.length !== 5) return false;
  if (u[0] === 14 && u[1] === 5 && u[2] === 4 && u[3] === 3 && u[4] === 2) return true;
  return u.every((v, i) => i === 0 || u[i-1] - v === 1);
}
function evaluateFive(cards) {
  const counts = rankCounts(cards);
  const flush = cards.every(c => c.suit === cards[0].suit);
  const straight = isStraight(cards.map(c => c.value));
  const values = cards.map(c => c.value).sort((a,b) => b-a);
  const unique = [...new Set(values)].sort((a,b) => b-a);
  const royal = flush && unique.join(',') === '14,13,12,11,10';
  if (royal) return { id:'royalFlush', value:HAND_VALUE.royalFlush };
  if (flush && straight) return { id:'straightFlush', value:HAND_VALUE.straightFlush };
  if (counts[0]?.[1] === 4) return { id:'quads', value:HAND_VALUE.quads };
  if (counts[0]?.[1] === 3 && counts[1]?.[1] === 2) return { id:'fullHouse', value:HAND_VALUE.fullHouse };
  // Bull 'Em intentionally ranks flush below trips and above two pair.
  if (straight) return { id:'straight', value:HAND_VALUE.straight };
  if (counts[0]?.[1] === 3) return { id:'trips', value:HAND_VALUE.trips };
  if (flush) return { id:'flush', value:HAND_VALUE.flush };
  if (counts[0]?.[1] === 2 && counts[1]?.[1] === 2) return { id:'twoPair', value:HAND_VALUE.twoPair };
  if (counts[0]?.[1] === 2) return { id:'pair', value:HAND_VALUE.pair };
  return { id:'high', value:HAND_VALUE.high };
}
function bestHand(cards) {
  if (cards.length < 5) return { id:'high', value:HAND_VALUE.high };
  let best = { id:'high', value:-1 };
  for (let a=0;a<cards.length-4;a++) for (let b=a+1;b<cards.length-3;b++) for (let c=b+1;c<cards.length-2;c++) for (let d=c+1;d<cards.length-1;d++) for (let e=d+1;e<cards.length;e++) {
    const h = evaluateFive([cards[a],cards[b],cards[c],cards[d],cards[e]]);
    if (h.value > best.value) best = h;
  }
  return best;
}
function callText(call) {
  const name = HANDS.find(([id]) => id === call.hand)?.[1] || 'ورقة عالية';
  return call.rank ? `${name} ${call.rank}` : name;
}

export function startBullEm() {
  document.getElementById('bullemOverlay')?.remove();
  const root = document.createElement('section');
  root.id = 'bullemOverlay';
  root.dir = 'rtl';
  root.innerHTML = `
    <style>
      #bullemOverlay{position:fixed;inset:0;z-index:10000;background:radial-gradient(circle at 50% 15%,#243f68 0,#0b1220 45%,#070b14 100%);color:#fff;overflow:auto;font-family:inherit}
      #bullemOverlay *{box-sizing:border-box} .bm-shell{width:min(960px,94vw);margin:auto;padding:14px 0 34px}
      .bm-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 2px 16px}.bm-brand{display:flex;align-items:center;gap:10px}.bm-mark{width:42px;height:42px;border-radius:13px;display:grid;place-items:center;background:linear-gradient(135deg,#e7bb55,#9b6a20);color:#121212;font-size:23px;font-weight:900;box-shadow:0 10px 30px #0007}.bm-brand b{display:block;font-size:20px}.bm-brand span{display:block;opacity:.65;font-size:11px;margin-top:2px}.bm-actions{display:flex;gap:7px}.bm-btn{border:1px solid #ffffff1b;border-radius:11px;padding:9px 12px;background:#ffffff0c;color:#fff;font-weight:800;cursor:pointer}.bm-btn.primary{background:#e2b34e;color:#151515;border-color:transparent}.bm-table{border:1px solid #ffffff16;border-radius:24px;padding:16px;background:linear-gradient(160deg,#173b32,#0e2a25);box-shadow:0 24px 70px #0008}.bm-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}.bm-card{border:1px solid #ffffff12;border-radius:16px;padding:12px;background:#061a17aa}.bm-card.active{outline:2px solid #e5bb59}.bm-card .name{font-weight:900}.bm-card small{opacity:.6}.bm-count{font-size:12px;opacity:.7;margin-top:5px}.bm-hand{display:flex;flex-wrap:wrap;gap:4px;margin-top:9px;min-height:34px}.bm-playing-card{background:#f7f1df;color:#141414;border-radius:7px;padding:5px 6px;font-size:12px;font-weight:900;box-shadow:0 3px 7px #0005}.bm-center{margin:14px 0;padding:16px;border-radius:18px;background:#04120f99;text-align:center}.bm-call{font-size:22px;font-weight:900}.bm-log{max-height:110px;overflow:auto;text-align:right;margin-top:9px;font-size:12px;opacity:.7}.bm-controls{margin-top:12px;display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.bm-controls select,.bm-controls button{font:inherit}.bm-controls select{border-radius:10px;border:1px solid #ffffff22;background:#0a1718;color:#fff;padding:9px}.bm-status{margin-top:10px;text-align:center;min-height:22px;font-weight:700}.bm-note{font-size:11px;opacity:.55;text-align:center;margin-top:10px}
      @media(max-width:560px){.bm-shell{width:96vw}.bm-table{padding:11px;border-radius:18px}.bm-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.bm-card{padding:9px}.bm-hand{gap:3px}.bm-playing-card{font-size:10px;padding:4px}}
    </style>
    <div class="bm-shell">
      <header class="bm-top"><div class="bm-brand"><div class="bm-mark">♠</div><div><b>الملوك — البلّ</b><span>لعبة خداع ورق داخل منظومة الملوك</span></div></div><div class="bm-actions"><button class="bm-btn primary" id="bmNew">لعبة جديدة</button><button class="bm-btn" id="bmClose">رجوع</button></div></header>
      <main class="bm-table"><div id="bmPlayers" class="bm-grid"></div><div class="bm-center"><div style="opacity:.6;font-size:11px">آخر نداء</div><div id="bmCall" class="bm-call">لم يبدأ اللعب بعد</div><div id="bmStatus" class="bm-status">جاري التحضير…</div><div id="bmLog" class="bm-log"></div></div><div id="bmControls" class="bm-controls"></div><div class="bm-note">قواعد البلّ: 2–6 لاعبين محلياً • اليد تبدأ بورقة واحدة وتكبر عند الخسارة • الحد الأقصى الافتراضي 5 أوراق.</div></main>
    </div>`;
  document.body.appendChild(root);

  const state = { players: [], deck: [], turn: 0, call: null, history: [], finished:false, pendingBull:null };
  const names = ['أنت','ليان','كريم','نور','جاد','رنا'];
  function newGame(){
    state.players = names.slice(0,4).map((name,i)=>({id:i,name,hand:[],cards:1,eliminated:false}));
    state.deck = shuffle(deck()); state.turn = 0; state.call = null; state.history=[]; state.finished=false; state.pendingBull=null;
    for(const p of state.players) p.hand=[];
    for(let n=0;n<state.players.length;n++) for(const p of state.players){ if(!p.eliminated) p.hand.push(state.deck.pop()); }
    render();
  }
  function allCards(){ return state.players.filter(p=>!p.eliminated).flatMap(p=>p.hand); }
  function validRaiseOptions(){
    const min = state.call?.value ?? -1;
    return HANDS.filter(([,],i)=>i>min).map(([id,label],i)=>({id,label,value:HAND_VALUE[id]}));
  }
  function render(){
    root.querySelector('#bmPlayers').innerHTML = state.players.map((p,i)=>`<article class="bm-card ${i===state.turn&&!p.eliminated?'active':''}"><div class="name">${p.name}${p.eliminated?' — خرج':''}</div><small>${i===state.turn&&!p.eliminated?'الدور الآن':'لاعب'}</small><div class="bm-count">الأوراق: ${p.hand.length}</div><div class="bm-hand">${i===0&&!p.eliminated?p.hand.map(c=>`<span class="bm-playing-card">${c.rank}${c.suit}</span>`).join(''):'<span style="opacity:.45;font-size:12px">••••</span>'}</div></article>`).join('');
    root.querySelector('#bmCall').textContent = state.call ? callText(state.call) : 'لم يتم تسجيل نداء';
    root.querySelector('#bmLog').innerHTML = state.history.slice(-7).reverse().map(x=>`<div>${x}</div>`).join('');
    renderControls();
  }
  function renderControls(){
    const c=root.querySelector('#bmControls'); c.innerHTML='';
    if(state.finished){ const b=document.createElement('button'); b.className='bm-btn primary'; b.textContent='ابدأ من جديد'; b.onclick=newGame; c.appendChild(b); return; }
    if(state.turn!==0){ const b=document.createElement('button'); b.className='bm-btn primary'; b.textContent='محاكاة دور الخصم'; b.onclick=botTurn; c.appendChild(b); return; }
    const select=document.createElement('select');
    for(const o of validRaiseOptions()){ const op=document.createElement('option'); op.value=o.id; op.textContent=o.label; select.appendChild(op); }
    const raise=document.createElement('button'); raise.className='bm-btn primary'; raise.textContent='ارفع النداء'; raise.onclick=()=>makeCall(select.value);
    const bull=document.createElement('button'); bull.className='bm-btn'; bull.textContent='بلّ!'; bull.disabled=!state.call; bull.onclick=()=>resolveBull(0);
    c.append(select,raise,bull);
  }
  function makeCall(hand){
    const value=HAND_VALUE[hand]; if(state.call&&value<=state.call.value)return;
    state.call={hand,value}; state.history.push(`أنت ناديت: ${callText(state.call)}`); nextTurn();
  }
  function nextTurn(){ state.turn=(state.turn+1)%state.players.length; while(state.players[state.turn].eliminated) state.turn=(state.turn+1)%state.players.length; render(); }
  function botTurn(){
    const p=state.players[state.turn];
    const total=allCards(); const best=bestHand(total); const canBull=state.call && best.value < state.call.value;
    if(canBull && Math.random()<0.55){ state.history.push(`${p.name} قال: بلّ!`); resolveBull(state.turn); return; }
    const options=validRaiseOptions(); if(!options.length){ resolveBull(state.turn); return; }
    const pick=options[Math.min(options.length-1, Math.floor(Math.random()*Math.min(3,options.length)))]; state.call={hand:pick.id,value:pick.value}; state.history.push(`${p.name} رفع إلى: ${callText(state.call)}`); nextTurn();
  }
  function resolveBull(caller){
    if(!state.call)return;
    const actual=bestHand(allCards());
    const challenger=state.players[caller];
    const falseCall=actual.value>=state.call.value;
    const loser = falseCall ? caller : (state.turn===0?0:state.turn);
    state.history.push(falseCall ? `النداء صحيح — ${callText(actual)}. ${challenger.name} خسر تحدي البلّ.` : `النداء غير موجود — الفائز بالتحدي: ${challenger.name}.`);
    const target=state.players[falseCall?caller:state.turn];
    if(target){
      target.hand.push(...state.deck.splice(0,1));
      if(target.hand.length>5){target.eliminated=true;state.history.push(`${target.name} خرج من الطاولة.`)}
    }
    const alive=state.players.filter(p=>!p.eliminated);
    if(alive.length<=1){state.finished=true;state.history.push(`🏆 ${alive[0]?.name||'لا أحد'} فاز بالطاولة.`);render();return;}
    state.call=null; state.turn=alive.indexOf(state.players[caller]); if(state.turn<0)state.turn=0; render();
  }
  root.querySelector('#bmNew').onclick=newGame; root.querySelector('#bmClose').onclick=()=>root.remove();
  newGame();
  return root;
}
