# Batch 14 follow-up (D117) — gallery baseline 差異分類

日期：2026-10-10 ｜ 角色：Verifier（read-only）｜ preview：http://localhost:8085（未重啟）
證據圖：`gates/batch14-gallery-classify/`（每張圖上半 = 今日、下半 = baseline；`*-annotated.png` 左 = 今日、右 = baseline，藍框 = shell text、綠框 = 比對通過的 component crop）
腳本與原始輸出：scratchpad `d117/`（`scripts/capture.js`、`compare.js`、`zoom.js`、`profile.js`、`probe*.js`，`result/<page>.json`、`result/<page>-annot.png`）

## 1. 方法

1. **擷取**：未修改 repo 任何檔案。以 zkpreview 的 `node_modules/playwright` 依 `gallery-scan.spec.ts` 的步驟重做：`devices['Desktop Chrome']`（viewport **1280×720**，spec 實際使用的尺寸，而非 1280×900）、`goto(/<page>.zul, networkidle)`、`document.fonts.ready`、注入 `*{transition-duration:0s !important}`、`locator('.z-p-8').first().screenshot({animations:'disabled', caret:'hide', scale:'css'})`。82 頁 = `src/main/webapp/web/*.zul` 扣除 spec 的 `COVERED_ELSEWHERE` 與 `SKIP`，全部 HTTP 200、全部有 `.z-p-8`。
2. **整頁差異**：pixelmatch（threshold 0.2，與 Playwright 預設相同）於重疊區域 + 尺寸差面積；比率 = diff / max(面積)。**82 頁全部與 baseline 同尺寸**（shell 字級改變沒有改變頁高）。
3. **shell text 規則**（明確定義）：
   - `zul.wgt.Label` 且自身或直接父元素的 class 含 `z-text-*` 或 `z-fw-*`（typography utility）→ shell；純文字節點同樣規則；只含 shell 文字且 class 含 `z-border*`/`z-bg-*` 的包裝 `div`（例如標題下的 `z-border-bottom`）→ shell。
   - 其餘 widget 根節點（由 `zk.Widget.$(el,{exact:true})` 判定）→ **component root**；`zul.wgt.Div / Vlayout / Hlayout / Vbox / Hbox / Space / Html / zhtml.*` 視為結構容器往下走。`Separator` 預設也是容器，但 `separator.zul` 另跑一次把 `Separator` 當 component。沒有 typography class 的 label（例如 `label.zul` 的 "Name"、biglistbox hlayout 內的文字）**不算 shell**，一律當 component 比對。
4. **component 比對**：每個 component root 的 bbox 外擴 12px（badge 的 count bubble、陰影會溢出）、但避開 shell box；在 baseline 內搜尋最佳平移（階梯式：seed ±3/±8 → 同列水平 ±90/±6 → 廣域 ±40/±160，均以 stride 粗搜再精修）。於最佳 (dx,dy) 以 pixelmatch threshold 0.1 計算 **exact** 不符像素；≤ 0.1% crop 面積 = unchanged。
5. **exact 未通過者**全部人工看放大圖（今日 vs 以 (dx,dy) 對齊的 baseline，3–4×）。原因：shell label 變窄使 grid `auto` 欄、flex 欄寬改變，component 常落在**非整數 x**，文字 AA 重新光柵化，exact 比率 0.2–2% 但幾何完全相同（證據 `longbox-subpixel-example.png`、`groupbox-subpixel-example.png`）。另試過雙線性次像素比對與 1px 鄰域容忍（TOL=64），皆不足以單獨自動判定（前者對 Chrome 文字光柵化無效，後者會放過淺色 2–4px 位移），故只當提示，最終以放大圖判定。
6. 剩餘檢查：baseline 中未被任何通過的 crop 覆蓋的非背景像素（residual）逐列分析，minX ≤ 40 的都是舊 shell 標題；minX > 40 的逐一核對（matrix 欄標題、同列 label、或失敗的 component 本身）。

## 2. 範圍

- 整頁比率 ≥ 0.2%：**48 頁**（要求的 ~49；邊界頁 tree-header 0.18%、drawer 0.17%、pdfviewer 0.17% 在 Playwright 比較器下可能剛好過線）。
- 0 < 比率 < 0.2%（17 頁，不在範圍）：absolutelayout, anchorlayout, anchornav, cardlayout, coachmark, columnlayout, cropper, drawer, goldenlayout, listbox-grouping, listbox-header, pdfviewer, scrollview, splitlayout, splitter, tablelayout, tree-header。
- 與 baseline 完全相同（17 頁）：borderlayout, calendar, combobutton, component-theming, dropupload, fisheyebar, grid-header, grid-paging, inputgroup, label, menubar, portallayout, radiogroup, slider, tabbox-misc, tbeditor, timepicker。

