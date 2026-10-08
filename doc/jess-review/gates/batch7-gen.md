# Gate：第七批 GEN（A 線，#29 #3）

未開瀏覽器、未 commit、未重啟 preview server。只改兩個 CSS 檔。

## #29 `selectbox.css`（D52-A）
- 在 `@supports (appearance: base-select)` 內的 `.z-selectbox::picker-icon`：移除 `font-size: 16px`（原本畫瀏覽器預設 ▼ glyph），改成與 combobox 相同的 chevron-down mask：`content: ''`、`width/height: 14px`、`background-color: currentColor`、`mask-image: url(~./zul/img/marble/chevron-down.svg)`（含 -webkit- 前綴、contain、no-repeat、center）。
- 加 `margin-right: -4px`：14px 盒內 chevron ink 左右各留白約 3px，若不補償，右緣距會 ≈ 16px；父層 `padding-right` 為 12px + 1px border，-4px 後預期 ink 右緣距約 12px（combobox 為 12.08）。**此值未經瀏覽器驗證，需 Verifier 量。**
- 顏色仍為 `--zk-color-on-surface-variant`（經 currentColor）；`transition` 與 `:open` 的 `rotate(180deg)` 規則未動；`appearance:none` 後備路徑（`background-image`）完全沒碰；外框尺寸、文字位置、disabled/hover/focus 規則未動。
- 風險點：盒子由 16px font-size 的 inline 盒（10.55×24）變成 14×14 的 flex item，垂直置中靠 `align-items:center`；旋轉中心變為 14px 盒中心，與 chevron ink 中心重合，預期比現況更接近精確鏡像。

## #3 `listbox.css`（D53-A）
- `.z-listhead-bar` 的 `background-color` 由 `var(--zk-color-surface-container)`（#f0f4fa = rgb(240,244,250)）改為 `transparent`。理由：其他表頭 cell（`.z-listheader`、`.z-listhead`、`.z-listbox-header`）都是 `transparent`，疊在 listbox 白底上，所以 `transparent` 即「表頭其他部分的同一個底色」。bandbox popup 內的 listbox 同樣疊在白色 `.z-listbox` 上。
- `border-bottom`、`.z-listhead-border`、捲軸、欄寬皆未動。

## 建置
- `node scripts/build-css.js --module zul` → `CSS build complete for --module zul (minified).`
- `npm run lint:css` → 無輸出、無錯誤（stylelint 通過）。
- `git diff --stat`：listbox.css 4 行（+3/-1）、selectbox.css 17 行（+16/-1）；共 2 files changed, 19 insertions, 2 deletions。
