// DOM probe for the batch 9 RED run: dump the structure of the error box, the loading
// boxes, the real errorbox and the messagebox/window close buttons so the measurement
// scripts can select by class / fixed id. Output: probe-dom.json (no judgments).
const L = require('./lib');

const outline = (sel, depth) => (sel, depth) => {}; // placeholder (unused)

async function dump(page, sel, depth = 4) {
  return page.evaluate(({ sel, depth }) => {
    const R = e => { const r = e.getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
    const walk = (n, d) => {
      if (!n || d < 0) return null;
      const cs = getComputedStyle(n);
      const o = { tag: n.tagName.toLowerCase(), id: n.id || undefined, cls: n.className && typeof n.className === 'string' ? n.className : undefined, rect: R(n), pos: cs.position, disp: cs.display, text: n.childNodes.length && [...n.childNodes].some(c => c.nodeType === 3 && c.textContent.trim()) ? [...n.childNodes].filter(c => c.nodeType === 3).map(c => c.textContent.trim()).join('|').slice(0, 60) : undefined };
      const b = getComputedStyle(n, '::before'); if (b.content && b.content !== 'none' && b.content !== 'normal') o.before = { content: b.content, w: b.width, h: b.height, pos: b.position, disp: b.display };
      const a = getComputedStyle(n, '::after'); if (a.content && a.content !== 'none' && a.content !== 'normal') o.after = { content: a.content, w: a.width, h: a.height, pos: a.position, disp: a.display };
      if (d > 0 && n.children.length) o.ch = [...n.children].map(c => walk(c, d - 1));
      return o;
    };
    return [...document.querySelectorAll(sel)].map(n => walk(n, depth));
  }, { sel, depth });
}

(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  // runtime-error
  {
    const { ctx, page } = await L.open(browser, 'runtime-error.zul');
    await page.getByText('Trigger Error', { exact: true }).click(); await L.settle(page);
    out.runtimeError1 = await dump(page, '#zk_err', 5);
    await page.screenshot({ path: L.OUT + '/probe-runtime-error-1.png', clip: { x: 0, y: 0, width: 1280, height: 400 } });
    await ctx.close();
  }
  // loading: global busy
  {
    const { ctx, page } = await L.open(browser, 'loading.zul');
    await page.getByText('Show Busy', { exact: true }).first().click();
    await page.waitForTimeout(600);
    out.loadingGlobal = await dump(page, '.z-loading, .z-modal-mask, #zk_showBusy, .z-apply-loading, .z-apply-mask', 4);
    await page.screenshot({ path: L.OUT + '/probe-loading-global.png' });
    await ctx.close();
  }
  // loading: component busy
  {
    const { ctx, page } = await L.open(browser, 'loading.zul');
    await page.getByText('Show Busy', { exact: true }).nth(1).click();
    await page.waitForTimeout(600);
    out.loadingComponent = await dump(page, '.z-loading, .z-apply-loading, .z-apply-mask, .z-modal-mask', 4);
    await page.screenshot({ path: L.OUT + '/probe-loading-component.png' });
    await ctx.close();
  }
  // errorbox: real one via the 'no empty' textbox
  {
    const { ctx, page } = await L.open(browser, 'errorbox.zul');
    const tb = page.locator('input.z-textbox').first();
    await tb.click(); await page.keyboard.press('Tab'); await L.settle(page);
    out.errorbox = await dump(page, '.z-errorbox', 3);
    out.errorboxStyles = await page.evaluate(() => [...document.querySelectorAll('.z-errorbox')].map(n => ({ style: n.getAttribute('style'), ptr: n.querySelector('.z-errorbox-pointer') && { cls: n.querySelector('.z-errorbox-pointer').className, style: n.querySelector('.z-errorbox-pointer').getAttribute('style') } })));
    await page.screenshot({ path: L.OUT + '/probe-errorbox.png' });
    await ctx.close();
  }
  // messagebox + window
  {
    const { ctx, page } = await L.open(browser, 'messagebox.zul');
    await page.getByText('Question', { exact: true }).click(); await L.settle(page);
    out.messagebox = await dump(page, '.z-messagebox-window', 3);
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(browser, 'window.zul');
    out.windowClose = await dump(page, '.z-window-close', 1);
    out.windows = await page.evaluate(() => [...document.querySelectorAll('.z-window')].map(n => ({ cls: n.className, hasClose: !!n.querySelector('.z-window-close'), rect: n.getBoundingClientRect().toJSON() })));
    await ctx.close();
  }
  L.save('probe-dom.json', out);
  await browser.close();
  console.log('ok');
})().catch(e => { console.error(e); process.exit(1); });
