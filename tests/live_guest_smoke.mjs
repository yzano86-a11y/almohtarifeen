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

  if (errors.length) throw new Error(`Browser errors detected: ${errors.join(' | ')}`);
  console.log(`LIVE GUEST SMOKE PASSED: ${url}`);
} catch (error) {
  console.error(`LIVE GUEST SMOKE FAILED: ${error.message}`);
  if (errors.length) console.error(errors.join('\n'));
  await page.screenshot({ path: 'live-guest-failure.png', fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  await browser.close();
}
