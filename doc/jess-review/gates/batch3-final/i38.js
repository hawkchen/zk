// #38 (D30-A): hover delta per row (pixel before/after), uniformity, 4% on-surface, knob, frozen, forced-colors, group
const { chromium, open, settle, pixels } = require('./lib');
const fs = require('fs');

async function px(page, x, y) { const buf = await page.screenshot({ clip: { x: Math.floor(x), y: Math.floor(y), width: 1, height: 1 } }); const im = await pixels(page, buf); return [im.d[0], im.d[1], im.d[2]]; }
// blank point: right edge of last cell, 5px inside, row mid-height. verify elementFromPoint is not text
async function blankPoint(page, row) {
  return page.evaluate(r => { const cs = [...r.cells]; const c = cs[cs.length - 1]; const b = c.getBoundingClientRect(); const rb = r.getBoundingClientRect();
    // choose x close to right edge of the row and verify no text node rect covers it
    const x = Math.min(b.right, rb.right) - 6, y = rb.top + rb.height / 2;
    return { x, y, el: document.elementFromPoint(x, y).className }; }, await row.elementHandle());
}
async function rowDeltas(page, rows, opts = {}) {
  const res = [];
  const n = await rows.count();
  for (let i = 0; i < n; i++) {
    const row = rows.nth(i);
    await row.scrollIntoViewIfNeeded();
    const info = { i, cls: await row.getAttribute('class') };
    const pt = await blankPoint(page, row); info.pt = pt;
    await page.mouse.move(1275, 5); await page.waitForTimeout(120);
    const before = await px(page, pt.x, pt.y);
    await page.mouse.move(pt.x, pt.y); await page.waitForTimeout(150);
    const after = await px(page, pt.x, pt.y);
    info.before = before; info.after = after; info.delta = after.map((v, k) => v - before[k]);
    res.push(info);
  }
  return res;
}
const spread = rs => { let m = 0; for (let k = 0; k < 3; k++) { const v = rs.map(r => r.delta[k]); m = Math.max(m, Math.max(...v) - Math.min(...v)); } return m; };
async function onSurface(page) { return page.evaluate(() => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;left:-99px;color:var(--zk-color-on-surface)'; document.body.appendChild(d); const c = getComputedStyle(d).color; d.remove(); return c; }); }
const parse = c => { const m = c.match(/[\d.]+/g); if (/^color\(srgb/.test(c)) return m.slice(0, 3).map(v => Math.round(v * 255)); return m.slice(0, 3).map(Number); };
const exp = (base, os, a) => base.map((b, k) => Math.round(b * (1 - a) + os[k] * a) - b);

(async () => {
  const browser = await chromium.launch();
  const out = {};
  { const { ctx, page } = await open(browser, 'grid.zul');
    const os = parse(await onSurface(page)); out.onSurface = os;
    out.hoverBgToken = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--zk-grid-row-hover-bg'));
    for (const [name, gi] of [['rowStates', 0], ['basic', 1]]) {
      const rows = page.locator('.z-grid').nth(gi).locator('.z-row');
      const rs = await rowDeltas(page, rows);
      rs.forEach(r => { r.expected4 = exp(r.before, os, 0.04); r.expected8 = exp(r.before, os, 0.08); r.d4 = r.delta.map((v, k) => v - r.expected4[k]); });
      out[name] = { rows: rs, spread: spread(rs), maxAbs: rs.map(r => Math.max(...r.delta.map(Math.abs))), all4pct: rs.every(r => r.d4.every(v => Math.abs(v) <= 1)) };
    }
    // frozen grid: per-row cell backgrounds on hover
    const fg = page.locator('.z-grid').nth(4); await fg.scrollIntoViewIfNeeded();
    const row = fg.locator('.z-row').nth(1);
    await page.mouse.move(1275, 5); await page.waitForTimeout(100);
    const cells = await row.evaluate(r => [...r.cells].slice(0, 4).map(td => { const b = td.getBoundingClientRect(); return { x: b.right - 6, y: b.top + b.height / 2 }; }));
    const rest = []; for (const c of cells) rest.push(await px(page, c.x, c.y));
    await page.mouse.move(cells[3].x, cells[3].y); await page.waitForTimeout(150);
    const hov = []; for (const c of cells) hov.push(await px(page, c.x, c.y));
    out.frozenHover = { rest, hov, sameAcrossCells: hov.every(h => h.every((v, k) => Math.abs(v - hov[0][k]) <= 0)) };
    // knob override (custom property, scoped to :root)
    await page.addStyleTag({ content: ':root{--zk-grid-row-hover-bg:rgb(255,0,0)}' }); await page.waitForTimeout(100);
    const kn = await rowDeltas(page, page.locator('.z-grid').nth(0).locator('.z-row'));
    out.knobRed = kn.map(r => ({ i: r.i, before: r.before, after: r.after }));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'grid.zul', { forcedColors: 'active' });
    const rs = await rowDeltas(page, page.locator('.z-grid').nth(0).locator('.z-row'));
    out.forced = rs.map(r => ({ i: r.i, before: r.before, after: r.after, delta: r.delta }));
    await ctx.close(); }
  { const { ctx, page } = await open(browser, 'grid-grouping.zul');
    const rs = await rowDeltas(page, page.locator('.z-group').first());
    out.group = rs.map(r => ({ before: r.before, after: r.after, delta: r.delta }));
    await ctx.close(); }
  fs.writeFileSync(__dirname + '/i38.json', JSON.stringify(out, null, 1));
  console.log('onSurface', out.onSurface, 'token', out.hoverBgToken);
  for (const n of ['rowStates', 'basic']) { console.log(n, 'spread', out[n].spread, 'all4pct', out[n].all4pct); out[n].rows.forEach(r => console.log('  row', r.i, r.cls, 'before', r.before, 'delta', r.delta, 'exp4', r.expected4, 'exp8', r.expected8, 'pt', r.pt.el)); }
  console.log('frozen', JSON.stringify(out.frozenHover));
  console.log('knob', JSON.stringify(out.knobRed));
  console.log('forced', JSON.stringify(out.forced));
  console.log('group', JSON.stringify(out.group));
  await browser.close();
})();
