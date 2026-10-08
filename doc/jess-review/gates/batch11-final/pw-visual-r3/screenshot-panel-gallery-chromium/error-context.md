# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: screenshot.spec.ts >> panel >> gallery
- Location: src/test/playwright/screenshot.spec.ts:836:7

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  Expected an image 1280px by 2241px, received 1280px by 2245px. 47637 pixels (ratio 0.02 of all image pixels) are different.

  Snapshot: panel-gallery.png

Call log:
  - Expect "toHaveScreenshot(panel-gallery.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="wDcU0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - Expected an image 1280px by 2241px, received 1280px by 2245px. 47637 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="wDcU0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - Expected an image 1280px by 2241px, received 1280px by 2245px. 47637 pixels (ratio 0.02 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Panel
  - generic [ref=e5]:
    - generic [ref=e6]: Panel — State Gallery
    - generic [ref=e8]:
      - generic [ref=e9]: Default
      - generic [ref=e10]:
        - generic [ref=e12]: Panel
        - generic [ref=e14]: Content
  - generic [ref=e15]:
    - generic [ref=e16]: Rounded Border — Full Controls
    - generic [ref=e17]:
      - generic [ref=e18]:
        - generic [ref=e19]: border="rounded"
        - generic [ref=e20]:
          - generic [ref=e22]:
            - text: Panel (rounded)
            - generic [ref=e23]:
              - button "Collapse" [ref=e24] [cursor=pointer]
              - button "Minimize" [ref=e26] [cursor=pointer]
              - button "Maximize" [ref=e28] [cursor=pointer]
              - button "Close" [ref=e30] [cursor=pointer]
          - generic [ref=e32]:
            - toolbar [ref=e34]:
              - table [ref=e35]:
                - rowgroup [ref=e36]:
                  - row "Toolbar" [ref=e37]:
                    - cell "Toolbar" [ref=e38]
            - generic [ref=e39]: Panel Content
            - toolbar [ref=e41]:
              - table [ref=e42]:
                - rowgroup [ref=e43]:
                  - row "Footer Toolbar" [ref=e44]:
                    - cell "Footer Toolbar" [ref=e45]
      - generic [ref=e46]:
        - generic [ref=e47]: border="normal"
        - generic [ref=e48]:
          - generic [ref=e50]:
            - text: Panel (normal)
            - generic [ref=e51]:
              - button "Collapse" [ref=e52] [cursor=pointer]
              - button "Minimize" [ref=e54] [cursor=pointer]
              - button "Maximize" [ref=e56] [cursor=pointer]
              - button "Close" [ref=e58] [cursor=pointer]
          - generic [ref=e60]:
            - toolbar [ref=e62]:
              - table [ref=e63]:
                - rowgroup [ref=e64]:
                  - row "Toolbar" [ref=e65]:
                    - cell "Toolbar" [ref=e66]
            - generic [ref=e67]: Panel Content
            - toolbar [ref=e69]:
              - table [ref=e70]:
                - rowgroup [ref=e71]:
                  - row "Footer Toolbar" [ref=e72]:
                    - cell "Footer Toolbar" [ref=e73]
  - generic [ref=e74]:
    - generic [ref=e75]: No Border — Full Controls
    - generic [ref=e77]:
      - generic [ref=e78]: No border, with title
      - generic [ref=e79]:
        - generic [ref=e81]:
          - text: Panel (no border)
          - generic [ref=e82]:
            - button "Collapse" [ref=e83] [cursor=pointer]
            - button "Minimize" [ref=e85] [cursor=pointer]
            - button "Maximize" [ref=e87] [cursor=pointer]
            - button "Close" [ref=e89] [cursor=pointer]
        - generic [ref=e91]:
          - toolbar [ref=e93]:
            - table [ref=e94]:
              - rowgroup [ref=e95]:
                - row "Toolbar" [ref=e96]:
                  - cell "Toolbar" [ref=e97]
          - generic [ref=e98]: Panel Content
          - toolbar [ref=e100]:
            - table [ref=e101]:
              - rowgroup [ref=e102]:
                - row "Footer Toolbar" [ref=e103]:
                  - cell "Footer Toolbar" [ref=e104]
  - generic [ref=e105]:
    - generic [ref=e106]: Without Toolbar
    - generic [ref=e107]:
      - generic [ref=e108]:
        - generic [ref=e109]: border="rounded"
        - generic [ref=e110]:
          - generic [ref=e112]:
            - text: Panel (rounded)
            - generic [ref=e113]:
              - button "Collapse" [ref=e114] [cursor=pointer]
              - button "Minimize" [ref=e116] [cursor=pointer]
              - button "Maximize" [ref=e118] [cursor=pointer]
              - button "Close" [ref=e120] [cursor=pointer]
          - generic [ref=e123]: Panel Content
      - generic [ref=e124]:
        - generic [ref=e125]: border="normal"
        - generic [ref=e126]:
          - generic [ref=e128]:
            - text: Panel (normal)
            - generic [ref=e129]:
              - button "Collapse" [ref=e130] [cursor=pointer]
              - button "Minimize" [ref=e132] [cursor=pointer]
              - button "Maximize" [ref=e134] [cursor=pointer]
              - button "Close" [ref=e136] [cursor=pointer]
          - generic [ref=e139]: Panel Content
      - generic [ref=e140]:
        - generic [ref=e141]: No border, with title
        - generic [ref=e142]:
          - generic [ref=e144]:
            - text: Panel (no border)
            - generic [ref=e145]:
              - button "Collapse" [ref=e146] [cursor=pointer]
              - button "Minimize" [ref=e148] [cursor=pointer]
              - button "Maximize" [ref=e150] [cursor=pointer]
              - button "Close" [ref=e152] [cursor=pointer]
          - generic [ref=e155]: Panel Content
      - generic [ref=e156]:
        - generic [ref=e157]: No title, rounded
        - generic [ref=e160]: Panel Content (no title)
      - generic [ref=e161]:
        - generic [ref=e162]: No title, normal
        - generic [ref=e165]: Panel Content (no title)
      - generic [ref=e166]:
        - generic [ref=e167]: No title, no border
        - generic [ref=e170]: Panel Content (no title)
  - generic [ref=e171]:
    - generic [ref=e172]: Overflow / Scroll
    - generic [ref=e174]:
      - generic [ref=e176]: Panel with Overflow Content
      - generic [ref=e178]: The Panel component in ZK is a versatile container that serves as a foundational building block for application-oriented user interfaces. It offers a variety of structural components such as top, bottom, and foot toolbars, along with distinct header, footer, and body sections.
  - generic [ref=e179]:
    - generic [ref=e180]: Collapsed State
    - generic [ref=e181]:
      - generic [ref=e182]:
        - generic [ref=e183]: collapsed (open="false")
        - generic [ref=e186]:
          - text: Collapsed Panel
          - button "Expand" [ref=e188] [cursor=pointer]
      - generic [ref=e190]:
        - generic [ref=e191]: expanded (open="true")
        - generic [ref=e192]:
          - generic [ref=e194]:
            - text: Expanded Panel
            - button "Collapse" [ref=e196] [cursor=pointer]
          - generic [ref=e199]: Panel Content
