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
| D80 | #72 X 鈕 hover 範圍（messagebox 限定／Window 全體／不改） | **已決：B（所有 Window 改中性），2026-10-08，使用者**。實作細節待 D84 |
| D81 | #73、#74 歸 DEMO 還是 ZK-CORE | **已決：A（ZK-CORE）**；已開 [ZK-6187](https://zkoss.atlassian.net/browse/ZK-6187)（2026-10-08），連結已貼在 #73、#74 的 comment |
| D82 | #1 errorbox 三角脫離：ZK-CORE 並開 ZK Jira | **已決：A，2026-10-08，使用者**。已開 [ZK-6188](https://zkoss.atlassian.net/browse/ZK-6188)，連結已貼 #1 的 comment。**備註：Jira 內文的最小重現（window＋textbox＋拖曳）與 Workaround（覆寫 `_fixarrow`）是 Planner 依 Verifier 的觀察寫的，尚未實際執行驗證**，待驗證後補記 |
| D83 | #47 fisheyebar 兩個方向一起修（水平預設外觀會變） | **已決：A，2026-10-08，使用者**。Generator 改 `zkex/.../fisheye.css` 中 |
| D84 | D80-B 的實作：`--zk-window-close-hover-bg` 是文件記載的公開 token（`doc/spec/component-theme-variables.md:231`，預設 `error-container`）。只改規則會讓這個旋鈕失效；改 token 預設值要動共用的 `tokens/_component-theme.css`（平行線文件第九節 1）與 spec 表格 | 待使用者 |

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

### J72 X 鈕 hover（D80-B：所有 Window 一起改中性；D84-A：保留 `--zk-window-close-hover-bg` 旋鈕，改預設值）

RED（已量，`gates/batch9-red/report.md`）：messagebox 與一般 window（embedded、overlapped）的 X 鈕 hover 值相同：背景 `oklch(0.89 0.056 26.4)`（像素 254,205,199）、圖示色 `oklch(0.375 0.154 26.4)`（127,0,10）。

| 編號 | 判定（今天必須失敗） |
|---|---|
| J72-1 | messagebox、embedded window、overlapped window 的 X 鈕 hover：背景像素與同一視窗中**非 close 的圖示鈕**（maximize 或 minimize；沒有就用 `.z-window-icon` 的 hover 值）hover 背景同色（ΔE ≤ 3，CIE76）；computed `color` 與該鈕相同 |
| J72-2 | hover 背景與 RED 的 (254,205,199) 距離 ΔE ≥ 10（不再是 error 色族） |

保護項（今天必須通過）：
- P72-a 靜止狀態（背景透明、圖示色 `rgba(0,0,0,.6)`）與 RED 相同；hover 的**尺寸、圓角、位置**不變（rect 與 RED 相同）。
- P72-b 其他圖示鈕（maximize、minimize）hover 值與 RED 相同。
- P72-c **旋鈕仍有效：** 在頁面上注入 `:root { --zk-window-close-hover-bg: #ffcc00 }`（Verifier 在頁面內用 `addStyleTag`），close 鈕 hover 背景像素變成該色（ΔE ≤ 3）；移除注入後回到中性。
- P72-d 點 X 鈕仍能關閉 window／messagebox（行為不變）；鍵盤聚焦時的 focus ring 不變。
- P72-e forced-colors 回歸不得出現新失敗。

D84-A 同時改動：`zul/.../zul/css/tokens/_component-theme.css:64` 的預設值（`var(--zk-color-error-container)` → `var(--zk-window-icon-hover-bg)`）、`window.css:133-136` 的 `.z-window-close:hover` 文字色（`on-error-container` → 與 `.z-window-icon:hover` 相同的 `on-surface`）、`doc/spec/component-theme-variables.md:231` 的預設值欄。token 不新增、不改名、不刪除。

## 七之二、批次 10 驗證方法（2026-10-08，RED run 前定稿）

