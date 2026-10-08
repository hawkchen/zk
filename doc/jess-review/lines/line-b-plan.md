# Jess review B 線計畫（批次 9、10）

建立日期：2026-10-08。依據：[jess-review-parallel-lines.md](../jess-review-parallel-lines.md)、[jess-review-decision-principles.md](../jess-review-decision-principles.md)、[jess-review-triage.md](../jess-review-triage.md)。
本文件是 B 線專屬文件，**不改共用文件**；合併時由合併負責人逐節併入看板與驗證計畫。
編號：決策 D80–D109，證據 `gates/batch9-*`、`gates/batch10-*`，截圖 `screenshots/batch9/`、`batch10/`。議題頁標題加 `[B]`。

## 一、環境（已建好）

| 項目 | 值 |
|---|---|
| 目錄 | `ZK10/jess-b/zk`、`ZK10/jess-b/zkcml`（從 `marble` 的 `4809af10b8` / `47012fa5b` 分出） |
| 分支 | `jess/line-b`（兩個 repo） |
| 預覽站 | `http://127.0.0.1:8105`，從 `jess-b/zk/zkpreview` 啟動 |
| Verifier 的 `PREVIEW_URL` | `http://127.0.0.1:8105`（絕不量 8085） |

建置結果見 [parallel-lines 第十節](../jess-review-parallel-lines.md)。

## 二、各 issue 的初步判定（開工前讀原始碼與設計師截圖的結果）

| # | 元件 | 設計師看到的 | 初步判定 | 檔案 |
|---|---|---|---|---|
| 72 | messagebox | 標題列的 **X 關閉鈕** hover 時是 error 色（截圖中是標題列右上角的 X，不是 OK／Cancel 按鈕） | THEME，但有範圍問題，見第三節 D80 | `zul/.../wnd/css/window.css:133-136`（`.z-window-close:hover`） |
| 73 | messagebox | OK 與 Cancel 同為實心主色，違反 MD3 每個容器一個高強調按鈕 | **沒有 per-button class** → 依指示歸 DEMO；更精確的歸類見第三節 D81 | 無（不改 CSS） |
| 74 | messagebox | No 要 error 色、Cancel 要 text 樣式 | 同 #73 | 無 |
| 66 | runtime-error | 關閉鈕沒有在最右角，右邊還有一個重新整理鈕 | THEME（待 RED run 確認 DOM 順序） | `zul/.../wgt/css/misc.css`（`.z-error`，約 :192 起） |
| 71 | loading | `Loading...` 內容（旋轉圖示與文字）沒有置中對齊 | THEME | `zul/.../wgt/css/misc.css`（`.z-loading`，:18–:65） |
| 1 | errorbox | 錯誤箱的小三角（tick）和箱體分離 | THEME；與 #67 同檔，要避開 #67 已修的 `cursor` | `zul/.../wgt/css/errorbox.css` |
| 4 | button | text 樣式按鈕有 box-shadow | THEME（triage 的線索：`button.css:20` 的 `--zk-button-elevation`，確認 text 變體有沒有重設） | `zul/.../wgt/css/button.css` |
| 6 | calendar | 「no past」範例中，週日與週六的 disabled 日期顏色比平日深 | THEME：`.z-calendar-weekend`（`calendar.css:179`，specificity 0,2,2）蓋過 `.z-calendar-cell.z-calendar-disabled`（:235） | `zul/.../db/css/calendar.css` |
| 40 | label | checkbox 文字 13px、radio 文字 14px | THEME（`checkbox.css` 有 `body-medium`（:31、:101、:244）也有 `label-large`（:306），要確認哪一個是 13px 的來源） | `zul/.../wgt/css/checkbox.css`、同族的 radio CSS |
| 47 | fisheyebar | 垂直方向時每個圖示縮成 1px 寬，且跑到框外 | THEME（設計師已量測，偏向尺寸問題）；待 RED run | `zkcml/zkex/.../menu/css/fisheye.css` |
| 61 | portallayout | Editor 區的圖示又大又粗，與 `utility/icons` 不一致 | THEME，但**檔案不是 portallayout.css**：Editor 是 `<tbeditor/>`，檔案在 `zkcml/zkmax/.../tbeditor/css/tbeditor.css` | `zkcml/zkmax/.../tbeditor/css/tbeditor.css` |

