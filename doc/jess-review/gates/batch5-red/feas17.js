// Feasibility probe for D45-A (not a judgment): inject user-select:none on the readonly input IN PAGE (no source change),
// then repeat triple-click / Cmd+A / drag and check selection string + highlight pixels; also check the dropdown still picks.
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'combobox.zul');
  const out = {};
  const ids = await page.evaluate(() => { const all = [...document.querySelectorAll('.z-combobox')]; return { ro: all.find(n => n.classList.contains('z-combobox-readonly')).id, rw: all[0].id }; });
  const inputSel = '#' + ids.ro + ' input';
  await page.click('#' + ids.ro + ' .z-combobox-button'); await L.settle(page);
  let li = await page.evaluate(id => document.getElementById(id + '-pp').querySelector('.z-comboitem').getBoundingClientRect().toJSON(), ids.ro);
  await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
  await page.addStyleTag({ content: '.z-combobox-readonly .z-combobox-input{user-select:none;-webkit-user-select:none}' });
  out.userSelect = await page.evaluate(id => getComputedStyle(document.getElementById(id).querySelector('input')).userSelect, ids.ro);
  const G = await page.evaluate(id => document.getElementById(id).querySelector('input').getBoundingClientRect().toJSON(), ids.ro);
  const clip = { x: G.x - 2, y: G.y - 2, width: G.width + 4, height: G.height + 4 };
  await page.click(inputSel); await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro); await page.waitForTimeout(150);
  const S0 = await L.shot(page, 'feas17-rest.png', clip); const base = S0.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2);
  const sel = () => page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); return { selectionString: window.getSelection().toString(), selStart: i.selectionStart, selEnd: i.selectionEnd, value: i.value, active: document.activeElement === i }; }, ids.ro);
  const diff = (S) => { const now = S.rect(G.x + 1, G.right - 1, G.y + 2, G.bottom - 2); let worst = 0, changed = 0; for (let k = 0; k < base.length; k++) { const d = L.dE(base[k].c, now[k].c); if (d > 2) changed++; worst = Math.max(worst, d); } return { worstDE: +worst.toFixed(2), changedPixels: changed }; };
  await page.click(inputSel, { clickCount: 3 }); await page.waitForTimeout(150);
  out.tripleClick = { ...(await sel()), pixels: diff(await L.shot(page, 'feas17-triple.png', clip)) };
  await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
  await page.keyboard.press('Meta+A'); await page.waitForTimeout(150);
  out.metaA = { ...(await sel()), pixels: diff(await L.shot(page, 'feas17-metaA.png', clip)) };
  await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.setSelectionRange(0, 0); }, ids.ro);
  await page.mouse.move(G.x + 14, G.y + G.height / 2); await page.mouse.down(); await page.mouse.move(G.x + 60, G.y + G.height / 2, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(150);
  out.drag = { ...(await sel()), pixels: diff(await L.shot(page, 'feas17-drag.png', clip)) };
  // programmatic select() (what a copy-helper would do) — recorded, not judged
  out.programmaticSelect = await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); i.select(); return { selStart: i.selectionStart, selEnd: i.selectionEnd, selectionString: window.getSelection().toString() }; }, ids.ro);
  // dropdown still picks under user-select:none
  await page.evaluate(() => document.activeElement && document.activeElement.blur()); await page.mouse.move(2, 2);
  await page.click('#' + ids.ro + ' .z-combobox-button'); await L.settle(page);
  li = await page.evaluate(id => document.getElementById(id + '-pp').querySelectorAll('.z-comboitem')[1].getBoundingClientRect().toJSON(), ids.ro);
  await page.mouse.click(li.x + li.width / 2, li.y + li.height / 2); await L.settle(page);
  out.pickAfter = await page.evaluate(id => document.getElementById(id).querySelector('input').value, ids.ro);
  // and the non-readonly input is untouched by the injected rule
  await page.click('#' + ids.rw + ' input'); await page.keyboard.type('xy'); await page.click('#' + ids.rw + ' input', { clickCount: 3 });
  out.rw = await page.evaluate(id => { const i = document.getElementById(id).querySelector('input'); return { value: i.value, selected: i.value.substring(i.selectionStart, i.selectionEnd), userSelect: getComputedStyle(i).userSelect }; }, ids.rw);
  await ctx.close(); L.save('feas17.json', out); await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
