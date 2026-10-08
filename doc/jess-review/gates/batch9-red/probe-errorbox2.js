// Probe 2: reproduce the designer's screen (usecase item-editor SKU field) and find setups for the 'right' and 'down' pointers. Output: probe-errorbox2.json
const L = require('./lib');

async function trigger(page, input, how) {
  await input.click(); await page.keyboard.type('x'); await page.keyboard.press('Backspace');
  if (how === 'tab') await page.keyboard.press('Tab'); else await page.mouse.click(5, 5);
  await page.waitForTimeout(600);
}
async function real(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    return [...document.querySelectorAll('.z-errorbox')].filter(n => zk.$(n) && zk.$(n).className === 'zul.inp.Errorbox').map(n => {
      const p = n.querySelector('.z-errorbox-pointer'); const w = zk.$(n); const inp = w.parent && w.parent.getInputNode && w.parent.getInputNode();
      return { id: n.id, style: n.getAttribute('style'), box: R(n), ptr: { cls: p.className, style: p.getAttribute('style'), rect: R(p) }, content: R(n.querySelector('.z-errorbox-content')), input: inp && R(inp), vp: [innerWidth, innerHeight], scrollY };
    });
  });
}

(async () => {
  const browser = await L.chromium.launch();
  const out = [];
  // A. designer's route: usecase index -> Item Detail -> SKU
  {
    const { ctx, page } = await L.open(browser, 'usecase/index.zul');
    await page.getByText('Item Detail', { exact: true }).click(); await L.settle(page); await page.waitForTimeout(800);
    const sku = page.locator('input.z-textbox').nth(1);
    await trigger(page, sku, 'tab');
    out.push({ case: 'usecase index -> item-editor SKU, tab', boxes: await real(page) });
    await page.screenshot({ path: L.OUT + '/probe-eb2-A.png' });
    await ctx.close();
  }
  // B. item-editor directly
  {
    const { ctx, page } = await L.open(browser, 'usecase/item-editor.zul');
    const sku = page.locator('input.z-textbox').nth(1);
    await trigger(page, sku, 'tab');
    out.push({ case: 'item-editor direct, tab', boxes: await real(page) });
    await page.screenshot({ path: L.OUT + '/probe-eb2-B.png' });
    await ctx.close();
  }
  // C. errorbox.zul full width, blur by clicking blank
  {
    const { ctx, page } = await L.open(browser, 'errorbox.zul');
    const inp = page.locator('input.z-textbox').nth(2);
    await trigger(page, inp, 'click');
    out.push({ case: 'errorbox.zul full-width, blur by click', boxes: await real(page) });
    await page.screenshot({ path: L.OUT + '/probe-eb2-C.png' });
    await ctx.close();
  }
  // D. 'down' pointer attempts: narrow + short viewports, full-width field
  for (const vp of [{ width: 420, height: 330 }, { width: 420, height: 310 }, { width: 420, height: 290 }, { width: 360, height: 300 }]) {
    const { ctx, page } = await L.open(browser, 'errorbox.zul', { viewport: vp });
    const inp = page.locator('input.z-textbox').nth(2);
    await inp.scrollIntoViewIfNeeded();
    await trigger(page, inp, 'click');
    out.push({ case: 'down attempt vp ' + vp.width + 'x' + vp.height, boxes: await real(page) });
    await page.screenshot({ path: L.OUT + `/probe-eb2-D-${vp.width}x${vp.height}.png` });
    await ctx.close();
  }
  // E. item-editor SKU in narrow/short viewport
  for (const vp of [{ width: 420, height: 300 }, { width: 420, height: 900 }]) {
    const { ctx, page } = await L.open(browser, 'usecase/item-editor.zul', { viewport: vp });
    const sku = page.locator('input.z-textbox').nth(1);
    await sku.scrollIntoViewIfNeeded();
    await trigger(page, sku, 'tab');
    out.push({ case: 'item-editor SKU vp ' + vp.width + 'x' + vp.height, boxes: await real(page) });
    await page.screenshot({ path: L.OUT + `/probe-eb2-E-${vp.width}x${vp.height}.png` });
    await ctx.close();
  }
  L.save('probe-errorbox2.json', out);
  await browser.close();
  for (const c of out) { console.log('==', c.case); for (const b of c.boxes) console.log('  box', JSON.stringify(b.box), 'scrollY', b.scrollY, '\n  ptr', JSON.stringify(b.ptr), '\n  content', JSON.stringify(b.content), '\n  input', JSON.stringify(b.input)); }
})().catch(e => { console.error(e); process.exit(1); });
