// #31 judgments 1–4 + "also must hold" (vflex=min, forcedColors) on the CURRENT code.
const L = require('./lib');
const BAND = 14;

async function measure(page, zid, suffix = '') {
  await page.evaluate(zid => { const n = zk.$('$' + zid).$n(); n.scrollIntoView({ block: 'nearest' }); const b = n.getBoundingClientRect(); if (b.bottom > 890) window.scrollBy(0, b.bottom - 890); }, zid);
  await page.mouse.move(2, 2); await page.waitForTimeout(300);
  const g = await L.geom(page, zid);
  const R = g.R, H = g.H, B = g.B;
  // judgment 1: hit test at (R-7, H centre)
  const hit = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); const w = e && e.closest('[class*="wscroll"]');
    return { x, y, tag: e && e.tagName, cls: e && e.className, isWscroll: !!w, wscrollCls: w && w.className }; }, [R - 7, (H.t + H.b) / 2]);
  const S = await L.shot(page, `red31-${zid}${suffix}.png`, { x: g.box.l - 2, y: g.box.t - 2, width: g.box.w + 4, height: g.box.h + 4 });
  // base colour: blank body area right of all columns (biglist has none → band under rows, median)
  const blankX0 = Math.min(g.colsRight + 6, R - 60), blankX1 = R - 20;
  const base = L.median(S.rect(blankX0, blankX1, B.t + 2, B.b - 16).map(p => p.c));
  // judgment 2: header band x∈[R-14,R-1], y∈[H.top+2,H.bottom-2] vs same-y reference x∈[R-34,R-21]
  const ref2 = L.median(S.rect(R - 34, R - 21, H.t + 2, H.b - 2).map(p => p.c));
  const j2 = L.worst(S.rect(R - BAND, R - 1, H.t + 2, H.b - 2), ref2);
  // judgment 3: whole-height right band vs base (and, for information, vs the same-y reference column)
  const band3 = S.rect(R - BAND, R - 1, g.inner.t, g.inner.b - 1);
  const j3 = L.worst(band3, base);
  // judgment 4: bottom band, x outside all columns (excluding the vertical lane), vs base
  const j4 = L.worst(S.rect(blankX0, R - BAND - 1, B.b - BAND, B.b - 1), base);
  const j4full = L.worst(S.rect(blankX0, R - 1, B.b - BAND, B.b - 1), base);
  // --- diagnostics for the method: the widget's own 1px border and rounded corners fall inside the bands as worded.
  // Variant bands: stay >= 1px inside the border-box (y <= box.b-2) and skip the corner radius zone (10px) at the top-right/bottom corners.
  const bx = g.box; const corner = 10;
  const notCorner = p => !((p.x > bx.r - 1 - corner && (p.y < bx.t + 1 + corner || p.y > bx.b - 1 - corner)) || (p.x < bx.l + 1 + corner && p.y > bx.b - 1 - corner));
  const j2v = L.worst(S.rect(R - BAND, R - 1, H.t + 2, H.b - 2).filter(notCorner), ref2);
  const j3v = L.worst(S.rect(R - BAND, R - 1, bx.t + 1, bx.b - 2).filter(notCorner), base);
  const j4v = L.worst(S.rect(blankX0, R - BAND - 1, bx.b - 1 - BAND, bx.b - 2).filter(notCorner), base);
  const cornerProbe = { topRight: S.at((R - 2) * S.dpr, (bx.t + 2) * S.dpr), bottomRight: S.at((R - 2) * S.dpr, (bx.b - 3) * S.dpr), bottomBorderRow: S.at((R - 7) * S.dpr, (bx.b - 0.5) * S.dpr), outerOverflowsBorderBox: g.inner.b - bx.b };
  return { zid, g, base, ref2, variants_cornerAndBorderSafe: { j2: j2v, j3: j3v, j4: j4v }, cornerProbe, j1: { ...hit, pass: !hit.isWscroll }, j2: { ...j2, pass: j2.dE <= 2 }, j3: { ...j3, pass: j3.dE <= 2 }, j4: { ...j4, pass: j4.dE <= 2 }, j4_includingVerticalLane: j4full };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { date: new Date().toISOString(), widgets: {}, alsoMustHold: {} };
  let { page } = await L.open(browser, 'biglistbox.zul');
  out.widgets.stripedBiglist = await measure(page, 'stripedBiglist');
  out.widgets.biglist = await measure(page, 'biglist');
  // also must hold: vflex/hflex = min on #biglist (page radio), re-measure 1, 2
  await page.evaluate(() => { const r = [...document.querySelectorAll('.z-radio')].find(x => x.textContent.trim() === 'min'); r.querySelector('input').click(); });
  await L.settle(page); await page.waitForTimeout(800);
  out.alsoMustHold.biglist_vflexMin = await measure(page, 'biglist', '-vflexMin');
  out.alsoMustHold.biglist_vflexMin.note = 'judgment 2 excluded for #biglist by the method (header text at the right); value recorded for information only';
  await page.context().close();
  ({ page } = await L.open(browser, 'biglistbox-fits.zul'));
  out.widgets.fitsBiglist = await measure(page, 'fitsBiglist');
  await page.context().close();
  // forced colors: judgment 1 on all three
  for (const [pg, zid] of [['biglistbox.zul', 'stripedBiglist'], ['biglistbox.zul', 'biglist'], ['biglistbox-fits.zul', 'fitsBiglist']]) {
    ({ page } = await L.open(browser, pg, { forcedColors: 'active' }));
    const m = await measure(page, zid, '-forcedColors');
    out.alsoMustHold['forcedColors_' + zid] = { j1: m.j1 };
    await page.context().close();
  }
  L.save('red31.json', out);
  const row = (n, m) => console.log(n.padEnd(22), 'J1', m.j1.pass ? 'PASS' : 'FAIL', `(${m.j1.wscrollCls || m.j1.cls})`, '| J2', m.j2.pass ? 'PASS' : 'FAIL', m.j2.dE, '| J3', m.j3.pass ? 'PASS' : 'FAIL', m.j3.dE, '| J4', m.j4.pass ? 'PASS' : 'FAIL', m.j4.dE, '| safe-variant J2/J3/J4', m.variants_cornerAndBorderSafe.j2.dE, m.variants_cornerAndBorderSafe.j3.dE, m.variants_cornerAndBorderSafe.j4.dE, '| base', m.base.join(','), 'R', m.g.R, 'H', m.g.H.t, m.g.H.b, 'B', m.g.B.t, m.g.B.b, 'box.b', m.g.box.b, 'colsRight', m.g.colsRight);
  for (const k of Object.keys(out.widgets)) row(k, out.widgets[k]);
  row('biglist vflex=min', out.alsoMustHold.biglist_vflexMin);
  for (const k of Object.keys(out.alsoMustHold)) if (k.startsWith('forced')) console.log(k, 'J1', out.alsoMustHold[k].j1.pass ? 'PASS' : 'FAIL', out.alsoMustHold[k].j1.wscrollCls);
  await browser.close();
})();
