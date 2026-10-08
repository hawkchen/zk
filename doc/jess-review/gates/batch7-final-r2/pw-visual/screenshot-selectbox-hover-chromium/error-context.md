# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot.spec.ts >> selectbox >> hover
- Location: src/test/playwright/screenshot.spec.ts:757:9

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  22 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: selectbox-hover.png

Call log:
  - Expect "toHaveScreenshot(selectbox-hover.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 22 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 22 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Selectbox
  - generic [ref=e5]:
    - generic [ref=e6]: States
    - generic [ref=e7]:
      - generic [ref=e8]: Default
      - generic [ref=e9]: Disabled
    - generic [ref=e10]:
      - generic [ref=e11]: Default
      - combobox [ref=e13] [cursor=pointer]:
        - option "Alice"
        - option "Bob" [selected]
        - option "Charlie"
        - option "David"
        - option "Eve"
      - generic [ref=e14]:
        - combobox [disabled]:
          - option "Alice"
          - option "Bob" [selected]
          - option "Charlie"
          - option "David"
          - option "Eve"
  - generic [ref=e15]:
    - generic [ref=e16]: Pre-selected Value
    - generic [ref=e18]:
      - generic [ref=e19]: selectedIndex="2" (shows "Charlie" on load)
      - combobox [ref=e20] [cursor=pointer]:
        - option "Alice"
        - option "Bob" [selected]
        - option "Charlie"
        - option "David"
        - option "Eve"