通則同第七節。`PREVIEW_URL=http://127.0.0.1:8105`。

### J4 button：text 變體不該有 box-shadow（頁面 `button.zul`）
根因（原始碼）：`.z-button-text-{secondary,success,warning,error,info}.z-button`（`button.css:226-230`）沒有重設 `box-shadow`，吃到 `.z-button` 的 `--zk-button-elevation`；`.z-button-text.z-button`（:218）有重設。
- **J4-1（今天必須失敗）：** `z-button-text`、`-secondary`、`-success`、`-warning`、`-error`、`-info` 六種，靜止、hover、聚焦、按住四個狀態，computed `box-shadow` 皆為 `none`，且按鈕外圍 4px 內的像素與頁面背景一致（ΔE ≤ 1，CIE76；無陰影暈）。
- **保護項：** P4-a filled／outlined／icon／fab 各變體的靜止與 hover `box-shadow` 與 RED 完全相同（filled 靜止 resting、hover elevation-2 保留）；P4-b disabled 全變體 `none`；P4-c text 變體文字色、hover 狀態層（`::before` opacity）、`cursor` 不變；P4-d 按鈕尺寸 rect 不變。

### J6 calendar：disabled 日期同色（頁面 `calendar.zul` 的 constraint="no past" 範例）
根因（原始碼）：`.z-calendar-body tbody td.z-calendar-weekend`（0,2,2）蓋過 `.z-calendar-cell.z-calendar-disabled`（0,2,0）。
- **J6-1（今天必須失敗）：** 該範例當月所有 disabled 日期（含週六、週日）的 computed `color` 相同，且文字像素最深色 ΔE ≤ 1。
- **J6-2：** 同頁 disabled 日期仍全部有刪除線（`text-decoration-line: line-through`）、`cursor: not-allowed`、`pointer-events: none`。
- **保護項：** P6-a 同月可選週末日的色 = 可選平日的色（`--zk-calendar-fg`），與 RED 相同；P6-b 選取日（含週末選取日）文字色 = `on-primary`，圓盤顏色不變；P6-c 月外日 opacity 0.38 不變；P6-d 週末表頭色不變；P6-e hover 圓盤只出現在可選日；P6-f 其他 constraint 範例（`no future`、`before/after`）同樣 disabled 同色。

### J40 label：checkbox 與 radio 文字同字級（頁面 `label.zul`，同頁也有 `checkbox.zul`、`radio.zul` 可交叉量）
根因（原始碼）：`.z-radio-content`（`checkbox.css:306`）用 `--zk-typescale-label-large-size`（14px）；`.z-checkbox`、`.z-checkbox-content`、`.z-radio`、`.z-label`、input 都是 `--zk-typescale-body-medium-size`（13px）。依原則二（框架一致）取 13px。
- **J40-1（今天必須失敗）：** 同一頁上 checkbox 文字與 radio 文字的 computed `font-size`、`font-weight`、`line-height` 全部相同。
- **保護項：** P40-a checkbox 文字 13px 不變；P40-b radio 圓圈（外圈、內點）尺寸、radio 控制高度（`min-height`）、文字與圓圈垂直中心差（RED 值 ≤ 現值 + 0）不變；P40-c radio disabled／checked／focus 狀態外觀不變；P40-d `label.zul` 上 `z-flex` 居中範例的文字垂直置中不變（量文字中心與圓圈中心差，修改後 ≤ RED + 1px）。

