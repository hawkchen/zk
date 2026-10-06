const { launch, open, idle, cursorAt } = require('./common');
const OUT = __dirname + '/i67';
const ctr = (r) => ({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
async function run(browser, forced) {
  const out = {};
  const page = await open(browser, '/errorbox.zul', { forcedColors: forced });
  // static sample
  const st = page.locator('.z-errorbox').first();
  out.staticId = await st.getAttribute('id');
  const stc = await st.locator('.z-errorbox-content').boundingBox();
  const p1 = ctr(stc); await page.mouse.move(p1.x, p1.y); await idle(page);
  out.step1 = { at: p1, ...(await cursorAt(page, p1.x, p1.y)) };
  const stClose = await st.locator('.z-errorbox-close').boundingBox();
  const pc = ctr(stClose); await page.mouse.move(pc.x, pc.y); await idle(page);
  out.staticClose = { at: pc, ...(await cursorAt(page, pc.x, pc.y)) };
  if (forced) await st.screenshot({ path: `${OUT}/forced-static.png` });
  // real errorbox
  const tb = page.locator('input[placeholder="Required field"]');
  await tb.click(); await idle(page);
  await page.mouse.click(1200, 120); await idle(page); await page.waitForTimeout(500);
  // the real errorbox = a .z-errorbox whose ZK widget is an Errorbox (the static sample is a native h:div)
  out.errorboxes = await page.evaluate(() => [...document.querySelectorAll('.z-errorbox')].map((e) => { const w = zk.Widget.$(e); return { id: e.id, widget: w ? w.widgetName : null, own: !!(w && w.$n() === e) }; }));
  const realIds = out.errorboxes.filter((e) => e.widget === 'errorbox' && e.own).map((e) => e.id);
  out.realCount = realIds.length;
  const rb = page.locator('#' + realIds[0]);
  out.realId = realIds[0];
  const rcBox = await rb.locator('.z-errorbox-content').boundingBox();
  const p2 = ctr(rcBox); await page.mouse.move(p2.x, p2.y); await idle(page);
  out.step2 = { at: p2, ...(await cursorAt(page, p2.x, p2.y)) };
  if (forced) await rb.screenshot({ path: `${OUT}/forced-real.png` }); else await rb.screenshot({ path: `${OUT}/real.png` });
  const before = await rb.boundingBox();
  await page.mouse.down(); await page.mouse.move(p2.x + 40, p2.y, { steps: 5 }); await page.mouse.up(); await idle(page); await page.waitForTimeout(300);
  const after = await rb.boundingBox();
  out.step3 = { before, after, dx: after.x - before.x, dy: after.y - before.y, dist: Math.hypot(after.x - before.x, after.y - before.y) };
  const cl = await rb.locator('.z-errorbox-close').boundingBox();
  const p4 = ctr(cl); await page.mouse.move(p4.x, p4.y); await idle(page);
  out.step4 = { at: p4, ...(await cursorAt(page, p4.x, p4.y)) };
  out.closeCss = await rb.locator('.z-errorbox-close').evaluate((e) => ({ close: getComputedStyle(e).cursor, icon: e.firstElementChild ? getComputedStyle(e.firstElementChild).cursor : null }));
  out.forcedMedia = await page.evaluate(() => matchMedia('(forced-colors: active)').matches);
  await page.context().close();
  return out;
}
(async () => {
  const browser = await launch();
  const res = { normal: await run(browser, false), forced: await run(browser, true) };
  await browser.close();
  console.log(JSON.stringify(res, null, 1));
})();