兩點修正（相對於看板與平行線文件的記載）：
1. 看板把 #72 寫成「按鈕強調」，實際上 #72 是標題列 X 鈕，#73、#74 才是按鈕強調。
2. 平行線文件把 #61 的檔案寫成 portallayout，實際在 tbeditor。批次 10 的檔案清單照本文件為準。

## 三、#72–#74 的查證：ZK 有沒有輸出每個按鈕的 class

**結論：沒有。** 證據：

- `zul/src/main/resources/web/zul/html/messagebox.zul`：`<custom-attributes button.sclass="z-messagebox-button"/>`，所有按鈕共用同一個 class。
- `zul/.../impl/MessageboxDlg.java:76-82`：迴圈建立按鈕，每個都 `mbtn.setSclass(sclass)`，只有 `setId("btn" + id)`。component id 在 DOM 中會被轉成 uuid，CSS 選不到。
- `zul/.../dom.ts` 的 `jq.alert`（client 端 alert）同樣沒有 per-button class。
- 唯一能用的是位置選取（`:last-child`），但按鈕順序因組合而異（`OK|CANCEL`、`CANCEL|YES|NO`），用位置會在不同組合給出錯誤的強調，不可採用。

依使用者指示，#73、#74 歸 DEMO，**本批不改 CSS**。

**D81（已決：選項 A，2026-10-08，使用者）：** #73、#74 標為 ZK-CORE，本批不改 CSS。後續：開 ZK Jira（對外動作，開立前再向使用者確認一次內容與時機）；回覆設計師的留言併入合併後的留言批次。看板由合併負責人更新。以下為決策當時的分析：「歸 DEMO」在分類上有一個落差：預覽頁用的是 `Messagebox.show(...)`，頁面本身沒有辦法替單一按鈕加 class，所以改預覽頁也解不了。真正要做的是 ZK 本體（`MessageboxDlg` 依按鈕種類加上如 `z-messagebox-button-ok` 的 class），屬 ZK-CORE，要開 ZK Jira（原則第五節第 3、10 項）。建議：#73、#74 在看板標為「ZK-CORE，待開 ZK Jira」，並回覆設計師說明原因。若使用者仍要照 DEMO，則兩者不處理、只回覆。

**D80（候選，待 RED run 後以議題頁提出）：** #72 的 X 鈕 hover 變 error 色，是 `window.css:133` 的設計（Window 全體共用）。選項：
- A（建議）只在 `.z-messagebox-window` 範圍內改為中性 hover。範圍最小（原則 R6），符合 issue 字面。代價：messagebox 與一般 Window 的關閉鈕 hover 不一致。
- B 全部 Window 改中性。一致，但改變 Window 預設外觀範圍超出 issue 所述（原則第五節第 4 項）。
- C 不改。
這是 MD3（對話框關閉鈕不應是 error 語意）與框架內一致性的衝突（原則第五節第 1 項），所以要問。

## 四、批次分組與檔案所有權

**批次 9**（錯誤與提示層，檔案集中在 `wgt/css`、`wnd/css`）：#72、#73、#74、#66、#71、#1

| 檔案 | issue |
|---|---|
| `zul/src/main/resources/web/js/zul/wgt/css/misc.css` | #66、#71 |
| `zul/src/main/resources/web/js/zul/wgt/css/errorbox.css` | #1 |
| `zul/src/main/resources/web/js/zul/wnd/css/window.css` 或 `messagebox.css` | #72（依 D80） |
| 預覽頁 `zkpreview/src/main/webapp/web/{messagebox,runtime-error,loading,errorbox}.zul` | 依需要 |

