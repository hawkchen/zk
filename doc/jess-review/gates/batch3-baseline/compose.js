#!/usr/bin/env node
// Attributes every changed region (measure.json clusters) to a batch-3 E item using the live geometry
// (live.json), and renders one side-by-side review image per failing PNG:
//   top: expected | actual | diff overview (scaled to fit) with every region boxed in red;
//   below: one zoomed row per region (expected | actual | diff crop, 3x), labelled with bbox + attribution.
// Usage: node compose.js <pwDir> <measure.json> <live.json> <outDir>
'use strict';
const fs = require('fs');
const path = require('path');
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');

const [pw, measureF, liveF, outDir] = process.argv.slice(2);
const measure = JSON.parse(fs.readFileSync(measureF, 'utf8'));
const live = JSON.parse(fs.readFileSync(liveF, 'utf8'));
const DIRS = {
	'grid-gallery': 'screenshot-grid-gallery-chromium', 'listbox-gallery': 'screenshot-listbox-gallery-chromium',
	'tree-gallery': 'screenshot-tree-gallery-chromium', 'grid-tablet': 'tablet-tablet-grid-gallery-tablet',
	'paging-tablet': 'tablet-tablet-paging-gallery-tablet',
};
const inside = (c, r, tol = 0) => c.x >= r[0] - tol && c.y >= r[1] - tol && c.x + c.w <= r[0] + r[2] + tol && c.y + c.h <= r[1] + r[3] + tol;

function attribute(c, L) {
	const n = L.geoNew, o = L.geoOld;
	for (const f of n.frozen) {
		const lineX = Math.round(f.lastFrozenCell[0] + f.lastFrozenCell[2]) - 1;
		if (c.w === 1 && c.x === lineX && c.y >= Math.floor(f.body[1]) && c.y + c.h <= Math.ceil(f.body[1] + f.body[3]))
			return { e: 'E2', why: `#37 frozen body divider: inset -1px box-shadow at x=${lineX} (last frozen ${f.widget} cell ${f.lastFrozenCell[0]}+${f.lastFrozenCell[2]}), body height ${f.body[3]}` };
	}
	if (n.rowStates) {
		const capN = n.rowStates.caption, capO = o.rowStates.caption;
		const capU = [Math.min(capN[0], capO[0]), capN[1], Math.max(capN[0] + capN[2], capO[0] + capO[2]) - Math.min(capN[0], capO[0]), capN[3]];
		if (inside(c, capU, 2)) return { e: 'E3', why: `#34 "Row States" caption re-centred: x ${capO[0]} -> ${capN[0]} (${capN[0] - capO[0]}px = half of the grid width change)` };
		const rN = n.rowStates.grid[0] + n.rowStates.grid[2] - 1, rO = o.rowStates.grid[0] + o.rowStates.grid[2] - 1;
		if (c.x >= rN - 4 && c.x + c.w - 1 <= rO + 1 && c.y >= n.rowStates.grid[1] && c.y + c.h <= n.rowStates.grid[1] + n.rowStates.grid[3])
			return { e: 'E3', why: `#34 Row States grid right edge: width ${o.rowStates.grid[2]} -> ${n.rowStates.grid[2]} (columns ${n.rowStates.colSum} + 2px border), right border x ${rO} -> ${rN}` };
	}
	for (let i = 0; i < n.heads.length; i++) {
		const h = n.heads[i], d = h.textX - o.heads[i].textX;
		if (d !== 0 && inside(c, h.cell, 1))
			return { e: 'E1', why: `#39 header "${h.label}" (${h.align}) label x ${o.heads[i].textX} -> ${h.textX} (${d}px): empty sort-icon placeholder (margin-left 4px, width 0) taken out of flow` };
	}
	return { e: 'U', why: 'no batch-3 item matches this region' };
}

