// #72 RED reproduction only: background-color / color of the messagebox close button at rest and on hover,
// and the same for an ordinary window's close button (window.zul: embedded closable + overlapped). Output: red72.json + red72-*.png
const L = require('./lib');

async function colors(page, sel) {
  return page.evaluate((sel) => {
    const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); const i = e.querySelector('i'); const is = i && getComputedStyle(i); const ib = i && getComputedStyle(i, '::before');
    const r = e.getBoundingClientRect();
    return { rect: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }, cls: e.className, backgroundColor: s.backgroundColor, color: s.color, borderRadius: s.borderRadius, opacity: s.opacity, icon: i ? { cls: i.className, color: is.color, beforeColor: ib.color, beforeBg: ib.backgroundColor, beforeContent: ib.content, beforeMask: ib.webkitMaskImage || ib.maskImage } : null, hoverMatches: e.matches(':hover') };
  }, sel);
}
async function measure(page, sel, shotName) {
  await page.mouse.move(2, 2); await page.waitForTimeout(250);
  const rest = await colors(page, sel);
  const c = rest.rect;
  await page.mouse.move(c.l + c.w / 2, c.t + c.h / 2); await page.waitForTimeout(350);
  const hover = await colors(page, sel);
  const S = await L.shot(page, shotName, { x: c.l - 40, y: c.t - 16, width: c.w + 80, height: c.h + 32 });
  // pixel: median colour of the button interior (inset 6px) and of the glyph pixels (ΔE ≥ 20 from the interior median)
  const px = S.rect(c.l + 6, c.r - 7, c.t + 6, c.b - 7);
  const bg = L.median(px.map(p => p.c)); const ink = px.filter(p => L.dE(p.c, bg) >= 20);
  const inkColor = ink.length ? L.median(ink.map(p => p.c)) : null;
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  return { rest, hover, pixelHover: { interiorMedian: bg, glyphMedian: inkColor, glyphPixels: ink.length } };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'computed backgroundColor/color at rest and with the pointer on the button centre; pixel medians from the hover screenshot (DPR 2)' };
  {
    const { ctx, page } = await L.open(browser, 'messagebox.zul');
    await page.getByText('Question', { exact: true }).click(); await L.settle(page);
    out.messageboxQuestion = await measure(page, '.z-messagebox-window .z-window-close', 'red72-messagebox-hover.png');
    out.messageboxQuestion.header = await page.evaluate(() => { const h = document.querySelector('.z-messagebox-window .z-window-header'); const s = getComputedStyle(h); return { backgroundColor: s.backgroundColor, color: s.color }; });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(browser, 'messagebox.zul');
    await page.getByText('Error', { exact: true }).click(); await L.settle(page);
    out.messageboxError = await measure(page, '.z-messagebox-window .z-window-close', 'red72-messagebox-error-hover.png');
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(browser, 'window.zul');
    out.windowEmbedded = await measure(page, '.z-window-embedded:not(.z-window-noborder) .z-window-close', 'red72-window-embedded-hover.png');
    out.windowOverlapped = await measure(page, '.z-window-overlapped:not(.z-window-noborder) .z-window-close', 'red72-window-overlapped-hover.png');
    await ctx.close();
  }
  L.save('red72.json', out);
  await browser.close();
  for (const [k, v] of Object.entries(out)) if (v && v.rest) console.log(k, JSON.stringify({ rest: { bg: v.rest.backgroundColor, color: v.rest.color, iconColor: v.rest.icon && v.rest.icon.color }, hover: { bg: v.hover.backgroundColor, color: v.hover.color, iconColor: v.hover.icon && v.hover.icon.color, matches: v.hover.hoverMatches }, px: v.pixelHover, header: v.header }));
})().catch(e => { console.error(e); process.exit(1); });
