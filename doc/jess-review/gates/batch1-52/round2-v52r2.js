const { launch, open, idle } = require('./common');
const fs = require('fs');
const OUT = __dirname + '/img';
const RED = '/Users/hawk/Documents/workspace/ZK10/zk/doc/jess-review/gates/batch1-red/i52';
const PAD = 4;
function lab([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const R = f(r), G = f(g), B = f(b);
  let X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
  const h = (t) => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  X = h(X); Y = h(Y); Z = h(Z);
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}
function de76(a, b) { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); }
async function decode(dpage, buf) {
  return dpage.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    return { w: img.width, h: img.height, data: Array.from(x.getImageData(0, 0, img.width, img.height).data) };
  }, buf.toString('base64'));
}
const runs = (arr) => { const r = []; let s = -1; arr.forEach((v, i) => { if (v && s < 0) s = i; if (!v && s >= 0) { r.push([s, i - 1]); s = -1; } }); if (s >= 0) r.push([s, arr.length - 1]); return r; };
async function tabInfo(tabLoc) {
  return tabLoc.evaluate((t) => {
    const probe = document.createElement('span'); probe.style.color = 'var(--zk-tab-accent)'; t.appendChild(probe);
    const accent = getComputedStyle(probe).color; probe.remove();
    const tr = t.getBoundingClientRect(); const btn = t.querySelector('.z-tab-button'); const br = btn ? btn.getBoundingClientRect() : null; const tx = t.querySelector('.z-tab-text'); const xr = tx.getBoundingClientRect();
    return { accent, tab: { x: tr.x, y: tr.y, w: tr.width, h: tr.height }, text: { x: xr.x, y: xr.y, w: xr.width, h: xr.height }, button: br ? { x: br.x, y: br.y, w: br.width, h: br.height } : null };
  });
}
async function measureTab(page, dpage, tabLoc, label, side) {
  await tabLoc.scrollIntoViewIfNeeded();
  await page.mouse.move(1279, 899); await idle(page);
  const info = await tabInfo(tabLoc);
  const clip = { x: Math.floor(info.tab.x) - PAD, y: Math.floor(info.tab.y) - PAD, width: Math.ceil(info.tab.w) + 2 * PAD + 1, height: Math.ceil(info.tab.h) + 2 * PAD + 1 };
  const buf = await page.screenshot({ clip });
  fs.writeFileSync(`${OUT}/${label}.png`, buf);
  const img = await decode(dpage, buf);
  const acc = info.accent.match(/\d+(\.\d+)?/g).map(Number).slice(0, 3);
  const px = (x, y) => { const i = (y * img.w + x) * 4; return [img.data[i], img.data[i + 1], img.data[i + 2]]; };
  const bt = info.button ? { x0: info.button.x - clip.x - 1, x1: info.button.x + info.button.w - clip.x + 1, y0: info.button.y - clip.y - 1, y1: info.button.y + info.button.h - clip.y + 1 } : null;
  const inBtn = (x, y) => bt && x >= bt.x0 && x <= bt.x1 && y >= bt.y0 && y <= bt.y1;
  const m = (x, y) => x >= 0 && y >= 0 && x < img.w && y < img.h && de76(px(x, y), acc) <= 3;
  const t = { x0: info.text.x - clip.x, x1: info.text.x + info.text.w - clip.x, y0: info.text.y - clip.y, y1: info.text.y + info.text.h - clip.y };
  const tcx = Math.round((t.x0 + t.x1) / 2 - 0.5), tcy = Math.round((t.y0 + t.y1) / 2 - 0.5);
  const res = { label, side, accent: info.accent, tabRect: info.tab, textRect: info.text, buttonRect: info.button, clip };
  const H = side === 'top' || side === 'bottom';
  // generic: perpendicular scan line through text centre
  const perpLen = H ? img.h : img.w, parLen = H ? img.w : img.h;
  const pc = H ? tcx : tcy; // parallel coordinate of text centre
  const M = (perp, par) => H ? m(par, perp) : m(perp, par);
  const tLo = H ? t.y0 : t.x0, tHi = H ? t.y1 : t.x1;
  const scan = Array.from({ length: perpLen }, (_, k) => M(k, pc));
  const ind = runs(scan).filter(([a, b]) => (b < tLo || a > tHi) && (H || (!inBtn(a, tcy) && !inBtn(b, tcy))));
  res.scanRuns = ind;
  if (!ind.length) return res;
  const outerIsHigh = side === 'top' || side === 'left'; // indicator at bottom (top tabs) / right edge (left tabs)
  const [a, b] = outerIsHigh ? ind[ind.length - 1] : ind[0];
  res.thickness = b - a + 1;
  res.band = [a, b];
  const lineRun = (perp) => runs(Array.from({ length: parLen }, (_, k) => M(perp, k))).find(([s, e]) => s <= pc && e >= pc) || null;
  const outer = outerIsHigh ? b : a, inner = outerIsHigh ? a : b, mid = Math.floor((a + b) / 2);
  res.lines = [];
  for (let k = a; k <= b; k++) { const r = lineRun(k); res.lines.push({ perp: k, role: k === outer ? 'outer' : k === inner ? 'inner' : (k === mid ? 'mid' : ''), run: r, len: r ? r[1] - r[0] + 1 : 0 }); }
  const lm = lineRun(mid), lo = lineRun(outer), li = lineRun(inner);
  res.widthMid = lm ? lm[1] - lm[0] + 1 : 0;
  res.widthOuter = lo ? lo[1] - lo[0] + 1 : 0;
  res.widthInner = li ? li[1] - li[0] + 1 : 0;
  res.textW = info.text.w; res.textH = info.text.h;
  res.textExtentAlong = H ? info.text.w : info.text.h;
  const tcen = H ? (t.x0 + t.x1) / 2 : (t.y0 + t.y1) / 2;
  res.centreDeltaMid = lm ? +Math.abs((lm[0] + lm[1] + 1) / 2 - tcen).toFixed(3) : null;
  res.centreDeltaOuter = lo ? +Math.abs((lo[0] + lo[1] + 1) / 2 - tcen).toFixed(3) : null;
  if (lo) res.corners = { innerStartMatch: M(inner, lo[0]), innerEndMatch: M(inner, lo[1]), outerStartMatch: M(outer, lo[0]), outerEndMatch: M(outer, lo[1]) };
  // pixel colours at ends of each row (for AA inspection)
  res.endPixels = res.lines.map((L) => L.run ? { perp: L.perp, before: (H ? px(L.run[0] - 1, L.perp) : px(L.perp, L.run[0] - 1)).join(','), first: (H ? px(L.run[0], L.perp) : px(L.perp, L.run[0])).join(','), last: (H ? px(L.run[1], L.perp) : px(L.perp, L.run[1])).join(','), after: (H ? px(L.run[1] + 1, L.perp) : px(L.perp, L.run[1] + 1)).join(',') } : null);
  // distance of outer line from tab edge
  const tabEdge = side === 'top' ? PAD + (info.tab.y - clip.y - PAD) + info.tab.h : side === 'bottom' ? info.tab.y - clip.y : side === 'left' ? info.tab.x - clip.x + info.tab.w : info.tab.x - clip.x;
  res.tabOuterEdgeInImg = tabEdge; res.outerLine = outer;
  // indicator line extent within tab?
  const tabParLo = H ? info.tab.x - clip.x : info.tab.y - clip.y, tabParHi = tabParLo + (H ? info.tab.w : info.tab.h);
  res.withinTabAlong = lo ? (lo[0] >= tabParLo - 0.5 && lo[1] <= tabParHi + 0.5) : null;
  let outside = 0; for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (m(x, y) && !inBtn(x, y) && !(x >= t.x0 - 1 && x <= t.x1 + 1 && y >= t.y0 - 1 && y <= t.y1 + 1)) outside++;
  res.accentPixelsOutsideText = outside;
  return res;
}
async function countUnselected(page, dpage, tabLoc, label) {
  await tabLoc.scrollIntoViewIfNeeded(); await page.mouse.move(1279, 899); await idle(page);
  const info = await tabInfo(tabLoc);
  const clip = { x: Math.floor(info.tab.x), y: Math.floor(info.tab.y), width: Math.max(1, Math.floor(info.tab.w)), height: Math.max(1, Math.floor(info.tab.h)) };
  const buf = await page.screenshot({ clip }); fs.writeFileSync(`${OUT}/${label}.png`, buf);
  const img = await decode(dpage, buf); const acc = info.accent.match(/\d+/g).map(Number).slice(0, 3);
  const bt = info.button ? { x0: info.button.x - clip.x - 1, x1: info.button.x + info.button.w - clip.x + 1, y0: info.button.y - clip.y - 1, y1: info.button.y + info.button.h - clip.y + 1 } : null;
  const t = { x0: info.text.x - clip.x - 1, x1: info.text.x + info.text.w - clip.x + 1, y0: info.text.y - clip.y - 1, y1: info.text.y + info.text.h - clip.y + 1 };
  let n = 0; for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) { if (bt && x >= bt.x0 && x <= bt.x1 && y >= bt.y0 && y <= bt.y1) continue; if (x >= t.x0 && x <= t.x1 && y >= t.y0 && y <= t.y1) continue; const k = (y * img.w + x) * 4; if (de76([img.data[k], img.data[k + 1], img.data[k + 2]], acc) <= 3) n++; }
  return { label, accentPixelsInTabOutsideText: n };
}
async function imgDiff(dpage, a, b) {
  return dpage.evaluate(async ([A, B]) => {
    const ld = async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: i.width, h: i.height, d: x.getImageData(0, 0, i.width, i.height).data }; };
    const p = await ld(A), q = await ld(B);
    if (p.w !== q.w || p.h !== q.h) return { sizeA: [p.w, p.h], sizeB: [q.w, q.h], sameSize: false };
    let diff = 0, maxd = 0;
    for (let k = 0; k < p.d.length; k += 4) { const d = Math.max(Math.abs(p.d[k] - q.d[k]), Math.abs(p.d[k + 1] - q.d[k + 1]), Math.abs(p.d[k + 2] - q.d[k + 2])); if (d > 0) { diff++; maxd = Math.max(maxd, d); } }
    return { sameSize: true, size: [p.w, p.h], diffPixels: diff, maxChannelDelta: maxd };
  }, [a.toString('base64'), b.toString('base64')]);
}
async function forcedBox(fpage, fd, boxIdx, side) {
  const box = fpage.locator('.z-tabbox').nth(boxIdx);
  const cnt = await box.locator('.z-tab').count(); const res = [];
  for (let i = 0; i < Math.min(cnt, 3); i++) {
    const l = box.locator('.z-tab').nth(i); await l.scrollIntoViewIfNeeded(); await fpage.mouse.move(1279, 899); await idle(fpage);
    const info = await l.evaluate((t) => { const a = t.getBoundingClientRect(), b = t.querySelector('.z-tab-text').getBoundingClientRect(); return { sel: t.classList.contains('z-tab-selected'), label: t.textContent.trim(), tab: { x: a.x, y: a.y, w: a.width, h: a.height }, text: { x: b.x, y: b.y, w: b.width, h: b.height } }; });
    const clip = { x: Math.floor(info.tab.x) - PAD, y: Math.floor(info.tab.y) - PAD, width: Math.ceil(info.tab.w) + 2 * PAD + 1, height: Math.ceil(info.tab.h) + 2 * PAD + 1 };
    const buf = await fpage.screenshot({ clip }); fs.writeFileSync(`${OUT}/forced-${boxIdx}-${i}.png`, buf);
    const img = await decode(fd, buf);
    const px = (x, y) => { const k = (y * img.w + x) * 4; return [img.data[k], img.data[k + 1], img.data[k + 2]]; };
    const bg = px(PAD + 2, PAD + 2);
    const H = side === 'top' || side === 'bottom';
    let samples = [];
    if (H) {
      const cx = Math.round(info.text.x + info.text.w / 2 - clip.x - 0.5);
      if (side === 'top') { const e = PAD + Math.round(info.tab.h) + (Math.floor(info.tab.y) - Math.floor(info.tab.y)); for (let y = e - 6; y < e; y++) samples.push({ d: y - e, c: px(cx, y) }); }
      else { const e = PAD; for (let y = e; y < e + 6; y++) samples.push({ d: y - e, c: px(cx, y) }); }
    } else {
      const cy = Math.round(info.text.y + info.text.h / 2 - clip.y - 0.5);
      if (side === 'left') { const e = PAD + Math.round(info.tab.w); for (let x = e - 6; x < e; x++) samples.push({ d: x - e, c: px(x, cy) }); }
      else { const e = PAD; for (let x = e; x < e + 6; x++) samples.push({ d: x - e, c: px(x, cy) }); }
    }
    samples = samples.map((s) => ({ d: s.d, c: s.c.join(','), nonBg: de76(s.c, bg) > 3 }));
    res.push({ i, sel: info.sel, label: info.label, bg: bg.join(','), nonBgCount: samples.filter((s) => s.nonBg).length, samples });
  }
  return res;
}
(async () => {
  const browser = await launch();
  const page = await open(browser, '/tabbox.zul');
  const dpage = await page.context().newPage();
  const tb = (i) => page.locator('.z-tabbox').nth(i);
  const out = {};
  out.top = await measureTab(page, dpage, tb(0).locator('.z-tab.z-tab-selected').first(), 'top-selected', 'top');
  for (const [idx, name, side] of [[3, 'vertical', 'left'], [5, 'right', 'right'], [7, 'bottom', 'bottom']]) out[name] = await measureTab(page, dpage, tb(idx).locator('.z-tab.z-tab-selected').first(), name + '-selected', side);
  // closable top tab (box 1/2) and extra closable (b)
  out.closableTop = await measureTab(page, dpage, tb(2).locator('.z-tab.z-tab-selected').first(), 'closable-top-selected', 'top');
  out.unselected = [];
  for (const idx of [0, 2, 3, 5, 7]) {
    const loc = tb(idx).locator('.z-tab:not(.z-tab-selected)');
    const n = Math.min(await loc.count(), 3);
    for (let i = 0; i < n; i++) out.unselected.push({ box: idx, ...(await countUnselected(page, dpage, loc.nth(i), `unsel-${idx}-${i}`)) });
  }
  out.textBaseline = await tb(0).locator('.z-tab').evaluateAll((ts) => ts.map((t) => { const a = t.getBoundingClientRect(), b = t.querySelector('.z-tab-text').getBoundingClientRect(); return { label: t.textContent.trim(), sel: t.classList.contains('z-tab-selected'), textTopRelTab: b.top - a.top, tabH: a.height }; }));
  const acc = page.locator('.z-tabbox-accordion');
  out.accordion = [];
  for (let i = 0; i < await acc.count(); i++) { await acc.nth(i).scrollIntoViewIfNeeded(); await page.mouse.move(1279, 899); await idle(page); const buf = await acc.nth(i).screenshot({ path: `${OUT}/accordion-${i}.png` }); out.accordion.push({ i, ...(await imgDiff(dpage, buf, fs.readFileSync(`${RED}/accordion-${i}.png`))) }); }
  // extra (a)
  {
    const tab = tb(0).locator('.z-tab.z-tab-selected').first();
    await tab.evaluate((t) => { t.querySelector('.z-tab-text').textContent = 'A much longer selected tab label'; t.style.width = '60px'; });
    await idle(page);
    out.extraA = await tab.evaluate((t) => { const tx = t.querySelector('.z-tab-text'); const cs = getComputedStyle(tx); const a = t.getBoundingClientRect(), b = tx.getBoundingClientRect(); return { tabW: a.width, textRelX: b.x - a.x, textW: b.width, textScrollW: tx.scrollWidth, textClientW: tx.clientWidth, textOverflow: cs.textOverflow, overflow: cs.overflow, whiteSpace: cs.whiteSpace }; });
    const r = await measureTab(page, dpage, tab, 'extraA-narrow', 'top');
    out.extraA.indicator = { thickness: r.thickness, widthMid: r.widthMid, widthOuter: r.widthOuter, lines: r.lines, withinTabAlong: r.withinTabAlong, tabSpanInImg: [r.tabRect.x - r.clip.x, r.tabRect.x - r.clip.x + r.tabRect.w], textSpanInImg: [r.textRect.x - r.clip.x, r.textRect.x - r.clip.x + r.textRect.w] };
    const bb = await tab.boundingBox(); await page.screenshot({ path: `${OUT}/extraA-wide.png`, clip: { x: bb.x - 20, y: bb.y - 6, width: bb.width + 140, height: bb.height + 12 } });
  }
  await page.context().close();
  const fpage = await open(browser, '/tabbox.zul', { forcedColors: true });
  const fd = await fpage.context().newPage();
  out.forced = { media: await fpage.evaluate(() => matchMedia('(forced-colors: active)').matches) };
  for (const [idx, side] of [[0, 'top'], [3, 'left'], [5, 'right'], [7, 'bottom']]) out.forced['box' + idx] = await forcedBox(fpage, fd, idx, side);
  await fpage.context().close();
  await browser.close();
  fs.writeFileSync(__dirname + '/v52r2.out.json', JSON.stringify(out, null, 1));
  const S = (r) => r && ({ th: r.thickness, mid: r.widthMid, outer: r.widthOuter, inner: r.widthInner, textAlong: r.textExtentAlong && +r.textExtentAlong.toFixed(2), textW: r.textW && +r.textW.toFixed(2), cMid: r.centreDeltaMid, cOut: r.centreDeltaOuter, corners: r.corners, lines: r.lines && r.lines.map(l => `${l.perp}${l.role ? '(' + l.role + ')' : ''}:${l.len}${l.run ? '[' + l.run + ']' : ''}`).join(' '), scanRuns: JSON.stringify(r.scanRuns), outerLine: r.outerLine, tabEdge: r.tabOuterEdgeInImg, within: r.withinTabAlong });
  for (const k of ['top', 'bottom', 'vertical', 'right', 'closableTop']) console.log(k, JSON.stringify(S(out[k])));
  console.log('unsel', JSON.stringify(out.unselected));
  console.log('textBaseline', JSON.stringify(out.textBaseline));
  console.log('accordion', JSON.stringify(out.accordion));
  console.log('extraA', JSON.stringify(out.extraA));
  console.log('forced media', out.forced.media);
  for (const k of ['box0', 'box3', 'box5', 'box7']) console.log('forced', k, JSON.stringify(out.forced[k].map(t => ({ i: t.i, sel: t.sel, label: t.label, n: t.nonBgCount, s: t.samples.map(s => s.c).join(' | ') }))));
})();