### J47 fisheyebar（RED 探索：先重現再定判定）
頁面 `fisheyebar.zul`，勾選「Vertical orient」。設計師量到：容器變 80×480，每個圖示寬縮成 1px（高 64px），圖示 y≈729 跑出容器（容器 y 321–801）。Fisheye 項目由 JS 以 inline `left`／`top` 絕對定位（`Fisheyebar.ts syncAttr`），而主題 CSS 把 `.z-fisheyebar` 設為 `display:flex; flex-direction:row`、`.z-fisheye-image` 設為 `width/height:100%`，可能與 JS 版面衝突。
- **RED 要回報：** 水平與垂直兩個方向下，容器 rect、每個 `.z-fisheye` 的 rect／`position`／inline left／top／width／height、`.z-fisheye-image` rect，以及哪條 CSS 規則造成 1px 寬（用 computed style 與逐條關閉規則的量測判斷，**不得改檔案**，用 `page.addStyleTag` 在頁面內試驗）。
- **預定判定（RED 後依實測定稿）：** J47-1 垂直方向時每個項目的 rect 完整落在容器內、寬度 ≥ `itemWidth`（頁面設定值）；J47-2 水平方向與 RED 相同（保護）；J47-3 magnify（滑鼠移動）後放大的項目仍在容器內。

### J61 tbeditor（RED 探索：先重現再定判定）
頁面 `portallayout.zul` 的 Editor 區（`<tbeditor/>`）。設計師：圖示「又大又粗」，與 `utility/icons`（`/web/utility/icons.zul` 或同名頁）不一致。
- **RED 要回報：** tbeditor 工具列每顆按鈕圖示的繪製方式（font glyph／mask／img／svg）、實際渲染尺寸、筆畫粗細（以像素或 mask 來源判斷）、顏色；`utility/icons` 頁的標準圖示尺寸、筆畫、顏色（同一量法）；兩者差異表。再量工具列按鈕尺寸與分隔線。**不得改檔案。**
- **預定判定（RED 後依實測定稿，採最小解讀 R6）：** J61-1 圖示渲染尺寸 = `utility/icons` 的標準尺寸（±1px）；J61-2 圖示色 = `on-surface-variant` 一類的 token 色；保護項：按鈕命中尺寸（hit-target 不縮小）、hover／active／disabled 狀態層、工具列換行位置不變。

### 批次 10 RED 結果與方法定稿（2026-10-08，Fable，8105；[gates/batch10-red/report.md](../gates/batch10-red/report.md)）

| 判定 | RED | 數值 |
|---|---|---|
| J4-1 | 失敗（符合） | `z-button-text` 四狀態 none；`-secondary／-success／-warning／-error／-info` 靜止／hover／按住皆有 resting 陰影，4px 環最差 ΔE 2.79 |
| J6-1 | 失敗（符合） | disabled 平日 `rgba(0,0,0,.38)` vs disabled 週末 `rgba(0,0,0,.87)`，ΔE 40.46 |
| J40-1 | 失敗（符合） | checkbox 文字 13px、radio 文字 14px（行高、字重相同） |
| J47 | 已重現 | 垂直：容器 80×480，六項寬 1.33px；水平今天也錯（寬 68、上移 8px）。根因：`.z-fisheye` 是 `position: static`，JS inline left/top 被忽略 |
| J61 | 已重現 | tbeditor 的 `<svg>` 沒有尺寸 → 35×150，筆畫 3–4.5px；框架 toolbarbutton 的 Lucide 為 14×14、筆畫 1.5 |

保護項基線全數通過。J6-2 今天已通過（刪除線、not-allowed 原本就在，列為保護項）。

