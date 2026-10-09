// Batch 14 FINAL R2 — field-by-field comparison of r2-p1p2.json with the round-1 (batch14-final/final-p1p2.json) and
// RED (batch14-red/red-p1p2.json) measurements. Prints every leaf that differs (env.date / chromium excluded), so the
// "unchanged" protection items are shown by the absence of a diff rather than asserted.
const fs = require('fs');
const path = require('path');
const R2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'r2-p1p2.json')));
const files = { 'round-1': '/Users/hawk/Documents/workspace/ZK10/zk/doc/jess-review/gates/batch14-final/final-p1p2.json', RED: process.argv[2] || '/Users/hawk/Documents/workspace/ZK10/zk/doc/jess-review/gates/batch14-red/red-p1p2.json' };
function walk(a, b, p, out) {
  if (p === 'env.date' || p === 'env.chromium') return;
  if (Array.isArray(a) && Array.isArray(b) && a.every(v => typeof v !== 'object') && b.every(v => typeof v !== 'object')) { if (JSON.stringify(a) !== JSON.stringify(b)) out.push([p, JSON.stringify(b), JSON.stringify(a)]); return; }
  if (a && b && typeof a === 'object' && typeof b === 'object') { for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) walk(a[k], b[k], p ? p + '.' + k : k, out); return; }
  if (a !== b) out.push([p, JSON.stringify(b), JSON.stringify(a)]);
}
for (const [name, f] of Object.entries(files)) {
  if (!fs.existsSync(f)) { console.log(`${name}: ${f} not found`); continue; }
  const O = JSON.parse(fs.readFileSync(f)); const out = [];
  walk(R2, O, '', out);
  // group by top-level area, skip noisy per-pixel worst coordinates and the median/sat duplicates for readability
  const keep = out.filter(([p]) => !/\.(bgWorst|worstInner)\.(x|y)$/.test(p));
  console.log(`\n===== R2 vs ${name}: ${keep.length} differing leaves (${out.length} raw)`);
  for (const [p, old, nu] of keep) console.log(`${p}: ${old} -> ${nu}`);
}