## 3. 48 頁分類表

欄位：比率 = 整頁 diff 比率；px = diff 像素數；comps = component root 數 / exact 未通過數；(dx,dy)×n = component 匹配到的平移分布。

| page | 比率 | px | comps / fail | (dx,dy)×n | 分類 | 說明 / 證據 |
|---|---|---|---|---|---|---|
| a | 0.41% | 1517 | 4 / 3 | (4,0)×1 (2,0)×1 (5,0)×1 (-19,-29)×1 | OTHER | anchor icon 與文字之間多了 gap（commit 221d6ed74b "add icon gap to Marble anchor"，已知）。`a-icon-gap.png` |
| avatar | 0.33% | 2614 | 11 / 0 | (0,0)×11 | HEADING-ONLY | |
| badge | 0.37% | 2736 | 17 / 0 | (0,0)×17 | HEADING-ONLY | `badge-shell-only-annotated.png`：標題 14px→22px/500、section label 變小變灰，badge 全部 pm=0 |
| barcode | 0.32% | 2384 | 4 / 1 | (0,0)×4 | OTHER | 第 3 個 barcode（x498,y187）條寬差異 1.43%；**同一頁連擷兩次也差 321 px**，與 baseline 的差異量級相同 → canvas 繪製非決定性，不是主題變更。`barcode-canvas-noise.png` |
| biglistbox | 0.50% | 4600 | 16 / 11 | (0,0)×10 (7,0)×5 (6,0)×1 | OTHER | (1) Selectbox 箭頭 ▼ → chevron（e5b82332a9 "fix selectbox arrow"，已知）`biglistbox-selectbox-arrow.png`；(2) hlayout 內 radio 的 label 字變小（`.z-radio{font-size:body-medium}`，1abb82d3b7 "use one radio label size"，已知）使 radiogroup 窄 7px、後續元件左移 `biglistbox-radio-label-size.png`；Biglistbox 本體 header/row 相同 |
| breadcrumb | 0.90% | 8128 | 4 / 0 | (0,0)×4 | HEADING-ONLY | |
| caption | 0.35% | 4605 | 7 / 0 | (0,0)×7 | HEADING-ONLY | |
| carousel | 0.66% | 20915 | 8 / 0 | (0,0)×8 | HEADING-ONLY | |
| cascader | 0.39% | 2178 | 4 / 0 | (0,0)×2 (3,0)×1 (2,0)×1 | HEADING-ONLY | matrix label 欄寬改變 → 水平 reflow |
| chip | 0.26% | 1934 | 14 / 0 | (0,0)×14 | HEADING-ONLY | |
| chosenbox | 0.47% | 3137 | 6 / 2 | (4,0)×2 (0,0)×2 (3,0)×1 (2,0)×1 | OTHER | chip 文字 italic → normal（zkcml 6da452813 "restyle chosenbox chips"，Jess #8/#12/#13，已知）。`chosenbox-chip-italic.png` |
| codeeditor | 0.55% | 10900 | 14 / 0 | (0,0)×14 | HEADING-ONLY | |
| colorbox | 0.63% | 4081 | 7 / 0 | (7,0)×3 (4,0)×3 (0,0)×1 | HEADING-ONLY | matrix 欄寬 reflow |
| confirmpopup | 0.31% | 5614 | 30 / 0 | (0,0)×29 (-4,-10)×1 | HEADING-ONLY | `confirmpopup-shell-only-annotated.png`；(-4,-10) 是空的 feedback label，pm=0 |
| daterangebox | 0.69% | 6810 | 15 / 7 | (0,0)×7 (7,0)×4 (3,0)×4 | HEADING-ONLY | matrix 欄寬 reflow，放大圖幾何相同（sub-pixel） |
| decimalbox | 0.95% | 3979 | 10 / 10 | (3,0)×4 (6,0)×2 (1,0)×2 (5,3)×1 (4,0)×1 | HEADING-ONLY | 同 longbox |
| dnd | 0.48% | 3653 | 4 / 0 | (0,0)×4 | HEADING-ONLY | |
| doublebox | 0.91% | 3812 | 10 / 10 | (3,0)×4 (6,0)×2 (1,0)×2 (5,-1)×1 (5,0)×1 | HEADING-ONLY | 同 longbox |
| doublespinner | 0.66% | 2800 | 10 / 2 | (3,0)×4 (6,0)×2 (5,0)×1 (-42,-162)×1 (1,-10)×1 (1,0)×1 | HEADING-ONLY | 同 longbox；(-42,-162)/(1,-10) 為近乎空白 crop 的誤匹配，以 dx=1 放大核對相同 |
| errorbox | 0.68% | 5259 | 5 / 0 | (0,0)×5 | HEADING-ONLY | |
| grid-detail | 0.24% | 3150 | 2 / 2 | (0,0)×2 | OTHER | 兩個 Grid 的 column header 文字左移 ~4px（2efcdc65c9 "keep header text aligned with the body"，Jess #35/#39，已知）；body 相同。`grid-detail-header-text.png` |
| grid-grouping | 0.31% | 2577 | 1 / 1 | (0,0)×1 | OTHER | 同上，僅 column header 文字。`grid-grouping-header-text.png` |
| grid-livegrouping | 0.21% | 1720 | 1 / 1 | (0,0)×1 | OTHER | 同上。`grid-livegrouping-header-text.png` |
| groupbox | 0.74% | 10960 | 14 / 8 | (0,0)×6 (3,0)×4 (6,0)×3 (5,0)×1 | HEADING-ONLY | label 欄寬改變 → dx 3/6，sub-pixel；`groupbox-subpixel-example.png` |
| hlayout | 0.48% | 5879 | 24 / 0 | (0,0)×24 | HEADING-ONLY | |
| intbox | 0.88% | 3679 | 10 / 10 | (3,0)×4 (6,0)×2 (1,0)×2 (6,-2)×1 (5,0)×1 | HEADING-ONLY | 同 longbox |
| linelayout | 0.31% | 8835 | 7 / 0 | (0,0)×7 | HEADING-ONLY | |
| longbox | 0.95% | 3988 | 10 / 10 | (3,0)×4 (6,0)×2 (1,0)×2 (13,0)×1 (5,0)×1 | HEADING-ONLY | `pv/matrix.zul` 的 `auto` label 欄（"Value"/"Placeholder" 為 z-text-sm）變窄 → 5 個 1fr 欄各移 1–6px（非整數），input 幾何、邊框、顏色相同。`longbox-subpixel-example.png` |
| messagebox | 0.27% | 2222 | 10 / 0 | (0,0)×10 | HEADING-ONLY | |
| multislider | 0.26% | 4547 | 6 / 0 | (0,0)×6 | HEADING-ONLY | |
| navbar | 0.29% | 5182 | 10 / 0 | (0,0)×10 | HEADING-ONLY | navbar 本體 pm=0（batch 14 的 navbar 變更已在 baseline 內） |
| notification | 0.25% | 2288 | 15 / 0 | (0,0)×15 | HEADING-ONLY | 3 個 native notification 樣本與 12 個 button 全部 pm=0 |
| organigram | 0.24% | 3600 | 13 / 0 | (0,0)×13 | HEADING-ONLY | |
| paging | 0.55% | 7986 | 8 / 3 | (0,0)×6 (37,0)×1 (80,0)×1 | OTHER | Paging 元件本身只有 reflow（flex 欄寬由 z-text-xs label 決定，dx 37/80，內容相同）；但頁尾 Grid 的 column header 文字左移（2efcdc65c9）。`paging-grid-header-text.png` |
| popup | 0.34% | 3427 | 6 / 0 | (0,0)×6 | HEADING-ONLY | |
| progressmeter | 0.47% | 4376 | 14 / 9 | (0,0)×14 | OTHER | fill 寬度比 baseline 短（value=100 只有 ~90%、60 → ~55%）。原因：fill 寬度由 **widget JS 逐步更新 inline `style.width`**（擷取瞬間 84% → 1.5s 後 100%），`transition-duration:0` 擋不住；同頁連擷兩次差 158 px。不是主題變更，是擷取時機；baseline 是在動畫結束後擷到的。`progressmeter-fill-value100.png`、`progressmeter-fill-row2.png` |
| rangeslider | 0.58% | 9657 | 7 / 0 | (0,0)×5 (3,0)×1 (-84,0)×1 | HEADING-ONLY | 同列 label 寬度 → dx；(-84,0) 為相同 slider 的等價匹配，pm 0.07% |
| rating | 0.73% | 8269 | 11 / 2 | (0,0)×4 (3,0)×1 (2,0)×1 (1,0)×1 (0,4)×1 (2,3)×1 (12,0)×1 (28,0)×1 | OTHER | "Custom Icon (iconSclass)" 區：baseline 仍畫星星，今日畫 bolt / gift glyph（b2aa291a03 "let a custom rating iconSclass pick its own glyph"，已知），並下移 4px；其餘 rating 相同（dx 12/28 為同列 label reflow）。`rating-custom-icon.png` |
| responsive-grid | 0.44% | 25541 | 5 / 1 | (0,0)×5 | OTHER | y=1428 的 Grid column header 文字左移（2efcdc65c9）；其餘 4 個 Grid pm=0。`responsive-grid-header-text.png` |
| rowlayout | 0.36% | 1767 | 3 / 0 | (0,0)×3 | HEADING-ONLY | |
| runtime-error | 0.23% | 1147 | 3 / 0 | (0,0)×3 | HEADING-ONLY | |
| searchbox | 0.46% | 2608 | 5 / 2 | (0,0)×3 (3,0)×1 (2,0)×1 | HEADING-ONLY | matrix 欄寬 reflow，sub-pixel |
| separator | 0.44% | 2834 | 5 / 0 | (0,0)×2 (-5,-7)×1 (4,0)×1 (-80,0)×1 | HEADING-ONLY | 5 個 separator bar 全部 pm=0；垂直 bar 位置隨 "Left/Middle/Right" shell label 寬度移動 |
| signature | 0.31% | 4799 | 6 / 0 | (0,0)×4 (9,0)×1 (26,0)×1 | HEADING-ONLY | 同列 label → Spinner dx 26 |
| space | 0.48% | 3705 | 7 / 0 | (0,0)×7 | HEADING-ONLY | |
| stepbar | 0.51% | 9941 | 8 / 0 | (0,0)×8 | HEADING-ONLY | |
| toolbar | 0.61% | 11360 | 13 / 4 | (0,0)×9 (10,0)×1 (44,0)×1 (53,0)×1 (67,0)×1 | HEADING-ONLY | "Vertical" 區 5 個 flex 欄寬 = 其上方 z-text-xs label 寬（baseline 標籤列寬到 x=673，今日 596），vertical toolbar 整體右移 10/44/53/67 px；toolbar 寬度（intrinsic，`align-items:flex-start`）、按鈕、分隔線相對位置相同。`toolbar-reflow-row.png`、`toolbar-reflow-labels.png` |
| vlayout | 0.45% | 6320 | 15 / 0 | (0,0)×12 (12,0)×3 | HEADING-ONLY | 同列 shell label 寬度 → Button dx 12 |