**方法定稿修正（Planner，RED 之後只此一次）：**
1. **J4-1：** 聚焦狀態只量 computed `box-shadow`（focus outline 2px 本來就畫在 4px 環內，像素環不可能通過）；像素環只量靜止、hover、按住，且以左、右、上三側為準（最後一列的底緣被容器裁掉）。
2. **#4 範圍：** `z-button-outlined-{secondary…info}` 也帶 resting 陰影，但 issue 只說 text 按鈕，依 R9 **不併入**，記為 follow-up。
3. **J6：** 判定文字改為「導航到當月（Oct 2026 的 no past）」，並排除被 ZK 標為選取的日期；「最深像素」只用於 disabled 群內比較，不與可選日比差值。P6-f（no future 等）今天同根因失敗，納入 J6-1 的涵蓋。
4. **P40-b：** 改為「文字墨水中心與圓圈中心差的絕對值 ≤ 0.5px」（今天 0.0／−0.5）。
5. **J47（待 D83）：** J47-1 垂直方向六個 `.z-fisheye` rect = 容器原點 + inline left/top，寬高 = inline width/height，±1px；J47-2 改為水平方向同式 rect = inline（不再做「與 RED 相同」的保護，因為今天水平就是錯的）；J47-3 magnify 指到第 3 項後六項 rect 仍 = inline（不寫「仍在容器內」，itemMax 160 > 容器 80 是 ZK 設計）；保護項：`.z-fisheye-image` 為項目的 10%/10%/80%/80%、cursor pointer、切回水平恢復。`aria-orientation` 切成垂直後仍是 `horizontal` 是 ZK widget 問題，記為 follow-up。
6. **J61（採最小解讀 R6）：** 標準尺寸取 **14px**（框架 toolbarbutton 的 Lucide 盒，依原則二）；J61-1 每顆 svg rect 寬 = 高 = 14±1 且在按鈕內；J61-2 筆畫 run 中位 ≤ 2px；J61-3 20 顆字形墨水兩兩 ΔE ≤ 2，目標色取 `--zk-color-on-surface-variant`（目前多數圖示 `rgba(0,0,0,.6)` ≈ (96,98,100)，只把走 `currentColor` 純黑的 `view-html`、`fullscreen` 拉齊；不把顏色改成 toolbarbutton 的 primary）；保護項：按鈕 35×35、分隔線 `::before` 1×35、兩列換行位置、tbeditor.zul 單列 pane 高 36；hover／active 狀態層若在 portallayout 內量不到，改到 `tbeditor.zul` 量。

**D83（新，待使用者，議題頁同 D80／D82）：** #47 的修法兩個方向一起改（CSS 分不出方向），會改變水平方向的預設外觀（每項 68→80 寬、位置回到 JS 值）。原則第五節第 4 項。建議 A（兩個方向一起修）。

### 批次 10a（#4 #6 #40 #61）GATE10-FINAL 第 1 輪：FAIL（2026-10-08，Fable，8105；[gates/batch10-final/report.md](../gates/batch10-final/report.md)）

| 判定 | RED | 現在 | 結果 |
|---|---|---|---|
| J4-1 | 五個彩色 text 變體三狀態有 resting 陰影，環 ΔE 2.79 | 24 個（變體、狀態）`box-shadow: none`，環 ΔE 0 | 通過 |
| J6-1 | 平日 .38 vs 週末 .87，ΔE 40.46 | 全部 .38，ΔE 0（Oct 2026 no past、Mar 2020、no future 皆同） | 通過 |
| J40-1 | radio 14px | checkbox 與 radio 皆 13px／400／20px | 通過 |
| J61-1 | svg 35×150 | 20 顆全 14×14，在按鈕內 | 通過 |
| J61-2 | 筆畫 3–4.5px | align-left／undo／strong 2／1.5／1.5 | 通過 |
| **J61-3** | view-html、fullscreen 純黑，ΔE≈40 | computed 顏色 20 顆全為 `rgba(0,0,0,.6)`，**但 Fullscreen 最深像素 (38,39,40) vs 其餘 19 顆 (96,98,100)，ΔE 25.88** | **失敗** |
| 保護項 | — | 全部通過（含 selected+disabled 不同時出現、按鈕 35×35、分隔線、換行） | 通過 |
| 回歸 | — | component-theming／hit-target／focus-scan／forced-colors 184 passed、0 failed；chromium 相關 gallery 25＋6 passed | 通過 |

