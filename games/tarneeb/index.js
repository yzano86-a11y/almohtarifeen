import { dealHands, newState, applyBid, setTrump, applyCard, legalCards, SUITS } from './engine.js';

const NAMES=['أنت','الملكة','الأسطورة','القيصر'];
const RED=new Set(['♥','♦']);
const AI_DELAY=520;
const rankPower={A:14,K:13,Q:12,J:11,'10':10,'9':9,'8':8,'7':7,'6':6,'5':5,'4':4,'3':3,'2':2};

function cardHTML(card,{playable=false,selected=false}={}){
  const red=RED.has(card.s)?' is-red':'';
  return `<button class="royal-card${red}${playable?' is-playable':''}${selected?' is-selected':''}" type="button" data-card="${card.s}|${card.r}" ${playable?'':'disabled'} aria-label="${card.r} ${card.s}">
    <span class="royal-card-rank">${card.r}</span><span class="royal-card-suit">${card.s}</span><span class="royal-card-crown">♛</span>
  </button>`;
}
function backHTML(count){return `<div class="royal-backs">${Array.from({length:Math.min(count,7)},()=>'<i><span>♛</span></i>').join('')}</div>`}
function cardFromKey(key){const [s,r]=key.split('|');return{s,r,v:rankPower[r]}}
function bestSuit(hand){return SUITS.map(s=>({s,n:hand.filter(c=>c.s===s).length,p:hand.filter(c=>c.s===s).reduce((a,c)=>a+c.v,0)})).sort((a,b)=>b.n-a.n||b.p-a.p)[0].s}
function aiBid(hand,highBid){
  const counts=SUITS.map(s=>hand.filter(c=>c.s===s).length).sort((a,b)=>b-a);
  const honors=hand.filter(c=>c.v>=11).length;
  const strength=counts[0]*.65+honors*.55;
  const wanted=strength>=6.2?9:strength>=5.1?8:strength>=4.2?7:null;
  return wanted&&wanted>highBid?wanted:null;
}
function aiCard(state,player){
  const cards=legalCards(state,player);
  if(!cards.length)return null;
  // Prefer the lowest legal card; if following, save high cards for later.
  return cards.slice().sort((a,b)=>a.v-b.v)[0];
}

