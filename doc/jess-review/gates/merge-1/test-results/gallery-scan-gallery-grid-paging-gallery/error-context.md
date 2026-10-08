# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: gallery-scan.spec.ts >> gallery >> grid-paging
- Location: src/test/playwright/gallery-scan.spec.ts:48:9

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  Expected an image 1280px by 1376px, received 1280px by 1336px. 24918 pixels (ratio 0.02 of all image pixels) are different.

  Snapshot: grid-paging-gallery.png

Call log:
  - Expect "toHaveScreenshot(grid-paging-gallery.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="lKuI0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - Expected an image 1280px by 1376px, received 1280px by 1336px. 24918 pixels (ratio 0.02 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="lKuI0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - Expected an image 1280px by 1376px, received 1280px by 1336px. 24918 pixels (ratio 0.02 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]: Grid Paging
  - generic [ref=e5]:
    - generic [ref=e6]: Paging Position and Mold
    - generic [ref=e7]:
      - generic [ref=e8]:
        - generic [ref=e9]: "Paging position:"
        - radiogroup [ref=e10]:
          - generic [ref=e11] [cursor=pointer]:
            - radio "top" [ref=e12]
            - generic [ref=e13]: top
          - generic [ref=e14] [cursor=pointer]:
            - radio "bottom" [checked] [ref=e15]
            - generic [ref=e16]: bottom
          - generic [ref=e17] [cursor=pointer]:
            - radio "both" [ref=e18]
            - generic [ref=e19]: both
        - button "Change Paging Mold" [ref=e20] [cursor=pointer]
        - button "Change Paging Disabled" [ref=e21] [cursor=pointer]
      - grid [ref=e22]:
        - rowgroup [ref=e28]:
          - row "Index Head 1 Head 2 Head 3" [ref=e29]:
            - columnheader "Index" [ref=e30]:
              - generic [ref=e31]: Index
            - columnheader "Head 1" [ref=e32]:
              - generic [ref=e33]: Head 1
            - columnheader "Head 2" [ref=e34]:
              - generic [ref=e35]: Head 2
            - columnheader "Head 3" [ref=e36]:
              - generic [ref=e37]: Head 3
        - rowgroup [ref=e43]:
          - row "1" [ref=e44]:
            - gridcell "1" [ref=e45]:
              - generic [ref=e46]: "1"
            - gridcell [ref=e47]:
              - textbox [ref=e49]
            - gridcell [ref=e50]:
              - combobox [ref=e52]:
                - textbox [ref=e53]
                - button [ref=e54] [cursor=pointer]
            - gridcell [ref=e56]:
              - textbox [ref=e58]
          - row "2 A11 A12 A13" [ref=e59]:
            - gridcell "2" [ref=e60]:
              - generic [ref=e61]: "2"
            - gridcell "A11" [ref=e62]:
              - generic [ref=e63]: A11
            - gridcell "A12" [ref=e64]:
              - generic [ref=e65]: A12
            - gridcell "A13" [ref=e66]:
              - generic [ref=e67]: A13
          - row "3 Option 1 Option 2" [ref=e68]:
            - gridcell "3" [ref=e69]:
              - generic [ref=e70]: "3"
            - gridcell "Option 1" [ref=e71]:
              - generic [ref=e73] [cursor=pointer]:
                - checkbox "Option 1" [checked]
                - generic [ref=e75]: Option 1
            - gridcell "Option 2" [ref=e76]:
              - generic [ref=e78] [cursor=pointer]:
                - checkbox "Option 2"
                - generic [ref=e80]: Option 2
            - gridcell [ref=e81]:
              - radiogroup [ref=e83]:
                - generic [ref=e84] [cursor=pointer]:
                  - radio "Apple" [ref=e85]
                  - generic [ref=e86]: Apple
                - generic [ref=e87] [cursor=pointer]:
                  - radio "Orange" [checked] [ref=e88]
                  - generic [ref=e89]: Orange
                - generic [ref=e90] [cursor=pointer]:
                  - radio "Lemon" [ref=e91]
                  - generic [ref=e92]: Lemon
        - navigation [ref=e94]:
          - button "First" [disabled]
          - button "Prev" [disabled]
          - textbox "Current page 1 out of 3" [ref=e95]: "1"
          - generic [ref=e96]: / 3
          - button "Next" [ref=e97] [cursor=pointer]
          - button "Last" [ref=e98] [cursor=pointer]
          - generic [ref=e99]:
            - generic [ref=e100]: "[ 1 - 3 / 8 ]"
            - generic [ref=e101]: Currently displaying items 1-3 out of 8
  - generic [ref=e102]:
    - generic [ref=e103]: OS Mold Multi-Page
    - grid [ref=e105]:
      - rowgroup [ref=e111]:
        - row "Author Title Publisher Hardcover" [ref=e112]:
          - columnheader "Author" [ref=e113]:
            - generic [ref=e114]: Author
          - columnheader "Title" [ref=e117]:
            - generic [ref=e118]: Title
          - columnheader "Publisher" [ref=e121]:
            - generic [ref=e122]: Publisher
          - columnheader "Hardcover" [ref=e125]:
            - generic [ref=e126]: Hardcover
      - rowgroup [ref=e134]:
        - row "Philip Hensher The Northern Clemency Knopf (October 30, 2008) 608 pages" [ref=e135]:
          - gridcell "Philip Hensher" [ref=e136]:
            - generic [ref=e137]: Philip Hensher
          - gridcell "The Northern Clemency" [ref=e138]:
            - generic [ref=e139]: The Northern Clemency
          - gridcell "Knopf (October 30, 2008)" [ref=e140]:
            - generic [ref=e141]: Knopf (October 30, 2008)
          - gridcell "608 pages" [ref=e142]:
            - generic [ref=e143]: 608 pages
        - row "Philip Hensher The Fit HarperPerennial (April 4, 2005) 240 pages" [ref=e144]:
          - gridcell "Philip Hensher" [ref=e145]:
            - generic [ref=e146]: Philip Hensher
          - gridcell "The Fit" [ref=e147]:
            - generic [ref=e148]: The Fit
          - gridcell "HarperPerennial (April 4, 2005)" [ref=e149]:
            - generic [ref=e150]: HarperPerennial (April 4, 2005)
          - gridcell "240 pages" [ref=e151]:
            - generic [ref=e152]: 240 pages
        - row "Philip Hensher Kitchen Venom Flamingo (May 19, 2003) 336 pages" [ref=e153]:
          - gridcell "Philip Hensher" [ref=e154]:
            - generic [ref=e155]: Philip Hensher
          - gridcell "Kitchen Venom" [ref=e156]:
            - generic [ref=e157]: Kitchen Venom
          - gridcell "Flamingo (May 19, 2003)" [ref=e158]:
            - generic [ref=e159]: Flamingo (May 19, 2003)
          - gridcell "336 pages" [ref=e160]:
            - generic [ref=e161]: 336 pages
        - row "Michael Greenberg Hurry Down Sunshine Other Press (September 9, 2008) 240 pages" [ref=e162]:
          - gridcell "Michael Greenberg" [ref=e163]:
            - generic [ref=e164]: Michael Greenberg
          - gridcell "Hurry Down Sunshine" [ref=e165]:
            - generic [ref=e166]: Hurry Down Sunshine
          - gridcell "Other Press (September 9, 2008)" [ref=e167]:
            - generic [ref=e168]: Other Press (September 9, 2008)
          - gridcell "240 pages" [ref=e169]:
            - generic [ref=e170]: 240 pages
        - row "Michael Greenberg Painless Vocabulary (Painless) Barron's Educational Series (September 1, 2001) 292 pages" [ref=e171]:
          - gridcell "Michael Greenberg" [ref=e172]:
            - generic [ref=e173]: Michael Greenberg
          - gridcell "Painless Vocabulary (Painless)" [ref=e174]:
            - generic [ref=e175]: Painless Vocabulary (Painless)
          - gridcell "Barron's Educational Series (September 1, 2001)" [ref=e176]:
            - generic [ref=e177]: Barron's Educational Series (September 1, 2001)
          - gridcell "292 pages" [ref=e178]:
            - generic [ref=e179]: 292 pages
      - navigation [ref=e181]:
        - list [ref=e182]:
          - listitem [ref=e183]:
            - generic [ref=e184] [cursor=pointer]: "1"
          - listitem [ref=e185]:
            - generic [ref=e186] [cursor=pointer]: "2"
          - listitem [ref=e187]:
            - generic [ref=e188] [cursor=pointer]: "3"
          - listitem [ref=e189]:
            - generic [ref=e190] [cursor=pointer]: "4"
          - listitem [ref=e191]:
            - generic [ref=e192] [cursor=pointer]: "5"
          - listitem [ref=e193]:
            - generic [ref=e194] [cursor=pointer]: Next
        - generic [ref=e195]:
          - generic [ref=e196]: "[ 1 / 21 ]"
          - generic [ref=e197]: Currently displaying items 1-5 out of 21
  - generic [ref=e198]:
    - generic [ref=e199]: Single Page (OS Mold)
    - grid [ref=e201]:
      - rowgroup [ref=e207]:
        - row "Author Title Publisher Hardcover" [ref=e208]:
          - columnheader "Author" [ref=e209]:
            - generic [ref=e210]: Author
          - columnheader "Title" [ref=e213]:
            - generic [ref=e214]: Title
          - columnheader "Publisher" [ref=e217]:
            - generic [ref=e218]: Publisher
          - columnheader "Hardcover" [ref=e221]:
            - generic [ref=e222]: Hardcover
      - rowgroup [ref=e230]:
        - row "Philip Hensher The Northern Clemency Knopf (October 30, 2008) 608 pages" [ref=e231]:
          - gridcell "Philip Hensher" [ref=e232]:
            - generic [ref=e233]: Philip Hensher
          - gridcell "The Northern Clemency" [ref=e234]:
            - generic [ref=e235]: The Northern Clemency
          - gridcell "Knopf (October 30, 2008)" [ref=e236]:
            - generic [ref=e237]: Knopf (October 30, 2008)
          - gridcell "608 pages" [ref=e238]:
            - generic [ref=e239]: 608 pages
        - row "Philip Hensher The Fit HarperPerennial (April 4, 2005) 240 pages" [ref=e240]:
          - gridcell "Philip Hensher" [ref=e241]:
            - generic [ref=e242]: Philip Hensher
          - gridcell "The Fit" [ref=e243]:
            - generic [ref=e244]: The Fit
          - gridcell "HarperPerennial (April 4, 2005)" [ref=e245]:
            - generic [ref=e246]: HarperPerennial (April 4, 2005)
          - gridcell "240 pages" [ref=e247]:
            - generic [ref=e248]: 240 pages
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import * as fs from 'fs';
  3  | import * as path from 'path';
  4  | 
  5  | // Scan-driven gallery coverage (test-architecture.md §6, roadmap step 2).
  6  | //
  7  | // This spec discovers preview pages by SCANNING src/test/resources/web/*.zul at
  8  | // collection time, so a NEW component page is covered by a baseline screenshot the
  9  | // moment it is added — no edit to this file required. That closes the silent-gap
  10 | // problem of the hand-maintained screenshot.spec.ts.
  11 | //
  12 | // Each covered page gets ONE gallery screenshot of its `.z-p-8` wrapper. Richer
  13 | // state matrices (hover/focus/active) and computed-style guards stay in
  14 | // screenshot.spec.ts; this spec is the breadth layer, that one is the depth layer.
  15 | //
  16 | // Requires the preview app on ${PREVIEW_URL}
  17 | //   withjdk.sh 17 mvn test exec:java@preview-app
  18 | 
  19 | const WEB_DIR = path.resolve(__dirname, '../../main/webapp/web');
  20 | 
  21 | // Pages with a bespoke gallery block already in screenshot.spec.ts — skip here to
  22 | // avoid duplicate baselines. Their depth coverage (states) lives there.
  23 | const COVERED_ELSEWHERE = new Set([
  24 |   'button', 'textbox', 'checkbox', 'combobox', 'listbox', 'grid', 'datebox',
  25 |   'timebox', 'spinner', 'bandbox', 'selectbox', 'tabbox', 'tree', 'window', 'panel', 'toast',
  26 | ]);
  27 | 
  28 | // Pages a static gallery screenshot can't meaningfully or stably capture.
  29 | const SKIP = new Set([
  30 |   // Non-visual primitives / structural / meta pages
  31 |    'area', 'html', 'iframe', 'imagemap', 
  32 |   'scrollbar',  'overview', 'preview', 'inputs',
  33 |   // Non-deterministic / hardware / external-resource / animated → flaky baselines
  34 |   'camera', 'barcodescanner', 'captcha', 'video', 'audio', 'fileupload', 'loading', 'loadingbar',
  35 |   // Auto-generated icon catalog (all Lucide icons) — a whole-page listing, not an ordinary
  36 |   // preview; regenerated by build:css. Also excluded from check-icon-coverage.sh.
  37 |   'icons-lucide'
  38 | ]);
  39 | 
  40 | const pages = fs.readdirSync(WEB_DIR)
  41 |   .filter(f => f.endsWith('.zul'))
  42 |   .map(f => f.replace(/\.zul$/, ''))
  43 |   .filter(name => !COVERED_ELSEWHERE.has(name) && !SKIP.has(name))
  44 |   .sort();
  45 | 
  46 | test.describe('gallery', () => {
  47 |   for (const comp of pages) {
  48 |     test(comp, async ({ page }) => {
  49 |       await page.goto(`/${comp}.zul`, { waitUntil: 'networkidle' });
  50 |       // Wait for the Inter web font to settle — otherwise the shot can be taken
  51 |       // mid font-swap and the page height drifts a few px (see reorg investigation).
  52 |       await page.evaluate(() => document.fonts.ready.then(() => true));
  53 |       // Snap CSS transitions to their end state. `animations: 'disabled'` below does not
  54 |       // cover a transition that ZK starts client-side after Playwright has set the page up:
  55 |       // progressmeter's fill transitions width 0 -> value on first render (~0.3s, see
  56 |       // progressmeter.css), so the shot landed at a variable point and progressmeter-gallery
  57 |       // was non-reproducible run to run — three samples differed only along the 4px-tall
  58 |       // fill's antialiased leading edge. Zero duration completes any in-flight transition
  59 |       // immediately (chat D68).
  60 |       await page.addStyleTag({ content: '*{transition-duration:0s !important}' });
  61 |       const wrapper = page.locator('.z-p-8').first();
  62 |       // Every standard preview page renders the .z-p-8 wrapper; fail loudly if a
  63 |       // newly-added page uses a different shell so it gets an explicit decision
  64 |       // (add a wrapper, or add it to SKIP) rather than a silent body-sized shot.
  65 |       await expect(
  66 |         wrapper,
  67 |         `${comp}.zul has no .z-p-8 wrapper — give it one or add "${comp}" to SKIP in gallery-scan.spec.ts`
  68 |       ).toBeVisible();
  69 |       // Flat layout: doc/screenshots/<comp>-gallery.png (single hyphenated name).
> 70 |       await expect(wrapper).toHaveScreenshot(`${comp}-gallery.png`, {
     |                             ^ Error: expect(locator).toHaveScreenshot(expected) failed
  71 |         animations: 'disabled',
  72 |         // small tolerance for sub-pixel AA differences across runs
  73 |         maxDiffPixelRatio: 0.01,
  74 |       });
  75 |     });
  76 |   }
  77 | });
  78 | 
```