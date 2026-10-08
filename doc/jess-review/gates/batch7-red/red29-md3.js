// Batch 7 RED, #29: ink size of the MD3 reference arrow in Jess's image ref/jess-29-md3.png (361x136, a menu with
// "Label" rows and a right-pointing solid triangle inside a blue highlight box). Decoded in a blank Chromium page.
// Scale is unknown: two calibrations are recorded (circled icon = 20dp circle of a 24dp Material symbol; row pitch = 48dp menu item).
const L = require('./lib.js');
const fs = require('fs'); const path = require('path');
(async () => {
  const browser = await L.chromium.launch(); const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.setContent('<html><body></body></html>');
  const b64 = fs.readFileSync(path.join(__dirname, 'ref', 'jess-29-md3.png')).toString('base64');
  const r = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await new Promise((ok, no) => { img.onload = ok; img.onerror = no; });
    const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; const at = (px, py) => { const i = (py * c.width + px) * 4; return [d[i], d[i + 1], d[i + 2]]; };
    const lum = ([r, g, b]) => 0.299 * r + 0.587 * g + 0.114 * b;
    const bbox = (x0, x1, y0, y1, pred) => { const pts = []; for (let py = y0; py <= y1; py++) for (let px = x0; px <= x1; px++) if (pred(at(px, py))) pts.push([px, py]);
      if (!pts.length) return { n: 0 }; const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); const l = Math.min(...xs), rr = Math.max(...xs) + 1, t = Math.min(...ys), b = Math.max(...ys) + 1;
      const rows = []; for (let py = t; py < b; py++) rows.push(pts.filter(p => p[1] === py).length); return { n: pts.length, left: l, right: rr, top: t, bottom: b, w: rr - l, h: b - t, cx: (l + rr) / 2, cy: (t + b) / 2, rows }; };
    // the blue highlight box: saturated blue (b high, r low); the dashed purple frame has r > 120
    const isBlue = ([r, g, b]) => b > 190 && r < 110 && g < 170; const dark = cc => lum(cc) < 120 && !isBlue(cc);
    const blue = bbox(0, c.width - 1, 0, c.height - 1, isBlue);
    const arrow = blue.n ? bbox(blue.left + 3, blue.right - 4, blue.top + 3, blue.bottom - 4, dark) : { n: 0 };
    // calibration: circled icon left of the first Label (x < 95), the first/second "Label" text rows
    const icon = bbox(45, 95, 45, 100, dark); const label1 = bbox(96, 170, 45, 100, dark); const label2 = bbox(96, 170, 105, c.height - 1, dark);
    // histogram of the most common colours (sanity: the arrow fill colour, the blue, the background)
    const hist = new Map(); for (let py = 0; py < c.height; py++) for (let px = 0; px < c.width; px++) { const k = at(px, py).map(v => Math.round(v / 8) * 8).join(','); hist.set(k, (hist.get(k) || 0) + 1); }
    return { imgW: c.width, imgH: c.height, blueBox: blue, arrow, icon, label1, label2, topColours: [...hist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8) };
  }, b64);
  const a = r.arrow; const longSide = Math.max(a.w, a.h), shortSide = Math.min(a.w, a.h);
  const sIcon = r.icon.n ? r.icon.h / 20 : null; // circle diameter in px / 20dp
  const sRow = r.label2.n && r.label1.n ? (r.label2.cy - r.label1.cy) / 48 : null;
  r.derived = { pointing: a.w > a.h ? 'down/up (w>h)' : 'right/left (h>w)', longSide, shortSide, aspectLongShort: +(longSide / shortSide).toFixed(3), inkAreaPx: a.n, bboxAreaPx: a.w * a.h,
    scaleFromIcon_20dpCircle: sIcon && +sIcon.toFixed(3), scaleFromRowPitch_48dp: sRow && +sRow.toFixed(3),
    at1x_fromIcon: sIcon ? { long: +(longSide / sIcon).toFixed(2), short: +(shortSide / sIcon).toFixed(2), inkArea: +(a.n / sIcon / sIcon).toFixed(2) } : null,
    at1x_fromRowPitch: sRow ? { long: +(longSide / sRow).toFixed(2), short: +(shortSide / sRow).toFixed(2), inkArea: +(a.n / sRow / sRow).toFixed(2) } : null,
    planNominal1x: { long: 10, short: 5, aspect: 2, filledTriangleInkArea: 25 } };
  L.save('red29-md3.json', r); console.log(JSON.stringify(r, null, 1));
  await browser.close();
})();
