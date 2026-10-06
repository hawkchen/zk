# D22-B Generator 報告：threshold 0.05 與三張 dropdown 截圖

只陳述事實，不自我評分。指令一律在 `zkpreview/` 下執行：
`PREVIEW_URL=http://127.0.0.1:8085 npx playwright test --config src/test/playwright/playwright.config.ts --project=chromium ...`

## Task 1：threshold

### RED（修改前，threshold 為預設 0.2）
- 暫時在 `listbox › gallery` 加入 `page.addStyleTag({ content: ':root, .z-listbox, .z-listitem { --zk-listbox-selected-bg: rgb(213,230,255) !important; }' })`，指令 `-g "listbox.*gallery"`。
- 選取列的 knob 是 `--zk-listbox-selected-bg`（`listbox.css:256` 的 `.z-listitem.z-listitem-selected`）。
- 注入後立刻讀 computed style 會得到舊色（`background-color` 有 transition）；等 1 秒後 computed `background-color` = `rgb(213, 230, 255)`，canvas 取樣 `[213,230,255,255]`，knob 值 `rgb(213,230,255)`。未注入時為 `200,213,234`。
- 結果：**1 passed**（0.2 下舊色仍通過，即缺口本身）。
- 加上 config 的 0.05 後，同一注入：**failed**（listbox-gallery 判為不同）。
- 暫時修改已還原：`git diff` 對 `screenshot.spec.ts` 的原始內容無殘留（還原來源：scratchpad `gen-d22/screenshot.spec.ts.orig`）。

### config diff（只動 `chromium` 專案）
```
       name: 'chromium',
       testMatch: /screenshot\.spec\.ts/,
+      // Per-pixel YIQ colour distance for toHaveScreenshot, tightened from the 0.2 default.
+      // Jess review batch 2 moved the listbox selected row from rgb(213,230,255) to
+      // rgb(200,213,234): YIQ 0.0625, so 41,628 changed pixels were invisible at 0.2.
+      // Colour changes below 0.05 still pass. See doc/screenshot-tolerance-policy.md.
+      expect: { toHaveScreenshot: { threshold: 0.05 } },
```

### 0.05 下完整 chromium 專案（不更新任何 baseline）
- 修改後第一次：120 passed、**6 failed**；再跑一次結果相同（確定性，非 flake）。
- 失敗的 6 個（既有 baseline，**未更新**）：

| 測試 | 差異像素 |
|---|---|
| `doublebox › hover` | 51 |
| `doublebox › focus` | 51 |
| `decimalbox › hover` | 35 |
| `decimalbox › focus` | 35 |
| `combobutton › hover` | 41 |
| `combobutton › focus` | 41 |

- expected / actual / diff PNG 已複製到
  `/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/462190b7-5cfd-4433-8c32-a8b9e3fcddce/scratchpad/gen-d22/new-failures/screenshot-<name>-chromium/`。
- 這 6 張待使用者核准後才可處理；我沒有判斷它們是真退步或可接受的色差。

## Task 2：三張 dropdown 截圖

### 實測 DOM 與顏色
| 元件 | popup selector | 狀態 class | item computed bg（canvas 取樣 rgb） | `--zk-color-secondary-container` 解析值 | 一致？ |
|---|---|---|---|---|---|
| combobox | `.z-combobox-popup.z-combobox-open` | `.z-comboitem-selected`（按鈕開啟後 ArrowDown x2，選到第 2 項） | `oklch(0.87 0.0317 260.56)` → 200,213,234 | 200,213,234 | 是 |
| searchbox | `.z-searchbox-popup:visible` | `.z-searchbox-selected`（第 2 個非 disabled 的 searchbox 有預選 Apple，點擊開啟） | 200,213,234 | 200,213,234 | 是 |
| chosenbox | `.z-chosenbox-popup:visible`（popup 同時帶 `z-chosenbox-popup-hidden` class 但實際可見） | `.z-chosenbox-option-hover`（點擊開啟後 ArrowDown x1；這是 keyboard 移動的標記 class） | `rgba(0, 0, 0, 0.04)` → 0,0,0,10 | 200,213,234 | **否** |

- 說明：`zkcml/zkmax/.../inp/css/chosenbox.css:147-150` 的 option hover/focus 底色是 `rgba(0,0,0,0.04)`，不是 secondary-container。這張截圖確實拍到 keyboard focus 的 item，但它的顏色不屬於 secondary-container 家族。plan 判定 3、4 對 chosenbox 的前提（顏色 = secondary-container）不成立，需要 Planner 決定。
- searchbox 若用 keyboard（ArrowDown）則得到 `.z-searchbox-active`（`on-surface` 12% 透明），不是 selected；故改用預選項目。
- 未模擬 `.z-searchbox-selected` 以外的組合；沒有任何 item 狀態是偽造的。

### spec diff（`screenshot.spec.ts`，只新增）
- `combobox` describe 內新增 `test('dropdown')`。
- 檔尾 Scrollbar 區段前新增 `searchbox dropdown`、`chosenbox dropdown` 兩個 describe。
- 每個測試：開啟、`page.mouse.move(0,0)` 移開指標避免 `:hover`、`expect(popup).toBeVisible()`/`toHaveCount(1)`、`expect(<state class>).toHaveCount(1)`，再 `padShot(page, popup, '<name>-dropdown.png')`（沿用 `animations: 'disabled'`、`PAD`、`maxDiffPixels: 20`）。

