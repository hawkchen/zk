# Gate：第四批 RED run，biglistbox 捲軸（#31、#78）

- **日期：** 2026-10-07，Verifier，量現在的程式碼（8085，Chromium，viewport 1280×900，deviceScaleFactor 2，已注入 no-animation、等 `document.fonts.ready`，量測前游標移到 (2,2)）。
- **範圍：** D39-A（#31 兩件都修）、D40-A（#78 照文件捲軸靜止狀態）。
- **腳本與原始輸出：** `gates/batch4-red/`：`lib.js`（共用：幾何、截圖解碼、CIE76 ΔE、thumb 像素掃描）、`doc-scrollbar.js/.json/.png`（文件捲軸期望值）、`red31.js/.json` + `red31-*.png`、`red78.js/.json` + `red78-*.png`、`protect.js/.json` + `protect-*.png`、`feas.js/.json` + `feas-*.png`（可行性探針）。
- **沒有修改** 任何 theme/CSS/TS/Java 檔案，沒有看 diff。暫時頁 `zkpreview/src/main/webapp/web/biglistbox-fits.zul`（`FakerMatrixModel(2, 3)`、200px 高、沿用 biglistbox.zul 的 template）量完已刪除；8085 的 appRun 沒有重啟（ZK 仍快取著該頁的定義，`curl` 會回 200，重啟即消失，working tree 乾淨）。
- **選取 widget 的方式：** 預覽頁的 DOM id 是 uuid，`#stripedBiglist` 這類選擇器選不到；一律用 `zk.$('$stripedBiglist').$n()`。

## 結論摘要

| 項目 | 判定檢查今天 | 保護項今天 | 方法問題 |
|---|---|---|---|
| #31 判定 1（命中測試） | 3 個 widget 都命中 `.z-biglistbox-wscroll-vertical`，失敗，RED-correct | — | 無 |
| #31 判定 2、3、4（像素） | 全部失敗，**但最差像素是 widget 自己的 1px 邊框與圓角，不是軌道槽**（照字面寫法修好之後也過不了） | — | **METHOD-DEFECT（量測範圍）** |
| #31 保護項 | — | 全部通過（見下） | `#biglist` 預設模型**垂直不能捲**，「在 #biglist 滾輪往下／拖得動」照字面做不到 → **METHOD-DEFECT（前提）** |
| #31 也必須成立 | vflex=min 後判定 1 仍失敗；forcedColors 下判定 1 仍失敗（RED-correct） | — | 無 |
| #78 判定 1、5、6、token 換色 | 全部失敗，RED-correct | 判定 2（寬度 8=8）、判定 4（圓角）今天就相符 → 保護項（方法已預告 2/3 可能如此） | 判定 3 水平方向的「距下緣」定義不明（見下） |
| #78「品牌色」保護項 | `data-brand="copper"` **不會改變** `--zk-color-outline-variant`（維持 `#0000001f`），而且今天失敗（thumb 162 vs 224） | — | **METHOD-DEFECT（歸類）**：是判定不是保護項，且與判定 1 重複 |
| 可行性 | 純 CSS 可以同時達到 D39-A、D40-A（探針 F），見「可行性」 | — | — |

## 文件捲軸的期望值（`doc-scrollbar.json`）

- **量的是哪個元素：** `scrollbar.zul` 第 2 個 grid（`ca:data-embedscrollbar="true"` + `org.zkoss.zul.nativebar="false"`，即 **embedded 模式**）的 `.z-scrollbar-vertical-embed`，游標在 (2,2)（不在 grid 上）。
- **為什麼要這個模式：** overlay 模式（第 1 個 grid）靜止時什麼都不畫；頁首「State Gallery」是靜態 HTML，畫的是 hover 狀態（indicator + 箭頭），不是靜止狀態。所以**要量到「靜止狀態的捲軸」必須用 embedded 模式**，這一點方法裡沒寫，建議補上。
- **容器：** `.z-grid-body`（border 0），內框右緣 Rc = 271。底色 = body 內空白區中位數 = (255,255,255)。
- **掃描時踩到的坑：** grid 的列分隔線也是 `outline-variant`（224），而且橫穿捲軸 gutter，和 thumb 同色。單純「ΔE ≥ 門檻的像素」會把分隔線算進 thumb；`lib.scanThumb` 改成「沿長軸找最長連續段、且厚度 ≥ 3 device px」才排除掉。biglistbox 的 `#stripedBiglist` 水平軌道區也有同樣的 1px 列線（y = 376），同一招處理。

