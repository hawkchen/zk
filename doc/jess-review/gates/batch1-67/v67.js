const { launch, open, idle, cursorAt } = require('./common');
const fs = require('fs');
const OUT = __dirname + '/i67';
const BASE_RED = '/Users/hawk/Documents/workspace/ZK10/zk/doc/jess-review/gates/batch1-red/i67';
const ctr = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
async function run(browser, forced) {
  const out = {};
  const page = await open(browser, '/errorbox.zul', { forcedColors: forced });
  out.initial = await page.evaluate(() => [...document.querySelectorAll('.z-errorbox')].map((e) => { const w = zk.Widget.$(e); const r = e.getBoundingClientRect(); return { id: e.id, widget: w ? w.widgetName : null, own: !!(w && w.$n() === e), text: e.textContent.trim().slice(0, 60), x: r.x, y: r.y, w: r.width, h: r.height }; }));
  const st = page.locator('.z-errorbox').first();
  out.staticId = await st.getAttribute('id');
  const stc = await st.locator('.z-errorbox-content').boundingBox();
  const p1 = ctr(stc); await page.mouse.move(p1.x, p1.y); await idle(page);
  out.step1 = { at: p1, ...(await cursorAt(page, p1.x, p1.y)) };
  const stClose = await st.locator('.z-errorbox-close').boundingBox();
  const pc = ctr(stClose); await page.mouse.move(pc.x, pc.y); await idle(page);
  out.staticClose = { at: pc, ...(await cursorAt(page, pc.x, pc.y)) };
  await page.mouse.move(1270, 890); await idle(page);
  await st.screenshot({ path: `${OUT}/${forced ? 'forced-' : ''}static.png` });
  const tb = page.locator('input[placeholder="Required field"]');
  await tb.click(); await idle(page);
  await page.mouse.click(1200, 120); await idle(page); await page.waitForTimeout(500);
  out.errorboxes = await page.evaluate(() => [...document.querySelectorAll('.z-errorbox')].map((e) => { const w = zk.Widget.$(e); return { id: e.id, widget: w ? w.widgetName : null, own: !!(w && w.$n() === e) }; }));
  const realIds = out.errorboxes.filter((e) => e.widget === 'errorbox' && e.own).map((e) => e.id);
  out.realCount = realIds.length; out.realId = realIds[0];
  const rb = page.locator('#' + realIds[0]);
  const rcBox = await rb.locator('.z-errorbox-content').boundingBox();
  const p2 = ctr(rcBox); await page.mouse.move(p2.x, p2.y); await idle(page);
  out.step2 = { at: p2, ...(await cursorAt(page, p2.x, p2.y)) };
  await rb.screenshot({ path: `${OUT}/${forced ? 'forced-' : ''}real.png` });
  out.realCss = await rb.evaluate((e) => { const c = e.querySelector('.z-errorbox-content'); const s = getComputedStyle(e), cs = getComputedStyle(c); return { boxBg: s.backgroundColor, boxBorder: s.border, boxCursor: s.cursor, contentCursor: cs.cursor, contentColor: cs.color }; });
  const before = await rb.boundingBox();
  await page.mouse.down(); await page.mouse.move(p2.x + 40, p2.y, { steps: 5 }); await page.mouse.up(); await idle(page); await page.waitForTimeout(300);
  const after = await rb.boundingBox();
  out.step3 = { before, after, dx: after.x - before.x, dy: after.y - before.y, dist: Math.hypot(after.x - before.x, after.y - before.y) };
  const cl = await rb.locator('.z-errorbox-close').boundingBox();
  const p4 = ctr(cl); await page.mouse.move(p4.x, p4.y); await idle(page);
  out.step4 = { at: p4, ...(await cursorAt(page, p4.x, p4.y)) };
  out.forcedMedia = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
  await page.context().close();
  return out;
}
async function cmp(browser, a, b) {
  if (!fs.existsSync(a) || !fs.existsSync(b)) return { missing: true };
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  const r = await page.evaluate(async ([da, db]) => {
    const load = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; });
    const [ia, ib] = await Promise.all([load(da), load(db)]);
    if (ia.width !== ib.width || ia.height !== ib.height) return { sizeA: [ia.width, ia.height], sizeB: [ib.width, ib.height] };
    const g = (i) => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return x.getImageData(0, 0, i.width, i.height).data; };
    const pa = g(ia), pb = g(ib); let n = 0, max = 0, chroma = 0;
    for (let k = 0; k < pa.length; k += 4) { const d = Math.max(Math.abs(pa[k]-pb[k]), Math.abs(pa[k+1]-pb[k+1]), Math.abs(pa[k+2]-pb[k+2])); if (d) { n++; max = Math.max(max, d); } }
    return { size: [ia.width, ia.height], diffPx: n, maxChannelDiff: max };
  }, ['data:image/png;base64,' + fs.readFileSync(a).toString('base64'), 'data:image/png;base64,' + fs.readFileSync(b).toString('base64')]);
  await ctx.close(); return r;
}
(async () => {
  const browser = await launch();
  const res = { normal: await run(browser, false), forced: await run(browser, true) };
  res.cmpForcedReal = await cmp(browser, `${OUT}/forced-real.png`, `${BASE_RED}/forced-real.png`);
  res.cmpForcedStatic = await cmp(browser, `${OUT}/forced-static.png`, `${BASE_RED}/forced-static.png`);
  res.cmpNormalReal = await cmp(browser, `${OUT}/real.png`, `${BASE_RED}/real.png`);
  await browser.close();
  fs.writeFileSync(__dirname + '/v67.out.json', JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res, null, 1));
})();
