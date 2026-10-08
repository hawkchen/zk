# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot.spec.ts >> tabbox >> gallery
- Location: src/test/playwright/screenshot.spec.ts:776:7

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  2006 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: tabbox-gallery.png

Call log:
  - Expect "toHaveScreenshot(tabbox-gallery.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pHEG0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 5929 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pHEG0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 3923 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 250ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="pHEG0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - 2006 pixels (ratio 0.01 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Tabbox
  - generic [ref=e5]:
    - generic [ref=e6]: Tabbox — State Gallery
    - generic [ref=e8]:
      - generic [ref=e9]: Tab States
      - generic [ref=e10]:
        - tablist [ref=e11]:
          - tab "Default" [ref=e12] [cursor=pointer]:
            - generic:
              - generic: Default
          - tab "Selected" [selected] [ref=e13] [cursor=pointer]:
            - generic:
              - generic: Selected
          - tab "Disabled" [disabled]:
            - generic:
              - generic: Disabled
        - tabpanel "Selected" [ref=e15]: Selected tab content
  - generic [ref=e16]:
    - generic [ref=e17]: Horizontal with Toolbar
    - generic [ref=e19]:
      - generic [ref=e20]: Closable tabs + toolbar
      - generic [ref=e21]:
        - tablist [ref=e22]:
          - tab "Close Tab1" [selected] [ref=e23] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e25]
              - generic: Tab1
          - tab "Close Tab2" [ref=e26] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e28]
              - generic: Tab2
          - tab "Close Tab3" [ref=e29] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e31]
              - generic: Tab3
          - tab "Close Tab4" [ref=e32] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e34]
              - generic: Tab4
          - tab "Tab5" [ref=e35] [cursor=pointer]:
            - generic:
              - generic: Tab5
        - toolbar [ref=e40]:
          - button "Button 1" [ref=e41] [cursor=pointer]:
            - generic:
              - img
              - text: Button 1
          - button "New" [ref=e42] [cursor=pointer]:
            - generic: New
          - button "Open" [ref=e43] [cursor=pointer]:
            - generic: Open
          - button "Save" [ref=e44] [cursor=pointer]:
            - generic: Save
        - tabpanel "Close Tab1" [ref=e46]: Tabpanel Content 1
  - generic [ref=e47]:
    - generic [ref=e48]: Horizontal with Tab Images
    - generic [ref=e50]:
      - generic [ref=e51]: Tabs with images
      - generic [ref=e52]:
        - tablist [ref=e53]:
          - tab "Close Tab1" [selected] [ref=e54] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e56]
              - generic:
                - img
                - text: Tab1
          - tab "Close Tab2" [ref=e57] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e59]
              - generic:
                - img
                - text: Tab2
          - tab "Close Tab3" [ref=e60] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e62]
              - generic: Tab3
          - tab "Close Tab4" [ref=e63] [cursor=pointer]:
            - generic:
              - button "Close" [ref=e65]
              - generic: Tab4
          - tab "Tab5" [ref=e66] [cursor=pointer]:
            - generic:
              - generic:
                - img
                - text: Tab5
        - tabpanel "Close Tab1" [ref=e68]: Tabpanel Content 1
  - generic [ref=e69]:
    - generic [ref=e70]: Vertical Left
    - generic [ref=e71]:
      - generic [ref=e72]:
        - generic [ref=e73]: Vertical left (many tabs)
        - generic [ref=e74]:
          - tablist [ref=e75]:
            - tab "Close Tab1" [selected] [ref=e76] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e78]
                - generic: Tab1
            - tab "Close Tab2" [ref=e79] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e81]
                - generic: Tab2
            - tab "Close Tab3" [ref=e82] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e84]
                - generic: Tab3
            - tab "Close Tab4" [ref=e85] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e87]
                - generic: Tab4
            - tab "Close Tab5" [ref=e88] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e90]
                - generic: Tab5
            - tab "Tab6" [ref=e91] [cursor=pointer]:
              - generic:
                - generic: Tab6
            - tab "Tab7" [ref=e92] [cursor=pointer]:
              - generic:
                - generic: Tab7
            - tab "Tab8" [ref=e93] [cursor=pointer]:
              - generic:
                - generic: Tab8
            - tab "Tab9" [ref=e94] [cursor=pointer]:
              - generic:
                - generic: Tab9
            - tab "Tab10" [ref=e95] [cursor=pointer]:
              - generic:
                - generic: Tab10
          - tabpanel "Close Tab1" [ref=e97]: Tabpanel Content 1
      - generic [ref=e102]:
        - generic [ref=e103]: Vertical left with image
        - generic [ref=e104]:
          - tablist [ref=e105]:
            - tab "Close Tab1 ZK" [selected] [ref=e106] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e108]
                - generic: Tab1 ZK
            - tab "Close Tab2" [ref=e109] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e111]
                - generic: Tab2
            - tab "Tab3" [ref=e112] [cursor=pointer]:
              - generic:
                - generic:
                  - img
                  - text: Tab3
            - tab "Tab4" [ref=e113] [cursor=pointer]:
              - generic:
                - generic: Tab4
            - tab "Tab5" [ref=e114] [cursor=pointer]:
              - generic:
                - generic: Tab5
          - tabpanel "Close Tab1 ZK" [ref=e116]: Tabpanel Content 1
  - generic [ref=e121]:
    - generic [ref=e122]: Vertical Right
    - generic [ref=e123]:
      - generic [ref=e124]:
        - generic [ref=e125]: Vertical right (many tabs)
        - generic [ref=e126]:
          - tablist [ref=e127]:
            - tab "Close Tab1" [selected] [ref=e128] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e130]
                - generic: Tab1
            - tab "Close Tab2" [ref=e131] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e133]
                - generic: Tab2
            - tab "Close Tab3" [ref=e134] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e136]
                - generic: Tab3
            - tab "Close Tab4" [ref=e137] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e139]
                - generic: Tab4
            - tab "Close Tab5" [ref=e140] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e142]
                - generic: Tab5
            - tab "Tab6" [ref=e143] [cursor=pointer]:
              - generic:
                - generic: Tab6
            - tab "Tab7" [ref=e144] [cursor=pointer]:
              - generic:
                - generic: Tab7
            - tab "Tab8" [ref=e145] [cursor=pointer]:
              - generic:
                - generic: Tab8
            - tab "Tab9" [ref=e146] [cursor=pointer]:
              - generic:
                - generic: Tab9
            - tab "Tab10" [ref=e147] [cursor=pointer]:
              - generic:
                - generic: Tab10
          - tabpanel "Close Tab1" [ref=e149]: Tabpanel Content 1
      - generic [ref=e154]:
        - generic [ref=e155]: Vertical right with image
        - generic [ref=e156]:
          - tablist [ref=e157]:
            - tab "Close Tab1 ZK" [selected] [ref=e158] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e160]
                - generic: Tab1 ZK
            - tab "Close Tab2" [ref=e161] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e163]
                - generic: Tab2
            - tab "Tab3" [ref=e164] [cursor=pointer]:
              - generic:
                - generic:
                  - img
                  - text: Tab3
            - tab "Tab4" [ref=e165] [cursor=pointer]:
              - generic:
                - generic: Tab4
            - tab "Tab5" [ref=e166] [cursor=pointer]:
              - generic:
                - generic: Tab5
          - tabpanel "Close Tab1 ZK" [ref=e168]: Tabpanel Content 1
  - generic [ref=e173]:
    - generic [ref=e174]: Bottom with Toolbar
    - generic [ref=e175]:
      - generic [ref=e176]:
        - generic [ref=e177]: Bottom tabs with toolbar
        - generic [ref=e178]:
          - tabpanel "Close Tab1" [ref=e180]: Tabpanel Content 1
          - tablist [ref=e181]:
            - tab "Close Tab1" [selected] [ref=e182] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e184]
                - generic: Tab1
            - tab "Close Tab2" [ref=e185] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e187]
                - generic: Tab2
            - tab "Close Tab3" [ref=e188] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e190]
                - generic: Tab3
            - tab "Close Tab4" [ref=e191] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e193]
                - generic: Tab4
            - tab "Tab5" [ref=e194] [cursor=pointer]:
              - generic:
                - generic: Tab5
          - toolbar [ref=e195]:
            - button "Button 1" [ref=e196] [cursor=pointer]:
              - generic:
                - img
                - text: Button 1
      - generic [ref=e197]:
        - generic [ref=e198]: Bottom tabs fewer
        - generic [ref=e199]:
          - tabpanel "Close Tab1" [ref=e201]: Tabpanel Content 1
          - tablist [ref=e202]:
            - tab "Close Tab1" [selected] [ref=e203] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e205]
                - generic: Tab1
            - tab "Close Tab2" [ref=e206] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e208]
                - generic: Tab2
            - tab "Tab3" [ref=e209] [cursor=pointer]:
              - generic:
                - generic: Tab3
          - toolbar [ref=e210]:
            - button "Button 1" [ref=e211] [cursor=pointer]:
              - generic:
                - img
                - text: Button 1
  - generic [ref=e212]:
    - generic [ref=e213]: Horizontal — Scroll (many tabs)
    - generic [ref=e214]:
      - generic [ref=e215]:
        - generic [ref=e216]: Horizontal scroll arrows
        - generic [ref=e217]:
          - tablist [ref=e218]:
            - tab "Overview" [selected] [ref=e219] [cursor=pointer]:
              - generic:
                - generic: Overview
            - tab "Account" [ref=e220] [cursor=pointer]:
              - generic:
                - generic: Account
            - tab "Security" [ref=e221] [cursor=pointer]:
              - generic:
                - generic: Security
            - tab "Billing" [ref=e222] [cursor=pointer]:
              - generic:
                - generic: Billing
            - tab "Support" [ref=e223] [cursor=pointer]:
              - generic:
                - generic: Support
            - tab "Privacy" [ref=e224] [cursor=pointer]:
              - generic:
                - generic: Privacy
            - tab "Notifications" [ref=e225] [cursor=pointer]:
              - generic:
                - generic: Notifications
            - tab "Appearance" [ref=e226] [cursor=pointer]:
              - generic:
                - generic: Appearance
            - tab "Advanced" [ref=e227] [cursor=pointer]:
              - generic:
                - generic: Advanced
          - tabpanel "Overview" [ref=e229]
      - generic [ref=e230]:
        - generic [ref=e231]: Scroll arrows + toolbar + closable
        - generic [ref=e232]:
          - tablist [ref=e233]:
            - tab "Close Overview" [selected] [ref=e234] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e236]
                - generic: Overview
            - tab "Close Account" [ref=e237] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e239]
                - generic: Account
            - tab "Close Security" [ref=e240] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e242]
                - generic: Security
            - tab "Close Billing" [ref=e243] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e245]
                - generic: Billing
            - tab "Close Support" [ref=e246] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e248]
                - generic: Support
            - tab "Close Privacy" [ref=e249] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e251]
                - generic: Privacy
            - tab "Close Notifications" [ref=e252] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e254]
                - generic: Notifications
            - tab "Close Appearance" [ref=e255] [cursor=pointer]:
              - generic:
                - button "Close" [ref=e257]
                - generic: Appearance
          - toolbar [ref=e258]:
            - button "Add" [ref=e259] [cursor=pointer]:
              - generic: Add
          - tabpanel "Close Overview" [ref=e261]: Overview
  - generic [ref=e262]:
    - generic [ref=e263]: Icon-only Tabs
    - generic [ref=e264]:
      - generic [ref=e265]:
        - generic [ref=e266]: Icon-only (horizontal)
        - generic [ref=e267]:
          - tablist [ref=e268]:
            - tab [selected] [ref=e269] [cursor=pointer]
            - tab [ref=e270] [cursor=pointer]
            - tab [ref=e271] [cursor=pointer]
            - tab [ref=e272] [cursor=pointer]
            - tab [disabled]
          - tabpanel [ref=e274]: Home
      - generic [ref=e275]:
        - generic [ref=e276]: Icon-only (vertical)
        - generic [ref=e277]:
          - tablist [ref=e278]:
            - tab [selected] [ref=e279] [cursor=pointer]
            - tab [ref=e280] [cursor=pointer]
            - tab [ref=e281] [cursor=pointer]
            - tab [ref=e282] [cursor=pointer]
          - tabpanel [ref=e284]: Home
  - generic [ref=e285]:
    - generic [ref=e286]: Bottom — plain
    - generic [ref=e287]:
      - generic [ref=e288]:
        - generic [ref=e289]: Bottom, no toolbar
        - generic [ref=e290]:
          - tabpanel "Overview" [ref=e292]: Overview content
          - tablist [ref=e293]:
            - tab "Overview" [selected] [ref=e294] [cursor=pointer]:
              - generic:
                - generic: Overview
            - tab "Details" [ref=e295] [cursor=pointer]:
              - generic:
                - generic: Details
            - tab "Activity" [ref=e296] [cursor=pointer]:
              - generic:
                - generic: Activity
      - generic [ref=e297]:
        - generic [ref=e298]: Bottom scroll arrows
        - generic [ref=e299]:
          - tabpanel "Overview" [ref=e301]
          - tablist [ref=e302]:
            - tab "Overview" [selected] [ref=e303] [cursor=pointer]:
              - generic:
                - generic: Overview
            - tab "Account" [ref=e304] [cursor=pointer]:
              - generic:
                - generic: Account
            - tab "Security" [ref=e305] [cursor=pointer]:
              - generic:
                - generic: Security
            - tab "Billing" [ref=e306] [cursor=pointer]:
              - generic:
                - generic: Billing
            - tab "Support" [ref=e307] [cursor=pointer]:
              - generic:
                - generic: Support
            - tab "Privacy" [ref=e308] [cursor=pointer]:
              - generic:
                - generic: Privacy
            - tab "Notifications" [ref=e309] [cursor=pointer]:
              - generic:
                - generic: Notifications
  - generic [ref=e310]:
    - generic [ref=e311]: tabscroll=false
    - generic [ref=e312]:
      - generic [ref=e313]:
        - generic [ref=e314]: Horizontal, tabscroll=false (overflow clips)
        - generic [ref=e315]:
          - tablist [ref=e316]:
            - tab "Overview" [selected] [ref=e317] [cursor=pointer]:
              - generic:
                - generic: Overview
            - tab "Account" [ref=e318] [cursor=pointer]:
              - generic:
                - generic: Account
            - tab "Security" [ref=e319] [cursor=pointer]:
              - generic:
                - generic: Security
            - tab "Billing" [ref=e320] [cursor=pointer]:
              - generic:
                - generic: Billing
            - tab "Support" [ref=e321] [cursor=pointer]:
              - generic:
                - generic: Support
            - tab "Privacy" [ref=e322] [cursor=pointer]:
              - generic:
                - generic: Privacy
            - tab "Notifications" [ref=e323] [cursor=pointer]:
              - generic:
                - generic: Notifications
          - tabpanel "Overview" [ref=e325]
      - generic [ref=e326]:
        - generic [ref=e327]: Vertical, tabscroll=false (overflow clips)
        - generic [ref=e328]:
          - tablist [ref=e329]:
            - tab "Overview" [selected] [ref=e330] [cursor=pointer]:
              - generic:
                - generic: Overview
            - tab "Account" [ref=e331] [cursor=pointer]:
              - generic:
                - generic: Account
            - tab "Security" [ref=e332] [cursor=pointer]:
              - generic:
                - generic: Security
            - tab "Billing" [ref=e333] [cursor=pointer]:
              - generic:
                - generic: Billing
            - tab "Support" [ref=e334] [cursor=pointer]:
              - generic:
                - generic: Support
          - tabpanel "Overview" [ref=e336]
  - generic [ref=e337]:
    - generic [ref=e338]: Accordion Mold
    - generic [ref=e339]:
      - generic [ref=e340]:
        - generic [ref=e341]: Text only (disabled + closable states)
        - generic [ref=e343]:
          - button "Tab1" [expanded] [ref=e344] [cursor=pointer]:
            - generic:
              - generic: Tab1
          - region "Tab1" [ref=e345]: Tabpanel Content 1
          - button "Tab2" [ref=e346] [cursor=pointer]:
            - generic:
              - generic: Tab2
          - button "Tab3" [ref=e347] [cursor=pointer]:
            - generic:
              - generic: Tab3
          - button "Tab4" [disabled]:
            - generic:
              - generic: Tab4
          - button "Tab5" [disabled]:
            - generic:
              - generic: Tab5
      - generic [ref=e348]:
        - generic [ref=e349]: With images (disabled + closable states)
        - generic [ref=e351]:
          - button "Tab1" [expanded] [ref=e352] [cursor=pointer]:
            - generic:
              - generic:
                - img
                - text: Tab1
          - region "Tab1" [ref=e353]: Tabpanel Content 1
          - button "Tab2" [ref=e354] [cursor=pointer]:
            - generic:
              - generic:
                - img
                - text: Tab2
          - button "Tab3" [ref=e355] [cursor=pointer]:
            - generic:
              - generic:
                - img
                - text: Tab3
          - button "Tab4" [disabled]:
            - generic:
              - generic:
                - img
                - text: Tab4
          - button "Tab5" [disabled]:
            - generic:
              - generic:
                - img
                - text: Tab5
