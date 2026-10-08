// #26 FINAL probe: glyph ink bbox of the knob input text at rest vs focus (must not shift), measured on the pixels.
const L = require('./lib');
(async () => {
  const browser = await L.chromium.launch(); const out = {};
  for (const state of ['rest', 'focus']) {
    const { ctx, page } = await L.open(browser, 'slider.zul');
    const info = async () => page.evaluate(() => { const n = [...document.querySelectorAll('.z-slider')].filter(x => x.querySelector('.z-slider-input'))[0]; const i = n.querySelector('.z-slider-input'); const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; const s = getComputedStyle(i); return { root: R(n), input: R(i), focused: document.activeElement === i, pad: s.padding, border: s.borderWidth, boxSizing: s.boxSizing, lineHeight: s.lineHeight, height: s.height }; });
    const k0 = await info(); await page.evaluate(y => window.scrollTo(0, y), Math.max(0, k0.root.t - 100)); await page.waitForTimeout(150);
    let k = await info();
    if (state === 'focus') { await page.mouse.click((k.input.l + k.input.r) / 2, (k.input.t + k.input.b) / 2); await page.waitForTimeout(250); await page.mouse.move(2, 2); await page.waitForTimeout(150); k = await info(); }
    const S = await L.shot(page, `probe26-ink-${state}.png`, { x: k.input.l - 4, y: k.input.t - 4, width: k.input.w + 8, height: k.input.h + 8 });
    // ink = pixels inside the rect inset 4px (past the 2px focus border) that are blue-ish text: ΔE from white ≥ 20 and not the border colour band (inset guarantees)
    const px = S.rect(k.input.l + 4, k.input.r - 5, k.input.t + 4, k.input.b - 5).filter(p => L.dE(p.c, [255, 255, 255]) >= 20);
    const xs = px.map(p => p.x), ys = px.map(p => p.y);
    out[state] = { input: k.input, focused: k.focused, pad: k.pad, border: k.border, boxSizing: k.boxSizing, n: px.length, ink: { l: Math.min(...xs), r: Math.max(...xs) + 0.5, t: Math.min(...ys), b: Math.max(...ys) + 0.5 } };
    await ctx.close();
  }
  await browser.close(); L.save('probe26-ink.json', out); console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
