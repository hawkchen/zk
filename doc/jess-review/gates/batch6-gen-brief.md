# 第六批 Generator brief（#18 #19 #24 #26 #27）

你是 Generator。只改 CSS，不開瀏覽器量測、不碰看板與計畫文件、不 commit。Verifier 之後會在**不看你 diff** 的情況下用像素與 computed style 判定。#22 已涵蓋、#25 暫停，**都不要動**。plain slider（`.z-slider` 根元素與 thumb）不要動。

## 可改的檔案（只有這五個）
- `zul/src/main/resources/web/js/zul/wgt/css/combobutton.css`（#18 #19）
- `zul/src/main/resources/web/js/zul/wgt/css/rating.css`（#27）
- `zul/src/main/resources/web/js/zul/inp/css/slider.css`（#26，只動 `.z-slider-input` 與其 focus；不要動其他規則）
- `../zkcml/zkmax/src/main/resources/web/js/zkmax/slider/css/multislider.css`（#24）
- `../zkcml/zkex/src/main/resources/web/js/zkex/slider/css/rangeslider.css`（#24）
build 與 `.css.dsp` 依 `.claude/skills/marble-theme/SKILL.md`（先讀）。只用 `--zk-` token，不寫死色值，不加 `!important`（非加不可就註明原因）。註解與英文 commit 風格比照檔案內既有註解。

## #18 combobutton：hover／active 落在游標底下的那一半
DOM：`.z-combobutton > .z-combobutton-content(含 ::before 狀態層) > .z-combobutton-text + .z-combobutton-button(絕對定位 32px，filled 有不透明底、toolbar 透明)`。今天狀態層是整個 `.z-combobutton:hover/:active .z-combobutton-content::before`，箭頭在其上方（filled 蓋住所以箭頭沒反應）。
- 要求（filled 與 toolbar 都要）：hover／按住箭頭 → 只有箭頭矩形變（相對靜止 ΔE ≥ 2），標籤矩形不變（ΔE ≤ 1）；hover／按住標籤 → 只有標籤變、箭頭不變（ΔE ≤ 1）。今天 filled hover 標籤 ΔE 6.88、按住 10.37，toolbar 約 4／6，**標籤那一半的強度請維持今天的 hover／active 透明度 token**（不改 token）。
- 不得改變：focus 狀態（Tab 聚焦整顆標籤色塊與焦點環）、`z-combobutton-open` 的外觀、停用外觀、兩段的寬高與分隔線（content 116×36、button 32×36、1px 分隔）。範圍只含 hover 與 active。
- 提示：`:has()` 可用（`.z-combobutton-content:has(.z-combobutton-button:hover)`）；箭頭需要自己的狀態層（例如 `.z-combobutton-button::before`，用 `--zk-combobutton-overlay-color` 與既有 hover／active opacity token；toolbar 的色見現有 `.z-combobutton-toolbar` 規則）。

## #19 停用的 combobutton 箭頭底色
`--zk-color-disabled-container` 是半透明（`#0000001f`）。停用時 `.z-combobutton-content` 與 `.z-combobutton-button`（button 是 content 的子元素、疊在上面）都塗了一層，button 因此比標籤深（196 vs 224，ΔE 10）。
- 要求：停用的 filled combobutton 箭頭矩形與標籤矩形底色 ΔE ≤ 1。保護：停用 toolbar 兩段仍同色（今天都透明）；停用文字／圖示色不變；啟用狀態兩段同色（不得變）。

## #24 multislider／rangeslider：游標範圍與 hover 環
- 游標：今天 `.z-multislider`、`.z-rangeslider` 根元素是 `cursor: pointer`，整個外框都是 pointer。要求：thumb（距中心 ≤ 10px）保持 `grab`（按住 `grabbing`）；**今天「點了會動」的元素**（`.z-sliderbuttons-area`、`.z-multislider-track`／`.z-rangeslider-track`、mark label 與 mark dot）維持 `pointer`；其餘（外框 padding、裸露的 `.z-sliderbuttons` 包覆層等不會動的區域）改為 `default`。**不要把任何不可點的區域變成可點**（行為在 JS，不歸這裡）。
- hover 環：今天 `.z-multislider:hover .z-sliderbuttons-button::before { opacity: var(--zk-state-hover-opacity) }`，整個 widget hover 時**所有** thumb 都亮環。要求：只有游標底下那一顆 thumb 亮（`.z-sliderbuttons-button:hover::before`）；停在軌道上、其他 thumb 不亮。rangeslider 同。
- **不要動** `:focus-within` 的環（Jess 沒寫，follow-up）、z-index、停用外觀（停用 widget 游標代理值維持 `auto`）。

## #26 slider knob 輸入框改 inline 樣式
`.z-slider-input`（`<input type=number>`，今天有 `background-color: surface-container`、`border: 1px solid outline`）。比照框架 inplace 輸入框（`input.css:201-210`）：
- rest（未聚焦）：無底色（透明）、無可見邊框；文字樣式（color／weight／size／align／family）完全不變；輸入框矩形大小與位置不變（±0px）。
- focus：回到一般輸入框的聚焦外觀 = 一般 textbox 的聚焦環（`2px solid var(--zk-color-primary)`，看 `input.css` 的 focus 規則怎麼做；不使用瀏覽器預設 outline）；**rest 與 focus 之間文字與輸入框矩形不得位移**（border 用 box-sizing 與 padding 補償，比照 textbox 的做法）。
- forced-colors 下輸入框要仍可辨認（既有 `_forced-colors.css` 已有規則；若需要動它，**停下回報**，不要自己改）。

## #27 rating：停用／唯讀游標
`.z-rating` 外層 `cursor: pointer`（`rating.css:22`），而 readonly／disabled 的 `<i>` 是 `pointer-events:none`，滑鼠實際落在外層。要求：readonly 與 disabled 的 rating（水平與垂直）星星中心、間隙、外層任一點游標皆為 `default`（或 `auto`）。保護：可互動 rating 的星星中心游標 `pointer`、hover 放大與著色、點擊行為不變。只動游標；不碰 `iconSclass` 相關規則。可互動 rating 星星之間的間隙游標可以是 default（不判定）。

## 回報
改了哪些行與理由、build 指令與結果、任何預期之外的發現。最多 3 輪；任何一項純 CSS 做不到、或原因出在 ZK 本身，**說明並停手，不要改 TS／Java**。
