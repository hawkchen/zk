# Jess review：決策原則與處理流程

建立日期：2026-10-08。依據：第 1–5 批（25/82 已修正）累積的裁示，歸納成可以重複套用的規則。
適用範圍：看板（[jess-review-triage.md](jess-review-triage.md)）上「P1 元件」類的剩餘 issue。
本文件中的 D 編號指 [jess-review-verification-plan.md](jess-review-verification-plan.md) 裡的裁示。

## 一、基本原則（使用者訂，2026-10-08）

1. **盡量遵循 MD3。** 設計師的描述與 MD3 規格衝突或沒有寫明時，以 MD3 為準（色彩用 tonal pair、狀態層、字級用 typescale token）。
2. **框架內的設計彼此一致。** 同一族的元件（清單列、輸入框、彈出清單、捲軸、晶片…）用同一套視覺語彙。要決定某個狀態長怎樣時，先找框架內已經通過驗證的同族例子，照那個做，不另創新樣式。

兩條原則衝突時（例如 MD3 的樣子與已發布元件不一致）：**不自行決定，列為例外問使用者**（見第五節）。

## 二、輔助規則（為了落實上面兩條）

| # | 規則 | 來源 |
|---|---|---|
| R1 | 設計師指定了 token 或數值就照用（例：#16 的 `--zk-color-on-surface-variant`、`--zk-typescale-body-small-size`）。 | 第 5 批 |
| R2 | 只用 `--zk-` token，不寫死色值；不加 `!important`，非加不可就在程式碼註明原因。 | marble-theme skill |
| R3 | 能用純 CSS 解決就用純 CSS。需要改 widget 的 TypeScript／Java（行為、DOM）時，**不在這裡做**。 | D11-B、D32-C |
| R4 | 純 CSS 修得了的那一半先修，widget 的那一半開 ZK Jira，兩邊在留言中說清楚。 | D32-C（#37）、D11-B（#65） |
| R5 | 問題出在預覽頁（demo）而不是元件，歸為 DEMO，修預覽頁，不改 theme。 | #67、#77、#81 |
| R6 | 設計師描述含糊時，取**範圍最小**的解讀；在 RED run 先重現她的畫面，確認解讀後才修。 | D46-A |
| R7 | 瀏覽器限制讓字面要求做不到時，達成**視覺意圖**即可，並在留言中老實說明差異。 | D48-A（#17） |
| R8 | 目標與既有 contract 衝突時，以原則為準更新 contract，並在 diff 與看板記錄；若要「退掉」contract 中一整條規格，列為例外。 | D40-A（sc6） |
| R9 | 只修 issue 寫的事，不順手改相鄰程式碼；發現的其他問題記進 follow-up。 | CLAUDE.md |
| R10 | 色彩對比：文字 ≥ 4.5:1，圖形元件 ≥ 3:1；達不到要在報告中標出。 | 第 2、5 批 |
| R11 | 做不到時有事先寫明的退路：不改、在 contract 註明差異、回覆設計師，由使用者同意後才貼。 | D40 |
| R12 | 已知既有失敗（例：`calendar-tablet`、`slider-tablet`）不在本批處理，記進 follow-up。 | D42-A |

### 同族一致性的既有基準（遇到同類問題直接套用）

