# Batch 3 (grid) Generator 報告

只做 implement + build；沒有開瀏覽器、沒有量測、沒有跑 screenshot test、沒有 commit。所有視覺結果皆未驗證，交給 Evaluator。

## 修改的檔案

### 1. `zul/src/main/resources/web/js/zul/grid/css/grid.css`

- **#38**（約 :229-231、:378-380）：`.z-row-odd:hover` 與 `.z-row.z-grid-odd:hover` 的 `background-color` 由 `color-mix(8% on-surface, stripe)` 改為 `var(--zk-grid-row-hover-bg)`。兩條都必須保留：`.z-row.z-grid-odd`（0,2,0）宣告在 `.z-row:hover` 之後，若刪掉 odd hover 規則，stripe 會蓋過 hover。Knob 名稱與預設值不變，現在偶數與奇數 row 都由它驅動。
- **#36**（約 :313-317）：`.z-group` 移除 `cursor: pointer`；`.z-group-icon` 的 `cursor: pointer` 保留。Group hover 顏色未動。
- **#35 + #39**（原 :438-445 的 `.z-column-sorticon`，現約 :436-475）：
  - `.z-column-sorticon` 改為 `position:absolute; top:50%; right:var(--zk-spacing-1); transform:translateY(-50%)`，移除 `margin-left` 與 `vertical-align`。Sort icon 離開文字流，label 起點與 body cell 一致，align=center 不再偏移，也不改欄寬／row 高。12px icon + 4px right 剛好落在 16px 的 cell padding 內。
  - 有 column-menu button 的欄：`.z-column:has(.z-column-button) .z-column-sorticon { right: calc(var(--zk-spacing-1) * 2 + 24px) }`，讓 sort icon 在 button 左側。
  - `.z-column .z-column-sorticon [class*="z-icon-"] { margin-left: 0 }`，抵消既有 `.z-column [class*="z-icon-"]` 的 4px margin。
  - 箭頭 glyph：只在 `.z-column-sorticon .z-icon-caret-up/-down` 覆寫 `--_icon`（inline data URI，Lucide arrow-up / arrow-down）。純 CSS，沒有碰 TS。Glyph 的定義在 build 時由 `scripts/build-css.js` 產生（`.z-icon-{name}{--_icon:...}` 進 norm.css.dsp），base 的 `::before` mask 吃 `--_icon`，所以 override 這個變數即可。Listbox / tree / combobox 的 caret 與 column-menu button 的 caret 不受影響。

### 2. `zul/src/main/resources/web/js/zul/mesh/css/frozen.css`

- **#38 frozen**（約 :121-124）：`.z-grid:has(.z-grid-frozen) .z-row-odd:hover` 與 `.z-row.z-grid-odd:hover` 合併為一條，值為不透明的 `color-mix(in srgb, on-surface 4%, surface)`，與偶數列的 frozen hover 規則相同。原本最後那條 `.z-row.z-grid-odd:hover`（8% over surface-container-lowest）已刪除。Frozen cell 仍是 `background-color: inherit`，維持不透明。
- **#37**（檔尾 `@layer zk-components` 內，約 :166-180）：加入 N = 1..4 四條規則（合併成一個 selector list），`box-shadow: inset -1px 0 0 var(--zk-color-outline-variant)`，上方有註解寫明已知限制（first cell colspan、超過 4 個 frozen column、需要 smooth frozen 的 header marker 與 `:has()`、group row 無線）。與既有 header 的 `.z-frozen-col` 規則不衝突（那些選的是 header 與 `.z-row-inner.z-frozen-col`，body cell 實際不帶該 class）；hover 規則只動 background，不動 box-shadow。

## 指令與結果

