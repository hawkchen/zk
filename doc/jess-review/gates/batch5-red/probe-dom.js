// DOM-shape probe (read-only): what elements exist on the three preview pages. Output: probe-dom.json
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const out = {};
  const html = (page, sel, n = 1) => page.evaluate(([sel, n]) => [...document.querySelectorAll(sel)].slice(0, n).map(e => e.outerHTML), [sel, n]);
  // chosenbox
  { const { ctx, page } = await L.open(browser, 'chosenbox.zul');
    out.chosenbox = { widgets: await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox')].map(n => ({ id: n.id, cls: n.className, creatable: !!zk.$(n)._creatable, items: [...n.querySelectorAll('.z-chosenbox-item-content')].map(i => i.textContent) }))),
      firstWidgetHtml: (await html(page, '.z-chosenbox'))[0] };
    // creatable: type a non-existent word in the 2nd creatable (createMessage + noResultsText)
    const cre = await page.evaluate(() => { const ws = [...document.querySelectorAll('.z-chosenbox')].map(n => zk.$(n)).filter(w => w._creatable); return ws.map(w => w.uuid); });
    out.chosenbox.creatableUuids = cre;
    const u = cre[cre.length - 1];
    await page.click('#' + u + ' input');
    await page.keyboard.type('ffff');
    await L.settle(page);
    out.chosenbox.popupHtml = await page.evaluate(() => [...document.querySelectorAll('.z-chosenbox-popup')].map(p => ({ display: getComputedStyle(p).display, html: p.outerHTML })));
    await page.screenshot({ path: L.OUT + '/probe-chosenbox-creatable.png', clip: { x: 0, y: 0, width: 700, height: 700 } });
    await ctx.close(); }
  // cascader
  { const { ctx, page } = await L.open(browser, 'cascader.zul');
    out.cascader = { widgets: await page.evaluate(() => [...document.querySelectorAll('.z-cascader')].map(n => ({ id: n.id, cls: n.className }))), firstWidgetHtml: (await html(page, '.z-cascader'))[0] };
    const u = out.cascader.widgets[0].id;
    L.save('probe-dom.json', out);
    const btn = await page.evaluate(u => { const n = document.getElementById(u); return [...n.querySelectorAll('*')].map(e => e.tagName + '.' + e.className).join(' | '); }, u); out.cascader.tree = btn;
    await page.click('#' + u, { position: { x: 180, y: 20 } }); await L.settle(page);
    out.cascader.popupStyle = await page.evaluate(u => { const p = document.getElementById(u + '-pp'); const cs = getComputedStyle(p); return { display: cs.display, position: cs.position, width: cs.width, inline: p.getAttribute('style'), parent: p.parentElement.tagName + '#' + p.parentElement.id, rect: p.getBoundingClientRect().toJSON() }; }, u);
    out.cascader.popupHtml = (await html(page, '.z-cascader-popup, [class*="z-cascader-popup"]', 3));
    out.cascader.popupClasses = await page.evaluate(() => [...document.querySelectorAll('[class*="z-cascader"]')].map(e => e.className).filter((v, i, a) => a.indexOf(v) === i));
    await page.screenshot({ path: L.OUT + '/probe-cascader-open.png', clip: { x: 0, y: 0, width: 700, height: 700 } });
    L.save('probe-dom.json', out); await ctx.close(); }
  // combobox
  { const { ctx, page } = await L.open(browser, 'combobox.zul');
    out.combobox = { widgets: await page.evaluate(() => [...document.querySelectorAll('.z-combobox')].map(n => ({ id: n.id, cls: n.className, readonly: n.querySelector('input').readOnly, items: zk.$(n).nChildren }))) };
    const desc = await page.evaluate(() => { const w = [...document.querySelectorAll('.z-combobox')].map(n => zk.$(n)).find(w => w.firstChild && w.firstChild._description); return w ? w.uuid : null; });
    out.combobox.descUuid = desc;
    await page.click('#' + desc + ' .z-combobox-button'); await L.settle(page);
    out.combobox.descPopupHtml = await page.evaluate(() => [...document.querySelectorAll('.z-combobox-popup')].filter(p => getComputedStyle(p).display !== 'none').map(p => p.outerHTML));
    out.combobox.readonlyHtml = await page.evaluate(() => { const n = [...document.querySelectorAll('.z-combobox')].find(n => n.querySelector('input').readOnly); return n.outerHTML; });
    await page.screenshot({ path: L.OUT + '/probe-combobox-desc.png', clip: { x: 0, y: 0, width: 900, height: 800 } });
    await ctx.close(); }
  L.save('probe-dom.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
