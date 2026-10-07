module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');
const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:8085';
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
  await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading && !(window.zAu && zAu.processing && zAu.processing()), null, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
}

// decode a PNG buffer to {w,h,d} using the page's canvas
async function pixels(page, buf) {
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    return { w: img.width, h: img.height, d: Array.from(x.getImageData(0, 0, c.width, c.height).data) };
  }, buf.toString('base64'));
}

// CIE76 deltaE on sRGB
function lab([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  let R = f(r), G = f(g), B = f(b);
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const h = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  X = h(X); Y = h(Y); Z = h(Z);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
function dE(a, b) { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); }

module.exports = { chromium, BASE, open, settle, pixels, dE };