### baseline 與穩定性
- 用 `--update-snapshots=missing -g dropdown` 產生三張：`zkpreview/doc/screenshots/{combobox,searchbox,chosenbox}-dropdown.png`（第一次因 baseline 不存在而回報 failed 是 Playwright 預期行為）。
- 不帶 update 連跑 3 次：3 次皆 `3 passed`。
- 目視：combobox 第 2 項、searchbox 的 Apple 呈淡藍底；chosenbox 的 Cherry 呈淺灰底。

## Task 3：docs
`doc/screenshot-tolerance-policy.md`：更新 knobs 表的 `threshold` 列；新增 section 5（chromium 專案 0.05、原因 YIQ 0.0625、限制為低於 0.05 的色差仍通過），原 section 5 改號為 6。

## 最後檢查
- 加入三張後再跑完整 chromium：123 passed、6 failed（同上 6 個）。
- `git status --short zkpreview`：
  - M `src/test/playwright/playwright.config.ts`
  - M `src/test/playwright/screenshot.spec.ts`
  - M `src/test/playwright/focus-ring-scan.spec.ts`（先前即有，未動）
  - 27 個 M `doc/screenshots/*.png`（先前即有，未動）
  - ?? 3 個新 PNG（上述 dropdown）
- 沒有 `*-forced-colors.png` 變動；沒有執行 forced-colors-gallery；沒有 git add/commit。

## D25-A：chosenbox chip focus

**到達狀態的方式**：在 `/chosenbox.zul` 上，第一個含 `.z-chosenbox-item` 的 `.z-chosenbox`（index 0，2 個 chip：Apple 等）；直接 click 第一個 chip 即產生 `.z-chosenbox-item-focus`（count = 1），不需要 keyboard。`page.mouse.move(0, 0)` 後仍為 1。

**量測（live page）**
- focused chip computed `background-color`：`oklch(0.87 0.0317461 260.564)` = rgb(200, 213, 234)
- `--zk-color-secondary-container`（套在 probe element 的 background 解析）：`oklch(0.87 0.0317461 260.564)` = rgb(200, 213, 234)；兩者相同
- `--zk-chosenbox-item-focus-bg` 原值：`oklch(from oklch(from #376fd0 .54 calc(c * .41) h) .87 calc(c * .48) h)`
- PNG（224x94）chip 中心 (56,31) 落在文字 glyph 上（115,123,135，非底色）；改取 chip 周邊 9x41 區域：最多的色為 rgb(200, 213, 234)（165 px），chip 左側 padding 點 (34,31) 亦為 rgb(200, 213, 234)。與 computed 差 0/0/0，在 ±2 內。

**Spec 變更**（`zkpreview/src/test/playwright/screenshot.spec.ts`）
- 更新 `chosenbox dropdown` 上方註解：dropdown shot 涵蓋 `.z-chosenbox-option-hover`（hardcoded fill，`doc/marble-theme-followups.md` item 10），chip shot 涵蓋 batch 2 的 `--zk-chosenbox-item-focus-bg`。
- 在該 describe 內新增 test `chip focus`：
```ts
  test('chip focus', async ({ page }) => {
    await page.goto('/chosenbox.zul');
    ...
    const box = page.locator('.z-chosenbox:has(.z-chosenbox-item)').first();
    await box.locator('.z-chosenbox-item').first().click();
    await page.mouse.move(0, 0);
    await expect(page.locator('.z-chosenbox-item-focus')).toHaveCount(1);
    await padShot(page, box, 'chosenbox-chip-focus.png');
  });
```

**執行結果**
- `--list -g "chosenbox dropdown chip focus"`：1 test。
- `--update-snapshots=missing -g ...`：第一次寫入 baseline（Playwright 該次回報 failed，因 baseline 不存在）；第二次 passed。
- 之後不加 update 連跑 3 次：3/3 passed。

**git status --short zkpreview/doc/screenshots（非 ` M` 部分）**
```
?? zkpreview/doc/screenshots/chosenbox-chip-focus.png
?? zkpreview/doc/screenshots/chosenbox-dropdown.png
?? zkpreview/doc/screenshots/combobox-dropdown.png
?? zkpreview/doc/screenshots/searchbox-dropdown.png
```
doublebox / decimalbox / combobutton 的 PNG 未出現在 status（未修改）。

## 第二輪：重新產生 6 張（2026-10-06）

使用者核准只重新產生 6 張失敗的 chromium 截圖：doublebox / decimalbox / combobutton 的 hover 與 focus。

### 指令

```bash
cd /Users/hawk/Documents/workspace/ZK10/zk/zkpreview
PREVIEW_URL=http://127.0.0.1:8085 npx playwright test --config src/test/playwright/playwright.config.ts --project=chromium --list
PREVIEW_URL=http://127.0.0.1:8085 npx playwright test --config src/test/playwright/playwright.config.ts --project=chromium --update-snapshots -g "(doublebox|decimalbox|combobutton) .*(hover|focus)"
PREVIEW_URL=http://127.0.0.1:8085 npx playwright test --config src/test/playwright/playwright.config.ts --project=chromium
```

使用 bare `--update-snapshots`（非 `=all`），`-g` 只符合 6 個測試，6 個全部 passed。未執行 forced-colors-gallery project。

### git status 前後比較（zkpreview/doc/screenshots）

- 之前：31 項（27 張已修改 PNG + 4 張未追蹤新 PNG：combobox-dropdown、searchbox-dropdown、chosenbox-dropdown、chosenbox-chip-focus）。
- 之後：37 項。
- 差異恰為新增 6 項 ` M`：combobutton-focus、combobutton-hover、decimalbox-focus、decimalbox-hover、doublebox-focus、doublebox-hover。
- 其他項目不變；沒有任何 `*-forced-colors.png` 變動。

### chromium 全跑（不更新）

130 passed、0 failed（1.8m）。
