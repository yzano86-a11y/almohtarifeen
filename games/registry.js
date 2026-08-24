import { startBackgammon } from './backgammon/index.js';

export const games = {
  tarneeb: {
    id: 'tarneeb',
    name: 'طرنيب'
  },
  backgammon: {
    id: 'backgammon',
    name: 'طاولة الزهر',
    start: startBackgammon
  }
};

export function launchGame(id) {
  return games[id]?.start?.();
}
