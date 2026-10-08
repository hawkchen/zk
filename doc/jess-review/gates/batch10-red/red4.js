// #4 RED: text button variants (z-button-text, -secondary, -success, -warning, -error, -info) x 4 states (rest, hover, focus, pressed).
// J4-1: computed box-shadow + halo pixels in the 1..4px ring outside the rect vs page background (CIE76 dE <= 1).
// Protection: filled / outlined / icon-only (rest + hover box-shadow), disabled all variants, text colour, ::before state layer, cursor, rect.
// Output: red4.json + red4-<variant>-<state>.png
const L = require('./lib');
const TEXT = ['z-button-text', 'z-button-text-secondary', 'z-button-text-success', 'z-button-text-warning', 'z-button-text-error', 'z-button-text-info'];
const PROTECT = { filled: 'z-button', outlined: 'z-button-outlined', secondary: 'z-button-secondary', 'outlined-secondary': 'z-button-outlined-secondary' };

async function info(page, idx) {
  return page.evaluate((idx) => {
    const b = document.querySelectorAll('.z-button')[idx]; const s = getComputedStyle(b); const bf = getComputedStyle(b, '::before'); const r = b.getBoundingClientRect();
    const lbl = b.querySelector('.z-button-content, .z-button-label') || b;
    return { cls: b.className, disabled: b.disabled, rect: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }, boxShadow: s.boxShadow, color: s.color, bg: s.backgroundColor, cursor: s.cursor, outline: s.outlineStyle + ' ' + s.outlineWidth + ' ' + s.outlineColor, before: { opacity: bf.opacity, bg: bf.backgroundColor, content: bf.content }, hover: b.matches(':hover'), focus: b.matches(':focus'), focusVisible: b.matches(':focus-visible'), active: b.matches(':active'), labelColor: getComputedStyle(lbl).color };
  }, idx);
}
// indices of buttons by exact class list (enabled / disabled)
async function find(page) {
  return page.evaluate(() => [...document.querySelectorAll('.z-button')].map((b, i) => ({ i, cls: b.className, disabled: b.disabled, hasIcon: !!b.querySelector('[class*=z-icon-]'), text: b.textContent.trim() })));
}
async function halo(page, file, rect, ringMax = 8) {
  const pad = ringMax + 6;
  const S = await L.shot(page, file, { x: rect.l - pad, y: rect.t - pad, width: rect.w + 2 * pad, height: rect.h + 2 * pad });
  // page background: median of the columns 10..12px left and right of the rect (rows above/below may hold the neighbouring grid row, 8px away)
  const far = [...S.rect(rect.l - 12, rect.l - 10, rect.t, rect.b), ...S.rect(rect.r + 10, rect.r + 12, rect.t, rect.b)];
  const bg = L.median(far.map(p => p.c));
  const ring = (d0, d1) => { // pixels with distance in [d0, d1) px outside the rect, all four sides
    const out = []; const l = Math.floor(rect.l), r = Math.ceil(rect.r) - 1, t = Math.floor(rect.t), b = Math.ceil(rect.b) - 1;
    out.push(...S.rect(l - d1 + 1, r + d1 - 1, t - d1 + 1, t - d0), ...S.rect(l - d1 + 1, r + d1 - 1, b + d0, b + d1 - 1), ...S.rect(l - d1 + 1, l - d0, t - d0 + 1, b + d0 - 1), ...S.rect(r + d0, r + d1 - 1, t - d0 + 1, b + d0 - 1));
    return out; };
  const r4 = ring(1, 5), r8 = ring(1, 9);
  const w4 = L.worst(r4, bg), w8 = L.worst(r8, bg);
  const bySide = {};
  { const l = Math.floor(rect.l), r = Math.ceil(rect.r) - 1, t = Math.floor(rect.t), b = Math.ceil(rect.b) - 1; // integer edges so a fractional rect never samples its own edge column
    for (const [name, px] of [['top', S.rect(l + 4, r - 4, t - 4, t - 1)], ['bottom', S.rect(l + 4, r - 4, b + 1, b + 4)], ['left', S.rect(l - 4, l - 1, t + 4, b - 4)], ['right', S.rect(r + 1, r + 4, t + 4, b - 4)]]) bySide[name] = L.worst(px, bg).dE; }
  return { bg, ring4: { n: r4.length, worst: w4, over1: r4.filter(p => L.dE(p.c, bg) > 1).length }, ring8: { n: r8.length, worst: w8, over1: r8.filter(p => L.dE(p.c, bg) > 1).length }, bySide };
}
async function focusByKeyboard(page, idx) {
  // keyboard focus (so :focus-visible applies): focus the previous focusable element programmatically, then press Tab
  const ok = await page.evaluate((idx) => {
    const target = document.querySelectorAll('.z-button')[idx];
    const foc = [...document.querySelectorAll('button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])')].filter(e => e.offsetParent !== null);
    const i = foc.indexOf(target); if (i <= 0) { target.focus(); return 'direct'; }
    foc[i - 1].focus(); return 'prev';
  }, idx);
  if (ok === 'prev') await page.keyboard.press('Tab');
  await page.waitForTimeout(250);
  return ok;
}
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'button.zul');
  const all = await find(page);
  const out = { note: 'button.zul; 4 states per text variant; halo = worst CIE76 dE of ring pixels 1..4px (and 1..8px) outside the rect vs page bg median; DPR 2', buttons: all, text: {}, protect: {} };
  const pick = (cls, disabled) => all.find(b => b.cls === cls + ' z-button' && b.disabled === disabled) || all.find(b => b.cls === cls && b.disabled === disabled);
  const measureStates = async (key, idx, states, shotPrefix) => {
    const res = {};
    await page.evaluate((idx) => document.querySelectorAll('.z-button')[idx].scrollIntoView({ block: 'center' }), idx); await page.waitForTimeout(200);
    for (const st of states) {
      await page.mouse.move(2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(200);
      const r0 = (await info(page, idx)).rect; const cx = r0.l + r0.w / 2, cy = r0.t + r0.h / 2;
      let how = '';
      if (st === 'hover') { await page.mouse.move(cx, cy); await page.waitForTimeout(300); }
      if (st === 'focus') { how = await focusByKeyboard(page, idx); }
      if (st === 'pressed') { await page.mouse.move(cx, cy); await page.mouse.down(); await page.waitForTimeout(300); }
      const i = await info(page, idx);
      const h = await halo(page, `${shotPrefix}-${st}.png`, i.rect);
      res[st] = { ...i, how, halo: h };
      if (st === 'pressed') { await page.mouse.up(); await page.waitForTimeout(200); }
    }
    return res;
  };
  for (const cls of TEXT) {
    const b = pick(cls, false); const d = pick(cls, true);
    out.text[cls] = { idx: b.i, states: await measureStates(cls, b.i, ['rest', 'hover', 'focus', 'pressed'], 'red4-' + cls.replace('z-button-', '')) };
    await page.mouse.move(2, 2); await page.waitForTimeout(150);
    out.text[cls].disabled = await info(page, d.i);
  }
  for (const [name, cls] of Object.entries(PROTECT)) {
    const b = pick(cls, false); const d = pick(cls, true);
    out.protect[name] = { idx: b.i, states: await measureStates(name, b.i, ['rest', 'hover'], 'red4-P-' + name), disabled: d ? await info(page, d.i) : null };
  }
  { // icon-only button (settings icon, no text)
    const b = all.find(x => x.hasIcon && x.text === '' && !x.disabled); const d = all.find(x => x.hasIcon && x.text === '' && x.disabled);
    out.protect.iconOnly = { idx: b.i, states: await measureStates('iconOnly', b.i, ['rest', 'hover'], 'red4-P-iconOnly'), disabled: await info(page, d.i) };
  }
  // disabled box-shadow for every button on the page
  await page.mouse.move(2, 2); await page.waitForTimeout(150);
  out.disabledAll = [];
  for (const b of all.filter(x => x.disabled)) { const i = await info(page, b.i); out.disabledAll.push({ cls: i.cls, boxShadow: i.boxShadow }); }
  L.save('red4.json', out);
  await ctx.close(); await browser.close();
  for (const [cls, v] of Object.entries(out.text)) for (const [st, s] of Object.entries(v.states)) console.log(cls, st, '| shadow:', s.boxShadow === 'none' ? 'none' : 'SET', '| halo4 worst dE', s.halo.ring4.worst.dE, 'over1', s.halo.ring4.over1 + '/' + s.halo.ring4.n, '| halo8 worst', s.halo.ring8.worst.dE, '| sides', JSON.stringify(s.halo.bySide), '| before op', s.before.opacity, '| color', s.color, '| cursor', s.cursor, '| flags h/f/fv/a', s.hover, s.focus, s.focusVisible, s.active, s.how);
  for (const [n, v] of Object.entries(out.protect)) for (const [st, s] of Object.entries(v.states)) console.log('P', n, st, '| shadow:', s.boxShadow, '| halo4', s.halo.ring4.worst.dE, '| rect', s.rect.w, s.rect.h, '| disabled shadow', v.disabled && v.disabled.boxShadow);
  console.log('disabled all none:', out.disabledAll.every(d => d.boxShadow === 'none'), out.disabledAll.length);
})().catch(e => { console.error(e); process.exit(1); });
