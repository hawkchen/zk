// GATE72-FINAL: copied from batch9-red/red72.js. Changes: output file names (rb72-*), rest screenshot per window,
// reference icon button (maximize / minimize / cloned .z-window-icon) measured the same way, knob injection (P72-c),
// click-to-close + focus ring (P72-d). Output: rb72.json + rb72-*.png
const L = require('./lib');

const RED_BG = [254, 205, 199], RED_INK = [127, 0, 10], KNOB = [255, 204, 0];

async function colors(page, sel) {
  return page.evaluate((sel) => {
    const e = document.querySelector(sel); if (!e) return null; const s = getComputedStyle(e); const i = e.querySelector('i'); const is = i && getComputedStyle(i); const ib = i && getComputedStyle(i, '::before');
    const r = e.getBoundingClientRect();
    return { rect: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }, cls: e.className, backgroundColor: s.backgroundColor, color: s.color, borderRadius: s.borderRadius, opacity: s.opacity, outline: s.outline, boxShadow: s.boxShadow, icon: i ? { cls: i.className, color: is.color, beforeColor: ib.color, beforeBg: ib.backgroundColor, beforeContent: ib.content, beforeMask: ib.webkitMaskImage || ib.maskImage } : null, hoverMatches: e.matches(':hover'), focusMatches: e.matches(':focus-visible') };
  }, sel);
}
function pixels(S, c) { // interior median (inset 6px) + glyph median (ΔE ≥ 20 from the interior)
  const px = S.rect(c.l + 6, c.r - 7, c.t + 6, c.b - 7);
  const bg = L.median(px.map(p => p.c)); const ink = px.filter(p => L.dE(p.c, bg) >= 20);
  return { interiorMedian: bg, glyphMedian: ink.length ? L.median(ink.map(p => p.c)) : null, glyphPixels: ink.length };
}
const clipOf = c => ({ x: c.l - 40, y: c.t - 16, width: c.w + 80, height: c.h + 32 });
async function measure(page, sel, shotRest, shotHover) {
  await page.mouse.move(2, 2); await page.waitForTimeout(250);
  const rest = await colors(page, sel); if (!rest) return { missing: sel };
  const c = rest.rect;
  const SR = await L.shot(page, shotRest, clipOf(c)); const pixelRest = pixels(SR, c);
  await page.mouse.move(c.l + c.w / 2, c.t + c.h / 2); await page.waitForTimeout(350);
  const hover = await colors(page, sel);
  const S = await L.shot(page, shotHover, clipOf(c)); const pixelHover = pixels(S, c);
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  return { rest, hover, pixelRest, pixelHover };
}
// reference (non-close) icon button inside the same window: maximize, else minimize, else a clone of the close
// button with className "z-window-icon" only (the .z-window-icon hover value in the same header)
async function refSelector(page, closeSel) {
  return page.evaluate((closeSel) => {
    const close = document.querySelector(closeSel); const win = close.closest('.z-window');
    const tag = (el, kind) => { el.setAttribute('data-j72', kind); return `[data-j72="${kind}"]`; };
    const mx = win.querySelector('.z-window-maximize'); if (mx) return { kind: 'maximize', sel: tag(mx, 'ref') };
    const mn = win.querySelector('.z-window-minimize'); if (mn) return { kind: 'minimize', sel: tag(mn, 'ref') };
    const cl = close.cloneNode(true); cl.className = 'z-window-icon'; cl.removeAttribute('id'); close.parentNode.insertBefore(cl, close);
    return { kind: 'clone(.z-window-icon)', sel: tag(cl, 'ref') };
  }, closeSel);
}
async function knob(page, sel, shotName) {
  const h = await page.addStyleTag({ content: ':root { --zk-window-close-hover-bg: #ffcc00 }' });
  const c = (await colors(page, sel)).rect;
  await page.mouse.move(c.l + c.w / 2, c.t + c.h / 2); await page.waitForTimeout(350);
  const on = await colors(page, sel); const S = await L.shot(page, shotName, clipOf(c)); const onPx = pixels(S, c);
  await h.evaluate(e => e.remove()); await page.waitForTimeout(250);
  const off = await colors(page, sel); const S2 = await L.shot(page, null, clipOf(c)); const offPx = pixels(S2, c);
  await page.mouse.move(2, 2); await page.waitForTimeout(200);
  return { injected: { backgroundColor: on.backgroundColor, color: on.color, pixel: onPx, dEKnob: +L.dE(onPx.interiorMedian, KNOB).toFixed(2) }, removed: { backgroundColor: off.backgroundColor, pixel: offPx } };
}
async function focusAndClose(page, sel, refSel, gone) {
  const f = await page.evaluate(([sel, refSel]) => {
    const out = {}; for (const [k, s] of [['close', sel], ['ref', refSel]]) { const e = document.querySelector(s); e.focus(); const cs = getComputedStyle(e); out[k] = { outline: cs.outline, outlineOffset: cs.outlineOffset, boxShadow: cs.boxShadow, focusVisible: e.matches(':focus-visible'), isActive: document.activeElement === e }; e.blur(); } return out;
  }, [sel, refSel]);
  await page.evaluate(([sel, refSel]) => { document.querySelector(refSel).focus(); }, [sel, refSel]);
  await page.keyboard.press('Tab'); await page.waitForTimeout(150);
  const kb = await page.evaluate((sel) => { const e = document.querySelector(sel); const cs = getComputedStyle(e); return { activeIsClose: document.activeElement === e, focusVisible: e.matches(':focus-visible'), outline: cs.outline, boxShadow: cs.boxShadow }; }, sel);
  const c = (await colors(page, sel)).rect;
  await page.mouse.click(c.l + c.w / 2, c.t + c.h / 2); await L.settle(page);
  const closed = await page.evaluate(gone);
  return { focus: f, keyboardTabToClose: kb, closedAfterClick: closed };
}
async function one(page, closeSel, name, gone) {
  const ref = await refSelector(page, closeSel);
  const close = await measure(page, closeSel, `rb72-${name}-rest.png`, `rb72-${name}-hover.png`);
  const refM = await measure(page, ref.sel, null, `rb72-${name}-ref-hover.png`);
  const k = await knob(page, closeSel, `rb72-${name}-knob.png`);
  const beh = await focusAndClose(page, closeSel, ref.sel, gone);
  const j = {
    refKind: ref.kind,
    dE_close_vs_ref: +L.dE(close.pixelHover.interiorMedian, refM.pixelHover.interiorMedian).toFixed(2),
    colorEqual: close.hover.color === refM.hover.color,
    dE_close_vs_RED: +L.dE(close.pixelHover.interiorMedian, RED_BG).toFixed(2),
    dE_glyph_vs_RED: close.pixelHover.glyphMedian ? +L.dE(close.pixelHover.glyphMedian, RED_INK).toFixed(2) : null,
    knob_dE: k.injected.dEKnob, knob_removed_dE_vs_neutral: +L.dE(k.removed.pixel.interiorMedian, close.pixelHover.interiorMedian).toFixed(2),
  };
  return { close, ref: refM, knob: k, behaviour: beh, judge: j };
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'computed backgroundColor/color at rest and with the pointer on the button centre; pixel medians from screenshots (DPR 2); CIE76' };
  const mbGone = () => !document.querySelector('.z-messagebox-window');
  {
    const { ctx, page } = await L.open(browser, 'messagebox.zul');
    await page.getByText('Question', { exact: true }).click(); await L.settle(page);
    out.messageboxQuestion = await one(page, '.z-messagebox-window .z-window-close', 'messagebox', mbGone);
    out.messageboxQuestion.header = await page.evaluate(() => { const h = document.querySelector('.z-messagebox-window .z-window-header'); if (!h) return null; const s = getComputedStyle(h); return { backgroundColor: s.backgroundColor, color: s.color }; });
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(browser, 'messagebox.zul');
    await page.getByText('Error', { exact: true }).click(); await L.settle(page);
    out.messageboxError = await one(page, '.z-messagebox-window .z-window-close', 'messagebox-error', mbGone);
    await ctx.close();
  }
  {
    const { ctx, page } = await L.open(browser, 'window.zul');
    const n0 = await page.evaluate(() => document.querySelectorAll('.z-window').length);
    out.windowEmbedded = await one(page, '.z-window-embedded:not(.z-window-noborder) .z-window-close', 'embedded', () => document.querySelectorAll('.z-window').length);
    out.windowEmbedded.behaviour.closedAfterClick = { before: n0, after: out.windowEmbedded.behaviour.closedAfterClick };
    const n1 = await page.evaluate(() => document.querySelectorAll('.z-window').length);
    out.windowOverlapped = await one(page, '.z-window-overlapped:not(.z-window-noborder) .z-window-close', 'overlapped', () => document.querySelectorAll('.z-window').length);
    out.windowOverlapped.behaviour.closedAfterClick = { before: n1, after: out.windowOverlapped.behaviour.closedAfterClick };
    await ctx.close();
  }
  L.save('rb72.json', out);
  await browser.close();
  for (const [k, v] of Object.entries(out)) if (v && v.close) console.log(k, JSON.stringify({ rest: { bg: v.close.rest.backgroundColor, color: v.close.rest.color, rect: v.close.rest.rect, radius: v.close.rest.borderRadius, px: v.close.pixelRest.interiorMedian }, hover: { bg: v.close.hover.backgroundColor, color: v.close.hover.color, px: v.close.pixelHover }, ref: { kind: v.judge.refKind, bg: v.ref.hover.backgroundColor, color: v.ref.hover.color, px: v.ref.pixelHover }, knob: v.knob, beh: v.behaviour, judge: v.judge }));
})().catch(e => { console.error(e); process.exit(1); });