| 類別 | 基準 | 來源 |
|---|---|---|
| 清單列、下拉選項被選取 | `secondary-container` 底、`on-secondary-container` 字 | D10-A |
| 捲軸 | 與文件中的 `zul.Scrollbar` 靜止狀態一致：`--zk-color-outline-variant`、8px、圓角、無軌道槽；hover 深一階 `--zk-color-outline` | D40-A、D43-A |
| 唯讀輸入框 | 不出現會被誤認為可編輯的選取反白 | D48-A |
| 通知、toast | 不要左側色條；圖示用 `on-*-container` | 第 1 批 |
| hover 底色 | 同一元件內每一列相同，不受奇偶條紋影響 | #38 |
| 不可點的地方 | 預設游標，不用 pointer／move | #36、#65、#67 |
| 下拉箭頭（selectbox、combobox、bandbox、accordion 展開箭頭） | 同一個 chevron-down 遮罩，ink 約 8×5，右緣距約 12px；forced-colors 下用 `CanvasText`。accordion 標題內距是 16px，遮罩盒要用 `margin-right:-7px`（selectbox 是 -4px），以量到的右緣距為準 | D52-A（#29）、D56-A（#53） |
| 拖曳 ghost（window） | 不淡化（opacity 1）、內部用 `--zk-color-surface` 不透出背景；outline 為 focus ring 原色 | D57-B（#55） |
| 圓角外框變體（panel `border="rounded"`） | 外框與 `border="normal"` 同色同寬，保留圓角；陰影與 head 分隔線不加 | #54 |
| 巢狀導覽（navbar）縮排 | 每層 +26px，縮排放在內容元素的 `padding-left`，hover 狀態層仍滿寬 | #51 |
| 清單／表頭的捲軸欄位 | 與表頭同色，不另上色 | D53-A（#3） |
| Switch（checkbox `mold="switch"`） | MD3：軌道 52×32、2px outline（關）／primary 實心（開）、滑塊 16（關）／24（開）、40px 狀態層；關閉態滑塊用 `on-surface-variant` 以達 3:1（偏離 MD3 的 `outline`）。圖示（打勾）未做 | D62-A（#10） |
| 欄位錯誤訊息 | 11.0 維持彈出的 errorbox；行內模式、可關閉拖曳、預設位置改下方都在 ZK-6191，不在主題做 | D60-A（#30 #68 #69） |

新處理一個元件時，把它的結論補進這張表。

## 三、每一批的處理流程

每批 3–6 個 issue，以同一個 CSS 檔或同一族元件為單位。

1. **選批：** 從看板的 P1 清單取同檔案或同族的 issue。先確認工作樹沒有別人未提交的相關檔案（`git status`，不推論歸屬）。
2. **寫方法：** 在 `jess-review-verification-plan.md` 新增一節。每個 issue 有「判定」（今天必須失敗）與「保護項」（今天必須通過），量法只看像素、命中測試與 computed style，不依賴特定的 CSS 寫法。
3. **RED run（Verifier，Fable）：** 在現有程式碼上量。判定今天就通過、或量不到，就是方法有缺陷，由 Planner 修方法後定稿，之後不再改。
4. **Generator（Sonnet）：** 依 brief 修 CSS，只動 brief 列的檔案，不開瀏覽器、不 commit。做不到純 CSS 時停下回報。
5. **範圍檢查（Planner）：** 看 diff 只落在預期檔案、沒有 `!important`、沒有寫死色值。
6. **最終判定（Verifier，Fable，不看 diff）：** 全部判定與保護項、回歸套件（component-theming、forced-colors、chromium、tablet、hit-target、focus-scan）。結論行 `GATEn-FINAL: PASS/FAIL`。
7. **baseline：** 只用 `--update-snapshots=changed`，只重生預期變動的檔案，逐張確認是預期。
8. **提交：** 逐路徑暫存（不用 `git add -A`），暫存前後各查一次 `git diff --cached --name-only`。zkcml 先提交，再提交 zk。訊息格式 `ZK-6112: …`，英文。
9. **證據與看板：** 證據進 `gates/batchN-*`；更新看板的計數與狀態列。
10. **Jess 留言：** 每個 issue 一則，結構為 `# Root cause`、`# Solution`、`# Result`（附修改後截圖）。截圖放進 `hawkchen/marble-issue` 的 `screenshots/`。留言直接貼（D16-B），貼完在看板標記。
11. **回報使用者：** 用任務回報格式，結果簡短；只在有例外或需要決策時才開議題頁（Artifact）。

### 角色與模型

