// Scratch config for the Verifier's mutation runs. It imports the REAL playwright.config.ts
// and keeps its chromium / focus-scan projects as-is (so the real 0.05 threshold is what
// applies), changing only: testDir (the scratch spec copies), an absolute snapshotDir
// (the real baselines), updateSnapshots 'none' (never writes a baseline, even a missing one),
// and — only when THRESH is set — the chromium project's toHaveScreenshot threshold.
import { defineConfig } from '@playwright/test';
import base from '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/src/test/playwright/playwright.config';

const thresh = process.env.THRESH ? Number(process.env.THRESH) : undefined;
const projects = (base.projects ?? [])
  .filter((p) => p.name === 'chromium' || p.name === 'focus-scan')
  .map((p) => (p.name === 'chromium' && thresh !== undefined
    ? { ...p, expect: { ...p.expect, toHaveScreenshot: { ...p.expect?.toHaveScreenshot, threshold: thresh } } }
    : p));

export default defineConfig({
  ...base,
  testDir: __dirname,
  snapshotDir: '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/doc/screenshots',
  updateSnapshots: 'none',
  outputDir: __dirname + '/test-results',
  projects,
});
