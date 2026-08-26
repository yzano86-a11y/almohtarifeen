import test from 'node:test';
import assert from 'node:assert/strict';

test('checkers integration module loads and exposes launcher', async () => {
  const mod = await import('../games/checkers/index.js');
  assert.equal(typeof mod.startCheckers, 'function');
});
