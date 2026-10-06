const { launch } = require('./common'); const fs = require('fs');
const o = require('./v52r2.out.json');
(async () => {
  const b = await launch(); const p = await (await b.newContext()).newPage();
  for (const [k, file] of [['top', 'top-selected'], ['bottom', 'bottom-selected'], ['vertical', 'vertical-selected'], ['right', 'right-selected'], ['closableTop', 'closable-top-selected']]) {
    const r = o[k]; const H = r.side === 'top' || r.side === 'bottom';
    const img = await p.evaluate(async (b64) => { const i = new Image(); i.src = 'data:image/png;base64,' + b64; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: i.width, h: i.height, d: Array.from(x.getImageData(0, 0, i.width, i.height).data) }; }, fs.readFileSync(`img/${file}.png`).toString('base64'));
    const G = (x, y) => img.d[(y * img.w + x) * 4 + 1];
    const res = [];
    for (const L of r.lines) {
      const [s, e] = L.run; const at = (q) => H ? G(q, L.perp) : G(L.perp, q);
      const bgL = at(s - 3), bgR = at(e + 3), acc = 111;
      const cl = (v, bg) => Math.max(0, Math.min(1, (bg - v) / (bg - acc)));
      const cov = (e - s + 1) + cl(at(s - 1), bgL) + cl(at(s - 2), bgL) + cl(at(e + 1), bgR) + cl(at(e + 2), bgR);
      res.push(`${L.role || 'line'}:${L.len}→cov≈${cov.toFixed(2)} (bgG ${bgL}/${bgR})`);
    }
    console.log(k, 'textAlong', r.textExtentAlong.toFixed(2), res.join('  '));
  }
  await b.close();
})();
