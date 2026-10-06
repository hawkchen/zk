# D23-A Generator 紀錄：tree / listbox row 改用真實 focus 模型

## 指令

```
cd /Users/hawk/Documents/workspace/ZK10/zk/zkpreview
PREVIEW_URL=http://127.0.0.1:8085 npx playwright test --config src/test/playwright/playwright.config.ts --project=focus-scan -g "tree: tree row"
（之後同樣方式跑 "listbox: listbox row" 與整個 focus-scan project）
```

## RED（修改前）

`tree: tree row` 失敗：`ring [5,0,73] (offset 0px) vs the fill ... [5,0,73] from .z-treerow z-treerow-selected`，delta = 0（預期 > 200）。
即量到的是瀏覽器預設 `outline:auto`（Highlight on Highlight），不是真實狀態。

## 修改

- row 同時加 `z-treerow-selected` + `z-treerow-focus`（listbox：`z-listitem-selected` + `z-listitem-focus`）。
- 對同一個 `.z-tree` / `.z-listbox`（`el.closest(host)`）內的 `.z-focus-a` 強制 `:focus` + `:focus-visible`（標記 `data-fs-force`），row 本身不強制。
- `forceFocus()` 新增兩個有預設值的參數（`attr`、`pseudo`），第一個 pass 的呼叫完全不變。
- navbar / paging / organigram 沒有 `host` 欄位，走原本路徑。
- 註解：新增 tree/listbox 說明段，並移除「Families deliberately NOT listed」中的 listbox row 條目（已納入）。
- 注意：diff 同時包含前一個 Generator 加入的 `transition: none !important` 注入（仍未 commit），保留。

## 修改後結果

- `tree: tree row` x3：3/3 passed。
- `listbox: listbox row` x3：3/3 passed。
- 量測值（暫時 patch 後已還原，spec 中 `MEASURE` 出現次數 = 0）：
  - tree row：`solid`、width 2、offset -2、ring `[255,255,255]`、fill `[5,0,73]`（來自 `.z-treerow.z-treerow-selected.z-treerow-focus`）
  - listbox row：`solid`、width 2、offset -2、ring `[255,255,255]`、fill `[5,0,73]`（來自 `.z-listitem.z-listitem-selected.z-listitem-focus`）
- 整個 `focus-scan` project：57 passed、47 skipped、0 failed（共 104 個項目，含新的 listbox row）。
- 未做 mutation check（由 Verifier 負責）。

## Diff（`git diff zkpreview/src/test/playwright/focus-ring-scan.spec.ts`）