**批次 10**（各自的元件）：#4、#6、#40、#47、#61

| 檔案 | issue |
|---|---|
| `zul/.../wgt/css/button.css` | #4 |
| `zul/.../db/css/calendar.css` | #6 |
| `zul/.../wgt/css/checkbox.css`（與 radio 的 CSS） | #40 |
| `zkcml/zkex/.../menu/css/fisheye.css` | #47 |
| `zkcml/zkmax/.../tbeditor/css/tbeditor.css` | #61 |
| 預覽頁 `button.zul`、`calendar.zul`、`label.zul`、`fisheyebar.zul`、`portallayout.zul` | 依需要 |

與 A 線的檔案沒有交集（A：`inp` 的 selectbox、bandbox，`zkcml` 的 menubar、navbar）。
注意：`window.css` 之後 C 類（#55 window）也會碰，現在只有 B 線使用。
共用檔案（`tokens/`、`_forced-colors.css`、`lang*.xml`、`font-size-baseline.json`、`playwright.config.ts`、`*.spec.ts`）不動；#40 若需要新增 token 或動 spec 就停下來問。

## 五、流程與預計順序

依原則第三節。批次 9 先做：

1. 寫驗證方法（判定今天必須失敗、保護項今天必須通過）→ RED run（Verifier，Fable，看 8105）
2. Generator（Sonnet）修 CSS → 範圍檢查 → 最終判定（Fable，不看 diff）
3. baseline（只用 `--update-snapshots=changed`，只重生自己元件）→ 逐路徑提交到 `jess/line-b`（zkcml 先、zk 後）
4. 每批完成後 rebase `marble`、合併，才貼 Jess 留言（平行線文件第七節）

## 六、已提出的待決事項

| 編號 | 議題 | 狀態 |
|---|---|---|
| D80 | #72 X 鈕 hover 範圍（messagebox 限定／Window 全體／不改） | 待 RED run 後提出 |
| D81 | #73、#74 歸 DEMO 還是 ZK-CORE | **已決：A（ZK-CORE）**；已開 [ZK-6187](https://zkoss.atlassian.net/browse/ZK-6187)（2026-10-08），連結已貼在 #73、#74 的 comment |

## 七、批次 9 驗證方法（2026-10-08，RED run 前定稿；RED 之後只允許 Planner 依 RED 結果修方法，之後不再改）

通則：Verifier 用 Playwright（`--output` 指向 `gates/batch9-red/`），`PREVIEW_URL=http://127.0.0.1:8105`，量測前關閉 transition。所有量測只看 `getBoundingClientRect`、`getComputedStyle` 與像素，不依賴特定 CSS 寫法。DOM id 是 uuid，用 class 或固定 id（`#zk_err`、`#zk_showBusy`）選取。

### J66 runtime-error：關閉鈕在最右角（頁面 `runtime-error.zul`，點「Trigger Error」與「Trigger Multiple Errors」）

| 編號 | 判定（今天必須失敗） |
|---|---|
| J66-1 | `#zk_err-remove-btn`（關閉）的右緣 > `#zk_err-refresh-btn`（重新整理）的右緣，且關閉鈕右緣與 `#zk_err-p` 內容區右緣（扣除 padding）的距離 ≤ 1px |

保護項（今天必須通過）：
- P66-a 兩個按鈕仍可見，各 32×32；`.errornumbers` 的右緣 ≤ 兩顆按鈕中較左者的左緣。
- P66-b 錯誤圖示（`#zk_err-p::before`）仍在最左，24×24。
- P66-c 點關閉鈕後 `#zk_err` 消失（行為不變）；點重新整理鈕不會把關閉鈕換位。
- P66-d 1 筆與 2 筆錯誤時，上述順序一致。

### J71 loading：內容置中（頁面 `loading.zul`，觸發全頁 busy 與元件級 busy）

