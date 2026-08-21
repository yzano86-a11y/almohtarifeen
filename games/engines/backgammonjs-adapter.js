// Adapter contract for the MIT-licensed quasoft/backgammonjs engine.
// The third-party source remains isolated from the Al-Mohtarifeen app layer.
// Source: https://github.com/quasoft/backgammonjs

export const BACKGAMMON_ENGINE = {
  id: 'backgammonjs',
  license: 'MIT',
  source: 'quasoft/backgammonjs',
  multiplayer: true,
  createGame(config = {}) {
    return { engine: 'backgammonjs', config, status: 'ready' };
  },
  joinGame(game, playerId) {
    return { ...game, playerId };
  },
  getState(game) {
    return game;
  },
  applyAction(game, playerId, action) {
    return { ...game, lastAction: { playerId, action } };
  },
  getLegalActions() {
    return [];
  },
  isFinished() {
    return false;
  }
};
