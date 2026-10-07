# Gate：第三批 RED run，grid（#34–#39）

- **日期：** 2026-10-07，Verifier，量現在的程式碼（8085，Chromium，viewport 1280×900，已注入 no-animation）。
- **範圍：** D26–D31 的裁示（#34 不跑 RED；#35 A、只改排序圖示；#36 A；#37 A，只回答可行性；#38 A，4%；#39 A）。
- **腳本與原始輸出：** `gates/batch3-red/`（`i34.js/.json`、`i35.js/.json`、`i35-method.js/.json`、`i36.js/.json`、`i37.js/.json`、`i37-probe.js/.json`、`i38.js/.json`、`i39.js/.json`，共用 `lib.js`）。所有狀態都用真的 click / hover，沒有注入 class。
- **沒有修改** 任何 repo 檔案，只在 `gates/batch3-red/` 新增檔案。

## 結論摘要

| Issue | 判定檢查今天 | 保護項今天 | 方法問題 |
|---|---|---|---|
| #34 | 不 RED，基準 = 0 | Frozen grid 不是 0（見下） | 保護項寫法需修 |
| #35 | **判定 1 已經通過（量法無法分辨相同圖示）** | 「排序有作用」寫法有誤 | **METHOD-WRONG** |
| #36 | 兩項都失敗（`pointer`）RED-correct | 全部通過 | 無 |
| #37 | 步驟 1、2 都得 0/4，RED-correct | 通過 | 可行性結論的前提有漏洞（見下） |
| #38 | 判定 1 失敗 RED-correct | 判定 2 通過 | 無（4%、knob 兩項是修後才成立的項目） |
| #39 | 判定 1、2 都失敗 RED-correct | center 對齊今天就不通過 | center 保護項 METHOD-WRONG |

## #34 基準（不 RED）

`grid.zul` 前 4 個 grid，表格右緣 − body 內框右緣：表頭 0、body 0（Row States、Basic、Auxhead above、Auxhead below 全部 0）。
- 第 5 個 Frozen grid 是 786px：表格本來就比 body 寬（水平捲動，`bodyHasHScroll: true`）。計畫的保護項「Frozen 差值仍是 0」**照字面量不到 0**，**METHOD-WRONG**。
  建議改寫：「有水平捲動的 grid（Frozen）不比表格右緣，改比 `.z-grid-body` 內框右緣 == `.z-grid` 內框右緣（± 0.5）」，或把 Frozen 從該保護項移除。
- 「佈景 CSS 的 diff 必須是空的」：本次沒有看 diff，留給最終 Verifier。

## #35（D27-A：只改排序圖示）

實測的圖示（`grid.zul` 第 2 個 grid 的 Title 欄、`grid-grouping.zul` 第一個 group）：升冪 `z-icon-caret-up`、降冪 `z-icon-caret-down`、欄選單 `z-icon-caret-down`、群組 `z-icon-angle-down`。

### 判定 1、2（照計畫的 IoU 量法）

| 狀態 | IoU(排序, 欄選單) | IoU(排序, 群組) | 計畫要求 | 今天 |
|---|---|---|---|---|
| 降冪 | 0.318 | 0.476 | < 0.9 | **通過** |
| 升冪 | 0.208 | 0.148 | < 0.9 | 通過（計畫本來就預期） |

降冪判定 1 今天就通過，但實際上圖示是相同的 caret（降冪排序圖示 vs 欄選單圖示是同一個 glyph，降冪 vs 群組圖示在 ink-box 對齊後 IoU = 1.0）。**METHOD-WRONG**，原因：

- 計畫寫「取 bounding box 往外 2px 截圖，縮成 16×16」。三個圖示的 box 大小不同（14×20、16×20），截圖不是方形，直接縮成 16×16 會變形，而且 glyph 在框內的位置差一個 pixel 就整個錯開。相同 glyph 的 IoU 只有 0.25–0.5（dpr 1、4 都量過，見 `i35-method.json`）。
- 這個量法**無法區分相同 glyph 和不同 glyph**，所以 < 0.9 永遠成立。

**建議改寫：** 先在每個圖示的截圖裡找出墨跡的外框（ink bounding box），取外框的中心補成正方形再縮成 16×16，用 deviceScaleFactor 4 截圖；門檻改成 **< 0.5**。
校準結果（`i35-method.json`，dpr 4）：

