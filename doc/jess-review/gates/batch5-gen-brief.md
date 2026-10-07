# 第五批 Generator brief（#8 #12 #13 #16 #17）

你是 Generator。只改 CSS，不跑瀏覽器量測、不碰看板文件、不 commit。Verifier 之後會在不看你 diff 的情況下用像素與 computed style 判定。

## 可改的檔案（只有這三個）
- `../zkcml/zkmax/src/main/resources/web/js/zkmax/inp/css/chosenbox.css`
- `../zkcml/zkmax/src/main/resources/web/js/zkmax/inp/css/cascader.css`
- `zul/src/main/resources/web/js/zul/inp/css/combobox.css`
產生的 `.css.dsp`／build 檔依 `.claude/skills/marble-theme/SKILL.md` 的 Marble CSS build 流程產生。所有顏色、字級用 `--zk-` token，不寫死色值，不加 `!important`（若非加不可，註明原因）。

## 判定（今天都失敗，修完要過；數字取自 gates/batch5-red.md）
- **#12：** `.z-chosenbox-item-content` 與晶片（rest／hover／focus）：`font-style: normal`、`font-weight: 400`。italic 來自根元素 `<i class="z-chosenbox">`（`zkmax/inp/mold/chosenbox.js:21`）的瀏覽器預設，所以要在根元素（或晶片）把 `font-style` 設回 normal；weight 目前是 `--zk-typescale-label-large-weight`（chosenbox.css:55），改成 400（用現有的 body 級 weight token）。字級 14px、晶片高 28px 不得變。
- **#13：** 建立列 `.z-chosenbox-empty-creatable` 今天計算值是 `display:block`，所以 `gap`／`align-items` 無效。DOM：`<i class="z-chosenbox-icon z-chosenbox-create z-icon-plus-square">` + `<span>Add new …</span>`。要求：圖示右緣到文字左緣 ≥ 8px；圖示字形 ink 垂直中心與文字 ink 垂直中心差 ≤ 1px。保護：整列可點與 hover 色塊涵蓋整列（到 popup 內緣）；icon 左緣與 `.z-chosenbox-option` 文字左緣對齊（今天差 0，不得變）。
- **#16：** 說明文字元素是 `.z-comboitem-inner`（在 `.z-comboitem-text` 內 `<br>` 之後），主標籤是 `.z-comboitem-text` 的裸文字節點。說明：`color: var(--zk-color-on-surface-variant)`、`font-size: var(--zk-typescale-body-small-size)`；主標籤 color／size 不變。選取列的 color 設在 `li` 上，會一併套到說明文字，要處理使選取與 hover 狀態說明文字對比仍 ≥ 4.5:1。列高 56px、兩行不被截，不得變。
- **#17：** 唯讀 combobox（`.z-combobox[readonly]`、`.z-combobox-readonly`，combobox.css:319-329 附近）輸入框的選取反白不可見：`::selection` 背景透明、文字色維持原色（D48-A，純 CSS；`user-select:none` 在 Chromium 對唯讀 input 無效，不要用）。非唯讀 combobox 的反白必須維持。焦點環、Tab 聚焦、開下拉選項都不得受影響。
- **#8：** 單欄 cascader hover 時，色塊要延伸到 popup 內緣（今天 `.z-cascader-cave` 是 inline-block 160px，popup 以 inline `min-width` 為 trigger 寬，差 38px）。目標：最後一欄（或單欄）撐滿 popup 內寬，空帶不再是 popup 空白。**保護：雙欄今天已正好到內緣（0px）、popup 寬 = Σcave+2，不得改變；多層展開行為不變。** 若純 CSS 做不到、要動 `Cascader.ts`，**停下來回報 Planner，不要自己決定。**

## 回報
改了哪些行與理由（含任何預期之外的發現）、build 指令與結果。最多 3 輪；若某項判定的原因出在 ZK 本身而非樣式，說明並停手。
