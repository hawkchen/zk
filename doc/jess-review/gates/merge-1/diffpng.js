// Pixel diff of two PNGs via a Chromium canvas (no pngjs in the tree). Usage: node diffpng.js expected.png actual.png [label]
// Prints size, first/last differing row, count of differing pixels, and the differing-row histogram in 100px bands.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs'); const { chromium } = require('@playwright/test');
(async () => {
  const [a, b, label] = process.argv.slice(2);
  const browser = await chromium.launch(); const page = await browser.newPage();
  const r = await page.evaluate(async ([ea, eb]) => {
    const load = async (b64) => { const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode(); const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0); return { w: img.width, h: img.height, d: x.getImageData(0, 0, img.width, img.height).data }; };
    const A = await load(ea), B = await load(eb);
    const w = Math.min(A.w, B.w), h = Math.min(A.h, B.h); let n = 0, first = -1, last = -1; const rows = new Map(); const bands = {};
    let minx = 1e9, maxx = -1;
    for (let y = 0; y < h; y++) { let rn = 0; for (let x = 0; x < w; x++) { const i = (y * A.w + x) * 4, j = (y * B.w + x) * 4; const d = Math.max(Math.abs(A.d[i] - B.d[j]), Math.abs(A.d[i + 1] - B.d[j + 1]), Math.abs(A.d[i + 2] - B.d[j + 2])); if (d > 8) { rn++; if (x < minx) minx = x; if (x > maxx) maxx = x; } } if (rn) { n += rn; if (first < 0) first = y; last = y; rows.set(y, rn); const k = Math.floor(y / 100) * 100; bands[k] = (bands[k] || 0) + rn; } }
    return { A: [A.w, A.h], B: [B.w, B.h], n, first, last, minx, maxx, bands, firstRows: [...rows.entries()].slice(0, 8) };
  }, [fs.readFileSync(a).toString('base64'), fs.readFileSync(b).toString('base64')]);
  await browser.close();
  console.log(label || '', 'expected', r.A, 'actual', r.B, 'diffPixels(>8)', r.n, 'rows', r.first, '..', r.last, 'x', r.minx, '..', r.maxx, 'bands', JSON.stringify(r.bands), 'firstRows', JSON.stringify(r.firstRows));
})().catch(e => { console.error(e); process.exit(1); });
