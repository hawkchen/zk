// r2: identical to protect.js (first run) except the r2- output prefix. Vertical protections on #stripedBiglist, horizontal on #biglist,
// #biglist vertical once more after switching the model to MultipleRow (Planner method correction 2); header-still relative to the widget (correction 5).
// Shared protections for #31 / #78 (today they must PASS): track still there, wheel, drag, end clamp,
// header still, header clickable, fits-widget has no thumb. Real wheel / mouse input only.
const L = require('./r2-lib');
const BAND = 14;

async function view(page, zid) {
  await page.evaluate(zid => { const n = zk.$('$' + zid).$n(); n.scrollIntoView({ block: 'nearest' }); const b = n.getBoundingClientRect(); if (b.bottom > 890) window.scrollBy(0, b.bottom - 890); window.scrollTo(0, Math.round(window.scrollY)); }, zid);
  await page.mouse.move(2, 2); await page.waitForTimeout(250);
  return L.geom(page, zid);
}
async function thumbs(page, g, file) {
  const S = await L.shot(page, file, { x: g.box.l - 2, y: g.box.t - 2, width: g.box.w + 4, height: g.box.h + 4 });
  const vb = { x0: g.R - BAND, x1: g.R - 1, y0: g.box.t + 1, y1: g.box.b - 2 };
  const hb = { x0: g.B.l + 1, x1: g.R - BAND - 1, y0: g.box.b - 1 - BAND, y1: g.box.b - 2 };
  const base = L.median(S.rect(hb.x0, hb.x1, hb.y0, hb.y1).map(p => p.c).concat(S.rect(vb.x0, vb.x1, vb.y0, vb.y1).map(p => p.c)));
  const v = L.scanThumb(S, vb, base, 'v', g.R, 10), h = L.scanThumb(S, hb, base, 'h', g.box.b - 1, 10);
  const strip = t => t.found ? { found: true, top: t.top, bottom: t.bottom, left: t.left, right: t.right, color: t.color, n: t.n } : { found: false };
  return { base, v: strip(v), h: strip(h) };
}
const firstRow = (page, zid) => page.evaluate(zid => { const n = zk.$('$' + zid).$n(); const tr = n.querySelector('.z-biglistbox-body tbody tr'); return tr ? tr.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null; }, zid);
const firstHead = (page, zid) => page.evaluate(zid => { const th = zk.$('$' + zid).$n().querySelector('.z-biglistbox-head th.z-biglistbox-header'); return th ? th.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) : null; }, zid);
const sameBox = (a, b) => ['l', 't', 'r', 'b'].every(k => Math.abs(a[k] - b[k]) < 0.01);
const relH = g => ({ l: g.H.l - g.box.l, t: g.H.t - g.box.t, r: g.H.r - g.box.l, b: g.H.b - g.box.t });
const stillH = (a, b) => ({ relativeToWidget: sameBox(relH(a), relH(b)), viewport: sameBox(a.H, b.H) });

