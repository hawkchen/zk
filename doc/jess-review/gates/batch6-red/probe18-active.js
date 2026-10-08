// #18 probe: during mousedown on the arrow, is the label change caused by :active or by focus? (blur while holding; check :focus-visible)
const L = require('./lib');
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };
(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  for (const idx of [0, 2]) {
    const { ctx, page } = await L.open(browser, 'combobutton.zul');
    const g = await page.evaluate((idx) => { const n = document.querySelectorAll('.z-combobutton')[idx]; const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; return { root: R(n), button: R(n.querySelector('.z-combobutton-button')), text: R(n.querySelector('.z-combobutton-text')) }; }, idx);
    const labelMean = async (file) => { const S = await L.shot(page, file, { x: g.root.l - 6, y: g.root.t - 6, width: g.root.w + 12, height: g.root.h + 12 }); return mean(S.rect(g.root.l + 4, g.button.l - 2, g.root.t + 2, g.root.b - 3).filter(p => !(p.x >= g.text.l - 1 && p.x < g.text.r + 1 && p.y >= g.text.t - 1 && p.y < g.text.b + 1))); };
    const st = async () => page.evaluate((idx) => { const n = document.querySelectorAll('.z-combobutton')[idx]; return { focused: document.activeElement === n, focusVisible: n.matches(':focus-visible'), active: n.matches(':active'), hover: n.matches(':hover'), cls: n.className }; }, idx);
    const rest = await labelMean(null);
    await page.mouse.move((g.button.l + g.button.r) / 2, (g.button.t + g.button.b) / 2); await page.mouse.down(); await page.waitForTimeout(200);
    const down = await labelMean(`probe18-${idx}-down.png`); const sDown = await st();
    await page.evaluate((idx) => document.querySelectorAll('.z-combobutton')[idx].blur(), idx); await page.waitForTimeout(200);
    const downBlurred = await labelMean(`probe18-${idx}-down-blurred.png`); const sBlur = await st();
    await page.mouse.up(); await page.waitForTimeout(300);
    const afterUp = await labelMean(`probe18-${idx}-up.png`); const sUp = await st();
    out[idx] = { rest, down, downState: sDown, downDE: +L.dE(down, rest).toFixed(2), downBlurred, blurState: sBlur, downBlurredDE: +L.dE(downBlurred, rest).toFixed(2), afterUp, upState: sUp, afterUpDE: +L.dE(afterUp, rest).toFixed(2) };
    await ctx.close();
  }
  await browser.close(); L.save('probe18-active.json', out); console.log(JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