| 編號 | 判定（今天必須失敗） |
|---|---|
| J71-1 | 全頁 `.z-loading`：內容（`.z-loading-indicator`）的上下間距差 ≤ 1px，且左右間距差 ≤ 1px（間距 = indicator 外框到 `.z-loading` 外框的距離，扣掉 CSS padding 不算；直接比較兩側實際空白） |
| J71-2 | 元件級 `.z-apply-loading`（`.z-apply-loading-indicator`）同 J71-1 |

保護項：
- P71-a `.z-loading` 仍為 `position: absolute`，z-index 高於 `.z-modal-mask`，`cursor: wait`。
- P71-b 旋轉圖示 20×20、仍在動（兩個時間點的旋轉角不同）；圖示與文字垂直中心差 ≤ 1px。
- P71-c 內容仍不換行（單行）；框的圓角、陰影、底色不變。
- P71-d 框相對於螢幕的位置（ZK 以 inline left/top 置中）不因本修改移動超過 1px。

### J1 errorbox：小三角貼齊箱體（頁面 `errorbox.zul` 的真實 errorbox；`usecase/item-editor.zul` 的空白必填欄位）

先在 RED run 重現設計師的畫面（截圖 `i1-1.png`：箱子在欄位左側，三角在右邊），再量。對每個出現的方向 class（`z-errorbox-left|right|up|down`）：

| 編號 | 判定（今天必須失敗） |
|---|---|
| J1-1 | `.z-errorbox-pointer` 的底邊（貼箱子的那一邊）與 `.z-errorbox-content` 的外緣距離 ≤ 1px，且三角中心落在內容邊緣的範圍內（距角 ≥ 8px） |
| J1-2 | 三角像素顏色連續：三角底邊中點與內容邊框同色（ΔE ≤ 3，CIE76），中間沒有透明縫隙 |

保護項：
- P1-a 圖示距內容左緣 12px、關閉鈕距右緣 4px，在四個方向都不變（原 CSS 註解的設計）。
- P1-b 內容 `cursor: move`、寬 260px（含 padding 規則）、陰影、邊框、圓角不變。
- P1-c 預覽頁上靜態範例（`errorbox.zul` 的 `h:div` 範例，`cursor: default`）外觀不變，與 RED 的截圖逐像素相同（範例不是 widget，不得被影響）。
- P1-d 欄位仍被指到：三角尖端落在目標欄位邊緣 ≤ 8px 內（與 RED 相同或更近）。
- P1-e #67 已修的游標：靜態範例 `default`、真實 errorbox `move`。

### J72 messagebox X 鈕 hover（D80 未定，不在第一輪）

RED 只做重現：量 `.z-messagebox-window .z-window-close:hover` 的 `background-color` 與 `color`（今天為 error 色調），以及一般 `z-window` 的同一個量；判定依 D80 的裁示再定稿。

## 八、紀錄（逐批追加）

### 批次 9 RED run（2026-10-08，Fable，8105；報告 [gates/batch9-red/report.md](../gates/batch9-red/report.md)）

| 判定 | RED | 數值 |
|---|---|---|
| J66-1 | 失敗（符合） | 關閉鈕右緣 820、重新整理鈕 864（= 內容右緣）；關閉鈕距右緣 44px。1 筆與 2 筆相同 |
| J71-1、J71-2 | 失敗（符合） | 上 16／下 21／左 24／右 24，垂直差 5px（全頁與元件級相同） |
| J1-1、J1-2 | **通過（不符合 RED）** | 首次開啟四個方向三角皆貼合、同色 |
| J72（重現） | 已重現 | hover 背景 `#fecdc7`、圖示 `#7f000a`；**一般 Window 的 X 鈕 hover 值完全相同** |
| 保護項 | 全部通過 | P1-d 的 up 方向有歧義（見下） |

