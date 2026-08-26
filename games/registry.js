import { startTarneeb } from './tarneeb/index.js';
import { startBackgammon } from './backgammon/index.js';
import { startCheckers } from './checkers/index.js';

export const games = {
  tarneeb: { id:'tarneeb', name:'طرنيب', start:startTarneeb },
  backgammon: { id:'backgammon', name:'طاولة الزهر', start:startBackgammon },
  checkers: { id:'checkers', name:'داما', start:startCheckers }
};

export function launchGame(id){
  const game = games[id];
  if (!game?.start) throw new Error(`Game launcher unavailable: ${id}`);
  return game.start();
}
