# Baseline survey 1：27 個截圖失敗的分類（Verifier）

- 日期：2026-10-06
- 角色：Verifier（唯讀量測）。未修改任何 CSS、test 或 PNG baseline，未執行 `--update-snapshots`，未看 CSS 的 git diff/log。
- 輸入：`chromium` project 的 survey run，`<scratchpad>/baseline-survey-1/pw/screenshot-<comp>-<state>-chromium/<base>-{expected,actual,diff}.png`，與 `chromium.log`。
- 機器可讀結果：`<scratchpad>/baseline-survey-1/classification.json`（另含 `measure.json` 為完整量測）。
- 量測腳本：`doc/jess-review/gates/baseline-classify/measure.js`

## 1. 方法

環境沒有 PIL，`zkpreview/node_modules` 沒有獨立的 `pngjs`，所以腳本改用 node，透過 `zkpreview` 的 `playwright-core/lib/utilsBundle` 取得內建的 `PNG`（pngjs）。重跑方式：

```bash
node doc/jess-review/gates/baseline-classify/measure.js <scratchpad>/baseline-survey-1/pw <out>.json
```

每個 item 的量測項目：

1. **尺寸**：expected 與 actual 的寬高。27 個全部尺寸相同，log 也沒有 size mismatch 訊息。
2. **差異像素**：
   - `diffPixels` 用 SIG=25（任一 channel 差 > 25）。這個門檻算出的數字和 Playwright log 完全一致，例如 listbox 17536、tabbox-hover 1。
   - 另外記錄 `diffPixelsAny`（任何差異 > 0）。
3. **Cluster**：差異像素以 4px 容差做 connected component，記錄 bounding box。
4. **Chromatic**：依任務定義，expected 或 actual 的 max−min > 12 即算 chromatic。faint tint（例如 chip 的淡藍灰底）也會觸發這條規則，所以另外以 chroma > 40 標記 `strongChromatic`（飽和色，例如 primary 藍、error 紅）。
5. **Best shift**：
   - 全圖在 dx、dy ∈ [-3, 3] 範圍找殘差最小的位移。
   - 每個 cluster 各自做 [-3, 3] 的 local shift，以及 [-30, 30] × [-8, 8] 的 wide shift。若 wide shift 的殘差低於該 cluster 差異的 25% 且位移 > 3px，記為 `movedBeyond3px`。
6. **Fill change**：對所有差異像素（含低於 SIG 的）統計「expected 色 → actual 色」配對，報告出現 ≥ 200px 的配對。加這一步是因為 batch 2 的選取列底色改變每像素只差 13–21，**低於 Playwright 門檻**，只看 diff 圖或 `diffPixels` 會漏掉。
7. **目視確認**：
   - 逐一看過每個 item 的 diff 圖。
   - 對每個 strong-chromatic 或 moved cluster，用放大 crop（expected | actual | diff 並排）確認它對應的 UI 元素。
   - 元件位移量另外以單列像素 run 實測，例如 window 的「Show Modal」按鈕藍色區段 646–761 → 563–678。

注意：wide shift 用在純文字 cluster 時可能誤配到別處文字，例如 selectbox、tabbox 的 `(-30,-8)`。因此表中的「元件位移」以像素 run 實測值為準，不採用這類誤配數字。

## 2. 共同根因（16 個 gallery 都有）

所有 `› gallery` 截圖都含有**預覽頁 chrome 的排版改變**，跟 batch 1/2 無關：

| 位置 | expected | actual |
|---|---|---|
| 頁面主標題（如「Listbox」） | 約 14px | 約 22px |
| section 標題（如「LISTBOX — STATE GALLERY」） | 一般字重，深色 | 較小、粗、灰 |
| 列/欄標籤、說明段落（如「Text only」「mold="tristate" checked」） | 約 14px，#212121 | 約 11–12px，較淺灰 |

