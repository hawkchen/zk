// #17 FINAL (D48-A): readonly combobox — after picking an item from the dropdown, after triple-click and after Cmd+A,
// the input's text band must show no highlight pixels vs the unselected state of the same focus state (ΔE ≤ 2, count 0).
// getSelection() string is recorded only. Protections: non-readonly still shows a visible highlight (ΔE well above 2),
// still typeable; readonly still opens the dropdown and picks; Tab reaches the readonly input with a focus ring (ΔE ≥ 50).
// Derived from batch5-red/red17.js; the baseline is taken in the same focus state as the measured frame.
// Output: final-red17.json, final-red17-*.png
const L = require('./final-lib.js');
(async () => {
  const browser = await L.chromium.launch();
  async function run(opts, tag) {
    const { ctx, page } = await L.open(browser, 'combobox.zul', opts);
    const out = {};
    const ids = await page.evaluate(() => { const all = [...document.querySelectorAll('.z-combobox')]; return { ro: all.find(n => n.classList.contains('z-combobox-readonly')).id, rw: all[0].id }; });
    out.ids = ids;
    const inputSel = '#' + ids.ro + ' input';
    const geom = (id) => page.evaluate(id => { const n = document.getElementById(id); const i = n.querySelector('input'); const cs = getComputedStyle(i); return { root: n.getBoundingClientRect().toJSON(), input: i.getBoundingClientRect().toJSON(), value: i.value, readOnly: i.readOnly, userSelect: cs.userSelect, rootCls: n.className, rootBorder: getComputedStyle(n).borderColor, inputBorder: cs.borderColor, inputBg: cs.backgroundColor, active: document.activeElement === i, selStart: i.selectionStart, selEnd: i.selectionEnd, selectionString: window.getSelection().toString() }; }, id);
    out.before = await geom(ids.ro);
    // protection: readonly still opens the dropdown and picks an item (value changes)
    await page.click('#' + ids.ro + ' .z-combobox-button'); await L.settle(page);
    out.dropdown = await page.evaluate(id => { const pp = document.getElementById(id + '-pp'); const cs = getComputedStyle(pp); return { display: cs.display, visible: cs.display !== 'none' && pp.getBoundingClientRect().height > 0, items: [...pp.querySelectorAll('.z-comboitem')].map(l => l.textContent) }; }, ids.ro);
    const li = await page.evaluate(id => document.getElementById(id + '-pp').querySelector('.z-comboitem').getBoundingClientRect().toJSON(), ids.ro);
    await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
    out.afterPick = await geom(ids.ro);
    const G = out.afterPick.input; const clip = { x: G.x - 2, y: G.y - 2, width: G.width + 4, height: G.height + 4 };
    const band = (S) => S.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2);
    const diff = (base, S) => { const now = band(S); let worst = { dE: 0 }, changed = 0; const changedPx = [];
      for (let k = 0; k < base.length; k++) { const d = L.dE(base[k].c, now[k].c); if (d > 2) { changed++; changedPx.push(now[k]); } if (d > worst.dE) worst = { dE: +d.toFixed(2), x: now[k].x, y: now[k].y, before: base[k].c, after: now[k].c }; }
      return { worst, changedPixels: changed, changedColour: changedPx.length ? L.median(changedPx.map(p => p.c)) : null, changedX: changedPx.length ? [Math.min(...changedPx.map(p => p.x)), Math.max(...changedPx.map(p => p.x))] : null }; };
    // frame right after the pick: pointer parked on the input centre (same spot as every later click), nothing else touched
    await page.mouse.move(G.x + G.width / 2, G.y + G.height / 2); await page.waitForTimeout(150);
    const stateAfterPick = await geom(ids.ro);
    const SP = await L.shot(page, `final-red17-${tag}-ro-afterpick.png`, clip);
    // baselines, both with the selection collapsed: focused (pointer on the input) and blurred (pointer on the input)
    await page.click(inputSel); await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro); await page.waitForTimeout(150);
    const stateBaseFocused = await geom(ids.ro);
    const S0 = await L.shot(page, `final-red17-${tag}-ro-rest.png`, clip);
    const baseFocused = band(S0);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(150);
    const stateBaseBlurred = await geom(ids.ro);
    const SB = await L.shot(page, `final-red17-${tag}-ro-rest-blurred.png`, clip);
    const baseBlurred = band(SB);
    const baseFor = (st) => st.active ? { name: 'focused-collapsed', px: baseFocused } : { name: 'blurred-collapsed', px: baseBlurred };
    const bp = baseFor(stateAfterPick);
    out.pickHighlight = { stateAfterPick: { active: stateAfterPick.active, selStart: stateAfterPick.selStart, selEnd: stateAfterPick.selEnd, selectionString: stateAfterPick.selectionString, value: stateAfterPick.value }, baselineUsed: bp.name, pixels: diff(bp.px, SP) };
    out.baselines = { focused: { active: stateBaseFocused.active, sel: [stateBaseFocused.selStart, stateBaseFocused.selEnd] }, blurred: { active: stateBaseBlurred.active, sel: [stateBaseBlurred.selStart, stateBaseBlurred.selEnd] } };
    // triple-click (focused): compare with the focused-collapsed baseline
    await page.click(inputSel, { clickCount: 3 }); await page.waitForTimeout(150);
    const stTriple = await geom(ids.ro);
    out.tripleClick = { active: stTriple.active, selStart: stTriple.selStart, selEnd: stTriple.selEnd, selectionString: stTriple.selectionString, baselineUsed: baseFor(stTriple).name, pixels: diff(baseFor(stTriple).px, await L.shot(page, `final-red17-${tag}-ro-triple.png`, clip)) };
    // Cmd+A (Meta+A) from a collapsed, focused input
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(100);
    await page.click(inputSel); await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
    await page.keyboard.press('Meta+A'); await page.waitForTimeout(150);
    const stMeta = await geom(ids.ro);
    out.metaA = { active: stMeta.active, selStart: stMeta.selStart, selEnd: stMeta.selEnd, selectionString: stMeta.selectionString, baselineUsed: baseFor(stMeta).name, pixels: diff(baseFor(stMeta).px, await L.shot(page, `final-red17-${tag}-ro-metaA.png`, clip)) };
    // Control+A recorded only (macOS Chromium: caret to line start)
    await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
    await page.keyboard.press('Control+A'); await page.waitForTimeout(150);
    const stCtrl = await geom(ids.ro);
    out.ctrlA_record = { selStart: stCtrl.selStart, selEnd: stCtrl.selEnd, selectionString: stCtrl.selectionString, pixels: diff(baseFor(stCtrl).px, await L.shot(page, `final-red17-${tag}-ro-ctrlA.png`, clip)) };
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(100);

    // protections on the non-readonly (Default) combobox: typeable, and the selection highlight is still VISIBLE
    const rwSel = '#' + ids.rw + ' input';
    await page.click(rwSel); await page.keyboard.type('abc'); await page.waitForTimeout(100);
    await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.rw); await page.waitForTimeout(150);
    const rwG = (await geom(ids.rw)).input; const rwClip = { x: rwG.x - 2, y: rwG.y - 2, width: rwG.width + 4, height: rwG.height + 4 };
    const rwBand = (S) => S.rect(rwG.x + 1, rwG.right - 1, rwG.y + 2, rwG.bottom - 2);
    const rwBase = rwBand(await L.shot(page, `final-red17-${tag}-rw-rest.png`, rwClip));
    await page.click(rwSel, { clickCount: 3 }); await page.waitForTimeout(150);
    const rwSt = await geom(ids.rw);
    const rwNow = rwBand(await L.shot(page, `final-red17-${tag}-rw-triple.png`, rwClip));
    { let worst = { dE: 0 }, changed = 0; const px = []; for (let k = 0; k < rwBase.length; k++) { const d = L.dE(rwBase[k].c, rwNow[k].c); if (d > 2) { changed++; px.push(rwNow[k]); } if (d > worst.dE) worst = { dE: +d.toFixed(2), x: rwNow[k].x, y: rwNow[k].y, before: rwBase[k].c, after: rwNow[k].c }; }
      out.rw = { value: rwSt.value, active: rwSt.active, selStart: rwSt.selStart, selEnd: rwSt.selEnd, selectionString: rwSt.selectionString, userSelect: rwSt.userSelect, highlight: { worst, changedPixels: changed, changedColour: px.length ? L.median(px.map(p => p.c)) : null } }; }
    await page.keyboard.press('Escape'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(100);
    // protection: Tab reaches the readonly input and shows a focus ring
    await page.click('#' + ids.rw + ' input'); await page.keyboard.press('Escape');
    let hops = 0, reached = false;
    while (hops < 8) { await page.keyboard.press('Tab'); hops++; await page.waitForTimeout(80); if (await page.evaluate(id => document.activeElement === document.getElementById(id).querySelector('input'), ids.ro)) { reached = true; break; } }
    await L.settle(page);
    const fg = await geom(ids.ro);
    out.tabFocus = { hops, reached, focusVisible: await page.evaluate(id => ({ input: document.getElementById(id).querySelector('input').matches(':focus-visible'), rootHasFocusWithin: document.getElementById(id).matches(':focus-within'), rootCls: document.getElementById(id).className }), ids.ro), rootBorderRest: out.afterPick.rootBorder, rootBorderFocus: fg.rootBorder, inputBorderRest: out.afterPick.inputBorder, inputBorderFocus: fg.inputBorder };
    const R = fg.root; const fclip = { x: R.x - 4, y: R.y - 4, width: R.width + 8, height: R.height + 8 };
    const SF = await L.shot(page, `final-red17-${tag}-ro-tabfocus.png`, fclip);
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.waitForTimeout(150);
    const SR = await L.shot(page, `final-red17-${tag}-ro-blur.png`, fclip);
    const ring = (S) => [...S.rect(R.x, R.right, R.y, R.y + 1), ...S.rect(R.x, R.right, R.bottom - 1, R.bottom), ...S.rect(R.x, R.x + 1, R.y, R.bottom), ...S.rect(R.right - 1, R.right, R.y, R.bottom)];
    const a = ring(SF), b = ring(SR); let w = 0; for (let k = 0; k < a.length; k++) w = Math.max(w, L.dE(a[k].c, b[k].c));
    out.tabFocus.ringPixelWorstDE = +w.toFixed(2); out.tabFocus.ringColourFocus = L.median(a.map(p => p.c)); out.tabFocus.ringColourBlur = L.median(b.map(p => p.c));
    await ctx.close();
    return out;
  }
  const out = { default: await run({}, 'default') };
  const fc = await run({ forcedColors: 'active' }, 'forced');
  out.forcedColors = { pickHighlight: fc.pickHighlight, tripleClick: fc.tripleClick, metaA: fc.metaA, rw: fc.rw, tabFocus: { ringPixelWorstDE: fc.tabFocus.ringPixelWorstDE, reached: fc.tabFocus.reached } };
  L.save('final-red17.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