- **Planner：** 主 session。寫方法、校正方法、範圍檢查、提交、留言。
- **Generator：** Sonnet subagent。
- **Verifier：** Fable 或 Opus subagent，**看不到 CSS diff**。Sonnet 只用於不下判斷的截圖工作。
- 實作者與量測者必須是不同的 agent，狀態放在檔案裡。

### 實務注意

- 8085 預覽站是共用資源：回歸前在證據報告首行宣告使用中；量測前確認伺服的是新 build（比對 `.css.dsp`），必要時重啟。
- 預覽站的 DOM id 是 uuid，用 class 或 `zk.$('$id').$n()` 選取。
- 唯讀 `<input>` 不理會 `user-select`；游標在截圖中看不到，要用註記標籤並在留言中說明。
- 推送、關閉 issue 由使用者決定，不自行做。

## 四、可以直接做完（不必每步問）

符合以下全部條件時，從選批到留言一路做完，最後一次回報：

- issue 屬於 P1 元件類，且 MD3 與框架內一致性**不衝突**；
- 純 CSS 可以解決（或能清楚切出 CSS 的那一半）；
- 只動 `zul`／`zkcml` 的主題 CSS、預覽頁與 baseline；
- 回歸沒有無法歸因的新失敗。

## 五、例外：停下來問使用者

遇到任何一項就停，用議題頁（Artifact）列出選項與代價，再繼續：

1. **MD3 與框架內一致性互相衝突**，或兩個 issue 的要求互相矛盾。
2. **DECIDE 類 issue**（#30 #10 #68 #11）：本質是設計決策，不是修補。
3. 需要改 **widget TypeScript／Java、公開 Java API、`zul.xsd`**，或影響 `../zkcml/` 的公開介面。
4. 要**退掉既有 contract 的一整條規格**，或改變某個元件的預設外觀範圍超出 issue 所述。
5. 要**新增、改名或刪除公開的 `--zk-` token**（會影響使用者自訂）。
6. 設計師描述含糊，且最小解讀 RED run 重現後仍無法確定。
7. Generator 3 輪仍未通過，或原因出在 ZK 本身而非樣式。
8. 回歸出現無法歸因的失敗，或失敗與其他 session 未提交的變更重疊。
9. 範圍擴大：需要動超過 issue 所屬元件的檔案。
10. **對外動作：** 推送、關閉 issue、建立 ZK Jira、改寫已貼出的留言。
11. 與另一個 session／worktree 的工作重疊（同一個檔案有別人未提交的修改）。

停下來問的時候，附上建議項（標示「建議」），讓使用者一句話就能裁示。

## 六、每批結束時的回報（簡短）

任務回報格式的精簡版：結果一句話、各 issue 前後數字、例外與發現、需要的決策（若有）、下一批候選。不重貼過程。

## 七、歷史裁示索引

