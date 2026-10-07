// #35 method probe: is the plan's IoU able to tell IDENTICAL glyphs apart from different ones?
// Today sort-desc (z-icon-caret-down), column menu (z-icon-caret-down) and group-open (z-icon-angle-down)
// all paint the same SVG path "m6 9 6 6 6-6". Compare plan-literal IoU with two corrected variants.
const { chromium, open, settle, dE } = require('./lib');
const fs = require('fs');
const DIR = __dirname;

async function grab(page, locator, dpr) {
  const b = await locator.boundingBox();
  const clip = { x: Math.floor(b.x - 2), y: Math.floor(b.y - 2), width: Math.ceil(b.width + 4), height: Math.ceil(b.height + 4) };
  const buf = await page.screenshot({ clip });
  const r = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    return { w: img.width, h: img.height, d: Array.from(x.getImageData(0, 0, c.width, c.height).data) };
  }, buf.toString('base64'));
  // inner = element box itself in image pixels (drops the 2px margin)
  const ox = (b.x - clip.x) * dpr, oy = (b.y - clip.y) * dpr;
  return { ...r, box: b, inner: { x0: Math.floor(ox), y0: Math.floor(oy), x1: Math.ceil(ox + b.width * dpr), y1: Math.ceil(oy + b.height * dpr) } };
}
function bgOf(g) { const m = new Map(); for (let i = 0; i < g.d.length; i += 4) { const k = g.d[i] + ',' + g.d[i + 1] + ',' + g.d[i + 2]; m.set(k, (m.get(k) || 0) + 1); } return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0].split(',').map(Number); }
function inkGrid(g, onlyInner) {
  const bg = bgOf(g); const ink = [];
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) {
    const i = (y * g.w + x) * 4; let v = dE([g.d[i], g.d[i + 1], g.d[i + 2]], bg) > 10 ? 1 : 0;
    if (onlyInner && (x < g.inner.x0 || x >= g.inner.x1 || y < g.inner.y0 || y >= g.inner.y1)) v = 0;
    ink.push(v);
  }
  return ink;
}
// plan literal: area-average downscale whole clip to 16x16 then threshold (approximated: cell is ink if any covered px is ink)
function downscale(ink, w, h, x0, y0, x1, y1) {
  const out = []; const W = x1 - x0, H = y1 - y0;
  for (let gy = 0; gy < 16; gy++) for (let gx = 0; gx < 16; gx++) {
    const sx0 = x0 + Math.floor(gx * W / 16), sx1 = x0 + Math.max(Math.floor((gx + 1) * W / 16), Math.floor(gx * W / 16) + 1);
    const sy0 = y0 + Math.floor(gy * H / 16), sy1 = y0 + Math.max(Math.floor((gy + 1) * H / 16), Math.floor(gy * H / 16) + 1);
    let n = 0, t = 0; for (let y = sy0; y < sy1; y++) for (let x = sx0; x < sx1; x++) { t++; n += ink[y * w + x] || 0; }
    out.push(n / t >= 0.5 ? 1 : 0);
  }
  return out;
}
function normalized(g) {
  const ink = inkGrid(g, true);
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < g.h; y++) for (let x = 0; x < g.w; x++) if (ink[y * g.w + x]) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x + 1); y1 = Math.max(y1, y + 1); }
  if (x1 < 0) return null;
  // pad to a square around the ink bbox so aspect ratio is kept
  const s = Math.max(x1 - x0, y1 - y0), cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const X0 = Math.round(cx - s / 2), Y0 = Math.round(cy - s / 2);
  return downscale(ink, g.w, g.h, X0, Y0, X0 + s, Y0 + s);
}
const iou = (a, b) => { if (!a || !b) return null; let i = 0, u = 0; for (let k = 0; k < a.length; k++) { if (a[k] && b[k]) i++; if (a[k] || b[k]) u++; } return u ? +(i / u).toFixed(3) : null; };
function shiftIou(a, b, r = 2) { let best = 0; for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const s = new Array(256).fill(0); for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const X = x + dx, Y = y + dy; if (X >= 0 && X < 16 && Y >= 0 && Y < 16) s[Y * 16 + X] = b[y * 16 + x]; } best = Math.max(best, iou(a, s) || 0); } return +best.toFixed(3); }

