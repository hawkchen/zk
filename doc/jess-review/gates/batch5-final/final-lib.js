// Shared helpers for the batch 5 FINAL gate (copied unchanged from batch5-red/lib.js) (cascader/chosenbox/combobox, #8 #12 #13 #16 #17). Copied from batch4-red/lib.js.
// Measurement only: pixels + hit tests, no CSS property reads for judgments.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');
const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:8085';
const NOANIM = '*,*::before,*::after{transition:none!important;animation:none!important}';
const OUT = __dirname;

async function open(browser, pagePath, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, ...opts });
  const page = await ctx.newPage();
  await page.goto(BASE + '/' + pagePath, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: NOANIM });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading, null, { timeout: 15000 }).catch(() => {});
  await page.mouse.move(2, 2); // keep the pointer off every widget (rest state)
  await page.waitForTimeout(400);
  return { ctx, page };
}

async function settle(page) {
  await page.waitForFunction(() => window.zk && !zk.processing && !zk.loading && !(window.zAu && zAu.processing && zAu.processing()), null, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(400);
}

// Geometry of one biglistbox, located by its ZK component id (DOM ids are uuids).
// H = head-outer box, B = body-outer box, R = inner right edge (= .z-biglistbox-outer right).
async function geom(page, zid) {
  return page.evaluate((zid) => {
    const w = zk.$('$' + zid); const n = w.$n();
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const outer = n.querySelector('.z-biglistbox-outer');
    const ths = [...n.querySelectorAll('th.z-biglistbox-header')];
    const headTable = n.querySelector('.z-biglistbox-head table');
    const bodyTable = n.querySelector('.z-biglistbox-body table');
    return {
      zid, uuid: n.id, box: R(n), inner: R(outer), H: R(n.querySelector('.z-biglistbox-head-outer')), B: R(n.querySelector('.z-biglistbox-body-outer')),
      R: outer.getBoundingClientRect().right,
      colsRight: Math.max(headTable ? headTable.getBoundingClientRect().right : 0, bodyTable ? bodyTable.getBoundingClientRect().right : 0),
      nTh: ths.length, lastTh: R(ths[ths.length - 1]),
    };
  }, zid);
}

// Screenshot of a CSS-px clip at DPR 2, decoded to RGBA via the page's canvas (transferred as base64).
// Coordinates passed to at()/rect() stay in viewport CSS px; the clip origin is subtracted internally.
async function shot(page, file, clip) {
  clip = clip || { x: 0, y: 0, width: 1280, height: 900 };
  clip = { x: Math.floor(clip.x), y: Math.floor(clip.y), width: Math.ceil(clip.width), height: Math.ceil(clip.height) };
  // clamp to the viewport: Playwright silently clamps a negative origin, which would shift the pixel indexing
  if (clip.x < 0) { clip.width += clip.x; clip.x = 0; } if (clip.y < 0) { clip.height += clip.y; clip.y = 0; }
  clip.width = Math.min(clip.width, 1280 - clip.x); clip.height = Math.min(clip.height, 900 - clip.y);
  const buf = await page.screenshot({ clip });
  if (file) fs.writeFileSync(path.join(OUT, file), buf);
  const px = await page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data; let s = '';
    for (let i = 0; i < d.length; i += 0x8000) s += String.fromCharCode.apply(null, d.subarray(i, i + 0x8000));
    return { w: img.width, h: img.height, b64: btoa(s) };
  }, buf.toString('base64'));
  const d = Buffer.from(px.b64, 'base64');
  const dpr = px.w / clip.width;
  const at = (dx, dy) => { const i = ((Math.round(dy) - clip.y * dpr) * px.w + (Math.round(dx) - clip.x * dpr)) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  const rect = (x0, x1, y0, y1) => { // viewport CSS px, inclusive ranges -> device pixels {dx,dy,x,y,c}
    const out = []; for (let dy = Math.round(y0 * dpr); dy < Math.round((y1 + 1) * dpr); dy++) for (let dx = Math.round(x0 * dpr); dx < Math.round((x1 + 1) * dpr); dx++) out.push({ dx, dy, x: dx / dpr, y: dy / dpr, c: at(dx, dy) });
    return out; };
  return { dpr, at, rect, w: px.w, h: px.h, clip };
}

function lab([r, g, b]) {
  const f = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  let R = f(r), G = f(g), B = f(b);
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const h = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  X = h(X); Y = h(Y); Z = h(Z);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
function dE(a, b) { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); }
function median(colors) {
  const ch = i => { const v = colors.map(c => c[i]).sort((a, b) => a - b); return v[Math.floor(v.length / 2)]; };
  return [ch(0), ch(1), ch(2)];
}
// worst pixel of a sample set against a reference colour
function worst(samples, ref) {
  let m = { dE: -1 }; for (const s of samples) { const d = dE(s.c, ref); if (d > m.dE) m = { dE: +d.toFixed(2), x: s.x, y: s.y, c: s.c }; } return m;
}
function parseRgb(s) { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(parseFloat); return v; }
// composite rgba over white (sRGB, simple alpha)
function over(rgba, bg = [255, 255, 255]) { const a = rgba.length > 3 ? rgba[3] : 1; return rgba.slice(0, 3).map((v, i) => Math.round(v * a + bg[i] * (1 - a))); }

function save(name, obj) { fs.writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 1)); }