**J61-3 失敗的機制（Verifier）：** Fullscreen 符號的填色與描邊重疊，半透明的 `on-surface-variant`（`rgba(0,0,0,.6)`）疊兩層 → 約 84% 黑。換 token 拉不齊，要讓顏色在整個圖示層級合成一次。這在 RED 時被「computed 顏色相同」的量法遮住了，是 Planner 的方法缺陷：J61-3 應量渲染後的像素，不是 computed 值。

**方法修正（Planner，第 1 輪之後只此一次）：**
1. J61-3 改為：20 顆圖示**最深像素**兩兩 ΔE ≤ 3（反鋸齒容差）；不用墨水中位（14px 細線圖示被反鋸齒主導）。
2. J61-2 採「RED 指名的三顆（align-left、undo、strong）筆畫 run 中位 ≤ 2px」；Formatting ¶、Fullscreen 是實心碗或重疊形狀，不是筆畫，不納入。
3. P61 hover：RED 沒有量 hover，無法比對。改為：hover 底色為 primary 8%；18 顆圖示 fill 變 primary（不變）；`view-html`、`fullscreen` 的 hover 不要求變 primary（本批刻意不動，記為 follow-up：這兩顆 hover 不跟其他圖示一起變藍，屬既有不一致）。
4. P40-b 的中心差 +0.5 剛好在 0.5 門檻，視為通過。
5. 回歸容差（chromium threshold 0.05、gallery maxDiffPixelRatio 0.01）吸收了本批的預期視覺變化，baseline 清單為空；依平行線文件第七節，通過後只針對本批元件的 gallery 用 `--update-snapshots=all`（不設 `UPDATE_FONT_BASELINE`）重生並逐張確認。

**下一步：** Generator 第 2 輪，只修 #61 的 J61-3（其餘 #4、#6、#40 已通過，不重修）。

### 批次 10a 第 2 輪：GATE10-FINAL2 PASS（2026-10-08，Fable，8105；[gates/batch10-final2/report.md](../gates/batch10-final2/report.md)）

Generator 第 2 輪只改 `zkmax/.../tbeditor/css/tbeditor.css`：圖示色改為「不透明的 token 色（`rgb(from var(--zk-color-on-surface-variant) r g b / 1)`）＋ svg 層級 `opacity: .6`」一次合成，hover／active 時 `opacity: 1`。`_colors.css` 沒有合適的不透明 token（`on-surface`、`on-surface-variant`、`outline` 都是半透明；不透明的 `--zk-color-dark`、`--zk-color-on-light` 語意不符），所以用相對色，不新增 token、不寫死色值。**備註：`opacity: .6` 是寫死的數字，須與 token 的 alpha 0.6 手動對齊（`nav.css:179` 有先例）。**

| 判定 | 第 1 輪 | 第 2 輪 |
|---|---|---|
| J61-1 | 20 顆 14×14 | 20 顆 14×14，全在 35×35 內 |
| J61-2 | 2／1.5／1.5 | 2／1.5／1.5 |
| **J61-3** | Fullscreen (38,39,40) vs 其餘 (96,98,100)，ΔE 25.88 | 190 對最差 ΔE **0.41**，> 3 的 0 對（Fullscreen (95,97,99)） |
| hover | — | 18 顆 fill → primary，opacity .6→1，最深像素 (55,111,208)，不變淡 |
| 回歸 | 184／25／6 passed | 184 passed、0 failed；chromium 25；gallery 6 |

**Verifier 的方法缺口與 Planner 裁定：**
1. `view-html`、`fullscreen` hover／active 為純黑 (0,0,0)：與 RED 的原始行為相同（這兩顆原本走 `currentColor` 純黑）。第 1 輪的灰色 hover 才是偏離原始。**維持現狀，不視為退步**；它們不跟其他圖示變藍是既有不一致，記為 follow-up。
2. disabled 保護項：tbeditor 沒有任何可達的 disabled 狀態（無屬性、無 class、無 `setDisabled`），**無法量，不宣稱已驗證**。Generator 的推理（svg 的 .6 乘按鈕的 .38）未經實測。
3. 回歸容差吸收了本批全部視覺變化，baseline 清單為空；baseline 於最後統一重生。

