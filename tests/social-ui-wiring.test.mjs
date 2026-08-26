import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const registry = await readFile(new URL('../games/registry.js', import.meta.url), 'utf8');

test('main entrypoint wires the social hub and Messenger', () => {
  assert.match(html, /id="socialHub"/);
  assert.match(html, /id="socialTitle"/);
  assert.match(html, /id="socialStatus"/);
  assert.match(html, /id="socialContent"/);
  assert.match(html, /src="\.\/social-ui\.js"/);
  assert.match(html, /src="\.\/chat-ui\.js"/);
  assert.match(html, /window\.openSocial\('profile'\)/);
  assert.match(html, /window\.openMessages\(\)/);
});

test('main entrypoint keeps the three game launchers', () => {
  assert.match(html, /data-game="tarneeb"/);
  assert.match(html, /data-game="backgammon"/);
  assert.match(html, /data-game="checkers"/);
  assert.match(html, /import\('\.\/games\/registry\.js'\)/);
  assert.match(registry, /tarneeb/);
  assert.match(registry, /backgammon/);
  assert.match(registry, /checkers/);
});
