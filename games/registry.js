import { startBackgammon } from './backgammon/index.js';
import { startCheckers } from './checkers/index.js';

export const games = {
  tarneeb: {
    id: 'tarneeb',
    name: 'طرنيب'
  },
  backgammon: {
    id: 'backgammon',
    name: 'طاولة الزهر',
    start: startBackgammon
  },
  checkers: {
    id: 'checkers',
    name: 'داما',
    start: startCheckers
  }
};

export function launchGame(id) {
  return games[id]?.start?.();
}
