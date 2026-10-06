module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8085';
const NOANIM = '*,*::before,*::after{transition:none!important;animation:none!important}';
async function launch() {
  const browser = await chromium.launch();
  return browser;
}
async function open(browser, path, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...(opts.ctx || {}) });
  const page = await ctx.newPage();
  if (opts.forcedColors) await page.emulateMedia({ forcedColors: 'active' });
  await page.goto(BASE + path, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.zk && !zk.processing && !(window.zAu && zAu.processing && zAu.processing()), null, { timeout: 15000 }).catch(() => {});
  await page.addStyleTag({ content: NOANIM });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
  return page;
}
async function idle(page) {
  await page.waitForTimeout(150);
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(100);
}
async function cursorAt(page, x, y) {
  return page.evaluate(([x, y]) => {
    const el = document.elementFromPoint(x, y);
    if (!el) return { cursor: null, el: null };
    return { cursor: getComputedStyle(el).cursor, el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '') };
  }, [x, y]);
}
module.exports = { chromium, BASE, NOANIM, launch, open, idle, cursorAt };
