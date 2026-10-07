# Gate：第三批 grid（#34–#39）修後驗證

- **日期：** 2026-10-07，Verifier（**本次由 Sonnet 執行，因 Opus 用量已滿；判定為暫定，待 Opus 重跑**）。
- **方法：** 照 `jess-review-verification-plan.md`「第三批」含修正措辭與 D26–D32 裁示；沿用 `gates/batch3-red/` 腳本（複製到 `gates/batch3/`，輸出不覆蓋 RED 的 json）。
- **沒有讀** fix 的 diff 或 `batch3-gen.md`；沒有改任何 CSS/TS/ZUL；沒有更新 baseline。
- **環境：** 8085，Chromium，1280x900，transitions 關閉，真的 click / hover。
- **CSS 是否為新版：** 一開始 8085 還在送舊 CSS（group 列游標仍是 `pointer`，`zul/build` 的 css.dsp 時間是 10/6）。我跑了 `:zul:compileMarbleCss`（只重新產生 build 輸出）並 kill / 重啟 8085 上的 `appRun`（沒有開第二個 port）；之後 group 列游標變 `auto`，確認為新版。8085 目前由我啟動的 `appRun` 在跑。
- **暫時頁：** `zkpreview/src/main/webapp/web/zz-b3-tmp.zul`（#37 版面與 (d) 表頭用）**已刪除**，repo 內沒有殘留。

## 結論

| Issue | 判定 |
|---|---|
| #34 | PASS |
| #35 | PASS |
| #36 | PASS |
| #37 | **FAIL**（主判定與保護項都過；D32 第 3 點「已知限制不得有錯位的線」在 colspan 列不成立） |
| #38 | PASS |
| #39 | PASS |

## (a) 逐項量測（新值 vs RED）

### #34
| 檢查 | 新 | RED |
|---|---|---|
| Row States：表頭 / body 表格右緣 − body 內框右緣 | 0 / 0 | 基準 0 |
| Basic、Auxhead 上、Auxhead 下、Empty、No-border | 全 0 | 0 |
| Frozen（786px，本來就水平捲動） | 786（照字面量不到 0，沿用 RED 的 METHOD-WRONG 結論，不納入） | 786 |

「佈景 CSS 沒有為 #34 改動」不在本次職責，未查。

### #35（量法：ink-box 正規化、dpr 4、門檻 0.5）
| 檢查 | 新 | RED | 門檻 |
|---|---|---|---|
| 判定 1 desc：IoU(排序, 欄選單) | 0.088 | 0.867 | < 0.5 PASS |
| 判定 1 desc：IoU(排序, 群組圖示) | 0.094 | 1.000 | < 0.5 PASS |
| 判定 2 asc：IoU(排序, 欄選單) | 0.211 | 0.135 | < 0.5 PASS |
| 判定 2 asc：IoU(排序, 群組圖示) | 0.216 | 0.122 | < 0.5 PASS |
| IoU(asc, desc) | 0.463 | 0.122 | < 0.9 PASS |
| 未排序欄沒有排序圖示 | Author/Title/Publisher 都無 box | 同 | PASS |
| 排序有作用（點一次） | `The Northern Clemency` → `Hurry Down Sunshine` | 同 | PASS |
| 對比 ≥ 3:1 | 5.74（asc、desc） | 5.74 | PASS |
| forcedColors 下看得見 | 墨跡 462 px，對比 21 | 244 px / 21 | PASS |
| `title` | `Ascending Order` / `Descending Order` | 同 | PASS |
| 欄選單維持 caret | `z-icon-caret-down`，截圖仍是向下 chevron | 同 | PASS |

**(b) mutation sanity：** asc 與 desc 的 IoU 0.463，落在校準用 `arrow-up` vs `arrow-down` 的 0.455 附近（箭頭共用豎線），兩者都不等於 caret（對欄選單 0.211 / 0.088）。截圖 `hdr-basic.png` 看得到向下箭頭，欄選單仍是 chevron。注意 class 名稱沒變（仍是 `z-icon-caret-up/down`），字形是 CSS 換的；listbox、tree 的 chromium 截圖沒有 header 差異，沒有外溢。

