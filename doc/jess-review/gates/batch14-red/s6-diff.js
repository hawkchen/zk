// Batch 14 RED — S6: characterise the three known failures from the Playwright output (expected vs actual PNG).
// Reports differing-pixel counts (YIQ > 0.2, Playwright's default threshold for the gallery/tablet projects; and any-diff),
// the y-ranges (row bands) and x-ranges of the differences, and writes side-by-side crops of each band.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs');
const path = require('path');
const { PNG } = require('playwright-core/lib/utilsBundle');
const OUT = __dirname;

function read(f) { return PNG.sync.read(fs.readFileSync(f)); }
function yiq(r, g, b) { return 0.29889531 * r + 0.58662247 * g + 0.11448223 * b; }
function colorDelta(a, b) { // Playwright/pixelmatch-style YIQ distance normalized to 0..1 (approx: |ΔY|/255 dominated); use pixelmatch's formula
  const rmean = 0; const y1 = yiq(a[0], a[1], a[2]), y2 = yiq(b[0], b[1], b[2]);
  const i1 = 0.59597799 * a[0] - 0.27417610 * a[1] - 0.32180189 * a[2], i2 = 0.59597799 * b[0] - 0.27417610 * b[1] - 0.32180189 * b[2];
  const q1 = 0.21147017 * a[0] - 0.52261711 * a[1] + 0.31114694 * a[2], q2 = 0.21147017 * b[0] - 0.52261711 * b[1] + 0.31114694 * b[2];
  const dy = y1 - y2, di = i1 - i2, dq = q1 - q2;
  return 0.5053 * dy * dy + 0.299 * di * di + 0.1957 * dq * dq; // pixelmatch delta; threshold t -> maxDelta = 35215 * t * t
}
function analyse(name, expF, actF, bandGap = 12) {
  const E = read(expF), A = read(actF);
  const w = Math.min(E.width, A.width), h = Math.min(E.height, A.height);
  const maxDelta = 35215 * 0.2 * 0.2;
  const rows = new Array(h).fill(0), rowsAny = new Array(h).fill(0); let n = 0, nAny = 0, minx = w, maxx = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * E.width + x) * 4, j = (y * A.width + x) * 4;
    const a = [E.data[i], E.data[i + 1], E.data[i + 2]], b = [A.data[j], A.data[j + 1], A.data[j + 2]];
    if (a[0] !== b[0] || a[1] !== b[1] || a[2] !== b[2]) { nAny++; rowsAny[y]++; if (colorDelta(a, b) > maxDelta) { n++; rows[y]++; if (x < minx) minx = x; if (x > maxx) maxx = x; } }
  }
  // bands of consecutive rows (gap <= bandGap) with threshold diffs
  const bands = []; let cur = null;
  for (let y = 0; y < h; y++) { if (rows[y]) { if (cur && y - cur.y1 <= bandGap) { cur.y1 = y; cur.n += rows[y]; } else { cur = { y0: y, y1: y, n: rows[y] }; bands.push(cur); } } }
  const bandsAny = []; cur = null;
  for (let y = 0; y < h; y++) { if (rowsAny[y]) { if (cur && y - cur.y1 <= bandGap) { cur.y1 = y; cur.n += rowsAny[y]; } else { cur = { y0: y, y1: y, n: rowsAny[y] }; bandsAny.push(cur); } } }
  const res = { name, expected: { w: E.width, h: E.height }, actual: { w: A.width, h: A.height }, comparedArea: w * h, diffPixels_thr02: n, ratio_thr02: +(n / (w * h)).toFixed(5), diffPixels_any: nAny, ratio_any: +(nAny / (w * h)).toFixed(5), xRange: n ? [minx, maxx] : null, bands, bandsAny };
  // crops: each band (expected | actual | diff-mask) side by side, full width, band ± 20px
  res.crops = [];
  bands.forEach((b, k) => {
    const y0 = Math.max(0, b.y0 - 20), y1 = Math.min(h - 1, b.y1 + 20); const ch = y1 - y0 + 1;
    const o = new PNG({ width: w * 3 + 8, height: ch });
    for (let y = 0; y < ch; y++) for (let x = 0; x < w * 3 + 8; x++) { const k2 = (y * o.width + x) * 4; o.data[k2] = 200; o.data[k2 + 1] = 200; o.data[k2 + 2] = 200; o.data[k2 + 3] = 255; }
    for (let y = 0; y < ch; y++) for (let x = 0; x < w; x++) {
      const i = ((y0 + y) * E.width + x) * 4, j = ((y0 + y) * A.width + x) * 4;
      const oe = (y * o.width + x) * 4, oa = (y * o.width + w + 4 + x) * 4, od = (y * o.width + 2 * w + 8 + x) * 4;
      o.data[oe] = E.data[i]; o.data[oe + 1] = E.data[i + 1]; o.data[oe + 2] = E.data[i + 2]; o.data[oe + 3] = 255;
      o.data[oa] = A.data[j]; o.data[oa + 1] = A.data[j + 1]; o.data[oa + 2] = A.data[j + 2]; o.data[oa + 3] = 255;
      const a = [E.data[i], E.data[i + 1], E.data[i + 2]], bb = [A.data[j], A.data[j + 1], A.data[j + 2]];
      const d = colorDelta(a, bb) > maxDelta; const same = a[0] === bb[0] && a[1] === bb[1] && a[2] === bb[2];
      const g = Math.round(yiq(a[0], a[1], a[2]) * 0.3 + 178);
      o.data[od] = d ? 255 : same ? g : 255; o.data[od + 1] = d ? 0 : same ? g : 220; o.data[od + 2] = d ? 0 : same ? g : 0; o.data[od + 3] = 255;
    }
    const file = `s6-${name}-band${k}-y${b.y0}-${b.y1}.png`; fs.writeFileSync(path.join(OUT, file), PNG.sync.write(o)); res.crops.push(file);
  });
  console.log(`${name}: expected ${E.width}x${E.height}, actual ${A.width}x${A.height}; diff(thr .2) ${n} px (${(100 * n / (w * h)).toFixed(3)}%), any-diff ${nAny} px (${(100 * nAny / (w * h)).toFixed(3)}%); x ${JSON.stringify(res.xRange)}`);
  console.log(`  bands(thr .2): ${bands.map(b => `y${b.y0}-${b.y1} (${b.n}px)`).join(', ') || 'none'}`);
  console.log(`  bands(any):    ${bandsAny.map(b => `y${b.y0}-${b.y1} (${b.n}px)`).join(', ') || 'none'}`);
  return res;
}
// pairwise comparison of actual PNGs between runs (stability)
function same(fa, fb) { const A = read(fa), B = read(fb); if (A.width !== B.width || A.height !== B.height) return { size: false, a: [A.width, A.height], b: [B.width, B.height] }; let n = 0; for (let i = 0; i < A.data.length; i += 4) if (A.data[i] !== B.data[i] || A.data[i + 1] !== B.data[i + 1] || A.data[i + 2] !== B.data[i + 2]) n++; return { size: true, diffPixels: n }; }

