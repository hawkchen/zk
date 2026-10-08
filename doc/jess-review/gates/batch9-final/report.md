使用 8105

# Jess review B 線批次 9 — GATE9-FINAL 報告（2026-10-08）

- 預覽站：`http://127.0.0.1:8105`（B 線，jess-b worktree，已伺服新 build）。本目錄只新增量測腳本、原始 JSON、截圖與 Playwright 輸出／log；未修改任何 CSS／TS／Java／預覽頁／baseline／文件，未 commit，未 `--update-snapshots`。
- 範圍：只量 #66（J66-1 與 P66-a～d）、#71（J71-1、J71-2 與 P71-a～d）。#72、#1 等使用者裁示，未量。
- 方法：`lines/line-b-plan.md` 第七節 J66、J71，加第八節「方法定稿修正」第 4、5、6 點（P66-c hover 版、P71-b 用 `offsetWidth/offsetHeight`、J66 先等 `#zk_err` rect 穩定）。RED 的 `red66.js`、`red71.js` 原本就含這三點，故直接複製為 `final66.js`、`final71.js`，只改輸出檔名（`diff` 對照 RED 原檔：各只有輸出檔名那幾行不同；`lib.js` 完全相同）。判定值未動。
- 工具：Playwright 1.59.1（jess-b `zkpreview/node_modules`），Chromium，viewport 1280×900，DPR 2，與 RED 相同。

## 一、build 確認

- `GET /web/loading.zul` → 200，頁面引用 `/zkres/web/80d82a3d/zul/css/zk.wcs;jsessionid=…`。
- 同一 session 取回 `zk.wcs`（539,410 bytes），grep 到 `.z-error #zk_err-remove-btn{order:1}` → 是新 build。
- 另順手看到 `.z-loading-indicator{…display:flex;align-items:center;gap:…}`（只做新舊確認，未據此決定量法）。

## 二、結論摘要表

| 編號 | 判定 | RED 數值 | 現在數值 | 通過／失敗 |
|---|---|---|---|---|
| J66-1 | 關閉鈕右緣 > 重新整理鈕右緣，且與 `#zk_err-p` 內容右緣 ≤ 1px | 關閉鈕右緣 820、重新整理鈕 864；關閉鈕距內容右緣 44px | 關閉鈕右緣 **864**、重新整理鈕 820；關閉鈕距內容右緣 **0px**（1 筆與 2 筆相同） | **通過** |
| P66-a | 兩鈕可見、各 32×32；`.errornumbers` 右緣 ≤ 較左鈕左緣 | 32×32；776 ≤ 788 | 32×32、皆可見；`.errornumbers` 右緣 776 ≤ 較左鈕（重新整理）左緣 788 | 通過 |
| P66-b | 錯誤圖示在最左、24×24 | `::before` 24×24；紅色像素 x 425–447 | `::before` 24×24；紅色像素 x 425–447、y 33–55（內容左緣 424，+1px）；右緣 447 < `.errornumbers` 左緣 460 | 通過 |
| P66-c（hover 版） | 游標停在重新整理鈕上關閉鈕不換位；點關閉鈕後 `#zk_err` 消失 | 不換位；消失 | hover 後關閉鈕 rect 不變（moved=false）；點關閉鈕 800ms 後 `#zk_err` 自 DOM 移除 | 通過 |
| P66-d | 1 筆與 2 筆錯誤順序一致 | 關閉 x=788、重新整理 x=832 | 兩次皆 重新整理 x=788、關閉 x=832（sameOrder、sameX 皆 true） | 通過 |
| J71-1 | 全頁 `.z-loading` 上下／左右間距差 ≤ 1px | 上 16／下 21／左 24／右 24，垂直差 5 | 上 16／下 **16**／左 24／右 24 → 垂直差 **0**、水平差 0 | **通過** |
| J71-2 | 元件級 `.z-apply-loading` 同上 | 同上，垂直差 5 | 上 16／下 **16**／左 24／右 24 → 垂直差 **0**、水平差 0 | **通過** |
| P71-a | absolute、z-index 高於遮罩、cursor wait | 1450 > 1449；89500 > 89000 | 全頁：absolute、1450 > `.z-modal-mask` 1449、wait；元件級：absolute、89500 > `.z-apply-mask` 89000、wait | 通過 |
| P71-b | 圖示 20×20（offset）、仍在轉；圖示與文字垂直中心差 ≤ 1px | 20×20；轉動；差 0 | offsetWidth/Height 20×20（旋轉中 bbox 25.4／21.3）；265ms 內 transform 矩陣改變、像素變動 312/2704（全頁）、306/1936（元件級）；中心差 0／0 | 通過 |
| P71-c | 單行；圓角、陰影、底色不變 | 1 rect、nowrap；12px；`rgba(0,0,0,.12) 0 4px 12px, rgba(0,0,0,.14) 0 2px 4px`；rgb(232,238,247) | 1 rect、nowrap；12px；陰影同 RED 字串；rgb(232,238,247) | 通過 |
| P71-d | 框相對螢幕位置（ZK inline left/top 置中）不因本修改移動 > 1px | 全頁 inline 569.5／421.5，中心對 viewport 偏 (−0.21, 0)；元件級 152／521，對 demoWin 偏 (−0.23, 0) | 全頁 inline 569.5／**424**，中心偏 (−0.21, 0)；元件級 152／**523.5**，對 demoWin 偏 (−0.23, 0)。框高 57 → 52（少掉的 5px 就是 RED 的多餘下方間距） | **中心讀法：通過（0px）；上緣讀法：失敗（2.5px）**，見第五節第 1 點 |
| 回歸 | component-theming、hit-target、focus-scan | — | 167 passed、47 skipped、0 failed | 通過 |

