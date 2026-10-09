// Batch 14 FINAL — attribute the gallery `component-theming` failure (expected 18387 -> actual 18391 px tall):
// (1) per-row vertical shift: for each expected row y, find k in 0..6 such that actual row y+k equals expected row y (exact RGB);
//     report the y where the running shift changes, (2) any-diff bands for rows that match at no k, (3) same any-diff bands for chromium toast-gallery,
// (4) map page y to the section headings of component-theming.zul (DOM, 1280 wide) so each band can be named.
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const fs = require('fs'); const path = require('path');
const { PNG } = require('playwright-core/lib/utilsBundle');
const L = require('./lib.js');
const PW = path.join(__dirname, 'pw');
function read(f) { return PNG.sync.read(fs.readFileSync(f)); }
function rowEq(E, ye, A, ya) { if (ya < 0 || ya >= A.height) return false; const i = ye * E.width * 4, j = ya * A.width * 4; for (let x = 0; x < E.width * 4; x++) if (E.data[i + x] !== A.data[j + x]) return false; return true; }
function anyDiffBands(E, A, gap = 8) { const h = Math.min(E.height, A.height), w = Math.min(E.width, A.width); const bands = []; let cur = null; for (let y = 0; y < h; y++) { let n = 0, x0 = w, x1 = 0; for (let x = 0; x < w; x++) { const i = (y * E.width + x) * 4, j = (y * A.width + x) * 4; if (E.data[i] !== A.data[j] || E.data[i + 1] !== A.data[j + 1] || E.data[i + 2] !== A.data[j + 2]) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; } } if (n) { if (cur && y - cur.y1 <= gap) { cur.y1 = y; cur.n += n; cur.x0 = Math.min(cur.x0, x0); cur.x1 = Math.max(cur.x1, x1); } else { cur = { y0: y, y1: y, n, x0, x1 }; bands.push(cur); } } } return bands; }
function find(dir, suffix) { for (const t of fs.readdirSync(dir)) { const td = path.join(dir, t); if (!fs.statSync(td).isDirectory()) continue; for (const f of fs.readdirSync(td)) if (f.endsWith(suffix)) return path.join(td, f); } return null; }

(async () => {
  const out = {};
  // (3) chromium toast-gallery any-diff
  { const d = path.join(PW, 'out-chromium'); const E = read(find(d, 'toast-gallery-expected.png')), A = read(find(d, 'toast-gallery-actual.png')); const b = anyDiffBands(E, A); out.toastGallery = b; console.log('chromium toast-gallery any-diff bands:', b.map(x => `y${x.y0}-${x.y1} x${x.x0}-${x.x1} (${x.n}px)`).join(', ')); }
  // (1)(2) gallery component-theming shift
  const d = path.join(PW, 'out-gallery'); const E = read(find(d, 'component-theming-gallery-expected.png')), A = read(find(d, 'component-theming-gallery-actual.png'));
  const shifts = []; let prev = null; const unmatched = [];
  for (let y = 0; y < E.height; y++) { let k = null; for (let kk = 0; kk <= 6; kk++) if (rowEq(E, y, A, y + kk)) { k = kk; break; } if (k === null) { unmatched.push(y); continue; } if (k !== prev) { shifts.push({ y, k }); prev = k; } }
  // compress unmatched rows into bands
  const ub = []; let cur = null; for (const y of unmatched) { if (cur && y - cur.y1 <= 8) cur.y1 = y; else { cur = { y0: y, y1: y }; ub.push(cur); } }
  out.shifts = shifts; out.unmatched = ub;
  console.log('component-theming shift changes (expected y -> k):', shifts.map(s => `y${s.y} k=${s.k}`).join(', '));
  console.log('component-theming rows matching at no shift 0..6:', ub.map(b => `y${b.y0}-${b.y1}`).join(', '));
  // (4) section headings on the page
  const browser = await L.chromium.launch({ ignoreDefaultArgs: ['--hide-scrollbars'] });
  const { ctx, page } = await L.open(browser, 'web/component-theming.zul');
  out.sections = await page.evaluate(() => [...document.querySelectorAll('.z-text-uppercase .z-label, .z-text-2xl, h2, h3')].map(e => { const r = e.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), text: e.textContent.trim().slice(0, 60) }; }).filter(s => s.text));
  // also every component wrapper with a heading-ish label: which section contains y?
  const where = y => { let best = null; for (const s of out.sections) if (s.y <= y && (!best || s.y > best.y)) best = s; return best ? `${best.text} (y${best.y})` : '?'; };
  console.log('sections:', out.sections.length);
  for (const s of shifts) console.log(`  shift to k=${s.k} at y${s.y}: section "${where(s.y)}"`);
  for (const b of ub) console.log(`  unmatched y${b.y0}-${b.y1}: section "${where(b.y0)}"`);
  const pageH = await page.evaluate(() => document.documentElement.scrollHeight); console.log('page scrollHeight now', pageH, 'expected png', E.height, 'actual png', A.height);
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(__dirname, 'reg-diff', 'reg-shift.json'), JSON.stringify(out, null, 1));
})().catch(e => { console.error(e); process.exit(1); });
