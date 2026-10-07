// Final gate 4: cluster the differing pixels between each failing Playwright baseline (expected) and the actual
// screenshot, then crop every cluster (expected | actual) for review. Pairs are discovered under the scratchpad
// Playwright output dir passed as argv[2] (…/<project>/<test-dir>/<name>-expected.png + <name>-actual.png).
const { chromium } = require('./final-lib'); const fs = require('fs'); const path = require('path');
const TR = process.argv[2];
function findPairs(dir, out = []) { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) findPairs(p, out);
  else if (f.endsWith('-expected.png')) { const a = p.replace(/-expected\.png$/, '-actual.png'); if (fs.existsSync(a)) out.push({ e: p, a, name: path.relative(TR, dir).split(path.sep)[0] + ':' + f.replace(/-expected\.png$/, '') }); } } return out; }
(async () => { const b = await chromium.launch(); const page = await b.newPage(); const out = {};
  for (const c of findPairs(TR)) { const name = c.name;
    const e = fs.readFileSync(c.e).toString('base64'), a = fs.readFileSync(c.a).toString('base64');
    const r = await page.evaluate(async ([e, a]) => {
      const load = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); return { w: i.width, h: i.height, d: x.getImageData(0, 0, i.width, i.height).data }; };
      const E = await load(e), A = await load(a); const W = Math.min(E.w, A.w), H = Math.min(E.h, A.h);
      const C = 8, cw = Math.ceil(W / C), ch = Math.ceil(H / C); const cell = new Uint8Array(cw * ch); let n = 0, maxd = 0, nSmall = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * E.w + x) * 4, j = (y * A.w + x) * 4; const d = Math.max(Math.abs(E.d[i] - A.d[j]), Math.abs(E.d[i + 1] - A.d[j + 1]), Math.abs(E.d[i + 2] - A.d[j + 2])); if (d > 0 && d <= 8) nSmall++; if (d > 8) { n++; maxd = Math.max(maxd, d); cell[Math.floor(y / C) * cw + Math.floor(x / C)] = 1; } }
      const seen = new Uint8Array(cw * ch); const comps = [];
      for (let k = 0; k < cell.length; k++) if (cell[k] && !seen[k]) { const st = [k]; seen[k] = 1; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, cnt = 0;
        while (st.length) { const q = st.pop(); const qx = q % cw, qy = Math.floor(q / cw); cnt++; x0 = Math.min(x0, qx); y0 = Math.min(y0, qy); x1 = Math.max(x1, qx); y1 = Math.max(y1, qy);
          for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const nx = qx + dx, ny = qy + dy; if (nx < 0 || ny < 0 || nx >= cw || ny >= ch) continue; const nk = ny * cw + nx; if (cell[nk] && !seen[nk]) { seen[nk] = 1; st.push(nk); } } }
        comps.push({ x: x0 * C, y: y0 * C, w: (x1 - x0 + 1) * C, h: (y1 - y0 + 1) * C, cells: cnt }); }
      return { size: [E.w, E.h, A.w, A.h], n, nSmall, maxd, comps };
    }, [e, a]);
    out[name] = r;
    let k = 0; for (const cc of r.comps) { const pad = 24; const cl = { x: Math.max(0, cc.x - pad), y: Math.max(0, cc.y - pad), w: cc.w + 2 * pad, h: cc.h + 2 * pad };
      await page.setContent(`<body style="margin:0;background:#888;display:flex;gap:6px"><div style="width:${cl.w}px;height:${cl.h}px;background:url(data:image/png;base64,${e}) -${cl.x}px -${cl.y}px"></div><div style="width:${cl.w}px;height:${cl.h}px;background:url(data:image/png;base64,${a}) -${cl.x}px -${cl.y}px"></div></body>`);
      await page.setViewportSize({ width: Math.min(2 * cl.w + 6, 3000), height: Math.min(cl.h, 3000) }); await page.screenshot({ path: path.join(__dirname, `diff-${name.replace(/[^a-z0-9-]/gi, '_')}-${k++}.png`) }); }
  }
  fs.writeFileSync(path.join(__dirname, 'final-classify.json'), JSON.stringify(out, null, 1));
  for (const [k, v] of Object.entries(out)) console.log(k, 'size', v.size.join('x'), 'px>8', v.n, 'px1-8', v.nSmall, 'max', v.maxd, 'comps', JSON.stringify(v.comps));
  await b.close(); })();
