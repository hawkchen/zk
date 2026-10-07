#!/usr/bin/env node
// Live check of the 5 failing gallery screenshots against the preview app (PREVIEW_URL, default 127.0.0.1:8085).
// For each case:
//  1. shoot `.z-p-8` the way the spec does and pixelmatch it against the run's ACTUAL png (proves the live page = actual);
//  2. measure the batch-3 geometry (header label x, sort-icon box, frozen boundary x, Row States grid + caption);
//  3. revert ONLY the three batch-3 effects in the page (sort icon back in flow with margin-left 4px, body-cell
//     boundary box-shadow off, Row States grid width 370px), shoot again and pixelmatch against the EXPECTED png.
//     A zero (or AA-only) count there means every difference is explained by those three items.
// Usage: node live.js <pwDir> <out.json>
'use strict';
const fs = require('fs');
const path = require('path');
module.paths.push('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/node_modules');
const { chromium } = require('@playwright/test');
const { createRequire } = require('module');
const req = createRequire('/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/package.json');
const { PNG } = req('playwright-core/lib/utilsBundle');
const pixelmatch = require(path.join(path.dirname(req.resolve('playwright-core')), 'lib', 'third_party', 'pixelmatch.js'));

const BASE = process.env.PREVIEW_URL || 'http://127.0.0.1:8085';
const IPAD_UA = 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const pw = process.argv[2], outF = process.argv[3];
const CASES = [
	{ name: 'grid-gallery', url: '/grid.zul', dir: 'screenshot-grid-gallery-chromium', tablet: false, t: 0.05 },
	{ name: 'listbox-gallery', url: '/listbox.zul', dir: 'screenshot-listbox-gallery-chromium', tablet: false, t: 0.05 },
	{ name: 'tree-gallery', url: '/tree.zul', dir: 'screenshot-tree-gallery-chromium', tablet: false, t: 0.05 },
	{ name: 'grid-tablet', url: '/grid.zul', dir: 'tablet-tablet-grid-gallery-tablet', tablet: true, t: 0.2 },
	{ name: 'paging-tablet', url: '/paging.zul', dir: 'tablet-tablet-paging-gallery-tablet', tablet: true, t: 0.2 },
];
// HEAD (pre-batch-3) sort-icon rule, restored on top of the served CSS
const OLD_CSS = `
.z-column-sorticon, .z-column:has(.z-column-button) .z-column-sorticon {
  position: static !important; top: auto !important; right: auto !important; transform: none !important;
  margin-left: var(--zk-spacing-1) !important; vertical-align: middle !important; }
:is(.z-grid-body, .z-listbox-body, .z-tree-body) > table > tbody > * > * { box-shadow: none !important; }`;

const load = b => { const p = PNG.sync.read(b); return { w: p.width, h: p.height, d: p.data }; };
function cmp(aBuf, bFile, t) {
	const a = load(aBuf), b = load(fs.readFileSync(bFile));
	if (a.w !== b.w || a.h !== b.h) return { sizeMismatch: [a.w, a.h, b.w, b.h] };
	return { count: pixelmatch(a.d, b.d, Buffer.alloc(a.d.length), a.w, a.h, { threshold: t }) };
}

