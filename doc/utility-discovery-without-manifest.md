# 不產生 manifest 的 utility class 查找方式評估

**要回答的問題：** 如果讓 `zul-writer` skill 和 ZK plugin 直接讀 `zul.jar` 裡附帶的 CSS 原始碼來取得
Marble 的完整 utility class 清單，build 是否就不必再產生 `utility-classes.json`？

**背景：** 這是 [utility-class-discovery.md](utility-class-discovery.md) Phase 1 的替代方案評估。
本文的決策編號只在本文內有效。

**狀態：** 2026-10-02 評估完成。**D1 已決：選項 A**。manifest 是清單，原始碼 CSS 提供細節（見 §4）。

---

## 1. 摘要

**前提條件已經成立，不需要額外成本。** `zul.jar` 已經包含未壓縮的 utility 原始碼，因為
`src/main/resources/web/**` 會原樣打包進 jar。已用 `zul/build/libs/zul-11.0.0-SNAPSHOT.jar` 驗證，
其中有 `web/zul/css/utility/_*.css`（10 個檔案）、`web/zul/css/tokens/_*.css`，以及 62 個元件的
`web/js/zul/**/*.css` 原始碼。所以附帶原始碼不需要任何打包工作。不過這件事目前只是預設打包規則的
副作用，採用本文的建議後就成為正式承諾。

**替代方案做得到，但難的部分並沒有消失，只是被複製到每個使用端。** 不論採用哪個方案，每個使用端
都必須知道 jar 裡的某個路徑，所以「agent 怎麼找到清單」這個問題（上層文件的 D6）不會改變。改變的是
那個路徑上放的東西。現在放的是一份由單一 generator 負責、帶版本號的 JSON schema。替代方案下放的則是
原始 CSS，每個使用端都得自己重新實作篩選規則。而這套規則在 generator 裡是靠兩個互相對照的
extractor，再加上一次缺陷修正，才做對的。

## 2. 每個使用端必須自己知道的規則

這些規則目前寫在 generator 裡（上層文件 §5.1、§5.12）。改用替代方案後，plugin 和 skill 都要各自掌握：

| # | 規則 | 天真的讀法為什麼會出錯 |
|---|---|---|
| R1 | 包在 `@media` / `@container` 裡的 class 也可以寫在 `sclass` | 用 `grep '^\.z-'` 只找得到當時 425 個中的 380 個，所有 responsive 變體都會漏掉 |
| R2 | 只有當 selector 的第一段剛好是單一 class 時才算數 | 少了這條規則，不是漏掉 `z-clearfix` / `z-vstack*`，就是從 `.z-grid.z-sticky-header …` 誤收 `z-grid` |
| R3 | 掃描前要先去掉註解 | `_stack.css` 在註解文字裡寫了 `<div sclass="z-vstack">` |
| R4 | 要扣掉元件 CSS 自己擁有的 class 名稱 | `_print.css` 會重設 14 個元件 class（`z-window`、`z-modal-mask` 等） |
| R5 | 若某個 class 的所有規則都在 `@media print` 裡，只有名稱是 `z-d-print-*` 的才算 utility | 只看得到 CE 時，R4 無法扣掉 `z-drawer` 這類 EE class |
| R6 | 哪些檔案屬於 utility 集合 | 目前 `utility/` 目錄剛好等於 `normFiles`，但 `normFiles` 寫在 `scripts/build-css.js`，**不在 jar 裡**。使用端只能列出整個目錄，並假設兩者一直一致 |

除了規則之外，清單本身也還在變。目前有 **492** 個 class，而上層文件記錄的是 425 個。差距來自 commit
`03a5c2ad62` 新增的 P1 utilities。

## 3. 比較

