// Batch 11 FINAL R4 (chevron box margin-right fix; same script as final53-r3.js, only output names changed): adds forced-colors accordion pass, token colour references for J53-3, collapsed-row zoom (copied from batch11-red/red53.js, only output names changed), #53 tabbox accordion title font vs horizontal tab font, chevron ink vs combobox chevron (D52-A baseline 8x5).
// Computed font values are read only where the plan allows (font-size/weight/line-height, opacity); positions and sizes are pixel ink.
const L = require('./lib.js'); const M = require('./m11.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const Rsrc = `(e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })`;
const f2 = v => v == null ? null : +(+v).toFixed(2);
const box = b => b ? { l: f2(b.l), t: f2(b.t), w: f2(b.w), h: f2(b.h), r: f2(b.r), b: f2(b.b), darkest: b.darkest } : null;

// DOM + computed font of every .z-tab of the i-th tabbox (viewport coords)
async function tabsOf(page, idx) {
  return page.evaluate(({ idx, Rsrc }) => { const R = eval(Rsrc); const tb = document.querySelectorAll('.z-tabbox')[idx];
    return { cls: tb.className, rect: R(tb), tabs: [...tb.querySelectorAll('.z-tab')].map(t => { const txt = t.querySelector('.z-tab-text'); const tc = getComputedStyle(txt); const cs = getComputedStyle(t); const cnt = t.querySelector('.z-tab-content'); const img = t.querySelector('.z-tab-image');
      const rng = document.createRange(); rng.selectNodeContents(txt);
      return { cls: t.className, label: txt.textContent.trim(), rect: R(t), cnt: R(cnt), text: R(txt), textRange: R(rng), img: R(img), font: { fontSize: tc.fontSize, fontWeight: tc.fontWeight, lineHeight: tc.lineHeight, fontFamily: tc.fontFamily.split(',')[0] }, tabFont: { fontSize: cs.fontSize, fontWeight: cs.fontWeight, lineHeight: cs.lineHeight }, opacity: cs.opacity, textOpacity: tc.opacity }; }),
      panels: [...tb.querySelectorAll('.z-tabpanel')].map(p => { const cave = p.querySelector('.z-tabpanel-content') || p; const cc = getComputedStyle(cave); return { rect: R(p), caveSel: cave === p ? '.z-tabpanel' : '.z-tabpanel-content', cave: R(cave), caveFont: cc.fontSize + '/' + cc.lineHeight + ' ' + cc.fontWeight, cavePad: cc.padding, caveDisplay: cc.display, kids: [...p.children].map(c => c.tagName + '.' + c.className) }; }) }; }, { idx, Rsrc });
}
// pixel measurement of one tab row: text ink (height), chevron ink (right side), base colour
function measureTab(S, t, opts) {
  const y0 = t.rect.t + 1, y1 = t.rect.b - 2;
  const blank = opts.blank; // x-range known to hold no ink on this row
  const base = L.median(S.rect(blank[0], blank[1], y0, y1).map(p => p.c));
  const tx0 = (t.img && t.img.w) ? Math.max(t.textRange.l - 2, t.img.r + 2) : t.textRange.l - 2;
  const text = M.inkBox(S, tx0, t.textRange.r + 2, t.text.t - 3, t.text.b + 3, base, 8);
  let chev = null; if (opts.chevron) chev = M.inkBox(S, t.cnt.r - 36, t.rect.r - 2, y0, y1, base, 8);
  let img = null; if (t.img && t.img.w) img = M.inkBox(S, t.img.l - 1, t.img.r + 1, t.img.t - 1, t.img.b + 1, base, 8);
  return { base, text: box(text), textInkH: text ? text.h : null, textInkL: text ? text.l : null, textInkFromTabL: text ? f2(text.l - t.rect.l) : null, textCenterY: text ? f2((text.t + text.b) / 2) : null, rowCenterY: f2((t.rect.t + t.rect.b) / 2),
    chevron: box(chev), chevFromTabR: chev ? f2(t.rect.r - chev.r) : null, chevCenterY: chev ? f2((chev.t + chev.b) / 2) : null, img: box(img) };
}
(async () => {
  const browser = await launch(); const out = { chromium: browser.version() };
  // A: horizontal "Tab States" tabbox (index 0): Default / Selected / Disabled
  { const { ctx, page } = await L.open(browser, 'tabbox.zul');
    const g = await tabsOf(page, 0); const S = await L.shot(page, 'final53-r4-horizontal0.png', { x: g.rect.l - 8, y: g.rect.t - 8, width: 420, height: g.rect.h + 16 });
    out.horizontal = { cls: g.cls, rect: g.rect, panels: g.panels, tabs: g.tabs.map(t => ({ label: t.label, cls: t.cls, rect: t.rect, text: t.text, textRange: t.textRange, font: t.font, tabFont: t.tabFont, opacity: t.opacity, px: measureTab(S, t, { blank: [t.text.r + 4, t.rect.r - 1], chevron: false }) })) };
    // hover Default
    const d = g.tabs[0]; await page.mouse.move(d.rect.l + d.rect.w / 2, d.rect.t + d.rect.h / 2); await page.waitForTimeout(300);
    const S2 = await L.shot(page, 'final53-r4-horizontal0-hover.png', { x: g.rect.l - 8, y: g.rect.t - 8, width: 420, height: g.rect.h + 16 });
    out.horizontal.hoverDefault = measureTab(S2, d, { blank: [d.text.r + 4, d.rect.r - 1], chevron: false });
    // vertical tabbox (index 3, "Vertical left (many tabs)") baseline screenshot for protection (e)
    const v = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const tb = document.querySelectorAll('.z-tabbox')[3]; tb.scrollIntoView({ block: 'center' }); return { cls: tb.className, rect: R(tb) }; }, Rsrc); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const v2 = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const tb = document.querySelectorAll('.z-tabbox')[3]; return { cls: tb.className, rect: R(tb), tabs: [...tb.querySelectorAll('.z-tab')].map(t => ({ label: t.textContent.trim(), rect: R(t), text: R(t.querySelector('.z-tab-text')), font: (c => c.fontSize + '/' + c.lineHeight + ' ' + c.fontWeight)(getComputedStyle(t.querySelector('.z-tab-text'))) })) }; }, Rsrc);
    const Sv = await L.shot(page, 'final53-r4-vertical3.png', { x: v2.rect.l - 8, y: v2.rect.t - 8, width: v2.rect.w + 16, height: v2.rect.h + 16 }); out.vertical3 = v2;
    out.vertical3.ink = v2.tabs.slice(0, 3).map(t => { const base = L.median(Sv.rect(t.text.r + 6, t.text.r + 20, t.rect.t + 4, t.rect.b - 5).map(p => p.c)); const ink = M.inkBox(Sv, t.text.l - 2, t.text.r + 2, t.text.t - 3, t.text.b + 3, base, 8); return { label: t.label, base, ink: box(ink), inkH: ink && ink.h, inkFromTabL: ink && f2(ink.l - t.rect.l) }; });
    await ctx.close(); }
  // B: accordion tabboxes (text-only = Jess's, with images) at rest: Tab1 selected+expanded
  const accIdx = await (async () => { const { ctx, page } = await L.open(browser, 'tabbox.zul'); const r = await page.evaluate(() => [...document.querySelectorAll('.z-tabbox')].map((t, i) => ({ i, acc: t.classList.contains('z-tabbox-accordion') })).filter(x => x.acc).map(x => x.i)); await ctx.close(); return r; })();
  out.accordionIndexes = accIdx;
  async function openAccordion(page, idx) { await page.evaluate((idx) => { const tb = document.querySelectorAll('.z-tabbox')[idx]; window.scrollTo(0, tb.getBoundingClientRect().top + window.scrollY - 60); }, idx); await page.mouse.move(2, 2); await page.waitForTimeout(400); return tabsOf(page, idx); }
  for (const [k, idx] of [['textOnly', accIdx[0]], ['withImages', accIdx[1]]]) {
    const { ctx, page } = await L.open(browser, 'tabbox.zul'); const g = await openAccordion(page, idx);
    const S = await L.shot(page, 'final53-r4-acc-' + k + '-rest.png', { x: g.rect.l - 8, y: g.rect.t - 8, width: g.rect.w + 16, height: g.rect.h + 16 });
    const rows = g.tabs.map(t => ({ label: t.label, cls: t.cls, rect: t.rect, cnt: t.cnt, text: t.text, textRange: t.textRange, img: t.img, font: t.font, tabFont: t.tabFont, opacity: t.opacity, px: measureTab(S, t, { blank: [t.textRange.r + 20, t.textRange.r + 60], chevron: true }) }));
    // row separators / borders: scan a column between text and chevron for horizontal lines
    const colX = g.rect.l + Math.round(g.rect.w * 0.6); const lines = []; const pageBg = [255, 255, 255];
    for (let y = g.rect.t - 2; y <= g.rect.b + 2; y++) { const c = L.median(S.rect(colX, colX + 4, y, y).map(p => p.c)); const d = L.dE(c, pageBg); if (d >= 2) lines.push({ y, c, dE: +d.toFixed(2) }); }
    out['acc_' + k] = { idx, cls: g.cls, rect: g.rect, panels: g.panels, rows, lines: lines.map(l => [l.y, l.c.join(','), l.dE]), zoom: null };
    // zoom crop of Tab1 row (Jess's view) at DPR 2
    await L.shot(page, 'final53-r4-acc-' + k + '-tab1-zoom.png', { x: g.rect.l - 4, y: g.tabs[0].rect.t - 4, width: g.rect.w + 8, height: g.tabs[0].rect.h + 8 });
    await L.shot(page, 'final53-r4-acc-' + k + '-tab2-collapsed-zoom.png', { x: g.rect.l - 4, y: g.tabs[1].rect.t - 4, width: g.rect.w + 8, height: g.tabs[1].rect.h + 8 });
    // J53-3 colour references: token values resolved on the tab elements (reference only; judgment samples the chevron's darkest ink pixel)
    out['acc_' + k].tokens = await page.evaluate((idx) => { const tb = document.querySelectorAll('.z-tabbox')[idx]; const sel = tb.querySelector('.z-tab.z-tab-selected'); const un = [...tb.querySelectorAll('.z-tab')].find(t => !t.classList.contains('z-tab-selected') && !t.classList.contains('z-tab-disabled')); const v = (el, p) => getComputedStyle(el).getPropertyValue(p).trim(); const probe = (el, p) => { const d = document.createElement('div'); d.style.color = 'var(' + p + ')'; el.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }; return { onPrimaryContainer: probe(sel, '--zk-color-on-primary-container'), onSurfaceVariant: probe(un, '--zk-color-on-surface-variant'), chevronAfterSel: (cs => ({ bg: cs.backgroundColor, color: cs.color, mask: cs.maskImage || cs.webkitMaskImage, w: cs.width, h: cs.height, transform: cs.transform, border: cs.border }))(getComputedStyle(sel.querySelector('.z-tab-content'), '::after')), chevronAfterUnsel: (cs => ({ bg: cs.backgroundColor, color: cs.color, w: cs.width, h: cs.height, transform: cs.transform }))(getComputedStyle(un.querySelector('.z-tab-content'), '::after')) }; }, idx);
    // hover Tab2
    const t2 = g.tabs[1]; await page.mouse.move(t2.rect.l + 200, t2.rect.t + t2.rect.h / 2); await page.waitForTimeout(300);
    const Sh = await L.shot(page, 'final53-r4-acc-' + k + '-hover-tab2.png', { x: g.rect.l - 8, y: g.rect.t - 8, width: g.rect.w + 16, height: g.rect.h + 16 });
    out['acc_' + k].hoverTab2 = measureTab(Sh, t2, { blank: [t2.textRange.r + 20, t2.textRange.r + 60], chevron: true });
    out['acc_' + k].hoverTab2.dE_vs_rest = +L.dE(out['acc_' + k].hoverTab2.base, rows[1].px.base).toFixed(2);
    // click Tab2: expand animation must complete (jq.slideDown)
    await page.mouse.click(t2.rect.l + 200, t2.rect.t + t2.rect.h / 2); await L.settle(page); await page.waitForTimeout(900); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const g2 = await tabsOf(page, idx);
    const S3 = await L.shot(page, 'final53-r4-acc-' + k + '-tab2-selected.png', { x: g2.rect.l - 8, y: g2.rect.t - 8, width: g2.rect.w + 16, height: g2.rect.h + 16 });
    out['acc_' + k].afterClickTab2 = { tabs: g2.tabs.map(t => ({ label: t.label, cls: t.cls, rect: t.rect, font: t.font, px: measureTab(S3, t, { blank: [t.textRange.r + 20, t.textRange.r + 60], chevron: true }) })), panels: g2.panels };
    // disabled tab click does nothing (Tab4)
    const t4 = g2.tabs[3]; await page.mouse.click(t4.rect.l + 200, t4.rect.t + t4.rect.h / 2); await L.settle(page); await page.waitForTimeout(600);
    out['acc_' + k].afterClickTab4 = (await tabsOf(page, idx)).tabs.map(t => t.label + ':' + t.cls.replace('z-tab', '').trim());
    await ctx.close(); }
  // F: forced-colors accordion (J53-3): chevron ink must be non-empty in both directions
  { const { ctx, page } = await L.open(browser, 'tabbox.zul', { forcedColors: 'active' }); const g = await openAccordion(page, accIdx[0]);
    const S = await L.shot(page, 'final53-r4-acc-textOnly-forced.png', { x: g.rect.l - 8, y: g.rect.t - 8, width: g.rect.w + 16, height: g.rect.h + 16 });
    out.forced = { matchMedia: await page.evaluate(() => matchMedia('(forced-colors: active)').matches), rows: g.tabs.map(t => ({ label: t.label, cls: t.cls, rect: t.rect, px: measureTab(S, t, { blank: [t.textRange.r + 20, t.textRange.r + 60], chevron: true }) })) };
    await ctx.close(); }
  // C: combobox chevron baseline (combobox.zul, first combobox)
  { const { ctx, page } = await L.open(browser, 'combobox.zul');
    const c = await page.evaluate((Rsrc) => { const R = eval(Rsrc); const cb = document.querySelector('.z-combobox'); const btn = cb.querySelector('.z-combobox-button') || cb.querySelector('a, i'); const icon = cb.querySelector('.z-combobox-icon') || btn; return { cls: cb.className, rect: R(cb), btn: R(btn), btnCls: btn && btn.className, icon: R(icon), iconCls: icon && icon.className }; }, Rsrc);
    const S = await L.shot(page, 'final53-r4-combobox.png', { x: c.rect.l - 8, y: c.rect.t - 8, width: c.rect.w + 16, height: c.rect.h + 16 });
    const base = L.median(S.rect(c.rect.l + 6, c.rect.l + 10, c.rect.t + 6, c.rect.b - 7).map(p => p.c));
    const ink = M.inkBox(S, c.btn.l + 1, c.rect.r - 2, c.rect.t + 3, c.rect.b - 4, base, 8);
    out.combobox = { ...c, base, chevron: box(ink), chevFromR: ink ? f2(c.rect.r - ink.r) : null, chevCenterY: ink ? f2((ink.t + ink.b) / 2) : null, boxCenterY: f2((c.rect.t + c.rect.b) / 2) };
    await ctx.close(); }
  await browser.close();
  L.save('final53-r4.json', out);
  const H = out.horizontal.tabs, A = out.acc_textOnly.rows, B = out.acc_withImages.rows;
  console.log('=== horizontal0', JSON.stringify(out.horizontal.rect)); for (const t of H) console.log(t.label, t.cls, JSON.stringify(t.font), 'tabFont', JSON.stringify(t.tabFont), 'opacity', t.opacity, 'rect', JSON.stringify(t.rect), 'text', JSON.stringify(t.text), 'px', JSON.stringify(t.px));
  console.log('hoverDefault', JSON.stringify(out.horizontal.hoverDefault));
  for (const [k, rows] of [['textOnly', A], ['withImages', B]]) { console.log('=== accordion ' + k, JSON.stringify(out['acc_' + k].rect), 'lines', JSON.stringify(out['acc_' + k].lines)); for (const t of rows) console.log(t.label, t.cls, JSON.stringify(t.font), 'tabFont', JSON.stringify(t.tabFont), 'opacity', t.opacity, 'rect', JSON.stringify(t.rect), 'cnt', JSON.stringify(t.cnt), 'text', JSON.stringify(t.text), 'px', JSON.stringify(t.px));
    console.log('panels', JSON.stringify(out['acc_' + k].panels)); console.log('hoverTab2', JSON.stringify(out['acc_' + k].hoverTab2)); console.log('afterClickTab2', JSON.stringify(out['acc_' + k].afterClickTab2)); console.log('afterClickTab4', JSON.stringify(out['acc_' + k].afterClickTab4)); }
  console.log('=== forced', JSON.stringify(out.forced)); for (const k of ['textOnly','withImages']) console.log('tokens ' + k, JSON.stringify(out['acc_' + k].tokens)); console.log('=== combobox', JSON.stringify(out.combobox)); console.log('vertical3', JSON.stringify(out.vertical3));
})();
