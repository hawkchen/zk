// Pixel cross-check for #25: from the captured PNGs (not the DOM), find the tip box (dark bg (45,55,72)) and the thumb
// (primary blue) bounding boxes and compare their centres. Usage: node pixcheck25.js
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs'); const path = require('path'); const { chromium } = require('@playwright/test');
const L = require('./lib');
const files = ['final25-s0-value5.png', 'final25-s0-value50.png', 'final25-s0-value100.png', 'final25-s1-value100.png', 'final25-s2-value100.png', 'final25-s3-value5.png', 'final25-s3-value50.png', 'final25-s3-value100.png', 'final25-s4-value100.png'];
(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  const out = {};
  for (const f of files) {
    const r = await page.evaluate(async (b64) => {
      const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height).data;
      const box = (pred) => { let l = 1e9, t = 1e9, rr = -1, b = -1, n = 0; for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) { const i = (y * c.width + xx) * 4; if (pred(d[i], d[i + 1], d[i + 2])) { n++; if (xx < l) l = xx; if (xx > rr) rr = xx; if (y < t) t = y; if (y > b) b = y; } } return n ? { l, t, r: rr + 1, b: b + 1, n, cx: (l + rr + 1) / 2, cy: (t + b + 1) / 2 } : null; };
      const near = (r, g, b, R, G, B, tol) => Math.abs(r - R) <= tol && Math.abs(g - G) <= tol && Math.abs(b - B) <= tol;
      const tip = box((r, g, b) => near(r, g, b, 45, 55, 72, 12));          // tip background
      const thumb = box((r, g, b) => near(r, g, b, 55, 111, 208, 14));      // primary blue (thumb + filled track)
      return { w: c.width, h: c.height, tip, thumb };
    }, fs.readFileSync(path.join(__dirname, f)).toString('base64'));
    out[f] = r;
    console.log(f, 'png', r.w + 'x' + r.h, 'tip', JSON.stringify(r.tip), 'blue', JSON.stringify(r.thumb));
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'pixcheck25.json'), JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