**follow-up（不在本批）：** `z-button-outlined-{secondary…info}` 帶 resting 陰影；fisheye 垂直後 `aria-orientation` 未更新（ZK widget）；tbeditor 的 view-html／fullscreen hover 不變藍；`.z-tbeditor-dropdown button svg` 仍是半透明 token 色。

### #47 fisheyebar：GATE47-FINAL PASS（2026-10-08，Fable，8105；[gates/batch47-final/report.md](../gates/batch47-final/report.md)）

D83-A（使用者裁示）：兩個方向一起修。Generator 只在 `zkex/.../menu/css/fisheye.css` 加兩行：`.z-fisheyebar { position: relative }`、`.z-fisheye { position: absolute }`（ZK 的 JS 以 inline left／top／寬／高絕對定位項目，主題 CSS 原本讓 `.z-fisheye` 是 static，位置被忽略、寬度被 flex 壓縮）。

| 判定 | RED | 現在 |
|---|---|---|
| J47-1 垂直 | 六項寬 1.33px，全擠在 y=713（Δw −78.7） | 六項 80×80，l=32、t=321+80k，Δ 全為 0 |
| J47-2 水平 | 寬 68、上移 8px（Δw −12、Δt −8） | 六項 80×80，l=32+80k、t=321，Δ 全為 0 |
| J47-3 magnify（停穩 600ms） | 水平 51/76.5/102…；垂直 1/1.5/2… | 80/120/160/120/80/80，Δ 全為 0 |
| 保護項 | — | 圖片比例、cursor、標籤、切回水平、容器尺寸全通過 |
| 回歸 | — | 184 passed、0 failed |

**揭露：** (1) magnify 有 transition 拖尾：滑鼠移動後立即量，寬高落後 20–80px，600ms 後為 0（left／top 立即到位）。這是既有的 `transition: width/height`，不是這次造成，不處理。(2) 放大項目超出容器（水平 magnify 第 1 項 l=−48、第 6 項 r=592）是 ZK 演算法的設計。(3) 定稿的 P47-a 寫「top 10%」，RED 實際是 20%，採「與 RED 相同比例」分支。(4) 垂直後 `aria-orientation` 仍是 horizontal，是 ZK widget 問題（follow-up）。

### baseline 重生（2026-10-08，Planner）

只針對本批元件、`--update-snapshots=all`、不設 `UPDATE_FONT_BASELINE`、不跑 `forced-colors-gallery`（人工檢視用擷取）、tablet 不動。範圍 8 個測試：chromium 的 button／checkbox gallery；gallery project 的 calendar、fisheyebar、label、portallayout、radiogroup、tbeditor。結果：7 張檔案內容有變，`checkbox-gallery.png` 像素不變。

| 檔案 | 新舊差異（亮度差 > 12 的像素） | 含本批預期變化 |
|---|---|---|
| button-gallery | 0 px（檔案位元組有變，亮度差都在門檻下；#4 的陰影極淡） | #4 |
| calendar-gallery | 11,343 px（0.59%） | #6：disabled 週六日（1、7、8、14、15、21、22、28、29、4）變淡 |
| fisheyebar-gallery | 17,446 px（2.91%） | #47：項目列 |
| label-gallery | 4,318 px（0.55%） | #40 |
| portallayout-gallery | 17,936 px（0.80%） | #61：tbeditor 圖示 |
| radiogroup-gallery | 11,801 px（1.88%） | #40 |
| tbeditor-gallery | 7,718 px（1.15%） | #61 |

