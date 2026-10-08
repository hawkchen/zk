// #22 inputgroup: seam border width between adjacent controls and outer frame width, pixel scan only.
// Horizontal groups: scan along the vertical mid-line (plan) and also at t+5 (padding area, no glyphs) as a cross-check.
// Vertical group: scanned along the horizontal mid-line of the group (seams are horizontal).
const L = require('./lib');
const WHITE = [255, 255, 255];

(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'inputgroup.zul');
  const groups = await page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    return [...document.querySelectorAll('.z-inputgroup')].map(n => ({ cls: n.className, vertical: n.classList.contains('z-inputgroup-vertical'), root: R(n), label: [...n.children].map(c => c.tagName === 'DIV' ? c.textContent.trim() : '<' + c.className.split(' ').slice(0, 2).join('.') + '>').join(' '),
      children: [...n.children].map(c => ({ tag: c.tagName, cls: c.className, rect: R(c), text: (c.textContent || '').trim().slice(0, 20) })) }));
  });
  const out = { note: 'border pixel = ΔE(px, nearest fill) ≥ 6 where fill = white or the addon fill; run widths in CSS px (device px / 2). Mid-line scan passes through glyphs: runs inside a text/addon glyph box are tagged "glyph?"', groups: [] };
  // whole page screenshot region covering all groups (they fit in 1280x900? the page is taller -> scroll per group)
  for (const [gi, g] of groups.entries()) {
    const scrollY = Math.max(0, g.root.t - 100);
    await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await page.waitForTimeout(150);
    const gg = await page.evaluate((gi) => { const n = document.querySelectorAll('.z-inputgroup')[gi]; const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; }; return { root: R(n), children: [...n.children].map(c => R(c)) }; }, gi);
    const clip = { x: gg.root.l - 6, y: gg.root.t - 6, width: gg.root.w + 12, height: gg.root.h + 12 };
    const S = await L.shot(page, `red22-g${gi}.png`, clip);
    const isBorder = c => L.dE(c, WHITE) >= 6 && L.dE(c, [247, 249, 252]) >= 6; // not white, not the addon fill
    const scanLine = (horizontal, pos) => { // horizontal=true: scan x across at y=pos; else scan y at x=pos
      const dpos = Math.round(pos * S.dpr);
      const px = (horizontal ? S.rect(gg.root.l - 4, gg.root.r + 3, pos, pos) : S.rect(pos, pos, gg.root.t - 4, gg.root.b + 3)).filter(p => (horizontal ? p.dy : p.dx) === dpos); // one device row/column only
      const key = horizontal ? 'x' : 'y';
      px.sort((a, b) => a[key] - b[key]);
      const runs = []; let cur = null;
      for (const p of px) { if (isBorder(p.c)) { if (cur && p[key] - cur.lastPos <= 0.5 + 1e-6) { cur.n++; cur.lastPos = p[key]; cur.cols.push(p.c); } else { cur = { start: p[key], lastPos: p[key], n: 1, cols: [p.c] }; runs.push(cur); } } }
      return runs.map(r => ({ at: r.start, widthCss: r.n / S.dpr, color: L.median(r.cols) }));
    };
    const rows = [];
    if (!g.vertical) {
      const ymid = (gg.root.t + gg.root.b) / 2;
      for (const [tag, y] of [['mid', ymid], ['t+5', gg.root.t + 5], ['b-5', gg.root.b - 5]]) rows.push({ line: tag, y, runs: scanLine(true, y) });
      // outer frame: vertical scan through top/bottom borders at x = root.l + 6 (inside the first control, away from corners)
      rows.push({ line: 'vert@l+6', x: gg.root.l + 6, runs: scanLine(false, gg.root.l + 6) });
      rows.push({ line: 'vert@r-6', x: gg.root.r - 6, runs: scanLine(false, gg.root.r - 6) });
    } else {
      const xmid = (gg.root.l + gg.root.r) / 2;
      for (const [tag, x] of [['mid', xmid], ['l+5', gg.root.l + 5], ['r-5', gg.root.r - 5]]) rows.push({ line: tag, x, runs: scanLine(false, x) });
      rows.push({ line: 'horiz@t+6', y: gg.root.t + 6, runs: scanLine(true, gg.root.t + 6) });
      rows.push({ line: 'horiz@b-6', y: gg.root.b - 6, runs: scanLine(true, gg.root.b - 6) });
    }
    // seam positions from DOM (child boundaries) for classification
    const seams = gg.children.slice(1).map(c => g.vertical ? c.t : c.l);
    for (const r of rows) { const alongSeams = ('y' in r) === !g.vertical; // a scan along the group axis crosses the seams; a cross scan crosses only the outer frame
      const start = alongSeams ? (g.vertical ? gg.root.t : gg.root.l) : (g.vertical ? gg.root.l : gg.root.t), end = alongSeams ? (g.vertical ? gg.root.b : gg.root.r) : (g.vertical ? gg.root.r : gg.root.b);
      for (const run of r.runs) { const pos = run.at; const d = alongSeams ? seams.map(s => Math.abs(pos - s)) : [99]; const i = d.indexOf(Math.min(...d)); run.kind = (d[i] <= 2) ? 'seam' + (i + 1) : (Math.abs(pos - start) <= 2 ? 'outer-start' : (Math.abs(pos - end) <= 2.5 ? 'outer-end' : 'glyph?')); } }
    // ΔE of every seam / outer run against the outer-start run of the mid line
    const ref = (rows[0].runs.find(x => x.kind === 'outer-start') || {}).color;
    for (const r of rows) for (const run of r.runs) if (ref && run.kind !== 'glyph?') run.dEvsOuterStart = +L.dE(run.color, ref).toFixed(2);
    out.groups.push({ gi, label: g.label, cls: g.cls, vertical: g.vertical, root: gg.root, children: g.children.map((c, i) => c.tag + '.' + c.cls.split(' ')[0] + ' ' + JSON.stringify(gg.children[i]) + ' "' + c.text + '"'), seams, rows });
  }
  await ctx.close(); await browser.close();
  L.save('red22.json', out);
  for (const g of out.groups) { console.log('G' + g.gi, g.label, g.vertical ? 'V' : 'H', JSON.stringify(g.root), 'seams', JSON.stringify(g.seams)); for (const r of g.rows) console.log('   ', r.line, r.runs.filter(x => x.kind !== 'glyph?').map(x => `${x.kind}@${x.at}:${x.widthCss}px ${JSON.stringify(x.color)} dE${x.dEvsOuterStart}`).join(' | '), ' glyph-runs:', r.runs.filter(x => x.kind === 'glyph?').length); }
})().catch(e => { console.error(e); process.exit(1); });
