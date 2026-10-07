# 第四批 Generator brief（biglistbox #31、#78）

給 Sonnet Generator。只實作與 build，不做驗證、不開瀏覽器量測、不改看板。

## 裁示
D39-A：垂直軌道不蓋表頭；放得下的方向完全不畫軌道。D40-A：thumb 照文件捲軸靜止狀態（`--zk-color-outline-variant`、8px、圓角、距邊緣與文件一致、**無槽**）。**做不到就停下回報，不要硬湊**（D40 退路是轉 C）。

## 要改的檔
- `../zkcml/zkmax/src/main/resources/web/js/zkmax/big/css/biglistbox.css`（`.z-biglistbox-wscroll-*` 那一段，約 97–217 行）
- 文件：`doc/contracts/biglistbox.md`（sc1、sc2、sc6 改成新行為，sc6 的「常駐槽」退掉）、`doc/spec/DESIGN.md` 與 `.claude/skills/zk-component-rules/components/biglistbox.md` 中描述 biglistbox 捲軸的段落。
**不得改：** `Biglistbox.ts`、`WScroll.ts`、任何 JS/Java、任何測試、`doc/screenshots/`。需要動它們才能做到，就停下回報。

## 已實測可行的做法（Verifier 在頁內注入驗證過，見 `gates/batch4-red/feas.js`、`feas.json`、`gates/batch4-red-r2.md`）
- 軌道 div 的幾何是純 CSS，JS 不碰；thumb 位置由 JS 算（相對軌道頂，含表頭高度），所以**不要把軌道往下移**（會雙重位移）。
- 軌道 `.z-biglistbox-wscroll-vertical/-horizontal` 設 `visibility:hidden`，`.z-biglistbox-wscroll-drag` 設 `visibility:visible`：命中測試穿過軌道、軌道不畫像素、不依賴表頭高度。
- `::before`（槽）設 `content:none`。
- `-drag` 底色改 `var(--zk-color-outline-variant)`，維持圓角 999px；寬／高維持 8px，`-drag` 與 `-pos` 必須同尺寸（`_gap = 0`，見檔內註解）。
- 位置：垂直 `left:6px`、水平 `top:4px`，目標是 thumb 距容器內框右緣／下緣與文件捲軸一致（文件：距右 0；因 `.z-biglistbox-outer` 溢出 1px，水平的目標是看得見的內框下緣 ±1px）。最終數值以 `gates/batch4-red/r2-doc-scrollbar.json` 為準。
- 保留：`-endbar` 的 `position:absolute; visibility:hidden`、`-pos` 的 `display:block !important; visibility:hidden`、箭頭 `display:none`（檔內註解說明了原因）。
- 不要硬寫顏色；沿用現有 token。

## 驗收（由別的 agent 做，你不做）
判定 1–4（#31）、判定 1、3、5、6、token 換色（#78）必須轉為通過，保護項維持通過。腳本在 `gates/batch4-red/r2-*.js`，你可以**讀**但不要拿來調整修法，也不要改它們。

## Build
照 `.claude/skills/marble-theme/SKILL.md` 的方式 build 這個 CSS（`.css.dsp` 才是 ZK 實際吐的檔），再跑對應的 stylelint。build 或 lint 失敗就停下回報。8085 可以重啟（不要開別的 port）。最多 3 輪；每輪回報改了什麼、build/lint 結果。

## 回報格式
改動檔清單與每個檔的重點、build/lint 輸出、任何你不確定或偏離上面做法的地方。不要 commit，不要 `git add`。
