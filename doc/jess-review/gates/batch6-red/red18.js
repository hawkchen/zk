// #18 combobutton: hover/active must land on the segment under the pointer. Pixel-only (mean colour of the arrow edge ring and of the label area).
// States are each measured on a freshly loaded page. Output: red18.json + red18-*.png.
const L = require('./lib');

const CB = { filled: 0, filledDisabled: 1, toolbar: 2, toolbarDisabled: 3 }; // index in document.querySelectorAll('.z-combobutton')

async function geom(page, idx) {
  return page.evaluate((idx) => {
    const n = document.querySelectorAll('.z-combobutton')[idx];
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    const c = n.querySelector('.z-combobutton-content'), b = n.querySelector('.z-combobutton-button'), t = n.querySelector('.z-combobutton-text'), i = n.querySelector('.z-combobutton-icon');
    return { cls: n.className, root: R(n), content: R(c), button: R(b), text: R(t), icon: R(i), sepLeft: getComputedStyle(b).borderLeftWidth, focused: document.activeElement === n, open: n.classList.contains('z-combobutton-open') };
  }, idx);
}

// sample sets (viewport CSS px, inclusive): arrow edge ring = within 3px of the arrow rect edges, excluding the 1px separator column and the 4x4 rounded corners;
// label = content rect minus the arrow rect, inset 2px, excluding the text span rect (+1px) so glyph pixels never enter the mean.
function samples(S, g) {
  const A = g.button, C = g.content, T = g.text;
  const all = S.rect(C.l, C.r - 1, C.t, C.b - 1);
  const ring = all.filter(p => p.x >= A.l + 1.5 && p.x < A.r && p.y >= A.t && p.y < A.b &&
    (p.x < A.l + 1.5 + 3 || p.x >= A.r - 3 || p.y < A.t + 3 || p.y >= A.b - 3) &&
    !((p.x >= A.r - 4 && p.y < A.t + 4) || (p.x >= A.r - 4 && p.y >= A.b - 4)));
  const label = all.filter(p => p.x >= C.l + 2 && p.x < A.l - 1 && p.y >= C.t + 2 && p.y < C.b - 2 &&
    !(p.x >= T.l - 1 && p.x < T.r + 1 && p.y >= T.t - 1 && p.y < T.b + 1) &&
    !((p.x < C.l + 4 && p.y < C.t + 4) || (p.x < C.l + 4 && p.y >= C.b - 4)));
  const arrowAll = all.filter(p => p.x >= A.l + 1.5 && p.x < A.r && p.y >= A.t && p.y < A.b);
  return { ring, label, arrowAll };
}
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };
const lum = c => +(0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]).toFixed(1);

async function capture(page, idx, file) {
  const g = await geom(page, idx);
  const clip = { x: g.root.l - 6, y: g.root.t - 6, width: g.root.w + 12, height: g.root.h + 12 };
  const S = await L.shot(page, file, clip);
  const s = samples(S, g);
  return { g, ring: mean(s.ring), ringN: s.ring.length, label: mean(s.label), labelN: s.label.length, arrowAll: mean(s.arrowAll), ringMedian: L.median(s.ring.map(p => p.c)), labelMedian: L.median(s.label.map(p => p.c)) };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'ΔE = CIE76 on mean colours; ring = arrow rect edge band (3px, minus separator column and rounded corners); label = content minus arrow, inset 2px, minus text span rect' };
  const states = [
    { name: 'rest', act: async () => {} },
    { name: 'hoverArrow', act: async (page, g) => page.mouse.move((g.button.l + g.button.r) / 2, (g.button.t + g.button.b) / 2) },
    { name: 'hoverLabel', act: async (page, g) => page.mouse.move((g.content.l + g.button.l) / 2, (g.content.t + g.content.b) / 2) },
    { name: 'activeArrow', act: async (page, g) => { await page.mouse.move((g.button.l + g.button.r) / 2, (g.button.t + g.button.b) / 2); await page.mouse.down(); } },
    { name: 'activeLabel', act: async (page, g) => { await page.mouse.move((g.content.l + g.button.l) / 2, (g.content.t + g.content.b) / 2); await page.mouse.down(); } },
    { name: 'tabFocus', act: async (page, g, idx) => { await page.mouse.click(2, 2); for (let i = 0; i < 40; i++) { await page.keyboard.press('Tab'); const ok = await page.evaluate((idx) => document.activeElement === document.querySelectorAll('.z-combobutton')[idx], idx); if (ok) break; } await page.mouse.move(2, 2); } },
    { name: 'open', act: async (page, g) => { await page.mouse.click((g.button.l + g.button.r) / 2, (g.button.t + g.button.b) / 2); await page.waitForTimeout(300); await page.mouse.move(2, 2); await page.waitForTimeout(200); } },
  ];
  for (const [key, idx] of Object.entries(CB)) {
    out[key] = {};
    const list = key.endsWith('Disabled') ? states.filter(s => ['rest', 'hoverArrow', 'hoverLabel'].includes(s.name)) : states;
    for (const st of list) {
      const { ctx, page } = await L.open(browser, 'combobutton.zul');
      const g0 = await geom(page, idx);
      await st.act(page, g0, idx);
      await page.waitForTimeout(250);
      const r = await capture(page, idx, `red18-${key}-${st.name}.png`);
      if (st.name === 'open') { r.popupOpen = await page.evaluate(() => { const p = document.querySelector('.z-menupopup-open, .z-popup-open'); return p ? p.className : null; }); }
      out[key][st.name] = r;
      await ctx.close();
    }
    const rest = out[key].rest;
    out[key].deltas = {};
    for (const st of Object.keys(out[key])) {
      if (st === 'rest' || st === 'deltas') continue;
      const r = out[key][st];
      out[key].deltas[st] = { ringDE: +L.dE(r.ring, rest.ring).toFixed(2), labelDE: +L.dE(r.label, rest.label).toFixed(2), arrowAllDE: +L.dE(r.arrowAll, rest.arrowAll).toFixed(2),
        ringLum: lum(r.ring), labelLum: lum(r.label), restRingLum: lum(rest.ring), restLabelLum: lum(rest.label),
        geomSame: JSON.stringify(r.g.button) === JSON.stringify(rest.g.button) && JSON.stringify(r.g.content) === JSON.stringify(rest.g.content), focused: r.g.focused, open: r.g.open };
    }
  }
  L.save('red18.json', out);
  await browser.close();
  for (const k of Object.keys(CB)) { console.log(k, JSON.stringify(out[k].rest.g.button), 'content', JSON.stringify(out[k].rest.g.content), 'sep', out[k].rest.g.sepLeft); console.log('  rest ring', out[k].rest.ring, 'label', out[k].rest.label, 'n', out[k].rest.ringN, out[k].rest.labelN); for (const [s, d] of Object.entries(out[k].deltas)) console.log('  ', s, JSON.stringify(d), 'ring', out[k][s].ring, 'label', out[k][s].label); }
})().catch(e => { console.error(e); process.exit(1); });
