import { chromium } from 'playwright';

const url = process.env.LIVE_APP_URL || 'https://almohtarifeen.yzano86.workers.dev/';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
page.on('console', message => {
  if (message.type() === 'error') errors.push(`console: ${message.text()}`);
});

try {
  const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  if (!response?.ok()) throw new Error(`Live app HTTP status: ${response?.status()}`);

  await page.locator('#approvedHome').waitFor({ state: 'visible', timeout: 10000 });
  const guest = page.locator('#approvedHome button.main-play');
  await guest.waitFor({ state: 'visible', timeout: 10000 });
  if (!(await page.evaluate(() => typeof window.guestPlay === 'function'))) {
    throw new Error('window.guestPlay is not a function on the deployed page');
  }

  await guest.click({ timeout: 10000 });
  await page.locator('#game').waitFor({ state: 'visible', timeout: 10000 });
  await page.locator('#roundLabel').waitFor({ state: 'visible', timeout: 10000 });

  const visibility = await page.evaluate(() => {
    const home = document.getElementById('approvedHome');
    const game = document.getElementById('game');
    const homeStyle = home ? getComputedStyle(home) : null;
    const gameStyle = game ? getComputedStyle(game) : null;
    const homeRect = home?.getBoundingClientRect();
    const gameRect = game?.getBoundingClientRect();
    return {
      homeHiddenClass: home?.classList.contains('hidden') ?? false,
      homeDisplay: homeStyle?.display ?? 'missing',
      homeZ: homeStyle?.zIndex ?? 'auto',
      homeRect: homeRect ? { x: homeRect.x, y: homeRect.y, w: homeRect.width, h: homeRect.height } : null,
      gameHiddenClass: game?.classList.contains('hidden') ?? true,
      gameDisplay: gameStyle?.display ?? 'missing',
      gameZ: gameStyle?.zIndex ?? 'auto',
      gameRect: gameRect ? { x: gameRect.x, y: gameRect.y, w: gameRect.width, h: gameRect.height } : null,
      gameActive: document.body.classList.contains('game-active')
    };
  });

  if (!visibility.gameActive) throw new Error(`game-active class missing: ${JSON.stringify(visibility)}`);
  if (visibility.homeDisplay !== 'none') throw new Error(`approvedHome is still displayed over the game: ${JSON.stringify(visibility)}`);
  if (visibility.gameDisplay === 'none') throw new Error(`game is hidden after guest play: ${JSON.stringify(visibility)}`);
  if (!visibility.gameRect || visibility.gameRect.width < 200 || visibility.gameRect.height < 300) {
    throw new Error(`game shell has an invalid viewport size: ${JSON.stringify(visibility)}`);
  }

  const screenshotPath = 'live-guest-success.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  if (errors.length) throw new Error(`Browser errors detected: ${errors.join(' | ')}`);
  console.log(`LIVE GUEST SMOKE PASSED: ${url}`);
  console.log(`Verified visual takeover: ${JSON.stringify(visibility)}`);
  console.log(`Success screenshot: ${screenshotPath}`);
} catch (error) {
  console.error(`LIVE GUEST SMOKE FAILED: ${error.message}`);
  if (errors.length) console.error(errors.join('\n'));
  await page.screenshot({ path: 'live-guest-failure.png', fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