| 編號 | 裁示 | 批次 |
|---|---|---|
| D10-A | 清單列選取用 `secondary-container` | 2 |
| D11-B | 拖曳游標歸 widget，另開 ZK Jira | 1 |
| D16-B | Jess 留言直接貼 | — |
| D32-C | #37 CSS 先修，同時開 ZK Jira | 3 |
| D35 | 最終判定模型用 Fable | 3 |
| D39-A | #31 兩件都修 | 4 |
| D40-A | #78 照文件捲軸；做不到退路為不改 | 4 |
| D41-A、D42-A、D43-A | 重生 biglistbox tablet baseline；slider／calendar tablet 不處理；hover 深一階 | 4 |
| D44-A–D47-A | 第 5 批範圍與做法 | 5 |
| D48-A | 唯讀 combobox 只要沒有選取反白 | 5 |
| D49-A | 重生 chosenbox 三張 baseline、逐路徑提交 | 5 |
| D50（撤回） | #25 一度判為「純 CSS 做不到」；使用者指出可由 slider 根元素的方向 class 判定，改用 `body:has(.z-slider-horizontal .z-slider-button:active)`，純 CSS 完成 | 6 |
| D51 | 允許並行使用不同 port，條件是第二台預覽站從自己的 worktree 啟動 | 平行線（7） |
| D52-A | #29 selectbox 箭頭改為同族 chevron 8×5，不用實心三角 | 7 |
| D53-A | #3 修 `listbox.css`，所有 listbox 的捲軸欄位格與表頭同色 | 7 |
| D54-A | #49 保留預留勾選欄，不改 CSS，留言說明並附前後截圖 | 8 |
| D55-B | 重生 baseline 的 playwright 指令被權限檢查擋下，由使用者加權限規則後執行 | 7 |
| D56-A | #53 accordion 展開箭頭換成同族 chevron 遮罩（8×5，右緣距 12px），補 forced-colors | 11 |
| D57-B | #55 window 拖曳 ghost 內部加 `--zk-color-surface` 底色（改變所有 Window 拖曳外觀，使用者已知悉） | 11 |
| D80-B | #72 所有 Window 的 X 鈕 hover 改中性（不限 messagebox）；MD3 與框架一致性衝突時選一致且符合 MD3 | 9 |
| D81-A | #73、#74 歸 ZK-CORE：ZK 的 messagebox 沒有 per-button class，主題 CSS 做不到；開 ZK-6187，不改 CSS | 9 |
| D82-A | #1 三角脫離是 ZK `Errorbox._fixarrow` 的問題（`style.top = undefined` 無效）：歸 ZK-CORE，開 ZK-6188 | 9 |
| D83-A | #47 兩個方向一起修（CSS 分不出方向），水平方向的預設外觀因此改變 | 10 |
| D84-A | D80-B 的落地：保留公開 token `--zk-window-close-hover-bg`，只改預設值（動共用 `_component-theme.css` 一行與 spec 一列），不改規則了事讓旋鈕失效 | 9 |
| D85-A | #4 與 `marble` 上別人的提交 `1c739948643` 重疊：丟掉 B 線重複的五行，保留 marble 的 | 平行線（10） |
| D110-A | 批次 14（C 線，CSS 相關 follow-ups）做 P1–P4；P5 不做 | 14 |
| D111-A、D116-A | toast info 圖示對比 3.68 → 4.85:1：保留公開旋鈕，只把預設值 `--zk-toast-accent` 改成混 20% `on-surface`（動共用 `_component-theme.css` 一行，同 D84-A）；規則內混深會讓旋鈕設的色不再原樣呈現，兩條 component-theming 測試因此失敗 | 14 |
| D112-A | notification 改用與 toast 相同的 `*-container` token（info 用 `surface-container-highest`），箭頭用同一組實色 | 14 |
| D113-B | 動共用檔 S1（selectbox forced-colors 移到 `_forced-colors.css`）、S3（修空轉測試）、S4（捲軸欄位測試） | 14 |
| D114-A | forced-colors 下 `border="none"` 的 panel 仍畫 1px 黑框：維持現狀，是刻意（那條規則就是為了保留邊界，`.z-window` 同） | 14 |
| D115、D117、D118-B | gallery 容差由 1% 收緊為 0.2%；先把預覽頁標題變更（`47d26068ed`）造成的 37 頁與 11 頁其他過期 baseline 重切，progressmeter 擷取時加等待 | 14 |
| D59-A | 第 12 批做 DECIDE 批，每題各開議題頁；順序 #30 → #68 → #10 + #11 | 12 |
| D60-A | #30（連帶 #68 #69）：11.0 維持彈出的 errorbox，開 ZK Jira 提 opt-in 行內錯誤模式、可關閉拖曳、預設位置；行內模式要改 widget 與 Java，CSS 做不到 | 12 |
| D61-A | 照草稿建立 ZK-6191（New Feature，Affects 11.0.0）並貼 #30 #68 留言；#69 之後補貼 | 12 |
| D62-A | #10 Switch 改成 MD3（退掉 contract sw1–sw9 的 MUI 規格）、預覽頁 Switch 獨立成區塊；#11 不改 CSS，留言請設計師決定是否保留 `mold="toggle"` | 12 |