```

# Test source

```ts
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
> 837 |     await expect(page.locator('.z-p-8').first()).toHaveScreenshot(`${DIR}-gallery.png`);
      |                                                  ^ Error: expect(locator).toHaveScreenshot(expected) failed
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
  878 |         return p.length === 4 ? parseFloat(p[3]) : 1;
  879 |       };
  880 |       const cs = getComputedStyle(el);
  881 |       const after = getComputedStyle(el, '::after');
  882 |       return {
  883 |         borderTopLeftRadius: parseFloat(cs.borderTopLeftRadius) || 0,
  884 |         bgAlpha: alphaOf(cs.backgroundColor),
  885 |         borderLeftWidth: parseFloat(cs.borderLeftWidth) || 0,
  886 |         borderLeftAlpha: alphaOf(cs.borderLeftColor),
  887 |         afterContent: after.content,
  888 |         afterWidth: parseFloat(after.width) || 0,
  889 |       };
  890 |     });
  891 | 
  892 |     // Active marker = the rounded tonal container: a rounded corner + a visible
  893 |     // tint fill. Both must be present.
  894 |     expect(m.borderTopLeftRadius, 'selected item must be a rounded container').toBeGreaterThan(0);
  895 |     expect(m.bgAlpha, 'selected item must carry the tonal tint fill').toBeGreaterThan(0);
  896 |     // NO left accent of any kind. (a) not a coloured border-left…
  897 |     const borderAccent = m.borderLeftWidth > 0 && m.borderLeftAlpha > 0.1;
  898 |     expect(
  899 |       borderAccent,
  900 |       `selected item must have no border-left accent: width=${m.borderLeftWidth}px alpha=${m.borderLeftAlpha}`,
  901 |     ).toBe(false);
  902 |     // …(b) nor an ::after bar strip.
  903 |     const afterAccent = m.afterContent !== 'none' && m.afterWidth >= 2;
  904 |     expect(
  905 |       afterAccent,
  906 |       `selected item must have no ::after accent bar: content=${m.afterContent} width=${m.afterWidth}px`,
  907 |     ).toBe(false);
  908 |   });
  909 | 
  910 |   // Keyboard focus on a nav/navitem link must be the THEME ring drawn INSIDE the
  911 |   // item's box. Two failure modes this guards, both observed 2026-09-04:
  912 |   //   1. No `:focus-visible` rule at all → the browser's own ring (Chrome:
  913 |   //      `outline-style: auto`, 1px, rgb(0,95,204), offset +1px) stands in for it,
  914 |   //      so the navbar's focus affordance is off-palette and off-spec.
  915 |   //   2. An OUTSET ring (positive offset) on a full-bleed item is clipped: the
  916 |   //      submenu cave `.z-nav > ul` is exactly as wide as the item it holds and
  917 |   //      carries `overflow: hidden` — and jQuery's slideUp/slideDown (Nav.ts)
  918 |   //      re-applies `overflow: hidden` inline while the group animates, so no
  919 |   //      theme CSS can opt out of the clip. Hence `outline-offset <= 0`.
  920 |   // Repro is the designer's: expand "Get Started" → click "Step One" → press Space
  921 |   // (the mouse click focuses the <a>; the keypress promotes it to :focus-visible).
  922 |   // See doc/skill-gaps.md 2026-09-04 and doc/contracts/navbar.md c8–c10.
  923 |   test('submenu item keyboard focus ring is the theme inset ring and is not clipped', async ({ page }) => {
  924 |     const navbar = page.locator('.z-navbar-vertical').first();
  925 |     await navbar
  926 |       .locator('.z-nav > .z-nav-content')
  927 |       .filter({ hasText: 'Get Started' })
  928 |       .first()
  929 |       .click();
  930 | 
  931 |     const stepOne = navbar.locator('.z-navitem-content').filter({ hasText: 'Step One' }).first();
  932 |     await stepOne.waitFor({ state: 'visible' });
  933 |     await stepOne.click();
  934 |     await page.keyboard.press(' ');
  935 | 
  936 |     const m = await page.evaluate(() => {
  937 |       const el = document.activeElement as HTMLElement | null;
```