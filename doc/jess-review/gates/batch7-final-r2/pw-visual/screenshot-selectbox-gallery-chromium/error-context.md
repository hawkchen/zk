# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot.spec.ts >> selectbox >> gallery
- Location: src/test/playwright/screenshot.spec.ts:752:7

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  64 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: selectbox-gallery.png

Call log:
  - Expect "toHaveScreenshot(selectbox-gallery.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pLzI0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 64 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pLzI0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - 64 pixels (ratio 0.01 of all image pixels) are different.

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
  653 | // -------------------------------------------------------
  654 | // TimePicker
  655 | // -------------------------------------------------------
  656 | test.describe('timepicker', () => {
  657 |   test.beforeEach(async ({ page }) => {
  658 |     await page.goto('/timepicker.zul');
  659 |     await page.waitForLoadState('networkidle');
  660 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  661 |   });
  662 | 
  663 |   // gap 2026-07-20 (similar-case sweep of the datebox/timebox content-fit fix):
  664 |   // timepicker is a fixed-format, readonly time field but ZK hardcodes the input at
  665 |   // size="5" (fits HH:mm only). Under the old `flex:1;min-width:0` with no field-sizing,
  666 |   // an HH:mm:ss value ("10:30:00") CLIPS (scrollWidth > clientWidth) whenever the root
  667 |   // isn't given an explicit width. pv/timepicker-content.zul renders its timepickers at
  668 |   // content width (no forced width="160px"), so every seeded HH:mm:ss cell is a live clip
  669 |   // target. Fix mirrors timebox: field-sizing:content lets the input hug/grow to its time.
  670 |   // Readonly (value picked from popup, not typed) → no per-keystroke jitter. RED before
  671 |   // the fix (seeded cells clipped), GREEN after. Order-independent: no seeded input may
  672 |   // clip, and all must report field-sizing:content.
  673 |   test('input hugs its time content (field-sizing, no clip)', async ({ page }) => {
  674 |     const info = await page.evaluate(() => {
  675 |       const seeded = ([...document.querySelectorAll('.z-timepicker-input')] as HTMLInputElement[])
  676 |         .filter(i => i.value && (i as HTMLElement).offsetParent !== null);
  677 |       return {
  678 |         count: seeded.length,
  679 |         allContentSized: seeded.every(i => getComputedStyle(i).getPropertyValue('field-sizing') === 'content'),
  680 |         clippedValues: seeded.filter(i => i.scrollWidth > i.clientWidth + 1).map(i => i.value),
  681 |       };
  682 |     });
  683 |     expect(info.count, 'at least one seeded timepicker must be present').toBeGreaterThan(0);
  684 |     expect(info.allContentSized, 'field-sizing: content must be applied to timepicker inputs').toBe(true);
  685 |     expect(info.clippedValues, `timepicker times must not be clipped, clipped: ${JSON.stringify(info.clippedValues)}`).toEqual([]);
  686 |   });
  687 | });
  688 | 
  689 | // -------------------------------------------------------
  690 | // Spinner
  691 | // -------------------------------------------------------
  692 | test.describe('spinner', () => {
  693 |   const DIR = 'spinner';
  694 |   test.beforeEach(async ({ page }) => {
  695 |     await page.goto('/spinner.zul');
  696 |     await page.waitForLoadState('networkidle');
  697 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  698 |   });
  699 | 
  700 |   test('gallery', async ({ page }) => {
  701 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  702 |   });
  703 | 
  704 |   for (const { name, action } of hoverFocusStates) {
  705 |     test(name, async ({ page }) => {
  706 |       // Action on the inner input, capture the wrapper — the border/ring lives
  707 |       // on .z-spinner, not the transparent .z-spinner-input. (See bandbox note.)
  708 |       await action(page.locator('.z-spinner-input').first());
  709 |       await padShot(page, page.locator('.z-spinner').first(), `${DIR}-${name}.png`);
  710 |     });
  711 |   }
  712 | });
  713 | 
  714 | // -------------------------------------------------------
  715 | // Bandbox
  716 | // -------------------------------------------------------
  717 | test.describe('bandbox', () => {
  718 |   const DIR = 'bandbox';
  719 |   test.beforeEach(async ({ page }) => {
  720 |     await page.goto('/bandbox.zul');
  721 |     await page.waitForLoadState('networkidle');
  722 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  723 |   });
  724 | 
  725 |   test('gallery', async ({ page }) => {
  726 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  727 |   });
  728 | 
  729 |   for (const { name, action } of hoverFocusStates) {
  730 |     test(name, async ({ page }) => {
  731 |       // Focus/hover the inner <input> (the focusable node), but capture the
  732 |       // bordered WRAPPER: the hover border-color and the :focus-within ring are
  733 |       // painted on .z-bandbox, while .z-bandbox-input is transparent/borderless.
  734 |       // Capturing the input would clip away the very effect under test.
  735 |       await action(page.locator('.z-bandbox-input').first());
  736 |       await padShot(page, page.locator('.z-bandbox').first(), `${DIR}-${name}.png`);
  737 |     });
  738 |   }
  739 | });
  740 | 
  741 | // -------------------------------------------------------
  742 | // Selectbox
  743 | // -------------------------------------------------------
  744 | test.describe('selectbox', () => {
  745 |   const DIR = 'selectbox';
  746 |   test.beforeEach(async ({ page }) => {
  747 |     await page.goto('/selectbox.zul');
  748 |     await page.waitForLoadState('networkidle');
  749 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  750 |   });
  751 | 
  752 |   test('gallery', async ({ page }) => {
> 753 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
      |                                                  ^ Error: expect(locator).toHaveScreenshot(expected) failed
  754 |   });
  755 | 
  756 |   for (const { name, action } of hoverFocusStates) {
  757 |     test(name, async ({ page }) => {
  758 |       const el = page.locator('.z-selectbox').first();
  759 |       await action(el);
  760 |       await padShot(page, el, `${DIR}-${name}.png`);
  761 |     });
  762 |   }
  763 | });
  764 | 
  765 | // -------------------------------------------------------
  766 | // Tabbox
  767 | // -------------------------------------------------------
  768 | test.describe('tabbox', () => {
  769 |   const DIR = 'tabbox';
  770 |   test.beforeEach(async ({ page }) => {
  771 |     await page.goto('/tabbox.zul');
  772 |     await page.waitForLoadState('networkidle');
  773 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  774 |   });
  775 | 
  776 |   test('gallery', async ({ page }) => {
  777 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  778 |   });
  779 | 
  780 |   test('hover', async ({ page }) => {
  781 |     const el = page.locator('.z-tab').first();
  782 |     await el.hover();
  783 |     await expect(el).toHaveScreenshot(`${DIR}-hover.png`);
  784 |   });
  785 | });
  786 | 
  787 | // -------------------------------------------------------
  788 | // Tree
  789 | // -------------------------------------------------------
  790 | test.describe('tree', () => {
  791 |   const DIR = 'tree';
  792 |   test.beforeEach(async ({ page }) => {
  793 |     await page.goto('/tree.zul');
  794 |     await page.waitForLoadState('networkidle');
  795 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  796 |   });
  797 | 
  798 |   test('gallery', async ({ page }) => {
  799 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  800 |   });
  801 | 
  802 |   test('hover', async ({ page }) => {
  803 |     const el = page.locator('.z-treerow').first();
  804 |     await el.hover();
  805 |     await expect(el).toHaveScreenshot(`${DIR}-hover.png`);
  806 |   });
  807 | });
  808 | 
  809 | // -------------------------------------------------------
  810 | // Window
  811 | // -------------------------------------------------------
  812 | test.describe('window', () => {
  813 |   const DIR = 'window';
  814 |   test.beforeEach(async ({ page }) => {
  815 |     await page.goto('/window.zul');
  816 |     await page.waitForLoadState('networkidle');
  817 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  818 |   });
  819 | 
  820 |   test('gallery', async ({ page }) => {
  821 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  822 |   });
  823 | });
  824 | 
  825 | // -------------------------------------------------------
  826 | // Panel
  827 | // -------------------------------------------------------
  828 | test.describe('panel', () => {
  829 |   const DIR = 'panel';
  830 |   test.beforeEach(async ({ page }) => {
  831 |     await page.goto('/panel.zul');
  832 |     await page.waitForLoadState('networkidle');
  833 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  834 |   });
  835 | 
  836 |   test('gallery', async ({ page }) => {
  837 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
  838 |   });
  839 | });
  840 | 
  841 | // -------------------------------------------------------
  842 | // Navbar — selected item is a rounded tonal container, NO left accent
  843 | // -------------------------------------------------------
  844 | // The selected navitem's active marker is the rounded tonal CONTAINER alone
  845 | // (12% primary tint fill + primary text + weight 600) — MD3 Navigation Drawer /
  846 | // MUI ListItemButton. There is NO left-edge accent: an earlier iteration added a
  847 | // left bar (first a radius-clipped `border-left` arc, then a straight `::after`
  848 | // strip), but stacking a classic-sidebar bar on the MD3 pill is redundant and
  849 | // clashes at the corners, so the bar was dropped (design review 2026-07-07). This
  850 | // guards against either accent re-appearing. NB: the `.z-listitem` "blue left
  851 | // line" is a *focus* indicator (`box-shadow: inset 3px 0 0`), a different
  852 | // component/state — not this. Gallery breadth is owned by gallery-scan.spec.ts
  853 | // (the static gallery has no selected item). See doc/skill-gaps.md 2026-07-07 and
```