**揭露：差異遮罩顯示這些 baseline 同時帶有與本批無關的舊漂移**（標題、小標文字的位置，radio 圓圈的雙影），因為它們停在 typography sweep 之前，原本靠容差通過。重生會把這些舊漂移一併更新，所以「像素差」不全是本批造成的。Verifier 量到的 radio 圓圈幾何與 RED 相同（P40-b），因此圓圈雙影是舊漂移。

### #72：GATE72-FINAL PASS（2026-10-08，Fable，8105；[gates/batch72-final/report.md](../gates/batch72-final/report.md)）

D80-B（所有 Window 一起改中性）＋D84-A（保留旋鈕、改預設值）。Generator 改三處：`window.css` 的 `.z-window-close:hover` 文字色 `on-error-container` → `on-surface`；`tokens/_component-theme.css:64` 的 `--zk-window-close-hover-bg` 預設 `var(--zk-color-error-container)` → `var(--zk-window-icon-hover-bg)`（共用檔，使用者以 D84-A 授權這一行）；`doc/spec/component-theme-variables.md:231` 的預設值欄。token 不新增、不改名、不刪除。

| 判定 | RED | 現在 |
|---|---|---|
| J72-1 close hover 背景 vs 同視窗參考鈕 | (254,205,199) | (240,244,250)＝參考鈕，ΔE 0.00；computed color `rgba(0,0,0,.87)`＝參考鈕 |
| J72-2 vs RED 的 error 色 | 0 | ΔE 23.13 |
| P72-c 旋鈕 | — | 注入 `#ffcc00` 後像素 ΔE 0.00，移除後回中性（四個視窗皆同） |
| P72-a／d／e | — | 靜止值與 rect 逐值相同；點 X 能關閉；focus ring 與參考鈕相同；forced-colors 17 passed |
| 回歸 | — | 184 passed、0 failed；window／messagebox／panel／caption 相關 7 passed |

glyph 像素 (31,32,32) vs RED (127,0,10)；形狀未變（156 px，與 RED 相同）。**baseline：無需重生**（hover 不在任何快照；清單為空）。**限制：** messagebox 沒有 maximize／minimize，參考鈕是把 close 節點複製成 `z-window-icon` 的合成節點；P72-b、focus ring 在 RED 沒有對照值，只記錄現值並證明與參考鈕一致。

### D85-A 與 rebase（2026-10-09，使用者裁示 D85-A）

**起因：** 合併前發現 `marble` 上提交 `1c739948643`（hawkchen，「reset button elevation on colour variants and honour treecol align in Marble」）已在 `button.css` 加了等效的 `box-shadow: none`（五個彩色 `text-*` 變體、五個彩色 `outlined-*` 變體、icon 按鈕），與 B 線 #4 的五行改動重疊。試算合併無衝突，但依平行線文件第七節停下回報；使用者裁示 D85-A：丟掉 B 線的五行、保留 `marble` 的那份。

**做法：** 兩個 repo 先建 `backup/line-b-pre-rebase-d85`；`git rebase marble`（zkcml 先、zk 後，無衝突）；在 rebase 後的樹上移除 B 線 `button.css` 的五行，`button.css` 與 `marble` 逐位元相同；重建 CSS 與全部 jar；8105 重啟並確認 served CSS。

**GATE-REBASE：PASS**（Fable，8105；[gates/rebase-d85/report.md](../gates/rebase-d85/report.md)）：J4 與 GATE10-FINAL 完全相同（24 個（變體、狀態）`none`，環 ΔE 0）；`outlined-*` 五變體由 resting 變 none 是 `marble` 提交的預期效果；#66、#71、#6、#40、#61、#47、#72 的 gate 腳本原樣重跑，數值相同（差異僅旋轉圖示瞬時值、翻到的日期、build hash）；回歸 184 passed、27 chromium、8 gallery，0 failed。

**button-gallery baseline：** rebase 前重生的版本帶有 outlined 彩色變體的 resting 陰影，rebase 後畫面已不同（容差吸收）。在 rebase 後的樹上重生，新舊差異約 375 px（亮度差 > 3），即 outlined 彩色變體失去陰影。

