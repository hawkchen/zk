// Batch 11 RED, #57 borderlayout: per region, content text ink left edge relative to the region body's left inner edge; which element carries the padding (elementsFromPoint);
// computed padding of .z-north-body / .z-south-body (plan allows it: J57-2 evidence that the theme is untouched).
const L = require('./lib.js'); const M = require('./m11.js');
const launch = () => L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
const Rsrc = `(e => { if (!e) return null; const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; })`;
const f2 = v => v == null ? null : +(+v).toFixed(2);
async function blInfo(page, i) {
  return page.evaluate(({ i, Rsrc }) => { const R = eval(Rsrc); const bl = document.querySelectorAll('.z-borderlayout')[i]; const res = { i, rect: R(bl), regions: {} };
    for (const k of ['north', 'south', 'west', 'east', 'center']) { const r = bl.querySelector('.z-' + k); if (!r) continue; const body = r.querySelector('.z-' + k + '-body'); const head = r.querySelector('.z-' + k + '-header'); const spl = bl.querySelector('.z-' + k + '-splitter'); const bc = getComputedStyle(body);
      const label = body.querySelector('.z-label') || body; const tn = [...label.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); const rng = document.createRange(); if (tn) rng.selectNodeContents(tn); else rng.selectNodeContents(label);
      // padding chain: from the text's element up to the region
      const chain = []; let e = label; while (e && e !== r.parentElement) { const c = getComputedStyle(e); chain.push({ tag: e.tagName, cls: e.className, padding: c.padding, margin: c.margin, border: c.borderWidth }); e = e.parentElement; }
      const probe = { x: body.getBoundingClientRect().left + 6, y: body.getBoundingClientRect().top + 6 };
      const efp = document.elementsFromPoint(probe.x, probe.y).slice(0, 6).map(el => { const c = getComputedStyle(el); return { tag: el.tagName, cls: el.className, padding: c.padding }; });
      res.regions[k] = { cls: r.className, rect: R(r), head: R(head), splitter: R(spl), body: R(body), bodyPadding: bc.padding, bodyPaddingLeft: bc.paddingLeft, bodyBorder: bc.borderWidth, text: tn ? tn.textContent.trim() : label.textContent.trim().slice(0, 30), textRange: R(rng), labelRect: R(label), chain, probe, efp }; }
    return res; }, { i, Rsrc });
}
(async () => {
  const browser = await launch(); const out = { chromium: browser.version(), layouts: [] };
  const { ctx, page } = await L.open(browser, 'borderlayout.zul');
  const n = await page.evaluate(() => document.querySelectorAll('.z-borderlayout').length);
  const cssFile = await page.evaluate(() => [...document.styleSheets].map(s => s.href).filter(h => h && /borderlayout/.test(h)));
  for (let i = 0; i < n; i++) {
    await page.evaluate((i) => { const bl = document.querySelectorAll('.z-borderlayout')[i]; window.scrollTo(0, bl.getBoundingClientRect().top + window.scrollY - 60); }, i); await page.mouse.move(2, 2); await page.waitForTimeout(300);
    const g = await blInfo(page, i);
    const S = await L.shot(page, `red57-bl${i}.png`, { x: g.rect.l - 8, y: g.rect.t - 8, width: g.rect.w + 16, height: g.rect.h + 16 });
    for (const [k, r] of Object.entries(g.regions)) {
      const tr = r.textRange; const base = L.median(S.rect(tr.r + 6, tr.r + 20, tr.t + 2, tr.b - 2).map(p => p.c));
      const ink = M.inkBox(S, Math.max(tr.l - 3, r.body.l), tr.r + 3, Math.max(tr.t - 2, r.body.t), tr.b + 2, base, 8); // clipped to the body box so a region border line is not counted as ink
      r.px = { base, ink: ink && { l: ink.l, t: ink.t, w: ink.w, h: ink.h }, inkFromBodyL: ink ? f2(ink.l - r.body.l) : null, inkFromBodyT: ink ? f2(ink.t - r.body.t) : null, rangeFromBodyL: f2(tr.l - r.body.l), rangeFromBodyT: f2(tr.t - r.body.t) };
    }
    out.layouts.push(g);
  }
  // Jess's view (first borderlayout) full width
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(200); const g0 = await blInfo(page, 0); await L.shot(page, 'red57-jess-view.png', { x: g0.rect.l - 16, y: g0.rect.t - 50, width: g0.rect.w + 32, height: g0.rect.h + 70 });
  out.cssFile = cssFile;
  await ctx.close(); await browser.close(); L.save('red57.json', out);
  for (const g of out.layouts) { console.log('=== BL' + g.i, JSON.stringify(g.rect)); for (const [k, r] of Object.entries(g.regions)) console.log('  ', k.padEnd(6), r.cls.padEnd(26), 'body', JSON.stringify(r.body), 'bodyPad', r.bodyPadding, 'text', JSON.stringify(r.text), 'rangeL-bodyL', r.px.rangeFromBodyL, 'inkL-bodyL', r.px.inkFromBodyL, 'inkT-bodyT', r.px.inkFromBodyT, 'ink', JSON.stringify(r.px.ink), 'base', JSON.stringify(r.px.base), '\n        chain', JSON.stringify(r.chain.map(c => c.tag + '.' + c.cls.split(' ').slice(0, 2).join(' ') + ' pad=' + c.padding)), '\n        efp', JSON.stringify(r.efp.map(e => e.tag + '.' + e.cls.split(' ').slice(0, 2).join(' ') + ' pad=' + e.padding)), 'head', JSON.stringify(r.head), 'splitter', JSON.stringify(r.splitter)); }
  console.log('cssFile', JSON.stringify(out.cssFile));
})();
