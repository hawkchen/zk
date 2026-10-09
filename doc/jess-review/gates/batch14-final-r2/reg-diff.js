// Batch 14 FINAL R2 — copy of batch14-final/reg-diff.js; only the Playwright --output root (PW) points at the R2 scratchpad run.
// *-expected.png / *-actual.png pairs, report diff pixels (YIQ thr .2 and any), y-bands and x-range, and write band crops.
// Derived from batch14-red/s6-diff.js (same analyse()).
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs');
const path = require('path');
const { PNG } = require('playwright-core/lib/utilsBundle');
const OUT = path.join(__dirname, 'reg-diff'); fs.mkdirSync(OUT, { recursive: true });
const PW = process.env.PW_DIR || '/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/414792ca-78fd-4570-999b-214d5ada1e79/scratchpad/batch14-r2/pw';

function read(f) { return PNG.sync.read(fs.readFileSync(f)); }
function yiq(r, g, b) { return 0.29889531 * r + 0.58662247 * g + 0.11448223 * b; }
function colorDelta(a, b) { const y1 = yiq(a[0], a[1], a[2]), y2 = yiq(b[0], b[1], b[2]); const i1 = 0.59597799 * a[0] - 0.27417610 * a[1] - 0.32180189 * a[2], i2 = 0.59597799 * b[0] - 0.27417610 * b[1] - 0.32180189 * b[2]; const q1 = 0.21147017 * a[0] - 0.52261711 * a[1] + 0.31114694 * a[2], q2 = 0.21147017 * b[0] - 0.52261711 * b[1] + 0.31114694 * b[2]; const dy = y1 - y2, di = i1 - i2, dq = q1 - q2; return 0.5053 * dy * dy + 0.299 * di * di + 0.1957 * dq * dq; }
function analyse(name, expF, actF, bandGap = 24) {
  const E = read(expF), A = read(actF);
  const w = Math.min(E.width, A.width), h = Math.min(E.height, A.height);
  const maxDelta = 35215 * 0.2 * 0.2;
  const rows = new Array(h).fill(0); let n = 0, nAny = 0, minx = w, maxx = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * E.width + x) * 4, j = (y * A.width + x) * 4; const a = [E.data[i], E.data[i + 1], E.data[i + 2]], b = [A.data[j], A.data[j + 1], A.data[j + 2]]; if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) { nAny++; if (colorDelta(a, b) > maxDelta) { n++; rows[y]++; if (x < minx) minx = x; if (x > maxx) maxx = x; } } }
  const bands = []; let cur = null;
  for (let y = 0; y < h; y++) { if (rows[y]) { if (cur && y - cur.y1 <= bandGap) { cur.y1 = y; cur.n += rows[y]; } else { cur = { y0: y, y1: y, n: rows[y] }; bands.push(cur); } } }
  // per band x-range
  for (const b of bands) { let bx0 = w, bx1 = 0; for (let y = b.y0; y <= b.y1; y++) for (let x = 0; x < w; x++) { const i = (y * E.width + x) * 4, j = (y * A.width + x) * 4; const a = [E.data[i], E.data[i + 1], E.data[i + 2]], bb = [A.data[j], A.data[j + 1], A.data[j + 2]]; if ((a[0] !== bb[0] || a[1] !== bb[1] || a[2] !== bb[2]) && colorDelta(a, bb) > maxDelta) { if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; } } b.x = [bx0, bx1]; }
  const res = { name, expected: { w: E.width, h: E.height }, actual: { w: A.width, h: A.height }, sizeMatch: E.width === A.width && E.height === A.height, diffPixels_thr02: n, ratio_thr02: +(n / (w * h)).toFixed(5), diffPixels_any: nAny, xRange: n ? [minx, maxx] : null, bands, crops: [] };
  bands.slice(0, 12).forEach((b, k) => {
    const y0 = Math.max(0, b.y0 - 16), y1 = Math.min(h - 1, b.y1 + 16); const ch = y1 - y0 + 1;
    const x0 = Math.max(0, b.x[0] - 40), x1 = Math.min(w - 1, b.x[1] + 40); const cw = x1 - x0 + 1;
    const o = new PNG({ width: cw * 3 + 8, height: ch });
    for (let y = 0; y < ch; y++) for (let x = 0; x < o.width; x++) { const k2 = (y * o.width + x) * 4; o.data[k2] = 200; o.data[k2 + 1] = 200; o.data[k2 + 2] = 200; o.data[k2 + 3] = 255; }
    for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
      const i = ((y0 + y) * E.width + x0 + x) * 4, j = ((y0 + y) * A.width + x0 + x) * 4;
      const oe = (y * o.width + x) * 4, oa = (y * o.width + cw + 4 + x) * 4, od = (y * o.width + 2 * cw + 8 + x) * 4;
      o.data[oe] = E.data[i]; o.data[oe + 1] = E.data[i + 1]; o.data[oe + 2] = E.data[i + 2]; o.data[oe + 3] = 255;
      o.data[oa] = A.data[j]; o.data[oa + 1] = A.data[j + 1]; o.data[oa + 2] = A.data[j + 2]; o.data[oa + 3] = 255;
      const a = [E.data[i], E.data[i + 1], E.data[i + 2]], bb = [A.data[j], A.data[j + 1], A.data[j + 2]];
      const d = colorDelta(a, bb) > maxDelta; const same = a[0] === bb[0] && a[1] === bb[1] && a[2] === bb[2];
      const g = Math.round(yiq(a[0], a[1], a[2]) * 0.3 + 178);
      o.data[od] = d ? 255 : same ? g : 255; o.data[od + 1] = d ? 0 : same ? g : 220; o.data[od + 2] = d ? 0 : same ? g : 0; o.data[od + 3] = 255;
    }
    const file = `${name}-band${k}-y${b.y0}-${b.y1}-x${b.x[0]}-${b.x[1]}.png`; fs.writeFileSync(path.join(OUT, file), PNG.sync.write(o)); res.crops.push(file);
  });
  console.log(`${name}: expected ${E.width}x${E.height}, actual ${A.width}x${A.height}; diff(thr .2) ${n} px (${(100 * n / (w * h)).toFixed(3)}%), any-diff ${nAny} px; x ${JSON.stringify(res.xRange)}`);
  console.log(`  bands: ${bands.map(b => `y${b.y0}-${b.y1} x${b.x[0]}-${b.x[1]} (${b.n}px)`).join(', ') || 'none'}`);
  return res;
}
const out = {};
for (const proj of fs.readdirSync(PW).filter(d => d.startsWith('out-'))) {
  const dir = path.join(PW, proj); if (!fs.statSync(dir).isDirectory()) continue;
  for (const t of fs.readdirSync(dir)) {
    const td = path.join(dir, t); if (!fs.statSync(td).isDirectory()) continue;
    const exp = fs.readdirSync(td).filter(f => f.endsWith('-expected.png'));
    for (const e of exp) { const base = e.replace(/-expected\.png$/, ''); const act = path.join(td, base + '-actual.png'); if (!fs.existsSync(act)) { console.log(`${proj}/${t}/${base}: no actual png`); continue; } out[`${proj}/${base}`] = analyse(`${proj.replace(/^out-/, '')}__${base}`, path.join(td, e), act); }
    if (!exp.length) console.log(`${proj}/${t}: no expected png (not a screenshot failure): ${fs.readdirSync(td).join(', ')}`);
  }
}
fs.writeFileSync(path.join(OUT, 'reg-diff.json'), JSON.stringify(out, null, 1));
