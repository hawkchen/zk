# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tablet.spec.ts >> tablet-selectbox >> gallery
- Location: src/test/playwright/tablet.spec.ts:469:9

# Error details

```
Error: expect(locator).toHaveScreenshot(expected) failed

Locator: locator('.z-p-8').first()
  56 pixels (ratio 0.01 of all image pixels) are different.

  Snapshot: selectbox-tablet.png

Call log:
  - Expect "toHaveScreenshot(selectbox-tablet.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="fToJ0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - 56 pixels (ratio 0.01 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - waiting for locator('.z-p-8').first()
    - locator resolved to <div id="fToJ0" class="z-p-8 z-div">…</div>
  - taking element screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - attempting scroll into view action
    - waiting for element to be stable
  - captured a stable screenshot
  - 56 pixels (ratio 0.01 of all image pixels) are different.

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
  374 |       .toBeLessThanOrEqual(2);
  375 |     expect(r.top!, `sheet top is ${r.top}px (off-screen above)`).toBeGreaterThanOrEqual(0);
  376 |   });
  377 | });
  378 | 
  379 | // -------------------------------------------------------
  380 | // Visual baselines at tablet size — capture the page wrapper (.z-p-8)
  381 | // -------------------------------------------------------
  382 | // maxDiffPixelRatio: opt-in tolerance for pages with a known sub-1% render
  383 | // flake (font-load / CSS-transition settle timing). tabbox's selection-indicator
  384 | // transition produces ~176px (0.01 ratio) of transient diff; a 0.02 ceiling
  385 | // absorbs it while any real regression (far larger) still fails. Other pages keep
  386 | // zero tolerance. See memory: window/panel/tabbox/toast are the known-flaky set.
  387 | type VisualCase = { name: string; url: string; maxDiffPixelRatio?: number };
  388 | 
  389 | // COVERAGE RULE: every component whose rendering changes on a mobile UA must
  390 | // have a tablet baseline. The authoritative source of "what changes" is the
  391 | // tablet bundle `src/main/resources/web/zkmax/css/tablet/` — every root `.z-*`
  392 | // class targeted by a partial there maps to a page below. When a partial starts
  393 | // (or stops) styling a component, add (or remove) its page here.
  394 | //   _inputs.css    → textbox, intbox, longbox, doublebox, decimalbox,
  395 | //                    passwordbox(=textbox page), combobox, bandbox, datebox,
  396 | //                    timebox, spinner, doublespinner
  397 | //   _selection.css → checkbox, radiogroup
  398 | //   _slider.css    → slider (touch-enlarged knob)
  399 | //   _buttons.css   → button, combobutton, toolbar(.z-toolbarbutton),
  400 | //                    fileupload(.z-uploadbutton — SKIPped: non-deterministic)
  401 | //   _mesh.css      → listbox, grid, tree(.z-treecell/.z-treecol), paging
  402 | //                    (+ checkable cells, tree/group/detail toggle icons)
  403 | //   _scrollbar.css → biglistbox
  404 | //   _calendar.css  → calendar
  405 | //   _menu.css      → menubar (menu/menuitem tap rows + glyphs)
  406 | //   _tabbox.css    → tabbox (tab tap floor, tab image/icon, close, scroll arms)
  407 | //   _window.css    → window, panel
  408 | //   _feedback.css  → errorbox (close), notification (close)
  409 | // selectbox has NO tablet CSS (native <select> — OS handles touch); its entry
  410 | // below is a width-834 render that just guards it doesn't regress at tablet size.
  411 | // notification's only tablet delta is the .z-notification-close button, which the
  412 | // static gallery does not render — its entry is a surface guard; the close-button
  413 | // geometry is verified by computed-style probe, not this baseline.
  414 | const visualCases: VisualCase[] = [
  415 |   // form inputs (_inputs.css)
  416 |   { name: 'tablet-textbox',       url: '/textbox.zul' },
  417 |   { name: 'tablet-intbox',        url: '/intbox.zul' },
  418 |   { name: 'tablet-longbox',       url: '/longbox.zul' },
  419 |   { name: 'tablet-doublebox',     url: '/doublebox.zul' },
  420 |   { name: 'tablet-decimalbox',    url: '/decimalbox.zul' },
  421 |   { name: 'tablet-combobox',      url: '/combobox.zul' },
  422 |   { name: 'tablet-bandbox',       url: '/bandbox.zul' },
  423 |   { name: 'tablet-datebox',       url: '/datebox.zul' },
  424 |   { name: 'tablet-timebox',       url: '/timebox.zul' },
  425 |   { name: 'tablet-spinner',       url: '/spinner.zul' },
  426 |   { name: 'tablet-doublespinner', url: '/doublespinner.zul' },
  427 |   { name: 'tablet-calendar',      url: '/calendar.zul' },
  428 |   // selection controls (_selection.css)
  429 |   { name: 'tablet-checkbox',      url: '/checkbox.zul' },
  430 |   { name: 'tablet-radiogroup',    url: '/radiogroup.zul' },
  431 |   // buttons (_buttons.css)
  432 |   { name: 'tablet-button',        url: '/button.zul' },
  433 |   { name: 'tablet-combobutton',   url: '/combobutton.zul' },
  434 |   { name: 'tablet-toolbar',       url: '/toolbar.zul' },
  435 |   // menu (_menu.css)
  436 |   { name: 'tablet-menubar',       url: '/menubar.zul' },
  437 |   // tabbox (_tabbox.css) — known sub-1% selection-indicator flake, see type note
  438 |   { name: 'tablet-tabbox',        url: '/tabbox.zul', maxDiffPixelRatio: 0.02 },
  439 |   // mesh: data grids/lists/tree + paging (_mesh.css)
  440 |   { name: 'tablet-listbox',       url: '/listbox.zul' },
  441 |   { name: 'tablet-grid',          url: '/grid.zul' },
  442 |   { name: 'tablet-tree',          url: '/tree.zul' },
  443 |   { name: 'tablet-paging',        url: '/paging.zul' },
  444 |   { name: 'tablet-biglistbox',    url: '/biglistbox.zul' },
  445 |   // containers (_window.css)
  446 |   // window has a pre-existing ~1% timing flake (unchanged by this work — the page
  447 |   // embeds none of the touch-enlarged components); same tolerance as tabbox.
  448 |   { name: 'tablet-window',        url: '/window.zul', maxDiffPixelRatio: 0.02 },
  449 |   { name: 'tablet-panel',         url: '/panel.zul' },
  450 |   // feedback (_feedback.css)
  451 |   { name: 'tablet-errorbox',      url: '/errorbox.zul' },
  452 |   { name: 'tablet-notification',  url: '/notification.zul' },
  453 |   // slider (_slider.css — touch-enlarged knob)
  454 |   { name: 'tablet-slider',        url: '/slider.zul' },
  455 |   // no tablet CSS — width-834 regression guard only
  456 |   { name: 'tablet-selectbox',     url: '/selectbox.zul' },
  457 |   // NOTE: scrollview is deliberately NOT here. A goto-and-shoot never paints its
  458 |   // overlay scrollbar (_barPos parks it at opacity 0 at rest), so a generic case
  459 |   // would bank a baseline of the very thing it is meant to show. Its baseline is
  460 |   // cut in the tablet-scrollview-affordance block below, with the bar revealed.
  461 | ];
  462 | 
  463 | for (const { name, url, maxDiffPixelRatio } of visualCases) {
  464 |   // The tablet gallery lands flat alongside the desktop shot, with a -tablet.png
  465 |   // suffix so it never collides with the desktop <comp>-gallery.png:
  466 |   // doc/screenshots/button-tablet.png.
  467 |   const comp = name.replace(/^tablet-/, '');
  468 |   test.describe(name, () => {
  469 |     test('gallery', async ({ page }) => {
  470 |       await page.goto(url);
  471 |       await page.waitForLoadState('networkidle');
  472 |       await page.evaluate(() => document.fonts.ready.then(() => true));
  473 |       await expect(page.locator('.z-p-8').first())
> 474 |         .toHaveScreenshot(`${comp}-tablet.png`, maxDiffPixelRatio ? { maxDiffPixelRatio } : {});
      |          ^ Error: expect(locator).toHaveScreenshot(expected) failed
  475 |     });
  476 |   });
  477 | }
  478 | 
  479 | // -------------------------------------------------------
  480 | // Colorbox popup dismiss on touch — ZK 10.2.1-jakarta's Colorbox.closePopup /
  481 | // onHide only call undoVParent(); they do NOT reset the inline display/position
  482 | // that openPopup set. On desktop undoVParent's style restore hides the reattached
  483 | // popup, but on the mobile (iPad/Safari) UA it does not, so the popup stays
  484 | // display:block (looks un-closed) and leaves a small `.z-palette-button` artifact.
  485 | // Theme workaround (floating-popup-in-body pattern): the OPEN popup is detached to
  486 | // <body>, so force-hiding the popup while it is RE-ATTACHED inside .z-colorbox
  487 | // only ever hides the closed popup. These guard that workaround on a touch UA.
  488 | // -------------------------------------------------------
  489 | test.describe('tablet-colorbox-dismiss', () => {
  490 |   test('outside tap closes the popup (no display:block left on the reattached popup)', async ({ page }) => {
  491 |     await page.goto('/colorbox.zul');
  492 |     await page.waitForLoadState('networkidle');
  493 | 
  494 |     // open must still show (the open popup is detached to <body>)
  495 |     const opened = await page.evaluate(() => {
  496 |       const w = (window as any).zk.Widget.$(document.querySelector('.z-colorbox'));
  497 |       w.openPopup();
  498 |       const pp = w.$n('pp') as HTMLElement;
  499 |       return getComputedStyle(pp).display !== 'none' && (pp.parentElement as HTMLElement).tagName === 'BODY';
  500 |     });
  501 |     expect(opened).toBe(true);
  502 | 
  503 |     // tap an empty/content area away from the colorbox
  504 |     await page.touchscreen.tap(500, 300);
  505 |     await page.waitForTimeout(350);
  506 | 
  507 |     const dismissed = await page.evaluate(() => {
  508 |       const w = (window as any).zk.Widget.$(document.querySelector('.z-colorbox'));
  509 |       return { hidden: getComputedStyle(w.$n('pp') as HTMLElement).display === 'none', open: w._open };
  510 |     });
  511 |     expect(dismissed.open).toBe(false);
  512 |     expect(dismissed.hidden).toBe(true);
  513 |   });
  514 | 
  515 |   test('selecting a color leaves no visible popup/palette-button artifact', async ({ page }) => {
  516 |     await page.goto('/colorbox.zul');
  517 |     await page.waitForLoadState('networkidle');
  518 | 
  519 |     await page.evaluate(() => {
  520 |       const w = (window as any).zk.Widget.$(document.querySelector('.z-colorbox'));
  521 |       w.openPopup();
  522 |       const pp = w.$n('pp') as HTMLElement;
  523 |       const sw = pp.querySelector('.z-colorpalette-color, [data-color]') as HTMLElement;
  524 |       if (sw) ['mousedown', 'mouseup', 'click'].forEach(t => sw.dispatchEvent(new MouseEvent(t, { bubbles: true, cancelable: true })));
  525 |     });
  526 |     await page.waitForTimeout(400);
  527 | 
  528 |     const visibleArtifacts = await page.evaluate(() =>
  529 |       [...document.querySelectorAll('[class*="palette-button"], .z-colorbox-popup')]
  530 |         .filter(e => {
  531 |           const r = (e as HTMLElement).getBoundingClientRect();
  532 |           return r.width > 0 && r.height > 0 && getComputedStyle(e as HTMLElement).display !== 'none';
  533 |         })
  534 |         .map(e => e.className.toString()));
  535 |     expect(visibleArtifacts).toEqual([]);
  536 |   });
  537 | });
  538 | 
  539 | // -------------------------------------------------------
  540 | // Scrollview — the touch path is where its styling actually lives.
  541 | // On a DESKTOP UA `bind_()` writes an inline `overflow: auto` and the browser
  542 | // scrolls natively, so the stylesheet contributes nothing visible and the desktop
  543 | // gallery shot is byte-identical with or without it. On a MOBILE UA the root stays
  544 | // `overflow: hidden` while `_move()` translates the cave, and `_addBar()` builds an
  545 | // overlay scrollbar that is the ONLY scroll affordance the user gets.
  546 | //
  547 | // These guard doc/contracts/scrollview.md M1-M6. They exist because the contract
  548 | // previously asserted only `overflow` and `background-color` — two values ZK's own
  549 | // JS and the CSS defaults already produce — so scrollview was recorded VERIFIED
  550 | // while its stylesheet was an empty placeholder file (doc/harness/work-status.md).
  551 | // Measured against that empty stylesheet (RED re-run 2026-09-12): M1, M3, M4, M5
  552 | // and M8 fail; M2 and M6 pass on it by construction, because they assert an
  553 | // ABSENCE (no surface, no layout space) that an empty file also satisfies —
  554 | // they guard against future decoration, not against a missing stylesheet.
  555 | // -------------------------------------------------------
  556 | test.describe('tablet-scrollview-affordance', () => {
  557 |   test('the overlay scrollbar is present, proportional and inert to touch', async ({ page }) => {
  558 |     await page.goto('/scrollview.zul');
  559 |     await page.waitForLoadState('networkidle');
  560 |     expect(await tabletCssLoaded(page)).toBe(true);
  561 |     // _refresh() builds the bar from a 200ms timer fired by onSize; wait for the
  562 |     // element rather than racing a fixed sleep.
  563 |     await page.waitForSelector('.z-scrollview-scrollbar', { state: 'attached', timeout: 10000 });
  564 | 
  565 |     const m = await page.evaluate(() => {
  566 |       const root = document.querySelector('.z-scrollview') as HTMLElement;
  567 |       const cave = root.querySelector('.z-scrollview-content') as HTMLElement;
  568 |       const bar = root.querySelector('.z-scrollview-scrollbar') as HTMLElement;
  569 |       const ind = root.querySelector('.z-scrollview-scrollbar-indicator') as HTMLElement;
  570 |       const load = root.querySelector('.z-scrollview-load') as HTMLElement;
  571 |       const rs = getComputedStyle(root), is = getComputedStyle(ind);
  572 |       const rr = root.getBoundingClientRect(), br = bar.getBoundingClientRect(),
  573 |             ir = ind.getBoundingClientRect();
  574 |       // M5: who actually receives a touch at the thumb's centre?
```