(async () => {
	const browser = await chromium.launch();
	const page = await browser.newPage();
	const attribution = {};
	for (const m of measure) {
		const L = live[m.base];
		const dir = path.join(pw, DIRS[m.base]);
		const clusters = m.clusters.slice().sort((a, b) => a.y - b.y || a.x - b.x).map((c, i) => ({ i: i + 1, x: c.x, y: c.y, w: c.w, h: c.h, n: c.diffPixels, shift: c.wideShift, ...attribute(c, L) }));
		attribution[m.base] = clusters;
		const b64 = s => fs.readFileSync(path.join(dir, `${m.base}-${s}.png`)).toString('base64');
		const dataUrl = await page.evaluate(async ({ e, a, d, clusters, title }) => {
			const img = async s => { const i = new Image(); i.src = 'data:image/png;base64,' + s; await i.decode(); return i; };
			const E = await img(e), A = await img(a), D = await img(d);
			const W = E.width, H = E.height, GAP = 12, PANEL = 400;
			const s = Math.min(PANEL / W, 1400 / H);
			const ow = Math.round(W * s), oh = Math.round(H * s);
			const Z = 3, CW = 140, CH = 60, PAD = 10;
			const rows = clusters.map(c => {
				const cw = Math.min(c.w + 2 * PAD, CW), ch = Math.min(c.h + 2 * PAD, CH);
				const cx = Math.max(0, Math.min(W - cw, c.x - PAD)), cy = Math.max(0, Math.min(H - ch, c.y - PAD));
				return { c, cx, cy, cw, ch, cropped: c.w + 2 * PAD > CW || c.h + 2 * PAD > CH };
			});
			const zw = CW * Z, rowH = CH * Z + 34;
			const totalW = Math.max(3 * ow + 4 * GAP, 3 * zw + 4 * GAP);
			const totalH = 40 + oh + GAP * 2 + rows.length * rowH + GAP;
			const cv = document.createElement('canvas'); cv.width = totalW; cv.height = totalH;
			const x = cv.getContext('2d');
			x.fillStyle = '#f0f0f0'; x.fillRect(0, 0, totalW, totalH);
			x.fillStyle = '#000'; x.font = 'bold 15px sans-serif';
			x.fillText(`${title}  ${W}x${H}  — expected | actual | diff  (overview x${s.toFixed(3)}; regions boxed red; zoom x${Z} below)`, GAP, 24);
			x.imageSmoothingEnabled = true;
			[E, A, D].forEach((im, k) => {
				const ox = GAP + k * (ow + GAP), oy = 40;
				x.drawImage(im, ox, oy, ow, oh);
				x.strokeStyle = '#999'; x.lineWidth = 1; x.strokeRect(ox - .5, oy - .5, ow + 1, oh + 1);
				x.strokeStyle = 'red'; x.lineWidth = 2;
				for (const c of clusters) x.strokeRect(ox + c.x * s - 3, oy + c.y * s - 3, Math.max(c.w * s, 1) + 6, Math.max(c.h * s, 1) + 6);
				x.fillStyle = 'red'; x.font = 'bold 11px sans-serif';
				for (const c of clusters) x.fillText(String(c.i), ox + c.x * s + Math.max(c.w * s, 1) + 5, oy + c.y * s + 8);
			});
			let y = 40 + oh + GAP * 2;
			x.imageSmoothingEnabled = false;
			for (const r of rows) {
				x.fillStyle = r.c.e === 'U' ? '#c00' : '#000'; x.font = '13px sans-serif';
				x.fillText(`#${r.c.i} [${r.c.x},${r.c.y} ${r.c.w}x${r.c.h}] n=${r.c.n} best shift (${r.c.shift}) — ${r.c.e}: ${r.c.why}${r.cropped ? '  (crop shows the first ' + r.cw + 'x' + r.ch + ' px)' : ''}`, GAP, y + 16);
				[E, A, D].forEach((im, k) => {
					const ox = GAP + k * (zw + GAP), oy = y + 24;
					x.fillStyle = '#fff'; x.fillRect(ox, oy, zw, CH * Z);
					x.drawImage(im, r.cx, r.cy, r.cw, r.ch, ox, oy, r.cw * Z, r.ch * Z);
					x.strokeStyle = 'red'; x.lineWidth = 1;
					x.strokeRect(ox + (r.c.x - r.cx) * Z - 1.5, oy + (r.c.y - r.cy) * Z - 1.5, Math.min(r.c.w, r.cw) * Z + 3, Math.min(r.c.h, r.ch) * Z + 3);
				});
				y += rowH;
			}
			return cv.toDataURL('image/png');
		}, { e: b64('expected'), a: b64('actual'), d: b64('diff'), clusters, title: m.base + '.png' });
		fs.writeFileSync(path.join(outDir, `sbs-${m.base}.png`), Buffer.from(dataUrl.split(',')[1], 'base64'));
		console.log(m.base, clusters.length, 'regions:', clusters.map(c => `#${c.i}=${c.e}`).join(' '));
	}
	fs.writeFileSync(path.join(outDir, 'attribution.json'), JSON.stringify(attribution, null, 1));
	await browser.close();
})();