### #36
| 檢查 | 新 | RED |
|---|---|---|
| 判定 1：group 文字中心游標 | `auto` | `pointer` |
| 判定 2：group 列右側空白游標 | `auto` | `pointer` |
| 保護：圖示中心游標 | `pointer` | `pointer` |
| 保護：點圖示切換（open true→false→true；可見列 5→2→5） | 同 | 同 |
| 保護：點右側空白 / 文字不切換 | 不切換 | 不切換 |
| 一般 `.z-row` / 可排序欄頭 / 欄選單按鈕 / 欄邊緣 | `auto` / `pointer` / `pointer` / `col-resize` | 同 |
| 鍵盤 Enter / Space 切換 | true→false / false→true | 同 |

### #37（原判定）
| 檢查 | grid | listbox | tree | RED |
|---|---|---|---|---|
| 步驟 1：靜止有線的資料列 | 4/4 | 3/3 | 4/4 | 0 |
| 步驟 2：捲 200px（scrollLeft = 200）有線 | 4/4 | 3/3 | 4/4 | 0 |
| x0 位移 | 0 | 0 | 0 | 0 |
| 表頭分界線仍在 | 是 | 是 | 是 | 是 |
| 沒設 `<frozen>` 的 grid 沒有線（表頭與 3 列） | 無 | | | 無 |
| 凍結欄 hover alpha | 0.9948 PASS | 0.9896 | 0.9896 | 同 RED，沒變 |

註：listbox、tree 的 hover alpha 0.9896 以字面 ≥ 0.99 來看是「不過」，但跟 RED 完全一樣（RED 報告把 0.995 當成共通值，其實只有 grid）。這不是修法造成的，記下請 Planner 決定門檻是否只適用 grid。

### #37 D32 額外版面（暫時頁，靜止 / 捲到底 `scrollLeft = scrollWidth`；只算資料列）
量法：只看 x0 左側 3px 的像素（捲到底時右側會有被捲過來的文字，6px 寬的量法會誤判），並檢查每個其他欄界有沒有出現線、列的儲存格是否連續、列高。

| 版面 | 靜止 | 捲到底 | 錯位的線 | 備註 |
|---|---|---|---|---|
| grid 凍結 1 欄 | 5/5 | 5/5 | 0 | |
| grid 凍結 3 欄 | 5/5 | 5/5 | 0 | |
| grid + group 列 | 4/4 | 4/4 | 0 | group 列本身：無線、無錯位（符合已知限制） |
| grid + auxhead | 5/5 | 5/5 | 0 | |
| grid `start="1"` | 5/5 | 5/5 | 0 | 線在最後一個凍結欄右緣（x0=261） |
| grid 第一格 `colspan=2` | 3/4 | 3/4 | **靜止：colspan 那一列在 x=381（C2/C3 之間）有一條線，ΔE 10.82** | 見下 |
| grid 凍結格內有巢狀 grid | 4/4 | 4/4 | 0（捲到底時 x=119 的「線」是巢狀 grid 自己的 1px 圓角邊框，不是分界線；截圖確認巢狀 grid 完好） | 此列 139.5px 高，其他列不受影響 |
| listbox + checkmark（multiple） | 4/4 | 4/4 | 0 | |
| listbox 凍結 2 | 4/4 | 4/4 | 0 | |
| tree 凍結 2 | 4/4 | 4/4 | 0 | |
| 無 frozen 對照：grid / listbox / tree | 0/5、0/4、0/4 | 0 | 0 | 通過 |

