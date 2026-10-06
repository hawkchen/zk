const { launch, open, idle, cursorAt } = require('./common');
(async () => {
  const b = await launch(); const page = await open(b, '/splitlayout.zul'); const out = [];
  for (const i of [2, 3, 4]) {
    await page.evaluate((i) => document.querySelectorAll('.z-splitlayout')[i].scrollIntoView({ block: 'center' }), i); await idle(page);
    const g = await page.evaluate((i) => { const root = document.querySelectorAll('.z-splitlayout')[i];
      const sp = [...root.querySelectorAll('.z-splitlayout-splitter')].find((s) => s.closest('.z-splitlayout') === root);
      const r = (e) => { const x = e.getBoundingClientRect(); return { x: x.x, y: x.y, w: x.width, h: x.height }; };
      return { sp: r(sp), btn: r(sp.querySelector('.z-splitlayout-splitter-button')), bcls: sp.querySelector('.z-splitlayout-splitter-button').className }; }, i);
    const bx = g.btn.x + g.btn.w / 2, by = g.btn.y + g.btn.h / 2; await page.mouse.move(bx, by); await idle(page);
    const btnC = await cursorAt(page, bx, by);
    const s = g.sp; const [sx, sy] = s.h > s.w ? [s.x + s.w / 2, s.y + s.h / 4] : [s.x + s.w / 4, s.y + s.h / 2];
    await page.mouse.move(sx, sy); await idle(page);
    out.push({ i, bcls: g.bcls, btn: btnC, bar: await cursorAt(page, sx, sy) });
  }
  console.log(JSON.stringify(out, null, 1)); await b.close();
})();
