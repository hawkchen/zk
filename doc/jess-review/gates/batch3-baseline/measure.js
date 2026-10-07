#!/usr/bin/env node
// Measures Playwright screenshot failures (expected vs actual PNGs) for baseline classification.
// Usage: node measure.js <pwOutputDir> [outJson] [--yiq <t>]
// --yiq <t>: count a pixel as differing when its pixelmatch YIQ delta exceeds 35215*t^2 (Playwright's
// per-pixel threshold) instead of the per-channel SIG; also reports Playwright's exact pixelmatch count
// (with its anti-aliasing exclusion) at t and at 0.2, plus the largest YIQ delta. Without it, output is unchanged.
// <pwOutputDir> holds screenshot-<comp>-<state>-chromium and tablet-<case>-tablet/<base>-{expected,actual}.png
// PNG decoding uses the pngjs copy bundled in zkpreview's playwright-core (no extra install).
'use strict';
const fs = require('fs');
const path = require('path');
const { createRequire } = require('module');

const repo = path.resolve(__dirname, '../../../..');
const req = createRequire(path.join(repo, 'zkpreview', 'package.json'));
const { PNG } = req('playwright-core/lib/utilsBundle');

const CHROMA = 12; // max(R,G,B) - min(R,G,B) above this counts as chromatic
const SIG = 25;
const STRONG = 40; // chroma above this = saturated colour (e.g. primary blue), not a faint tint // per-channel delta above this counts as a "significant" difference
const DILATE = 4; // px gap merged into one cluster
const SHIFT = 3;
const WIDE_X = 30, WIDE_Y = 8; // wide search per cluster, to detect element moves larger than 3px
const FILL_MIN = 200; // a colour pair changing on at least this many pixels is reported as a fill change
const SHIFT_OK = 0.25; // a shift "explains" a cluster when its residual is below this share of the cluster's diff pixels
const argv = process.argv.slice(2);
const yiqAt = argv.indexOf('--yiq');
const YIQ_T = yiqAt >= 0 ? parseFloat(argv.splice(yiqAt, 2)[1]) : null;
const YIQ_MAX = 35215; // pixelmatch's maximum YIQ delta; threshold t compares against YIQ_MAX * t * t

function load(p) {
	const png = PNG.sync.read(fs.readFileSync(p));
	return { w: png.width, h: png.height, d: png.data };
}
function chroma(img, x, y) {
	const i = (y * img.w + x) * 4;
	const r = img.d[i], g = img.d[i + 1], b = img.d[i + 2];
	return Math.max(r, g, b) - Math.min(r, g, b);
}
function px(img, x, y) {
	const i = (y * img.w + x) * 4;
	return [img.d[i], img.d[i + 1], img.d[i + 2], img.d[i + 3]];
}
function delta(a, ax, ay, b, bx, by) {
	const i = (ay * a.w + ax) * 4, j = (by * b.w + bx) * 4;
	let m = 0;
	for (let k = 0; k < 4; k++) m = Math.max(m, Math.abs(a.d[i + k] - b.d[j + k]));
	return m;
}
function blend(c, a) { return 255 + (c - 255) * a; } // pixelmatch blends translucent pixels over white
function yiqDelta(a, ax, ay, b, bx, by) {
	const i = (ay * a.w + ax) * 4, j = (by * b.w + bx) * 4;
	const a1 = a.d[i + 3] / 255, a2 = b.d[j + 3] / 255;
	const r1 = blend(a.d[i], a1), g1 = blend(a.d[i + 1], a1), b1 = blend(a.d[i + 2], a1);
	const r2 = blend(b.d[j], a2), g2 = blend(b.d[j + 1], a2), b2 = blend(b.d[j + 2], a2);
	const y = (r1 - r2) * 0.29889531 + (g1 - g2) * 0.58662247 + (b1 - b2) * 0.11448223;
	const ii = (r1 - r2) * 0.59597799 - (g1 - g2) * 0.27417610 - (b1 - b2) * 0.32180189;
	const q = (r1 - r2) * 0.21147017 - (g1 - g2) * 0.52261711 + (b1 - b2) * 0.31114694;
	return 0.5053 * y * y + 0.299 * ii * ii + 0.1957 * q * q;
}
// the per-pixel "differs" test: per-channel SIG by default, Playwright's YIQ threshold with --yiq
function differs(a, ax, ay, b, bx, by) {
	return YIQ_T === null ? delta(a, ax, ay, b, bx, by) > SIG : yiqDelta(a, ax, ay, b, bx, by) > YIQ_MAX * YIQ_T * YIQ_T;
}
function pixelmatchCount(exp, act, t) {
	// not in playwright-core's package exports, so load it by file path next to the package entry
	const pixelmatch = require(path.join(path.dirname(req.resolve('playwright-core')), 'lib', 'third_party', 'pixelmatch.js'));
	return pixelmatch(exp.d, act.d, Buffer.alloc(exp.d.length), exp.w, exp.h, { threshold: t });
}