```

# Test source

```ts
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
  753 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
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
> 777 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
      |                                                  ^ Error: expect(locator).toHaveScreenshot(expected) failed
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
  854 | // doc/contracts/navbar.md c7.
  855 | test.describe('navbar', () => {
  856 |   test.beforeEach(async ({ page }) => {
  857 |     await page.goto('/navbar.zul');
  858 |     await page.waitForLoadState('networkidle');
  859 |     await page.evaluate(() => document.fonts.ready.then(() => true));
  860 |   });
  861 | 
  862 |   test('selected item is a rounded tonal container with no left accent', async ({ page }) => {
  863 |     // Select the first item in the expanded vertical navbar via a real click.
  864 |     await page.locator('.z-navbar-vertical .z-navitem-content').first().click();
  865 |     const selected = page.locator('.z-navbar-vertical .z-navitem-selected > .z-navitem-content').first();
  866 |     await selected.waitFor({ state: 'visible' });
  867 | 
  868 |     const m = await selected.evaluate((el) => {
  869 |       // Handles rgb/rgba AND the slash-alpha form Chrome uses for color-mix()
  870 |       // results (e.g. `oklab(L a b / 0.12)`, `color(srgb r g b / 0.12)`).
  871 |       const alphaOf = (s: string) => {
  872 |         if (!s || s === 'transparent') return 0;
  873 |         const slash = s.match(/\/\s*([\d.]+)\s*\)/);
  874 |         if (slash) return parseFloat(slash[1]);
  875 |         const mm = s.match(/rgba?\(([^)]+)\)/);
  876 |         if (!mm) return 1; // opaque named/hex-resolved colour
  877 |         const p = mm[1].split(',').map((x) => x.trim());
```