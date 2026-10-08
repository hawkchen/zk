// Batch 11 FINAL: is the heading/section-label difference in borderlayout-gallery older than this batch? Compare the top 320 CSS px of a fresh DPR-2 full-page shot
// (same capture as RED's probe-borderlayout-page.png: lib.open + fullPage) against RED's file, per 20px row band, with the same per-channel >12 rule used in diff-gallery.js.
const L = require('./lib.js'); const fs = require('fs'); const path = require('path');
const decodeSrc = `async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = 640; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { w: img.width, h: 640, d: Array.from(x.getImageData(0, 0, c.width, 640).data) }; }`;
(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const { ctx, page } = await L.open(browser, 'borderlayout.zul'); await page.screenshot({ path: path.join(__dirname, 'probe-borderlayout-page.png'), fullPage: true });
  const dec = async f => page.evaluate(eval(decodeSrc), fs.readFileSync(f).toString('base64'));
  const R = await dec(path.join(__dirname, '../batch11-red/probe-borderlayout-page.png')); const F = await dec(path.join(__dirname, 'probe-borderlayout-page.png'));
  const bands = []; for (let b = 0; b < 640; b += 40) { let n = 0; for (let y = b; y < b + 40; y++) for (let x = 0; x < Math.min(R.w, F.w); x++) { const i = (y * R.w + x) * 4, j = (y * F.w + x) * 4; if (Math.abs(R.d[i] - F.d[j]) > 12 || Math.abs(R.d[i + 1] - F.d[j + 1]) > 12 || Math.abs(R.d[i + 2] - F.d[j + 2]) > 12) n++; } bands.push({ cssRows: [b / 2, b / 2 + 20], diffDevicePx: n }); }
  const out = { red: [R.w, R.h], final: [F.w, F.h], bands }; console.log(JSON.stringify(out)); fs.writeFileSync(path.join(__dirname, 'probe-bl-top.json'), JSON.stringify(out, null, 1));
  await ctx.close(); await browser.close();
})();
