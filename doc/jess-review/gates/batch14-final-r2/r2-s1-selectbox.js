// Batch 14 FINAL R2 — S1: selectbox picker arrow under forced-colors emulation after the rule moved into
// tokens/_forced-colors.css. Pixel ink of the arrow (dE >= 8 vs the control's own background) for the first
// three .z-selectbox on selectbox.zul, in normal mode and under forcedColors:'active'; plus a replica of the
// chromium `selectbox › gallery` element shot compared pixel-by-pixel with the committed baseline.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const L = require('./lib.js');
const fs = require('fs');
const path = require('path');
const { PNG } = require('playwright-core/lib/utilsBundle');

function ink(S, x0, x1, y0, y1, base, thr = 8) {
  const px = S.rect(x0, x1, y0, y1).filter(p => L.dE(p.c, base) >= thr);
  if (!px.length) return { n: 0 };
  let dark = px[0]; for (const p of px) if (p.c[0] + p.c[1] + p.c[2] < dark.c[0] + dark.c[1] + dark.c[2]) dark = p;
  const minx = Math.min(...px.map(p => p.dx)), maxx = Math.max(...px.map(p => p.dx)), miny = Math.min(...px.map(p => p.dy)), maxy = Math.max(...px.map(p => p.dy));
  return { n: px.length, l: minx / S.dpr, r: (maxx + 1) / S.dpr, t: miny / S.dpr, b: (maxy + 1) / S.dpr, w: (maxx + 1 - minx) / S.dpr, h: (maxy + 1 - miny) / S.dpr,
    cx: +((minx + maxx + 1) / 2 / S.dpr).toFixed(2), cy: +((miny + maxy + 1) / 2 / S.dpr).toFixed(2), darkest: dark.c, median: L.median(px.map(p => p.c)) };
}

async function geom(page, i) {
  return page.evaluate((i) => {
    const el = document.querySelectorAll('.z-selectbox')[i]; if (!el) return null;
    el.scrollIntoView({ block: 'center' });
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el), pi = getComputedStyle(el, '::picker-icon');
    return { tag: el.tagName, cls: el.className, disabled: el.disabled, rect: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height },
      appearance: cs.appearance, bg: cs.backgroundColor, color: cs.color, border: cs.borderTopColor + ' ' + cs.borderTopWidth,
      pickerIcon: { bg: pi.backgroundColor, color: pi.color, w: pi.width, h: pi.height, mask: (pi.maskImage || pi.webkitMaskImage || '').slice(0, 80), content: pi.content, fca: pi.forcedColorAdjust },
      forced: matchMedia('(forced-colors: active)').matches };
  }, i);
}

