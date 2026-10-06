const { launch, open, idle, cursorAt } = require('./common');
const snapState = (page, rootIdx) => page.evaluate((rootIdx) => {
  const root = document.querySelectorAll('.z-splitlayout')[rootIdx];
  const sp = [...root.querySelectorAll('.z-splitlayout-splitter')].find((s) => s.closest('.z-splitlayout') === root);
  const attrs = (e) => e ? Object.fromEntries([...e.attributes].map((a) => [a.name, a.value])) : null;
  const ghost = document.getElementById('zk_ddghost');
  return {
    splitter: { cls: sp.className, attrs: attrs(sp) },
    root: { cls: root.className, attrs: attrs(root) },
    ghost: ghost ? { cls: ghost.className, attrs: attrs(ghost), cursor: getComputedStyle(ghost).cursor } : null,
    body: { cls: document.body.className, attrs: attrs(document.body) },
    html: { cls: document.documentElement.className, style: document.documentElement.getAttribute('style') },
  };
}, rootIdx);
const geom = (page, rootIdx) => page.evaluate((rootIdx) => {
  const root = document.querySelectorAll('.z-splitlayout')[rootIdx];
  const sp = [...root.querySelectorAll('.z-splitlayout-splitter')].find((s) => s.closest('.z-splitlayout') === root);
  const btn = sp.querySelector('.z-splitlayout-splitter-button');
  const r = (e) => { const b = e.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; };
  const panes = [...root.children].filter((c) => c !== sp && !c.classList.contains('z-splitlayout-splitter')).map((c) => ({ cls: c.className, ...r(c) }));
  return { splitter: r(sp), splitterCls: sp.className, button: btn ? { ...r(btn), cls: btn.className } : null, panes };
}, rootIdx);
async function dragProbe(page, rootIdx, dx, dy) {
  const g0 = await geom(page, rootIdx);
  const s = g0.splitter, b = g0.button;
  // a point on the bar, outside the button: along the bar axis, a quarter of the bar length from its start
  let sx, sy;
  if (s.h > s.w) { sx = s.x + s.w / 2; sy = s.y + s.h / 4; } else { sx = s.x + s.w / 4; sy = s.y + s.h / 2; }
  const inBtn = b && sx >= b.x && sx <= b.x + b.w && sy >= b.y && sy <= b.y + b.h;
  await page.mouse.move(sx, sy); await idle(page);
  const barCursor = await cursorAt(page, sx, sy);
  const idleState = await snapState(page, rootIdx);
  await page.mouse.down();
  await page.mouse.move(sx + dx, sy + dy, { steps: 5 });
  await page.waitForTimeout(150);
  const dragCursor = await cursorAt(page, sx + dx, sy + dy);
  const dragState = await snapState(page, rootIdx);
  await page.mouse.up(); await idle(page); await page.waitForTimeout(300);
  const afterState = await snapState(page, rootIdx);
  const g1 = await geom(page, rootIdx);
  const sizeKey = s.h > s.w ? 'w' : 'h';
  const paneDelta = g0.panes.map((p, i) => g1.panes[i][sizeKey] - p[sizeKey]);
  return { start: { x: sx, y: sy, insideButton: inBtn }, barCursor, idleState, dragCursor, dragState, afterState, panesBefore: g0.panes, panesAfter: g1.panes, sizeKey, paneDelta };
}
(async () => {
  const browser = await launch();
  const out = {};
  let page = await open(browser, '/splitlayout.zul');
  out.roots = await page.evaluate(() => [...document.querySelectorAll('.z-splitlayout')].map((r, i) => i + ': ' + r.className));
  out.allSplitters = await page.evaluate(() => [...document.querySelectorAll('.z-splitlayout-splitter')].map((s) => s.className + ' | btn=' + (s.querySelector('.z-splitlayout-splitter-button') || {}).className));
  out.nosplitterCount = await page.evaluate(() => document.querySelectorAll('.z-splitlayout-splitter-nosplitter').length);
  for (const [i, name] of [[0, 'first'], [1, 'second']]) {
    const g = await geom(page, i);
    const cx = g.button.x + g.button.w / 2, cy = g.button.y + g.button.h / 2;
    await page.mouse.move(cx, cy); await idle(page);
    out[name + 'ButtonCursor'] = { geom: g, at: { x: cx, y: cy }, ...(await cursorAt(page, cx, cy)) };
  }
  out.firstDrag = await dragProbe(page, 0, 40, 0);
  out.secondDrag = await dragProbe(page, 1, 0, 40);
  await page.context().close();
  // third splitlayout (collapse="before"): button cursor + click collapses (fresh page)
  page = await open(browser, '/splitlayout.zul');
  await page.evaluate(() => document.querySelectorAll('.z-splitlayout')[2].querySelector('.z-splitlayout-splitter-button').scrollIntoView({ block: 'center' })); await idle(page);
  const g3 = await geom(page, 2);
  const c3 = { x: g3.button.x + g3.button.w / 2, y: g3.button.y + g3.button.h / 2 };
  await page.mouse.move(c3.x, c3.y); await idle(page);
  out.third = { geomBefore: g3, buttonCursor: await cursorAt(page, c3.x, c3.y) };
  await page.mouse.click(c3.x, c3.y); await idle(page); await page.waitForTimeout(500);
  out.third.geomAfterClick = await geom(page, 2);
  await page.context().close();
  // box splitter (splitter.zul, top-level splitter of first hbox) and borderlayout west splitter: drag cursor baseline
  page = await open(browser, '/splitter.zul');
  out.boxSplitter = await page.evaluate(() => [...document.querySelectorAll('.z-splitter')].slice(0, 2).map((s) => s.className));
  {
    const sp = page.locator('.z-hbox').first().locator('xpath=.//*[contains(concat(" ",normalize-space(@class)," ")," z-splitter ")]').last();
    const r = await sp.boundingBox();
    const sx = r.x + r.width / 2, sy = r.y + r.height / 4;
    await page.mouse.move(sx, sy); await idle(page);
    const idleC = await cursorAt(page, sx, sy);
    await page.mouse.down(); await page.mouse.move(sx + 40, sy, { steps: 5 }); await page.waitForTimeout(150);
    const dragC = await cursorAt(page, sx + 40, sy);
    const ghost = await page.evaluate(() => { const g = document.getElementById('zk_ddghost'); return g ? g.className : null; });
    await page.mouse.up(); await idle(page);
    out.boxDrag = { splitterCls: await sp.getAttribute('class'), rect: r, idleCursor: idleC, dragCursor: dragC, ghostCls: ghost };
  }
  await page.context().close();
  page = await open(browser, '/borderlayout.zul');
  {
    const sp = page.locator('.z-borderlayout').first().locator('.z-west-splitter').first();
    const cnt = await sp.count();
    if (cnt) {
      const r = await sp.boundingBox();
      const sx = r.x + r.width / 2, sy = r.y + r.height / 4;
      await page.mouse.move(sx, sy); await idle(page);
      const idleC = await cursorAt(page, sx, sy);
      await page.mouse.down(); await page.mouse.move(sx + 40, sy, { steps: 5 }); await page.waitForTimeout(150);
      const dragC = await cursorAt(page, sx + 40, sy);
      const ghost = await page.evaluate(() => { const g = document.getElementById('zk_ddghost'); return g ? g.className : null; });
      await page.mouse.up(); await idle(page);
      out.borderlayoutDrag = { splitterCls: await sp.getAttribute('class'), rect: r, idleCursor: idleC, dragCursor: dragC, ghostCls: ghost };
    } else out.borderlayoutDrag = 'no .z-west-splitter found';
  }
  await page.context().close();
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})();
