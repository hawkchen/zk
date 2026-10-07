// #17 readonly combobox: triple-click + Ctrl/Cmd+A selection (string + highlight pixels),
// protections: non-readonly selectable/typeable, readonly opens dropdown & picks, Tab focus ring. Output: red17.json, red17-*.png
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  async function run(opts, tag) {
    const { ctx, page } = await L.open(browser, 'combobox.zul', opts);
    const out = {};
    const ids = await page.evaluate(() => { const all = [...document.querySelectorAll('.z-combobox')]; return { ro: all.find(n => n.classList.contains('z-combobox-readonly')).id, rw: all[0].id }; });
    out.ids = ids;
    const inputSel = '#' + ids.ro + ' input';
    const geom = () => page.evaluate(id => { const n = document.getElementById(id); const i = n.querySelector('input'); const cs = getComputedStyle(i); return { root: n.getBoundingClientRect().toJSON(), input: i.getBoundingClientRect().toJSON(), value: i.value, readOnly: i.readOnly, userSelect: cs.userSelect, webkitUserSelect: cs.webkitUserSelect, rootCls: n.className, rootBorder: getComputedStyle(n).borderColor, rootShadow: getComputedStyle(n).boxShadow, inputBorder: cs.borderColor, inputBg: cs.backgroundColor }; }, ids.ro);
    out.before = await geom();
    // protection: readonly still opens the dropdown and picks an item (value changes)
    await page.click('#' + ids.ro + ' .z-combobox-button'); await L.settle(page);
    out.dropdown = await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const cs = getComputedStyle(pp); return { display: cs.display, visible: cs.display !== 'none' && pp.getBoundingClientRect().height > 0, items: [...pp.querySelectorAll('.z-comboitem')].map(l => l.textContent) }; }, ids.ro);
    const li = await page.evaluate(id => document.getElementById(id + '-pp').querySelector('.z-comboitem').getBoundingClientRect().toJSON(), ids.ro);
    await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
    out.afterPick = await geom();
    await page.mouse.move(2, 2); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(200);
    const G = out.afterPick.input; const clip = { x: G.x - 2, y: G.y - 2, width: G.width + 4, height: G.height + 4 };
    await L.shot(page, `red17-${tag}-ro-blurred.png`, clip);
    // baseline = focused, selection collapsed (focus ring present in both frames; only the selection highlight can differ)
    await page.click(inputSel); await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro); await page.waitForTimeout(150);
    const S0 = await L.shot(page, `red17-${tag}-ro-rest.png`, clip);
    const textBand = () => S0.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2);
    const base = textBand();
    const sel = () => page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); const s = window.getSelection(); return { selectionString: s.toString(), selStart: i.selectionStart, selEnd: i.selectionEnd, inputSelected: i.value.substring(i.selectionStart, i.selectionEnd), active: document.activeElement === i }; }, ids.ro);
    const diff = (S) => { const now = S.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2); let worst = { dE: 0 }, changed = 0; const changedPx = [];
      for (let k = 0; k < base.length; k++) { const d = L.dE(base[k].c, now[k].c); if (d > 2) { changed++; changedPx.push(now[k]); } if (d > worst.dE) worst = { dE: +d.toFixed(2), x: now[k].x, y: now[k].y, before: base[k].c, after: now[k].c }; }
      return { worst, changedPixels: changed, changedColour: changedPx.length ? L.median(changedPx.map(p => p.c)) : null, changedX: changedPx.length ? [Math.min(...changedPx.map(p => p.x)), Math.max(...changedPx.map(p => p.x))] : null }; };
    // triple-click
    await page.click(inputSel, { clickCount: 3 }); await page.waitForTimeout(150);
    out.tripleClick = { ...(await sel()), pixels: diff(await L.shot(page, `red17-${tag}-ro-triple.png`, clip)) };
    // collapse, then Ctrl+A and Meta+A (macOS Chromium: Meta+A is select-all; Control+A is recorded too)
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(100);
    await page.click(inputSel); await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
    await page.keyboard.press('Control+A'); await page.waitForTimeout(150);
    out.ctrlA = { ...(await sel()), pixels: diff(await L.shot(page, `red17-${tag}-ro-ctrlA.png`, clip)) };
    await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
    await page.keyboard.press('Meta+A'); await page.waitForTimeout(150);
    out.metaA = { ...(await sel()), pixels: diff(await L.shot(page, `red17-${tag}-ro-metaA.png`, clip)) };
    // mouse drag across the text
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.mouse.move(G.x + 14, G.y + G.height / 2); await page.mouse.down(); await page.mouse.move(G.x + 60, G.y + G.height / 2, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(150);
    out.drag = { ...(await sel()), pixels: diff(await L.shot(page, `red17-${tag}-ro-drag.png`, clip)) };
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2);
    // protections: non-readonly combobox selectable + typeable
    const rwSel = '#' + ids.rw + ' input';
    await page.click(rwSel); await page.keyboard.type('abc'); await page.waitForTimeout(100);
    await page.click(rwSel, { clickCount: 3 }); await page.waitForTimeout(100);
    out.rw = await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); return { value: i.value, selected: i.value.substring(i.selectionStart, i.selectionEnd), selectionString: window.getSelection().toString(), userSelect: getComputedStyle(i).userSelect }; }, ids.rw);
    await page.keyboard.press('Escape'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(100);
    // protection: Tab reaches the readonly input and shows a focus ring
    await page.click('#' + ids.rw + ' input'); await page.keyboard.press('Escape');
    let hops = 0, reached = false;
    while (hops < 8) { await page.keyboard.press('Tab'); hops++; await page.waitForTimeout(80); if (await page.evaluate(id => document.activeElement === document.getElementById(id).querySelector('input'), ids.ro)) { reached = true; break; } }
    await L.settle(page);
    const fg = await geom();
    out.tabFocus = { hops, reached, focusVisible: await page.evaluate(id => ({ input: document.getElementById(id).querySelector('input').matches(':focus-visible'), rootHasFocusWithin: document.getElementById(id).matches(':focus-within'), rootCls: document.getElementById(id).className }), ids.ro), rootBorderRest: out.afterPick.rootBorder, rootBorderFocus: fg.rootBorder, inputBorderRest: out.afterPick.inputBorder, inputBorderFocus: fg.inputBorder, rootShadowFocus: fg.rootShadow };
    const R = fg.root; const fclip = { x: R.x - 4, y: R.y - 4, width: R.width + 8, height: R.height + 8 };
    const SF = await L.shot(page, `red17-${tag}-ro-tabfocus.png`, fclip);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(150);
    const SR = await L.shot(page, `red17-${tag}-ro-blur.png`, fclip);
    // ring pixels: the border rows/cols of the root box, focus vs blur
    const ring = (S) => [...S.rect(R.x, R.right, R.y, R.y + 1), ...S.rect(R.x, R.right, R.bottom - 1, R.bottom), ...S.rect(R.x, R.x + 1, R.y, R.bottom), ...S.rect(R.right - 1, R.right, R.y, R.bottom)];
    const a = ring(SF), b = ring(SR); let w = 0; for (let k = 0; k < a.length; k++) w = Math.max(w, L.dE(a[k].c, b[k].c));
    out.tabFocus.ringPixelWorstDE = +w.toFixed(2); out.tabFocus.ringColourFocus = L.median(a.map(p => p.c)); out.tabFocus.ringColourBlur = L.median(b.map(p => p.c));
    await ctx.close();
    return out;
  }
  const out = { default: await run({}, 'default') };
  const fc = await run({ forcedColors: 'active' }, 'forced');
  out.forcedColors = { tripleClick: fc.tripleClick, tabFocus: { ringPixelWorstDE: fc.tabFocus.ringPixelWorstDE, reached: fc.tabFocus.reached } };
  L.save('red17.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
