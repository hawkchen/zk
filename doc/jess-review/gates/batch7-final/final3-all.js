// Batch 7 FINAL, #3 regression sweep over EVERY listbox on listbox.zul and listbox-header.zul (D53-A: th.z-listhead-bar
// must match the rest of the header in all listboxes). Real scrollbars (no --hide-scrollbars). Per listbox: scrollbar
// width, header-row pixel samples (blank between cells, first-cell left edge, per-row median across the header),
// the bar cell colour when it has width, and dE bar vs blank. Computed background colours are recorded only as
// explanation (the judgment is pixels).
const L = require('./lib.js');
const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });

async function scanPage(browser, pagePath) {
  const { ctx, page } = await L.open(browser, pagePath);
  const n = await page.evaluate(() => document.querySelectorAll('.z-listbox').length);
  const res = [];
  for (let i = 0; i < n; i++) {
    const g = await page.evaluate(({ i, Rs }) => { const R = new Function('return ' + Rs)(); const lb = document.querySelectorAll('.z-listbox')[i]; const body = lb.querySelector('.z-listbox-body'); const head = lb.querySelector('.z-listbox-header');
      const ths = [...lb.querySelectorAll('.z-listbox-header th')]; const bar = ths.find(t => t.classList.contains('z-listhead-bar'));
      const sbw = body ? body.offsetWidth - body.clientWidth : null; const br = body && body.getBoundingClientRect();
      return { i, lb: R(lb), head: R(head), body: R(body), sbw, vScroll: body ? body.scrollHeight > body.clientHeight : null, hasHead: !!head,
        ths: ths.map(t => ({ cls: t.className, rect: R(t), bg: getComputedStyle(t).backgroundColor })), bar: bar ? { rect: R(bar), bg: getComputedStyle(bar).backgroundColor } : null,
        sbCol: br ? { x0: br.right - sbw, x1: br.right } : null, title: (lb.closest('.z-groupbox, .z-panel, .z-vlayout > div') || {}).className }; }, { i, Rs: R.toString() });
    if (!g.hasHead || !g.head || g.head.h < 4) { res.push({ i, note: 'no header', sbw: g.sbw, bar: g.bar }); continue; }
    // scroll the listbox header into view (viewport 900px high)
    await page.evaluate(y => window.scrollTo(0, Math.max(0, window.scrollY + y - 60)), g.lb.t); await page.waitForTimeout(250); await page.mouse.move(2, 2);
    const g2 = await page.evaluate(({ i, Rs }) => { const R = new Function('return ' + Rs)(); const lb = document.querySelectorAll('.z-listbox')[i]; const body = lb.querySelector('.z-listbox-body'); const head = lb.querySelector('.z-listbox-header'); const br = body.getBoundingClientRect(); const sbw = body.offsetWidth - body.clientWidth;
      return { lb: R(lb), head: R(head), body: R(body), sbw, sbCol: { x0: br.right - sbw, x1: br.right }, ths: [...lb.querySelectorAll('.z-listbox-header th')].map(t => ({ cls: t.className, rect: R(t) })) }; }, { i, Rs: R.toString() });
    let S; try { S = await L.shot(page, null, { x: g2.lb.l - 4, y: g2.head.t - 4, width: g2.lb.w + 8, height: g2.head.h + 8 }); } catch (e) { res.push({ i, note: 'shot failed: ' + String(e.message).split('\n')[0], geom: g2, sbw: g2.sbw, bar: g.bar }); continue; }
    const hy0 = g2.head.t + 2, hy1 = g2.head.b - 3;
    const cells = g2.ths.filter(t => t.cls.indexOf('z-listhead-bar') < 0);
    const blank = cells.length > 1 ? L.median(S.rect(cells[1].rect.l - 6, cells[1].rect.l + 6, hy0, hy1).map(p => p.c)) : null;
    const blankFar = L.median(S.rect(cells[0].rect.l + 2, cells[0].rect.l + 8, hy0, hy1).map(p => p.c));
    const bar = g2.sbw > 0 ? L.median(S.rect(g2.sbCol.x0 + 1, g2.sbCol.x1 - 2, hy0, hy1).map(p => p.c)) : null;
    // header bottom border row and per-device-row median across the header (shape signature, text columns excluded by median)
    const rows = []; const d = S.dpr; for (let dy = Math.round(g2.head.t * d); dy < Math.round(g2.head.b * d); dy++) rows.push(L.median(S.rect(g2.lb.l + 2, g2.lb.r - 3, dy / d, dy / d).filter(p => p.dy === dy).map(p => p.c)));
    const ref = blank || blankFar;
    res.push({ i, sbw: g2.sbw, vScroll: g.vScroll, head: g2.head, nCells: cells.length, barCell: g.bar, barPx: bar, blank, blankFar, dE_bar_blank: bar ? +L.dE(bar, ref).toFixed(2) : null, dE_bar_blankFar: bar ? +L.dE(bar, blankFar).toFixed(2) : null,
      thBg: [...new Set(g.ths.map(t => t.bg))], headRowMedians: rows });
    if (g2.sbw > 0) await L.shot(page, `final3-all-${pagePath.replace('.zul', '')}-${i}-bar-zoom.png`, { x: g2.sbCol.x0 - 30, y: g2.head.t - 10, width: g2.sbw + 40, height: g2.head.h + 40 });
  }
  await ctx.close();
  return res;
}
(async () => {
  const browser = await launch();
  const out = { chromium: browser.version(), pages: {} };
  for (const p of ['listbox.zul', 'listbox-header.zul']) out.pages[p] = await scanPage(browser, p);
  await browser.close();
  L.save('final3-all.json', out);
  for (const p of Object.keys(out.pages)) for (const r of out.pages[p]) console.log(p, '#' + r.i, r.note || `sbw ${r.sbw} vScroll ${r.vScroll} cells ${r.nCells} barPx ${JSON.stringify(r.barPx)} blank ${JSON.stringify(r.blank)} blankFar ${JSON.stringify(r.blankFar)} dE ${r.dE_bar_blank}/${r.dE_bar_blankFar} thBg ${JSON.stringify(r.thBg)} barCellBg ${r.barCell && r.barCell.bg} barW ${r.barCell && r.barCell.rect.w}`);
})();