| 比較 | ink-box 正規化 IoU |
|---|---|
| 降冪排序 vs 欄選單（相同 glyph） | 0.867 |
| 降冪排序 vs 群組（相同 glyph） | 1.0 |
| 欄選單 vs 群組（相同 glyph） | 0.867 |
| 升冪排序 vs 欄選單 / 群組 / 降冪排序（不同） | 0.135 / 0.122 / 0.122 |
| 校準用的 `z-icon-arrow-down` vs 欄選單 / 群組（不同） | 0.087 / 0.092 |
| `z-icon-arrow-down` vs `z-icon-arrow-up` | 0.455（箭頭共用豎線，仍 < 0.5） |

dpr 1 時：相同 0.70–1.0、不同 ≤ 0.29，門檻 0.5 也分得開。依這個改寫，今天降冪判定 1 兩項都 ≥ 0.5 → **失敗（RED-correct）**；升冪兩項 0.135、0.122 → 通過（保護項）。
修好之後 `z-icon-arrow-down` 對欄選單 caret 只有 0.087–0.212，會通過。

### 也必須成立（今天）

| 項目 | 量到的值 | 結果 |
|---|---|---|
| 升冪 vs 降冪排序圖示 IoU < 0.9 | 0.2（計畫量法）／0.122–0.294（正規化） | 通過 |
| 沒排序的欄沒有排序圖示 | Author / Title / Publisher 沒有 `<i>`（box 0×0） | 通過 |
| 排序有作用 | 見下 | **寫法有誤** |
| 排序圖示對比 ≥ 3:1 | 升冪 5.74、降冪 5.17（hover 時 5.45、4.98） | 通過 |
| forcedColors 下看得見 | 墨跡 19 px，對比約 20:1 / 19.6:1 | 通過 |
| `title` | `Ascending Order` / `Descending Order` | 通過 |

「排序有作用」：計畫寫「點 Title 兩次，第一列的 Title 會改變」。實測初始第一列 = `The Northern Clemency`，升冪 = `Hurry Down Sunshine`，降冪 = `The Northern Clemency`——**點兩次後回到跟初始一樣**，照字面量會失敗，**METHOD-WRONG**。
建議改寫：「點一次後第一列 Title 和初始不同（升冪），再點一次後第一列 Title 和升冪那次不同」。

欄選單圖示（判定 3）依 D27-A 略過。

## #36（D28-A）

| 檢查 | 量到的值 | 結果 |
|---|---|---|
| 判定 1：group 文字中心游標（`span.z-label`） | `pointer` | 失敗，RED-correct |
| 判定 2：group 列右側空白（右緣內 30px，`div.z-group-content`） | `pointer` | 失敗，RED-correct |
| 保護：圖示中心游標 | `pointer` | 通過 |
| 保護：點圖示切換 | `z-group-open` true → false → true | 通過（可見列 5 → 2 → 5） |
| 保護：點右側空白不切換 | open 維持 true | 通過（現況：不切換） |
| 保護：點文字不切換（額外記錄） | open 維持 true | 現況：不切換 |
| 一般 `.z-row` 游標 | `auto` | 通過 |
| 可排序欄頭游標 | `pointer` | 通過 |
| 欄選單按鈕游標 | `pointer` | 通過 |
| 欄邊緣 `.z-column-sizing` | `col-resize`（th 帶 `z-column-sizing`） | 通過 |
| 鍵盤（現況記錄） | 焦點在 group 上：Enter 切換（true → false）、Space 切換（false → true） | 記錄，修完要相同 |

## #37（D29-A）：可行性與像素檢查

分界線位置 `x0` = 表頭第 2 個凍結欄右緣：grid 433、listbox 433、tree 733。每列取 6px 寬的垂直帶（上下各縮 3px，避開列與列之間的橫線，否則橫線會被當成分界線，這是第一版腳本踩到的坑），ΔE ≥ 2 算有線。

| 檢查 | grid | listbox | tree |
|---|---|---|---|
| 表頭有分界線（`box-shadow` + 1px 右邊框；ΔE 峰值 10.82） | 有 | 有 | 有 |
| 步驟 1：靜止時 body 有分界線的列數 | **0 / 4** | 0 / 3 | 0 / 4（只量前 4 列） |
| 步驟 2：捲 200px 後（`scrollLeft` 確實 = 200） | **0 / 4** | 0 / 3 | 0 / 4 |
| 步驟 2：`x0` 位移 | 0 | 0 | 0 |