module.exports = { chromium, BASE, OUT, open, settle, geom, shot, dE, median, worst, parseRgb, over, save };

// Pixel-scan a thumb inside a band (CSS px, inclusive). Thumb pixels = dE(base) >= thr.
// Returns extents (CSS px), core colour (median of interior), cross-axis size and edge distance.
// axis 'v': band is a vertical lane, size = width, edge = distance from thumb right edge to `edge` (R).
// axis 'h': band is a horizontal lane, size = height, edge = distance from thumb bottom edge to `edge` (bottom).
function scanThumb(S, band, base, axis, edge, thr = 8) {
  const px = S.rect(band.x0, band.x1, band.y0, band.y1);
  const isHit = p => dE(p.c, base) >= thr;
  // longest contiguous run along the thumb's long axis, per device line; the line with the longest run holds the thumb
  // (1px grid lines of the same colour crossing the lane are short runs and are ignored)
  const key = axis === 'v' ? 'dx' : 'dy', along = axis === 'v' ? 'dy' : 'dx';
  const lines = new Map(); for (const p of px) { if (!lines.has(p[key])) lines.set(p[key], []); lines.get(p[key]).push(p); }
  const cands = [];
  for (const [k, arr] of lines) { arr.sort((a, b) => a[along] - b[along]); let run = [], bestRun = [];
    for (const p of arr) { if (isHit(p) && (!run.length || p[along] === run[run.length - 1][along] + 1)) run.push(p); else { if (run.length > bestRun.length) bestRun = run; run = isHit(p) ? [p] : []; } }
    if (run.length > bestRun.length) bestRun = run; if (bestRun.length > 2) cands.push({ k, run: bestRun }); }
  // a thumb is at least 3 device px thick: the run's midpoint must also be a hit two lines away on both sides
  // (rejects 1px grid lines of the same colour that cross the lane and would otherwise be the longest run)
  const gridMap = new Map(); for (const p of px) gridMap.set(p.dx + ',' + p.dy, p);
  const atKA = (k, a) => axis === 'v' ? gridMap.get(k + ',' + a) : gridMap.get(a + ',' + k);
  let best = null;
  for (const c of cands) { const m = c.run[Math.floor(c.run.length / 2)][along]; const thick = [-2, 2].every(o => { const q = atKA(c.k + o, m); return q && isHit(q); });
    if (thick && (!best || c.run.length > best.run.length)) best = c; }
  if (!best) return { found: false, n: 0, note: cands.length ? 'only thin (<3 device px) runs found' : '' };
  const a0 = best.run[0][along], a1 = best.run[best.run.length - 1][along];
  // cross-axis extent: walk outward from the best line at the along-axis midpoint while pixels are hits
  const mid = Math.round((a0 + a1) / 2);
  const grid = new Map(); for (const p of px) grid.set(p.dx + ',' + p.dy, p);
  const at = (k, a) => axis === 'v' ? grid.get(k + ',' + a) : grid.get(a + ',' + k);
  let c0 = best.k, c1 = best.k;
  while (at(c0 - 1, mid) && isHit(at(c0 - 1, mid))) c0--;
  while (at(c1 + 1, mid) && isHit(at(c1 + 1, mid))) c1++;
  // all hits inside the thumb's extents
  const hits = px.filter(p => isHit(p) && p[along] >= a0 && p[along] <= a1 && p[key] >= c0 && p[key] <= c1);
  const minx = Math.min(...hits.map(p => p.dx)), maxx = Math.max(...hits.map(p => p.dx));
  const miny = Math.min(...hits.map(p => p.dy)), maxy = Math.max(...hits.map(p => p.dy));
  const core = hits.filter(p => p.dx > minx + 2 && p.dx < maxx - 2 && p.dy > miny + 2 && p.dy < maxy - 2);
  const color = median((core.length ? core : hits).map(p => p.c));
  const midx = Math.round((minx + maxx) / 2), midy = Math.round((miny + maxy) / 2);
  const line = axis === 'v' ? px.filter(p => p.dy === midy) : px.filter(p => p.dx === midx);
  const on = line.filter(p => dE(p.c, color) < dE(p.c, base));
  const size = on.length / S.dpr;
  const far = axis === 'v' ? (Math.max(...on.map(p => p.dx)) + 1) / S.dpr : (Math.max(...on.map(p => p.dy)) + 1) / S.dpr;
  // rounded corner: first device row (v) / column (h) of the thumb; ends not thumb colour, centre thumb colour
  const first = axis === 'v' ? px.filter(p => p.dy === miny && p.dx >= minx && p.dx <= maxx) : px.filter(p => p.dx === minx && p.dy >= miny && p.dy <= maxy);
  const ends = [first[0], first[first.length - 1]].map(p => +dE(p.c, color).toFixed(2));
  const centre = first[Math.floor(first.length / 2)];
  const rounded = { endsDE: ends, centreDE: +dE(centre.c, color).toFixed(2), ok: ends.every(d => d > 3) && dE(centre.c, color) <= 3 };
  return { found: true, n: hits.length, color, size, edgeDistance: +(edge - far).toFixed(2), rounded, midLine: on.map(p => p.c[0]),
    top: miny / S.dpr, bottom: (maxy + 1) / S.dpr, left: minx / S.dpr, right: (maxx + 1) / S.dpr };
}
module.exports.scanThumb = scanThumb;
