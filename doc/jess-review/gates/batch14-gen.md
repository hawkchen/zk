# 第十四批 Phase 2 Generator 報告（C 線，P1–P4，純 CSS）

只改 CSS，沒有 build、沒有開瀏覽器、沒有 commit、沒有跑測試。沒有 `!important`、沒有寫死色碼，全用 `--zk-` token。

## 檔案與規則變更

### P1 `zk/zul/src/main/resources/web/js/zul/wgt/css/toast.css`
- `.z-toast-info .z-toast-icon`：`color: var(--zk-toast-accent)` 改為 `color-mix(in srgb, var(--zk-toast-accent) 80%, var(--zk-color-on-surface))`，加一則說明註解。`--zk-toast-accent` 仍驅動色相（旋鈕有效）。warning／error／close／底色未動。
- 對比算式（on-surface 取 RED 量到的 (29,30,32)，底 (224,232,244)）：混色 = (5.8, 107.6, 143.2)；線性化 (0.00176, 0.1488, 0.2756)，L = 0.2126*0.00176 + 0.7152*0.1488 + 0.0722*0.2756 = 0.1267；底 L = 0.8009；對比 = (0.8009+0.05)/(0.1267+0.05) = **4.82:1**（>= 4.5）。今天 3.68。N=80 是任務指定的起點，已達標，未再往 85 試。

### P2 `zk/zul/src/main/resources/web/js/zul/wgt/css/notification.css`
- content 底色：info = `surface-container-highest`、warning = `warning-container`、error = `error-container`（與 toast 同 token；文字色維持 `on-surface`，toast 也是 on-surface）。移除三條 `color-mix(... 12% ...)`。
- 箭頭：三種嚴重度各四個方向（-left -right -up -down）全部改為與該嚴重度 content 底色同一個實色 token（不再有 `status-*` 實色與 `12% transparent` 半透明），不會透出陰影。
- info 圖示：`color-mix(in srgb, var(--zk-color-status-info) 80%, var(--zk-color-on-surface))`；底與 toast info 同為 (224,232,244)，算式同 P1，對比 **4.82:1**（今天 3.88）。warning／error 圖示沿用 `on-*-container`（今天 7.40／9.19，底色換成 toast 的 container 後對比同 toast 的 6.65／7.75，皆 >= 4.5）。
- 註解：檔頭「tinted fill」改為「container fill」；variants 區新增說明箭頭與底色同實色的註解；移除「opaque tint」註解（現在是不透明 token，不需要）。

### P3 `zkcml/zkmax/src/main/resources/web/js/zkmax/nav/css/nav.css`
- 在 horizontal layout 區塊後、popup 區塊前新增兩條規則，仿 vertical／popup 的逐層縮排（每層 +26px）：
  - `.z-navbar-horizontal .z-nav > ul > .z-nav > .z-nav-content { padding-left: calc(var(--zk-spacing-4) + 26px); }`，標題 padding-left 16 -> 42，與同層 navitem（42px，來自 `.z-nav > ul .z-navitem-content`）相同，預期文字左緣 68.39 vs 68.89，差 0.5px。
  - `.z-navbar-horizontal .z-nav > ul > .z-nav > ul > .z-navitem > .z-navitem-content { padding-left: calc(var(--zk-spacing-4) + 52px); }`，第三層 navitem 為 68px = 標題 42 + 26。
- 沒動 position／overflow（巢狀清單被裁掉的缺陷依指示不修）；vertical 與 popup 規則未動，新規則只在 `.z-navbar-horizontal` 內。

### P4 `zk/zul/src/main/resources/web/js/zul/menu/css/menu.css`
- 在 `.z-menuitem-image` 區塊後新增 `.z-menupopup .z-menuitem-image, .z-menupopup .z-menu-image { margin: 0 1px; }`。image 仍 16px，但佔 18px 槽（與 iconSclass 18px 同寬）。
- 預期：image 列文字 +42 -> +44／43.5（iconSclass 列 +43.5／44，差 <= 0.5）；image 圖示中心 73.0 -> 74.0（= iconSclass 74.0，差 0）。圖示尺寸 16／18、列高、hover 層、右箭頭未動。#48（iconSclass 列＋巢狀 z-menu）沒有 image，不受影響。
- 水平 menubar 頂列不在 `.z-menupopup` 內，不受影響。

## 注意事項（供 Phase 3 驗證）
- P4：`.z-menupopup .z-menu-image` 也涵蓋 popup 內巢狀 `z-menu` 的 image（含 colorbox 色塊 chip），它們也會多 1px 邊距，與 image 列保持一致；量 standalone menupopup（全 image）時文字會由 +42 變 +44（整體一致右移 2px，互差仍 0.5）。
- iconSclass 列圖示 ink 比列中心高 1px 為既有現象（RED 發現 4），本批未處理。
- 未做任何 build／量測，以上位置與對比皆為算術預期，待 Phase 3 實測。
