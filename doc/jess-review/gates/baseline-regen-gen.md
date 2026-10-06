# Baseline 重新產生與 organigram 測試修正：Generator 報告

日期：2026-10-06。所有指令皆在 `/Users/hawk/Documents/workspace/ZK10/zk/zkpreview` 執行，環境變數 `PREVIEW_URL=http://127.0.0.1:8085`（config 預設是 `localhost:8085`，所以明確指定）。`C = npx playwright test --config src/test/playwright/playwright.config.ts --reporter=line`。

## Task A：重新產生 27 張 baseline

指令：`$C --project=chromium --update-snapshots`（不加 `=all`）。結果：126 passed。

`git status --short zkpreview/doc/screenshots`：27 個 modified，0 個 untracked，沒有 `*-forced-colors.png`，也沒有清單外的 PNG。沒有執行 `forced-colors-gallery`，沒有需要 `git checkout` 還原的檔案。

Modified 清單（與核准清單逐項吻合）：
bandbox-gallery, button-gallery, checkbox-gallery, chosenbox-focus, chosenbox-hover, combobox-gallery, datebox-gallery, grid-gallery, listbox-gallery, longbox-focus, longbox-hover, panel-gallery, searchbox-focus, searchbox-hover, selectbox-focus, selectbox-gallery, selectbox-hover, spinner-gallery, tabbox-gallery, tabbox-hover, textbox-focus, textbox-gallery, textbox-hover, timebox-gallery, toast-gallery, tree-gallery, window-gallery（皆 `.png`）。

再跑一次 `$C --project=chromium`（不更新）：**126 passed、0 failed**；之後 modified 數仍為 27。

## Task B：organigram focus-scan 測試

測試完整名稱：`focus-ring scan — selected + focused under forced-colors › organigram: organigram node`。檔案內原本沒有任何關閉 transition 的作法，所以新增一個。

RED（修正前，單測各跑一次，共 3 次）：3 次皆 failed。fill 讀到的是漸變中間值：[245,244,247]、[250,250,251]、[245,245,248]，ring 是 [255,255,255]。

修正（測試檔 diff，套用到整個 SELECTED_FAMILIES 表的所有 row）：

```diff
--- a/zkpreview/src/test/playwright/focus-ring-scan.spec.ts
+++ b/zkpreview/src/test/playwright/focus-ring-scan.spec.ts
@@ -365,6 +365,11 @@ test.describe('focus-ring scan — selected + focused under forced-colors', () =
       await page.waitForSelector(fam.focus, { timeout: 15000 });
       await page.evaluate(() => document.fonts.ready.then(() => true));
 
+      // The selected class and the forced focus change background-color; a
+      // transition (.z-orgnode has 0.25s) would make the sample below land
+      // mid-fade and read a blend instead of the settled fill.
+      await page.addStyleTag({ content: '*, *::before, *::after { transition: none !important; }' });
+
       const ok = await page.evaluate((f) => {
```

修正後單測 organigram 跑 3 次：3 次 passed（約 0.7-0.8s）。

## 重要發現：修正後整個 focus-scan 不是全綠

整個 `focus-scan` 專案跑一次（修正後）：**1 failed、55 passed、47 skipped**。失敗的是 `tree: tree row`：

`ring [5,0,73] (offset 0px) vs the fill it is painted on, [5,0,73] from .z-treerow z-treerow-selected`

即 Highlight 對 Highlight，ring 在選取的 tree row 上看不見，這正是這個測試要抓的 collision。

- 修正前，tree row 在單測跑 3 次都 passed。推測是 tree row 也有 background-color transition，取樣時讀到漸變中間值，所以「碰巧通過」。
- 修正後 tree row 穩定失敗（單測 3 次、整個專案 1 次，共 4 次皆 failed）。
- 為排除是 `transition:none` 造成的假象，我另外用「forceFocus 後 `waitForTimeout(1500)`、不關 transition」的版本試過（暫時性，已還原）：tree row 同樣失敗。所以這是穩定後的真實狀態，不是這個修法造成的。
- 我沒有改 product CSS，也沒有把 tree 這一 row 排除，因為那會掩蓋真實的缺陷。需要 Planner 決定：是另開 issue 修 `tokens/_forced-colors.css` 的 tree row 規則，還是接受這個 test 暫時紅燈。

## 工作樹狀態

- 修改的追蹤檔：27 張 PNG、`zkpreview/src/test/playwright/focus-ring-scan.spec.ts`（+5 行）。
- 沒有 `git add`、沒有 commit，沒有啟動或重啟 server。