| 量項 | 垂直（判定依據） | 水平（僅記錄） |
|---|---|---|
| thumb 顏色（中位數） | **(224, 224, 224)**（= `--zk-color-outline-variant` `#0000001f` 疊在白底上，ΔE 0） | (224, 224, 224) |
| 寬度／高度 | **8px** | 8px |
| 與容器內框右緣／下緣距離 | **0px**（齊邊） | 0px |
| 圓角（最上一列：兩端 ≠ thumb 色、中心 = thumb 色） | 兩端 ΔE 10.82、中心 ΔE 1.06 → **是** | 兩端 10.82、中心 3.17（最左一欄剛好在反鋸齒邊上，略超 3；垂直才是判定依據） |
| 位置 | top 449 = body top，長 39px | left 33 = body left，長 122px |

## #31（D39-A）

幾何（viewport 座標，`R` = `.z-biglistbox-outer` 右緣 = border-box 右緣 − 1）：

| widget | box | H（head-outer） | B（body-outer） | R | 欄寬合計右緣 |
|---|---|---|---|---|---|
| `#stripedBiglist`（5×5，200px） | 32–1248 × 187–387 | 188–227 | 227–388 | 1247 | 683 |
| `#biglist`（預設 MultipleColumn 100 欄×10 列，500px） | 32–1248 × 400–900（捲頁後） | 401–440 | 440–901 | 1247 | 4063（欄填滿） |
| 暫時頁 `fitsBiglist`（2×3，200px） | 32–1248 × 112–312 | 113–152 | 152–313 | 1247 | 293 |

注意 **`B.bottom = box.bottom + 1`**：`.z-biglistbox-outer` 200px 放在 200px 的 border-box（1px 邊框）裡，往下溢出 1px；水平軌道（`bottom:0`）因此有 1px 落在邊框之下。這會影響判定 3、4 和 #78 判定 6 的「距下緣」（見方法問題）。

### 判定檢查（照字面量）

| 檢查 | stripedBiglist | biglist | fitsBiglist | 結果 |
|---|---|---|---|---|
| 1. `elementFromPoint(R−7, H 中心)` | `.z-biglistbox-wscroll-vertical` | 同 | 同 | 失敗，RED-correct |
| 2. 表頭帶 x∈[R−14,R−1]、y∈[H.top+2,H.bottom−2] 對同 y 參考色 (255) | 最差 ΔE **10.82**，在 (1246.5, 190)，色 224 | （方法排除） | 10.82，在 (1246.5, 115) | 失敗，**但最差像素是 widget 右上圓角的邊框**，不是槽 |
| 3. 右側整條 x∈[R−14,R−1]、整個 widget 高度 | （方法只對暫時頁；記錄 33.38 = thumb） | — | 10.82，在 (1241.5, 311.5)，色 224 | 失敗，**最差像素是 widget 的底邊框列**（y = box.bottom−1） |
| 4. 底帶 y∈[B.bottom−14,B.bottom−1]、x 在欄外 | 10.82，在 y=386.5 | （記錄）10.82 | 10.82，在 y=311.5 | 失敗，**同上，是底邊框** |

### 判定 2、3、4 的修正寫法與修正後今天的值

把像素帶限制在「border-box 內縮 1px（避開邊框）」、「y ≤ box.bottom − 2」、並排除四角各 10px 的圓角區，其餘不變（`red31.json` → `variants_cornerAndBorderSafe`）：

| 檢查（修正帶） | stripedBiglist | fitsBiglist | 今天 |
|---|---|---|---|
| 2 | ΔE **4.51**（槽 rgb 242） | 4.51 | 失敗，RED-correct |
| 3 | （thumb 33.38，不適用） | **9.06**（垂直槽與水平槽交疊處 rgb 229） | 失敗，RED-correct |
| 4 | 4.51 | 4.51 | 失敗，RED-correct |

圓角探針：(R−2, box.top+2) = 237、(R−2, box.bottom−3) = 248、底邊框列 (R−7, box.bottom−0.5) = 224。圓角半徑約 8px，10px 的排除區夠。

### 保護項（今天）

全部用真實滾輪／滑鼠（`protect.json`）：

