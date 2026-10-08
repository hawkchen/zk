// #47 cause-finding only: walk the CSSOM recursively (layers / media) for rules targeting .z-fisheyebar / .z-fisheye / .z-fisheye-image. Output: probe-fisheye-rules.json
const L = require('./lib');
(async () => {
  const browser = await L.chromium.launch();
  const { ctx, page } = await L.open(browser, 'fisheyebar.zul');
  const out = await page.evaluate(() => {
    const want = ['z-fisheyebar', 'z-fisheye']; const res = [];
    const walk = (rules, sheet, where) => { for (const r of rules) { if (r.cssRules && r.cssRules.length && !(r.selectorText)) { walk(r.cssRules, sheet, where + '>' + (r.constructor.name + (r.name ? ':' + r.name : '') + (r.conditionText ? '(' + r.conditionText + ')' : ''))); continue; } if (r.selectorText && want.some(w => r.selectorText.includes(w))) res.push({ sheet, where, sel: r.selectorText, css: r.style.cssText.slice(0, 400) }); if (r.cssRules && r.selectorText) walk(r.cssRules, sheet, where + '>' + r.selectorText); } };
    for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch (e) { res.push({ sheet: ss.href, error: String(e) }); continue; } walk(rules, (ss.href || 'inline').replace(/;jsessionid.*$/, '').split('/').slice(-3).join('/'), ''); }
    const bar = document.querySelector('.z-fisheyebar'), it = document.querySelector('.z-fisheye'), img = document.querySelector('.z-fisheye-image');
    const cs = e => { const s = getComputedStyle(e); return { position: s.position, display: s.display, flexDirection: s.flexDirection, alignItems: s.alignItems, justifyContent: s.justifyContent, gap: s.gap, padding: s.padding, width: s.width, height: s.height, flex: s.flex }; };
    return { rules: res, computed: { bar: cs(bar), item: cs(it), img: cs(img) } };
  });
  L.save('probe-fisheye-rules.json', out);
  await ctx.close(); await browser.close();
  for (const r of out.rules) console.log(r.sheet, r.where, '|', r.sel, '|', r.css);
  console.log(JSON.stringify(out.computed));
})().catch(e => { console.error(e); process.exit(1); });
