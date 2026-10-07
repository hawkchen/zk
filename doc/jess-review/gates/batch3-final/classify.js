// cluster differing pixels between expected baseline and actual, crop each cluster (expected | actual) for review
const { chromium } = require('./lib'); const fs = require('fs');
const TR = '/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/4c215591-1279-4a49-b48a-57bb8d64d915/scratchpad/';
const CASES = [['tr-chromium/screenshot-grid-gallery-chromium/grid-gallery', 'grid-gallery'], ['tr-chromium/screenshot-listbox-gallery-chromium/listbox-gallery', 'listbox-gallery'], ['tr-chromium/screenshot-tree-gallery-chromium/tree-gallery', 'tree-gallery'], ['tr-tablet/tablet-tablet-grid-gallery-tablet/grid-tablet', 'grid-tablet'], ['tr-tablet/tablet-tablet-paging-gallery-tablet/paging-tablet', 'paging-tablet']];
(async () => { const b = await chromium.launch(); const page = await b.newPage(); const out = {};
  for (const [p, name] of CASES) {
    const e = fs.readFileSync(TR + p + '-expected.png').toString('base64'), a = fs.readFileSync(TR + p + '-actual.png').toString('base64');
    const r = await page.evaluate(async ([e, a]) => {
      const load = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: i.width, h: i.height, d: x.getImageData(0, 0, i.width, i.height).data }; };
      const E = await load(e), A = await load(a); const W = Math.min(E.w, A.w), H = Math.min(E.h, A.h);
      const C = 8, cw = Math.ceil(W / C), ch = Math.ceil(H / C); const cell = new Uint8Array(cw * ch); let n = 0, maxd = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * E.w + x) * 4, j = (y * A.w + x) * 4; const d = Math.max(Math.abs(E.d[i] - A.d[j]), Math.abs(E.d[i + 1] - A.d[j + 1]), Math.abs(E.d[i + 2] - A.d[j + 2])); if (d > 8) { n++; maxd = Math.max(maxd, d); cell[Math.floor(y / C) * cw + Math.floor(x / C)] = 1; } }
      // connected components over cells (8-neighbour, gap 1)
      const seen = new Uint8Array(cw * ch); const comps = [];
      for (let k = 0; k < cell.length; k++) if (cell[k] && !seen[k]) { const st = [k]; seen[k] = 1; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, cnt = 0;
        while (st.length) { const q = st.pop(); const qx = q % cw, qy = Math.floor(q / cw); cnt++; x0 = Math.min(x0, qx); y0 = Math.min(y0, qy); x1 = Math.max(x1, qx); y1 = Math.max(y1, qy);
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = qx + dx, ny = qy + dy; if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue; const nk = ny * cw + nx; if (cell[nk] && !seen[nk]) { seen[nk] = 1; st.push(nk); } } }
        comps.push({ x: x0 * C, y: y0 * C, w: (x1 - x0 + 1) * C, h: (y1 - y0 + 1) * C, cells: cnt }); }
      return { size: [E.w, E.h, A.w, A.h], n, maxd, comps };
    }, [e, a]);
    out[name] = r;
    // crops: expected | actual, padded
    let k = 0; for (const c of r.comps) { const pad = 24; const cl = { x: Math.max(0, c.x - pad), y: Math.max(0, c.y - pad), w: c.w + 2 * pad, h: c.h + 2 * pad };
      await page.setContent(`<body style="margin:0;background:#888;display:flex;gap:6px"><div style="width:${cl.w}px;height:${cl.h}px;background:url(data:image/png;base64,${e}) -${cl.x}px -${cl.y}px"></div><div style="width:${cl.w}px;height:${cl.h}px;background:url(data:image/png;base64,${a}) -${cl.x}px -${cl.y}px"></div></body>`);
      await page.setViewportSize({ width: Math.min(2 * cl.w + 6, 3000), height: Math.min(cl.h, 3000) }); await page.screenshot({ path: `diff-${name}-${k++}.png` }); }
  }
  fs.writeFileSync('classify.json', JSON.stringify(out, null, 1));
  for (const [k, v] of Object.entries(out)) console.log(k, 'size', v.size.join('x'), 'px>8', v.n, 'max', v.maxd, 'comps', JSON.stringify(v.comps));
  await b.close(); })();
