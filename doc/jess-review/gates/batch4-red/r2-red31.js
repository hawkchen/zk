// r2: #31 judgments 1–4 with the CORRECTED pixel bands (Planner method correction 1) + "also must hold".
// Bands: border-box inset 1px (x <= box.r-2, y in [box.t+1, box.b-2]), four corners excluded 10px each;
// judgment 4 y in [box.b-15, box.b-2]. Judgment 1 (hit test) unchanged.
const L = require('./r2-lib');
const BAND = 14, CORNER = 10;

async function measure(page, zid, suffix = '') {
  await page.evaluate(zid => { const n = zk.$('$' + zid).$n(); n.scrollIntoView({ block: 'nearest' }); const b = n.getBoundingClientRect(); if (b.bottom > 890) window.scrollBy(0, b.bottom - 890); }, zid);
  await page.mouse.move(2, 2); await page.waitForTimeout(300);
  const g = await L.geom(page, zid);
  const R = g.R, H = g.H, B = g.B, bx = g.box;
  // judgment 1: hit test at (R-7, H centre)
  const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const w = e && e.closest('[class*="wscroll"]');
    return { x, y, tag: e && e.tagName, cls: e && e.className, isWscroll: !!w, wscrollCls: w && w.className }; }, [R - 7, (H.t + H.b) / 2]);
  const S = await L.shot(page, `r2-red31-${zid}${suffix}.png`, { x: bx.l - 2, y: bx.t - 2, width: bx.w + 4, height: bx.h + 4 });
  // base colour: blank body area right of all columns (median)
  const blankX0 = Math.min(g.colsRight + 6, R - 60), blankX1 = R - 20;
  const base = L.median(S.rect(blankX0, blankX1, B.t + 2, bx.b - 16).map(p => p.c));
  // corrected band: inside the border-box by 1px, outside the four 10px corner squares
  const inset = p => p.x >= bx.l + 1 && p.x <= bx.r - 2 && p.y >= bx.t + 1 && p.y <= bx.b - 2;
  const notCorner = p => !((p.x > bx.r - 1 - CORNER || p.x < bx.l + 1 + CORNER) && (p.y < bx.t + 1 + CORNER || p.y > bx.b - 1 - CORNER));
  const ok = p => inset(p) && notCorner(p);
  // judgment 2: header band x∈[R-14,R-1], y∈[H.top+2,H.bottom-2] vs same-y reference x∈[R-34,R-21]
  const ref2 = L.median(S.rect(R - 34, R - 21, H.t + 2, H.b - 2).map(p => p.c));
  const band2 = S.rect(R - BAND, R - 1, H.t + 2, H.b - 2).filter(ok);
  const j2 = L.worst(band2, ref2);
  // judgment 3: whole-height right band (inset, corners excluded) vs base
  const band3 = S.rect(R - BAND, R - 1, bx.t + 1, bx.b - 2).filter(ok);
  const j3 = L.worst(band3, base);
  // judgment 4: bottom band y∈[box.b-15, box.b-2], x in the blank area outside all columns (left of the vertical lane) vs base
  const band4 = S.rect(blankX0, R - BAND - 1, bx.b - 15, bx.b - 2).filter(ok);
  const j4 = L.worst(band4, base);
  const cornerProbe = { topRight: S.at((R - 2) * S.dpr, (bx.t + 2) * S.dpr), bottomRight: S.at((R - 2) * S.dpr, (bx.b - 3) * S.dpr), bottomBorderRow: S.at((R - 7) * S.dpr, (bx.b - 0.5) * S.dpr), outerOverflowsBorderBox: g.inner.b - bx.b };
  return { zid, g, base, ref2, bandPx: { j2: band2.length, j3: band3.length, j4: band4.length }, cornerProbe,
    j1: { ...hit, pass: !hit.isWscroll }, j2: { ...j2, pass: j2.dE <= 2 }, j3: { ...j3, pass: j3.dE <= 2 }, j4: { ...j4, pass: j4.dE <= 2 } };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { date: new Date().toISOString(), method: 'corrected bands: border-box inset 1px, corners 10px excluded, j4 y in [box.b-15, box.b-2]', widgets: {}, alsoMustHold: {} };
  let { page } = await L.open(browser, 'biglistbox.zul');
  out.widgets.stripedBiglist = await measure(page, 'stripedBiglist');
  out.widgets.biglist = await measure(page, 'biglist');
  out.widgets.biglist.note = 'judgment 2/3/4 pixels excluded for #biglist by the method (header text at the right; columns fill the width); recorded for information only';
  // also must hold: vflex/hflex = min on #biglist (page radio), re-measure 1, 2
  await page.evaluate(() => { const r = [...document.querySelectorAll('.z-radio')].find(x => x.textContent.trim() === 'min'); r.querySelector('input').click(); });
  await L.settle(page); await page.waitForTimeout(800);
  out.alsoMustHold.biglist_vflexMin = await measure(page, 'biglist', '-vflexMin');
  out.alsoMustHold.biglist_vflexMin.note = 'judgment 2 excluded for #biglist by the method; value recorded for information only';
  await page.context().close();
  ({ page } = await L.open(browser, 'biglistbox-fits.zul'));
  out.fitsModel = await page.evaluate(() => { const w = zk.$('$fitsBiglist'); const n = w.$n(); return { rowSize: w.rowSize, colSize: w.colSize, nTh: n.querySelectorAll('th.z-biglistbox-header').length, nTr: n.querySelectorAll('.z-biglistbox-body tbody tr').length, vDragDisplay: getComputedStyle(n.querySelector('.z-biglistbox-wscroll-vertical .z-biglistbox-wscroll-drag')).display, hDragDisplay: getComputedStyle(n.querySelector('.z-biglistbox-wscroll-horizontal .z-biglistbox-wscroll-drag')).display }; });
  out.widgets.fitsBiglist = await measure(page, 'fitsBiglist');
  await page.context().close();
  // forced colors: judgment 1 on all three
  for (const [pg, zid] of [['biglistbox.zul', 'stripedBiglist'], ['biglistbox.zul', 'biglist'], ['biglistbox-fits.zul', 'fitsBiglist']]) {
    ({ page } = await L.open(browser, pg, { forcedColors: 'active' }));
    const m = await measure(page, zid, '-forcedColors');
    out.alsoMustHold['forcedColors_' + zid] = { j1: m.j1 };
    await page.context().close();
  }
  L.save('r2-red31.json', out);
  const row = (n, m) => console.log(n.padEnd(22), 'J1', m.j1.pass ? 'PASS' : 'FAIL', `(${m.j1.wscrollCls || m.j1.cls})`, '| J2', m.j2.pass ? 'PASS' : 'FAIL', m.j2.dE, JSON.stringify([m.j2.x, m.j2.y, m.j2.c]), '| J3', m.j3.pass ? 'PASS' : 'FAIL', m.j3.dE, JSON.stringify([m.j3.x, m.j3.y, m.j3.c]), '| J4', m.j4.pass ? 'PASS' : 'FAIL', m.j4.dE, JSON.stringify([m.j4.x, m.j4.y, m.j4.c]), '| base', m.base.join(','), 'ref2', m.ref2.join(','), 'R', m.g.R, 'H', m.g.H.t, m.g.H.b, 'B', m.g.B.t, m.g.B.b, 'box', m.g.box.l, m.g.box.t, m.g.box.r, m.g.box.b, 'colsRight', m.g.colsRight, 'bandPx', JSON.stringify(m.bandPx));
  for (const k of Object.keys(out.widgets)) row(k, out.widgets[k]);
  row('biglist vflex=min', out.alsoMustHold.biglist_vflexMin);
  for (const k of Object.keys(out.alsoMustHold)) if (k.startsWith('forced')) console.log(k, 'J1', out.alsoMustHold[k].j1.pass ? 'PASS' : 'FAIL', out.alsoMustHold[k].j1.wscrollCls);
  console.log('fits model:', JSON.stringify(out.fitsModel));
  await browser.close();
})();
