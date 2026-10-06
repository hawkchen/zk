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
async function measureTab(page, dpage, tabLoc, label, side) {
  await tabLoc.scrollIntoViewIfNeeded();
  await page.mouse.move(1279, 899); await idle(page);
  const info = await tabLoc.evaluate((t) => {
    const probe = document.createElement('span'); probe.style.color = 'var(--zk-tab-accent)'; t.appendChild(probe);
    const accent = getComputedStyle(probe).color; probe.remove();
    const tr = t.getBoundingClientRect(); const btn = t.querySelector('.z-tab-button'); const br = btn ? btn.getBoundingClientRect() : null; const tx = t.querySelector('.z-tab-text'); const xr = tx.getBoundingClientRect();
    return { accent, tab: { x: tr.x, y: tr.y, w: tr.width, h: tr.height }, text: { x: xr.x, y: xr.y, w: xr.width, h: xr.height }, button: br ? { x: br.x, y: br.y, w: br.width, h: br.height } : null, tabboxCls: t.closest('.z-tabbox').className };
  });
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
  const res = { label, side, accent: info.accent, tabboxCls: info.tabboxCls, tabRect: info.tab, textRect: info.text, clip };
  const horizontal = side === 'top' || side === 'bottom';
  // pick the run nearest the outer edge (side), outside text and button boxes
  if (horizontal) {
    const col = Array.from({ length: img.h }, (_, y) => m(tcx, y));
    const ind = runs(col).filter(([a, b]) => b < t.y0 || a > t.y1);
    res.scanRuns = ind;
    if (!ind.length) return res;
    const [a, b] = side === 'top' ? ind[ind.length - 1] : ind[0];
    res.thickness = b - a + 1;
    const rowRun = (y) => runs(Array.from({ length: img.w }, (_, x) => m(x, y))).find(([s, e]) => s <= tcx && e >= tcx);
    const mid = Math.floor((a + b) / 2);
    const rr = rowRun(mid);
    res.width = rr ? rr[1] - rr[0] + 1 : 0; res.textExtent = info.text.w;
    res.indicatorCentre = rr ? (rr[0] + rr[1] + 1) / 2 : null; res.textCentre = (t.x0 + t.x1) / 2;
    res.centreDelta = rr ? +Math.abs(res.indicatorCentre - res.textCentre).toFixed(3) : null;
    const outer = side === 'top' ? b : a, inner = side === 'top' ? a : b;
    const or = rowRun(outer), ir = rowRun(inner);
    res.outerRowRun = or; res.innerRowRun = ir;
    if (or) res.corners = { innerStartMatch: m(or[0], inner), innerEndMatch: m(or[1], inner), outerStartMatch: m(or[0], outer), outerEndMatch: m(or[1], outer) };
    res.rowsInImg = [a, b]; res.tabEdgeInImg = side === 'top' ? PAD + info.tab.h : PAD;
  } else {
    const row = Array.from({ length: img.w }, (_, x) => m(x, tcy));
    const ind = runs(row).filter(([a, b]) => (b < t.x0 || a > t.x1) && !inBtn(a, tcy) && !inBtn(b, tcy));
    res.scanRuns = ind;
    if (!ind.length) return res;
    const [a, b] = side === 'left' ? ind[ind.length - 1] : ind[0];
    res.thickness = b - a + 1;
    const colRun = (x) => runs(Array.from({ length: img.h }, (_, y) => m(x, y))).find(([s, e]) => s <= tcy && e >= tcy);
    const mid = Math.floor((a + b) / 2);
    const cr = colRun(mid);
    res.width = cr ? cr[1] - cr[0] + 1 : 0; res.textExtent = info.text.h; res.textWidthAlongX = info.text.w;
    res.indicatorCentre = cr ? (cr[0] + cr[1] + 1) / 2 : null; res.textCentre = (t.y0 + t.y1) / 2;
    res.centreDelta = cr ? +Math.abs(res.indicatorCentre - res.textCentre).toFixed(3) : null;
    const outer = side === 'left' ? b : a, inner = side === 'left' ? a : b;
    const oc = colRun(outer), ic = colRun(inner);
    res.outerColRun = oc; res.innerColRun = ic;
    if (oc) res.corners = { innerStartMatch: m(inner, oc[0]), innerEndMatch: m(inner, oc[1]), outerStartMatch: m(outer, oc[0]), outerEndMatch: m(outer, oc[1]) };
    res.colsInImg = [a, b]; res.tabEdgeInImg = side === 'left' ? PAD + info.tab.w : PAD;
  }
  let outside = 0; for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (m(x, y) && !inBtn(x, y) && !(x >= t.x0 - 1 && x <= t.x1 + 1 && y >= t.y0 - 1 && y <= t.y1 + 1)) outside++;
  res.accentPixelsOutsideText = outside;
  return res;
}
async function countOutside(page, dpage, tabLoc, label) {
  // unselected tab: accent pixels anywhere in tab box (+PAD) outside text/button
  const r = await measureTab(page, dpage, tabLoc, label, 'top');
  return { label, accentPixelsOutsideText: r.accentPixelsOutsideText, scanRuns: r.scanRuns };
}
async function imgDiff(dpage, a, b) {
  return dpage.evaluate(async ([A, B]) => {
    const ld = async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: i.width, h: i.height, d: x.getImageData(0, 0, i.width, i.height).data }; };
    const p = await ld(A), q = await ld(B);
    if (p.w !== q.w || p.h !== q.h) return { sizeA: [p.w, p.h], sizeB: [q.w, q.h], sameSize: false };
    let diff = 0, maxd = 0; const boxes = { x0: 1e9, y0: 1e9, x1: -1, y1: -1 };
    for (let k = 0; k < p.d.length; k += 4) { const d = Math.max(Math.abs(p.d[k] - q.d[k]), Math.abs(p.d[k + 1] - q.d[k + 1]), Math.abs(p.d[k + 2] - q.d[k + 2])); if (d > 0) { diff++; maxd = Math.max(maxd, d); const i = k / 4, x = i % p.w, y = Math.floor(i / p.w); boxes.x0 = Math.min(boxes.x0, x); boxes.y0 = Math.min(boxes.y0, y); boxes.x1 = Math.max(boxes.x1, x); boxes.y1 = Math.max(boxes.y1, y); } }
    return { sameSize: true, size: [p.w, p.h], diffPixels: diff, maxChannelDelta: maxd, bbox: diff ? boxes : null };
  }, [a.toString('base64'), b.toString('base64')]);
}
(async () => {
  const browser = await launch();
  const page = await open(browser, '/tabbox.zul');
  const dpage = await page.context().newPage();
  const tb = (i) => page.locator('.z-tabbox').nth(i);
  const out = {};
  out.boxes = await page.evaluate(() => [...document.querySelectorAll('.z-tabbox')].map((b, i) => i + ': ' + b.className));
  out.top = await measureTab(page, dpage, tb(0).locator('.z-tab.z-tab-selected').first(), 'top-selected', 'top');
  for (const [idx, name, side] of [[3, 'vertical', 'left'], [5, 'right', 'right'], [7, 'bottom', 'bottom']]) out[name] = await measureTab(page, dpage, tb(idx).locator('.z-tab.z-tab-selected').first(), name + '-selected', side);
  // unselected tabs in each tabbox: accent pixels outside text/button
  out.unselected = [];
  for (const idx of [0, 3, 5, 7]) {
    const loc = tb(idx).locator('.z-tab:not(.z-tab-selected)');
    const n = Math.min(await loc.count(), 3);
    for (let i = 0; i < n; i++) out.unselected.push({ box: idx, ...(await countOutside(page, dpage, loc.nth(i), `unsel-${idx}-${i}`)) });
  }
  out.textBaseline = await tb(0).locator('.z-tab').evaluateAll((ts) => ts.map((t) => { const a = t.getBoundingClientRect(), b = t.querySelector('.z-tab-text').getBoundingClientRect(); return { label: t.textContent.trim(), textTopRelTab: b.top - a.top, tabH: a.height }; }));
  const acc = page.locator('.z-tabbox-accordion');
  out.accordion = [];
  const na = await acc.count();
  for (let i = 0; i < na; i++) { await acc.nth(i).scrollIntoViewIfNeeded(); await page.mouse.move(1279, 899); await idle(page); const buf = await acc.nth(i).screenshot({ path: `${OUT}/accordion-${i}.png` }); out.accordion.push({ i, ...(await imgDiff(dpage, buf, fs.readFileSync(`${RED}/accordion-${i}.png`))) }); }
  // extra: narrow selected tab with long label
  {
    const tab = tb(0).locator('.z-tab.z-tab-selected').first();
    await tab.evaluate((t) => { const tx = t.querySelector('.z-tab-text'); tx.textContent = 'A much longer selected tab label'; t.style.width = '60px'; });
    await idle(page);
    out.extra = await tab.evaluate((t) => { const tx = t.querySelector('.z-tab-text'); const cs = getComputedStyle(tx), ct = getComputedStyle(t); const a = t.getBoundingClientRect(), b = tx.getBoundingClientRect(); return { tabW: a.width, textRect: { x: b.x - a.x, w: b.width }, textScrollW: tx.scrollWidth, textClientW: tx.clientWidth, textOverflow: cs.textOverflow, overflow: cs.overflow, whiteSpace: cs.whiteSpace, display: cs.display, tabOverflow: ct.overflow, tabTextOverflow: ct.textOverflow }; });
    const r = await measureTab(page, dpage, tab, 'extra-narrow', 'top');
    out.extra.indicator = { thickness: r.thickness, width: r.width, outerRowRun: r.outerRowRun, scanRuns: r.scanRuns, tabSpanInImg: [PAD, PAD + r.tabRect.w], textW: r.textRect.w };
    // full-row extent of accent pixels at indicator rows (anywhere in the clip)
    if (r.rowsInImg) {
      const buf = fs.readFileSync(`${OUT}/extra-narrow.png`); const img = await decode(dpage, buf); const accn = r.accent.match(/\d+/g).map(Number);
      const ext = []; for (let y = r.rowsInImg[0]; y <= r.rowsInImg[1]; y++) { let lo = 1e9, hi = -1; for (let x = 0; x < img.w; x++) { const k = (y * img.w + x) * 4; if (de76([img.data[k], img.data[k + 1], img.data[k + 2]], accn) <= 3) { lo = Math.min(lo, x); hi = Math.max(hi, x); } } ext.push([y, lo, hi]); }
      out.extra.indicator.rowExtents = ext;
    }
    // larger screenshot for visual
    const bb = await tab.boundingBox(); await page.screenshot({ path: `${OUT}/extra-narrow-wide.png`, clip: { x: bb.x - 20, y: bb.y - 6, width: bb.width + 140, height: bb.height + 12 } });
  }
  await page.context().close();
  // forced colours
  const fpage = await open(browser, '/tabbox.zul', { forcedColors: true });
  const fd = await fpage.context().newPage();
  out.forced = { media: await fpage.evaluate(() => matchMedia('(forced-colors: active)').matches), tabs: [] };
  const ftb = fpage.locator('.z-tabbox').first();
  const cnt = await ftb.locator('.z-tab').count();
  for (let i = 0; i < cnt; i++) {
    const l = ftb.locator('.z-tab').nth(i); await l.scrollIntoViewIfNeeded(); await fpage.mouse.move(1279, 899); await idle(fpage);
    const info = await l.evaluate((t) => { const a = t.getBoundingClientRect(), b = t.querySelector('.z-tab-text').getBoundingClientRect(); return { sel: t.classList.contains('z-tab-selected'), label: t.textContent.trim(), tab: { x: a.x, y: a.y, w: a.width, h: a.height }, text: { x: b.x, w: b.width } }; });
    const clip = { x: Math.floor(info.tab.x) - PAD, y: Math.floor(info.tab.y) - PAD, width: Math.ceil(info.tab.w) + 2 * PAD + 1, height: Math.ceil(info.tab.h) + 2 * PAD + 1 };
    const buf = await fpage.screenshot({ clip }); fs.writeFileSync(`${OUT}/forced-tab-${i}.png`, buf);
    const img = await decode(fd, buf);
    const px = (x, y) => { const k = (y * img.w + x) * 4; return [img.data[k], img.data[k + 1], img.data[k + 2]]; };
    // background = colour at the tab's top-left interior
    const bg = px(PAD + 2, PAD + 2);
    const cx = Math.round(info.text.x + info.text.w / 2 - clip.x - 0.5);
    const bottomY = PAD + Math.round(info.tab.h); // first row below the tab box
    const rows = []; for (let y = bottomY - 6; y < bottomY; y++) rows.push({ y: y - bottomY, c: px(cx, y).join(','), nonBg: de76(px(cx, y), bg) > 3 });
    const outsideRows = []; for (let y = bottomY; y < Math.min(img.h, bottomY + 3); y++) outsideRows.push({ y: y - bottomY, c: px(cx, y).join(',') });
    out.forced.tabs.push({ i, ...info, bg: bg.join(','), nonBgRowsWithin6: rows.filter((r) => r.nonBg).length, rows, outsideRows });
  }
  await fpage.context().close();
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
