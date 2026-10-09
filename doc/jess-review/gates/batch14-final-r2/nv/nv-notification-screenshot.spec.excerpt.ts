test.describe('notification', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/notification.zul');
    await page.addStyleTag({ content: ".z-notification-content::before{content:'';display:block;width:4px}" }); // NON-VACUITY INJECTION (batch 14 R2)
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready.then(() => true));
  });