// count differing pixels of actual vs expected shifted by (dx,dy), inside rect (actual coords)
function shiftedDiff(exp, act, dx, dy, rect) {
	let n = 0, cmp = 0;
	for (let y = rect.y; y < rect.y + rect.h; y++) {
		const ey = y - dy;
		if (ey < 0 || ey >= exp.h) continue;
		for (let x = rect.x; x < rect.x + rect.w; x++) {
			const ex = x - dx;
			if (ex < 0 || ex >= exp.w) continue;
			cmp++;
			if (differs(act, x, y, exp, ex, ey)) n++;
		}
	}
	return { n, cmp };
}
function bestShift(exp, act, rect, rx = SHIFT, ry = SHIFT) {
	let best = null;
	for (let dy = -ry; dy <= ry; dy++) {
		for (let dx = -rx; dx <= rx; dx++) {
			const r = shiftedDiff(exp, act, dx, dy, rect);
			if (!best || r.n < best.residual || (r.n === best.residual && Math.abs(dx) + Math.abs(dy) < Math.abs(best.dx) + Math.abs(best.dy))) {
				best = { dx, dy, residual: r.n };
			}
		}
	}
	return best;
}

function measure(dir) {
	const files = fs.readdirSync(dir);
	const expF = files.find(f => f.endsWith('-expected.png'));
	const actF = files.find(f => f.endsWith('-actual.png'));
	const base = expF.replace(/-expected\.png$/, '');
	const exp = load(path.join(dir, expF));
	const act = load(path.join(dir, actF));
	const W = Math.min(exp.w, act.w), H = Math.min(exp.h, act.h);
	const mask = new Uint8Array(W * H);
	let diffAny = 0, diffSig = 0, chromaticPx = 0, maxYiq = 0;
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			const dlt = delta(exp, x, y, act, x, y);
			if (dlt > 0) diffAny++;
			if (YIQ_T !== null) maxYiq = Math.max(maxYiq, yiqDelta(exp, x, y, act, x, y));
			if (differs(exp, x, y, act, x, y)) {
				diffSig++;
				mask[y * W + x] = 1;
				if (chroma(exp, x, y) > CHROMA || chroma(act, x, y) > CHROMA) chromaticPx++;
			}
		}
	}
	// clusters: connected components with DILATE-px tolerance (grid bucketing + union-find)
	const parent = new Int32Array(W * H).fill(-1);
	const find = i => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
	const pts = [];
	for (let i = 0; i < W * H; i++) if (mask[i]) { parent[i] = i; pts.push(i); }
	for (const i of pts) {
		const x = i % W, y = (i / W) | 0;
		for (let yy = Math.max(0, y - DILATE); yy <= Math.min(H - 1, y + DILATE); yy++) {
			for (let xx = Math.max(0, x - DILATE); xx <= Math.min(W - 1, x + DILATE); xx++) {
				const j = yy * W + xx;
				if (j < i && mask[j]) {
					const a = find(i), b = find(j);
					if (a !== b) parent[a] = b;
				}
			}
		}
	}
	const cl = new Map();
	for (const i of pts) {
		const r = find(i), x = i % W, y = (i / W) | 0;
		let c = cl.get(r);
		if (!c) { c = { x0: x, y0: y, x1: x, y1: y, n: 0, chromaticPx: 0, strongPx: 0, hueSamples: [] }; cl.set(r, c); }
		if (chroma(exp, x, y) > STRONG || chroma(act, x, y) > STRONG) c.strongPx++;
		c.x0 = Math.min(c.x0, x); c.y0 = Math.min(c.y0, y); c.x1 = Math.max(c.x1, x); c.y1 = Math.max(c.y1, y); c.n++;
		if (chroma(exp, x, y) > CHROMA || chroma(act, x, y) > CHROMA) {
			c.chromaticPx++;
			if (c.hueSamples.length < 3 && c.chromaticPx % 37 === 1) c.hueSamples.push({ x, y, exp: px(exp, x, y), act: px(act, x, y) });
		}
	}
	const clusters = [...cl.values()].sort((a, b) => b.n - a.n).map(c => {
		const rect = { x: Math.max(0, c.x0 - 4), y: Math.max(0, c.y0 - 4) };
		rect.w = Math.min(W, c.x1 + 5) - rect.x; rect.h = Math.min(H, c.y1 + 5) - rect.y;
		const bs = bestShift(exp, act, rect);
		const ws = c.n >= 40 ? bestShift(exp, act, rect, WIDE_X, WIDE_Y) : bs;
		return {
			x: c.x0, y: c.y0, w: c.x1 - c.x0 + 1, h: c.y1 - c.y0 + 1, diffPixels: c.n,
			chromatic: c.chromaticPx > 0, chromaticPixels: c.chromaticPx,
			localBestShift: [bs.dx, bs.dy], localResidual: bs.residual,
			wideShift: [ws.dx, ws.dy], wideResidual: ws.residual,
			movedBeyond3px: (Math.abs(ws.dx) > SHIFT || Math.abs(ws.dy) > SHIFT) && ws.residual < SHIFT_OK * c.n,
			strongChromaticPixels: c.strongPx, hueSamples: c.hueSamples,
		};
	});
	// flat-fill changes: (expected colour -> actual colour) pairs over ALL differing pixels, including those
	// under SIG. A subtle background change (e.g. a selected row tint) stays below Playwright's threshold
	// per pixel but shows up here as one large pair.
	const pairs = new Map();
	for (let y = 0; y < H; y++) {
		for (let x = 0; x < W; x++) {
			if (delta(exp, x, y, act, x, y) === 0) continue;
			const e = px(exp, x, y), a = px(act, x, y);
			const key = e.slice(0, 3).join(',') + '->' + a.slice(0, 3).join(',');
			let v = pairs.get(key);
			if (!v) { v = { from: e.slice(0, 3), to: a.slice(0, 3), n: 0, x0: x, y0: y, x1: x, y1: y }; pairs.set(key, v); }
			v.n++; v.x0 = Math.min(v.x0, x); v.y0 = Math.min(v.y0, y); v.x1 = Math.max(v.x1, x); v.y1 = Math.max(v.y1, y);
		}
	}
	const fillChanges = [...pairs.values()].filter(v => v.n >= FILL_MIN).sort((a, b) => b.n - a.n).map(v => ({
		from: v.from, to: v.to, pixels: v.n, x: v.x0, y: v.y0, w: v.x1 - v.x0 + 1, h: v.y1 - v.y0 + 1,
		chromatic: Math.max(...v.from) - Math.min(...v.from) > CHROMA || Math.max(...v.to) - Math.min(...v.to) > CHROMA,
	}));
	const gs = bestShift(exp, act, { x: 0, y: 0, w: act.w, h: act.h });
	const yiq = YIQ_T === null ? undefined : {
		t: YIQ_T, maxDelta: Math.round(maxYiq), maxDeltaAsThreshold: +Math.sqrt(maxYiq / YIQ_MAX).toFixed(4),
		pixelmatchAtT: exp.w === act.w && exp.h === act.h ? pixelmatchCount(exp, act, YIQ_T) : null,
		pixelmatchAt02: exp.w === act.w && exp.h === act.h ? pixelmatchCount(exp, act, 0.2) : null,
	};
	return {
		dir: path.basename(dir), base,
		sizeExpected: [exp.w, exp.h], sizeActual: [act.w, act.h],
		diffPixelsAny: diffAny, diffPixels: diffSig, chromatic: chromaticPx > 0, chromaticPixels: chromaticPx,
		bestShift: [gs.dx, gs.dy], bestShiftResidual: gs.residual, fillChanges, clusters, yiq,
	};
}

