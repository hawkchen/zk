const { launch, open, idle } = require('./common');
const fs = require('fs');
const OUT = __dirname + '/i52';
fs.mkdirSync(OUT, { recursive: true });
const PAD = 4;
// sRGB -> Lab (D65)
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
async function measureTab(page, dpage, tabLoc, label) {
  await tabLoc.scrollIntoViewIfNeeded();
  await page.mouse.move(1279, 899); await idle(page);
  const info = await tabLoc.evaluate((t) => {
    const probe = document.createElement('span'); probe.style.color = 'var(--zk-tab-accent)'; t.appendChild(probe);
    const accent = getComputedStyle(probe).color; probe.remove();
    const tr = t.getBoundingClientRect(); const btn = t.querySelector('.z-tab-button'); const br = btn ? btn.getBoundingClientRect() : null; const tx = t.querySelector('.z-tab-text'); const xr = tx.getBoundingClientRect();
    return { accent, accentRaw: getComputedStyle(t).getPropertyValue('--zk-tab-accent').trim(), tab: { x: tr.x, y: tr.y, w: tr.width, h: tr.height }, text: { x: xr.x, y: xr.y, w: xr.width, h: xr.height }, cls: t.className, button: br ? { x: br.x, y: br.y, w: br.width, h: br.height } : null, tabboxCls: t.closest('.z-tabbox').className };
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
  // text box in image coordinates
  const t = { x0: info.text.x - clip.x, x1: info.text.x + info.text.w - clip.x, y0: info.text.y - clip.y, y1: info.text.y + info.text.h - clip.y };
  const tcx = Math.round((t.x0 + t.x1) / 2 - 0.5), tcy = Math.round((t.y0 + t.y1) / 2 - 0.5);
  const runs = (arr) => { const r = []; let s = -1; arr.forEach((v, i) => { if (v && s < 0) s = i; if (!v && s >= 0) { r.push([s, i - 1]); s = -1; } }); if (s >= 0) r.push([s, arr.length - 1]); return r; };
  const res = { label, accent: info.accent, accentRaw: info.accentRaw, tabCls: info.cls, tabboxCls: info.tabboxCls, tabRect: info.tab, textRect: info.text, clip, textBoxInImg: t };
  const horizontal = !/z-tabbox-(left|right|vertical)/.test(info.tabboxCls) && !/vertical|right|left/.test(info.tabboxCls);
  res.axis = horizontal ? 'horizontal-indicator (scan column at text centre x)' : 'vertical-indicator (scan row at text centre y)';
  if (horizontal) {
    const col = Array.from({ length: img.h }, (_, y) => m(tcx, y));
    res.columnRuns = runs(col);
    // indicator run = matched run lying outside (below/above) the text box
    const ind = res.columnRuns.filter(([a, b]) => b < t.y0 || a > t.y1);
    res.indicatorRuns = ind;
    if (ind.length) {
      const pickOuter = (rs, size) => rs.reduce((best, r) => (Math.min(r[0], size - 1 - r[1]) < Math.min(best[0], size - 1 - best[1]) ? r : best)); const [a, b] = pickOuter(ind, img.h);
      res.thickness = b - a + 1;
      const mid = Math.floor((a + b) / 2);
      const row = Array.from({ length: img.w }, (_, x) => m(x, mid));
      const rr = runs(row).find(([s, e]) => s <= tcx && e >= tcx);
      res.midRow = mid; res.widthRun = rr; res.width = rr ? rr[1] - rr[0] + 1 : 0;
      res.textWidth = info.text.w;
      res.indicatorCentre = rr ? (rr[0] + rr[1] + 1) / 2 : null; res.textCentre = (t.x0 + t.x1) / 2;
      res.centreDelta = rr ? Math.abs(res.indicatorCentre - res.textCentre) : null;
      // corner check: rows a (top) and b (bottom) of the indicator, at the end-x of the bottom row's run
      const brow = runs(Array.from({ length: img.w }, (_, x) => m(x, b))).find(([s, e]) => s <= tcx && e >= tcx);
      res.bottomRowRun = brow;
      if (brow) res.corners = { topLeftMatch: m(brow[0], a), topRightMatch: m(brow[1], a), bottomLeftMatch: m(brow[0], b), bottomRightMatch: m(brow[1], b) };
      // which side is the indicator on
      res.indicatorSide = a > t.y1 ? 'below text' : 'above text';
    }
  } else {
    const row = Array.from({ length: img.w }, (_, x) => m(x, tcy));
    res.rowRuns = runs(row);
    const ind = res.rowRuns.filter(([a, b]) => (b < t.x0 || a > t.x1) && !inBtn(a, tcy) && !inBtn(b, tcy)); res.buttonInImg = bt;
    res.indicatorRuns = ind;
    if (ind.length) {
      const pickOuter = (rs, size) => rs.reduce((best, r) => (Math.min(r[0], size - 1 - r[1]) < Math.min(best[0], size - 1 - best[1]) ? r : best)); const [a, b] = pickOuter(ind, img.w); res.thickness = b - a + 1; res.indicatorSide = a > t.x1 ? 'right of text' : 'left of text';
      const mid = Math.floor((a + b) / 2);
      const colr = runs(Array.from({ length: img.h }, (_, y) => m(mid, y))).find(([s, e]) => s <= tcy && e >= tcy);
      res.lengthRun = colr; res.length = colr ? colr[1] - colr[0] + 1 : 0; res.textHeight = info.text.h; res.tabHeight = info.tab.h;
    }
  }
  // total accent pixels outside the text box (for "unselected tab has no indicator")
  let outside = 0; for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) if (x >= PAD && y >= PAD && x < PAD + info.tab.w && y < PAD + info.tab.h && m(x, y) && !inBtn(x, y) && !(x >= t.x0 - 1 && x <= t.x1 + 1 && y >= t.y0 - 1 && y <= t.y1 + 1)) outside++;
  res.accentPixelsOutsideText = outside;
  return res;
}
(async () => {
  const browser = await launch();
  const page = await open(browser, '/tabbox.zul');
  const dpage = await page.context().newPage();
  const boxes = await page.evaluate(() => [...document.querySelectorAll('.z-tabbox')].map((b, i) => i + ': ' + b.className));
  const tb = (i) => page.locator('.z-tabbox').nth(i);
  const out = { boxes };
  out.first = await measureTab(page, dpage, tb(0).locator('.z-tab.z-tab-selected').first(), 'first-selected');
  out.unselected = [];
  const n = await tb(0).locator('.z-tab:not(.z-tab-selected)').count();
  for (let i = 0; i < n; i++) out.unselected.push(await measureTab(page, dpage, tb(0).locator('.z-tab:not(.z-tab-selected)').nth(i), 'first-unselected-' + i));
  for (const [idx, name] of [[3, 'vertical'], [5, 'right'], [7, 'bottom']]) out[name] = await measureTab(page, dpage, tb(idx).locator('.z-tab.z-tab-selected').first(), name + '-selected');
  // baseline for "text vertical position must not move": record text rect top relative to tab
  out.textBaseline = await tb(0).locator('.z-tab').evaluateAll((ts) => ts.map((t) => { const a = t.getBoundingClientRect(), b = t.querySelector('.z-tab-text').getBoundingClientRect(); return { label: t.textContent.trim(), tabTop: a.top, textTop: b.top, textTopRelTab: b.top - a.top }; }));
  // accordion baseline screenshots
  const acc = page.locator('.z-tabbox-accordion');
  out.accordionCount = await acc.count();
  for (let i = 0; i < out.accordionCount; i++) { await acc.nth(i).scrollIntoViewIfNeeded(); await page.mouse.move(1279, 899); await idle(page); await acc.nth(i).screenshot({ path: `${OUT}/accordion-${i}.png` }); }
  await page.context().close();
  // forced colors
  const fpage = await open(browser, '/tabbox.zul', { forcedColors: true });
  const fd = await fpage.context().newPage();
  out.forced = { media: await fpage.evaluate(() => matchMedia('(forced-colors: active)').matches) };
  const ftb = fpage.locator('.z-tabbox').first();
  out.forced.css = await ftb.locator('.z-tab').evaluateAll((ts) => ts.map((t) => { const c = getComputedStyle(t); return { label: t.textContent.trim(), selected: t.classList.contains('z-tab-selected'), borderBottom: c.borderBottomWidth + ' ' + c.borderBottomStyle + ' ' + c.borderBottomColor, color: c.color, bg: c.backgroundColor, forcedColorAdjust: c.forcedColorAdjust }; }));
  // pixel: bottom strip of each tab in forced colours — distinct colours present in the last 4 rows of the tab box
  out.forced.strips = [];
  const cnt = await ftb.locator('.z-tab').count();
  for (let i = 0; i < cnt; i++) {
    const l = ftb.locator('.z-tab').nth(i); await l.scrollIntoViewIfNeeded(); await fpage.mouse.move(1279, 899); await idle(fpage);
    const r = await l.boundingBox();
    const clip = { x: Math.floor(r.x), y: Math.floor(r.y), width: Math.ceil(r.width), height: Math.ceil(r.height) };
    const buf = await fpage.screenshot({ clip }); fs.writeFileSync(`${OUT}/forced-tab-${i}.png`, buf);
    const img = await decode(fd, buf);
    const rows = [];
    for (let y = img.h - 4; y < img.h; y++) { const cols = {}; for (let x = 0; x < img.w; x++) { const k = (y * img.w + x) * 4; const key = img.data[k] + ',' + img.data[k + 1] + ',' + img.data[k + 2]; cols[key] = (cols[key] || 0) + 1; } rows.push({ y, colours: cols }); }
    out.forced.strips.push({ i, width: img.w, height: img.h, bottomRows: rows });
  }
  await fpage.context().close();
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
