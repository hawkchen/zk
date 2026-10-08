// #18 FINAL probe: while the mouse is held on the arrow (or the label), which part of the label/arrow change comes from :active and which from focus-within?
// Hold -> measure; blur() while still holding -> measure; release -> measure. Same ring/label sample sets as red18.js. Output: probe18-active.json + probe18-*.png.
const L = require('./lib');
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };
async function geom(page, idx) {
  return page.evaluate((idx) => {
    const n = document.querySelectorAll('.z-combobutton')[idx];
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    return { root: R(n), content: R(n.querySelector('.z-combobutton-content')), button: R(n.querySelector('.z-combobutton-button')), text: R(n.querySelector('.z-combobutton-text')) };
  }, idx);
}
function samples(S, g) {
  const A = g.button, C = g.content, T = g.text;
  const all = S.rect(C.l, C.r - 1, C.t, C.b - 1);
  const ring = all.filter(p => p.x >= A.l + 1.5 && p.x < A.r && p.y >= A.t && p.y < A.b &&
    (p.x < A.l + 1.5 + 3 || p.x >= A.r - 3 || p.y < A.t + 3 || p.y >= A.b - 3) &&
    !((p.x >= A.r - 4 && p.y < A.t + 4) || (p.x >= A.r - 4 && p.y >= A.b - 4)));
  const label = all.filter(p => p.x >= C.l + 2 && p.x < A.l - 1 && p.y >= C.t + 2 && p.y < C.b - 2 &&
    !(p.x >= T.l - 1 && p.x < T.r + 1 && p.y >= T.t - 1 && p.y < T.b + 1) &&
    !((p.x < C.l + 4 && p.y < C.t + 4) || (p.x < C.l + 4 && p.y >= C.b - 4)));
  return { ring: mean(ring), label: mean(label) };
}
(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  for (const [name, idx] of [['filled', 0], ['toolbar', 2]]) {
    for (const where of ['arrow', 'label']) {
      const { ctx, page } = await L.open(browser, 'combobutton.zul');
      const g = await geom(page, idx);
      const cap = async (file) => samples(await L.shot(page, file, { x: g.root.l - 6, y: g.root.t - 6, width: g.root.w + 12, height: g.root.h + 12 }), g);
      const st = async () => page.evaluate((idx) => { const n = document.querySelectorAll('.z-combobutton')[idx]; const b = n.querySelector('.z-combobutton-button'); return { focused: document.activeElement === n, focusWithin: n.matches(':focus-within'), focusVisible: n.matches(':focus-visible'), active: n.matches(':active'), hover: n.matches(':hover'), buttonHover: b.matches(':hover'), buttonActive: b.matches(':active'), cls: n.className }; }, idx);
      const rest = await cap(null);
      const pt = where === 'arrow' ? [(g.button.l + g.button.r) / 2, (g.button.t + g.button.b) / 2] : [(g.content.l + g.button.l) / 2, (g.content.t + g.content.b) / 2];
      await page.mouse.move(pt[0], pt[1]); await page.waitForTimeout(150);
      const hover = await cap(null); const sHover = await st();
      await page.mouse.down(); await page.waitForTimeout(200);
      const down = await cap(`probe18-${name}-${where}-down.png`); const sDown = await st();
      await page.evaluate((idx) => document.querySelectorAll('.z-combobutton')[idx].blur(), idx); await page.waitForTimeout(200);
      const downBlurred = await cap(`probe18-${name}-${where}-down-blurred.png`); const sBlur = await st();
      await page.mouse.up(); await page.waitForTimeout(300);
      const up = await cap(`probe18-${name}-${where}-up.png`); const sUp = await st();
      const d = (a) => ({ ringDE: +L.dE(a.ring, rest.ring).toFixed(2), labelDE: +L.dE(a.label, rest.label).toFixed(2), ring: a.ring, label: a.label });
      out[name + '-' + where] = { rest, hover: { ...d(hover), state: sHover }, down: { ...d(down), state: sDown }, downBlurred: { ...d(downBlurred), state: sBlur }, up: { ...d(up), state: sUp } };
      await ctx.close();
    }
  }
  await browser.close(); L.save('probe18-active.json', out);
  for (const [k, v] of Object.entries(out)) { console.log(k, 'rest', JSON.stringify(v.rest)); for (const s of ['hover', 'down', 'downBlurred', 'up']) console.log('   ', s, 'ringDE', v[s].ringDE, 'labelDE', v[s].labelDE, JSON.stringify(v[s].state)); }
})().catch(e => { console.error(e); process.exit(1); });
