// #25 guard probe: (1) no `.z-slider-popup` on slider/multislider/rangeslider pages at rest (nothing dragged);
// (2) which tooltip classes multislider / rangeslider use (tooltipVisible widgets at rest, and while a thumb is held),
// with each tooltip's centre offset from its thumb centre, so a mis-applied `.z-slider-popup` rule would show up here.
// Output: probe25-others.json + probe25-others-*.png.
const L = require('./lib');
const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };

async function scan(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: +r.left.toFixed(2), t: +r.top.toFixed(2), r: +r.right.toFixed(2), b: +r.bottom.toFixed(2), w: +r.width.toFixed(2), h: +r.height.toFixed(2) }; };
    const sliderPopup = document.querySelectorAll('.z-slider-popup').length;
    const slidetip = !!document.getElementById('zul_slidetip');
    // every element whose class list mentions tooltip or popup under a slider-family widget
    const cand = [...document.querySelectorAll('[class*="tooltip"],[class*="popup"]')].filter(e => e.closest('.z-multislider,.z-rangeslider,.z-slider'));
    const items = cand.map(e => {
      const cs = getComputedStyle(e); const rect = R(e);
      const widget = e.closest('.z-multislider,.z-rangeslider,.z-slider');
      // nearest thumb: the sliderbutton inside the same widget whose centre is closest horizontally/vertically
      const btns = [...widget.querySelectorAll('.z-sliderbutton,.z-slider-button,.z-multislider-button,.z-rangeslider-button,[class*="-button"]')].filter(b => !b.classList.contains('z-sliderbuttons'));
      let best = null;
      for (const b of btns) { const br = R(b); const d = Math.hypot((br.l + br.r) / 2 - (rect.l + rect.r) / 2, (br.t + br.b) / 2 - (rect.t + rect.b) / 2); if (!best || d < best.d) best = { d, cls: b.className, rect: br }; }
      return { cls: e.className, widget: widget.className, text: e.textContent.trim(), rect, display: cs.display, visibility: cs.visibility, opacity: cs.opacity, transform: cs.transform, position: cs.position,
        thumb: best && { cls: best.cls, rect: best.rect, dx: +(((rect.l + rect.r) - (best.rect.l + best.rect.r)) / 2).toFixed(2), dy: +(((rect.t + rect.b) - (best.rect.t + best.rect.b)) / 2).toFixed(2) } };
    });
    return { sliderPopup, slidetip, n: cand.length, items, classes: [...new Set(cand.map(e => e.className))] };
  });
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'rest = freshly loaded page, pointer parked at (2,2); held = mousedown on the first thumb of the first widget on the page, moved +10px, not released', pages: {} };
  for (const pg of ['slider.zul', 'multislider.zul', 'rangeslider.zul']) {
    const { ctx, page } = await L.open(browser, pg);
    const rest = await scan(page);
    await L.shot(page, `probe25-others-${pg.replace('.zul', '')}-rest.png`);
    // hold a thumb of the first slider-family widget that has a visible tooltip (multislider/rangeslider), or the first slider
    const target = await page.evaluate(() => {
      const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom }; };
      const ws = [...document.querySelectorAll('.z-multislider,.z-rangeslider,.z-slider')];
      const w = ws.find(n => n.querySelector('[class*="tooltip"]')) || ws[0];
      const btn = w.querySelector('.z-sliderbuttons-button,.z-slider-button');
      if (!btn) return null;
      const r = R(btn); return { widget: w.className, btn: btn.className, x: (r.l + r.r) / 2, y: (r.t + r.b) / 2, vertical: w.className.includes('vertical') };
    });
    let held = null;
    if (target) {
      await page.mouse.move(target.x, target.y); await page.mouse.down();
      await page.mouse.move(target.vertical ? target.x : target.x + 10, target.vertical ? target.y + 10 : target.y, { steps: 4 });
      await page.waitForTimeout(150);
      held = await scan(page);
      held.target = target;
      await L.shot(page, `probe25-others-${pg.replace('.zul', '')}-held.png`);
      await page.mouse.up(); await page.waitForTimeout(200);
      held.afterRelease = await scan(page);
    }
    out.pages[pg] = { rest, held };
    await ctx.close();
  }
  await browser.close();
  L.save('probe25-others.json', out);
  for (const [pg, v] of Object.entries(out.pages)) {
    console.log(pg, 'REST  .z-slider-popup count', v.rest.sliderPopup, 'slidetip', v.rest.slidetip, 'tooltip-ish elements', v.rest.n, 'classes', JSON.stringify(v.rest.classes));
    for (const it of v.rest.items) console.log('   rest', JSON.stringify(it.cls), 'text', JSON.stringify(it.text), 'rect', JSON.stringify(it.rect), 'disp', it.display, it.visibility, 'tf', it.transform, 'thumb', it.thumb && (it.thumb.cls + ' dx ' + it.thumb.dx + ' dy ' + it.thumb.dy));
    if (v.held) {
      console.log('  HELD', JSON.stringify(v.held.target), '.z-slider-popup count', v.held.sliderPopup, 'slidetip', v.held.slidetip, 'classes', JSON.stringify(v.held.classes));
      for (const it of v.held.items) console.log('   held', JSON.stringify(it.cls), 'text', JSON.stringify(it.text), 'rect', JSON.stringify(it.rect), 'disp', it.display, it.visibility, 'tf', it.transform, 'thumb', it.thumb && (it.thumb.cls + ' dx ' + it.thumb.dx + ' dy ' + it.thumb.dy));
      console.log('  afterRelease .z-slider-popup', v.held.afterRelease.sliderPopup, 'slidetip', v.held.afterRelease.slidetip);
    }
  }
})().catch(e => { console.error(e); process.exit(1); });