### 第六批學到的做法

- 宣稱「純 CSS 做不到」之前，先查祖先或兄弟元素有沒有可判定的 class／狀態，並試 `:has()` 搭配 `:active`、`:hover`、`:focus-within`。
- RED run 要能分辨同時作用的狀態層（例如 `:active` 與 `:focus-within`），否則判定值會被混在一起；量按住狀態時加一次 blur 探針。
- 提示框、彈出層若掛在 `body` 下，用拖曳或開啟中的來源元素狀態反推方向。

### 第七、八批學到的做法

- **RED run 的環境要像使用者的環境。** Playwright 預設 `--hide-scrollbars`，捲軸欄位寬度為 0，#3 的藍條畫不出來，gallery baseline 也看不到。量與捲軸有關的版面時要 `ignoreDefaultArgs:['--hide-scrollbars']`；這類缺陷目前沒有測試守著。
- **改圖形時，順手檢查 forced-colors。** 用 `mask-image` 加 `background-color` 畫的圖示，在 forced-colors 下 background 會被強制成 Canvas 而消失；要補 `CanvasText`。第 7 批因此多跑一輪（`GATE7-FINAL` FAIL → R2 PASS）。
- **尺寸比外框，不比 ink 面積。** 實心三角與空心 chevron 的面積不可比；判定改用 ink 外框的寬與高各 ±25%。圖示左緣受字形側邊距影響，對齊判定改量 ink 中心。
- **「預留空間」不是缺陷。** #49 的空白是為了避免勾選時文字位移而刻意預留；先量「切換前後位移」，再決定要不要當缺陷處理。婉拒設計師的回報要使用者同意（D54-A）。
- **巢狀結構本身就能判定層級。** #51 看板原本寫「需要 ZK 的深度 class」，實際用 `.z-nav > ul > .z-nav > ul` 的祖先選擇器即可，不必改 widget（延續第六批「先查祖先或兄弟」的教訓）。被搬到 `body` 的 popup 拿不到原本的 reset，要注意瀏覽器預設的 `list-style` 與 `padding`。
- **實作者與量測者共用預覽站時，build 要排隊。** Generator 只改原始碼、不 build；等 Verifier 量完再 build 並重啟，否則量測中途換版。

### 第十一批學到的做法

- **先查 ZK 為某個屬性值加了哪些 class，再判斷選擇器。** #54 的 `border="rounded"` 被判成 noborder 但不是 noframe；用 `.z-panel-noborder:not(.z-panel-noframe)` 就能只選到 rounded，不碰 `border="none"`。看板上「CSS 其實有設 border」的線索是對的，是被後面的規則蓋掉。
- **demo 的不一致不等於 theme 缺陷。** #57 的 West／East／Center 有 padding，是預覽頁自己包了 `z-p-4`；borderlayout 的區域本來就沒有 padding，加到 theme 會把貼邊的 toolbar 推離邊緣。歸 DEMO（R5），留言說明並提供「要不要改 theme」的選項。
- **改 demo 的尺寸要把 header 算進去。** 區域高度 = size 扣掉 40px 的標題列；填入 52px 的內容時，BL1 的 35% 讓中間區只剩 50px 而出現捲軸。兩邊的內容高度都要驗。只改有裸文字且四區原本一致的例子時，不要只改 N/S，否則反而讓它們與 E/W 不一致。
- **還原邊框會讓內容撐高的盒子多 2px。** 保護項要寫成「固定高度 ±0；auto 高度 +2px」，並說明這是修好 issue 的結果。
- **遮罩圖示的位置要以量到的右緣距為準，不要照抄別的元件的 margin。** 容器內距不同，同樣的遮罩盒需要不同的 `margin-right`。
- **回歸跑法排除 `forced-colors-gallery` 專案。** 它不比對，直接覆寫 repo 內的 `*-forced-colors.png`。
- **`gallery` 專案的 1% 容差對淡色底變動不敏感**（borderlayout 差 9% 像素仍通過）。baseline 預期變動不會以失敗呈現，要另用像素量；該元件的 gallery 在通過但像素有變時用 `--update-snapshots=all`（只針對該元件）。
- **8085 的 jar 可能在執行中被重建**（頁面回 500、`NoClassDefFoundError`）。重啟後等 jar 的 mtime 穩定、四個頁面回 200 再交給 Verifier；Verifier 遇到 500 停下回報，不重啟。
- **拖曳 ghost 是 ZK 建立的外框，不含視窗內容。** 「內容變透明」有兩層：標題列被 opacity 淡化（最小解讀）與內部透出背景（D57-B）。要讓 ghost 顯示真實內容需改 widget，不是 theme。

