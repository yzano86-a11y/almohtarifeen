import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('..', import.meta.url);
const read = (name) => fs.readFileSync(new URL(name, root), 'utf8');

test('UI runtime launcher is syntactically valid', () => {
  const source = read('ui-enhance.js');
  assert.doesNotThrow(() => new vm.Script(source), 'ui-enhance.js must parse as JavaScript');
  assert.match(source, /function\s+launchGuestFromUI\s*\(/);
  assert.match(source, /window\.launchGuestFromUI\s*=\s*launchGuestFromUI/);
  assert.match(source, /classList\.contains\('main-play'\)/);
  assert.match(source, /text==='الألعاب'/);
  assert.match(source, /text\.includes\('دخول تجريبي'\)/);
});

test('source entrypoints expose the complete guest path', () => {
  const html = read('index.html');
  const app = read('app.js');
  const boot = read('boot.js');
  const engine = read('games/tarneeb/engine.js');

  assert.match(html, /id=["']approvedHome["']/);
  assert.match(html, /onclick=["']guestPlay\(\)["']/);
  assert.match(html, /id=["']game["']/);
  assert.match(app, /window\.guestPlay\s*=\s*\(\)\s*=>/);
  assert.match(app, /async function startGame\(demo\)/);
  assert.match(app, /show\('game',true\)/);
  assert.match(app, /import\('\.\/games\/tarneeb\/engine\.js'\)/);
  assert.match(app, /E\.dealHands\(\)/);
  assert.match(boot, /guestPlay/);
  assert.match(engine, /export function dealHands/);
  assert.match(engine, /export function newState/);
  assert.match(engine, /export function applyBid/);
  assert.match(engine, /export function setTrump/);
  assert.match(engine, /export function applyCard/);
});

test('game shell visibility rules cannot leave Home visible during game', () => {
  const css = read('reference-layout.css');
  const ui = read('ui-enhance.js');
  assert.match(css + ui, /#game\.hidden[^}]*display:none!important/);
  assert.match(css + ui, /#game:not\(\.hidden\)[^}]*display:block!important/);
  assert.match(css + ui, /game-active[^}]*#approvedHome[^}]*display:none!important/);
});
