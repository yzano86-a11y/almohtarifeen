import { dealHands, newState } from './engine.js';

export function startTarneeb(container = document.getElementById('app')) {
  if (!container) throw new Error('Tarneeb container not found');

  const hands = dealHands();
  const state = newState(hands);

  const screen = document.createElement('section');
  screen.className = 'tarneeb-screen';
  screen.dataset.game = 'tarneeb';
  screen.innerHTML = `
    <div class="tarneeb-header">
      <h2>طرنيب</h2>
      <p>اللعبة جاهزة — 4 لاعبين، 13 ورقة لكل لاعب</p>
    </div>
    <div class="tarneeb-table" role="application" aria-label="طاولة طرنيب">
      <div class="tarneeb-status">دور المزايدة — اللاعب ${state.bidTurn + 1}</div>
      <div class="tarneeb-hands"></div>
    </div>`;

  const handsEl = screen.querySelector('.tarneeb-hands');
  state.players.forEach((player, index) => {
    const hand = document.createElement('div');
    hand.className = 'tarneeb-player';
    hand.innerHTML = `<strong>اللاعب ${index + 1}</strong><span>${player.hand.length} ورقة</span>`;
    handsEl.appendChild(hand);
  });

  container.replaceChildren(screen);
  return state;
}