async function geometry(page) {
	return page.evaluate(() => {
		const root = document.querySelector('.z-p-8').getBoundingClientRect();
		const R = el => { const r = el.getBoundingClientRect(); return [Math.round((r.left - root.left) * 10) / 10, Math.round((r.top - root.top) * 10) / 10, Math.round(r.width * 10) / 10, Math.round(r.height * 10) / 10]; };
		const textX = el => { const rg = document.createRange(); const tn = [...el.childNodes].find(n => n.nodeType === 3 && n.textContent.trim()); if (!tn) return null; rg.selectNodeContents(tn); const r = rg.getBoundingClientRect(); return Math.round((r.left - root.left) * 10) / 10; };
		const heads = [...document.querySelectorAll('.z-p-8 .z-column, .z-p-8 .z-listheader, .z-p-8 .z-treecol')].filter(h => h.offsetWidth).map(h => {
			const c = h.querySelector('[class$="-content"]'); const s = h.querySelector('.z-column-sorticon, .z-listheader-sorticon, .z-treecol-sorticon');
			const cs = s && getComputedStyle(s);
			return { cls: h.className.split(' ')[0], label: c && c.textContent.trim(), align: c && getComputedStyle(c).textAlign, cell: R(h), textX: c && textX(c),
				sort: s ? { rect: R(s), position: cs.position, marginLeft: cs.marginLeft, children: s.children.length, visibleIcon: [...s.children].some(i => i.offsetWidth > 0 && getComputedStyle(i).display !== 'none'), dirAttr: h.getAttribute('aria-sort') } : null,
				before: s && c ? !!(s.compareDocumentPosition(c.firstChild || c) & Node.DOCUMENT_POSITION_FOLLOWING) : null };
		});
		const frozen = [...document.querySelectorAll('.z-p-8 :is(.z-grid, .z-listbox, .z-tree)')].filter(m => m.querySelector(':scope > :is(.z-grid-header,.z-listbox-header,.z-tree-header) .z-frozen-col')).map(m => {
			const fc = m.querySelectorAll(':scope > :is(.z-grid-header,.z-listbox-header,.z-tree-header) > table > tbody > * > .z-frozen-col');
			const row = m.querySelector(':scope > :is(.z-grid-body,.z-listbox-body,.z-tree-body) > table > tbody > :is(.z-row,.z-listitem,.z-treerow)');
			const cell = row ? row.children[fc.length - 1] : null;
			const body = m.querySelector(':scope > :is(.z-grid-body,.z-listbox-body,.z-tree-body)');
			return { widget: m.className.split(' ')[0], frozenCols: fc.length, lastFrozenCell: cell ? R(cell) : null, boxShadow: cell && getComputedStyle(cell).boxShadow, body: body ? R(body) : null };
		});
		const lab = [...document.querySelectorAll('.z-p-8 .z-label')].find(l => l.textContent.trim() === 'Row States');
		let rowStates = null;
		const col = lab && lab.closest('.z-flex-col'); const g = col && col.querySelector('.z-grid'); if (g) { const cap = lab; rowStates = { col: R(col), grid: R(g), gridStyleWidth: g.style.width, caption: R(cap), colSum: [...g.querySelectorAll('.z-column')].reduce((s, c) => s + c.offsetWidth, 0) }; }
		return { root: [root.left, root.top, root.width, root.height], heads, frozen, rowStates };
	});
}

(async () => {
	const browser = await chromium.launch();
	const out = {};
	for (const c of CASES) {
		const ctxOpts = c.tablet
			? { viewport: { width: 834, height: 1112 }, userAgent: IPAD_UA, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }
			: { viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 };
		const ctx = await browser.newContext(ctxOpts);
		const page = await ctx.newPage();
		await page.goto(BASE + c.url);
		await page.waitForLoadState('networkidle');
		await page.evaluate(() => document.fonts.ready.then(() => true));
		const loc = page.locator('.z-p-8').first();
		const shot = () => loc.screenshot({ animations: 'disabled', caret: 'hide', scale: 'css' });
		const dir = path.join(pw, c.dir);
		const now = await shot();
		const vsActual = cmp(now, path.join(dir, c.name + '-actual.png'), c.t);
		const geoNew = await geometry(page);
		// revert the three batch-3 effects
		await page.addStyleTag({ content: OLD_CSS });
		const gridFixed = await page.evaluate(() => {
			const lab = [...document.querySelectorAll('.z-p-8 .z-label')].find(l => l.textContent.trim() === 'Row States');
			const g0 = lab && lab.closest('.z-flex-col') && lab.closest('.z-flex-col').querySelector('.z-grid'); if (!g0) return false;
			zk.Widget.$(lab.closest('.z-flex-col').querySelector('.z-grid')).setWidth('370px');
			return true;
		});
		await page.waitForTimeout(500);
		const old = await shot();
		fs.writeFileSync(path.join(path.dirname(outF), `reverted-${c.name}.png`), old);
		const revertedVsExpected = cmp(old, path.join(dir, c.name + '-expected.png'), c.t);
		const revertedVsExpected0 = cmp(old, path.join(dir, c.name + '-expected.png'), 0);
		const geoOld = await geometry(page);
		out[c.name] = { vsActual, revertedVsExpected, revertedVsExpectedT0: revertedVsExpected0, rowStatesWidthReverted: gridFixed, geoNew, geoOld };
		console.log(c.name, 'live-vs-actual', JSON.stringify(vsActual), 'reverted-vs-expected', JSON.stringify(revertedVsExpected), 't0', JSON.stringify(revertedVsExpected0));
		await ctx.close();
	}
	fs.writeFileSync(outF, JSON.stringify(out, null, 1));
	await browser.close();
})();
