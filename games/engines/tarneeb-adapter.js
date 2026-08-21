import * as engine from '../tarneeb/engine.js';

// Adapter implementing the unified engine contract for the native Tarneeb engine.
export function createGame(config = {}) {
  const hands = config.hands ?? engine.dealHands();
  return engine.newState(hands, config.bidStart ?? 0, config.scores ?? [0, 0]);
}

export function joinGame(gameId, playerId) {
  return { gameId, playerId, status: 'joined' };
}

export function getState(state, playerId) {
  if (!state?.players?.[playerId]) throw new Error('Invalid player');
  return state;
}

export function applyAction(state, playerId, action) {
  if (!action?.type) throw new Error('Action type is required');
  if (action.type === 'bid') return engine.applyBid(state, playerId, action.value);
  if (action.type === 'trump') return engine.setTrump(state, playerId, action.suit);
  if (action.type === 'card') return engine.applyCard(state, playerId, action.card);
  throw new Error(`Unsupported Tarneeb action: ${action.type}`);
}

export function getLegalActions(state, playerId) {
  if (state.phase === 'bid' && state.bidTurn === playerId) {
    const min = Math.max(7, (state.highBid ?? 6) + 1);
    return [...Array(Math.max(0, 14 - min))].map((_, i) => ({ type: 'bid', value: min + i })).concat({ type: 'bid', value: null });
  }
  if (state.phase === 'trump' && state.bidWinner === playerId) {
    return engine.SUITS.map(suit => ({ type: 'trump', suit }));
  }
  if (state.phase === 'play' && state.turn === playerId) {
    return engine.legalCards(state, playerId).map(card => ({ type: 'card', card }));
  }
  return [];
}

export function isFinished(state) {
  return state?.phase === 'round_end';
}

export { engine };