| 面向 | 產生 manifest（現行） | 使用端讀原始碼 CSS |
|---|---|---|
| R1–R6 的實作份數 | 1 份（build 時執行，Node + Lightning CSS） | 2 份以上：plugin（在 JVM 上解析 CSS）、skill（寫成給 LLM 看的文字規則，或附帶一支 script），將來每多一個使用端就多一份 |
| 對外承諾的介面 | 帶 `schemaVersion` 的 JSON | 檔名、目錄結構，以及 CSS 的撰寫慣例 |
| 重整 CSS 時的影響 | 只要 schema 不變，使用端不受影響 | 可能讓使用端壞掉。本週的 commit（`9a24c49fd6` 把 `z-paper` 移到別的檔案、`512707cde3` 搬動 layer order）就是使用端得承受的那類變動 |
| 修正規則後多快生效（以 §5.12 的 `z-drawer` 缺陷為例） | 下一版 jar 發出後，所有使用者都生效 | plugin 和 skill 都要發新版；還在用舊版 plugin 的人會一直拿到錯的清單 |
| 新舊版本混用（舊 plugin 配新 ZK，或反過來） | plugin 讀 `schemaVersion` 判斷 | plugin 得相容過去和未來所有的 CSS 結構 |
| agent 的 token 成本 | 只讀名稱：約 5 KB（約 1.5k tokens）；完整 manifest：46 KB | 每次都要讀約 47 KB 的原始 CSS（約 12–13k tokens），還要自己套用 R4/R5 |
| build 與 repo 成本 | `scripts/utility-manifest.js` 加上 `build-css.js` 的第 1d 步，已寫好並驗證 | 無 |
| 資訊完整度 | 名稱、分類、宣告內容。原始碼註解不收錄（上層文件 D3：不加 description 欄位） | 完整。agent 還看得到作者寫的註解，知道每個 class 的用意 |

替代方案只在兩項上比較好：build 成本，以及能讀到註解。build 成本已經付出去了。讀註解這一點，
manifest 方案也做得到，因為不論哪個方案，原始碼都在 jar 裡。

### LLM 讀原始碼其實比看起來可行

LLM 讀原始 CSS 時，R1–R3 自然就能處理，因為它看得懂巢狀結構，也會忽略註解文字。skill 真正的風險在
R4 和 R5。沒有明確指示的話，agent 會把 `z-window` 或 `z-drawer` 當成 utility 推薦出去。加了指示，
skill 裡就多了一份用文字描述的 generator 邏輯，而且沒有任何測試。plugin 沒有這種捷徑，一定要寫真正的
解析程式。

## 4. 建議做法（D1 已採用）

**清單以 manifest 為準，原始碼 CSS 是早已一起出貨的補充資料。** skill 的指示改成以下三步：

1. 從 resolve 到的 `zul.jar` 讀取 `web/zul/css/utility-classes.json`，取得 class 名稱。
2. 某個 class 的用途不清楚時，去讀它的原始碼檔案。manifest 的 `sources` 欄位寫了檔名，
   檔案裡的註解說明了用法。
3. 只有在 jar 比 manifest 還舊時，才退回直接讀 `web/zul/css/utility/*.css`，並自行套用 R4/R5。

這樣 R1–R6 只有一份實作，又能利用隨 jar 出貨的原始碼，補上 manifest 刻意不收的資訊。文字版規則只出現在
退回路徑上，而這條路徑隨著每次發版會越來越少用到。

## 5. 決策

### D1 — 清單以 manifest 為準，還是以原始碼 CSS 為準？ **（已決：選項 A，2026-10-02）**

- **A. 清單用 manifest，細節看原始碼（已採用）。** 做法見 §4。代價：不需要新增實作，但 jar 裡附帶
  原始碼 CSS 從此是正式承諾。
- **B. 只用原始碼，不產生 manifest。** 刪除第 1d 步和 `utility-manifest.js`。代價：R1–R6 要在 plugin 和
  skill 各實作一次，CSS 檔案結構變成公開介面，每次修正規則都要兩邊一起發版。
- **C. 只用 manifest，jar 不再附原始碼。** 把 `_*.css` partial 排除在 jar 外以節省空間。代價：使用端讀不到
  註解。本文沒有提議這麼做；列出來是因為採用 A 之後，這個決定會破壞 A 的第 2 步，要避免日後有人
  在不知情的情況下這麼做。

**採用 A 之後的承諾：** `web/zul/css/utility/_*.css` 必須繼續以未壓縮、保留註解的形式打包進 `zul.jar`。
將來任何縮小 jar 或移除原始碼 partial 的變更，都要先回頭檢查本決策。

## 6. 證據

| 主張 | 驗證方式 |
|---|---|
| 原始碼已在 jar 裡 | `unzip -l zul/build/libs/zul-11.0.0-SNAPSHOT.jar` 列出 `web/zul/css/utility/_*.css`、`tokens/_*.css`，以及 62 個 `web/js/zul/**/*.css` |
| 共 492 個 class | 用 `node -e` 讀取 `zul/codegen/resources/web/zul/css/utility-classes.json` 計數 |
| 原始 utility CSS 約 47 KB | `cat zul/src/main/resources/web/zul/css/utility/*.css \| wc -c` = 46 983 |
| 目前目錄內容與 `normFiles` 一致 | `utility/` 有 10 個檔案，`normFiles` 裡也是同樣 10 個 |
| 沒有任何把原始碼移出 jar 的計畫 | 在 `doc/` 下 `grep`，查無結果 |
