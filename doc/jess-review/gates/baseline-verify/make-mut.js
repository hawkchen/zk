#!/usr/bin/env node
// Builds a scratch copy of screenshot.spec.ts + focus-ring-scan.spec.ts with an env-driven
// CSS injection hook, plus a scratch config that reuses the real playwright.config.ts.
// The repo files are only READ. Usage: node make-mut.js <scratchDir>
// Then, from zkpreview/:
//   MUT_CSS='<css>' MUT_PROBE='<selector>' MUT_EXPECT='rgb(…)' [THRESH=0.2] \
//   PREVIEW_URL=… npx playwright test --config <scratchDir>/mut/mut.config.ts --project=<p> -g '<title>'
// With MUT_CSS unset the hook is a no-op, so the copies behave like the originals.
'use strict';
const fs = require('fs');
const path = require('path');

const repo = path.resolve(__dirname, '../../../..');
const pwDir = path.join(repo, 'zkpreview/src/test/playwright');
const out = path.join(path.resolve(process.argv[2]), 'mut');
fs.mkdirSync(out, { recursive: true });

const nm = path.join(out, 'node_modules');
if (!fs.existsSync(nm)) fs.symlinkSync(path.join(repo, 'zkpreview/node_modules'), nm);

// Hook: inject MUT_CSS, then wait until MUT_PROBE's computed background-color equals
// MUT_EXPECT (proves the injection took effect, past any transition), and log the reading.
const HOOK = `
async function __mut(page: Page) {
  const css = process.env.MUT_CSS;
  if (!css) return;
  await page.addStyleTag({ content: css });
  const probe = process.env.MUT_PROBE, want = process.env.MUT_EXPECT;
  if (probe && want) {
    await expect.poll(() => page.evaluate((s) => {
      const el = document.querySelector(s);
      return el ? getComputedStyle(el).backgroundColor : '(no element)';
    }, probe), { timeout: 5000 }).toBe(want);
    const got = await page.evaluate((s) => getComputedStyle(document.querySelector(s)!).backgroundColor, probe);
    console.log('MUT-PROBE ' + probe + ' backgroundColor=' + got);
  }
}
`;

let shot = fs.readFileSync(path.join(pwDir, 'screenshot.spec.ts'), 'utf8');
const n1 = (shot.match(/await padShot\(page,/g) || []).length;
shot = shot.replace(/await padShot\(page,/g, 'await __mut(page); await padShot(page,');
const galleryCall = "await expect(page.locator('.z-p-8').first()).toHaveScreenshot(";
const n2 = shot.split(galleryCall).length - 1;
shot = shot.split(galleryCall).join('await __mut(page); ' + galleryCall);
shot = shot.replace(/(\nconst hoverFocusStates)/, HOOK + '$1');
fs.writeFileSync(path.join(out, 'screenshot.spec.ts'), shot);

let fsSpec = fs.readFileSync(path.join(pwDir, 'focus-ring-scan.spec.ts'), 'utf8');
const tline = "await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });";
if (fsSpec.split(tline).length !== 2) throw new Error('transition line not found exactly once');
fsSpec = fsSpec.replace(tline, tline + '\n      if (process.env.MUT_CSS) await page.addStyleTag({ content: process.env.MUT_CSS });');
// WEB_DIR etc. are resolved from __dirname; point them back at the real spec directory.
fsSpec = fsSpec.replace(/path\.resolve\(__dirname,/g, `path.resolve(${JSON.stringify(pwDir)},`);
fs.writeFileSync(path.join(out, 'focus-ring-scan.spec.ts'), fsSpec);

fs.copyFileSync(path.join(__dirname, 'mut.config.ts'), path.join(out, 'mut.config.ts'));
fs.copyFileSync(path.join(__dirname, 'c3-measure.screenshot.spec.ts'), path.join(out, 'c3-measure.screenshot.spec.ts'));
console.log(`padShot hooks: ${n1}, gallery hooks: ${n2}, out: ${out}`);