### 第十二批學到的做法

- **剩餘清單以追蹤 repo 重算，不信看板。** 以 `# Root cause` 留言為準，看板的「剩餘 21 = P1 17 + DECIDE 4」早已過期（P1 實際為 0）；開工第一步先重算並用議題頁給使用者選方向。
- **DECIDE 類先查 widget 與預設值再列選項。** #30 #68 #69 都落在 `Errorbox.ts`（`bind_` 的 `zk.Draggable`、`_defaultPos = 'end_before'`），CSS 做不到；把事實與「11.0 工程量」並列，使用者才能一句話裁示。
- **Contract 規格要退掉時先問。** #10 的 contract 明寫「MD3 spec-sheet switch must NOT be used」；改成 MD3 等於退掉一整條規格（例外 4），議題頁要附現況與設計師期望的圖（圖要內嵌成 data URI，artifact 擋外部圖片）。
- **RED 發現方法本身互斥時，Planner 看到結果後裁定並揭露。** #10 的「關閉態滑塊 = `outline`」與「滑塊對軌道 ≥ 3:1」在 Marble 的淡色 outline token 下只有 1.41:1；裁定改用 `on-surface-variant`，並在留言與看板寫明偏離 MD3 的這一項（R7、R10）。
- **半透明 token 的 ΔE 要先疊在實際背景再比。** `outline`、`on-surface` 是 `rgba`，直接比 rgb 分量會得到假值；背景要取取樣位置下方的實際色（邊框下方是軌道填色）。
- **有邊框的絕對定位子元素相對 padding box。** 52×32 軌道加 2px 邊框後 padding box 是 48×28，滑塊的 `left` 要以此推算（關 6px、開 `calc(100% - 26px)`）。
- **Verifier 的報告檔被 hook 擋下時，由 Planner 依其回報寫入**，數字不改，並在檔案首段註明。
- **提交者身分不能區分 session。** 所有 session 都用同一個 git 身分，`git log` 只能指出「是這個帳號」；要歸因失敗到某個提交，用提交內容與檔案日期，不用作者。
- **對文件做批次文字替換前先看 diff 範圍。** 為改一列計數而用的 `sed` 誤改了批次 7 那一列，靠 `git diff -U0` 才發現並還原。

### 第九、十批（B 線）學到的做法