- 這些變化是字級、字重、顏色的改變，不是反鋸齒，所以依定義**不屬於 D**。
- 列標籤欄變窄後，在列標籤右側的元件會整體左移；位移超過 3px 的也不符合 D。
- 我無法（也不被允許）從 CSS 歷史確認這個改變來自哪裡。可以確認的是：所有 baseline PNG 最後一次 commit 在 `cd02d18943`（2026-09-11，「add the Marble screenshot oracle」），比 batch 1/2 早，所以這些 baseline 本來就可能已經過時。

因此 16 個 gallery 一律判 **U**。表中另列「元件區」欄，說明扣掉頁面 chrome 後，元件本身的變化屬於哪一類（E、只有位移、或無變化）。

## 3. 分類表

| item | 類別 | 元件區 | 尺寸 exp / act | diffPixels（SIG） / any | chromatic（>12 / >40） | best shift，殘差 | 理由（UI 元素） |
|---|---|---|---|---|---|---|---|
| bandbox › gallery | U | 位移 >3px | 1280×489 / 同 | 7300 / 9561 | 是 / 是 | (0,0)，7300 | 頁面 chrome 排版改變；bandbox 欄位（含 invalid 紅框）左移 4–5px |
| button › gallery | U | 位移 >3px | 1280×1763 / 同 | 37471 / 50015 | 是 / 是 | (-3,0)，32511 | 頁面 chrome 排版改變；各色按鈕左移 5px，dir="reverse" 的 Save 按鈕左移 23–24px |
| checkbox › gallery | U | 位移 >3px | 1280×631 / 同 | 17116 / 22124 | 是 / 是 | (-3,0)，15434 | 頁面 chrome 排版改變；checkbox、switch、toggle 左移 5–7px，tristate 列左移 26px 與 50px |
| chosenbox › focus | D | — | 224×94 / 同 | 451 / 630 | 是 / 否 | (0,0)，451 | chip 文字「Apple」「Banana」次像素重繪；chromatic 只來自 chip 淡底，無色相改變 |
| chosenbox › hover | D | — | 224×94 / 同 | 451 / 630 | 是 / 否 | (0,0)，451 | 同上 |
| combobox › gallery | U | 位移 >3px | 1280×490 / 同 | 7135 / 9248 | 是 / 是 | (0,0)，7135 | 頁面 chrome 排版改變；combobox 欄位左移 2–5px。gallery 沒有展開 dropdown，所以看不到 batch 2 的選取色 |
| datebox › gallery | U | 位移 >3px | 1280×581 / 同 | 6785 / 9368 | 是 / 是 | (0,0)，6785 | 頁面 chrome 排版改變；datebox 欄位左移 2–6px |
| grid › gallery | U | 無變化 | 1280×2181 / 同 | 14816 / 18608 | 否 / 否 | (0,0)，14816 | 只有頁面 chrome 排版改變；grid 本體沒有 fill 變化，也沒有位移 |
| listbox › gallery | U | **E** | 1280×2540 / 同 | 17536 / 66004 | SIG 內否；fill 是 | (0,0)，17536 | 頁面 chrome 排版改變；選取列底色 213,230,255 → 200,213,234（41,628px，低於門檻），屬 batch 2 |
| longbox › focus | D | — | 134×64 / 同 | 149 / 209 | 否 / 否 | (0,0)，149 | 輸入值「1000」次像素重繪，字寬不變 |
| longbox › hover | D | — | 134×64 / 同 | 149 / 207 | 否 / 否 | (0,0)，149 | 同上 |
| panel › gallery | U | 無變化 | 1280×2241 / 同 | 14068 / 17581 | 否 / 否 | (0,0)，14068 | 只有頁面 chrome 排版改變；panel 本體無變化 |
| searchbox › focus | D | — | 181×64 / 同 | 337 / 623 | 否 / 否 | (0,0)，337 | placeholder「Search regions...」次像素重繪 |
| searchbox › hover | D | — | 181×64 / 同 | 337 / 621 | 否 / 否 | (0,0)，337 | 同上 |
| selectbox › focus | D | — | 144×64 / 同 | 131 / 201 | 否 / 否 | (0,0)，131 | 「Bob」文字與 ▼ 箭頭反鋸齒差異 |
| selectbox › gallery | U | 位移 ≤3px | 1280×442 / 同 | 5061 / 6659 | 否 / 否 | (0,0)，5061 | 頁面 chrome 排版改變；selectbox 欄位左移 3px（local 殘差 0） |
| selectbox › hover | D | — | 144×64 / 同 | 131 / 195 | 否 / 否 | (0,0)，131 | 同 selectbox › focus |
| spinner › gallery | U | 位移 >3px | 1280×528 / 同 | 10672 / 16364 | 是 / 是 | (-3,0)，8654 | 頁面 chrome 排版改變；spinner 三欄分別左移 6、5、3px |
| tabbox › gallery | U | **E** | 1280×4332 / 同 | 30272 / 37057 | 是 / 是 | (0,0)，30272 | 頁面 chrome 排版改變；上/下 tab 的選取指示改為 label 下方 3px 藍條，左/右 tab 改為沿邊 3px 直條（batch 1） |
| tabbox › hover | **E** | — | 81×49 / 同 | 1 / 81 | 是 / 是 | (0,0)，1 | tab 右下角 (80,47) 的 1px 藍點消失，是舊選取指示的延伸（batch 1 tab indicator） |
| textbox › focus | D | — | 198×64 / 同 | 138 / 179 | 否 / 否 | (0,0)，138 | 「Hello」次像素重繪，字寬（25–55）不變 |
| textbox › gallery | U | 位移 >3px | 1280×580 / 同 | 10248 / 14747 | 是 / 是 | (0,0)，10248 | 頁面 chrome 排版改變；textbox 欄位左移 3–6px，password 圓點、disabled/readonly 底色條跟著位移 |
| textbox › hover | D | — | 198×64 / 同 | 138 / 177 | 否 / 否 | (0,0)，138 | 同 textbox › focus |
| timebox › gallery | U | 位移 >3px | 1280×489 / 同 | 6528 / 9201 | 是 / 是 | (0,0)，6528 | 頁面 chrome 排版改變；timebox 欄位左移 2–5px |
| toast › gallery | U | 無變化 | 1280×704 / 同 | 3380 / 4276 | 否 / 否 | (0,0)，3380 | 只有頁面 chrome 排版改變；toast 本體無變化 |
| tree › gallery | U | **E** | 1280×6358 / 同 | 24120 / 138343 | SIG 內否；fill 是 | (0,0)，24120 | 頁面 chrome 排版改變；選取列 213,230,255 → 200,213,234（91,716px），disabled+selected 列 239,246,255 → 234,239,247（13,742px），屬 batch 2 |
| window › gallery | U | 位移 >3px | 1280×1187 / 同 | 20438 / 27422 | 是 / 是 | (0,0)，20438 | 頁面 chrome 排版改變；「Show Modal」按鈕因說明文字變窄左移 83px（藍色區塊在舊位置消失、新位置出現） |

