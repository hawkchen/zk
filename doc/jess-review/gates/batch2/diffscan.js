// Classify differing pixels between expected and actual screenshots.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');
const fs = require('fs'), path = require('path');
const root = process.argv[2];

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const res = {};
  for (const d of fs.readdirSync(root)) {
    const dir = path.join(root, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    const files = fs.readdirSync(dir);
    const exp = files.find(f => f.endsWith('-expected.png')), act = files.find(f => f.endsWith('-actual.png'));
    if (!exp || !act) { res[d] = { note: 'no expected/actual', files }; continue; }
    const e64 = fs.readFileSync(path.join(dir, exp)).toString('base64');
    const a64 = fs.readFileSync(path.join(dir, act)).toString('base64');
    res[d] = await page.evaluate(async ([e64, a64]) => {
      const load = async b => { const i = new Image(); i.src = 'data:image/png;base64,' + b; await i.decode();
        const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0);
        return { w: i.width, h: i.height, d: x.getImageData(0, 0, i.width, i.height).data }; };
      const E = await load(e64), A = await load(a64);
      if (E.w !== A.w || E.h !== A.h) return { sizeMismatch: [E.w, E.h, A.w, A.h] };
      const near = (p, q, t) => Math.abs(p[0] - q[0]) <= t && Math.abs(p[1] - q[1]) <= t && Math.abs(p[2] - q[2]) <= t;
      const grey = p => Math.max(p[0], p[1], p[2]) - Math.min(p[0], p[1], p[2]) <= 8;
      const OLD = [[213, 230, 255], [197, 213, 241]], NEW = [[200, 213, 234], [186, 198, 219]];
      // blue-tinted: b noticeably > r (selected bg family or text blended over it)
      const tinted = p => p[2] - p[0] >= 10;
      const cls = { sel: 0, aaGrey: 0, other: 0 }; const otherPx = []; const pairs = new Map();
      let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
      for (let y = 0; y < E.h; y++) for (let x = 0; x < E.w; x++) {
        const i = (y * E.w + x) * 4;
        const p = [E.d[i], E.d[i + 1], E.d[i + 2]], q = [A.d[i], A.d[i + 1], A.d[i + 2]];
        if (Math.max(Math.abs(p[0] - q[0]), Math.abs(p[1] - q[1]), Math.abs(p[2] - q[2])) <= 3) continue;
        minx = Math.min(minx, x); miny = Math.min(miny, y); maxx = Math.max(maxx, x); maxy = Math.max(maxy, y);
        if (OLD.some(o => near(p, o, 4)) || NEW.some(o => near(q, o, 4)) || (tinted(p) && tinted(q))) cls.sel++;
        else if (grey(p) && grey(q)) cls.aaGrey++;
        else { cls.other++; otherPx.push([x, y]); const k = p.join(',') + '>' + q.join(','); pairs.set(k, (pairs.get(k) || 0) + 1); }
      }
      let ob = null;
      if (otherPx.length) { const xs = otherPx.map(p => p[0]), ys = otherPx.map(p => p[1]); ob = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
      return { size: [E.w, E.h], diffBox: [minx, miny, maxx, maxy], cls, otherBox: ob,
        topOtherPairs: [...pairs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6) };
    }, [e64, a64]);
  }
  console.log(JSON.stringify(res, null, 1));
  await browser.close();
})();