- `node scripts/build-css.js --module zul` → "CSS build complete for --module zul (minified)."，成功。
- `npm run lint:css`（stylelint）→ 無輸出，通過。
- 沒有動 TS，所以沒跑 `npm run lint -- zul/...`。
- 驗證 build 產物（`zul/codegen/resources/web/js/zul/...`）：
  - `grid/css/grid.css.dsp`：含 `.z-column-sorticon{...position:absolute...}`、`.z-column-sorticon .z-icon-caret-up/-down{--_icon:...}`（含 `M12 19V5` / `M12 5v14` path）、兩條 odd hover 已是 `var(--zk-grid-row-hover-bg)`、`.z-group{...}` 已無 cursor。
  - `mesh/css/frozen.css.dsp`：含 `inset -1px 0 0 var(--zk-color-outline-variant)`；minifier 把 `:nth-child(1)` 改寫為 `:first-child`（語意等價）。

## Docs / spec

`doc/spec/component-theme-variables.md` 與 `doc/contracts/*.md` 中沒有描述舊的 sort-icon 位置、舊的 group cursor、或舊的 odd-row 8% hover 的敘述（grid contract c9 只寫 hover ≈ rgba(0,0,0,0.04)，與新行為一致）。因此沒有修改任何 doc。

## 未完成 / 注意事項（給 Evaluator）

1. **Frozen grid 的 hover 不隨 knob 變動**：frozen 規則為了維持不透明，一直用 literal `color-mix(4% on-surface, surface)`，偶數列本來就如此。覆寫 `--zk-grid-row-hover-bg` 時，非 frozen 列會變、frozen 列不會。預設值下兩者視覺等價（rgba(0,0,0,.04) vs on-surface 4% over surface，on-surface 不是純黑，有微小差異，需量測確認）。
2. **有 column-menu button 的欄**：sort icon 移到 button 左側（right = 32px），但沒有為它加 padding-right 保留空間，label 很長時可能與 icon（及原本就會蓋住 label 的 hover button）重疊。我不想為此改 padding，因為會讓 align=center 的 header 偏離 body 文字中心。需要 Evaluator 在有 menupopup 的欄位量測確認是否接受。
3. **窄欄 + 長 label**：icon 放在右側 16px padding 內，label 的 ellipsis 邊界與 icon 剛好相接，不重疊，但需要實測。
4. **#37 巢狀 grid**：selector 是後代組合，若外層 grid 有 frozen column，其 cell 內巢狀的 grid/listbox 的 row 第 N 個 child 也可能被畫線（極端情況，未處理）。
5. `.z-column:has(img)` 的 4px padding 欄位，sort icon 的 12px+4px 會超出 padding 一些；未處理。
6. `.z-column-sorticon` 沒加 `pointer-events:none`（不在 scope 內）；click 會冒泡到 th，行為不變。
7. 沒有動 listbox/tree 的 header 規則（4px 問題 out of scope）。#34 未動。

## Round 2（#37 nested widget 修正）

- 缺陷：body 分隔線規則用 descendant combinator，frozen 外層 widget 的 cell 內若有巢狀 grid/listbox/tree，內層 rows 也會被畫線。
- 修正（僅 `zul/.../mesh/css/frozen.css`）：改為精確 child chain。
  - header 偵測：`:is(.z-grid,.z-listbox,.z-tree):has(> :is(.z-grid-header,.z-listbox-header,.z-tree-header) > table > tbody > :is(.z-columns,.z-listhead,.z-treecols) > .z-frozen-col:nth-child(N))`，`:not(:has(... N+1))` 同樣用 child chain。
  - body：`> :is(.z-grid-body,.z-listbox-body,.z-tree-body) > table > tbody > :is(.z-row,.z-listitem,.z-treerow) > :nth-child(N)`（N=1..4）。
  - DOM 依據：grid/listbox/tree 的 mold（widget > body div > table#-cave > tbody > tr；tree 的巢狀 treechildren 不輸出 tbody，所有 treerow 都在同一個 tbody）。
- Known limits 註解：colspan 改寫為「not supported」，並補充 child chain 說明。
- 驗證：`node scripts/build-css.js --module zul` 成功；`npm run lint:css` 通過；未做視覺/Playwright 量測。