- **判定量渲染後的像素，不要只量 computed 值。** #61 的 20 顆圖示 computed 顏色全相同，但 Fullscreen 的填色與描邊重疊，半透明色疊了兩層，最深像素差 ΔE 26。解法是不透明色加 svg 層級的 `opacity` 一次合成。
- **改共用子元件的樣式，回歸要涵蓋所有用到它的頁面。** #40 改 radio 文字，`tree`、`grid-paging` 頁內嵌的 radio 也變了，到合併後的完整回歸才發現。只用元件名稱做 `-g` 過濾會漏；合併前至少跑完整的 chromium 與 gallery。
- **gallery 的 1% 容差會吸收預期的視覺變化。** baseline 要主動針對元件用 `--update-snapshots=all` 重生，並逐張看差異遮罩；重生會連同舊漂移（例如 typography sweep 之前的標題位置）一併更新，要在紀錄中揭露。
- **公開 token 的語意要留著。** 要改預設外觀時，保留旋鈕、只改預設值（D84-A），並用「注入該 token 後仍生效」當保護項；只改規則會讓文件記載的旋鈕默默失效。
- **widget 的根因要先用 inline 狀態證明。** #1 看似樣式問題，實際是 `style.top = undefined` 對 `CSSStyleDeclaration` 是無動作；開 ZK Jira 前先在預覽頁重現，並實測 Workaround，再寫進 Jira。
- **兩條線可能改到同一個檔案，合併前先查交集。** `git diff --name-only A...B` 取交集加 `git merge-tree --write-tree` 試算；重疊時停下問（D85-A）。這次 `button.css`（使用者的提交）與 `window.css`（A 線批次 11）都重疊過。
- **jar 與預覽站的流程。** worktree 第一次要先打包 jar；打任何 jar 之前先停預覽站；`zkpreview/gradlew` 在 git 裡不可執行，用 `bash ./gradlew`。
- **方法歧義由 Planner 裁定，並說明是看到結果之後裁的。** P71-d（框位置）與 tbeditor 的 hover 都這樣處理，理由與可能的反面讀法都寫進計畫。
- **GitHub API 檢查檔案是否存在，要看 HTTP 狀態碼。** `gh api … --jq .sha` 在 404 時輸出 `null`，不是空字串，會讓「已存在」的判斷全部誤判。

### 第十四批（C 線）學到的做法

- **看板上的數字要回到原始碼重算。** 看板的「toast 圖示 3.13:1」用 token 算是 3.68:1；「`.z-panel-move-ghost` 是死規則」其實被 zkcml 的 `Portallayout.ts` 用到；「`checkbox.css:580` 孤立的 `}`」是在關 `@layer`。逐項核對撤掉了 8 個候選。
- **公開旋鈕的預設值，不要靠規則內混色調整。** 在規則裡 `color-mix` 會讓使用者設的色不再原樣顯示，旋鈕契約（含測試）就破了；改預設值才保留契約（D84-A、D116-A）。
- **minifier 會合併 selector list。** 為了隔離「不支援的 selector」而另寫的獨立規則，served CSS 裡可能被併回同一個 list；要隔離得分在不同的區塊，驗收看 served CSS，不看原始碼。
- **gallery 的 1% 容差累積了 48 頁的過期。** 根因是 `47d26068ed` 把預覽頁的字型 utility 從外層 div 搬到 label，baseline 之後沒重切。收緊容差之前先分類：元件 crop 平移後相同 = HEADING-ONLY，可以整批重切；其餘逐頁歸因。收緊後 82/82 連跑兩次全過。
- **「非決定性」要先在乾淨環境重現。** Verifier 回報 barcode 連擷兩次差 321px，用預設 Desktop Chrome context 連擷四次雜湊完全相同；progressmeter 才是真的不穩（widget JS 逐步更新 inline width，`transition-duration:0` 擋不住），解法是等 fill 寬度等於 `aria-valuenow`。
- **新測試要證明不會空轉。** S3、S4 都用「注入壞狀態後必須失敗」驗證；S4 的 selector 錯了一次（`label` 應為 `.z-label`），是這個驗證抓到的。
- **mutation 驗證的探針可以用 `!important`，正式測試不行。**

## 八、尚未驗證的事

- tracker repo 內截圖連結對設計師是否可見（取決於她是否為 `hawkchen/marble-issue` 協作者）。
- 本原則第一次套用在第 6 批；若流程有需要調整，改本文件並在第七節記錄。