**#1 的實際機制（Planner 拆設計師 GIF 72 幀 + 讀原始碼）：** 三角脫離發生在**錯誤箱換方向**之後，不是首次開啟。`Errorbox._fixarrow`（`zul/.../inp/Errorbox.ts`）用 `pointer.style.top/left = undefined` 清除前一方向的定位，但對 `CSSStyleDeclaration` 賦值 `undefined` 是無動作，舊值殘留，與新設的 `right`／`bottom` 同時生效。這是 widget TypeScript 的問題，CSS 壓不過 inline style（除非 `!important`，違反 R2）→ 原則第五節第 3 項。Verifier 用拖曳換向可穩定重現（`gates/batch9-red/red1-down-by-drag-observation.png`）。

**方法定稿修正（Planner，RED 之後只此一次）：**
1. J1 改為「方向改變後」才量，因此 J1 不再屬於本批 CSS 的判定；#1 是否由 CSS 處理取決於 D82。
2. P1-d 的 up 方向改為「尖端距最近一條邊 ≤ 8px」（full-width 欄位的箱子與欄位上緣同高，會蓋住欄位）。
3. J1-1 只適用 l／r／u／d，角落方向（lu／ld／ru／rd）pointer 中心距角 6px 屬 ZK 設計，不納入。
4. P66-c 的「點重新整理鈕不換位」改為 hover 版（點下去整個面板會消失）。
5. P71-b 的 20×20 用 `offsetWidth／offsetHeight`（旋轉中 bbox 23–25px）。
6. J66 量測前須等 `#zk_err` 的 rect 穩定（`zk.error` 的滑入是 JS 動畫，CSS 擋不住）。
7. J72／D80：hover error 色是所有 Window 共用，D80 的範圍選項是「messagebox 限定／所有 Window／不改」。

**待決（議題頁 https://claude.ai/artifact/5UyWB9HM42KNqsJfDWfCSj ）：** D80（#72）、D82（#1：ZK-CORE 並開 ZK Jira，或在本線改 TS，或不處理）。建議 D80-A、D82-A。

### 批次 9a（#66、#71）最終判定：GATE9-FINAL PASS（2026-10-08，Fable，8105；報告 [gates/batch9-final/report.md](../gates/batch9-final/report.md)）

Generator（Sonnet）只改 `zul/.../wgt/css/misc.css`（+5/−2）：`#zk_err-remove-btn { order: 1 }`；`.z-loading-indicator`、`.z-apply-loading-indicator` 由 `inline-flex` 改 `flex`（根因：inline-flex 在 block 容器內產生 line box，下方多出 5px）。範圍檢查：只動預期檔案、無 `!important`、無寫死色值；lint:css 無違規。

| 判定 | RED | 現在 |
|---|---|---|
| J66-1 | 關閉鈕距內容右緣 44px | **0px**（1 筆與 2 筆相同） |
| J71-1（全頁） | 垂直差 5px（上 16／下 21） | **0px**（上 16／下 16） |
| J71-2（元件級） | 垂直差 5px | **0px** |
| 保護項 P66-a–d、P71-a–c | 通過 | 全部通過 |
| 回歸（component-theming、hit-target、focus-scan，指 8105） | — | 167 passed、0 failed；`doc/screenshots` 無變動 |

**P71-d 的裁定（Planner，結果出來之後才裁，在此揭露）：** 條文「框相對於螢幕的位置（ZK 以 inline left/top 置中）不因本修改移動超過 1px」有兩種讀法。框高 57→52 後，ZK 重新置中，inline top 由 421.5 變 424（上緣移 2.5px），但框的**中心**偏移與 RED 完全相同（0px）。**採中心讀法，P71-d 通過。** 理由：條文括號明說位置由 ZK 的置中演算法決定；修掉多餘的 5px 必然讓框變矮，若要求上緣不動，框就會偏離置中，等於把本 issue 要修的不對稱搬到別處。若你要字面的上緣讀法，這項要列為已知差異，結論仍不變（#71 的目標「內容置中」達成）。

**baseline：** 回歸顯示 `runtime-error-gallery.png` 等沒有像素變動，不重生任何檔案。

**進度：** #66、#71 gate 通過，待提交（`jess/line-b`）；#72（D80）、#1（D82）等裁示。
