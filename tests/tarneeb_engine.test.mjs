import assert from 'node:assert/strict';
import {
  SUITS,
  RANKS,
  createDeck,
  dealHands,
  newState,
  applyBid,
  setTrump,
  legalCards,
  isLegalCard,
  applyCard,
  trickWinner,
} from '../games/tarneeb/engine.js';

// Tarneeb acceptance/integration tests. These are dependency-free and run in Node.

const deck = createDeck();
assert.equal(deck.length, 52, 'Deck must contain exactly 52 cards');
assert.equal(new Set(deck.map(c => `${c.r}${c.s}`)).size, 52, 'Deck must contain 52 unique cards');
assert.equal(SUITS.length, 4, 'There must be four suits');
assert.equal(RANKS.length, 13, 'There must be thirteen ranks');

// Distribution gate: 100 fresh deals, 4 players x 13 cards, no duplicates.
for (let round = 1; round <= 100; round++) {
  const hands = dealHands();
  assert.equal(hands.length, 4, `Deal ${round}: four players required`);
  assert.deepEqual(hands.map(h => h.length), [13, 13, 13, 13], `Deal ${round}: 13 cards per player`);
  assert.equal(new Set(hands.flat().map(c => `${c.r}${c.s}`)).size, 52, `Deal ${round}: no duplicate cards`);
}

// Rule gate: an explicit trick where trump beats the lead suit.
const spade = { s: '♠', r: 'A', v: 14 };
const heartTrump = { s: '♥', r: '2', v: 2 };
const lowSpade = { s: '♠', r: 'K', v: 13 };
const offSuit = { s: '♦', r: 'A', v: 14 };
assert.equal(trickWinner([
  { player: 0, card: spade },
  { player: 1, card: heartTrump },
  { player: 2, card: lowSpade },
  { player: 3, card: offSuit },
], '♠', '♥'), 1, 'Trump must beat the lead suit');

// Full-game gate: simulate 100 complete rounds through the real engine.
for (let game = 1; game <= 100; game++) {
  const hands = dealHands();
  let state = newState(hands, 0, [0, 0]);

  // Player 0 bids 8; everyone else passes.
  state = applyBid(state, 0, 8);
  state = applyBid(state, 1, null);
  state = applyBid(state, 2, null);
  state = applyBid(state, 3, null);
  assert.equal(state.phase, 'trump', `Game ${game}: bidding must finish`);
  assert.equal(state.bidWinner, 0, `Game ${game}: bidder must be player 0`);
  assert.equal(state.highBid, 8, `Game ${game}: bid must be 8`);

  // Choose a legal trump: the suit held most often by the bidder.
  const counts = Object.fromEntries(SUITS.map(s => [s, 0]));
  for (const card of state.players[0].hand) counts[card.s]++;
  const trump = SUITS.reduce((best, s) => counts[s] > counts[best] ? s : best, SUITS[0]);
  state = setTrump(state, 0, trump);
  assert.equal(state.phase, 'play', `Game ${game}: play phase must start`);
  assert.equal(state.trump, trump, `Game ${game}: trump must be set`);

  let safety = 0;
  while (state.phase === 'play') {
    const player = state.turn;
    const legal = legalCards(state, player);
    assert.ok(legal.length > 0, `Game ${game}: current player must have a legal card`);
    const card = legal[0];
    assert.equal(isLegalCard(state, player, card), true, `Game ${game}: engine must accept selected legal card`);
    const before = state.players[player].hand.length;
    state = applyCard(state, player, card);
    assert.equal(state.players[player].hand.length, before - 1, `Game ${game}: exactly one card removed`);
    safety++;
    assert.ok(safety <= 52, `Game ${game}: play loop exceeded 52 cards`);
  }

  assert.equal(state.phase, 'round_end', `Game ${game}: round must finish after 13 tricks`);
  assert.equal(state.trickNo, 13, `Game ${game}: exactly 13 tricks required`);
  assert.deepEqual(state.players.map(p => p.hand.length), [0, 0, 0, 0], `Game ${game}: all hands must be empty`);
  assert.equal(state.players.reduce((sum, p) => sum + p.tricks, 0), 13, `Game ${game}: exactly 13 tricks awarded`);
  assert.equal(state.roundResult.made + state.roundResult.other, 13, `Game ${game}: round trick accounting must total 13`);
}

console.log('PASS: 52-card / 4-player / 13-card distribution — 100 deals');
console.log('PASS: trump and trick-winner rule gate');
console.log('PASS: complete Tarneeb engine simulation — 100 full games');
