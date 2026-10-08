// Batch 7 FINAL, after-fix screenshots for the Jess comments. Real scrollbars (no --hide-scrollbars), DPR 2,
// animations off. Files: jess-3-bandbox-popup-after.png, jess-3-listbox-plain-after.png (listbox-header.zul #9),
// jess-29-selectbox-default-after.png, jess-29-selectbox-open-after.png. Nothing is measured here.
const L = require('./lib.js');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  // #3 bandbox popup with listbox (last bandbox on bandbox.zul), opened
  { const { ctx, page } = await L.open(browser, 'bandbox.zul');
    const info = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const bbs = [...document.querySelectorAll('.z-bandbox')]; const rich = bbs[bbs.length - 1]; return { rect: R(rich), button: R(rich.querySelector('.z-bandbox-button')) }; }, R.toString());
    await page.mouse.click(info.button.l + info.button.w / 2, info.button.t + info.button.h / 2); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const O = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); return R(document.querySelector('.z-bandbox-popup')); }, R.toString());
    await L.shot(page, 'jess-3-bandbox-popup-after.png', { x: Math.min(info.rect.l, O.l) - 16, y: info.rect.t - 12, width: Math.max(info.rect.r, O.r) - Math.min(info.rect.l, O.l) + 32, height: O.b - info.rect.t + 28 });
    await ctx.close(); }
  // #3 plain scrolling listbox: listbox-header.zul #9
  { const { ctx, page } = await L.open(browser, 'listbox-header.zul');
    const g0 = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); return R(document.querySelectorAll('.z-listbox')[9]); }, R.toString());
    await page.evaluate(y => window.scrollTo(0, Math.max(0, y - 60)), g0.t); await page.waitForTimeout(400); await page.mouse.move(2, 2);
    const g = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); return R(document.querySelectorAll('.z-listbox')[9]); }, R.toString());
    await L.shot(page, 'jess-3-listbox-plain-after.png', { x: g.l - 12, y: g.t - 12, width: g.w + 24, height: g.h + 24 });
    await ctx.close(); }
  // #29 selectbox default (first three selectboxes: rest, disabled, pre-selected area) and open
  { const { ctx, page } = await L.open(browser, 'selectbox.zul');
    const b = await page.evaluate((Rs) => { const R = new Function('return ' + Rs)(); const els = [...document.querySelectorAll('.z-selectbox')]; return { first: R(els[0]), all: els.map(R) }; }, R.toString());
    const x0 = Math.min(...b.all.map(r => r.l)), x1 = Math.max(...b.all.map(r => r.r)), y0 = Math.min(...b.all.map(r => r.t)), y1 = Math.max(...b.all.map(r => r.b));
    await L.shot(page, 'jess-29-selectbox-default-after.png', { x: x0 - 16, y: y0 - 16, width: Math.min(x1 - x0 + 32, 1280), height: y1 - y0 + 32 });
    await L.shot(page, 'jess-29-selectbox-default-after-zoom.png', { x: b.first.l - 8, y: b.first.t - 8, width: b.first.w + 16, height: b.first.h + 16 });
    await page.mouse.click(b.first.l + b.first.w / 2, b.first.t + b.first.h / 2); await page.waitForTimeout(500); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    await L.shot(page, 'jess-29-selectbox-open-after.png', { x: b.first.l - 16, y: b.first.t - 16, width: 360, height: 320 });
    await ctx.close(); }
  await browser.close();
  console.log('done');
})();