步驟 1 RED-correct。步驟 2 的「4 列都有分界線」今天也是 0，RED-correct；「x0 不動」今天通過。

**IceBlue：** preview app 沒有切換佈景的開關（`?zktheme=` 之類回 302，沒有生效），切換要改設定／重建，不是 trivial，**not measured**。

### 可行性問題的答案

1. **靜止時 body 凍結欄 cell 有沒有任何 class、attribute、inline style 可以跟非凍結欄分開？ 沒有。** 前 3 個 cell（凍結 2 + 非凍結 1）的 `class`、attribute 名稱、`style`、內層 div 的 class 逐項比對，差異為空；computed `position`、`z-index`、`transform`、`box-shadow`、`border-right` 全部相同（`static`、`auto`、`none`、`none`、`0px`）。grid、listbox、tree 都一樣。
2. **捲動後 inline `transform` / `z-index` 能不能當選擇器？ 技術上可，但不能當唯一依據。** 捲 200px 後，凍結欄的 body cell（第 0、1 欄）多了 inline `style="transform: translate3d(200px, 0px, 0px); z-index: 1;"`，非凍結欄沒有。靜止（捲動 0）時沒有，所以靜止狀態還是沒標記。

### 計畫的結論有漏洞：純 CSS 其實有一條路

計畫寫「兩個答案都是不行 → 純 CSS 做不到」。但還有第三條：表頭靜止時就有 `.z-frozen-col`（`th`），而 `.z-grid` 是表頭和 body 的共同祖先，可以用 `:has()` 加 `:nth-child` 把「表頭有幾個凍結欄」對應到 body 的第 N 個 cell。
我用頁面內注入的 `<style>`（不動 repo）試了一次：

`.z-grid:has(.z-column.z-frozen-col:nth-child(2)):not(:has(.z-column.z-frozen-col:nth-child(3))) .z-row > td:nth-child(2){box-shadow:inset -1px 0 0 rgba(0,0,0,.12)}`

結果：靜止 **4/4**、捲 200px 後 **4/4**，`x0` 不動（`i37-probe.json`）。注意：
- 這只證明「可行」，不是建議的修法。需要列舉凍結欄數（N = 1..K）；`colspan` 的 group 列／auxhead／listbox 的 checkmark 欄／tree 的縮排欄會讓 `nth-child` 對不上，要 Generator 另外驗證。
- 需要 `:has()`（Chrome 105+、Safari 15.4+、Firefox 121+）。
- 所以 D29-A 的前提（「RED 證實純 CSS 做不到」）**今天沒有被證實**，需要 Planner 重新確認：是接受列舉式 `:has()`，還是仍走 ZK Jira。

### 也必須成立（今天）

| 項目 | 結果 |
|---|---|
| 沒設 `<frozen>` 的 grid（Basic）表頭和 3 列都沒有分界線 | 通過（全部 ΔE 0） |
| 凍結欄 hover 底色不透明 | 3 個 cell 的疊色相同，alpha 0.995（`color-mix`），視覺上不透明；grid 的值 `srgb 0.965`，listbox／tree 0.930。計畫沒定義「不透明」的門檻，建議寫成 alpha ≥ 0.99 |
| listbox、tree 有 frozen 範例，表頭分界線存在 | 通過（`box-shadow` 與 1px 邊框；body 同樣沒有線） |

## #38（D30-A：全部 4%）

`--zk-color-on-surface` = `rgb(0,0,0)`，`--zk-grid-row-hover-bg` = `#0000000a`（約 4%）。列底色全部是白色 255，4% 疊上去的預期 Δ = −10；8% = −20。

| Grid | 列 | class | Δ | 4% 預期 |
|---|---|---|---|---|
| Row States | 0 | `z-row` | −10 | −10 |
| | 1 | `z-row-selected z-grid-odd` | −18 | −10 |
| | 2 | `z-row` | −10 | −10 |
| | 3 | `z-grid-odd` | −18 | −10 |
| Basic | 0、2 | even | −10 | −10 |
| | 1 | odd | −18 | −10 |

