// #12 chosenbox chips: font-style / font-weight of every .z-chosenbox-item-content (rest, hover, focus),
// source of any italic, protections (size, chip height, delete button hit test). Output: red12.json, red12-*.png
const L = require('./lib.js');
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'chosenbox.zul');
  const out = { tokens: await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); const g = n => cs.getPropertyValue(n).trim(); return {
    labelLargeSize: g('--zk-typescale-label-large-size'), labelLargeWeight: g('--zk-typescale-label-large-weight'), bodyMediumWeight: g('--zk-typescale-body-medium-weight'), bodyLargeSize: g('--zk-typescale-body-large-size') }; }) };

  const readChips = () => page.evaluate(() => [...document.querySelectorAll('.z-chosenbox-item-content')].map(c => {
    const cs = getComputedStyle(c); const chip = c.closest('.z-chosenbox-item'); const root = c.closest('.z-chosenbox');
    return { text: c.textContent, root: root.className, fontStyle: cs.fontStyle, fontWeight: cs.fontWeight, fontSize: cs.fontSize, lineHeight: cs.lineHeight, fontFamily: cs.fontFamily.slice(0, 60),
      chipH: chip.getBoundingClientRect().height, chipRect: chip.getBoundingClientRect().toJSON(), inlineStyle: c.getAttribute('style'), chipInline: chip.getAttribute('style') };
  }));
  out.rest = await readChips();

  // where does font-style come from? walk ancestors; for the first element whose own computed font-style is italic,
  // list every stylesheet rule that matches it and declares font-style (plus inline style)
  out.italicSource = await page.evaluate(() => {
    const res = [];
    for (const c of document.querySelectorAll('.z-chosenbox-item-content')) {
      let el = c, chain = [];
      while (el && el !== document.documentElement) { chain.push({ tag: el.tagName, cls: el.className, fs: getComputedStyle(el).fontStyle }); if (getComputedStyle(el.parentElement).fontStyle !== 'italic') break; el = el.parentElement; }
      const origin = el; // first ancestor (from the chip upward) whose parent is not italic
      const rules = [];
      for (const ss of document.styleSheets) { let list; try { list = ss.cssRules; } catch (e) { continue; }
        const walk = (rs) => { for (const r of rs) { if (r.cssRules && r.cssRules.length && !(r.selectorText)) { walk(r.cssRules); continue; }
          if (r.selectorText && r.style && r.style.fontStyle) { try { if (origin.matches(r.selectorText)) rules.push({ sheet: (ss.href || 'inline').replace(/^.*\/(web|zkau)\//, ''), selector: r.selectorText, fontStyle: r.style.fontStyle, cssText: r.cssText.slice(0, 300) }); } catch (e) {} } } };
        walk(list); }
      res.push({ chip: c.textContent, originTag: origin.tagName, originCls: origin.className, originInline: origin.getAttribute('style'), chain, rules });
    }
    return res;
  });
  // the same rule lookup for font-weight (which rule sets the weight on the chip content)
  out.weightRules = await page.evaluate(() => { const c = document.querySelector('.z-chosenbox-item-content'); const rules = [];
    for (const ss of document.styleSheets) { let list; try { list = ss.cssRules; } catch (e) { continue; }
      for (const r of list) { if (r.selectorText && r.style && (r.style.fontWeight || r.style.font)) { try { if (c.matches(r.selectorText)) rules.push({ sheet: (ss.href || 'inline').replace(/^.*\/(web|zkau)\//, ''), selector: r.selectorText, fontWeight: r.style.fontWeight, font: r.style.font }); } catch (e) {} } } }
    return rules; });

  const first = await page.evaluate(() => document.querySelector('.z-chosenbox'));
  const firstId = await page.evaluate(() => document.querySelector('.z-chosenbox').id);
  const chipBox = await page.evaluate(id => document.getElementById(id).getBoundingClientRect().toJSON(), firstId);
  await L.shot(page, 'red12-rest.png', { x: chipBox.x - 10, y: chipBox.y - 10, width: chipBox.width + 20, height: chipBox.height + 20 });

  // hover: pointer on the first chip's text
  const chip0 = out.rest[0].chipRect;
  await page.mouse.move(chip0.x + 12, chip0.y + chip0.height / 2); await page.waitForTimeout(200);
  out.hover = await readChips();
  out.hoverClasses = await page.evaluate(() => document.querySelector('.z-chosenbox-item').className);
  await L.shot(page, 'red12-hover.png', { x: chipBox.x - 10, y: chipBox.y - 10, width: chipBox.width + 20, height: chipBox.height + 20 });
  await page.mouse.move(2, 2); await page.waitForTimeout(200);

  // focus: click the input of the first (enabled) chosenbox
  await page.click('#' + firstId + ' input'); await L.settle(page);
  out.focus = await readChips();
  out.focusClasses = await page.evaluate(() => ({ root: document.querySelector('.z-chosenbox').className, active: document.activeElement.className }));
  await L.shot(page, 'red12-focus.png', { x: chipBox.x - 10, y: chipBox.y - 10, width: chipBox.width + 20, height: chipBox.height + 20 });

  // protection: delete button hit test (first chosenbox, every chip) — point at the delete button centre
  out.deleteHit = await page.evaluate(id => [...document.getElementById(id).querySelectorAll('.z-chosenbox-delete')].map(b => { const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
    return { rect: r.toJSON(), hit: e ? e.tagName + '.' + e.className : null, isButtonOrIcon: !!(e && (e === b || b.contains(e))) }; }), firstId);
  // and actually click the first delete: chip count drops by one
  const before = await page.evaluate(id => document.getElementById(id).querySelectorAll('.z-chosenbox-item').length, firstId);
  const d0 = out.deleteHit[0].rect; await page.mouse.click(d0.x + d0.width / 2, d0.y + d0.height / 2); await L.settle(page);
  out.deleteClick = { before, after: await page.evaluate(id => document.getElementById(id).querySelectorAll('.z-chosenbox-item').length, firstId) };

  // one-off records
  await page.evaluate(() => document.documentElement.setAttribute('data-brand', 'copper')); await page.waitForTimeout(100);
  out.brandCopper = (await readChips()).map(c => ({ text: c.text, fontStyle: c.fontStyle, fontWeight: c.fontWeight, fontSize: c.fontSize }));
  await page.evaluate(() => document.documentElement.removeAttribute('data-brand'));
  await ctx.close();
  const fc = await L.open(browser, 'chosenbox.zul', { forcedColors: 'active' });
  out.forcedColors = (await fc.page.evaluate(() => [...document.querySelectorAll('.z-chosenbox-item-content')].map(c => { const cs = getComputedStyle(c); return { text: c.textContent, fontStyle: cs.fontStyle, fontWeight: cs.fontWeight, color: cs.color, bg: getComputedStyle(c.parentElement).backgroundColor }; })));
  await fc.ctx.close();
  L.save('red12.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