const curY = (page, zid) => page.evaluate(zid => zk.$('$' + zid)._currentY, zid);
const dragRectV = (page, zid) => page.evaluate(zid => { const d = zk.$('$' + zid).$n().querySelector('.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag').getBoundingClientRect(); return [d.left, d.top, d.right, d.bottom]; }, zid);
async function vertical(page, zid, out) {
  const g = await view(page, zid); const t0 = await thumbs(page, g);
  const r = { H0: g.H, box0: g.box, thumb0: t0.v, row0: await firstRow(page, zid), y0: await curY(page, zid) };
  await page.mouse.move((g.B.l + g.R) / 2 - 100, (g.B.t + g.B.b) / 2); await page.mouse.wheel(0, 120); await L.settle(page);
  let g1 = await view(page, zid), t1 = await thumbs(page, g1);
  r.row1 = await firstRow(page, zid); r.thumb1 = t1.v; r.y1 = await curY(page, zid);
  r.wheel = { rowChanged: r.row1 !== r.row0, stepChanged: r.y1 > r.y0, thumbMovedDown: t1.v.found && t0.v.found && (t1.v.top - g1.box.t) > (t0.v.top - g.box.t), headerStill: stillH(g, g1) };
  // scroll to the bottom
  await page.mouse.move((g1.B.l + g1.R) / 2 - 100, (g1.B.t + g1.B.b) / 2);
  let last = null; for (let i = 0; i < 40; i++) { for (let j = 0; j < 10; j++) await page.mouse.wheel(0, 120); await L.settle(page); const cur = await curY(page, zid); if (cur === last) break; last = cur; }
  let g2 = await view(page, zid), t2 = await thumbs(page, g2, `r2-protect-${zid}-bottom.png`);
  r.rowBottom = await firstRow(page, zid); r.thumbBottom = t2.v; r.yBottom = await curY(page, zid); r.dragRectBottom = await dragRectV(page, zid);
  r.clamp = { thumbBottomLEBodyBottom: t2.v.found && t2.v.bottom <= g2.B.b, thumbTopGEBodyTop: t2.v.found && t2.v.top >= g2.B.t, Bt: g2.B.t, Bb: g2.B.b, boxT: g2.box.t, boxB: g2.box.b, headerStill: stillH(g, g2) };
  // back to the top, then drag the thumb 40px down
  await page.mouse.move((g2.B.l + g2.R) / 2 - 100, (g2.B.t + g2.B.b) / 2);
  for (let i = 0; i < 40; i++) { for (let j = 0; j < 10; j++) await page.mouse.wheel(0, -120); await L.settle(page); if ((await curY(page, zid)) === 0) break; }
  const g3 = await view(page, zid), t3 = await thumbs(page, g3); const rowBefore = await firstRow(page, zid), yBefore = await curY(page, zid);
  if (t3.v.found) {
    const cx = (t3.v.left + t3.v.right) / 2, cy = (t3.v.top + t3.v.bottom) / 2;
    const hitEl = await page.evaluate(([x, y]) => document.elementFromPoint(x, y).className, [cx, cy]);
    await page.mouse.move(cx, cy); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(cx, cy + 5 * i); await page.waitForTimeout(40); } await page.mouse.up(); await L.settle(page);
    const g4 = await view(page, zid), t4 = await thumbs(page, g4); const yAfter = await curY(page, zid);
    r.drag = { from: [cx, cy], hitEl, rowBefore, yBefore, rowAfter: await firstRow(page, zid), yAfter, rowChanged: (await firstRow(page, zid)) !== rowBefore, stepChanged: yAfter > yBefore, thumbBefore: t3.v, thumbAfter: t4.v, headerStill: stillH(g, g4) };
  } else r.drag = { skipped: 'no thumb found', rowBefore, yBefore, headerStill: stillH(g, g3), rowChanged: false, stepChanged: false };
  out[zid + '_vertical'] = r;
}