const root = argv[0];
const out = argv[1];
const dirs = fs.readdirSync(root).filter(d => (d.startsWith('screenshot-') || d.startsWith('tablet-'))).sort();
const results = dirs.map(d => measure(path.join(root, d)));
for (const r of results) {
	console.log(`${r.base}: exp ${r.sizeExpected.join('x')} act ${r.sizeActual.join('x')} diffAny=${r.diffPixelsAny} diffSig=${r.diffPixels} chromaticPx=${r.chromaticPixels} best=(${r.bestShift}) resid=${r.bestShiftResidual}`);
	if (r.yiq) console.log(`   YIQ t=${r.yiq.t}: pixelmatch=${r.yiq.pixelmatchAtT} (at 0.2: ${r.yiq.pixelmatchAt02}) maxDelta=${r.yiq.maxDelta} (= t ${r.yiq.maxDeltaAsThreshold})`);
	for (const f of r.fillChanges) console.log(`   FILL ${f.from}->${f.to} n=${f.pixels} [${f.x},${f.y} ${f.w}x${f.h}]${f.chromatic ? ' chromatic' : ''}`);
	const moved = r.clusters.filter(c => c.movedBeyond3px);
	console.log(`   moved>3px clusters: ${moved.length}; strong-chroma clusters: ${r.clusters.filter(c => c.strongChromaticPixels > 0).length}`);
	for (const c of r.clusters.filter((c, i) => i < 12 || c.movedBeyond3px || c.strongChromaticPixels > 0)) {
		console.log(`   [${c.x},${c.y} ${c.w}x${c.h}] n=${c.diffPixels} chroma=${c.chromaticPixels}/${c.strongChromaticPixels} local=(${c.localBestShift}) resid=${c.localResidual} wide=(${c.wideShift}) resid=${c.wideResidual}${c.movedBeyond3px ? ' MOVED>3' : ''}` +
			(c.hueSamples.length ? ' e/a=' + c.hueSamples.map(s => `${s.exp.slice(0, 3)}->${s.act.slice(0, 3)}`).join(' ') : ''));
	}
}
if (out) fs.writeFileSync(out, JSON.stringify(results, null, 1));