async function collect(browser, dpr) {
  const o = { deviceScaleFactor: dpr };
  const G = {};
  { const { ctx, page } = await open(browser, 'grid-grouping.zul', o); await page.mouse.move(1270, 890);
    G.group = await grab(page, page.locator('.z-group-icon i').first(), dpr);
    // calibration probes: a different shape (arrow) rendered at the same size as the group icon, OUTSIDE any component
    for (const c of ['z-icon-arrow-down', 'z-icon-arrow-up']) {
      const ok = await page.evaluate(c => { const i = document.createElement('i'); i.className = c; i.id = 'probe-' + c; i.style.cssText = 'position:fixed;left:600px;top:20px;font-size:14px;background:#fff'; document.body.appendChild(i); return getComputedStyle(i, '::before').maskImage !== 'none' || getComputedStyle(i, '::before').content !== 'none'; }, c);
      if (ok) G['probe-' + c] = await grab(page, page.locator('#probe-' + c), dpr);
      await page.evaluate(c => document.getElementById('probe-' + c).remove(), c);
    }
    await ctx.close(); }
  const { ctx, page } = await open(browser, 'grid.zul', o);
  const th = page.locator('.z-grid').nth(1).locator('th.z-column').nth(1);
  for (const st of ['asc', 'desc']) {
    await th.locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page);
    await th.hover({ position: { x: 60, y: 10 } }); await page.waitForTimeout(150);
    G[st + '-sort'] = await grab(page, th.locator('.z-column-sorticon i'), dpr);
    G[st + '-menu'] = await grab(page, th.locator('.z-column-button i'), dpr);
  }
  await ctx.close();
  return G;
}

(async () => {
  const browser = await chromium.launch();
  const pairs = [['desc-sort', 'desc-menu', 'same glyph'], ['desc-sort', 'group', 'same glyph'], ['desc-menu', 'group', 'same glyph'], ['asc-sort', 'asc-menu', 'different'], ['asc-sort', 'group', 'different'], ['asc-sort', 'desc-sort', 'different'], ['probe-z-icon-arrow-down', 'desc-menu', 'different (arrow vs caret)'], ['probe-z-icon-arrow-down', 'group', 'different (arrow vs angle)'], ['probe-z-icon-arrow-down', 'probe-z-icon-arrow-up', 'different']];
  const res = {};
  for (const dpr of [1, 4]) {
    const G = await collect(browser, dpr);
    const lit = {}, norm = {};
    for (const [k, g] of Object.entries(G)) { const ink = inkGrid(g, false); lit[k] = downscale(ink, g.w, g.h, 0, 0, g.w, g.h); norm[k] = normalized(g); }
    res['dpr' + dpr] = pairs.map(([a, b, kind]) => ({ a, b, kind, literal: iou(lit[a], lit[b]), literalShift2: lit[a] && lit[b] ? shiftIou(lit[a], lit[b]) : null, inkBoxNormalized: iou(norm[a], norm[b]) }));
    res['dpr' + dpr + '-boxes'] = Object.fromEntries(Object.entries(G).map(([k, g]) => [k, g.box]));
    res['dpr' + dpr + '-normMasks'] = Object.fromEntries(Object.entries(norm).map(([k, m]) => [k, m ? Array.from({ length: 16 }, (_, r) => m.slice(r * 16, r * 16 + 16).join('')) : null]));
  }
  fs.writeFileSync(DIR + '/i35-method.json', JSON.stringify(res, null, 1));
  for (const d of ['dpr1', 'dpr4']) { console.log(d); for (const p of res[d]) console.log(' ', p.a, 'vs', p.b, '[' + p.kind + ']', 'literal', p.literal, 'shift±2', p.literalShift2, 'normalized', p.inkBoxNormalized); }
  await browser.close();
})();