| 項目 | 量到的值 | 結果 |
|---|---|---|
| 該有的軌道還在：striped 垂直 thumb | 像素 ΔE 28.87 ≥ 10，top 227 = B.top 227；與 `-drag` 元素 rect (1236,227,1244,275) 一致 | 通過 |
| 該有的軌道還在：biglist 水平 thumb | 像素 left 34 ≥ B.left 33（反鋸齒邊），34–81 × 890–898 | 通過 |
| 還能捲（垂直，**#stripedBiglist**） | 滾輪一次：第一列 `y = 0` → `y = 1`，`_currentY` 0→1，thumb top 40→41（widget 相對）；捲到底 thumb 41–89 在 B 40–201 內 | 通過 |
| 還能捲（垂直，**#biglist 切成 MultipleRow 10×100 之後**） | `y = 0` → `y = 2`，thumb 439→442；捲到底 `_currentY` 88，thumb 528–576 在 B 440–901 內 | 通過 |
| 還能捲（水平，#biglist 預設） | `mouse.wheel(120, 0)`：表頭 `Header x = 0` → `x = 2`，thumb left 34→35；捲到底 `_currentX` 91，thumb 124–172，右緣 ≤ R 1247、左緣 ≥ B.left 33 | 通過 |
| 拖得動（striped、biglist/MultipleRow） | 按在 `.z-biglistbox-wscroll-body` 中心往下拖 40px：`_currentY` 0→1（striped，只有 1 列可捲）、0→21（biglist） | 通過 |
| 表頭不動 | 以 widget 為基準的 H 位置在滾輪、捲到底、拖曳前後都相同（viewport 座標在本輪也相同） | 通過 |
| 表頭可以點（#biglist，(R−20, H 中心)） | 點前 sorticon `<i class="">`，點後 `z-icon-caret-up`（composer 的 comparator 有作用） | 通過 |
| #78 保護：放得下的 widget thumb 數 0 | 暫時頁兩條軌道都沒有 ΔE ≥ 10 的連續段 | 通過 |

**前提問題：** `#biglist` 預設模型是 `MultipleColumn`（100 欄 × 10 列），10 列全部放進 500px → 垂直 thumb `display:none`、`_currentY` 滾不動（Planner 的「現況量測」表也寫了「垂直 thumb display:none」，但「共用的量法」卻寫 `#biglist`（兩個方向都可捲））。垂直的滾輪／拖曳／夾制保護項在 `#biglist` 上照字面做不到；本輪改在 `#stripedBiglist` 做，並額外用頁面上的 Change Models → `MultipleRow` 讓 `#biglist` 變成兩個方向都可捲再做一次。

### 也必須成立（今天）

| 項目 | 量到的值 | 結果 |
|---|---|---|
| `#biglist` 切 vflex/hflex = min（頁面 radio）後判定 1 | 仍命中 `.z-biglistbox-wscroll-vertical`（R 變 1203、H 490–529） | 失敗，RED-correct |
| `forcedColors: 'active'` 下判定 1 | 3 個 widget 都命中 `.z-biglistbox-wscroll-vertical` | 失敗，RED-correct |

## #78（D40-A）

`--zk-color-outline-variant` 計算值 `#0000001f` → 疊白底 (224,224,224)。

### `#stripedBiglist` 垂直 thumb（判定 1–5）

| 檢查 | biglistbox 今天 | 文件捲軸 | 結果 |
|---|---|---|---|
| 1. 顏色 | (162,162,162)；對文件 ΔE **22.56**；對 outline-variant ΔE 22.56 | (224,224,224) | 失敗，RED-correct |
| 2. 寬度 | 8 | 8 | **相符 → 保護項**（方法已預告） |
| 3. 距內框右緣 | **3**（thumb 1236–1244，R 1247） | 0 | 失敗，RED-correct |
| 4. 圓角 | 兩端 ΔE 28.87、中心 2.62 → 是 | 是 | **今天就相符 → 保護項**（方法沒預告，但不在「必須失敗」清單內） |
| 5. 沒有槽 | thumb 下方 2–16px：最差 ΔE **4.51**（rgb 242）；thumb 上方沒有 body 範圍（thumb 從 B.top 起，上方是表頭區，歸 #31） | — | 失敗，RED-correct |

### `#biglist` 水平 thumb（判定 6 = 1–5 的水平版）

| 檢查 | 今天 | 結果 |
|---|---|---|
| 1. 顏色 | (162,162,162)，ΔE 22.56 | 失敗 |
| 2. 高度 | 8 | 相符（保護項） |
| 3. 距下緣 | 對「看得見的內框下緣」box.bottom−1 = 899：**1**（thumb 890–898）→ 差 ≤ 1 **相符**；對 B.bottom 901：3 → 不符 | **視定義而定（見方法問題 4）** |
| 4. 圓角 | 左端 33.38／右端 22.56、中心 0 → 是 | 相符（保護項） |
| 5. 沒有槽 | thumb 右側：ΔE 4.51 | 失敗 |

### token 換色、品牌色、只記錄項

