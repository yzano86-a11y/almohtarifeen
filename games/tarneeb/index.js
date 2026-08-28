import { dealHands, newState } from './engine.js';

const NAMES=['أنت','الملك','الأميرة','الفارس'];
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
      <div class="tarneeb-round">الجولة 1<br><b>المزايدة</b></div>
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
          <div class="royal-status">دور المزايدة — اختر مزايدتك</div>
        </div>
      </div>

      <section class="royal-hand-panel" aria-label="أوراقك">
        <div class="royal-hand-head"><b>أوراقك</b><span>13 ورقة</span></div>
        <div class="royal-hand">${state.players[0].hand.map(c=>cardHTML(c,true)).join('')}</div>
      </section>

      <section class="royal-controls">
        <button type="button" data-bid="pass">تمرير</button>
        <button type="button" data-bid="7">7</button>
        <button type="button" data-bid="8">8</button>
        <button type="button" data-bid="9">9</button>
        <button type="button" data-bid="10">10</button>
        <button type="button" class="royal-bid-main" data-bid="11">مزايدة 11</button>
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