## 4. 統計

| 類別 | 數量 | items |
|---|---|---|
| E | 1 | tabbox › hover |
| D | 10 | chosenbox ×2、longbox ×2、searchbox ×2、selectbox focus/hover、textbox focus/hover |
| U | 16 | 全部 `› gallery` |

U 的 16 個再依「元件區」細分：

| 元件區 | 數量 | items |
|---|---|---|
| E | 3 | listbox、tree、tabbox |
| 無變化 | 3 | grid、panel、toast |
| 只有 ≤3px 位移 | 1 | selectbox |
| 有 >3px 位移 | 9 | bandbox、button、checkbox、combobox、datebox、spinner、textbox、timebox、window |

這 9 個的位移都是列標籤或說明文字變窄造成的。

## 5. U 清單：無法用 batch 1/2 解釋的部分

16 個 U 的共同未解釋項目，是**預覽頁 chrome 的排版改變**：

- 主標題字級放大。
- section 標題變小、變粗、變灰。
- 列/欄標籤與說明文字變小、變淺。

另外，下列 item 的元件因此發生 >3px 的水平位移：

| item | 位移元素 |
|---|---|
| bandbox | 欄位左移 4–5px |
| button | 按鈕左移 5px；dir="reverse" 按鈕左移 23–24px |
| checkbox | 左移 5–7px；tristate 列左移 26px、50px |
| combobox | 左移最多 5px |
| datebox | 左移最多 6px |
| spinner | 左移最多 6px |
| textbox | 左移最多 6px |
| timebox | 左移最多 5px |
| window | 「Show Modal」按鈕左移 83px |

