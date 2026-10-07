// One-off record (no gate): data-brand="copper" for #8 (single-column hover block), #13 (creatable row gap) and
// #17 (readonly triple-click highlight). #12/#16 copper records are produced by final-red12.js / final-red16.js.
// Output: final-copper.json, final-copper-*.png
const L = require('./final-lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  const brand = (page) => page.evaluate(() => { document.documentElement.setAttribute('data-brand', 'copper'); return getComputedStyle(document.documentElement).getPropertyValue('--zk-color-primary').trim(); });
  // #8
  { const { ctx, page } = await L.open(browser, 'cascader.zul'); out.primaryCopper = await brand(page); await page.waitForTimeout(100);
    const id = await page.evaluate(() => document.querySelector('.z-cascader').id);
    await page.click('#' + id, { position: { x: 180, y: 20 } }); await L.settle(page);
    const info = await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const cs = getComputedStyle(pp); const li = pp.querySelectorAll('.z-cascader-item')[1]; return { popup: pp.getBoundingClientRect().toJSON(), innerLeft: pp.getBoundingClientRect().left + parseFloat(cs.borderLeftWidth), innerRight: pp.getBoundingClientRect().right - parseFloat(cs.borderRightWidth), li: li.getBoundingClientRect().toJSON() }; }, id);
    await page.mouse.move(info.li.x + 30, info.li.y + info.li.height / 2); await page.waitForTimeout(250);
    const S = await L.shot(page, 'final-copper-8-single-hover.png', { x: info.popup.x - 12, y: info.popup.y - 50, width: info.popup.width + 70, height: info.popup.height + 24 });
    const y = Math.round(info.li.y + 3); const px = S.rect(info.innerLeft, info.innerRight - 1, y, y); const row0 = px[0].dy; const line = px.filter(p => p.dy === row0);
    const hit = line.filter(p => L.dE(p.c, [255, 255, 255]) >= 1.5);
    out.i8 = { liRect: info.li, innerRight: info.innerRight, block: hit.length ? { x0: Math.min(...hit.map(p => p.x)), x1: (Math.max(...hit.map(p => p.dx)) + 1) / S.dpr, colour: L.median(hit.map(p => p.c)) } : null };
    out.i8.gapHighlightRightToInnerRight = out.i8.block ? +(info.innerRight - out.i8.block.x1).toFixed(2) : null;
    await ctx.close(); }
  // #13
  { const { ctx, page } = await L.open(browser, 'chosenbox.zul'); await brand(page); await page.waitForTimeout(100);
    const uuid = await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox')].map(n => zk.$(n)).filter(w => w._creatable).pop().uuid);
    await page.click('#' + uuid + ' input'); await page.keyboard.type('ffff'); await L.settle(page);
    out.i13 = await page.evaluate(uuid => { const row = document.getElementById(uuid + '-pp').querySelector('.z-chosenbox-empty-creatable'); const i = row.querySelector('i'); const s = row.querySelector('span'); const r = document.createRange(); r.selectNodeContents(s); const t = r.getBoundingClientRect(); const ir = i.getBoundingClientRect();
      return { gapIconRightToTextLeft: +(t.x - ir.right).toFixed(2), vCentreDeltaRect: +((ir.y + ir.height / 2) - (t.y + t.height / 2)).toFixed(2), popup: document.getElementById(uuid + '-pp').getBoundingClientRect().toJSON() }; }, uuid);
    await L.shot(page, 'final-copper-13-creatable.png', { x: out.i13.popup.x - 10, y: out.i13.popup.y - 60, width: out.i13.popup.width + 20, height: out.i13.popup.height + 80 });
    await ctx.close(); }
  // #17
  { const { ctx, page } = await L.open(browser, 'combobox.zul'); await brand(page); await page.waitForTimeout(100);
    const ro = await page.evaluate(() => [...document.querySelectorAll('.z-combobox')].find(n => n.classList.contains('z-combobox-readonly')).id);
    await page.click('#' + ro + ' .z-combobox-button'); await L.settle(page);
    const li = await page.evaluate(id => document.getElementById(id + '-pp').querySelector('.z-comboitem').getBoundingClientRect().toJSON(), ro);
    await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
    const G = await page.evaluate(id => document.getElementById(id).querySelector('input').getBoundingClientRect().toJSON(), ro);
    const clip = { x: G.x - 2, y: G.y - 2, width: G.width + 4, height: G.height + 4 }; const band = S => S.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2);
    await page.click('#' + ro + ' input'); await page.evaluate(id => document.getElementById(id).querySelector('input').setSelectionRange(0, 0), ro); await page.waitForTimeout(150);
    const base = band(await L.shot(page, 'final-copper-17-rest.png', clip));
    await page.click('#' + ro + ' input', { clickCount: 3 }); await page.waitForTimeout(150);
    const now = band(await L.shot(page, 'final-copper-17-triple.png', clip));
    let worst = 0, changed = 0; for (let k = 0; k < base.length; k++) { const d = L.dE(base[k].c, now[k].c); if (d > 2) changed++; worst = Math.max(worst, d); }
    out.i17 = { value: await page.evaluate(id => document.getElementById(id).querySelector('input').value, ro), selectionString: await page.evaluate(() => window.getSelection().toString()), changedPixels: changed, worstDE: +worst.toFixed(2) };
    await ctx.close(); }
  await browser.close();
  L.save('final-copper.json', out);
})().catch(e => { console.error(e); process.exit(1); });