| 項目 | 量到的值 | 結果 |
|---|---|---|
| `:root{--zk-color-outline-variant: rgb(255,0,0)}` | token 計算值確實變成 `rgb(255, 0, 0)`，thumb 仍 (162,162,162)，對紅 ΔE 105.43 | 失敗，RED-correct（今天寫的是 on-surface 38%） |
| `<html data-brand="copper">` | `--zk-color-outline-variant` **沒變**（仍 `#0000001f`）；thumb (162) vs 期望 (224) ΔE 22.56 | 今天失敗 → 不是保護項 |
| hover（記錄） | 靜止 (162) → hover (126)，ΔE 13.82 | 記錄 |
| `forcedColors: 'active'` thumb 可見？（記錄） | `-drag` rect 中心像素 (255,255,255) = 底色，ΔE 0 → **看不見**。對照：文件捲軸的 `.z-scrollbar-vertical-embed` 在 forced-colors 下中心像素也是 (255,255,255) → **同樣看不見**（兩者都靠 `background-color`） | 記進看板，follow-up，不擋本批 |

## 可行性（Generator brief 用）

### 讀碼結論（`zul/.../WScroll.ts`、`zkmax/.../big/Biglistbox.ts`）

1. **軌道（lane）的幾何完全是 CSS。** `WScroll.redraw()` 只 append `<div class="…-wscroll-vertical">`，之後 JS 從不碰這個 div 的 style；`syncSize()`／滾輪／拖曳只寫 `-drag`（`display`、`top`/`left`）、`-pos`（`display`、`top`/`left`、`height`/`width`）、`-endbar`（`display`、`top`/`left`）的 inline style。`Biglistbox.ts` 也沒碰 lane。
2. **thumb 的位置是 JS 算的，而且已經避開表頭：** `edrag.style.top = startPosition + scale × step`，`startPosition = head.offsetHeight`（`bind_` 和每次 `onSize` 都重設；今天 39px）。這個值是**相對 lane 頂端**，所以 lane 本身不能用 CSS 往下移（探針 A：lane `top:39px` 後 thumb 落在 B.top 下方 39px、end-stop 跑到 lane 外）。
3. **thumb 的大小是 CSS、但被 JS 讀取：** `edrag.offsetHeight − _gap` 決定 scale 與 end-stop；`_gap = edrag − epos` 只在建構時量一次（Marble 兩者都 48 → 0）。只要 `-drag` 與 `-pos` 一起改尺寸就安全（探針 G：兩者改 32px，滾輪／夾制／拖曳正常）。end-stop 在每次 `syncSize`（載入、onSize、每次捲動）重算。
4. **「放得下」時 JS 只把 `-drag` 和 `-endbar` 設 `display:none`**，lane 仍 `display:block`（所以今天槽還畫著）。滾輪事件掛在 body 元素，不在 lane 上。

### 在頁內注入 CSS 的實測（`feas.json`，不寫入 repo）

| 探針 | 注入 | #31 判定（修正帶） | #78 外觀 | 滾輪／夾制／拖曳 | 結論 |
|---|---|---|---|---|---|
| A | lane `top:39px; height:calc(100% − 39px)` | 1、2 通過 | — | 動作「正常」但 thumb top 266（= B.top + 39，雙重位移）、捲到底 thumb 267–315 離底 73px；列數多時 end-stop 會超出 lane | **不可行**（startPosition 是 JS） |
| B | lane `pointer-events:none`；`-drag` `pointer-events:auto` | 1 通過；2 仍 4.51（槽還在） | — | 全部正常 | 只解命中測試 |
| **D** | lane `visibility:hidden`；`-drag` `visibility:visible` | striped：1、2、4 通過（0）；fits：**1、2、3、4 全部 0**；viewport 抖動（onSize）後維持 | thumb 變 (171)（不再疊在槽上）、槽消失 | striped 全部正常；拖曳命中 `-body` | **可行**：hit test 跳過 hidden 元素、lane 不畫任何像素、不依賴表頭高度、不需要 `:has()` |
| D + resize | 同 D + E，viewport 1280 → 600（欄 650 > 內寬）→ 1280 | 600 時水平 thumb 出現：(224)、8px、距下緣 0，`mouse.wheel(120,0)` `_currentX` 0→1；回 1280 後 thumb 消失、判定 4 = 0 | — | 正常 | JS 的 `display:none`/`''` 切換與 CSS 相容 |
| **E** | `::before{content:none}`；`-drag{background: var(--zk-color-outline-variant)}`；垂直 `-drag/-pos{left:6px}`；水平 `{top:4px}` | — | striped：(224,224,224)、8px、距 R **0**、圓角、下方槽 ΔE 0 → #78 判定 1–5 全過；biglist 水平：(224)、8px、距 box.bottom−1 為 0、圓角 | 全部正常（`_gap` 不變） | **可行** |
| **F = D + E** | 兩者合併 | striped 1、2、4 過；fits 1–4 過 | 同 E | 全部正常；onSize 後維持 | **D39-A + D40-A 純 CSS 可達** |
| G | F + `-drag/-pos{height:32px}` | 同 F | thumb 32px | 正常（捲到底 228–260） | thumb 長度可改，須兩者同改 |