const S6 = path.join(OUT, 's6');
const out = {};
out.calendar = analyse('calendar-tablet', path.join(S6, 'tablet-run1/tablet-tablet-calendar-gallery-tablet/calendar-tablet-expected.png'), path.join(S6, 'tablet-run1/tablet-tablet-calendar-gallery-tablet/calendar-tablet-actual.png'));
out.slider = analyse('slider-tablet', path.join(S6, 'tablet-run1/tablet-tablet-slider-gallery-tablet/slider-tablet-expected.png'), path.join(S6, 'tablet-run1/tablet-tablet-slider-gallery-tablet/slider-tablet-actual.png'));
for (const i of [1, 2, 3]) out['grid' + i] = analyse('grid-header-gallery-run' + i, path.join(S6, `grid-run${i}/gallery-scan-gallery-grid-header-gallery/grid-header-gallery-expected.png`), path.join(S6, `grid-run${i}/gallery-scan-gallery-grid-header-gallery/grid-header-gallery-actual.png`), 40);
out.gridStability = { r1r2: same(path.join(S6, 'grid-run1/gallery-scan-gallery-grid-header-gallery/grid-header-gallery-actual.png'), path.join(S6, 'grid-run2/gallery-scan-gallery-grid-header-gallery/grid-header-gallery-actual.png')), r2r3: same(path.join(S6, 'grid-run2/gallery-scan-gallery-grid-header-gallery/grid-header-gallery-actual.png'), path.join(S6, 'grid-run3/gallery-scan-gallery-grid-header-gallery/grid-header-gallery-actual.png')) };
console.log('grid-header actual stability run1 vs run2', JSON.stringify(out.gridStability.r1r2), 'run2 vs run3', JSON.stringify(out.gridStability.r2r3));
fs.writeFileSync(path.join(OUT, 's6-diff.json'), JSON.stringify(out, null, 1));
