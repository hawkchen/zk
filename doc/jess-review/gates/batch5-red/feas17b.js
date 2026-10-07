// Feasibility probe B (not a judgment): two in-page CSS variants for the readonly combobox input, each in a fresh context:
//  V1 ::selection transparent (D45-B shape)   V2 pointer-events:none on the input (clicks fall through; keyboard untouched)
// Records: selection string + highlight pixels after triple-click / Cmd+A, Tab focus ring, dropdown pick.
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const out = { chromium: browser.version() };
  for (const [name, css] of [
    ['V1_selectionTransparent', '.z-combobox-readonly .z-combobox-input::selection{background:transparent;color:inherit}'],
    ['V2_pointerEventsNone', '.z-combobox-readonly .z-combobox-input{pointer-events:none}'],
  ]) {
    const { ctx, page } = await L.open(browser, 'combobox.zul'); const r = {};
    const ids = await page.evaluate(() => { const all = [...document.querySelectorAll('.z-combobox')]; return { ro: all.find(n => n.classList.contains('z-combobox-readonly')).id, rw: all[0].id }; });
    await page.click('#' + ids.ro + ' .z-combobox-button'); await L.settle(page);
    let li = await page.evaluate(id => document.getElementById(id + '-pp').querySelector('.z-comboitem').getBoundingClientRect().toJSON(), ids.ro);
    await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
    await page.addStyleTag({ content: css });
    const G = await page.evaluate(id => document.getElementById(id).querySelector('input').getBoundingClientRect().toJSON(), ids.ro);
    const clip = { x: G.x - 2, y: G.y - 2, width: G.width + 4, height: G.height + 4 };
    await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.focus(); i.setSelectionRange(0, 0); }, ids.ro); await page.waitForTimeout(150);
    const S0 = await L.shot(page, `feas17b-${name}-rest.png`, clip); const base = S0.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2);
    const sel = () => page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); return { selectionString: window.getSelection().toString(), selStart: i.selectionStart, selEnd: i.selectionEnd, value: i.value, active: document.activeElement === i, activeEl: document.activeElement.className }; }, ids.ro);
    const diff = (S) => { const now = S.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2); let worst = 0, changed = 0; for (let k = 0; k < base.length; k++) { const d = L.dE(base[k].c, now[k].c); if (d > 2) changed++; worst = Math.max(worst, d); } return { worstDE: +worst.toFixed(2), changedPixels: changed }; };
    await page.mouse.click(G.x + 20, G.y + G.height / 2, { clickCount: 3 }); await page.waitForTimeout(150);
    r.tripleClick = { ...(await sel()), pixels: diff(await L.shot(page, `feas17b-${name}-triple.png`, clip)) };
    await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.focus(); i.setSelectionRange(0, 0); }, ids.ro);
    await page.keyboard.press('Meta+A'); await page.waitForTimeout(150);
    r.metaA = { ...(await sel()), pixels: diff(await L.shot(page, `feas17b-${name}-metaA.png`, clip)) };
    await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
    await page.mouse.move(G.x + 14, G.y + G.height / 2); await page.mouse.down(); await page.mouse.move(G.x + 60, G.y + G.height / 2, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(150);
    r.drag = { ...(await sel()), pixels: diff(await L.shot(page, `feas17b-${name}-drag.png`, clip)) };
    // click on the input area: does the dropdown open (ZK opens on input click for readonly)? what is hit?
    await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await page.waitForTimeout(100);
    r.hitOnInput = await page.evaluate(([id, x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + '.' + e.className : null; }, [ids.ro, G.x + 20, G.y + G.height / 2]);
    await page.mouse.click(G.x + 20, G.y + G.height / 2); await L.settle(page);
    r.clickInputOpensPopup = await page.evaluate(id => getComputedStyle(document.getElementById(id + '-pp')).display !== 'none', ids.ro);
    await page.keyboard.press('Escape'); await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2); await L.settle(page);
    // dropdown via button still picks (Item 2)
    await page.click('#' + ids.ro + ' .z-combobox-button'); await L.settle(page);
    li = await page.evaluate(id => document.getElementById(id + '-pp').querySelectorAll('.z-comboitem')[1].getBoundingClientRect().toJSON(), ids.ro);
    await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
    r.pickItem2 = await page.evaluate(id => document.getElementById(id).querySelector('input').value, ids.ro);
    // Tab focus from the Default combobox
    await page.evaluate(() => document.activeElement && document.activeElement.blur());
    await page.click('#' + ids.rw + ' input'); await page.keyboard.press('Escape'); await page.keyboard.press('Tab'); await page.waitForTimeout(150);
    r.tabFocus = await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); return { reached: document.activeElement === i, focusVisible: i.matches(':focus-visible'), inputBorder: getComputedStyle(i).borderColor }; }, ids.ro);
    out[name] = r; await ctx.close();
  }
  L.save('feas17b.json', out); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
