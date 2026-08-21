import assert from 'node:assert/strict';
import { createGame, getLegalActions, applyAction, isFinished } from '../games/engines/tarneeb-adapter.js';

let state = createGame({ bidStart: 0 });
assert.equal(state.players.length, 4);
assert.deepEqual(state.players.map(p => p.hand.length), [13, 13, 13, 13]);
assert.ok(getLegalActions(state, 0).some(a => a.value === 7));
assert.equal(getLegalActions(state, 1).length, 0);

state = applyAction(state, 0, { type: 'bid', value: 8 });
state = applyAction(state, 1, { type: 'bid', value: null });
state = applyAction(state, 2, { type: 'bid', value: null });
state = applyAction(state, 3, { type: 'bid', value: null });
assert.equal(state.phase, 'trump');
assert.equal(getLegalActions(state, 0).length, 4);
state = applyAction(state, 0, { type: 'trump', suit: state.players[0].hand[0].s });
assert.equal(state.phase, 'play');

let moves = 0;
while (!isFinished(state)) {
  const player = state.turn;
  const legal = getLegalActions(state, player);
  assert.ok(legal.length > 0);
  state = applyAction(state, player, legal[0]);
  moves++;
  assert.ok(moves <= 52);
}
assert.equal(state.trickNo, 13);
console.log('PASS: unified Tarneeb adapter — complete 52-card game');