逐項看過後，除了這個根因，**沒有發現其他色相改變，也沒有元素出現或消失**：

- 所有 strong-chromatic cluster 都是既有的彩色元件（primary/secondary/success/warning/error/info 按鈕、checkbox 勾選、invalid 紅框、tab indicator）整塊位移。
- 色彩本身沒有變。

給 Planner 的觀察（不是結論）：

1. baseline 全部來自 2026-09-11 的 `cd02d18943`。頁面 chrome 的改變很可能是 batch 1/2 之前就已經存在的過時 baseline。要確認這點，需要有權限的人查 zkpreview 頁面樣式的歷史。
2. batch 2 的選取列底色改變（listbox、tree）每像素差 <25，**Playwright 目前的門檻抓不到**。它沒有讓測試失敗；listbox、tree 失敗是頁面 chrome 造成的。如果要讓 oracle 守住 batch 2，需要調整門檻或另加斷言。
3. combobox、searchbox、chosenbox、selectbox 的 dropdown 都沒有在 gallery 或 focus/hover 截圖中展開，所以這次 survey 沒有覆蓋 batch 2 的 dropdown 選取色。

## 第二輪：threshold 0.05 新增的 6 項（2026-10-06）

- 背景：`chromium` project 的 per-pixel YIQ `threshold` 從預設 0.2 降到 0.05 後，6 個原本通過的 state 截圖（經 `padShot`，`maxDiffPixels: 20`）開始失敗。
- 角色：同第一輪，Verifier 唯讀量測；未改 CSS、spec、config、PNG baseline，未跑 `--update-snapshots`，未看 CSS 的 git diff/log。
- 輸入：`<scratchpad>/gen-d22/new-failures/screenshot-<base>-chromium/<base>-{expected,actual,diff}.png`。
- 機器可讀結果：`<scratchpad>/gen-d22/classification.json`（schema 同第一輪，另加 `yiq` 物件）；完整量測在同目錄 `yiq005.json`、`yiq02.json`。
- doublebox、decimalbox、combobutton 都不在 batch 1/2 的範圍內，所以本輪不可能有 E。

### 方法

1. `measure.js` 新增 `--yiq <t>` 選項（不帶時輸出不變）：
   - 逐像素「是否不同」改用 pixelmatch 的 YIQ delta（`0.5053·y² + 0.299·i² + 0.1957·q²`，與 `35215·t²` 比較），cluster 與 best shift 也用同一判準。
   - 另外直接呼叫 `zkpreview` 內 `playwright-core/lib/third_party/pixelmatch.js`，回報 Playwright 的**精確**計數（含 pixelmatch 的 anti-aliasing 排除）在 t 與 0.2 下的值，以及全圖最大 YIQ delta（換算成等效 t）。
   - 驗證預設行為不變：舊版與新版在本輪 6 項與第一輪 27 項上，不帶 `--yiq` 的 JSON 與 stdout 都 byte-identical（`cmp` 無差異）。
   - 重跑：`node doc/jess-review/gates/baseline-classify/measure.js <dir> <out>.json --yiq 0.05`。
2. pixelmatch 精確計數與 Playwright log 完全一致：doublebox 51、decimalbox 35、combobutton 41。
3. 目視：8× 放大 crop（expected | actual | diff 並排），加上逐欄墨量剖面（每個字形的位置與墨量）比較。
4. combobutton 的 chromatic 像素另做色相檢查：每個差異像素都以「按鈕底色 → 白」的線性混合去擬合，算出偏離量。

### 量測表

YIQ 0.05 / 0.2 是 Playwright pixelmatch 的精確計數；括號內是不排除 anti-aliasing 的原始計數。

