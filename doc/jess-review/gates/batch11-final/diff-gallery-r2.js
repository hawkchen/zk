// Batch 11 FINAL R2: borderlayout-gallery only (same capture + per-channel >12 rule as diff-gallery.js), after the BL1 size change. (1) panel-gallery: expected vs actual with row-shift compensation (0/2/4px) so the +4px page growth
// does not mask where the real pixel changes are. (2) borderlayout-gallery: gallery-scan passed under maxDiffPixelRatio 0.01 — capture the same wrapper shot
// (Desktop Chrome 1280x720, DPR 1, animations disabled) and count the pixels that differ from doc/screenshots/borderlayout-gallery.png, by row band.
// PNG decoding is done in a blank Chromium page via canvas (no pngjs in node_modules). Nothing is written to doc/screenshots.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs'), path = require('path'); const { chromium, devices } = require('@playwright/test');
const BASE = process.env.PREVIEW_URL || 'http://localhost:8085'; const OUT = __dirname;
const SNAP = '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/doc/screenshots';
const b64 = f => fs.readFileSync(f).toString('base64');
const decodeSrc = `async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { w: img.width, h: img.height, d: Array.from(x.getImageData(0, 0, c.width, c.height).data) }; }`;
(async () => {
  const browser = await chromium.launch(); const out = {};
  const blank = await browser.newPage();
  const dec = async (file) => blank.evaluate(eval(decodeSrc), b64(file));
  const rowDiff = (E, A, y, ya) => { if (ya < 0 || ya >= A.h) return E.w; let n = 0; const w = Math.min(E.w, A.w); for (let x = 0; x < w; x++) { const i = (y * E.w + x) * 4, j = (ya * A.w + x) * 4; if (Math.abs(E.d[i] - A.d[j]) > 12 || Math.abs(E.d[i + 1] - A.d[j + 1]) > 12 || Math.abs(E.d[i + 2] - A.d[j + 2]) > 12) n++; } return n; };
  // (2) borderlayout gallery, same capture as gallery-scan
  { const ctx = await browser.newContext({ ...devices['Desktop Chrome'] }); const page = await ctx.newPage(); await page.goto(BASE + '/borderlayout.zul', { waitUntil: 'networkidle' }); await page.evaluate(() => document.fonts.ready.then(() => true)); await page.addStyleTag({ content: '*{transition-duration:0s !important}' });
    const buf = await page.locator('.z-p-8').first().screenshot({ animations: 'disabled' }); fs.writeFileSync(path.join(OUT, 'pw-visual/borderlayout-gallery-actual-r2.png'), buf); await ctx.close();
    const E = await dec(path.join(SNAP, 'borderlayout-gallery.png')); const A = await dec(path.join(OUT, 'pw-visual/borderlayout-gallery-actual-r2.png'));
    const rows = []; for (let y = 0; y < Math.min(E.h, A.h); y++) rows.push({ y, diff: rowDiff(E, A, y, y) });
    const bands = []; let cur = null; for (const r of rows) { if (r.diff > 0) { if (cur && r.y <= cur.y1 + 2) { cur.y1 = r.y; cur.px += r.diff; } else { cur = { y0: r.y, y1: r.y, px: r.diff }; bands.push(cur); } } }
    const total = rows.reduce((a, r) => a + r.diff, 0); out.borderlayout = { expected: [E.w, E.h], actual: [A.w, A.h], diffPixels: total, ratio: +(total / (E.w * E.h)).toFixed(4), bands }; }
  await browser.close(); fs.writeFileSync(path.join(OUT, 'diff-gallery-r2.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
})();
