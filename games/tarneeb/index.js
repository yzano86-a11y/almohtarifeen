import { dealHands, newState } from './engine.js';

const NAMES=['أنت','الملكة','الأسطورة','القيصر'];
const RED=new Set(['♥','♦']);

function cardHTML(card, playable=false){
  const red=RED.has(card.s)?' is-red':'';
  return `<button class="royal-card${red}${playable?' is-playable':''}" type="button" data-suit="${card.s}" data-rank="${card.r}" aria-label="${card.r} ${card.s}">
    <span class="royal-card-rank">${card.r}</span>
    <span class="royal-card-suit">${card.s}</span>
    <span class="royal-card-crown">♛</span>
  </button>`;
}

function backHTML(count=5){
  return `<div class="royal-backs" aria-label="${count} أوراق مخفية">${Array.from({length:Math.min(count,7)},()=>'<i aria-hidden="true"><span>♛</span></i>').join('')}</div>`;
}

export function startTarneeb(container = document.getElementById('app')) {
  if (!container) throw new Error('Tarneeb container not found');

  const hands = dealHands();
  const state = newState(hands);

  const screen = document.createElement('section');
  screen.className = 'tarneeb-screen royal-tarneeb';
  screen.dataset.game = 'tarneeb';
  screen.innerHTML = `
    <header class="tarneeb-royal-head">
      <button class="tarneeb-back-btn" type="button" aria-label="رجوع">‹</button>
      <div class="tarneeb-brand"><span>♛</span><strong>الملوك</strong><small>طرنيب</small></div>
      <div class="tarneeb-round">الطاولة رقم 2458<br><b>مغلقة · 4 لاعبين</b></div>
    </header>

    <main class="royal-table" role="application" aria-label="طاولة طرنيب الملوك">
      <div class="royal-felt">
        <div class="royal-watermark"><span>♛</span><b>الملوك</b><small>طرنيب</small></div>

        <div class="royal-seat royal-seat-top">
          <div class="seat-name"><b>${NAMES[2]}</b><small>13 ورقة</small></div>
          ${backHTML(6)}
        </div>
        <div class="royal-seat royal-seat-right">
          <div class="seat-name"><b>${NAMES[1]}</b><small>13 ورقة</small></div>
          ${backHTML(5)}
        </div>
        <div class="royal-seat royal-seat-left">
          <div class="seat-name"><b>${NAMES[3]}</b><small>13 ورقة</small></div>
          ${backHTML(5)}
        </div>

        <div class="royal-center">
          <div class="royal-deck"><span>♛</span><small>الملوك</small></div>
          <div class="royal-status">الرمية<br><b>اختر حركتك</b></div>
        </div>
      </div>

      <section class="royal-hand-panel" aria-label="أوراقك">
        <div class="royal-hand-head"><b>أوراقك الملكية</b><span>13 ورقة</span></div>
        <div class="royal-hand">${state.players[0].hand.map(c=>cardHTML(c,true)).join('')}</div>
      </section>

      <section class="royal-controls">
        <button type="button" data-bid="pass">انسحاب</button>
        <button type="button" data-bid="20">♠ مزايدة 20</button>
        <button type="button" data-bid="play">لعب</button>
        <button type="button" class="royal-bid-main" data-bid="40">♠ مزايدة 40</button>
      </section>
    </main>`;

  screen.querySelectorAll('[data-bid]').forEach(btn=>btn.addEventListener('click',()=>{
    const value=btn.dataset.bid;
    screen.querySelector('.royal-status').textContent=value==='pass'?'تم التمرير — بانتظار اللاعب التالي':`تم اختيار مزايدة ${value}`;
  }));

  screen.querySelectorAll('.royal-card.is-playable').forEach(card=>card.addEventListener('click',()=>{
    screen.querySelectorAll('.royal-card').forEach(c=>c.classList.remove('is-selected'));
    card.classList.add('is-selected');
  }));

  container.replaceChildren(screen);
  return state;
}
