// Probe: how to trigger a real errorbox and which pointer direction each setup yields. Output: probe-errorbox.json
const L = require('./lib');

async function trigger(page, input) {
  await input.click(); await page.keyboard.type('x'); await page.keyboard.press('Backspace'); await page.keyboard.press('Tab');
  await page.waitForTimeout(600);
}
async function real(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    return [...document.querySelectorAll('.z-errorbox')].filter(n => zk.$(n) && zk.$(n).className === 'zul.inp.Errorbox').map(n => {
      const p = n.querySelector('.z-errorbox-pointer'); const w = zk.$(n); const f = w.parent && w.parent.$n(); const inp = w.parent && w.parent.getInputNode && w.parent.getInputNode();
      return { id: n.id, cls: n.className, style: n.getAttribute('style'), box: R(n), ptr: { cls: p.className, style: p.getAttribute('style'), rect: R(p) }, content: R(n.querySelector('.z-errorbox-content')), field: f && R(f), input: inp && R(inp), vp: [innerWidth, innerHeight] };
    });
  });
}

(async () => {
  const browser = await L.chromium.launch();
  const out = [];
  const cases = [
    { name: 'left-of-200px (default vp)', vp: { width: 1280, height: 900 }, nth: 0 },
    { name: 'full-width (default vp)', vp: { width: 1280, height: 900 }, nth: 2 },
    { name: 'full-width narrow vp 420x900', vp: { width: 420, height: 900 }, nth: 2 },
    { name: 'full-width narrow vp 420x360 (field near bottom)', vp: { width: 420, height: 360 }, nth: 2 },
    { name: 'no-empty 200px narrow vp 420x900', vp: { width: 420, height: 900 }, nth: 0 },
  ];
  for (const c of cases) {
    const { ctx, page } = await L.open(browser, 'errorbox.zul', { viewport: c.vp });
    const inputs = page.locator('input.z-textbox');
    const inp = inputs.nth(c.nth);
    await inp.scrollIntoViewIfNeeded();
    await trigger(page, inp);
    const r = await real(page);
    out.push({ case: c.name, boxes: r });
    await page.screenshot({ path: L.OUT + `/probe-eb-${out.length}.png` });
    await ctx.close();
  }
  L.save('probe-errorbox.json', out);
  await browser.close();
  console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
