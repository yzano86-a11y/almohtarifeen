// Backgammon game launcher
// Integrated as an independent game module.

export function startBackgammon() {
  const game = document.getElementById('game');
  if (!game) return;

  game.classList.remove('hidden');
  game.dataset.activeGame = 'backgammon';

  const title = game.querySelector('.game-title strong');
  if (title) title.textContent = 'Backgammon';
}

export default {
  startBackgammon
};