```

# Test source

```ts
  1   | import { test, expect, Locator, Page } from '@playwright/test';
  2   | 
  3   | type DynamicState = { name: string; action: (loc: Locator) => Promise<void> };
  4   | 
  5   | const hoverFocusStates: DynamicState[] = [
  6   |   { name: 'hover',  action: loc => loc.hover() },
  7   |   { name: 'focus',  action: loc => loc.focus() },
  8   | ];
  9   | 
  10  | // Breathing room (px) added around a captured control so the hover border /
  11  | // focus ring isn't flush against the image edge and is easy to eyeball.
  12  | const PAD = 12;
  13  | 
  14  | // Capture `target` with a `PAD`-px margin on every side, instead of the element's
  15  | // exact bounding box. Many controls paint their hover/focus affordance (border
  16  | // colour, inset ring, state-layer glow) right at — or just outside — their edge,
  17  | // so an edge-tight element screenshot clips it. We screenshot the PAGE with a
  18  | // clip expanded around the element's box (clamped to the page top-left).
  19  | async function padShot(page: Page, target: Locator, name: string | string[]) {
  20  |   await target.scrollIntoViewIfNeeded();
  21  |   const box = await target.boundingBox();
  22  |   if (!box) throw new Error(`padShot: no bounding box for "${name}"`);
  23  |   const x = Math.max(0, box.x - PAD);
  24  |   const y = Math.max(0, box.y - PAD);
> 25  |   await expect(page).toHaveScreenshot(name, {
      |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  26  |     clip: { x, y, width: box.x + box.width + PAD - x, height: box.y + box.height + PAD - y },
  27  |     animations: 'disabled',
  28  |     // Absolute floor for anti-aliasing flicker. These crops are small (a selectbox
  29  |     // focus shot is 144x64) and high-contrast at the ring's edge, so a 1-2px AA
  30  |     // flicker that no eye can see turns the shot red run to run (chat D80; the
  31  |     // selectbox focus shot differed by 2px — doc/screenshot-tolerance-policy.md). An absolute
  32  |     // count, not maxDiffPixelRatio: 1% of ~9000px would be 92px — enough to hide a
  33  |     // whole mis-rendered ring segment. The gallery/tablet projects keep their own
  34  |     // ratio-based policy; this applies to state shots only.
  35  |     maxDiffPixels: 20,
  36  |   });
  37  | }
  38  | 
  39  | const buttonDynamicStates: DynamicState[] = [
  40  |   ...hoverFocusStates,
  41  |   { name: 'active', action: async loc => {
  42  |       await loc.hover();
  43  |       await loc.page().mouse.down();
  44  |     }
  45  |   },
  46  | ];
  47  | 
  48  | // Every preview page is a single `.z-p-8` wrapper laying its demos out with
  49  | // generic utilities (the state matrix uses `.z-grid-cols-auto` + `.z-d-contents`
  50  | // rows; there are no `.pv-*` wrappers any more). So:
  51  | //  - "gallery" shot captures the whole `.z-p-8`.
  52  | //  - dynamic-state shots target a bare framework class (`.z-textbox`, `.z-row`,
  53  | //    `.z-tab`, `.z-listitem`, …) — the first instance on the page.
  54  | 
  55  | // -------------------------------------------------------
  56  | // Button
  57  | // -------------------------------------------------------
  58  | test.describe('button', () => {
  59  |   const DIR = 'button';
  60  |   test.beforeEach(async ({ page }) => {
  61  |     await page.goto('/button.zul');
  62  |     await page.waitForLoadState('networkidle');
  63  |     await page.evaluate(() => document.fonts.ready.then(() => true));
  64  |   });
  65  | 
  66  |   test('gallery', async ({ page }) => {
  67  |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  68  |   });
  69  | 
  70  |   const variants = [
  71  |     { label: 'default',  selector: '.z-button' },
  72  |     { label: 'outlined', selector: '.z-button-outlined' },
  73  |   ];
  74  | 
  75  |   for (const { label, selector } of variants) {
  76  |     for (const { name, action } of buttonDynamicStates) {
  77  |       test(`${label}-${name}`, async ({ page }) => {
  78  |         const el = page.locator(selector).first();
  79  |         await action(el);
  80  |         // padShot (element + PAD margin), not an edge-tight element shot: the
  81  |         // filled-button hover raises box-shadow: elevation-2, which paints
  82  |         // OUTSIDE the element box and an element-clipped capture would drop it.
  83  |         // Matches how every other stateful component captures its states.
  84  |         await padShot(page, el, `${DIR}-${label}-${name}.png`);
  85  |         if (name === 'active') await page.mouse.up();
  86  |       });
  87  |     }
  88  |   }
  89  | 
  90  |   // c15-c19: contained color-variant disabled buttons must use disabled-container bg
  91  |   // --zk-color-disabled-container = rgba(0,0,0,0.12), alpha ≈ 0.12 (variant colors are opaque)
  92  |   test('color-variant-disabled-state', async ({ page }) => {
  93  |     const containedVariants = ['secondary', 'success', 'warning', 'error', 'info'];
  94  |     for (const variant of containedVariants) {
  95  |       const alpha = await page.evaluate((cls) => {
  96  |         const el = document.querySelector(`.z-button-${cls}[disabled]`);
  97  |         if (!el) throw new Error(`No disabled .z-button-${cls} found`);
  98  |         const bg = getComputedStyle(el).backgroundColor;
  99  |         const m = bg.match(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
  100 |         return m ? parseFloat(m[1]) : 1.0; // no alpha → opaque
  101 |       }, variant);
  102 |       expect(alpha, `${variant} disabled button bg should be semi-transparent (disabled-container), not opaque`).toBeLessThanOrEqual(0.2);
  103 |     }
  104 | 
  105 |     // c20-c25: outlined color-variant disabled buttons must use disabled text/border colors
  106 |     // --zk-color-disabled = rgba(0,0,0,0.38), alpha ≈ 0.38 (variant colors are opaque)
  107 |     const outlinedVariants = ['secondary', 'success', 'warning', 'error', 'info'];
  108 |     for (const variant of outlinedVariants) {
  109 |       const alpha = await page.evaluate((cls) => {
  110 |         const el = document.querySelector(`.z-button-outlined-${cls}[disabled]`);
  111 |         if (!el) throw new Error(`No disabled .z-button-outlined-${cls} found`);
  112 |         const color = getComputedStyle(el).color;
  113 |         const m = color.match(/rgba\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+\s*,\s*([\d.]+)\s*\)/);
  114 |         return m ? parseFloat(m[1]) : 1.0;
  115 |       }, variant);
  116 |       expect(alpha, `outlined-${variant} disabled button color should be semi-transparent (disabled), not opaque`).toBeLessThanOrEqual(0.5);
  117 |     }
  118 | 
  119 |     // c26-c28: text color-variant disabled buttons must use disabled text color
  120 |     const textVariants = ['secondary', 'error', 'info'];
  121 |     for (const variant of textVariants) {
  122 |       const alpha = await page.evaluate((cls) => {
  123 |         const el = document.querySelector(`.z-button-text-${cls}[disabled]`);
  124 |         if (!el) throw new Error(`No disabled .z-button-text-${cls} found`);
  125 |         const color = getComputedStyle(el).color;
```