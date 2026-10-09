// Batch 14 RED — P1 (toast info icon contrast) and P2 (notification vs toast backgrounds, arrows).
// Measurement only: pixels for judgments; computed styles recorded next to them for traceability.
const L = require('./lib.js');
const M = require('./m14.js');
const fs = require('fs');
const path = require('path');

function lum([r, g, b]) { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function contrast(a, b) { const A = lum(a), B = lum(b); return +((Math.max(A, B) + 0.05) / (Math.min(A, B) + 0.05)).toFixed(2); }
function chroma(c) { return Math.max(...c) - Math.min(...c); }
function sum(c) { return c[0] + c[1] + c[2]; }

// ink pixels inside [x0,x1]x[y0,y1] (CSS px) with dE(base) >= thr; returns bbox + most saturated / darkest / median pixel
function ink(S, x0, x1, y0, y1, base, thr = 8) {
  const px = S.rect(x0, x1, y0, y1).filter(p => L.dE(p.c, base) >= thr);
  if (!px.length) return { n: 0 };
  let sat = px[0], dark = px[0];
  for (const p of px) { if (chroma(p.c) > chroma(sat.c) || (chroma(p.c) === chroma(sat.c) && sum(p.c) < sum(sat.c))) sat = p; if (sum(p.c) < sum(dark.c)) dark = p; }
  const minx = Math.min(...px.map(p => p.dx)), maxx = Math.max(...px.map(p => p.dx)), miny = Math.min(...px.map(p => p.dy)), maxy = Math.max(...px.map(p => p.dy));
  return { n: px.length, l: minx / S.dpr, r: (maxx + 1) / S.dpr, t: miny / S.dpr, b: (maxy + 1) / S.dpr, w: (maxx + 1 - minx) / S.dpr, h: (maxy + 1 - miny) / S.dpr,
    cx: +((minx + maxx + 1) / 2 / S.dpr).toFixed(2), cy: +((miny + maxy + 1) / 2 / S.dpr).toFixed(2),
    mostSaturated: sat.c, darkest: dark.c, median: L.median(px.map(p => p.c)),
    contrastSat: contrast(sat.c, base), contrastDark: contrast(dark.c, base), contrastMedian: contrast(L.median(px.map(p => p.c)), base) };
}

// in-page geometry of one card (toast or notification) by root element index among `rootSel`
const geomSrc = `(function (rootSel, idx, pfx) {
  const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(3), t: +r.top.toFixed(3), r: +r.right.toFixed(3), b: +r.bottom.toFixed(3), w: +r.width.toFixed(3), h: +r.height.toFixed(3) }; };
  const root = document.querySelectorAll(rootSel)[idx]; if (!root) return null;
  root.scrollIntoView({ block: 'center' });
  const content = root.querySelector('.' + pfx + '-content');
  const icon = [...root.children].find(e => e.classList.contains(pfx + '-icon'));
  const close = root.querySelector('.' + pfx + '-close');
  const closeIcon = close ? close.querySelector('.' + pfx + '-icon') : null;
  const pointer = root.querySelector('.' + pfx + '-pointer');
  const cs = e => e ? getComputedStyle(e) : null;
  const pc = cs(pointer);
  return { cls: root.className, root: R(root), rootPadding: root.style.padding || cs(root).padding, content: R(content), contentBg: cs(content).backgroundColor, contentColor: cs(content).color,
    icon: R(icon), iconCls: icon && icon.className, iconColor: icon && cs(icon).color, iconFont: icon && cs(icon).fontSize,
    close: R(close), closeIcon: R(closeIcon), closeIconColor: closeIcon && cs(closeIcon).color, closeOpacity: close && cs(close).opacity,
    pointer: pointer ? { cls: pointer.className, rect: R(pointer), display: pc.display, borderTop: pc.borderTopColor, borderRight: pc.borderRightColor, borderBottom: pc.borderBottomColor, borderLeft: pc.borderLeftColor, style: pointer.getAttribute('style') } : null,
    pageBg: cs(document.body).backgroundColor };
})`;
async function geom(page, rootSel, idx, pfx) { return page.evaluate(({ rootSel, idx, pfx, src }) => eval(src)(rootSel, idx, pfx), { rootSel, idx, pfx, src: geomSrc }); }

// resolve tokens through a probe element (computed colour), not the raw var text
async function tokens(page, names) {
  return page.evaluate((names) => {
    const out = {}; const p = document.createElement('div'); document.body.appendChild(p);
    for (const n of names) { p.style.color = ''; p.style.color = 'var(' + n + ')'; out[n] = { raw: getComputedStyle(document.documentElement).getPropertyValue(n).trim(), resolved: getComputedStyle(p).color }; }
    p.remove(); return out;
  }, names);
}

// pixel measurement of one card: bg (left strip inside content, before the icon), icon ink, text ink, close ink
async function measureCard(page, g, file, opts = {}) {
  const C = g.content;
  const pad = 30;
  const S = await L.shot(page, file, { x: g.root.l - pad, y: g.root.t - pad, width: g.root.w + 2 * pad, height: g.root.h + 2 * pad });
  const stripL = C.l + 3, stripR = C.l + 9;
  const bg = L.median(S.rect(stripL, stripR, C.t + 4, C.b - 5).map(p => p.c));
  const bgWorst = L.worst(S.rect(stripL, stripR, C.t + 4, C.b - 5), bg);
  // a second bg sample at the right end below the close button (uniformity)
  const bg2 = L.median(S.rect(C.r - 9, C.r - 3, C.t + 4, C.b - 5).map(p => p.c));
  const I = g.icon;
  const iconInk = I ? ink(S, I.l - 1, I.r + 1, I.t - 1, I.b + 1, bg, 8) : null;
  const textX0 = I ? I.r + 4 : C.l + 4, textX1 = g.close ? g.close.l - 4 : C.r - 8;
  const textInk = ink(S, textX0, textX1, C.t + 2, C.b - 3, bg, 8);
  const closeInk = g.closeIcon ? ink(S, g.closeIcon.l - 1, g.closeIcon.r + 1, g.closeIcon.t - 1, g.closeIcon.b + 1, bg, 8) : null;
  const pageBg = S.at((g.root.l - pad + 2) * S.dpr, (g.root.t - pad + 2) * S.dpr);
  let pointer = null;
  if (g.pointer && g.pointer.display !== 'none') {
    const P = g.pointer.rect; const cx = P.l + P.w / 2, cy = P.t + P.h / 2; const half = P.w / 2; // 20x20 box, 10px borders
    const dir = /-left/.test(g.pointer.cls) ? 'left' : /-right/.test(g.pointer.cls) ? 'right' : /-up/.test(g.pointer.cls) ? 'up' : /-down/.test(g.pointer.cls) ? 'down' : 'none';
    const px = S.rect(P.l, P.r, P.t, P.b);
    const inside = p => {
      const dx = p.x + 0.25 - cx, dy = p.y + 0.25 - cy;
      if (dir === 'left') return dx >= 2.5 && Math.abs(dy) <= dx - 2; // border-right triangle, apex at the left
      if (dir === 'right') return -dx >= 2.5 && Math.abs(dy) <= -dx - 2;
      if (dir === 'up') return dy >= 2.5 && Math.abs(dx) <= dy - 2;
      if (dir === 'down') return -dy >= 2.5 && Math.abs(dx) <= -dy - 2;
      return false; };
    const inner = px.filter(inside);
    const color = L.median(inner.map(p => p.c));
    // the opposite side of the box (outside the triangle) is what the triangle is drawn over
    const outer = px.filter(p => { const dx = p.x + 0.25 - cx, dy = p.y + 0.25 - cy; if (dir === 'left') return dx <= -3; if (dir === 'right') return dx >= 3; if (dir === 'up') return dy <= -3; if (dir === 'down') return dy >= 3; return false; });
    pointer = { dir, box: P, nInner: inner.length, color, worstInner: L.worst(inner, color), under: outer.length ? L.median(outer.map(p => p.c)) : null,
      dE_vs_contentBg: +L.dE(color, bg).toFixed(2), dE_vs_pageBg: +L.dE(color, pageBg).toFixed(2), contrast_vs_pageBg: contrast(color, pageBg) };
  }
  return { bg, bgWorst, bg2, dE_bg_bg2: +L.dE(bg, bg2).toFixed(2), pageBg, iconInk, textInk, closeInk, pointer,
    iconComputedRaw: g.iconColor || null,
    iconComputed: g.iconColor && L.parseRgb(g.iconColor) ? L.over(L.parseRgb(g.iconColor), bg) : null,
    contrastIconComputed: g.iconColor && L.parseRgb(g.iconColor) ? contrast(L.over(L.parseRgb(g.iconColor), bg), bg) : null };
}

(async () => {
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const out = { env: { base: L.BASE, viewport: '1280x900', dpr: 2, chromium: browser.version(), date: new Date().toISOString() }, toast: {}, notification: {} };
  const TOK = ['--zk-toast-accent', '--zk-toast-bg', '--zk-toast-fg', '--zk-color-status-info', '--zk-color-status-warning', '--zk-color-status-error', '--zk-color-on-surface', '--zk-color-surface', '--zk-color-surface-container-highest', '--zk-color-warning', '--zk-color-warning-container', '--zk-color-on-warning-container', '--zk-color-error', '--zk-color-error-container', '--zk-color-on-error-container', '--zk-notification-bg', '--zk-notification-fg'];

  // ───── toast: static gallery (3 cards) ─────
  {
    const { ctx, page } = await L.open(browser, 'web/toast.zul');
    out.toast.tokens = await tokens(page, TOK);
    out.toast.static = {};
    for (const [i, sev] of ['info', 'warning', 'error'].entries()) {
      const g = await geom(page, '.z-toast', i, 'z-toast');
      await page.waitForTimeout(100);
      const g2 = await geom(page, '.z-toast', i, 'z-toast'); // rects after scrollIntoView
      const m = await measureCard(page, g2, `p1-toast-${sev}.png`);
      out.toast.static[sev] = { geom: g2, px: m };
      console.log(`toast ${sev}: bg ${m.bg} icon sat ${m.iconInk && m.iconInk.mostSaturated} contrast ${m.iconInk && m.iconInk.contrastSat} (darkest ${m.iconInk && m.iconInk.darkest} ${m.iconInk && m.iconInk.contrastDark}) computed ${g2.iconColor} -> ${m.contrastIconComputed}; text darkest ${m.textInk.darkest} ${m.textInk.contrastDark}; close ${m.closeInk && m.closeInk.darkest}`);
    }
    await L.shot(page, 'p1-toast-gallery.png', { x: 0, y: 0, width: 1280, height: 420 });
    // live toast (Toast.show via the "Persistent (closable)" button) — cross-check that the static markup matches the real widget
    const btn = await page.evaluate(() => { const b = [...document.querySelectorAll('.z-button')].find(b => b.textContent.trim() === 'Persistent (closable)'); b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.click(btn.x, btn.y); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(500);
    const live = await geom(page, '.z-toast-position .z-toast', 0, 'z-toast');
    if (live) { const m = await measureCard(page, live, 'p1-toast-live-info.png'); out.toast.live = { geom: live, px: m }; console.log(`toast live info: bg ${m.bg} icon sat ${m.iconInk.mostSaturated} contrast ${m.iconInk.contrastSat}`); }
    await ctx.close();
  }
  // ───── toast: knob override --zk-toast-accent:#6750a4 (fresh load) ─────
  {
    const { ctx, page } = await L.open(browser, 'web/toast.zul');
    await page.addStyleTag({ content: ':root{--zk-toast-accent:#6750a4}' });
    await page.waitForTimeout(200);
    out.toast.knob = { tokens: await tokens(page, ['--zk-toast-accent', '--zk-toast-bg']) };
    for (const [i, sev] of ['info', 'warning', 'error'].entries()) {
      const g = await geom(page, '.z-toast', i, 'z-toast'); await page.waitForTimeout(100); const g2 = await geom(page, '.z-toast', i, 'z-toast');
      const m = await measureCard(page, g2, `p1-toast-knob-${sev}.png`);
      const base = out.toast.static[sev].px;
      out.toast.knob[sev] = { geom: g2, px: m, dE_icon_vs_default: m.iconInk && base.iconInk ? +L.dE(m.iconInk.mostSaturated, base.iconInk.mostSaturated).toFixed(2) : null, dE_bg_vs_default: +L.dE(m.bg, base.bg).toFixed(2), dE_close_vs_default: m.closeInk && base.closeInk ? +L.dE(m.closeInk.darkest, base.closeInk.darkest).toFixed(2) : null };
      console.log(`toast knob ${sev}: icon sat ${m.iconInk && m.iconInk.mostSaturated} dE vs default ${out.toast.knob[sev].dE_icon_vs_default}; bg dE ${out.toast.knob[sev].dE_bg_vs_default}`);
    }
    await ctx.close();
  }
  // ───── toast + notification: forced-colors (icon visible?) ─────
  for (const [pagePath, rootSel, pfx, key] of [['web/toast.zul', '.z-toast', 'z-toast', 'toast'], ['web/notification.zul', '.z-notification', 'z-notification', 'notification']]) {
    const { ctx, page } = await L.open(browser, pagePath, { forcedColors: 'active' });
    await page.emulateMedia({ forcedColors: 'active' }); await page.waitForTimeout(300);
    out[key].forced = {};
    for (const [i, sev] of ['info', 'warning', 'error'].entries()) {
      const g = await geom(page, rootSel, i, pfx); await page.waitForTimeout(100); const g2 = await geom(page, rootSel, i, pfx);
      const m = await measureCard(page, g2, `p12-${key}-forced-${sev}.png`);
      out[key].forced[sev] = { iconColor: g2.iconColor, contentBg: g2.contentBg, px: { bg: m.bg, iconInk: m.iconInk, textInk: m.textInk } };
      console.log(`${key} forced ${sev}: bg ${m.bg} icon n ${m.iconInk && m.iconInk.n} darkest ${m.iconInk && m.iconInk.darkest} contrast ${m.iconInk && m.iconInk.contrastDark}`);
    }
    await ctx.close();
  }
  // ───── notification: static gallery ─────
  {
    const { ctx, page } = await L.open(browser, 'web/notification.zul');
    out.notification.tokens = await tokens(page, TOK);
    out.notification.static = {};
    for (const [i, sev] of ['info', 'warning', 'error'].entries()) {
      const g = await geom(page, '.z-notification', i, 'z-notification'); await page.waitForTimeout(100); const g2 = await geom(page, '.z-notification', i, 'z-notification');
      const m = await measureCard(page, g2, `p2-notification-${sev}.png`);
      const t = out.toast.static[sev].px;
      out.notification.static[sev] = { geom: g2, px: m, dE_bg_vs_toast: +L.dE(m.bg, t.bg).toFixed(2), toastBg: t.bg };
      console.log(`notification ${sev}: bg ${m.bg} vs toast ${t.bg} dE ${out.notification.static[sev].dE_bg_vs_toast}; icon sat ${m.iconInk && m.iconInk.mostSaturated} contrast ${m.iconInk && m.iconInk.contrastSat} (darkest ${m.iconInk && m.iconInk.contrastDark}) computed ${g2.iconColor} -> ${m.contrastIconComputed}`);
    }
    await L.shot(page, 'p2-notification-gallery.png', { x: 0, y: 0, width: 1280, height: 420 });
    await ctx.close();
  }
  // ───── notification: pointers, 3 severities x 4 directions (Notification.show with a ref) ─────
  out.notification.pointer = {};
  const POS = { left: 'end_center', right: 'start_center', up: 'after_center', down: 'before_center' };
  for (const sev of ['info', 'warning', 'error']) {
    out.notification.pointer[sev] = {};
    for (const [dir, pos] of Object.entries(POS)) {
      const { ctx, page } = await L.open(browser, 'web/notification.zul');
      await page.evaluate(({ sev, pos }) => {
        const b = [...document.querySelectorAll('.z-button')].find(b => b.textContent.trim() === 'Middle Center'); b.scrollIntoView({ block: 'center' });
        const w = zk.Widget.$(b);
        zul.wgt.Notification.show(sev[0].toUpperCase() + sev.slice(1) + ' notification message', null, { ref: w, pos, type: sev, dur: -1, closable: true });
      }, { sev, pos });
      await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(400);
      const g = await page.evaluate(({ src }) => { const roots = [...document.querySelectorAll('.z-notification')]; const i = roots.findIndex(r => r.querySelector('.z-notification-pointer')); return eval(src)('.z-notification', i, 'z-notification'); }, { src: geomSrc });
      const m = await measureCard(page, g, `p2-pointer-${sev}-${dir}.png`);
      const t = out.toast.static[sev].px;
      out.notification.pointer[sev][dir] = { pos, geom: g, px: m, dE_bg_vs_toast: +L.dE(m.bg, t.bg).toFixed(2) };
      const P = m.pointer;
      console.log(`notification ${sev} ${dir} (${pos}): pointer cls "${g.pointer && g.pointer.cls}" colour ${P && P.color} under ${P && P.under} dE vs content bg ${P && P.dE_vs_contentBg} (content bg ${m.bg}) dE vs page ${P && P.dE_vs_pageBg}; computed borders T ${g.pointer && g.pointer.borderTop} R ${g.pointer && g.pointer.borderRight} B ${g.pointer && g.pointer.borderBottom} L ${g.pointer && g.pointer.borderLeft}`);
      await ctx.close();
    }
  }
  L.save('red-p1p2.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