async function horizontal(page, zid, out) {
  const g = await view(page, zid); const t0 = await thumbs(page, g);
  const r = { thumb0: t0.h, head0: await firstHead(page, zid), trackStillThere: { found: t0.h.found, leftGEBodyLeft: t0.h.found && t0.h.left >= g.B.l, Bl: g.B.l } };
  await page.mouse.move((g.B.l + g.R) / 2 - 100, (g.B.t + g.B.b) / 2); await page.mouse.wheel(120, 0); await L.settle(page);
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  const g1 = await L.geom(page, zid), t1 = await thumbs(page, g1);
  r.head1 = await firstHead(page, zid); r.thumb1 = t1.h;
  r.wheelX = { headChanged: r.head1 !== r.head0, thumbMovedRight: t1.h.found && t0.h.found && t1.h.left > t0.h.left, headerStill: stillH(g, g1) };
  if (!r.wheelX.headChanged) { // fall back: shift+wheel
    await page.mouse.move((g.B.l + g.R) / 2 - 100, (g.B.t + g.B.b) / 2); await page.keyboard.down('Shift'); await page.mouse.wheel(0, 120); await page.keyboard.up('Shift'); await L.settle(page);
    r.shiftWheel = { head: await firstHead(page, zid), changed: (await firstHead(page, zid)) !== r.head0 };
  }
  await page.mouse.move((g.B.l + g.R) / 2 - 100, (g.B.t + g.B.b) / 2);
  let last = null; for (let i = 0; i < 40; i++) { for (let j = 0; j < 10; j++) await page.mouse.wheel(120, 0); await L.settle(page); const cur = await page.evaluate(zid => zk.$('$' + zid)._currentX, zid); if (cur === last) break; last = cur; }
  await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(200);
  const g2 = await L.geom(page, zid), t2 = await thumbs(page, g2, `r2-protect-${zid}-right.png`);
  r.headEnd = await firstHead(page, zid); r.thumbEnd = t2.h; r.currentXAtEnd = await page.evaluate(zid => zk.$('$' + zid)._currentX, zid);
  r.clampX = { thumbRightLEInnerRight: t2.h.found && t2.h.right <= g2.R, thumbLeftGEBodyLeft: t2.h.found && t2.h.left >= g2.B.l, R: g2.R, Bl: g2.B.l, headerStill: stillH(g, g2) };
  out[zid + '_horizontal'] = r;
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { date: new Date().toISOString() };
  let { page } = await L.open(browser, 'biglistbox.zul');
  // track still there (rest state)
  let g = await view(page, 'stripedBiglist'); let t = await thumbs(page, g, 'r2-protect-striped-rest.png');
  const dragRect = await page.evaluate(() => { const d = zk.$('$stripedBiglist').$n().querySelector('.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag').getBoundingClientRect(); return [d.left, d.top, d.right, d.bottom]; });
  out.trackStillThere_striped_vertical = { found: t.v.found, thumbTopGEBodyTop: t.v.found && t.v.top >= g.B.t, thumb: t.v, Bt: g.B.t, dE_vs_base: t.v.found ? +L.dE(t.v.color, t.base).toFixed(2) : null, sanity_dragElementRect: dragRect, horizontalLaneThumb: t.h };
  g = await view(page, 'biglist'); t = await thumbs(page, g, 'r2-protect-biglist-rest.png');
  out.trackStillThere_biglist_horizontal = { found: t.h.found, thumbLeftGEBodyLeft: t.h.found && t.h.left >= g.B.l, thumb: t.h, Bl: g.B.l, verticalLaneThumb: t.v, note: t.v.found ? '' : '#biglist default model (MultipleColumn 100x10) is NOT vertically scrollable: no vertical thumb' };
  // header clickable on #biglist: click (R-20, H centre)
  g = await view(page, 'biglist');
  const before = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const th = e && e.closest('th'); return { hit: e && e.className, th: th && th.className, icon: th && th.querySelector('.z-biglistbox-sorticon i') && th.querySelector('.z-biglistbox-sorticon i').className, text: th && th.textContent.trim().slice(0, 30) }; }, [g.R - 20, (g.H.t + g.H.b) / 2]);
  await page.mouse.click(g.R - 20, (g.H.t + g.H.b) / 2); await L.settle(page); await page.waitForTimeout(500);
  const after = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const th = e && e.closest('th'); return { th: th && th.className, icon: th && th.querySelector('.z-biglistbox-sorticon i') && th.querySelector('.z-biglistbox-sorticon i').className, text: th && th.textContent.trim().slice(0, 30), sortedThs: [...zk.$('$biglist').$n().querySelectorAll('th.z-biglistbox-header')].filter(t => t.querySelector('.z-biglistbox-sorticon i') && t.querySelector('.z-biglistbox-sorticon i').className).map(t => t.querySelector('.z-biglistbox-sorticon i').className) }; }, [g.R - 20, (g.H.t + g.H.b) / 2]);
  out.headerClickable_biglist = { point: [g.R - 20, (g.H.t + g.H.b) / 2], before, after, iconChanged: before.icon !== after.icon || after.sortedThs.length > 0 };
  // wheel / drag / clamp — vertical on #stripedBiglist (vertically scrollable), horizontal on #biglist (default model)
  await vertical(page, 'stripedBiglist', out);
  await horizontal(page, 'biglist', out);
  // #biglist with the MultipleRow model (10 cols x 100 rows): vertical protections on #biglist as the method words them
  await page.selectOption('select.z-selectbox >> nth=0', { label: 'MultipleRow' }); await L.settle(page); await page.waitForTimeout(800);
  out.biglist_modelSwitched = await page.evaluate(() => { const w = zk.$('$biglist'); return { rowSize: w.rowSize, colSize: w.colSize, rows: w._rows, cols: w._cols }; });
  await vertical(page, 'biglist', out);
  await page.context().close();
  // #78 protection: fits widget has no thumb at all
  ({ page } = await L.open(browser, 'biglistbox-fits.zul'));
  g = await view(page, 'fitsBiglist'); t = await thumbs(page, g, 'r2-protect-fits-rest.png');
  out.fits_noThumb = { verticalFound: t.v.found, horizontalFound: t.h.found, pass: !t.v.found && !t.h.found, v: t.v, h: t.h };
  await browser.close();
  L.save('r2-protect.json', out);
  const P = (n, ok, extra) => console.log(n.padEnd(46), ok ? 'PASS' : 'FAIL', extra || '');
  P('track: striped vertical thumb exists, top>=B.top', out.trackStillThere_striped_vertical.found && out.trackStillThere_striped_vertical.thumbTopGEBodyTop, JSON.stringify([out.trackStillThere_striped_vertical.thumb.top, out.trackStillThere_striped_vertical.Bt, out.trackStillThere_striped_vertical.dE_vs_base]));
  P('track: biglist horizontal thumb exists, left>=B.left', out.trackStillThere_biglist_horizontal.found && out.trackStillThere_biglist_horizontal.thumbLeftGEBodyLeft, JSON.stringify([out.trackStillThere_biglist_horizontal.thumb.left, out.trackStillThere_biglist_horizontal.Bl]) + ' ' + out.trackStillThere_biglist_horizontal.note);
  P('header clickable (#biglist, R-20)', out.headerClickable_biglist.iconChanged, JSON.stringify([before.icon, after.icon, after.sortedThs]));
  for (const k of ['stripedBiglist_vertical', 'biglist_vertical']) { const r = out[k];
    P(k + ': wheel row changed & thumb moved', r.wheel.rowChanged && r.wheel.thumbMovedDown, JSON.stringify([r.row0, r.row1, r.y0, r.y1, r.thumb0.top, r.thumb1.top]));
    P(k + ': clamp at bottom', r.clamp.thumbBottomLEBodyBottom && r.clamp.thumbTopGEBodyTop, JSON.stringify([r.thumbBottom.top, r.thumbBottom.bottom, r.clamp.Bt, r.clamp.Bb, 'y', r.yBottom, 'drag', r.dragRectBottom]));
    P(k + ': drag 40px scrolls rows', r.drag.rowChanged && r.drag.stepChanged, JSON.stringify([r.drag.rowBefore, r.drag.rowAfter, r.drag.yBefore, r.drag.yAfter, r.drag.hitEl, r.drag.skipped]));
    P(k + ': header still (relative to widget)', r.wheel.headerStill.relativeToWidget && r.clamp.headerStill.relativeToWidget && r.drag.headerStill.relativeToWidget, JSON.stringify([r.wheel.headerStill, r.clamp.headerStill, r.drag.headerStill])); }
  const h = out.biglist_horizontal;
  P('biglist_horizontal: wheelX head changed & thumb moved', h.wheelX.headChanged && h.wheelX.thumbMovedRight, JSON.stringify([h.head0, h.head1, h.thumb0.left, h.thumb1.left, h.shiftWheel]));
  P('biglist_horizontal: clamp at right', h.clampX.thumbRightLEInnerRight && h.clampX.thumbLeftGEBodyLeft, JSON.stringify([h.thumbEnd.left, h.thumbEnd.right, h.clampX.Bl, h.clampX.R, h.headEnd]));
  P('biglist_horizontal: header still (relative)', h.wheelX.headerStill.relativeToWidget && h.clampX.headerStill.relativeToWidget, JSON.stringify([h.wheelX.headerStill, h.clampX.headerStill]));
  P('fits: no thumb in either lane', out.fits_noThumb.pass, JSON.stringify([out.fits_noThumb.v, out.fits_noThumb.h]));
  console.log('biglist model switched:', JSON.stringify(out.biglist_modelSwitched));
})();