| item | 類別 | 尺寸 exp / act | YIQ 0.05 | YIQ 0.2 | 最大 YIQ delta（等效 t） | 最大 channel 差 | chromatic（>12 / >40） | best shift，殘差（YIQ 0.05） | 差異所在 UI |
|---|---|---|---|---|---|---|---|---|---|
| doublebox › hover | D | 134×64 / 同 | 51（146） | 18 | 6226（0.42） | 111 | 否 / 否 | (0,0)，146；cluster local (1,0)，142 | 輸入框內數值「2.718」，區域 x 25–56、y 27–36 |
| doublebox › focus | D | 134×64 / 同 | 51（146） | 18 | 6226（0.42） | 111 | 否 / 否 | (0,0)，146；cluster local (1,0)，142 | 同上；focus 框沒有差異 |
| decimalbox › hover | D | 134×64 / 同 | 35（114） | 18 | 6226（0.42） | 111 | 否 / 否 | (0,0)，114 | 輸入框內數值「3.14」，區域 x 25–48、y 27–36 |
| decimalbox › focus | D | 134×64 / 同 | 35（114） | 18 | 6226（0.42） | 111 | 否 / 否 | (0,0)，114 | 同上；focus 框沒有差異 |
| combobutton › hover | D | 140×60 / 同 | 41（125） | 0 | 701（0.14） | 47 | 是 / 是 | (0,0)，125 | primary 藍底按鈕上的白色標籤「Options」，區域 x 47–79、y 24–34 |
| combobutton › focus | D | 140×60 / 同 | 41（124） | 0 | 636（0.13） | 45 | 是 / 是 | (0,0)，124 | 同上 |

### 判讀

**doublebox、decimalbox**：同一串文字的次像素重繪，屬於 ≤3px 的一致位移。

- 每個 item 只有一個 cluster，落在輸入框的數值文字上。邊框、背景、hover/focus 外框都沒有差異像素。
- 純灰階（chromatic 像素 0）。
- 字形沒有變，字寬也沒有變：
  - doublebox 總墨量 57912 → 57894，decimalbox 44400 → 44058。
  - 各字形重心一致往右移 0.25–0.5px。
- 單一像素的差值很大（channel 差 111，YIQ 等效 t 0.42），原因是 1px 寬的直筆（「1」「7」）跨欄移動。但這是次像素位移，不是字形、字重或顏色的改變。這和第一輪判 D 的 textbox「Hello」是同一型態。
- 注意：YIQ 0.2 時已有 18px，只比 `maxDiffPixels: 20` 少 2px。也就是說，這兩組在原門檻下本來就接近失敗。

**combobutton**：白色標籤的次像素反鋸齒重繪，沒有色相改變。

- 差異只在「Options」字形範圍內，下拉箭頭與按鈕外框都沒有差異。
- chromatic 與 strongChromatic 都成立，但只是因為白字的反鋸齒像素混入 primary 藍底。驗證結果：
  - 按鈕底色 expected 與 actual 相同（hover 70,122,211；focus 79,128,213），沒有 fill change。
  - 214 個差異像素全部落在「底色 → 白」的混合線上，偏離 <1/255。
  - 字形重心只移動 +0.03px。
- 最大 YIQ 等效 t 只有 0.13–0.14，所以在 0.2 下是 0 差異，降到 0.05 才浮現。

**附帶觀察**：第一輪方法寫到「SIG=25 的計數與 Playwright log 完全一致」。這在本輪不成立：SIG 計數是 97–115，而 Playwright 在 0.2 下是 0 或 18。之後若要對照 Playwright 計數，請用 `--yiq` 回報的 pixelmatch 精確值，不要用 SIG。

### 統計

| 類別 | 數量 | items |
|---|---|---|
| E | 0 | — |
| D | 6 | doublebox hover/focus、decimalbox hover/focus、combobutton hover/focus |
| U | 0 | — |

### U 清單

無。6 項都沒有色相改變、元素出現或消失，也沒有 >1px 的位移。