export function startTarneeb(container=document.getElementById('app')){
  if(!container)throw new Error('Tarneeb container not found');
  let state=newState(dealHands());
  let selected=null;
  let busy=false;
  let aiTimer=null;

  const screen=document.createElement('section');
  screen.className='tarneeb-screen royal-tarneeb';
  screen.dataset.game='tarneeb';
  container.replaceChildren(screen);

  function status(){
    if(state.phase==='bid'){
      if(state.bidTurn===0)return 'دورك في المزايدة';
      return `دور ${NAMES[state.bidTurn]} في المزايدة`;
    }
    if(state.phase==='trump'){
      return state.bidWinner===0?'اختر نوع الطرنيب':'الذكاء الاصطناعي يختار الطرنيب';
    }
    if(state.phase==='play'){
      if(state.turn===0)return state.leadSuit?`اتبع ${state.leadSuit} إن وجد`:'ابدأ الرمية';
      return `دور ${NAMES[state.turn]}`;
    }
    const a=state.roundResult;
    return `انتهت الجولة — فريقك ${a.scores[0]} · الفريق الآخر ${a.scores[1]}`;
  }

  function render(){
    const hand=state.players[0].hand;
    const legal=state.phase==='play'&&state.turn===0?legalCards(state,0):[];
    const isBid=state.phase==='bid'&&state.bidTurn===0;
    const isTrump=state.phase==='trump'&&state.bidWinner===0;
    const controls=isBid
      ? `<button data-action="pass">تمرير</button>${[7,8,9,10,11,12,13].filter(n=>n>state.highBid).map(n=>`<button data-action="bid" data-value="${n}" class="${n===7?'royal-bid-main':''}">${n}</button>`).join('')}`
      : isTrump
        ? SUITS.map(s=>`<button data-action="trump" data-value="${s}" class="royal-bid-main">${s}</button>`).join('')
        : state.phase==='round_end'
          ? '<button data-action="new" class="royal-bid-main">جولة جديدة</button>'
          : '<button disabled>اللعب جارٍ...</button>';

    const trick=state.trick.map(p=>`<div class="trick-card trick-p${p.player}"><span>${NAMES[p.player]}</span>${cardHTML(p.card)}</div>`).join('');
    screen.innerHTML=`
      <header class="tarneeb-royal-head">
        <button class="tarneeb-back-btn" type="button" aria-label="رجوع">‹</button>
        <div class="tarneeb-brand"><span>♛</span><strong>الملوك</strong><small>طرنيب ضد الذكاء الاصطناعي</small></div>
        <div class="tarneeb-round">الجولة ${state.trickNo+1}<br><b>♛ فريقك: ${state.scores[0]} · AI: ${state.scores[1]}</b></div>
      </header>
      <main class="royal-table">
        <div class="royal-felt">
          <div class="royal-watermark"><span>♛</span><b>الملوك</b><small>طرنيب</small></div>
          <div class="royal-seat royal-seat-top"><div class="seat-name"><b>${NAMES[2]}</b><small>${state.players[2].hand.length} ورقة</small></div>${backHTML(state.players[2].hand.length)}</div>
          <div class="royal-seat royal-seat-right"><div class="seat-name"><b>${NAMES[1]}</b><small>${state.players[1].hand.length} ورقة</small></div>${backHTML(state.players[1].hand.length)}</div>
          <div class="royal-seat royal-seat-left"><div class="seat-name"><b>${NAMES[3]}</b><small>${state.players[3].hand.length} ورقة</small></div>${backHTML(state.players[3].hand.length)}</div>
          <div class="royal-center">
            <div class="royal-deck"><span>${state.trump||'♛'}</span><small>${state.trump?'الطرنيب':'الملوك'}</small></div>
            <div class="royal-status">${status()}<br><small>المزايدة: ${state.highBid>6?state.highBid:'—'}</small></div>
          </div>
          <div class="royal-trick">${trick}</div>
        </div>
        <section class="royal-hand-panel">
          <div class="royal-hand-head"><b>أوراقك الملكية</b><span>${hand.length} ورقة · حيلك ${state.players[0].tricks}</span></div>
          <div class="royal-hand">${hand.map(c=>cardHTML(c,{playable:legal.some(x=>x.s===c.s&&x.r===c.r),selected:selected===c.s+'|'+c.r})).join('')}</div>
        </section>
        <section class="royal-controls">${controls}</section>
      </main>`;

    screen.querySelectorAll('[data-card]').forEach(btn=>btn.addEventListener('click',()=>{
      if(busy||state.phase!=='play'||state.turn!==0)return;
      const card=cardFromKey(btn.dataset.card);
      if(!legalCards(state,0).some(c=>c.s===card.s&&c.r===card.r))return;
      selected=btn.dataset.card;
      state=applyCard(state,0,card);
      selected=null; render(); queueAI();
    }));
    screen.querySelectorAll('[data-action]').forEach(btn=>btn.addEventListener('click',()=>{
      if(busy)return;
      const a=btn.dataset.action,v=btn.dataset.value;
      if(a==='pass'){state=applyBid(state,0,null);render();queueAI();}
      if(a==='bid'){state=applyBid(state,0,Number(v));render();queueAI();}
      if(a==='trump'){state=setTrump(state,0,v);render();queueAI();}
      if(a==='new'){state=newState(dealHands(),0,state.scores);selected=null;render();queueAI();}
    }));
  }

  async function queueAI(){
    if(busy)return;
    busy=true;
    while(true){
      if(state.phase==='bid'){
        if(state.bidTurn===0)break;
        await new Promise(r=>{ aiTimer=setTimeout(r,AI_DELAY); });
        const p=state.bidTurn;
        const bid=aiBid(state.players[p].hand,state.highBid);
        // Guarantee the table reaches a playable contract if everyone passed.
        const forced=bid===null&&state.bidWinner===null&&p===3?7:bid;
        state=applyBid(state,p,forced);
        render(); continue;
      }
      if(state.phase==='trump'){
        await new Promise(r=>setTimeout(r,AI_DELAY));
        state=setTrump(state,state.bidWinner,bestSuit(state.players[state.bidWinner].hand));
        render(); continue;
      }
      if(state.phase==='play'){
        if(state.turn===0||state.phase==='round_end')break;
        await new Promise(r=>setTimeout(r,AI_DELAY));
        const p=state.turn,card=aiCard(state,p);
        state=applyCard(state,p,card);
        render(); continue;
      }
      break;
    }
    busy=false;
  }

  render();
  queueAI();
  return {getState:()=>state,newRound:()=>{state=newState(dealHands(),0,state.scores);render();queueAI();}};
}