```diff
diff --git a/zkpreview/src/test/playwright/focus-ring-scan.spec.ts b/zkpreview/src/test/playwright/focus-ring-scan.spec.ts
index 6afe5edd9e..0308ed7adf 100644
--- a/zkpreview/src/test/playwright/focus-ring-scan.spec.ts
+++ b/zkpreview/src/test/playwright/focus-ring-scan.spec.ts
@@ -161,17 +161,20 @@ async function tagCandidates(page: Page, selectors: string[]) {
 }
 
 /** Force (or release) `:focus-visible` on every tagged candidate. */
-async function forceFocus(cdp: CDPSession, count: number, on: boolean) {
+async function forceFocus(
+  cdp: CDPSession, count: number, on: boolean,
+  attr = 'data-fs-idx', pseudo = ['focus-visible'],
+) {
   const { root } = await cdp.send('DOM.getDocument', { depth: -1 });
   for (let i = 0; i < count; i++) {
     const { nodeId } = await cdp.send('DOM.querySelector', {
       nodeId: root.nodeId,
-      selector: `[data-fs-idx="${i}"]`,
+      selector: `[${attr}="${i}"]`,
     });
     if (!nodeId) continue;
     await cdp.send('CSS.forcePseudoState', {
       nodeId,
-      forcedPseudoClasses: on ? ['focus-visible'] : [],
+      forcedPseudoClasses: on ? pseudo : [],
     });
   }
 }
@@ -340,22 +343,30 @@ test.describe('focus-ring scan', () => {
 // class rather than driving a real selection: what is under test is the cascade
 // the two rules produce together, and that is identical either way.
 //
+// Tree and listbox rows are never DOM-focused: keyboard focus sits on the hidden
+// `a.z-focus-a` inside the widget, and the row ring comes from
+// `.z-tree:has(.z-focus-a:focus-visible) .z-treerow.z-treerow-focus`. Those
+// entries therefore set `addCls` (the row's focus class) and `host` (the widget
+// whose `.z-focus-a` gets the forced focus) instead of forcing focus on the row.
+//
 // Families deliberately NOT listed, with the reason:
 //   - accordion tab (.z-tab): focus is a `::before` state-layer opacity, not an
 //     outline. forced-colors drops pseudo-element backgrounds outright, so its
 //     focus is invisible in WHCM whether or not the tab is selected — a
 //     different gap (no outline at all), not this collision.
-//   - listbox row (.z-listitem): focus is `box-shadow: inset …` on the first
-//     cell, and forced-colors strips box-shadow. Same story as the tab.
 //   - searchbox: `.z-searchbox-focus` is the root's focus class while
 //     `.z-searchbox-selected` is a row inside the popup — different elements, so
 //     the two colours never meet.
 const SELECTED_FAMILIES = [
   { name: 'navbar item',     page: 'navbar',     focus: '.z-navitem-content', on: 'parent', cls: 'z-navitem-selected' },
-  { name: 'tree row',        page: 'tree',       focus: '.z-treerow',         on: 'self',   cls: 'z-treerow-selected' },
+  { name: 'tree row',        page: 'tree',       focus: '.z-treerow',         on: 'self',   cls: 'z-treerow-selected', addCls: 'z-treerow-focus', host: '.z-tree' },
+  { name: 'listbox row',     page: 'listbox',    focus: '.z-listitem',        on: 'self',   cls: 'z-listitem-selected', addCls: 'z-listitem-focus', host: '.z-listbox' },
   { name: 'paging button',   page: 'paging',     focus: '.z-paging-button',   on: 'self',   cls: 'z-paging-selected' },
   { name: 'organigram node', page: 'organigram', focus: '.z-orgnode',         on: 'parent', cls: 'z-orgitem-selected' },
-] as const;
+] as const satisfies readonly {
+  name: string; page: string; focus: string; on: 'self' | 'parent'; cls: string;
+  addCls?: string; host?: string;
+}[];
 
 test.describe('focus-ring scan — selected + focused under forced-colors', () => {
   for (const fam of SELECTED_FAMILIES) {
@@ -365,6 +376,11 @@ test.describe('focus-ring scan — selected + focused under forced-colors', () =
       await page.waitForSelector(fam.focus, { timeout: 15000 });
       await page.evaluate(() => document.fonts.ready.then(() => true));
 
+      // The selected class and the forced focus change background-color; a
+      // transition (.z-orgnode has 0.25s) would make the sample below land
+      // mid-fade and read a blend instead of the settled fill.
+      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
+
       const ok = await page.evaluate((f) => {
         const el = document.querySelector(f.focus);
         if (!el) return false;
@@ -372,6 +388,12 @@ test.describe('focus-ring scan — selected + focused under forced-colors', () =
         if (!target) return false;
         target.classList.add(f.cls);
         el.setAttribute('data-fs-idx', '0');
+        if ('host' in f) {
+          target.classList.add(f.addCls);
+          const a = el.closest(f.host)?.querySelector('.z-focus-a');
+          if (!a) return false;
+          a.setAttribute('data-fs-force', '0');
+        }
         return true;
       }, fam);
       expect(ok, `no ${fam.focus} on ${fam.page}.zul`).toBe(true);
@@ -379,7 +401,8 @@ test.describe('focus-ring scan — selected + focused under forced-colors', () =
       const cdp = await context.newCDPSession(page);
       await cdp.send('DOM.enable');
       await cdp.send('CSS.enable');
-      await forceFocus(cdp, 1, true);
+      if ('host' in fam) await forceFocus(cdp, 1, true, 'data-fs-force', ['focus', 'focus-visible']);
+      else await forceFocus(cdp, 1, true);
 
       const m = await page.evaluate(() => {
         const el = document.querySelector('[data-fs-idx="0"]')!;
@@ -424,7 +447,8 @@ test.describe('focus-ring scan — selected + focused under forced-colors', () =
           ring: rgb(cs.outlineColor), fill: rgb(fill), fillFrom: from.slice(0, 40),
         };
       });
-      await forceFocus(cdp, 1, false);
+      if ('host' in fam) await forceFocus(cdp, 1, false, 'data-fs-force');
+      else await forceFocus(cdp, 1, false);
       await cdp.detach();
 
       test.skip(
```