- 版面位移：各版面的儲存格在靜止時首尾相接（0 gap）；列高跟無 frozen 對照相同（52.5 / 53 交替；checkmark 的 listbox 53.95 / 54.45 是它本來的高度）。凍結 grid 沒有橫向位移。
- **已知限制 colspan 列（D32 第 3 點）：** 沒有線出現在 x0（0/4 之一，符合「這一列沒有線」），**但**第 1 欄 `colspan=2` 使 `:nth-child(2)` 對到的是 C2 欄的儲存格，於是**在 C2 右緣多出一條線**（截圖 `dbg-t-g-colspan-rest.png`）。這違反「沒有線出現在錯的欄」。捲到底後該儲存格被捲出視窗，所以只在靜止時可見。這是我判 #37 FAIL 的唯一原因；若 Planner 認為這個已知限制連同「錯位的線」都可接受，則 #37 其他全過，可改判 PASS。
- 另：第一格 `colspan` 屬於 D32 已知限制，group 列也是，已確認 group 列乾淨。

### #38
| 檢查 | 新 | RED |
|---|---|---|
| 判定 1：Row States 各列 Δ 差 | 0（四列都 −10） | 8（−10 / −18） |
| 判定 1：Basic 各列 Δ 差 | 0（−10, −10, −10） | 8 |
| 判定 2：Δ 不是 0 | 通過（−10） | 通過 |
| Δ == 4%（±1，預期 −10） | 全部 −10 | odd 列 −18 FAIL |
| Frozen grid hover：4 個 cell 底色一致 | 都是 246 | 237 一致 |
| `--zk-grid-row-hover-bg: rgb(255,0,0)` | 4 列（含 odd 列）全變 (255,0,0) | odd 列沒變 |
| forcedColors hover | Δ 0 | Δ 0 |
| `.z-group` hover | Δ 0（240,244,250） | Δ 0 |

### #39
| 檢查 | 新 | RED |
|---|---|---|
| 判定 1：未排序，表頭 − 內容左緣（Name/Status；Author/Title/Publisher/Pages；Left/Center/Right 的 left 欄；Auxhead；Frozen；Empty；No-border） | 全部 0 | 全部 4 |
| 判定 2：排序後（Author asc / desc） | Author/Title/Publisher/Pages 全 0 | Author 22 |
| 排序圖示與文字不相交（Basic Author） | 不相交 | 不相交 |
| 欄選單按鈕 hover：在右半邊、不與文字相交、文字左緣不動 | 通過 | 通過 |
| `align="right"` 右緣差 | 0 | 0 |
| `align="center"` 中心差（判定檢查） | 0 | 2.0 |
| listbox / tree 對齊 | 跟 RED 逐項相同（非首欄 4px，首欄各種值） | — 記進看板，不在這批修 |
| 欄寬 / 列高（未排序，所有 grid、listbox、tree） | 與 RED 完全相同 | — |
| 表頭高（排序後） | 53（跟未排序同） | 54.17（排序時多 1.17px） | 

排序圖示位置：在欄的右端、欄選單按鈕左側（Author 欄圖示 290.5–304.5，文字 49–94），不是緊貼文字後面。

## (d) 排序圖示與文字／按鈕重疊（計畫不要求，僅記錄）

暫時頁，窄欄與長標籤，真的點擊排序後 hover：

- **長標籤放在窄欄（90px，標籤 259px 寬）：** 標籤被欄裁切；排序圖示（65–79）與欄選單按鈕（83–107）直接疊在文字上（截圖 `hdr-col0-asc-hover.png`）。
- **標籤剛好填滿欄（`Wide column with menu`，170px）：** 排序圖示、欄選單按鈕都蓋到標籤尾端（`hdr-col3-asc-hover.png`）。
- **欄有 icon（`iconSclass="z-icon-star"`）：** 不重疊，圖示在左、排序箭頭與選單在右（`hdr-col1-asc-hover.png`）。
- **含欄選單按鈕的 Author（Basic grid）：** 不重疊（圖示 290.5–304.5、按鈕 308.5–332.5、文字 49–94.4）。

