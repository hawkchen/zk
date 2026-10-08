// #27 rating: cursor on readonly / disabled ratings (horizontal + vertical) must be default/auto. Cursor proxy = computed cursor of elementFromPoint.
// Protection: interactive star centre = pointer; hover scale + colour; readonly/disabled no scale/colour change; click changes the rating. Output: red27.json + red27-*.png.
const L = require('./lib');
const mean = px => { const n = px.length; const s = [0, 0, 0]; for (const p of px) { s[0] += p.c[0]; s[1] += p.c[1]; s[2] += p.c[2]; } return s.map(v => +(v / n).toFixed(1)); };

async function ratings(page) {
  return page.evaluate(() => {
    const R = e => { const r = e.getBoundingClientRect(); return { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width, h: r.height }; };
    return [...document.querySelectorAll('.z-rating')].map((n, i) => { const w = zk.$(n); return { i, cls: n.className, vertical: n.classList.contains('z-rating-vertical'), disabled: !!w._disabled, readonly: !!w._readonly, rating: w._rating, root: R(n), stars: [...n.querySelectorAll('i')].map(s => R(s)) }; });
  });
}
async function cursorAt(page, x, y) {
  return page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return { cursor: e ? getComputedStyle(e).cursor : null, el: e ? e.tagName + '.' + e.className.split(' ').slice(0, 2).join('.') : null }; }, [x, y]);
}
async function starStyle(page, ri, si) {
  return page.evaluate(([ri, si]) => { const s = document.querySelectorAll('.z-rating')[ri].querySelectorAll('i')[si]; const c = getComputedStyle(s); return { transform: c.transform, color: c.color, cls: s.className }; }, [ri, si]);
}

(async () => {
  const browser = await L.chromium.launch();
  const out = { note: 'cursor = computed cursor of document.elementFromPoint (plan rule). Points: every star centre, every gap midpoint, root inset corners (+1,+1) and root centre.', ratings: [] };
  const { ctx, page } = await L.open(browser, 'rating.zul');
  const list = await ratings(page);
  for (const r of list) {
    await page.evaluate(y => window.scrollTo(0, y), Math.max(0, r.root.t - 150)); await page.waitForTimeout(100);
    const rr = (await ratings(page))[r.i];
    const pts = [];
    rr.stars.forEach((s, i) => pts.push({ kind: 'star' + (i + 1), x: (s.l + s.r) / 2, y: (s.t + s.b) / 2 }));
    for (let i = 0; i < rr.stars.length - 1; i++) { const a = rr.stars[i], b = rr.stars[i + 1]; pts.push(rr.vertical ? { kind: 'gap' + (i + 1), x: (a.l + a.r) / 2, y: (a.b + b.t) / 2 } : { kind: 'gap' + (i + 1), x: (a.r + b.l) / 2, y: (a.t + a.b) / 2 }); }
    pts.push({ kind: 'rootTL+1', x: rr.root.l + 1, y: rr.root.t + 1 }, { kind: 'rootBR-1', x: rr.root.r - 1, y: rr.root.b - 1 }, { kind: 'rootCentre', x: (rr.root.l + rr.root.r) / 2, y: (rr.root.t + rr.root.b) / 2 });
    for (const p of pts) Object.assign(p, await cursorAt(page, p.x, p.y));
    out.ratings.push({ i: r.i, cls: r.cls, vertical: r.vertical, disabled: r.disabled, readonly: r.readonly, rating: r.rating, root: rr.root, points: pts, state: r.disabled ? 'disabled' : r.readonly ? 'readonly' : 'interactive' });
  }
  await ctx.close();
  // hover / click protections on: interactive #0, disabled #1, readonly #2 (horizontal) and vertical #8/#9/#10
  out.hover = {};
  for (const ri of [0, 1, 2, 8, 9, 10]) {
    const { ctx, page } = await L.open(browser, 'rating.zul');
    const r = (await ratings(page))[ri];
    await page.evaluate(y => window.scrollTo(0, y), Math.max(0, r.root.t - 150)); await page.waitForTimeout(100);
    const rr = (await ratings(page))[ri];
    const clip = { x: rr.root.l - 10, y: rr.root.t - 10, width: rr.root.w + 20, height: rr.root.h + 20 };
    const S0 = await L.shot(page, `red27-r${ri}-rest.png`, clip);
    const st0 = [0, 3].map(si => null); const styles0 = []; for (const si of [0, 3]) styles0.push(await starStyle(page, ri, si));
    const s4 = rr.stars[3]; // hover the 4th star (unselected in all 3-star ratings)
    await page.mouse.move((s4.l + s4.r) / 2, (s4.t + s4.b) / 2); await page.waitForTimeout(250);
    const S1 = await L.shot(page, `red27-r${ri}-hover4.png`, clip);
    const styles1 = []; for (const si of [0, 3]) styles1.push(await starStyle(page, ri, si));
    const starDE = rr.stars.map(s => { const a = mean(S0.rect(s.l, s.r - 1, s.t, s.b - 1)), b = mean(S1.rect(s.l, s.r - 1, s.t, s.b - 1)); return +L.dE(a, b).toFixed(2); });
    const ratingBefore = (await ratings(page))[ri].rating;
    await page.mouse.click((s4.l + s4.r) / 2, (s4.t + s4.b) / 2); await L.settle(page);
    const ratingAfter = (await ratings(page))[ri].rating;
    const clsAfter = await page.evaluate(ri => [...document.querySelectorAll('.z-rating')[ri].querySelectorAll('i')].map(i => i.className.includes('selected') ? 1 : 0).join(''), ri);
    out.hover['r' + ri] = { state: r.disabled ? 'disabled' : r.readonly ? 'readonly' : 'interactive', vertical: r.vertical, rest: styles0, hover4: styles1, starDE, click4: { before: ratingBefore, after: ratingAfter, selectedMask: clsAfter } };
    await ctx.close();
  }
  await browser.close();
  L.save('red27.json', out);
  for (const r of out.ratings) console.log('R' + r.i, r.state, r.vertical ? 'V' : 'H', r.points.map(p => p.kind + ':' + p.cursor + '(' + p.el + ')').join(' '));
  for (const [k, v] of Object.entries(out.hover)) console.log(k, v.state, v.vertical ? 'V' : 'H', 'rest', JSON.stringify(v.rest), 'hover4', JSON.stringify(v.hover4), 'starDE', JSON.stringify(v.starDE), 'click', JSON.stringify(v.click4));
})().catch(e => { console.error(e); process.exit(1); });