**揭露：** `button.zul` 量不到「icon 按鈕」重設：頁上唯一的 icon-only 按鈕 class 只有 `z-button`，與 `marble` 提交處理的 `z-button-icon` 不同；與 B 線無關。

### 合併與合併後完整回歸（2026-10-09）

兩個 repo 的 `marble` 皆 `git merge --ff-only jess/line-b`（zkcml 先、zk 後），未推送。8085 在 `marble` 上重建並重啟後跑完整回歸（[gates/merge-1.md](../gates/merge-1.md)）：**MERGE1: PASS**，443 passed／10 failed／47 skipped（focus-scan 既有 skip），**無法歸因 0**。

| project | passed | failed |
|---|---|---|
| chromium | 131 | 1 |
| gallery | 79 | 3 |
| component-theming | 107 | 0 |
| forced-colors | 17 | 0 |
| tablet | 49 | 6 |
| hit-target | 3 | 0 |
| focus-scan | 57 | 0 |

**歸因：** B 線 2 個（#40，見下）；A 線 5 個（`component-theming` gallery 與 `tablet-panel` 為 #54、`tablet-selectbox` 與 `tablet-biglistbox` 為 #29、`tablet-toolbar` 為批次 11；皆為預期效果，baseline 屬 A 線）；已知失敗 3 個（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）。使用者提交 `1c739948643`：無失敗。

**B 線的疏漏（揭露）：** #40 把 radio 文字由 14px 改為 13px，也讓 `tree › gallery`（內嵌 radio）與 `gallery › grid-paging` 的 baseline 失敗。我在批次 10 的回歸只用元件名稱過濾（button、calendar、checkbox、radio、label…），沒涵蓋含 radio 的其他頁面，所以到合併後才發現。已在 `marble` 的建置上重生這兩張（`--update-snapshots=all`）：`tree-gallery.png` 差異約 2,878 px，全在 radio 分頁位置那一段（沒有舊漂移）；`grid-paging-gallery.png` 高度 1376→1336（radio 由兩行變一行），並帶有舊 baseline 的漂移（批次 2–4 的變化原本靠 1% 容差通過）。

**`calendar-tablet`（已知失敗，不重切）：** 失敗區域比批次 6 多了 y 2200–2404 一段，是 #6 的 disabled 週末變灰。依 D42-A 不處理，下次有人重切時要含。

## 看板列草稿（合併負責人併入看板用；2026-10-08，B 線）

| State | Issues |
|---|---|
| Fixed and verified in `zk`, committed on `jess/line-b` (batch 9a), awaiting merge then comment | #66、#71 — gates [batch9-final](../gates/batch9-final/report.md) |
| Fixed and verified in `zk`/`zkcml`, committed on `jess/line-b` (batch 10a), awaiting merge then comment | #4、#6、#40、#61 — [batch10-final2](../gates/batch10-final2/report.md)（#61 第 2 輪才過） |
| Fixed and verified (#47; D83-A, both orientations), committed | #47 — [batch47-final](../gates/batch47-final/report.md) |
| Fixed and verified (#72; D80-B all windows, D84-A knob kept), committed | #72 — [batch72-final](../gates/batch72-final/report.md) |
| ZK-CORE, ZK Jira filed, comment with link posted 2026-10-08 | #73、#74 → [ZK-6187](https://zkoss.atlassian.net/browse/ZK-6187)；#1 → [ZK-6188](https://zkoss.atlassian.net/browse/ZK-6188) |

B 線合計：修好 7（#66 #71 #4 #6 #40 #47 #61）＋ #72 = 8；ZK-CORE 3（#73 #74 #1）。共 11 個 issue 全數處理完。合併後才貼 Jess 留言（#73、#74、#1 的連結留言已貼）。

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
