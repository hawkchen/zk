module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');
const BASE = 'http://127.0.0.1:8085';
const NOANIM = '*,*::before,*::after{transition:none!important;animation:none!important}';

async function open(browser, path, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, ...opts });
  const page = await ctx.newPage();
  await page.goto(BASE + '/' + path, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: NOANIM });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(300);
  return { ctx, page };
}

async function settle(page) {
  await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading && !(zAu && zAu.processing && zAu.processing()), null, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
}

// in-page helpers installed per page
const HELPERS = `
window.__probe = function(bgExpr, fgExpr, parent) {
  const d = document.createElement('div');
  d.style.cssText = 'position:absolute;left:-9999px;top:0;width:10px;height:10px;background-color:' + bgExpr + ';color:' + fgExpr;
  (parent || document.body).appendChild(d);
  const cs = getComputedStyle(d);
  const r = { bg: cs.backgroundColor, fg: cs.color };
  d.remove();
  return r;
};
window.__isTransparent = c => c === 'transparent' || /rgba\\(.*,\\s*0\\)$/.test(c);
window.__painter = function(el) {
  if (!__isTransparent(getComputedStyle(el).backgroundColor)) return el;
  const all = el.querySelectorAll('*');
  for (const c of all) if (!__isTransparent(getComputedStyle(c).backgroundColor)) return c;
  return null;
};
window.__desc = function(el) {
  if (!el) return null;
  return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + '.' + [...el.classList].join('.');
};
`;

async function helpers(page) { await page.evaluate(HELPERS); }

module.exports = { chromium, BASE, open, settle, helpers };
