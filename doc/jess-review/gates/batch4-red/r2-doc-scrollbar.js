// r2: re-measure the documented scrollbar's REST state (scrollbar.zul, 2nd grid, data-embedscrollbar="true",
// `.z-scrollbar-vertical-embed`) and confirm it is unchanged against the first run's doc-scrollbar.json.
const L = require('./r2-lib');
const fs = require('fs'); const path = require('path');
const FIRST = JSON.parse(fs.readFileSync(path.join(__dirname, 'doc-scrollbar.json'), 'utf8'));
(async () => {
  const browser = await L.chromium.launch();
  const { page } = await L.open(browser, 'scrollbar.zul');
  const g = await page.evaluate(() => {
    const grid = document.querySelectorAll('.z-grid')[1];
    grid.scrollIntoView({ block: 'center' });
    const body = grid.querySelector('.z-grid-body'); const r = body.getBoundingClientRect(); const cs = getComputedStyle(body);
    const rs = getComputedStyle(document.documentElement);
    const ve = grid.querySelector('.z-scrollbar-vertical-embed'), he = grid.querySelector('.z-scrollbar-horizontal-embed');
    const R = e => { const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom, w: b.width, h: b.height }; };
    return { embed: grid.getAttribute('data-embedscrollbar'), body: R(body), bodyBorderRight: cs.borderRightWidth, bodyBorderBottom: cs.borderBottomWidth,
      tokens: { outlineVariant: rs.getPropertyValue('--zk-color-outline-variant').trim(), outline: rs.getPropertyValue('--zk-color-outline').trim() },
      restElement: ve ? { cls: ve.className, box: R(ve), bg: getComputedStyle(ve).backgroundColor, radius: getComputedStyle(ve).borderRadius } : null,
      restElementH: he ? { cls: he.className, box: R(he), bg: getComputedStyle(he).backgroundColor } : null };
  });
  await page.mouse.move(2, 2); await page.waitForTimeout(500);
  const S = await L.shot(page, 'r2-doc-scrollbar.png', { x: g.body.l - 2, y: g.body.t - 2, width: g.body.r - g.body.l + 4, height: g.body.b - g.body.t + 4 });
  const Rc = g.body.r, Bc = g.body.b;
  const base = L.median(S.rect(Rc - 40, Rc - 25, g.body.t + 2, Bc - 20).map(p => p.c));
  const v = L.scanThumb(S, { x0: Rc - 16, x1: Rc - 1, y0: g.body.t, y1: Bc - 1 }, base, 'v', Rc);
  const h = L.scanThumb(S, { x0: g.body.l, x1: Rc - 17, y0: Bc - 16, y1: Bc - 1 }, base, 'h', Bc);
  const out = { page: 'scrollbar.zul', element: '2nd .z-grid (data-embedscrollbar=true, nativebar=false) → .z-scrollbar-vertical-embed at rest (pointer at 2,2)', geometry: g, base,
    vertical: { thumbColor: v.color, width: v.size, distanceToInnerRight: v.edgeDistance, rounded: v.rounded, top: v.top, bottom: v.bottom, left: v.left, right: v.right, n: v.n, dE_vs_base: +L.dE(v.color, base).toFixed(2) },
    horizontal: { thumbColor: h.color, height: h.size, distanceToInnerBottom: h.edgeDistance, rounded: h.rounded, left: h.left, right: h.right, top: h.top, bottom: h.bottom, n: h.n } };
  const F = FIRST.vertical;
  out.unchangedVsFirstRun = { colorDE: +L.dE(v.color, F.thumbColor).toFixed(2), widthSame: v.size === F.width, distanceSame: v.edgeDistance === F.distanceToInnerRight, roundedSame: v.rounded.ok === F.rounded.ok,
    tokenSame: g.tokens.outlineVariant === FIRST.geometry.tokens.outlineVariant };
  out.unchangedVsFirstRun.all = out.unchangedVsFirstRun.colorDE <= 1 && out.unchangedVsFirstRun.widthSame && out.unchangedVsFirstRun.distanceSame && out.unchangedVsFirstRun.roundedSame && out.unchangedVsFirstRun.tokenSame;
  L.save('r2-doc-scrollbar.json', out);
  console.log('vertical', JSON.stringify(out.vertical)); console.log('horizontal', JSON.stringify(out.horizontal)); console.log('unchanged vs first run', JSON.stringify(out.unchangedVsFirstRun));
  await browser.close();
})();
