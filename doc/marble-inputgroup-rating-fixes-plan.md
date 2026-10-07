# Marble:inputgroup 後綴接縫、數字輸入框,以及 rating iconSclass 計畫

來源:zkdemo-c7(zkdemo P4 batch 2,D83)在 marble 11.0.0.FL.20261007 回報的兩個問題。
狀態:**已實作並驗證(2026-10-07)**。D-A 決議選 A(只改顏色),D-B 決議選 A(掛 ZK-6112、各自一個 commit)。本文件中的 D 編號只在本文件內有效(D-A、D-B)。

實作時另發現一處:`_forced-colors.css` 的 `.z-rating-icon { background-color: CanvasText }` 會讓自訂 icon 在 forced-colors 下變成黑色方塊,已縮限為 `.z-rating-icon.z-icon-star`。

## 一、問題 1:inputgroup 只有前綴(leading)合併邊框

檔案:`zul/src/main/resources/web/js/zul/wgt/css/inputgroup.css`

### 現況(已讀程式確認)
* 水平模式只有「addon 在 input 前面」的規則(第 63–69 行):`.z-inputgroup-text + .z-inputgroup-text`、`+ .z-textbox`、`+ .z-combobox`、`+ .z-combobox .z-combobox-input`,都是 `border-left: none`。
* 後綴(input 在前、addon 在後)沒有規則,所以 input 的 `border-right`(1px)加 addon 的 `border-left`(1px)形成 2px 接縫。
* 垂直模式(第 146–151 行)已經雙向處理(`.z-textbox + .z-inputgroup-text`、`.z-combobox + .z-inputgroup-text`),水平模式漏掉了。
* `.z-intbox`、`.z-decimalbox`、`.z-doublebox`、`.z-longbox` 完全沒有出現在這個檔案裡:沒有 border、flex、min-height 規則,也沒有合併規則和 focus 規則。

### 建議作法
1. 水平模式補 `.z-textbox + .z-inputgroup-text`、`.z-combobox + .z-inputgroup-text` 的 `border-left: none`(與垂直模式一致)。
2. 把 4 個數字輸入框加入「Input inside inputgroup」選擇器群組、`+` 合併規則,以及 focus 規則,讓外觀等同 textbox。
3. 驗證:Playwright 新增一個 inputgroup gallery 案例(前綴、後綴、前後都有、數字框),量測相鄰邊框總寬為 1px。

### 未確認事項
* Inputgroup 渲染 Label 子元件時是否一定帶 `z-inputgroup-text`(對方寫「or however Inputgroup renders a Label child」)。實作前要先在 8085 預覽頁量 DOM。
* spinner、doublespinner、datebox、timebox 在 inputgroup 內的外觀不在這次回報範圍,先不動,只記錄。

## 二、問題 2:rating 的 iconSclass 無效

檔案:`zul/src/main/resources/web/js/zul/wgt/css/rating.css`

### 現況(已讀程式確認)
* Widget 預設 `_iconSclass = 'z-icon-star'`(`Rating.ts` 第 32 行),icon 元素會帶這個 class。
* Marble 對所有 `.z-rating-icon` 無條件做兩件事:
  * `::before { content: none }`(關掉 icon font 字形)
  * 用固定的星形 SVG 做 `mask-image`(未選取是空心,`selected`/`hover` 換成實心)
* 所以 `iconSclass="z-icon-heart"` 的字形被關掉,畫出來仍然是星形。

### 建議作法
* 星形 mask 只套用在預設 icon:選擇器改成 `.z-rating-icon.z-icon-star`(含 selected/hover 的實心版本)。
* 非預設 iconSclass:不套 mask、不關 `::before`,由 icon font 畫出字形,顏色沿用 `--zk-rating-fg` / `--zk-rating-accent`。
* 非預設 icon 在 `selected`/`hover` 時只改顏色與 hover 縮放,不換字形(icon font 沒有統一的「實心/空心」成對命名)。

### 風險
* 若有人明確設 `iconSclass="z-icon-star"`,行為與預設相同,沒有影響。
* 非預設 icon 的未選取狀態和選取狀態只靠顏色區分,對比需要檢查(WCAG 非文字對比 3:1)。

## 三、待決策

### 議題 D-A:非預設 iconSclass 的選取狀態呈現
* **【選項 A】只改顏色(建議):** 實作最小,與 ZK 既有 rating 的做法一致 ｜ 代價:未選取與選取靠顏色區分,要確認對比
* **【選項 B】要求使用者提供空心/實心成對 class:** 需要新增 API(例如另一個屬性) ｜ 代價:公開 API 變更,需評估 zkcml 與 zul.xsd

### 議題 D-B:要不要一起發版
* 建議兩個問題各自一個 commit,同一個 ZK-6112 範圍;若是新的 bug,是否另開 Jira 需要你決定(目前 cols 問題是修正掛 ZK-6112、預設值問題另開 ZK-6178)。

## 四、步驟(待你確認後執行)
1. 在 8085 預覽頁量 inputgroup 的 DOM 與接縫寬度、rating 自訂 icon 的現況 → verify:能重現對方回報的數字
2. 先寫 Playwright 失敗案例 → verify:修之前紅燈
3. 修 `inputgroup.css`、`rating.css` → verify:案例轉綠,其餘 gallery 無非預期 diff
4. 更新對應的 `doc/contracts/*.md`,重新產生受影響的基準截圖 → verify:全部通過
5. 明確路徑 stage、commit(ZK-6112)→ verify:`git diff --cached --name-only` 只含本次檔案
6. 回覆 zkdemo-c7 版本號(發版後)