排序圖示現在是絕對靠右定位，不再佔位；標籤長到碰到時會被蓋住，沒有 ellipsis。RED 時圖示在行內，行為不同，沒有量 RED 的同一情境，所以不判回歸，只記錄給 Planner。

## (e) forced-colors

- 排序圖示可見：墨跡 462 px、對比 21（見 #35）。
- 列 hover 不變：Δ 0，與 RED 基準相同（#38）。
- 凍結分界線：表頭有（ΔE 100，來自 border），**body 4 列都是 0**（靜止與捲 200px 後）。新的 body 線是 `box-shadow`，forced-colors 會移除它，所以 forced-colors 下 body 沒有分界線；RED 也是 0，所以不是回歸，但表頭有線、body 沒有。記錄給 Planner。

## (f) 回歸專案（PREVIEW_URL=http://127.0.0.1:8085）

| 專案 | 結果 |
|---|---|
| component-theming | 107 / 107 通過 |
| forced-colors | 17 / 17 通過 |
| focus-scan | 57 通過，47 skipped，無失敗 |
| tablet | 53 通過，**2 失敗**（見下） |
| chromium | 127 通過，**3 失敗**（見下） |

失敗與分類（E = 預期；D = 既有細微差；U = 無法解釋）：

| 專案 › 測試 | 差異 | 分類 |
|---|---|---|
| chromium › grid › gallery（6510 px） | 所有 grid 的表頭文字左移 4px（Row States、Basic、Auxhead 兩個、Frozen、Empty、No-border 的表頭）；Frozen 的 x=432 一條 1px 垂直線（body 分界線）；Row States 右側 x≈393–401 一條 8px 寬的帶、以及上方小標題文字 x178–251（`grid.zul` 第一個 grid 拿掉 `width="370px"` 後的版面變化） | 表頭文字、分界線：**E**。Row States 右側帶與小標題：**E（使用者對 #34 的 `grid.zul` 修改）**，不在計畫列的 E 清單內，請 Planner 確認 |
| chromium › listbox › gallery（156 px） | 只有 Frozen 範例 x=432 的 1px 垂直線 | **E** |
| chromium › tree › gallery | 只有 Frozen 範例的 1px 垂直線（約 x=733）；沒有其他差異 | **E** |
| tablet › grid › gallery（2236 px） | 表頭文字左移（含 Frozen 表頭文字）；沒有其他 | **E** |
| tablet › paging › gallery（664 px） | 只有「Pagination with data grid」那個 grid 的表頭文字左移 | **E** |

U：無；D：無。排序箭頭本身沒有出現在任何 gallery 差異裡（preview gallery 沒有點排序）。hover 類 baseline 沒有失敗（odd 列 hover 沒被截圖）。

`git status`：`doc/screenshots` 沒有變動；`zkpreview` 只有原本就有的 `grid.zul`（使用者的 #34 修改）。測試產物在 `zkpreview/test-results/`（未追蹤、非 baseline）。沒有跑 `forced-colors-gallery`，也沒有 `--update-snapshots`。

## 取證

`gates/batch3/`：`i34/i35-rerun/i36/i37/i37-layouts/i38/i39/i-hdr` 的 `.js`、`.json`、`.out`；`genzul.js`（暫時頁產生器，頁面已刪）；`hdr-*.png`、`dbg-*.png`、`i37-layouts-page.png`。

## 待決事項

1. #37 colspan 列的錯位線：接受（改判 PASS，並把註解寫成「colspan 列會在下一欄右緣多一條線」），還是要求規則避開（例如只對沒有 colspan 的列套用）。
2. listbox / tree 凍結 hover alpha 0.9896 vs 門檻 0.99。
3. 長標籤與排序圖示 / 欄選單按鈕重疊。
4. forced-colors 下 body 沒有凍結分界線。
5. Row States 右側帶（`grid.zul` 修改）的 baseline 歸類。

GATE3: FAIL (issues 37)
