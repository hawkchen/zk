# GATE15-FINAL-R2（C 線第 15 批：follow-up 9、13、14、19）

日期 2026-10-10。預覽 8085，Playwright。Verifier（Fable）在看不到 diff 的條件下獨立量測。

## 紅燈（修前實測）
- 第 9 節：60px 的 tab 內 `.z-tab-content` 寬 266px、`.z-tab-text` 寬 234px，標籤不縮。
- 第 14 節：平板 UA 下 frozen grid 表頭 th 左緣 `[33,433,433]`，內容列 `[33,233,433]`；桌面 `[33,233,433]`。th 的 `position: relative` 加上 ZK JS 寫入的 inline `left:200px`。
- 第 13 節：listbox、tree、grid 表頭與內容文字偏移，排序前後全部 0px，**不重現**。
- 第 19 節：平板 menubar 的 widget `_scrollable` 為 false（server 端 `setScrollable(true)` 在平板 UA 下沒有生效），**不是 CSS**。

## 根因
- 第 9 節：`.z-tab-content`、`.z-tab-text` 缺 `min-width: 0`；加上 `.z-tab-text` 是 flex 容器，`text-overflow` 對它無效。
- 第 14 節：LESS 時代的 `.z-frozen-sticky { position: sticky; z-index: 1 }` 在 `2100200284`（LESS 轉 Marble）漏掉。ZK 在 mobile 用 sticky 取代 translateX。footer 儲存格舊 LESS 就沒涵蓋。

## 修改
- `zul/.../tab/css/tabbox.css`：`.z-tab-content`、`.z-tab-text` 加 `min-width: 0`；新增 `.z-tab-text:not(:has(> *)) { display: block }`（只有純文字標籤；帶圖示的標籤維持 flex）。
- `zul/.../mesh/css/frozen.css`：補回 sticky 規則（grid、listbox、tree 的表頭、內容、group、detail、auxheader），並加上三種 footer（`.z-footer`、`.z-listfooter`、`.z-treefooter`）。
- 新測試：`tab-ellipsis-screenshot.spec.ts`、`frozen-sticky-tablet.spec.ts`（兩條：表頭對齊、tree footer 捲動後對齊）。
- baseline：`grid-tablet.png`、`listbox-tablet.png`（差異只在 frozen 區的 Col B 表頭）。

## GATE15 第 1 輪：FAIL
- A1：`.z-tab-text` 是 `display:flex`，省略號沒有畫出（文字被硬切成 "A ve"）。我的測試只驗寬度與 computed 值，沒驗到省略效果。
- B5：tree footer 的 frozen 儲存格拿到 `z-frozen-sticky` 但 `position: static`，平板捲動 200px 後與表頭差 200px。

## GATE15 第 2 輪：PASS
- A1：3 倍截圖看得到 "A …"；帶圖示、圖片加關閉鈕、accordion 版面不變，無重疊。
- A2：選取指示條寬度等於可見文字框（一般、強制 60px、closable 90px 三種）。
- A3/A4：19 + 4 個 tabbox 自然寬度無截斷；捲動箭頭與 tab 寬不變。
- B1–B4：平板 grid／listbox／tree 表頭與內容對齊；捲動 200px 後凍結欄不動、其餘欄 −200；桌面不變。
- B5：tree footer 儲存格 sticky、背景不透明（rgb 247,249,252）、捲動後對齊。grid／listbox 的 frozen 範例頁沒有 footer，沒有 group 列，無從量測。
- 已知且不變：accordion 與 left tab 的 `.z-tab-content` scrollWidth 比 clientWidth 多 7px（chevron 的 -7px margin），修前就存在。

## 回歸
tablet 57/57、chromium 135/135、gallery 82/82、component-theming 107/107。
