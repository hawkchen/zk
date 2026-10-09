import { defineConfig, devices } from '@playwright/test';
// Non-vacuity harness for batch 14 R2 (S3/S4): runs scratchpad COPIES of the repo specs with a CSS injection.
export default defineConfig({
  testDir: '.',
  snapshotDir: '/Users/hawk/Documents/workspace/ZK10/zk/zkpreview/doc/screenshots',
  snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
  use: { baseURL: process.env.PREVIEW_URL ?? 'http://localhost:8085', ...devices['Desktop Chrome'] },
  projects: [{ name: 'chromium', testMatch: /screenshot\.spec\.ts/, expect: { toHaveScreenshot: { threshold: 0.05 } }, use: { ...devices['Desktop Chrome'] } }],
});
