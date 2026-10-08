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

## 八、尚未驗證的事

- tracker repo 內截圖連結對設計師是否可見（取決於她是否為 `hawkchen/marble-issue` 協作者）。
- 本原則第一次套用在第 6 批；若流程有需要調整，改本文件並在第七節記錄。