### 限制與要寫進 brief 的事

- 不要動 lane 的 `top`/`height`（理由同上）；「不蓋表頭」用 lane `visibility:hidden` + thumb `visibility:visible` 這條路達成，表頭高度多少都無所謂（vflex=min、density 改字級都不影響）。
- `.z-biglistbox-outer` 往下溢出 border-box 1px：水平 thumb 要「齊看得見的內框下緣」是 `top:4px`（不是對稱的 3 或 6），而且判定 6 的「距下緣」要先定義（見方法問題 4）。這個溢出不在本批範圍，記看板。
- thumb 目前是 `color-mix(… transparent)` 半透明；換成 `outline-variant`（本身 12% 黑）仍半透明，疊在白底上是 (224)。若 Generator 用不透明色，顏色判定對白底一樣會過，但深色列上會不同（本批沒有深色底，不判定）。
- forced-colors：thumb 與文件捲軸都靠 `background-color`，兩者今天都看不見；若要處理需另開 follow-up（例如 `border` 或 `forced-color-adjust`），不在 D40-A。
- touch 版（`zkmax/css/tablet/_scrollbar.css`）沒量。

## 方法問題清單

1. **#31 判定 2、3、4 的像素帶包含 widget 自己的 1px 邊框和圓角**（B.bottom = box.bottom + 1；右上／右下角半徑約 8px）。今天最差像素是 224（邊框），不是槽（242，ΔE 4.51）；修好之後這三項照字面也過不了。**METHOD-DEFECT。** 建議改寫：「所有像素帶限制在 widget border-box 內縮 1px（y ≤ box.bottom − 2，x ≤ R − 1），並排除四角各 10px；判定 4 的 y 範圍改為 [box.bottom − 15, box.bottom − 2]」。依此改寫今天仍全部失敗（4.51／9.06／4.51）。
2. **`#biglist`「兩個方向都可捲」在預設模型下不成立**（MultipleColumn 100×10，10 列放得進 500px，垂直 thumb display:none）。垂直滾輪／拖曳／夾制保護項在 `#biglist` 照字面做不到。**METHOD-DEFECT。** 建議改寫：「垂直的滾輪／拖曳／夾制在 `#stripedBiglist` 做；若要在 `#biglist` 做，先用頁面 Change Models 選 `MultipleRow`（10 欄 × 100 列，兩個方向都可捲）」。本輪兩種都做了，全部通過。
3. **#78「品牌色 copper」列為保護項，但 `data-brand="copper"` 不改 `--zk-color-outline-variant`**，這項等同判定 1，且今天失敗。**METHOD-DEFECT（歸類）。** 建議：刪除，或改為判定檢查並註明「與判定 1 等價」。
4. **#78 判定 6 的「距下緣」沒定義**：對看得見的內框下緣（box.bottom − 1）今天差 1（相符）、對 B.bottom（溢出 1px）差 3（不符）。需 Planner 擇一；建議用「看得見的內框下緣 = border-box 下緣 − 1px 邊框」，與垂直的 R（border-box 右緣 − 1）對稱。
5. **文件捲軸的量法要指明 embedded 模式**（第 2 個 grid 的 `.z-scrollbar-vertical-embed`）；overlay 模式靜止時沒有東西可量，頁首 gallery 是 hover 狀態的靜態 HTML。不是量錯，是漏寫。
6. （說明）#78 判定 5 的「thumb 上方取 8px 以上」在 `#stripedBiglist` 不存在（thumb 從 B.top 起，上方是表頭區），只量下方；建議寫成「上方若在 body 範圍內才量」。
7. （說明）「表頭不動：H bounding box 完全相同」建議改成「相對 widget box 的位置相同」——滾輪捲到底後多餘的 wheel 事件會捲動整頁，H 的 viewport 座標會變但表頭並沒有動。
8. （說明）#78 判定 2（寬度）與判定 4（圓角）今天就相符，是保護項；方法只預告了 2／3，建議把 4 也標成保護項。

RED4: METHOD-DEFECTS (items #31 判定2/3/4 像素帶含邊框與圓角, #biglist 預設垂直不可捲, #78 品牌色保護項歸類, #78 判定6 距下緣定義)