## 4. OTHER 頁面摘要（11 頁）

| 原因 | 頁面 | 性質 |
|---|---|---|
| column header 文字對齊（2efcdc65c9，Jess #35/#39） | grid-detail, grid-grouping, grid-livegrouping, paging, responsive-grid（範圍外同因：listbox-header, tree-header） | 已知的早期 batch 變更，baseline 當時未重生 |
| selectbox chevron（e5b82332a9）+ radio label size（1abb82d3b7） | biglistbox（範圍外同因 radio：tree-header, listbox-header） | 已知 |
| custom rating iconSclass（b2aa291a03） | rating | 已知 |
| chosenbox chip italic→normal（zkcml 6da452813） | chosenbox | 已知 |
| anchor icon gap（221d6ed74b） | a | 已知 |
| progressmeter fill 動畫（JS 更新 inline width，非 CSS transition） | progressmeter | 擷取時機；建議 spec 等待 `style.width` 穩定後再擷（≥1.5s 或等 aria-valuenow 對應的寬度） |
| barcode canvas 非決定性（run-to-run 321 px） | barcode | 擷取雜訊，與主題無關；在 1% 門檻下本來就會過 |

沒有發現歸屬於 batch 14（toast/notification/menubar/listhead）的未預期差異：notification、navbar、menubar 的 component 全部 pm=0。

## 5. 結論

- 37 頁的差異只有 preview shell 的標題 / section label / 說明文字本身，以及它們變窄造成的欄寬 reflow（水平 sub-pixel 位移），component 自身像素相同 → 可以重生 baseline。
- 11 頁有 component 自身差異；其中 9 頁可追溯到已知的早期 commit（header 對齊、selectbox、radio、rating、chosenbox、anchor），2 頁（progressmeter、barcode）是擷取不穩定，重生前應先處理 progressmeter 的等待方式，否則 baseline 會隨擷取時機漂移。

HEADING-ONLY: avatar, badge, breadcrumb, caption, carousel, cascader, chip, codeeditor, colorbox, confirmpopup, daterangebox, decimalbox, dnd, doublebox, doublespinner, errorbox, groupbox, hlayout, intbox, linelayout, longbox, messagebox, multislider, navbar, notification, organigram, popup, rangeslider, rowlayout, runtime-error, searchbox, separator, signature, space, stepbar, toolbar, vlayout
OTHER: a, barcode, biglistbox, chosenbox, grid-detail, grid-grouping, grid-livegrouping, paging, progressmeter, rating, responsive-grid

CLASSIFY14: DONE
