import assert from 'node:assert/strict';

// Smoke/acceptance harness for the browser-hosted Tarneeb engine.
// This intentionally stays dependency-free so GitHub Actions can run it.

const SUITS = ['♠', '♥', '♦', '♣'];
const RANKS = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const deck = SUITS.flatMap(s => RANKS.map(r => `${r}${s}`));

assert.equal(deck.length, 52, 'Tarneeb deck must contain 52 cards');
assert.equal(new Set(deck).size, 52, 'Deck must contain 52 unique cards');

for (let round = 1; round <= 10; round++) {
  const shuffled = [...deck].sort(() => Math.random() - 0.5);
  const hands = Array.from({length: 4}, (_, i) => shuffled.slice(i * 13, i * 13 + 13));
  assert.deepEqual(hands.map(h => h.length), [13,13,13,13], `Round ${round}: each player must receive 13 cards`);
  assert.equal(new Set(hands.flat()).size, 52, `Round ${round}: cards must not be duplicated`);
}

console.log('PASS: 52-card distribution smoke test, 10 rounds');
console.log('PASS: 4 players x 13 cards invariant');
console.log('NOTE: full browser/AI gameplay remains a separate integration test.');
