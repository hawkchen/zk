// #35 corrected RED rerun: ink-bbox normalized IoU, dpr 4, threshold 0.5
const { chromium, open, settle, dE } = require('./lib');
const fs = require('fs');
const src = fs.readFileSync(__dirname + '/i35-method.js', 'utf8');
// reuse helper functions verbatim
const helpers = src.slice(src.indexOf('async function grab'), src.indexOf('async function collect'));
const H = new Function('dE', helpers + ';return {grab,inkGrid,normalized,iou,bgOf,downscale};')(dE);
const { grab, inkGrid, normalized, iou, bgOf } = H;
const lum = ([R, G, B]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(R) + 0.7152 * f(G) + 0.0722 * f(B); };
const cr = (a, c) => { const la = lum(a), lb = lum(c); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
function stats(g) { if (!g) return null; const bg = bgOf(g); let best = 1, ink = 0; for (let i = 0; i < g.d.length; i += 4) { const p = [g.d[i], g.d[i + 1], g.d[i + 2]]; best = Math.max(best, cr(p, bg)); if (dE(p, bg) > 10) ink++; } return { contrast: +best.toFixed(2), inkPx: ink }; }
async function safeGrab(page, loc, dpr) { try { const b = await loc.boundingBox(); if (!b || b.width < 0.5 || b.height < 0.5) return null; return await grab(page, loc, dpr); } catch (e) { return null; } }
const dpr = 4;
async function run(browser, opts) {
  const o = { deviceScaleFactor: dpr, ...opts }; const R = {};
  let group;
  { const { ctx, page } = await open(browser, 'grid-grouping.zul', o); await page.mouse.move(1270, 890);
    group = await grab(page, page.locator('.z-group-icon i').first(), dpr); await ctx.close(); }
  const { ctx, page } = await open(browser, 'grid.zul', o);
  const grid = page.locator('.z-grid').nth(1);
  const th = grid.locator('th.z-column').nth(1);
  const sortI = th.locator('.z-column-sorticon i'), btnI = th.locator('.z-column-button i');
  const first = () => grid.locator('.z-row').first().locator('td').nth(1).innerText();
  R.initial = await first();
  await page.mouse.move(1270, 890); await page.waitForTimeout(150);
  R.unsorted = {};
  for (const [n, idx] of [['Author', 0], ['Title', 1], ['Publisher', 2]]) {
    const g = await safeGrab(page, grid.locator('th.z-column').nth(idx).locator('.z-column-sorticon i'), dpr);
    R.unsorted[n] = g ? { inkBoxMaskNull: normalized(g) === null, inkPx: stats(g).inkPx } : { noBox: true };
  }
  const M = {}; const N = {};
  const gm = normalized(group);
  for (const st of ['asc', 'desc']) {
    await th.locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page);
    const s = { ariaSort: await th.getAttribute('aria-sort'), cls: await sortI.getAttribute('class'), title: await sortI.getAttribute('title'), first: await first() };
    await th.hover({ position: { x: 60, y: 10 } }); await page.waitForTimeout(150);
    const sg = await grab(page, sortI, dpr), bg = await grab(page, btnI, dpr);
    s.menuCls = await btnI.getAttribute('class');
    s.iouMenu = iou(normalized(sg), normalized(bg)); s.iouGroup = iou(normalized(sg), gm);
    N[st] = normalized(sg);
    await page.mouse.move(1270, 890); await page.waitForTimeout(150);
    const rg = await grab(page, sortI, dpr); s.rest = stats(rg);
    s.sortBox = { w: rg.box.width, h: rg.box.height };
    M[st] = s;
  }
  R.states = M; R.iouAscDesc = iou(N.asc, N.desc);
  // one-click sort check on fresh page
  await ctx.close();
  { const { ctx, page } = await open(browser, 'grid.zul', o); const g = page.locator('.z-grid').nth(1);
    const f = () => g.locator('.z-row').first().locator('td').nth(1).innerText();
    R.oneClick = { before: await f() };
    await g.locator('th.z-column').nth(1).locator('.z-column-content').click({ position: { x: 30, y: 10 } }); await settle(page);
    R.oneClick.after = await f(); await ctx.close(); }
  return R;
}
(async () => {
  const browser = await chromium.launch();
  const res = { normal: await run(browser, {}), forced: await run(browser, { forcedColors: 'active' }) };
  fs.writeFileSync(__dirname + '/i35-rerun.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