## 三、各 issue 細節

### J66 runtime-error（`final66.js` → `final66.json`，截圖 `final66-1err.png`、`final66-2err.png`）

- 觸發：點「Trigger Error」／「Trigger Multiple Errors」，輪詢 `#zk_err` rect 連續兩次相同後才量（第八節第 6 點）。
- `#zk_err` [400,16,480×105]（2 筆：×125）；`#zk_err-p` [400,16,480×57]，padding 12/16/12/24 → 內容右緣 880 − 16 = 864，與 RED 相同。
- `#zk_err-refresh-btn` [788,28,32×32]（右緣 820）；`#zk_err-remove-btn` [832,28,32×32]（右緣 864 = 內容右緣，距離 0）。兩鈕 x 座標與 RED 恰好互換，`.errornumbers` [460,34,316×20] 未動。
- 圖示紅色像素邊界與 RED 完全相同（x 425–447、y 33–55）。
- 行為：hover 重新整理鈕 250ms 後關閉鈕 rect 不變；點關閉鈕 800ms 後 `#zk_err` 不存在。點重新整理鈕（觀察項，非判定）：1.5s 內無導航、`#zk_err` 移除，與 RED 相同。
- 2 筆錯誤：`.messages` 為單一元素含兩行，按鈕位置與 1 筆完全相同。

### J71 loading（`final71.js` → `final71.json`，截圖 `final71-global.png`、`final71-component.png`）

- 動畫處理同 RED：關閉其他元素的 transition/animation，圖示保持旋轉。
- 全頁：`.z-loading` [569.5,424,140.58×52]，`.z-loading-indicator` [593.5,440,92.58×20]，icon offset 20×20，文字 Range rect [625.5,442,60.58×16]。間距 上 16／下 16／左 24／右 24。
- 元件級：`.z-apply-loading` [152,523.5,159.55×52]，indicator [176,539.5,111.55×20]，icon 20×20，文字 [208,541.5,79.55×16]。間距同上。
- 旋轉：全頁 transform 由 `matrix(0.550,-0.835,…)` 變為 `matrix(0.448,0.894,…)`（265ms），animation-name `z-loading-spin`、running；元件級同。
- 圖示中心 y = 文字中心 y（450／549.5），差 0。
- 框寬與 RED 相同（140.58／159.55），高度 57 → 52；ZK 重新以 inline left/top 置中後，中心對 viewport／對 demoWin 的偏移與 RED 一致（−0.21,0／−0.23,0），上緣下移 2.5px。

## 四、回歸結果

- 指令：`cd zkpreview && PREVIEW_URL=http://127.0.0.1:8105 npx playwright test --config src/test/playwright/playwright.config.ts --project=component-theming --project=hit-target --project=focus-scan --reporter=list --output <本目錄>/pw`。log：`pw-regression.log`。
- 指 port 的方式：`playwright.config.ts` 的 `baseURL: process.env.PREVIEW_URL ?? 'http://localhost:8085'`，沒有寫死，以環境變數指到 8105（`verification.md` 亦說明用 `PREVIEW_URL` 覆寫）。
- 寫入檢查：這三個 project 都不用 `toHaveScreenshot`，不碰 `doc/screenshots`；`focus-ring-scan.spec.ts` 只在 `FOCUS_SCAN_UPDATE=1` 時才寫 `doc/focus-ring-known-clips.json`，本次未設。跑完 `git status` 確認該檔未變、`doc/screenshots` 未變；`--output` 指到本目錄 `pw/`（全數通過，無 artifact 產出）。
- 結果：**167 passed、47 skipped、0 failed，exit 0（2.4 分鐘）**。分項：component-theming 107 passed；hit-target 3 passed；focus-scan 57 passed、47 skipped（spec 自己對不掃的頁面 `test.skip`，與本批無關）。
- 已知失敗（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）屬 `tablet`／`gallery` project，不在本次範圍；本次三個 project 沒有任何失敗，因此沒有可歸因於 `.z-error`／`.z-loading`／`.z-apply-loading` 的新失敗。

## 五、方法缺陷或歧義（不自行修改，如實回報）

1. **P71-d 有兩種讀法，結果相反。** 條文是「框相對於螢幕的位置（ZK 以 inline left/top 置中）不因本修改移動超過 1px」。修掉 RED 的 5px 多餘下方間距後框高由 57 變 52，ZK 的置中演算法把 inline top 由 421.5 改為 424（元件級 521 → 523.5），即上緣移了 2.5px；但框的**中心**對 viewport／對目標元件的偏移與 RED 完全相同（0px 變化）。括號裡「ZK 以 inline left/top 置中」看起來是在說明位置由 ZK 置中決定、修改不該讓框偏離置中，依此讀法通過；若按字面取 inline top 或上緣，則失敗 2.5px。本報告的結論行採中心讀法；若 Planner 採上緣讀法，本 gate 應改為 FAIL。
2. P66-d 的「順序一致」本次兩案皆為 重新整理→關閉（左→右），與 J66-1 的新順序一致；但 RED 腳本的 `order1/order2` 欄位記錄的是 `[remove.l, refresh.l]`，JSON 裡的 [832,788] 讀起來像「關閉在左」，實際是關閉在右，閱讀 `final66.json` 時請注意欄位順序。
3. 第八節第 4、5、6 點在 RED 腳本裡已經是這樣寫的（RED 報告缺陷 6、7、8 就是從腳本行為反寫回方法），因此本次「依修正後方法」沒有改到任何量測邏輯；若 Planner 原意是要另立新量法，請指出差異。

GATE9-FINAL: PASS
