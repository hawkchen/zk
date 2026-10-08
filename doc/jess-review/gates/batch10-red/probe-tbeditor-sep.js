// #61: group separator (::before of .z-tbeditor-button-group) size / colour, button hover bg, and the two icons drawn black.
const L = require('./lib');
(async () => { const browser = await L.chromium.launch(); const { ctx, page } = await L.open(browser, 'portallayout.zul');
  const d = await page.evaluate(() => { const gs = [...document.querySelectorAll('.z-tbeditor-button-group')]; const b = gs[1].querySelector('button'); const bs = getComputedStyle(b);
    return { sep: gs.slice(0, 3).map(g => { const s = getComputedStyle(g, '::before'); return { content: s.content, w: s.width, h: s.height, bg: s.backgroundColor, border: s.borderLeftWidth + ' ' + s.borderLeftColor, position: s.position, left: s.left, top: s.top, margin: s.margin }; }),
      button: { bg: bs.backgroundColor, radius: bs.borderRadius, color: bs.color, fill: getComputedStyle(b.querySelector('svg')).fill }, notDisable: [...document.querySelectorAll('.z-tbeditor-button-pane button')].filter(x => getComputedStyle(x.querySelector('svg')).fill !== 'rgba(0, 0, 0, 0.6)').map(x => x.title + ':' + getComputedStyle(x.querySelector('svg')).fill + '/' + getComputedStyle(x.querySelector('svg')).color) }; });
  const r = await page.evaluate(() => { const b = document.querySelectorAll('.z-tbeditor-button-group')[1].querySelector('button'); const x = b.getBoundingClientRect(); return { l: x.left, t: x.top, w: x.width, h: x.height }; });
  await page.mouse.move(r.l + r.w / 2, r.t + r.h / 2); await page.waitForTimeout(300);
  d.hover = await page.evaluate(() => { const b = document.querySelectorAll('.z-tbeditor-button-group')[1].querySelector('button'); const s = getComputedStyle(b); return { hover: b.matches(':hover'), bg: s.backgroundColor, fill: getComputedStyle(b.querySelector('svg')).fill, radius: s.borderRadius }; });
  await L.shot(page, 'red61-hover-undo.png', { x: r.l - 8, y: r.t - 8, width: r.w + 16, height: r.h + 16 });
  console.log(JSON.stringify(d)); await ctx.close(); await browser.close(); })().catch(e => { console.error(e); process.exit(1); });
