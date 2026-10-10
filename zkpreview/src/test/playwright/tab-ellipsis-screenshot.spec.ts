import { test, expect } from '@playwright/test';

// A tab label that does not fit a fixed narrow tab must be truncated with an ellipsis
// (Jess review batch 15, follow-up 9). Without `min-width: 0` on .z-tab-content and
// .z-tab-text the label keeps its full width and li.z-tab clips a middle slice.
//
// File name: it ends in `screenshot.spec.ts` on purpose so the `chromium` project
// (whose regex is not anchored) picks it up; this spec takes no screenshots.
test.describe('tab label truncation', () => {
  test('a long label in a narrow tab shrinks to the tab and keeps its ellipsis', async ({ page }) => {
    await page.goto('/tabbox.zul');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready.then(() => true));
    const m = await page.evaluate(() => {
      const tab = document.querySelector('.z-tabbox-top > .z-tabs li.z-tab') as HTMLElement;
      tab.style.width = '60px';
      tab.style.maxWidth = '60px';
      const content = tab.querySelector('.z-tab-content') as HTMLElement;
      const text = tab.querySelector('.z-tab-text') as HTMLElement;
      text.textContent = 'A very long tab label that cannot fit';
      return {
        tabW: tab.getBoundingClientRect().width,
        contentW: content.getBoundingClientRect().width,
        textW: text.getBoundingClientRect().width,
        textScrollW: text.scrollWidth,
        ellipsis: getComputedStyle(text).textOverflow,
        display: getComputedStyle(text).display,
      };
    });
    expect(m.textScrollW, 'the label must really be wider than the tab, else the test is vacuous').toBeGreaterThan(m.tabW);
    expect(m.contentW, '.z-tab-content must not exceed the tab').toBeLessThanOrEqual(m.tabW);
    expect(m.textW, '.z-tab-text must be narrower than its full text so the ellipsis shows').toBeLessThan(m.textScrollW);
    expect(m.ellipsis).toBe('ellipsis');
    // text-overflow does not apply to a flex container: the label must be a block-level box
    // for the ellipsis to be painted (a flex label is hard-clipped, e.g. "A ve").
    expect(m.display, 'a text-only label must not be a flex container, or no ellipsis is drawn').toBe('block');
  });
});
