// #47 follow-up: with the E2 injection (.z-fisheye absolute + .z-fisheyebar relative) on a FRESH page, measure horizontal first,
// then vertical, then back to horizontal, printing the inline left/top each time (checks whether the orient toggle-back leaves stale inline values).
// Also the same sequence WITHOUT injection (inline values only). Output: red47b.json + red47b-*.png
const L = require('./lib');
const E2 = '.z-fisheye{position:absolute!important}.z-fisheyebar{position:relative!important}';
async function dump(page) {
  return page.evaluate(() => { const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; }; const bar = document.querySelector('.z-fisheyebar'); const br = R(bar);
    return { orient: bar.getAttribute('aria-orientation'), bar: br, barInline: bar.style.width + ' ' + bar.style.height, items: [...bar.querySelectorAll('.z-fisheye')].map(f => { const r = R(f); const img = R(f.querySelector('.z-fisheye-image')); return { rect: r, inline: [f.style.left, f.style.top, f.style.width, f.style.height].join(' '), inside: r.l >= br.l - 0.5 && r.l + r.w <= br.l + br.w + 0.5 && r.t >= br.t - 0.5 && r.t + r.h <= br.t + br.h + 0.5, img, expected: { l: br.l + parseFloat(f.style.left), t: br.t + parseFloat(f.style.top), w: parseFloat(f.style.width), h: parseFloat(f.style.height) } }; }) }; });
}
const diff = d => d.items.map(i => [+(i.rect.l - i.expected.l).toFixed(1), +(i.rect.t - i.expected.t).toFixed(1), +(i.rect.w - i.expected.w).toFixed(1), +(i.rect.h - i.expected.h).toFixed(1)]);
async function toggle(page) { await page.getByText('Vertical orient').click(); await L.settle(page); await page.mouse.move(2, 2); await page.waitForTimeout(400); }
async function mag(page, d) { const it = d.items[2]; const x = it.expected.l + it.expected.w / 2, y = it.expected.t + it.expected.h / 2; await page.mouse.move(x - 30, y - 30); await page.waitForTimeout(150); await page.mouse.move(x, y); await page.waitForTimeout(500); const m = await dump(page); await page.mouse.move(2, 2); await page.waitForTimeout(300); return m; }
(async () => {
  const browser = await L.chromium.launch(); const out = {};
  for (const inject of [false, true]) {
    const { ctx, page } = await L.open(browser, 'fisheyebar.zul');
    if (inject) { await page.addStyleTag({ content: E2 }); await page.waitForTimeout(250); }
    const key = inject ? 'E2' : 'base'; out[key] = {};
    out[key].h1 = await dump(page); out[key].h1mag = await mag(page, out[key].h1);
    await L.shot(page, `red47b-${key}-h1.png`, { x: 0, y: out[key].h1.bar.t - 120, width: 640, height: out[key].h1.bar.h + 240 });
    await toggle(page); out[key].v = await dump(page); out[key].vmag = await mag(page, out[key].v);
    await L.shot(page, `red47b-${key}-v.png`, { x: 0, y: out[key].v.bar.t - 40, width: 400, height: out[key].v.bar.h + 80 });
    await toggle(page); out[key].h2 = await dump(page);
    await L.shot(page, `red47b-${key}-h2.png`, { x: 0, y: out[key].h2.bar.t - 120, width: 640, height: out[key].h2.bar.h + 240 });
    await ctx.close();
  }
  L.save('red47b.json', out); await browser.close();
  for (const [k, v] of Object.entries(out)) for (const [s, d] of Object.entries(v)) console.log(k, s, d.orient, 'bar', JSON.stringify(d.bar), '| inline', JSON.stringify(d.items.map(i => i.inline)), '| rect', JSON.stringify(d.items.map(i => [i.rect.l, i.rect.t, i.rect.w, i.rect.h])), '| rect-expected', JSON.stringify(diff(d)), '| inside', d.items.map(i => i.inside ? 1 : 0).join(''));
})().catch(e => { console.error(e); process.exit(1); });
