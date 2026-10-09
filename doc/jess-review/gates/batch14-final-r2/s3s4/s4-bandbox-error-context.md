# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: listhead-bar-screenshot.spec.ts >> listhead scrollbar column >> bandbox.zul bandpopup listbox: bar cell matches sibling header
- Location: src/test/playwright/listhead-bar-screenshot.spec.ts:46:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('div:has(> label:text-is("Listbox in bandpopup"))').locator('.z-bandbox-button')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Bandbox
  - generic [ref=e5]:
    - generic [ref=e6]: States
    - generic [ref=e7]:
      - generic [ref=e8]: Default
      - generic [ref=e9]: Disabled
      - generic [ref=e10]: Readonly
      - generic [ref=e11]: Invalid
      - generic [ref=e12]: Inplace
    - generic [ref=e13]:
      - generic [ref=e14]: Default
      - combobox [ref=e16]:
        - textbox [ref=e17]
        - button [ref=e18] [cursor=pointer]
      - generic [ref=e20]:
        - combobox:
          - textbox [disabled]
          - button
      - combobox [ref=e22]:
        - textbox [ref=e23] [cursor=pointer]
        - button [ref=e24] [cursor=pointer]
      - combobox [ref=e27]:
        - textbox [ref=e28]
        - button [ref=e29] [cursor=pointer]
      - combobox [ref=e32]:
        - textbox [ref=e33]: Selected
    - generic [ref=e34]:
      - generic [ref=e35]: No button
      - combobox [ref=e37]:
        - textbox [ref=e38]
      - generic [ref=e39]:
        - combobox:
          - textbox [disabled]
      - combobox [ref=e41]:
        - textbox [ref=e42] [cursor=pointer]
      - combobox [ref=e44]:
        - textbox [ref=e45]
      - combobox [ref=e47]:
        - textbox [ref=e48]: Selected
  - generic [ref=e49]:
    - generic [ref=e50]: Bandpopup with Rich Content (Listbox)
    - generic [ref=e52]:
      - generic [ref=e53]: Listbox in bandpopup
      - combobox [ref=e54]:
        - textbox [ref=e55]
        - button [ref=e56] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect, Page } from '@playwright/test';
  2  | 
  3  | // Scrollbar-column header cell (`th.z-listhead-bar`, Jess review batch 14 S4).
  4  | //
  5  | // ZK adds one extra header cell above a listbox's vertical scrollbar. It must be
  6  | // painted like every other header cell, not as a tinted bar. The cell has width 0
  7  | // unless a classic (non-overlay) scrollbar takes space, and headless Chromium hides
  8  | // scrollbars by default — so this spec launches with scrollbars shown, and asserts
  9  | // the column's width > 0 first so it can never pass vacuously.
  10 | //
  11 | // File name: it ends in `screenshot.spec.ts` on purpose. playwright.config.ts maps
  12 | // only /screenshot\.spec\.ts/ to the `chromium` project, and that regex is not
  13 | // anchored; this spec takes no screenshots.
  14 | test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });
  15 | 
  16 | test.describe('listhead scrollbar column', () => {
  17 |   // Compare the bar cell with the first ordinary header cell of the same header row.
  18 |   async function barVsHeader(page: Page, listbox: ReturnType<Page['locator']>) {
  19 |     return listbox.evaluate((lb) => {
  20 |       const bar = lb.querySelector('th.z-listhead-bar') as HTMLElement;
  21 |       const sibling = lb.querySelector('th.z-listheader') as HTMLElement;
  22 |       return {
  23 |         barWidth: bar.getBoundingClientRect().width,
  24 |         barBg: getComputedStyle(bar).backgroundColor,
  25 |         siblingBg: getComputedStyle(sibling).backgroundColor,
  26 |       };
  27 |     });
  28 |   }
  29 | 
  30 |   test('listbox-header.zul scrolling listbox: bar cell matches sibling header', async ({ page }) => {
  31 |     await page.goto('/listbox-header.zul');
  32 |     await page.waitForLoadState('networkidle');
  33 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  34 |     // Pick the first listbox whose body really shows a vertical scrollbar.
  35 |     const idx = await page.evaluate(() =>
  36 |       Array.from(document.querySelectorAll('.z-listbox')).findIndex((lb) => {
  37 |         const body = lb.querySelector('.z-listbox-body') as HTMLElement | null;
  38 |         return !!body && body.offsetWidth > body.clientWidth;
  39 |       }));
  40 |     expect(idx, 'a listbox with a vertical scrollbar must exist on listbox-header.zul').toBeGreaterThanOrEqual(0);
  41 |     const m = await barVsHeader(page, page.locator('.z-listbox').nth(idx));
  42 |     expect(m.barWidth, 'scrollbar column must exist (width > 0), else the test is vacuous').toBeGreaterThan(0);
  43 |     expect(m.barBg, 'th.z-listhead-bar background must equal a sibling header cell').toBe(m.siblingBg);
  44 |   });
  45 | 
  46 |   test('bandbox.zul bandpopup listbox: bar cell matches sibling header', async ({ page }) => {
  47 |     await page.goto('/bandbox.zul');
  48 |     await page.waitForLoadState('networkidle');
  49 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  50 |     const example = page.locator('div:has(> label:text-is("Listbox in bandpopup"))');
> 51 |     await example.locator('.z-bandbox-button').click();
     |                                                ^ Error: locator.click: Test timeout of 30000ms exceeded.
  52 |     const listbox = page.locator('.z-bandpopup .z-listbox:visible');
  53 |     await expect(listbox).toBeVisible();
  54 |     const m = await barVsHeader(page, listbox);
  55 |     expect(m.barWidth, 'scrollbar column must exist (width > 0), else the test is vacuous').toBeGreaterThan(0);
  56 |     expect(m.barBg, 'th.z-listhead-bar background must equal a sibling header cell').toBe(m.siblingBg);
  57 |   });
  58 | });
  59 | 
```