- 判定 1（列間相差 ≤ 1）：兩個 grid 都是 **8** → 失敗，RED-correct。
- 判定 2（Δ 不是零）：通過（保護項）。
- 「Δ 等於 4%，±1」：偶數列 −10 通過，odd 列 −18 不通過（偏離 8）。這一項是修好後才會成立的項目，今天 odd 列失敗是預期。
- 注意 Row States 的第 2 列同時是 `z-row-selected` 和 odd，但 selected 在 grid 沒有自己的底色，Δ 跟 odd 一樣，所以不影響量測。
- `--zk-grid-row-hover-bg: rgb(255,0,0)`：偶數列 hover 變 (255,0,0)（knob 有效）；odd 列仍是 (237,237,237)，**沒有跟著變**，修後才會變，今天失敗是預期。
- 凍結 grid hover：4 個 cell 都是 (237,237,237)，一致，通過。（該列是 odd 列，所以也是 −18。）
- `forcedColors: 'active'`：hover 前後都是 (255,255,255)，Δ 0。這是基準值，修完要相同。
- `.z-group` hover：前後都是 (240,244,250)，Δ 0。基準值。

## #39（D31-A）

量法：`Range.selectNodeContents(文字節點)` 的 `left`，表頭取 `.z-column-content` 底下第一個文字節點，body 取第一列對應 cell 的第一個文字節點。

### 判定 1：未排序

| Grid | 欄 | 表頭 − body 左緣 |
|---|---|---|
| Row States（grid 0） | Name、Status | 4、4 |
| Basic（grid 1） | Author、Title、Publisher、Pages | 4、4、4、4 |

RED-correct（全部失敗，跟 Planner 的 4px 一致）。

### 判定 2：排序之後（真的點擊 Author）

| 狀態 | Author | Title | Publisher | Pages |
|---|---|---|---|---|
| 升冪 | **22** | 4 | 4 | 4 |
| 降冪 | **22** | 4 | 4 | 4 |

RED-correct。排序圖示出現後文字被推開 18px（4 + 18）。

### 也必須成立（今天）

| 項目 | 結果 |
|---|---|
| 排序圖示看得見、沒蓋到文字 | 通過（`iconOverlapsText: false`） |
| 欄選單按鈕 hover 時在欄右側、沒擠壓文字 | 通過（按鈕 x = 308.5 在欄右半邊，文字左緣 71 在 hover 前後相同，不重疊） |
| `align="right"` 的欄 | 表頭 − body 右緣 = 0，**通過** |
| `align="center"` 的欄 | 表頭 − body 中心 = **2.0**（> 0.5），今天就不通過 |
| `align="left"` 的欄 | 4（跟判定 1 相同） |
| listbox、tree | 見下 |
| 欄寬、列高 | 基準：Row States／Basic／Auxhead 列高 52.5（Auxhead below 52）；欄寬在 `i39.json` |

- center 欄今天就失敗：同一個空的 `.z-column-sorticon`（4px margin）讓置中的文字往右偏 2px，是同一個根因。因此「保護項，今天通過」不成立，**METHOD-WRONG**。建議改寫：把 center 欄歸入判定檢查（今天 2.0、修後 ≤ 0.5），right 欄維持保護項。
- listbox／tree 的表頭對齊（記進看板，不在這一批修）：`listbox.zul` 各個 listbox 非首欄都是 4px；首欄有 0／4／−24 等不同值（有 checkmark、群組等結構）。`tree.zul` 非首欄 4px，首欄是縮排造成的 −20／−24／−40（樹狀縮排，不是同一個問題）。這些原始數字在 `i39.json`。

## 方法問題清單

1. **#35 判定 1／2 的 IoU 量法**：無法分辨相同和不同的圖示，降冪今天就通過。改成 ink-box 正規化 + DPR 4 + 門檻 0.5。METHOD-WRONG。
2. **#35「排序有作用」**：點兩次回到初始值，改成比較第一次點擊前後。METHOD-WRONG。
3. **#34 保護項「Frozen 差值仍是 0」**：Frozen grid 本來水平捲動，量到 786。METHOD-WRONG（改比內框）。
4. **#39 center 欄「今天就通過」**：實測 2.0px，今天失敗。METHOD-WRONG（改歸入判定檢查）。
5. **#37 的結論前提**：「body cell 沒標記就是純 CSS 做不到」不成立，`:has()` + `:nth-child` 列舉式選擇器今天驗證可行（4/4）。不是量法錯，是 D29-A 的前提需要 Planner 重審。
6. （說明）#38 的「Δ = 4%」與 knob「odd 也要變」今天會失敗，是修後才成立的項目，不是保護項；Planner 若要求「也必須成立」全部今天通過，這兩項要移到判定檢查。

RED: METHOD-WRONG (items #35 判定1/2, #35 排序有作用, #34 Frozen 保護項, #39 center 保護項)
