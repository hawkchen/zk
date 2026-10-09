# Batch 14（C 線）Generator B 報告：S1 / S3 / S4

開工前 `git status --short` 確認 `_forced-colors.css`、`selectbox.css`、`screenshot.spec.ts` 都沒有未提交修改。未跑 preview、瀏覽器、Playwright 測試，未 commit，未更新 snapshot。只用了 `playwright test --list`（不啟動瀏覽器）確認測試被 config 收到。

## 變更清單

### S1：selectbox forced-colors 規則搬家
- `zul/src/main/resources/web/zul/css/tokens/_forced-colors.css`：在 (2e) 規則之後、`dnd drop glyph` 之前，於既有的 `@media (forced-colors: active)` 內新增 `(2e-cont)` 註解與獨立規則 `.z-selectbox::picker-icon { background-color: CanvasText; }`。刻意不併入 (2e) 的 selector list：瀏覽器若不認識 `::picker-icon`，整個 list 會失效並連帶拖垮 combobox 規則。沒有新增巢狀 `@media`、沒有 `!important`、沒有寫死顏色。
- `zul/src/main/resources/web/js/zul/wgt/css/selectbox.css`：刪除 `@media (forced-colors: active)` 區塊與其註解。檔內不再有 `forced-colors` 字樣。
- 行為說明：selectbox 規則原本在 layer／`@supports` 內，現在是 unlayered，同 specificity 下 unlayered 贏，結果與原來相同（與 combobox caret 同一機制）。

### S3：修空轉測試
- `zkpreview/src/test/playwright/screenshot.spec.ts`：測試更名為 `shell-is-bare-and-no-stripe`；第三條斷言改為 `stripeWidth === 0`；保留 `iconLeftFromContent >= 8`（訊息改為不提 stripe）；前兩條斷言不動；`no padding` 註解改為不再提 stripe。

### S4：捲軸欄位測試（新檔）
- `zkpreview/src/test/playwright/listhead-bar-screenshot.spec.ts`（新）。檔名刻意以 `screenshot.spec.ts` 結尾：`playwright.config.ts` 的 `chromium` project 用未錨定的 `/screenshot\.spec\.ts/`，所以**不需要改 config**（已用 `--list` 確認被收進 `chromium`）。檔頭有註解說明這一點。
- 檔案頂層 `test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } })`（放在 describe 內 Playwright 會拒絕）。只影響這一個檔案的 worker。
- 測試 1：`listbox-header.zul`，找第一個 `.z-listbox-body` 的 `offsetWidth > clientWidth` 的 listbox；斷言 `th.z-listhead-bar` 寬 > 0，且 computed `background-color` 等於同 listbox 第一個 `th.z-listheader` 的值。
- 測試 2：`bandbox.zul`，點 `Listbox in bandpopup` 範例（`'Bandpopup with Rich Content (Listbox)'` 區塊）的 `.z-bandbox-button`，量 `.z-bandpopup .z-listbox:visible`，斷言同上。
- 比較用 computed 值字串相等（不是 ΔE）。

## 已知風險，請 Verifier 注意
1. **bandbox 測試可能今天就在寬度斷言失敗：** 該 listbox `height="180px"`、只有 3 列（每列約 36–48px），可能不出現捲軸，那 `th.z-listhead-bar` 寬度會是 0 或欄位根本不存在（`querySelector` 回 null 會丟例外）。依你的規定我不能改 `bandbox-content.zul`。如果失敗，這是「頁面沒有捲軸」而非 CSS 問題，需要 Planner 決定是否在預覽頁加列數。我沒有量過。
2. `listbox-header.zul` 是否真有捲軸 listbox 也未實測；若找不到，測試 1 會在 `idx >= 0` 斷言失敗（訊息明確）。
3. 目前 CSS 是 `background-color: transparent`，兩者 computed 都是 `rgba(0, 0, 0, 0)`，今天預期兩條通過（若寬度條件成立）。

## Verifier 指令（`PREVIEW_URL=http://localhost:8085`，cwd 皆為 `/Users/hawk/Documents/workspace/ZK10/zk/zkpreview`）

S3（正向）：
```
./node_modules/.bin/playwright test -c src/test/playwright/playwright.config.ts --project=chromium -g "shell-is-bare-and-no-stripe"
```
S3（非空轉）：在 scratchpad 複本中，於 `beforeEach` 的 `page.goto` 之後用 `page.addStyleTag({content:".z-notification-content::before{content:'';display:block;width:4px}"})`，同一指令必須失敗。

S4（正向）：
```
./node_modules/.bin/playwright test -c src/test/playwright/playwright.config.ts --project=chromium listhead-bar-screenshot
```
S4（非空轉）：複本中於兩個測試的 `goto` 後注入 `th.z-listhead-bar{background:rgb(240,244,250)}`，兩個測試都必須失敗。

S1（用現有 forced-colors 工具，不是新測試）：
```
./node_modules/.bin/playwright test -c src/test/playwright/playwright.config.ts --project=forced-colors -g "selectbox"
```
另需先重建 `_forced-colors.css` 的 norm.css.dsp 輸出（`scripts/build-css.js`）並重啟 8085，再量 forced-colors 下 selectbox 箭頭 ink 與搬移前 ΔE ≤ 1。非 forced-colors 外觀不變。
