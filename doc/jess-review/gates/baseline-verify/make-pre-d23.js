#!/usr/bin/env node
// B3: rebuild the pre-D23 focus-ring-scan.spec.ts (HEAD + the organigram transition fix, i.e. the
// state baseline-regen-gen.md measured) into <scratchDir>/pre-d23/, with the same scratch config,
// so navbar / paging / organigram can be run before-vs-after D23 side by side.
// Usage: node make-pre-d23.js <scratchDir>   (run make-mut.js first; it provides mut.config.ts)
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const repo = path.resolve(__dirname, '../../../..');
const pwDir = path.join(repo, 'zkpreview/src/test/playwright');
const out = path.join(path.resolve(process.argv[2]), 'pre-d23');
fs.mkdirSync(out, { recursive: true });
const nm = path.join(out, 'node_modules');
if (!fs.existsSync(nm)) fs.symlinkSync(path.join(repo, 'zkpreview/node_modules'), nm);

let spec = execFileSync('git', ['-C', repo, 'show', 'HEAD:zkpreview/src/test/playwright/focus-ring-scan.spec.ts'], { encoding: 'utf8' });
const anchor = "      await page.evaluate(() => document.fonts.ready.then(() => true));\n\n      const ok = await page.evaluate((f) => {";
if (spec.split(anchor).length !== 2) throw new Error('anchor not found exactly once');
spec = spec.replace(anchor, "      await page.evaluate(() => document.fonts.ready.then(() => true));\n\n" +
  "      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });\n\n" +
  "      const ok = await page.evaluate((f) => {");
spec = spec.replace(/path\.resolve\(__dirname,/g, `path.resolve(${JSON.stringify(pwDir)},`);
fs.writeFileSync(path.join(out, 'focus-ring-scan.spec.ts'), spec);
fs.copyFileSync(path.join(__dirname, 'mut.config.ts'), path.join(out, 'mut.config.ts'));
console.log('pre-d23 spec written to ' + out);
