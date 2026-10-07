// #16 combobox "With description": description (.z-comboitem-inner) colour/size vs tokens, label unchanged,
// pixel ΔE description vs label, protections (hover/selected contrast ≥ 4.5, two lines visible, row height).
// Output: red16.json, red16-*.png
const L = require('./lib.js');
const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
const contrast = (a, b) => { const x = lum(a), y = lum(b); return +(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05))).toFixed(2); };
(async () => {
  const browser = await L.chromium.launch();
  async function run(opts, tag) {
    const { ctx, page } = await L.open(browser, 'combobox.zul', opts);
    if (opts.brand) await page.evaluate(b => document.documentElement.setAttribute('data-brand', b), opts.brand);
    const out = { tokens: await page.evaluate(() => { const cs = getComputedStyle(document.documentElement); const g = n => cs.getPropertyValue(n).trim(); return { onSurfaceVariant: g('--zk-color-on-surface-variant'), bodySmallSize: g('--zk-typescale-body-small-size'), onSurface: g('--zk-color-on-surface'), bodyLargeSize: g('--zk-typescale-body-large-size'), bodyMediumSize: g('--zk-typescale-body-medium-size') }; }) };
    // resolve the token colours to rgb via a probe element
    out.tokensRgb = await page.evaluate(() => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const rgba = s => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = s; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], +(d[3] / 255).toFixed(3)]; }; const d = document.createElement('div'); document.body.appendChild(d); const r = {}; for (const t of ['--zk-color-on-surface-variant', '--zk-color-on-surface']) { d.style.color = `var(${t})`; r[t] = { computed: getComputedStyle(d).color, rgba: rgba(getComputedStyle(d).color) }; } d.remove(); return r; });
    const uuid = await page.evaluate(() => [...document.querySelectorAll('.z-combobox')].map(n => zk.$(n)).find(w => w.firstChild && w.firstChild._description).uuid);
    out.uuid = uuid;
    const read = () => page.evaluate(uuid => { const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const rgba = s => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = s; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], +(d[3] / 255).toFixed(3)]; };
      const pp = document.getElementById(uuid + '-pp'); const ppcs = getComputedStyle(pp);
      return { popup: pp.getBoundingClientRect().toJSON(), popupBg: ppcs.backgroundColor, popupBgRgba: rgba(ppcs.backgroundColor), items: [...pp.querySelectorAll('.z-comboitem')].map(li => { const text = li.querySelector('.z-comboitem-text'); const desc = li.querySelector('.z-comboitem-inner'); const tn = [...text.childNodes].find(n => n.nodeType === 3); const r = document.createRange(); r.selectNodeContents(tn); const lr = r.getBoundingClientRect().toJSON(); const dr = document.createRange(); dr.selectNodeContents(desc); const drr = dr.getBoundingClientRect().toJSON();
        const tcs = getComputedStyle(text), dcs = getComputedStyle(desc), lcs = getComputedStyle(li);
        return { cls: li.className, rect: li.getBoundingClientRect().toJSON(), bg: lcs.backgroundColor, bgRgba: rgba(lcs.backgroundColor), descCls: desc.className, descTag: desc.tagName, descParent: desc.parentElement.className, prevSibling: desc.previousSibling && desc.previousSibling.nodeName,
          label: { text: tn.textContent, color: tcs.color, rgba: rgba(tcs.color), fontSize: tcs.fontSize, fontWeight: tcs.fontWeight, lineHeight: tcs.lineHeight, rect: lr },
          desc: { text: desc.textContent, color: dcs.color, rgba: rgba(dcs.color), fontSize: dcs.fontSize, fontWeight: dcs.fontWeight, lineHeight: dcs.lineHeight, rect: drr, opacity: dcs.opacity } }; }) }; }, uuid);
    await page.click('#' + uuid + ' .z-combobox-button'); await L.settle(page);
    out.rest = await read();
    const P = out.rest.popup;
    const S = await L.shot(page, `red16-${tag}-rest.png`, { x: P.x - 10, y: P.y - 60, width: P.width + 20, height: P.height + 80 });
    // foreground estimate = darkest (lowest-luminance) pixel inside the text's range box; both over the same popup background
    const darkest = (r) => { const px = S.rect(r.x, r.right, r.y, r.bottom); let m = null; for (const p of px) { const l = lum(p.c); if (!m || l < m.l) m = { l, c: p.c, x: p.x, y: p.y }; } return m; };
    out.pixels = out.rest.items.map(it => { const l = darkest(it.label.rect), d = darkest(it.desc.rect); return { label: l.c, desc: d.c, dE: +L.dE(l.c, d.c).toFixed(2) }; });
    // hover on item 1: description colour vs hovered background
    const it0 = out.rest.items[0].rect;
    await page.mouse.move(it0.x + it0.width / 2, it0.y + it0.height / 2); await page.waitForTimeout(200);
    out.hover = await read();
    await L.shot(page, `red16-${tag}-hover.png`, { x: P.x - 10, y: P.y - 60, width: P.width + 20, height: P.height + 80 });
    // pick item 1 -> reopen -> selected state
    await page.mouse.click(it0.x + it0.width / 2, it0.y + it0.height / 2); await L.settle(page);
    await page.mouse.move(2, 2);
    await page.click('#' + uuid + ' .z-combobox-button'); await L.settle(page);
    out.selected = await read();
    await L.shot(page, `red16-${tag}-selected.png`, { x: P.x - 10, y: P.y - 60, width: P.width + 20, height: P.height + 80 });
    // contrast of the description's computed colour over the composited row background
    const bgOf = (it, popupBgRgba) => { const base = L.over(popupBgRgba); return L.over(it.bgRgba, base); };
    const fgOf = (rgba, bg) => L.over(rgba, bg);
    out.contrast = {};
    for (const st of ['rest', 'hover', 'selected']) out.contrast[st] = out[st].items.map(it => { const bg = bgOf(it, out[st].popupBgRgba); return { cls: it.cls, bg, descFg: fgOf(it.desc.rgba, bg), ratio: contrast(fgOf(it.desc.rgba, bg), bg), labelRatio: contrast(fgOf(it.label.rgba, bg), bg), rowH: it.rect.height, descBottomInsideRow: it.desc.rect.bottom <= it.rect.bottom + 0.5 && it.desc.rect.y >= it.rect.y - 0.5 }; });
    await ctx.close();
    return out;
  }
  const out = { default: await run({}, 'default') };
  out.brandCopper = (({ tokens, tokensRgb, rest }) => ({ tokens, tokensRgb, descColor: rest.items[0].desc.color, labelColor: rest.items[0].label.color }))(await run({ brand: 'copper' }, 'copper'));
  out.forcedColors = (({ tokens, tokensRgb, rest, pixels }) => ({ tokens, tokensRgb, descColor: rest.items[0].desc.color, labelColor: rest.items[0].label.color, pixels }))(await run({ forcedColors: 'active' }, 'forced'));
  L.save('red16.json', out);
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
