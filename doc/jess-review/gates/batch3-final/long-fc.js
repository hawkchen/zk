// (d) sort icon vs long label vs menu button overlap (record only, follow-up 11); (e) forced-colors body divider (record, follow-up 12)
const { chromium, open, settle, pixels, dE } = require('./lib');
const fs = require('fs');
const ov = (a, b) => a && b && !(a.r <= b.l || a.l >= b.r || a.b <= b.t || a.t >= b.b);
(async () => {
  const br = await chromium.launch(); const out = { long: [] };
  { const { ctx, page } = await open(br, 'tmp-b3final-frozen.zul');
    const root = page.locator('.L-long').first(); await root.scrollIntoViewIfNeeded();
    for (let i = 0; i < 3; i++) {
      const th = root.locator('th.z-column').nth(i);
      await th.locator('.z-column-content').click({ position: { x: 10, y: 10 } }); await settle(page);
      const m = async () => th.evaluate(h => { const R = e => { if (!e) return null; const b = e.getBoundingClientRect(); return b.width ? { l: b.left, r: b.right, t: b.top, b: b.bottom } : null; };
        const c = h.querySelector('.z-column-content'); const w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT); let n, t = null; while ((n = w.nextNode())) if (n.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(n); const b = rg.getBoundingClientRect(); t = { l: b.left, r: b.right, t: b.top, b: b.bottom }; break; }
        const cs = getComputedStyle(c); return { aria: h.getAttribute('aria-sort'), th: R(h), text: t, icon: R(h.querySelector('.z-column-sorticon i')), btn: R(h.querySelector('.z-column-button')), contentClip: { l: c.getBoundingClientRect().left, r: c.getBoundingClientRect().right }, overflow: cs.overflow, textOverflow: cs.textOverflow, whiteSpace: cs.whiteSpace }; });
      await page.mouse.move(1279, 1); await page.waitForTimeout(150); const rest = await m();
      await th.hover({ position: { x: 20, y: 10 } }); await page.waitForTimeout(200); const hov = await m();
      const visText = t => t && { l: t.l, r: Math.min(t.r, rest.contentClip.r), t: t.t, b: t.b };
      out.long.push({ col: i, rest, hover: hov, iconOverText_rest: ov(rest.icon, visText(rest.text)), iconOverText_hover: ov(hov.icon, visText(hov.text)), btnOverIcon_hover: ov(hov.btn, hov.icon), btnOverText_hover: ov(hov.btn, visText(hov.text)), iconInsideTh: rest.icon ? rest.icon.r <= rest.th.r : null });
      await th.screenshot({ path: `long-col${i}-hover.png` }); await page.mouse.move(1279, 1); await page.waitForTimeout(150); await th.screenshot({ path: `long-col${i}-rest.png` });
    }
    await ctx.close(); }
  { const { ctx, page } = await open(br, 'grid.zul', { forcedColors: 'active' });
    const g = page.locator('.z-grid').nth(4); await g.scrollIntoViewIfNeeded(); await page.mouse.move(1279, 1); await page.waitForTimeout(300);
    const x0 = await g.evaluate(e => e.querySelectorAll('.z-column')[1].getBoundingClientRect().right);
    const hb = await g.evaluate(e => { const h = e.querySelectorAll('.z-column')[1].getBoundingClientRect(); return [h.x, h.y, h.width, h.height]; });
    const band = async b => { const im = await pixels(page, await page.screenshot({ clip: { x: Math.floor(x0 - 3), y: Math.floor(b[1]) + 3, width: 6, height: Math.floor(b[3]) - 6 } }));
      const cnt = new Map(); for (let i = 0; i < im.d.length; i += 4) { const k = im.d[i] + ',' + im.d[i + 1] + ',' + im.d[i + 2]; cnt.set(k, (cnt.get(k) || 0) + 1); } const bg = [...cnt.entries()].sort((a, c) => c[1] - a[1])[0][0].split(',').map(Number);
      let m = 0; for (let i = 0; i < im.d.length; i += 4) m = Math.max(m, dE([im.d[i], im.d[i + 1], im.d[i + 2]], bg)); return +m.toFixed(2); };
    const rows = await g.evaluate(e => [...e.querySelectorAll('.z-row')].map(r => { const b = r.getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; }));
    out.forcedDivider = { x0, header: await band(hb), rows: [] }; for (const r of rows) out.forcedDivider.rows.push(await band(r));
    await g.screenshot({ path: 'fc-frozen-grid.png' });
    await ctx.close(); }
  fs.writeFileSync(__dirname + '/long-fc.json', JSON.stringify(out, null, 1));
  out.long.forEach(l => console.log('col', l.col, l.rest.aria, 'iconOverText rest/hover', l.iconOverText_rest, l.iconOverText_hover, 'btnOverIcon', l.btnOverIcon_hover, 'btnOverText', l.btnOverText_hover, 'text', JSON.stringify(l.rest.text), 'icon', JSON.stringify(l.rest.icon), 'clip', JSON.stringify(l.rest.contentClip), l.rest.overflow, l.rest.textOverflow, l.rest.whiteSpace, 'btn', JSON.stringify(l.hover.btn)));
  console.log('forced divider', JSON.stringify(out.forcedDivider));
  await br.close();
})();