async function measure(page, mode, out) {
  out[mode] = [];
  for (let i = 0; i < 3; i++) {
    const g0 = await geom(page, i); if (!g0) break; await page.waitForTimeout(100); const g = await geom(page, i);
    const R = g.rect; const pad = 6;
    const S = await L.shot(page, `s1-selectbox-${mode}-${i}.png`, { x: R.l - pad, y: R.t - pad, width: R.w + 2 * pad, height: R.h + 2 * pad });
    // control background: median of the right half interior (border excluded by 3px); the arrow is a minority of pixels
    const base = L.median(S.rect(R.r - 40, R.r - 3, R.t + 3, R.b - 4).map(p => p.c));
    const arrow = ink(S, R.r - 40, R.r - 3, R.t + 3, R.b - 4, base, 8);
    const borderPx = S.at(Math.round((R.l + 10) * S.dpr), Math.round(R.t * S.dpr)); // top border colour at x=l+10
    const outside = S.at(Math.round((R.l + 10) * S.dpr), Math.round((R.t - 3) * S.dpr));
    out[mode].push({ i, geom: g, base, arrow, borderPx, outside, arrowFromRight: arrow.n ? +(R.r - arrow.r).toFixed(2) : null, arrowCyOffset: arrow.n ? +(arrow.cy - (R.t + R.b) / 2).toFixed(2) : null });
    console.log(`${mode} selectbox[${i}] ${g.tag}.${g.cls.split(' ')[0]} disabled=${g.disabled} rect ${R.w.toFixed(1)}x${R.h.toFixed(1)} appearance=${g.appearance} bg=${g.bg} picker bg=${g.pickerIcon.bg} color=${g.pickerIcon.color} ${g.pickerIcon.w}x${g.pickerIcon.h} fca=${g.pickerIcon.fca} | px base ${base} arrow n=${arrow.n} ${arrow.w}x${arrow.h} @ (${arrow.l},${arrow.t}) fromRight ${R.r - arrow.r} darkest ${arrow.darkest} median ${arrow.median}; border px ${borderPx} outside ${outside}`);
  }
}

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, viewport: '1280x900', dpr: 2, chromium: browser.version(), date: new Date().toISOString() } };
  { const { ctx, page } = await L.open(browser, 'web/selectbox.zul'); await measure(page, 'normal', out); await ctx.close(); }
  { const { ctx, page } = await L.open(browser, 'web/selectbox.zul', { forcedColors: 'active' }); await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(300); await measure(page, 'forced', out); await ctx.close(); }
  for (let i = 0; i < out.normal.length; i++) {
    const a = out.normal[i].arrow, b = out.forced[i].arrow;
    console.log(`selectbox[${i}] arrow box normal ${a.w}x${a.h} @(${a.l},${a.t}) vs forced ${b.w}x${b.h} @(${b.l},${b.t}) -> dw ${+(b.w - a.w).toFixed(2)} dh ${+(b.h - a.h).toFixed(2)} dl ${+(b.l - a.l).toFixed(2)} dt ${+(b.t - a.t).toFixed(2)}`);
  }
  // ───── replica of chromium `selectbox › gallery`: Desktop Chrome (1280x720, dpr 1), element shot of .z-p-8, vs the committed baseline ─────
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(L.BASE + '/web/selectbox.zul', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const buf = await page.locator('.z-p-8').first().screenshot({ animations: 'disabled' });
    fs.writeFileSync(path.join(L.OUT, 's1-selectbox-gallery-replica.png'), buf);
    const A = PNG.sync.read(buf);
    const baseFile = '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/doc/screenshots/selectbox-gallery.png';
    const E = PNG.sync.read(fs.readFileSync(baseFile));
    const w = Math.min(A.width, E.width), h = Math.min(A.height, E.height);
    let any = 0, thr = 0; const rows = new Array(h).fill(0);
    const yiq = (r, g, b) => 0.29889531 * r + 0.58662247 * g + 0.11448223 * b;
    const delta = (a, b) => { const y1 = yiq(...a), y2 = yiq(...b); const i1 = 0.59597799 * a[0] - 0.27417610 * a[1] - 0.32180189 * a[2], i2 = 0.59597799 * b[0] - 0.27417610 * b[1] - 0.32180189 * b[2]; const q1 = 0.21147017 * a[0] - 0.52261711 * a[1] + 0.31114694 * a[2], q2 = 0.21147017 * b[0] - 0.52261711 * b[1] + 0.31114694 * b[2]; return 0.5053 * (y1 - y2) ** 2 + 0.299 * (i1 - i2) ** 2 + 0.1957 * (q1 - q2) ** 2; };
    const maxDelta = 35215 * 0.05 * 0.05;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * E.width + x) * 4, j = (y * A.width + x) * 4; const a = [E.data[i], E.data[i + 1], E.data[i + 2]], b = [A.data[j], A.data[j + 1], A.data[j + 2]]; if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) { any++; if (delta(a, b) > maxDelta) { thr++; rows[y]++; } } }
    const bands = []; let cur = null; for (let y = 0; y < h; y++) if (rows[y]) { if (cur && y - cur.y1 <= 8) { cur.y1 = y; cur.n += rows[y]; } else { cur = { y0: y, y1: y, n: rows[y] }; bands.push(cur); } }
    out.galleryReplica = { baseline: baseFile, expected: { w: E.width, h: E.height }, actual: { w: A.width, h: A.height }, diffAny: any, diffThr005: thr, bands };
    console.log(`gallery replica vs baseline: expected ${E.width}x${E.height} actual ${A.width}x${A.height}; any-diff ${any} px, thr .05 ${thr} px; bands ${bands.map(b => `y${b.y0}-${b.y1} (${b.n})`).join(', ') || 'none'}`);
    await ctx.close();
  }
  // ───── forced-colors replica of forced-colors-gallery (NOT run as a spec): Desktop Chrome, .z-p-8 element shot under
  // emulateMedia, compared with the review artifact doc/screenshots/selectbox-forced-colors.png (mtime 2026-10-07, i.e.
  // captured BEFORE A #29 changed the arrow glyph) — the diff is reported, not judged.
  {
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto(L.BASE + '/web/selectbox.zul', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const wrapper = page.locator('.z-p-8').first();
    const buf = await wrapper.screenshot({ animations: 'disabled' });
    fs.writeFileSync(path.join(L.OUT, 's1-selectbox-forced-replica.png'), buf);
    const rects = await page.evaluate(() => { const w = document.querySelector('.z-p-8').getBoundingClientRect(); return [...document.querySelectorAll('.z-selectbox')].slice(0, 3).map(e => { const r = e.getBoundingClientRect(); return { l: r.left - w.left, t: r.top - w.top, r: r.right - w.left, b: r.bottom - w.top }; }); });
    const A = PNG.sync.read(buf);
    const baseFile = '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/doc/screenshots/selectbox-forced-colors.png';
    const E = PNG.sync.read(fs.readFileSync(baseFile));
    const px = (P, x, y) => { const i = (y * P.width + x) * 4; return [P.data[i], P.data[i + 1], P.data[i + 2]]; };
    const inkOf = (P, R) => { const pts = []; for (let y = Math.ceil(R.t + 3); y < Math.floor(R.b - 3); y++) for (let x = Math.ceil(R.r - 40); x < Math.floor(R.r - 3); x++) { const c = px(P, x, y); if (L.dE(c, [255, 255, 255]) >= 8) pts.push({ x, y, c }); } if (!pts.length) return { n: 0 }; const xs = pts.map(p => p.x), ys = pts.map(p => p.y); return { n: pts.length, l: Math.min(...xs), r: Math.max(...xs) + 1, t: Math.min(...ys), b: Math.max(...ys) + 1, w: Math.max(...xs) + 1 - Math.min(...xs), h: Math.max(...ys) + 1 - Math.min(...ys), darkest: L.median(pts.map(p => p.c)) }; };
    const w = Math.min(A.width, E.width), h = Math.min(A.height, E.height); let any = 0; const rows = new Array(h).fill(0);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = px(E, x, y), b = px(A, x, y); if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) { any++; rows[y]++; } }
    const bands = []; let cur = null; for (let y = 0; y < h; y++) if (rows[y]) { if (cur && y - cur.y1 <= 8) { cur.y1 = y; cur.n += rows[y]; } else { cur = { y0: y, y1: y, n: rows[y] }; bands.push(cur); } }
    out.forcedReplica = { reference: baseFile, expected: { w: E.width, h: E.height }, actual: { w: A.width, h: A.height }, diffAny: any, bands, arrows: rects.map((R, i) => ({ i, rect: R, now: inkOf(A, R), reference_oct07: E.width === A.width && E.height === A.height ? inkOf(E, R) : null })) };
    console.log(`forced replica (dpr1) vs doc/screenshots/selectbox-forced-colors.png (2026-10-07): ${E.width}x${E.height} vs ${A.width}x${A.height}; any-diff ${any} px; bands ${bands.map(b => `y${b.y0}-${b.y1} (${b.n})`).join(', ') || 'none'}`);
    for (const a of out.forcedReplica.arrows) console.log(`  selectbox[${a.i}] arrow ink dpr1 now ${a.now.n ? `${a.now.w}x${a.now.h} @(${a.now.l},${a.now.t}) ${a.now.darkest}` : 'none'} | oct-07 artifact ${a.reference_oct07 ? (a.reference_oct07.n ? `${a.reference_oct07.w}x${a.reference_oct07.h} @(${a.reference_oct07.l},${a.reference_oct07.t}) ${a.reference_oct07.darkest}` : 'none') : 'n/a (size differs)'}`);
    await ctx.close();
  }
  L.save('r2-s1-selectbox.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
