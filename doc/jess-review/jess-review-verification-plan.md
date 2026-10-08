# Jess design review — 驗證計畫

依 [jess-review-triage.md](jess-review-triage.md) 的修正流程（2026-10-05 修訂）：**一批一批來**。
某一批動工前，該批每個 issue 的驗證方法都要先在這裡寫好、經使用者核准。
修完之後，只拿事先核准的方法來判定，不可以為了配合修法回頭改方法。

角色分工：
- **Planner**（主 session）負責寫這份計畫和 Generator brief。
- **Generator**（Sonnet）只負責實作和 build。
- **Verifier**（Opus，全新 context）只拿到 issue 和本文件中對應的那一段，看不到 diff，也不能改任何檔案。

## 所有方法共用的規則

- **環境：** zkpreview 跑在 8085（`cd zkpreview && ./gradlew appRun -PhttpPort=8085`），`PREVIEW_URL=http://127.0.0.1:8085`。
  量測使用 Playwright Chromium，viewport 1280×900，量之前先注入 `*{transition:none!important;animation:none!important}`。
  腳本從 `zkpreview/` 執行，`@playwright/test` 就裝在那裡。
- **RED 先行：** 開始修之前，Verifier 先在**現在的程式碼**上跑一次，每個「判定檢查」都必須**失敗**。
  如果其中某項已經通過，就代表方法量錯了東西，要退回 Planner 重寫，不可以進入實作。
- **游標的量法：** Playwright 讀不到作業系統的游標，所以一律用這個代理量測：
  滑鼠所在點的 `document.elementFromPoint(x, y)`，取它的 `getComputedStyle(el).cursor`
  （`cursor` 會繼承，所以最上層元素的計算值就是使用者看到的游標）。
- **PASS 的條件：** 判定檢查全部通過，「也必須成立」各項全部成立，「回歸範圍」裡只有預期會變的 baseline 有變。
  有任何一項不符就是 FAIL，並附上量到的值。

---

## 第一批：quick wins（#41 #43 #52 #65 #67）

**RED run（2026-10-06，Opus Verifier）：** 4 個 issue 的判定檢查今天都失敗，符合要求。原始腳本和輸出在 [gates/batch1-red/](gates/batch1-red/)。
它找出的方法缺陷已在下面各段修正，並標註「RED run 發現」；修正都發生在動工之前。

狀態：**已核准**（2026-10-05，對話中 D9-A）。2026-10-06 裁示：#41/#43 的焦點標示照 D5-A；#52 照 D6-B；#65 照 D7-A；#67 照 D8-A。
#41 的選取底色經查證 MD3 後另列議題（D10，見 #41 段），未決前不檢查底色。
各選項的實際畫面對照：claude.ai artifact「Jess 第一批修正選項」（https://claude.ai/artifact/9XUTwnGATeSykquea2iZ8Z，私人頁面）。

### #41 + #43 — 清單列的焦點標示（listbox 左側藍條、tree 外框）

- **元件 / 分類：** listbox、tree · P1 · THEME。兩個 issue 同一個根因，見 [jess-review-issue-41-43-proposal.md](jess-review-issue-41-43-proposal.md)。
- **她回報的問題：**
  - #41：被選取的 listbox 列左側出現 3px 藍條。
  - #43：用滑鼠點 tree 節點，整列出現 2px 藍框。
  - 她要的是：滑鼠點擊時不出現；只有鍵盤操作時才出現。
- **原始碼位置：** `zul/.../sel/css/listbox.css:267-270`（第一格的 `box-shadow: inset 3px 0 0`）、`zul/.../sel/css/tree.css:168-171`。
- **修好的樣子：** 滑鼠點選列之後，沒有任何列出現焦點標示；用鍵盤移動時，正好一列出現焦點標示，而且 listbox 和 tree 的形狀相同。
- **頁面與目標：**
  - listbox：`${PREVIEW_URL}/listbox.zul` 第一個 listbox（`listbox.zul:12`），列 `.z-listitem`。
  - tree：`${PREVIEW_URL}/tree.zul` 第一個 tree，列 `.z-treerow`。
- **焦點標示的定義：** 一列「有焦點標示」，是指該列或它的任何一格滿足下列任一條件：
  `outline-style != none` 且 `outline-width >= 2px`；或 `box-shadow` 不是 `none`。
  這樣定義不會限定修法，左側條、外框、內框都算。
- **步驟與判定檢查：**
  1. 用滑鼠點第二列。判定：有焦點標示的列數 **== 0**。
  2. 按 `ArrowDown`。**保護項**（今天就會通過）：有焦點標示的列數 **== 1**，而且就是目前帶 `-focus` class 的那一列。
  3. 再用滑鼠點另一列。判定：有焦點標示的列數 **== 0**。這一步驗證狀態會跟著輸入方式切換回來。
  4. listbox 和 tree 在步驟 2 的那一列，取**實際承載焦點標示的那個元素**（列 `tr` 或某一格，先量列，列沒有就量第一格），比較 `outline-style`、`outline-width`、`outline-offset`、`box-shadow` 四個值，**完全相同**。
     （`outline-style: none` 時 Chromium 仍會回報非零的 `outline-width`，所以 style 為 none 時不比較 width。）
- **今天的 RED：** 步驟 1 和 3 會得到 1（listbox 是 `box-shadow`，tree 是 outline）；步驟 4 不相同。
- **也必須成立：**
  - 從頁面上一個元素按 `Tab` 進入元件之後，listbox 按 `ArrowDown`、**tree 按 `ArrowUp`**，焦點標示仍然出現。這是在確認鍵盤使用者的焦點標示沒有被刪掉。
    （tree 的第一個 tree，選取列是最後一列，按 `ArrowDown` 沒有地方可以移動，跟 CSS 無關。2026-10-06 RED run 發現後修正。）
  - `Tab` 移出元件之後，有焦點標示的列數 == 0。
  - **選取底色（D10 決定後才定稿）：** MD3 token 規定清單選取底色是 `secondary-container`（`md.comp.list.list-item.selected.container.color`，material-web tokens v34），文字是 `on-secondary-container`。
    D10 決定改的話，判定改為被選取列的 `background-color` 等於 `--zk-color-secondary-container` 的計算值；決定不改，就維持 `--zk-color-primary-container`。
  - 在 `forcedColors: 'active'` 下重做步驟 2：那一列 `outline-style != none`。
- **回歸範圍：** `focus-scan`（焦點標示改成 outline 之後，`zkpreview/doc/focus-ring-known-clips.json` 可能要重新產生）、`forced-colors`、`component-theming`、`chromium` 截圖。預期會變的只有 listbox、tree 的焦點狀態截圖，以及它們的 tablet 版本。
- **裁示：** 焦點標示照 D5-A（2026-10-06）。選取底色待 D10。
- **MD3 查證（2026-10-06）：** Jess 的兩點都成立。MD3 清單項的選取狀態只有 container 底色和形狀，沒有 border 或側邊條的 token；選取底色是 `secondary-container`。
  另外，MD3 的焦點標示是 `secondary` 色、3px、向內偏移 -3px（`md-sys-state-focus-indicator`）；我們的 `--zk-focus-ring` 是 primary、2px。這不在本批範圍，只記錄下來。

### #52 — tabbox 選取指示線太細

- **元件 / 分類：** tabbox · P1 · THEME。
- **她回報的問題：** 選取中的 tab，底線太細。她附的 MD3 參考圖是一條**較粗、上方兩角圓、寬度跟文字一樣**的指示線，而不是整個 tab 寬的直線。
- **原始碼位置：** `zul/.../tab/css/tabbox.css:94`（`border-bottom: 2px`）、`:124`（選取時的顏色）。
  其他方向：bottom 在 `:369/:375`、left/right 在 `:402/:410`、`:449/:456`。
- **修好的樣子：** 依 D6 而定。
  - **D6-A（只改粗細）：** 指示線粗 3px。
  - **D6-B（完整 MD3 primary tab）：** 粗 3px、上方兩角圓角 3px、寬度等於文字寬度（至少 24px）、水平置中在文字下方。
- **頁面與目標：** `${PREVIEW_URL}/tabbox.zul` 的第一個 tabbox（`tabbox.zul:12`），選取中的 `.z-tab.z-tab-selected`。
  方向測試另外用 `orient="bottom"`（`:197`）、`orient="vertical"`（`:89`）、`orient="right"`（`:143`）各一個。
- **量法：** 只看像素，不讀 CSS 屬性，這樣不會限定修法要用 border 還是 pseudo-element。
  對 `.z-tab-selected` 的 bounding box 截圖（往外多取 4px），找出顏色等於 `--zk-tab-accent` 計算值（容差 ΔE ≤ 3）的像素。
  - **粗細：** 文字中心那一欄，連續符合顏色的像素列數。
  - **寬度：** ~~指示線中間那一列，符合顏色的連續像素寬度~~ → **指示線最外側（離文字最遠）那一列**，兩端的半透明像素依 accent 覆蓋比例計入（不再只數 ΔE ≤ 3 的像素），跟 `.z-tab-text` 的 `getBoundingClientRect().width` 比較。
    **2026-10-06 修正（使用者裁示 D13-A，在看到第二輪結果之後修改）：** 原本的量法跟同一份方法要求的 MD3 形狀互相矛盾：3px 高、3px 圓角時，中間那一列本來就比較窄；而嚴格計數又會因為兩端反鋸齒，每端少算約 1px。最小值 24px 也照同樣方式計算，容差 ±0.5px。
  - **掃描範圍：** 選取 tab 的文字和 closable 關閉圖示也是 accent 色，所以要排除 `.z-tab-text` 和 `.z-tab-button` 的 bounding box，只掃文字框外、靠近 tab 外緣（指示線所在那一邊）的區域。
    上下方向掃「文字中心那一欄」，左右方向改掃「文字中心那一列」。色差用 CIE76 ΔE。
- **判定檢查：**
  - D6-A：粗細 **== 3px**（±0）。
  - D6-B（以下三項都要成立）：粗細 **== 3px**；寬度 **== 文字寬度 ±2px，而且 ≥ 24px**；指示線最上面那一列（靠內側那一列）的兩端像素不符合顏色，代表有圓角。
  - D6-B 的**保護項**（今天就會通過）：指示線的中心和文字中心相差 ≤ 1px；最外側那一列的兩端像素符合顏色。
- **今天的 RED：** 像素量到的粗細是 **1px**（CSS 寫 2px，但 `margin-bottom: -1px` 讓 tabs 的分隔線蓋住了一列）；寬度 = 整個 tab 寬（約 91px，文字 58.6px）；沒有圓角。
- **也必須成立：**
  - 其他三個方向（bottom / vertical / right）的指示線有同樣的粗細（D6-B 時形狀也相同，方向跟著旋轉）。
  - 未選取的 tab 沒有指示線。
  - tab 文字的垂直位置不能因為指示線變粗而移動，誤差 ≤ 0.5px（對照 RED run 的基準：text top 相對 tab top = 13.5px）。
  - `forcedColors: 'active'` 下，**選取的 tab 要有一條未選取 tab 沒有的指示線**：在選取 tab 和相鄰未選取 tab 的同一個位置（文字中心那一欄、靠外緣 6px 內），非背景色像素的列數必須不同。
    今天在 forced colors 下每個 tab 都有一樣的黑色底線，分不出選取（RED）。如果改用 `background` 畫指示線，這個模式下會消失，要另外處理。
  - accordion mold 不受影響（對照 RED run 的基準截圖 `gates/batch1-red/i52/accordion-*.png`）。
- **回歸範圍：** `component-theming`（`--zk-tab-accent` 這個 knob 仍然要能控制指示線的顏色）、`forced-colors`、`chromium` 截圖（tabbox 全部方向的 baseline 都預期會變）、`tablet`。
- **裁示：** D6-B，完整採用 MD3 的指示線（2026-10-06）。

### #65 — splitlayout 在 splitter 按鈕上和拖動中，游標要維持 resize 形狀

- **元件 / 分類：** splitlayout（EE，`../zkcml/zkmax`）· P1 · THEME（拖動中那一半可能是 ZK-CORE，見「待決」）。
- **她回報的問題：**
  - 滑鼠移到 splitter 中間的小按鈕上時，游標不是 resize 形狀，只有在 bar 上才是。
  - 拖動的時候，游標要一直維持 resize 形狀。
- **原始碼位置（修正看板的說法）：**
  - 看板說是 `:156` 的 `cursor: pointer` 蓋過了 resize 游標。這不對：頁面上前兩個 splitlayout 沒有設定 `collapse`，所以按鈕帶的是 `-disabled` class，真正生效的是 `splitlayout.css:205` 的 `cursor: default`。
  - 拖動中，滑鼠底下的元素是 ZK 加在 `body` 的 `#zk_ddghost.z-splitter-ghost`（`Splitlayout.ts:965-978`），而所有 ghost 規則（`box.css:226`、`borderlayout.css:436`）都沒有設定 cursor。
- **修好的樣子：**
  - 在可以拖動的 splitter 上，不論游標在 bar 或按鈕上，都顯示 `col-resize`（水平排列）或 `row-resize`（垂直排列）。
  - 拖動過程中，游標一直維持同樣的形狀。
- **頁面與目標：** `${PREVIEW_URL}/splitlayout.zul`：
  - 第一個 splitlayout（`orient="horizontal"`，`:10`）
  - 第二個（`orient="vertical"`，`:24`）
  - 第三個（`collapse="before"`，`:38`）
  - 目標元素：`.z-splitlayout-splitter`、`.z-splitlayout-splitter-button`。
- **步驟與判定檢查（游標的量法見共用規則）：**
  1. 滑鼠移到第一個 splitlayout 的按鈕中心。判定 **== `col-resize`**。
  2. 滑鼠移到第二個的按鈕中心。判定 **== `row-resize`**。
  3. 在第一個的 bar 上、按鈕以外的位置按下滑鼠，分 5 步往右移 40px，**還沒放開時**量一次。判定 **== `col-resize`**。然後放開。
  4. 第二個做同樣的事（往下移 40px）。判定 **== `row-resize`**。
- **今天的 RED：** 步驟 1、2 得到 `default`；步驟 3、4 得到 `auto`（ghost 沒有設定 cursor）。
- **也必須成立：**
  - bar 本身的游標不變（`col-resize` / `row-resize`）。
  - 拖動完成後，兩側面板的寬度（或高度）確實改變了 ≥ 30px。這是在確認拖動本身沒有被修法弄壞。
  - ~~不能拖動的 splitter（`-nosplitter`）仍然是 `default`。~~ 取消：zkpreview 沒有任何頁面有這種 splitter，無法量測（RED run 發現）。
  - 第三個（可收合）的按鈕維持 `pointer`，點一下會收合（D7-A）。
  - box 的 splitter 和 borderlayout 的 splitter 拖動時，游標同樣要正確，或者至少不比現在差（今天兩者拖動中都是 `auto`）。三者共用的只有 `z-splitter-ghost` 這個 class；borderlayout 的 ghost id 是 `#zk_layoutghost`，不是 `#zk_ddghost`。
- **回歸範圍：** `hit-target`、`chromium` 截圖。截圖預期不會變，因為截圖看不到游標。
- **裁示：** D7-A（2026-10-06）。
- **還要現場確認：** 拖動中的 ghost 只帶 `z-splitter-ghost` 一個 class，沒有方向資訊，CSS 可能分不出該用 `col-resize` 還是 `row-resize`。
    如果拖動期間 splitter 本身也沒有可以拿來判斷的 class 或狀態，步驟 3、4 就要改 widget 的 JS，這部分會變成 ZK-CORE，需要另外核准。
    這一點在 RED 階段由 Verifier 量出來：拖動中 `.z-splitlayout-splitter` 的 class 有沒有變化。
  - **RED run 結果（2026-10-06）：** 拖動中 splitter、root 的 class 和 attribute 完全不變；ghost 只有 `z-splitter-ghost` 一個 class，方向只寫在 inline 的 width/height。
    **純 CSS 分不出方向，步驟 3、4 必須改 `Splitlayout.ts` 的 ghost（ZK-CORE）**，待核准（對話中 D11）。步驟 1、2（按鈕游標）是純 CSS，可以先做。
  - **裁示（2026-10-06，D11-B）：** 步驟 3、4 不在這一批處理，改成另開 ZK Jira。依「所有 P1 元件 issue 做完才開 Jira」的規則，先記在看板的 BLOCKED 那一組，之後再一起開。

### #67 — 不能移動的 errorbox 不該顯示移動游標

- **元件 / 分類：** errorbox · P1 · **看板原本判為 THEME，我認為應改為 DEMO**（見下方）。
- **她回報的問題：** 在 errorbox 頁的「POINTER + ICON + CLOSE」範例上，游標是移動形狀（`move`），但這個框根本移不動。她要一般的游標。
- **原始碼位置：**
  - `zul/.../wgt/css/errorbox.css:52` 的 `cursor: move`。
  - **關鍵事實：** 真正的 errorbox 是可以拖動的。`Errorbox.ts:99` 在 `bind_` 時一律會建立 `zk.Draggable`；唯一不能拖的位置是關閉按鈕（`InputWidget.ts:1391`）。
  - 她看到的那個框是 `errorbox.zul:16` 用 `h:div class="z-errorbox"` 拼出來的**靜態樣本**。它背後沒有 widget，當然拖不動。
  - 所以 `cursor: move` 對真正的 errorbox 來說是正確的，只有展示用的樣本會誤導。
- **修好的樣子：** 游標的形狀要跟這個框實際能不能拖動一致：能拖動的顯示 `move`，不能拖動的不顯示 `move`。
- **頁面與目標：** `${PREVIEW_URL}/errorbox.zul`：
  - 靜態樣本：`errorbox.zul:16` 的 `.z-errorbox`。
  - 真正的 errorbox：在 `:32` 的 `textbox`（`constraint="no empty"`）裡點一下，再點頁面其他地方讓它失去焦點，就會出現一個 `.z-errorbox` popup。
- **步驟與判定檢查：**
  1. 滑鼠移到靜態樣本的內文中心。判定：游標 **!= `move`**。
  2. 照上面的方法產生真正的 errorbox（用 `zk.Widget.$(el).widgetName === 'errorbox'` 找；靜態樣本的 `h:div` 也有 id，不能用「有 id」來分辨），滑鼠移到它的內文中心。判定：游標 **== `move`**。
  3. 從內文中心按下滑鼠，拖 40px 後放開。判定：errorbox 的位置移動了 **≥ 30px**。
  4. 滑鼠移到關閉按鈕上。**保護項**（今天就是 `pointer`）：游標 **!= `move`**。
- **今天的 RED：** 步驟 1 得到 `move`，判定失敗。步驟 2、3 今天就會通過，這兩步是用來防止修法把真正的拖動弄壞。
  共用規則要求「判定檢查」在 RED 階段全部失敗；本 issue 只有步驟 1 是判定檢查，步驟 2、3、4 是保護項，在 RED 階段應該通過。
- **也必須成立：** `forced-colors` 下 errorbox 的外觀不變。
- **回歸範圍：** `chromium` 截圖（errorbox 頁）。預期不會有任何 baseline 變動。
- **裁示：** D8-A（2026-10-06）：當作展示頁的問題處理，只改 `errorbox.zul` 的靜態範例，佈景 CSS 不動，並回覆 Jess 說明真正的 errorbox 本來就可以拖。
  另外，`cursor: move` 實際上是設在 `.z-errorbox-content`，不是 `.z-errorbox`（2026-10-05 實測）。#68 以後如果改成不能拖，下面這段要跟著改：
  如果 #68 決定 errorbox 不能拖動，步驟 2、3 就要反過來寫：游標不是 `move`，而且拖了不會移動。

---

## 第二批：清單列選取色改成 MD3 的 secondary-container（#41 後半、#23）

狀態：**已核准**（2026-10-06，對話中 D18-A）。依據是使用者裁示 D10-A：7 個元件一起改。
**結果：PASS**（2026-10-06，第一輪），見 [gates/batch2.md](gates/batch2.md)。

### 修正範圍（給 Generator 的清單，不屬於驗證方法）

| 元件 | 選取色來源 | 位置 |
|---|---|---|
| listbox 列 | `--zk-listbox-selected-bg/-fg` 預設值 | `_component-theme.css:89-90` |
| listbox group 列 | 直接寫死 | `listbox.css:701-702` |
| listbox `mold="select"` | 直接寫死 | `listbox.css:~905` |
| tree 列 | `--zk-tree-selected-bg/-fg` | `_component-theme.css:100-101` |
| combobox 下拉項目 | `--zk-combobox-selected-bg/-fg` | `_component-theme.css:138-139` |
| menu | `--zk-menuitem-selected-bg`；文字色直接寫死 | `_component-theme.css:260`、`menu.css:373` |
| searchbox 下拉項目 | `--zk-searchbox-selected-bg/-fg` | `_component-theme.css:702-703` |
| chosenbox 鍵盤焦點的 chip | `--zk-chosenbox-item-focus-bg` | `_component-theme.css:244` |
| selectbox 原生選項 | 直接寫死 | `selectbox.css:174-179` |

規範文件也要一起改：`.claude/skills/zk-component-rules/reference/selected-state-families.md`、`doc/spec/component-theme-variables.md`、`doc/spec/DESIGN.md`，以及上面各元件的 `doc/contracts/*.md`。
**不在範圍內**（各自屬於別的選取色家族，維持現狀）：paging、navitem、organigram、calendar 的選取日。
公開 knob 的**名稱不變**，只改預設值。

### 判定檢查

- **修好的樣子：** 7 個元件的選取（或目前所在）項目，底色等於 `--zk-color-secondary-container` 的計算值，文字色等於 `--zk-color-on-secondary-container` 的計算值。依據是 MD3 token `md.comp.list.list-item.selected.container.color` / `label-text.color`（material-web tokens v34）。
- **量法：**
  - 先在頁面上建一個探針元素，讀 `background-color: var(--zk-color-secondary-container)` 和 `color: var(--zk-color-on-secondary-container)` 的計算值，當作期望值。
  - 再讀各目標元素的計算值，跟期望值做字串比對。
  - 如果某個目標元素的底色是透明的（顏色畫在子元素上），就往下找實際畫出底色的那個元素，並在報告裡寫明量的是哪個元素。
- **各元件的頁面和狀態：**

| # | 頁面 | 怎麼進入選取狀態 | 目標 |
|---|---|---|---|
| 1 | `listbox.zul` 第一個 listbox | 頁面本來就有選取列 | `.z-listitem-selected`，底色和格內文字色 |
| 2 | `listbox-grouping.zul` | 這個頁面的 `groupSelect` 是 false，ZK 不會產生這個狀態（`ItemWidget.ts:240`）。改成：用 JS 在第一個 `tr.z-listgroup` 加上 `z-listgroup-selected` 再量，只驗 CSS 規則本身。**只量底色**（RED run 發現） | `tr.z-listgroup.z-listgroup-selected` |
| 3 | `listbox.zul` 的 `mold="select"`（`:129`） | 載入時沒有選取任何選項。改成 `page.locator('select.z-select').selectOption({label:'Received'})`（RED run 發現） | `select.z-select option:checked` |
| 4 | `tree.zul` 第一個 tree | 頁面本來就有選取列 | `.z-treerow-selected` |
| 5 | `combobox.zul` 第一個 combobox | 打開下拉 → 點一個項目 → 再打開下拉 | `.z-comboitem-selected` |
| 6 | `menubar.zul` | RED run 確認：ZK 從來不會加上 `.z-menuitem-selected`（`Menuitem.ts` 只會加 `-hover/-focus/-checked/-checkable/-disabled`），這個 knob 沒有任何可以觸發的狀態。改量 knob 本身：在 `.z-menuitem` 內放一個探針，讀 `background-color: var(--zk-menuitem-selected-bg)` | 探針 |
| 7 | `searchbox.zul` | 方向鍵只會加上 `.z-searchbox-active`（那是另一種顏色）。改成：點第一個 `.z-searchbox` → ArrowDown 兩次 → Enter → 再點一次打開 → 把滑鼠移開（RED run 發現） | **只取看得見的下拉**：`.z-searchbox-popup:visible .z-searchbox-selected` |
| 8 | `chosenbox.zul` | 點第一個 `.z-chosenbox` 的 `input` → Escape → Backspace（最後一個 chip 會取得焦點） | `span.z-chosenbox-item.z-chosenbox-item-focus`，**只量底色**（RED run 發現） |
| 9 | `selectbox.zul` | 頁面本來就有選取的選項 | `.z-selectbox option:checked` |

- **今天的 RED：** 9 項的底色都等於 `--zk-color-primary-container`（2026-10-06 實測 L=0.92；`secondary-container` 是 L=0.87），所以判定應該全部失敗。哪一項今天就已經通過，就代表那一項量錯了。
- **RED run（2026-10-06，Opus Verifier）：** 9 項的判定都失敗，符合要求。上表第 2、3、6、7、8 列已依 RED run 的發現修正。腳本、操作步驟和基準值都放在 [gates/batch2-red/](gates/batch2-red/)，修正後的驗證可以直接重跑 `rows2.js`、`menu.js`、`protect.js`。
- **範圍外的發現：** group 列（第 2 項）和 chip（第 8 項）的文字色原本就不會跟著選取狀態變化，一直是 `rgba(0,0,0,0.87)`。這不是本批造成的，也不在本批範圍內，所以這兩列只量底色。

### 也必須成立

- **滑鼠移到選取列上的效果還在：** 第 1、4 項的選取列在 hover 時，底色要跟「選取但沒有 hover」不同，也要跟「沒選取但 hover」不同。
- **文字讀得清楚：** 第 1、4、5、7 項，選取列文字和底色的對比 **≥ 4.5:1**。用截圖取文字筆畫的像素和底色像素來算。
- **換品牌色時跟著換：** 在 `<html>` 加上 `data-brand="copper"` 後重量第 1、4 項，底色要等於該品牌下 `--zk-color-secondary-container` 的計算值，而且跟 `data-brand="blue"` 時不同。
- **公開 knob 照樣有效：** 在 `:root` 設定 `--zk-listbox-selected-bg: rgb(255, 0, 0)` 後，第 1 項的底色要變成紅色。這項由 `component-theming` 回歸測試涵蓋。
- **高對比模式不變：** `forcedColors: 'active'` 下，第 1、4 項的選取列仍然是 `Highlight` 底、`HighlightText` 字。由 `forced-colors` 回歸測試涵蓋。
- **其他家族不變：** paging 的目前頁、navitem 的目前項目、organigram 的選取節點、calendar 的選取日，計算值都跟 RED run 記錄的基準值（`gates/batch2-red/protect.json`）一樣。
- **第一批的成果不被破壞：** 對選取列按鍵盤操作時，第一批 #41 的焦點框仍然出現（`outline-style: solid`）。

### 回歸範圍

- **`component-theming`：** 如果有測試寫死了舊的預設值（`primary-container`），預期會失敗。
  Generator 只能把「預設值」那一處改成新值，必須逐條列出改了哪些測試；Planner 會檢查這些修改，Verifier 判定時要確認失敗的只有這些。
  RED run 查過了：`component-theming` 和 `forced-colors` 裡**沒有**任何測試寫死舊的預設值，所以 Generator 沒有可以改的測試；這兩個 project 修正後必須全部通過。
- **`forced-colors`、`focus-scan`：** 預期全部通過。已知 organigram 那一項是修正前就存在的失敗（follow-up item 8）。
- **`chromium` 截圖：** 上面 7 個元件中，畫面上有選取狀態的截圖預期會變。其他元件的截圖只能出現已知的反鋸齒落差（follow-up item 8）。
- **`tablet`：** 同上。

---

## 前置工作：重新產生過時的截圖 baseline（follow-up item 8，D19-A）

狀態：**已核准**（D20-A，2026-10-06）。這不是 Jess 的 issue，但照同樣的流程辦：先訂驗證方法，再動手。

### 現況（2026-10-06 實測，修正後的 8085）

- `chromium` 專案：**27 項失敗**、99 項通過。
  - 預期內 4 項：第一、二批造成的變動，包括 listbox gallery、tree gallery、tabbox gallery 和 hover。
  - 其餘 23 項：bandbox、button、checkbox、chosenbox、combobox、datebox、grid、longbox、panel、searchbox、selectbox、spinner、textbox、timebox、toast、window 的 gallery、hover 或 focus。
- `focus-scan`：1 項失敗，「selected + focused under forced-colors › organigram」。`.z-orgnode` 有 0.25s 的背景色 transition，測試在漸變途中取樣。
- `tablet`：沒有失敗。它容許 2% 的差異，所以有些變動沒被抓到。

### 方法

**步驟 1：分類（由 Opus Verifier 做，重新產生之前）**

逐一比對 27 項的 expected、actual 和 diff，每項歸入一類：

| 類別 | 判定條件 |
|---|---|
| **E：預期的變動** | diff 只出現在第一、二批改過的地方：清單列的選取色、焦點框、tab 指示線 |
| **D：既有的落差** | 改變的像素只有灰階反鋸齒，或是文字變寬造成的整體位移（≤ 3px）；沒有任何色相改變，也沒有元素出現或消失 |
| **U：無法解釋** | 不屬於 E 或 D 的其他情況 |

U 類**不重新產生**，個別回報。

**步驟 2：人工確認（使用者核准）**

把 27 項的 expected、actual、diff 並排做成一頁，依 E、D、U 分組，交給使用者看。使用者核准的項目，才進入下一步。這是 item 8 要求的「接受之前先看 diff」。

**步驟 3：重新產生（由 Generator 做）**

- 只針對核准的項目，用 Playwright 不加參數的 `--update-snapshots`（只會更新失敗的那些，**不可**用 `=all`）。
- 不執行 `forced-colors-gallery`，因為它每次跑都會改寫大約 100 張受追蹤的 PNG。如果它有改到檔案，就還原。

**步驟 4：organigram 的 focus-scan 測試（由 Generator 修正測試）**

在取樣之前先停掉 transition，或等 transition 結束。

### 判定檢查（步驟 3、4 完成後，由全新的 Opus Verifier 做）

1. `chromium` 專案連續跑 **2 次**，兩次都是**全數通過**；如果 U 類有被保留下來，那幾項除外。
2. `git status zkpreview/doc/screenshots`：
   - 變動的 PNG **正好**是步驟 2 核准的那些，不多也不少；
   - **沒有**新增的 PNG（有新增就代表某個 baseline 原本不存在，跑過等於沒比對）；
   - `*-forced-colors.png` 沒有任何變動。
3. `focus-scan` 連續跑 **3 次**，「organigram」那一項 3 次都通過。
4. **organigram 測試仍然能抓到真正的問題**（防止修成永遠通過）：用 `addStyleTag` 注入一條規則，讓選取節點的焦點框變成 `Highlight`（跟底色同色）後重跑那一項，它必須**失敗**。

### RED

步驟 3、4 動手之前：
- 判定 1 失敗（27 項）；
- 判定 3 失敗；
- 判定 4 今天的狀態先記錄下來（今天的測試因為取樣時機的問題，結果可能不穩定）。

### 步驟 1 結果：分類（2026-10-06，Opus Verifier）

報告：[gates/baseline-classify.md](gates/baseline-classify.md)；量測 script：`gates/baseline-classify/measure.js`。27 項的 expected 與 actual 尺寸都相同，log 沒有尺寸不符的訊息。

| 類別 | 項數 | 項目 |
|---|---|---|
| E | 1 | tabbox › hover：舊 tab 指示線少了 1 個像素 |
| D | 10 | chosenbox、longbox、searchbox、selectbox、textbox 的 focus 和 hover：只有輸入框內文字的次像素重繪 |
| U | 16 | 全部 16 項 gallery |

**U 的共同原因（Planner 查證）：** 預覽頁本身的文字變了：頁面標題變大，段落標題和列標籤變小、變粗、變灰；元件被變窄的標籤往左推，最多推了 83px。來源是 `47d26068ed`（2026-09-11 19:59，「move dead typography utilities onto the labels that carry the text」），它讓原本沒生效的文字 utility 生效。baseline 是在 `cd02d18943`（同一天 17:50）拍的，比這個修正早。所以這是刻意的修正，不是 regression。重新產生之前要不要核准，由使用者決定（D21）。

**Verifier 另外發現的兩件事：**
1. **目前的門檻看不到第二批的選取色變動。** listbox 和 tree 的選取列從 213,230,255 變成 200,213,234，每個像素每個 channel 的差都小於 25，Playwright 不算差異。listbox 和 tree 的 gallery 之所以失敗，只是因為頁面文字。重新產生之後，新的 baseline 會帶入新的選取色，但未來同樣幅度的色彩退步，這組截圖測試一樣抓不到。
2. **截圖都沒有展開下拉選單。** combobox、searchbox、chosenbox 和 selectbox 的截圖都沒有打開 dropdown，所以第二批的下拉選取色不在這組截圖的涵蓋範圍內。

人工確認頁：https://claude.ai/artifact/GPReThL2MpipS4kQfrKQQD

### 步驟 2 結果：人工確認（2026-10-06）

使用者在確認頁核准全部 27 項，0 項不核准，包含 16 項 U 類 gallery（等於 D21-A）。D22（截圖測試的涵蓋缺口）尚未裁示。

### 步驟 3、4 結果：Generator（2026-10-06）

報告：[gates/baseline-regen-gen.md](gates/baseline-regen-gen.md)。
- 27 張 PNG 已重新產生，`git status` 只有這 27 張被改，沒有新增 PNG，forced-colors PNG 都沒變。chromium 全數通過（126 項）。
- organigram：修改前 3 次都失敗；測試在取樣前注入 `transition: none` 之後，3 次都通過。這項注入對 `SELECTED_FAMILIES` 的 4 列都生效。
- **新發現：** 整個 `focus-scan` 專案跑下來，「tree: tree row」失敗，量到的是 Highlight 焦點框畫在 Highlight 底色上。

**Planner 查證（tree row）：** 這是測試模型和實際狀態不一致，不是元件的缺陷。
- 測試用 CDP 把 `:focus-visible` 強加在 `.z-treerow` 本身。但 ZK 的列從來不會拿到 DOM focus。#43 之後，列上的焦點框只會在 tree 的 `.z-focus-a:focus-visible` 時出現，而 #43 也把 `_forced-colors.css` 裡的 `.z-treerow-selected:focus-visible` 改成了這個條件。
- 所以測試量到的，是瀏覽器預設的 `outline: auto` 焦點框（`rgba(5,0,73,.8)`），這個狀態在實際使用時不會發生。
- 按照實際狀態量測（列加上 `z-treerow-focus` 和 `z-treerow-selected`，並把 `:focus-visible` 強加在 `.z-focus-a` 上）：焦點框是 `solid 2px rgb(255,255,255)`（HighlightText），offset 是 -2px，畫在 Highlight 上，沒有問題。
- 先前記錄的「tree row 在 #41/#43 之後通過」是錯的。那次通過也只是因為取樣時剛好落在 transition 漸變途中。已在 follow-up item 8 更正。
- 修正的方式等使用者裁示（D23）。

### D23-A：tree row 和 listbox row 的 focus-scan 改成照實際方式模擬（已核准）

做法：列加上 `-selected` 和 `-focus` 兩個 class，`:focus-visible` 改加在同一個 tree 或 listbox 的 `.z-focus-a` 上。另外新增 listbox row 一項。
驗收（由最後的 Verifier 一併做）：
- tree row 和 listbox row 各跑 3 次，3 次都通過；
- 注入 `outline-color: Highlight` 到 forced-colors 的 (2a focus) 選取 + 焦點規則後，兩項都必須失敗；
- navbar、paging、organigram 這 3 項的結果跟修改前相同。

## 前置工作（續）：補上截圖測試的兩個涵蓋缺口（D22-B）

狀態：**已核准**（D24-A，2026-10-06）。

### 缺口與現況

1. **色差門檻太寬。** `chromium` 專案的 gallery 截圖沒有設定 `threshold`，用的是 Playwright 預設的 0.2（YIQ 色差）。第二批把選取列從 `213,230,255` 改成 `200,213,234`，換算成 YIQ 色差只有 0.0625（Planner 依 pixelmatch 公式計算），低於 0.2，所以 41,628 個像素的改變完全沒被算進差異。
2. **下拉選單沒有截圖。** combobox、searchbox、chosenbox 的截圖都沒有打開下拉選單，第二批改的下拉選取色和 item focus 色不在保護範圍內。
   - selectbox 和 listbox `mold="select"` 的 `option:checked` 是瀏覽器原生的下拉清單，畫在網頁以外，截圖拍不到。預覽頁上也沒有 `size > 1` 的 select。這兩項**不納入**，在報告中註明。

### 方法

**缺口 1：在 `chromium` 專案層級設定 `expect.toHaveScreenshot.threshold: 0.05`**
- 只改 `chromium` 這個專案。`gallery`、`tablet` 等其他專案不動，它們有各自的容許政策（見 `doc/screenshot-tolerance-policy.md`）。
- 0.05 比第二批這次的色差（0.0625）小，所以同樣幅度的變動會被抓到。比 0.05 更小的色差仍然抓不到，這一點會寫進 tolerance policy 文件。
- padShot 的 `maxDiffPixels: 20` 不變。
- **連帶影響：** 這次重新產生 baseline 時，只更新了失敗的 27 張。另外 99 張在 0.2 之下通過，但可能有低於 0.2 的差異。改成 0.05 之後，如果出現新的失敗，照前面的流程處理：Opus 分類、做確認頁給使用者看，使用者核准後才更新。

**缺口 2：新增 3 張下拉選單的截圖**
- combobox：打開下拉選單，用鍵盤讓一個 item 進入選取狀態。
- searchbox：打開下拉選單，讓一個 item 呈現選取狀態。
- chosenbox：打開下拉選單，用鍵盤讓一個 item 進入 focus 狀態。
- 截圖範圍是下拉選單本身，外加 `PAD`。命名照現有規則，例如 `combobox-dropdown.png`。

### 判定檢查（由全新的 Opus Verifier 做）

1. **門檻真的有效（mutation）：** 用 `addStyleTag` 把 listbox 的選取色改回舊值 `rgb(213,230,255)`，重跑 listbox gallery：threshold 0.05 時必須**失敗**；Verifier 另外用 0.2 跑一次對照，必須**通過**，證明是門檻造成的差別。
2. **門檻不會造成誤判：** 在 0.05 之下，`chromium` 連續跑 3 次，3 次都全數通過。如果中途有經使用者核准而重新產生的截圖，那幾張也包含在這 3 次之內。
3. **新截圖拍到正確的東西：** 3 張新截圖中，選取或 focus 的那個 item：
   - 中心點的像素顏色，等於它在頁面上的 computed `background-color`（每個 channel 差 ±2 以內）；
   - 這個顏色等於 `--zk-color-secondary-container` 解析後的值。
4. **新截圖抓得到退步（mutation）：** 把那個 item 的底色改回舊的選取色後重跑，3 張都必須**失敗**。
5. **新截圖穩定：** 3 張各跑 3 次，3 次都通過。
6. **git 範圍：**
   - 只有 `playwright.config.ts`、`screenshot.spec.ts` 和 `doc/screenshot-tolerance-policy.md` 有修改；
   - 新增的 PNG 正好是這 3 張；
   - 其他 PNG 的變動必須都是步驟中使用者核准的項目；
   - `*-forced-colors.png` 沒有任何變動。

### RED（修改前）

- 判定 1：以目前的 0.2 跑，注入舊色後 listbox gallery **會通過**（就是這個缺口本身）；
- 判定 3 到 5：那 3 張截圖目前不存在。

### D22-B 結果：Generator 與第二輪分類（2026-10-06）

Generator 報告：[gates/baseline-d22-gen.md](gates/baseline-d22-gen.md)。分類報告：[gates/baseline-classify.md](gates/baseline-classify.md) 的「第二輪」一節。
- **RED：** 注入舊的選取色後，listbox gallery 在 0.2 下**通過**、在 0.05 下**失敗**。
- **門檻改成 0.05 後新增 6 項失敗：** doublebox、decimalbox、combobutton 的 hover 和 focus，連跑兩次都是同樣這 6 項。Opus 判定全部是 D（文字次像素重繪，重心移動 ≤ 0.5px）。還沒有更新，等使用者在確認頁（第二輪）核准。
- **3 張新的下拉選單截圖：** 用 `--update-snapshots=missing` 產生，3 次都通過。
  - combobox 和 searchbox 選取 item 的底色是 200,213,234，等於 `--zk-color-secondary-container`。
  - **chosenbox 跟計畫的前提不符：** 它的鍵盤 focus item 是 `.z-chosenbox-option-hover`，底色是寫死的 `rgba(0,0,0,.04)`（`zkcml/.../chosenbox.css:147-150`），不是 secondary-container。第二批裡的 chosenbox knob `--zk-chosenbox-item-focus-bg` 指的是輸入框中被點選的 chip，不是下拉選單的 option。已記為 follow-up item 10。判定 3、4 對 chosenbox 怎麼處理，等使用者裁示（D25）。

**D25-A（2026-10-06）：** 保留 `chosenbox-dropdown.png`，只當一般的畫面保護，不套用判定 3、4。另外新增 `chosenbox-chip-focus.png`：點選輸入框中的一個 chip，讓它帶 `.z-chosenbox-item-focus`。判定 3、4 改套用在這一張，比對的是 `--zk-chosenbox-item-focus-bg` 解析後的 secondary-container。

**第二輪人工確認（2026-10-06）：** 使用者全部核准：6 項 D（doublebox、decimalbox、combobutton 的 hover 和 focus），以及 4 張新截圖（combobox-dropdown、searchbox-dropdown、chosenbox-dropdown、chosenbox-chip-focus）。

### 最終判定（2026-10-06，全新的 Opus Verifier）

[gates/baseline-verify.md](gates/baseline-verify.md)：**VERDICT: PASS**，15 項檢查全部通過。所有 mutation 都是在 scratch 複本上做的，repo 檔案的 shasum 前後一致。
- **A（baseline）：**
  - chromium 3 次都是 130 項全數通過；
  - 變動的 PNG 是核准的 33 張，新增的是 4 張；
  - focus-scan 3 次都是 57 項通過、0 項失敗；
  - organigram 的 mutation 會讓測試失敗。
- **B（D23-A）：**
  - tree row 和 listbox row 確實有被檢查（沒有被跳過），mutation 時兩項都失敗；
  - navbar、paging、organigram 的結果跟修改前相同。
- **C（D22-B / D25-A）：**
  - 注入舊的選取色後，在 0.05 下失敗、在 0.2 下通過；
  - 3 張截圖中的 item 底色都是 200,213,234，等於 secondary-container；
  - 3 張的 mutation 都會讓測試失敗。

Verifier 提醒的小風險（在它的幾次測試裡都沒有發生）：
- combobox 的測試沒有指定選中的是哪一個 item；
- searchbox 的測試靠 `.nth(1)` 找到預先選取的那一個 searchbox；
- ZK 打開 popup 用的是 JS 動畫，`animations: 'disabled'` 停不了它；
- gallery 截圖在 0.05 之下沒有 `maxDiffPixels` 的容許量；
- tree 和 listbox 的 `.z-focus-a` 是取 widget 裡的第一個，如果預覽頁出現巢狀的 listbox 或 tree，可能會取錯。

---

## 第三批：grid（#34–#39）

狀態：**已核准**（2026-10-07，對話中 D26–D31 全部裁示，見下一節）。2026-10-06 由 Planner 起草；決策編號 D26 起，只在本文件內有效。
這一批的 6 個 issue 都出在 grid，但**根因各自獨立**，不是一個修法。2026-10-06 先在 8085 實測過，下面「現況量測」是起草依據，不是 RED run；RED run 還是要由 Opus Verifier 另外跑。

### 現況量測（2026-10-06，Planner，8085，viewport 1280×900）

| Issue | 實測 | 判斷 |
|---|---|---|
| #34 | 第一個 grid（`grid.zul`，`width="370px"`）內部寬 368，但兩欄是 180+180，表格 `style="width:360px"`；列和表頭都停在 360，右邊留 8px 空白 | **DEMO 傾向**：表格寬度是 ZK 依欄寬算的，不是 CSS 給的；頁面宣告的寬度對不上 |
| #35 | 排序圖示（desc）、欄選單按鈕都是 `z-icon-caret-down`；群組圖示是 `z-icon-angle-down` | THEME |
| #36 | `.z-group` 整列 `cursor: pointer`（`grid.css:317`），但 ZK 只有點圖示才會展開（`Group.ts` `_doImgClick`）；實測點列右側空白，`z-group-open` 沒變 | THEME |
| #37 | 表頭第 2 個凍結欄有 `box-shadow` + 1px 右邊框；body 的 cell 都是 `none`。body cell 靜止時沒有任何標記 class（ZK 只在**表頭**加 `z-frozen-col`，body 只在捲動後才寫 inline `transform/z-index`，`Frozen.ts:762`、`:872`） | **可能是 ZK-CORE**：純 CSS 不知道要對第幾欄畫線 |
| #38 | 偶數列 hover = `rgba(0,0,0,0.04)`（`grid.css:220`，token `--zk-grid-row-hover-bg`）；odd 列 hover = 8% 混色（`:229`、`:378`）。疊在白底上：偶數列 245、odd 列約 237 | THEME |
| #39 | 表頭文字左緣 53px、body 文字左緣 49px，差 4px。原因是表頭有一個空的 `.z-column-sorticon`（`inline-flex` + `margin-left: 4px`，`grid.css:438-445`）佔位，body 沒有 | THEME |

### 這一批要先裁示的事（決定驗證方法的形狀）

**裁示（2026-10-07）：**

| 議題 | 裁示 | 對驗證方法的影響 |
|---|---|---|
| D26 · #34 | 使用者自己改了 `grid.zul`（拿掉第一個 grid 的 `width="370px"`），不經 Generator | 2026-10-07 Planner 量過：表頭、body 的表格右緣 = body 內框右緣（差 0），**#34 不跑 RED**，直接算已修。最終 Verifier 仍要重量一次，並確認佈景 CSS 沒有 diff |
| D27 · #35 | A：只改排序圖示 | 判定 3 取消；欄選單維持 caret |
| D28 · #36 | A：游標只留在圖示 | 保護項「點右側空白不會切換」維持原樣 |
| D29 · #37 | A：RED 證實純 CSS 做不到就改開 ZK Jira，佈景不處理。使用者補充：**IceBlue 也有同樣的邊框問題**，開 ZK Jira 時要註明 | 看板 BLOCKED 一併記下。IceBlue 的說法是使用者提供的，尚未量過 |
| D30 · #38 | A：全部 4% | 「hover 強度」那一項固定為 4%；token 預設值不變 |
| D31 · #39 | A：排序圖示移到文字後面 | 跟 #35 一起做 |

### #34 — 右側多出的空白

- **元件 / 分類：** grid · **DEMO 傾向**（待 D26 確認）。
- **修好的樣子：** 表頭和列的右緣貼齊 grid 內框的右緣，沒有空隙。
- **頁面與目標：** `${PREVIEW_URL}/grid.zul` 第一個 grid（Row States）。
- **量法：** 取 `.z-grid-body table` 和 `.z-grid-body` 的 `getBoundingClientRect().right`；表頭同樣取 `.z-grid-header table`。
- **判定檢查：** 表格右緣 − body 內框右緣 **== 0**（±0.5px），表頭和 body 兩處都要成立。
- **今天的 RED：** 8px（360 對 368）。
- **也必須成立：** 同頁其他 grid（Basic、Auxhead 兩個）的差值仍是 0（保護項，今天就會通過）；Frozen 那個 grid 本來就水平捲動（表格 786px 寬於 body），不納入（RED run 發現）；若修法是改 `grid.zul`，佈景 CSS 的 diff 必須是空的。
- **回歸範圍：** `chromium` 截圖（grid gallery）。

### #35 — 排序、欄選單、群組圖示不該長得一樣

- **元件 / 分類：** grid · THEME。範圍待 D27。
- **她要的：** 排序圖示反映升冪／降冪（上下箭頭）；欄選單改成直排三點（她寫「optional, okay to leave current」）。
- **頁面與目標：** `grid.zul` 第 2 個 grid（Basic）的 `Title` 欄；`grid-grouping.zul` 第一個 `.z-group-icon`。
- **量法：** 圖示的形狀用截圖比對，不讀 class 名稱，這樣不限定修法。每個圖示取自己的 bounding box 往外 2px 截圖，縮成 16×16，把與背景色差 ΔE > 10 的像素當成「墨跡」，得到二值遮罩；兩個圖示的相似度 = 遮罩的 IoU（交集 ÷ 聯集）。
  **RED run 發現（2026-10-07）：** 這樣量不出差別（降冪排序圖示 vs 欄選單 IoU 量到 0.318，但兩者其實是同一個 caret，只是 bounding box 位置不同）。**修正：** 先把墨跡裁到自己的 ink bounding box 再縮成 16×16，截圖 devicePixelRatio 用 4，墨跡門檻 0.5。實測相同圖示 0.867–1.0，不同圖示 ≤ 0.135（上箭頭 vs 下箭頭最高 0.455）。
- **步驟：** 點 `Title` 欄一次（升冪）、量；再點一次（降冪）、量。每個狀態都量排序圖示、同欄的 `.z-column-button` 圖示（hover 該欄使它可見）、群組圖示。
- **判定檢查：**
  1. 降冪狀態：IoU(排序圖示, 欄選單圖示) **< 0.5**，IoU(排序圖示, 群組圖示) **< 0.5**（用上面修正後的量法；今天是 0.867 以上）。
  2. 升冪狀態：同上兩項（用修正後的量法，今天是保護項，會通過）。
  3. 若 D27 選 B（欄選單也改）：IoU(欄選單圖示, 群組圖示) **< 0.9**，而且欄選單圖示的墨跡寬 < 高（直排三點）。
- **今天的 RED：** 1 和 2 的第一項：降冪是 caret-down，欄選單也是 caret-down，IoU 預期 ≥ 0.9，失敗。**升冪是 caret-up，今天就會通過，這一項是保護項。** 判定 3（若 D27 選 B）今天也失敗。
- **也必須成立：**
  - 升冪和降冪的排序圖示彼此 IoU **< 0.9**（今天就會通過）。
  - 沒排序的欄，沒有排序圖示的墨跡。
  - 排序真的有作用：點 `Title` 一次，第一列的 Title 文字會從 `The Northern Clemency` 變成 `Hurry Down Sunshine`（RED run 發現：點兩次會回到初始值，不能拿兩次來比）。
  - 圖示對比：排序圖示和背景 ≥ 3:1（WCAG 1.4.11）。
  - `forcedColors: 'active'` 下，排序圖示仍然看得見。
  - 滑鼠移上去的 `title`（`Ascending Order` / `Descending Order`）仍然存在。
- **回歸範圍：** `chromium` 截圖（grid、listbox、tree 的表頭；listbox/tree 共用 `HeaderWidget`，圖示若改在共用層，它們的截圖也會變）、`forced-colors`、`component-theming`。
- **要注意：** 排序圖示和欄選單圖示是 `HeaderWidget.ts` 輸出的，`z-icon-caret-*` 這個 class 是 listbox、tree 共用的。如果 Generator 的修法是改 Java／TS 輸出的 class，就超出純 CSS，要回報 Planner，不要自己決定。

### #36 — 不能點的列不該是 pointer

- **元件 / 分類：** grid（`zkex` 的 group 列）· THEME。範圍待 D28。
- **頁面與目標：** `${PREVIEW_URL}/grid-grouping.zul` 第一個 `.z-group`（`Dell`）；`grid.zul` 的一般 `.z-row`。
- **量法：** 游標用共用規則的代理量測（`elementFromPoint` 的 computed `cursor`）。
- **判定檢查：**
  1. 滑鼠移到 group 列的**文字**中心：游標 **!= `pointer`**。
  2. 滑鼠移到 group 列**右側空白**（列右緣內 30px）：游標 **!= `pointer`**。
- **今天的 RED：** 兩項都是 `pointer`。
- **保護項（今天就會通過）：**
  - 滑鼠移到 `.z-group-icon` 中心：游標 == `pointer`。
  - 點圖示會切換：`z-group-open` 這個 class 會消失或出現，再點一次回復。
  - 點列右側空白**不會**切換（記錄現況；若 D28 選 B，這一項反過來）。
  - 一般資料列 `.z-row` 的游標是 `auto`；可排序欄頭是 `pointer`；欄選單按鈕是 `pointer`；`.z-column-sizing` 時是 `col-resize`。
- **也必須成立：** 鍵盤仍可切換群組（焦點在 group 的 `td` 上按 Enter 或 Space，結果跟實測現況相同；Verifier 在 RED 時先記錄現況，修完再比對）。
- **回歸範圍：** `hit-target`、`chromium` 截圖（grid-grouping）。截圖預期不變，因為截圖看不到游標。
- **不在範圍內：** group 列 hover 的底色變化會讓列「看起來可以點」，這是另一個設計問題，這一批不處理，只記錄。

### #37 — 凍結欄的分界線只出現在表頭

- **元件 / 分類：** grid（`mesh/css/frozen.css`，grid、listbox、tree 共用）· THEME，**可能是 ZK-CORE**。
- **頁面與目標：** `grid.zul` 第 5 個 grid（Frozen Columns，`<frozen columns="2"/>`，共 4 列）。
- **量法：** 只看像素。表頭第 2 個凍結欄（`Col B`）的右緣 x 當作分界線位置 `x0`。對 4 個資料列各取一條垂直帶（`x0 − 3` 到 `x0 + 3`，高度 = 該列高度）截圖，若帶內有任何一欄像素和該列背景色的 ΔE ≥ 2，就算這一列有分界線。
- **步驟與判定檢查：**
  1. 捲動位置 0：4 個資料列都有分界線 **== 4**。
  2. 把 `.z-frozen-inner` 水平捲 200px 後重做：4 個資料列都有分界線，**而且 `x0` 沒有跟著動**（凍結欄不動，所以線不能動），分界線 x 的位移 ≤ 1px。
- **今天的 RED：** 步驟 1 得到 0。
- **可行性（RED run 一併回答）：** body 的 cell 在靜止時沒有任何標記 class（上面實測）。Verifier 要記錄：
  1. 靜止時，body 凍結欄的 cell 有沒有任何 class、attribute 或 inline style 可以跟非凍結欄分開；
  2. 捲動之後 ZK 寫的 inline `transform` / `z-index` 能不能拿來當選擇器（它只在捲動後才有，所以不能當唯一依據）。
  如果兩個答案都是「不行」，**純 CSS 做不到**，這個 issue 比照 #65 的拖動那一半處理：改成 ZK Jira（widget 要在 body 凍結欄 cell 加 class），佈景這邊不處理。這個走向待 D29 核准。
- **也必須成立：**
  - 沒有設 `<frozen>` 的 grid 不出現任何分界線。
  - 凍結欄 hover 時的底色仍是不透明（`frozen.css` 末段那條規則的目的），不會透出被蓋住的文字：alpha ≥ 0.99（RED run 補上門檻，今天 0.995）。
  - listbox、tree 的凍結欄行為不變（`listbox.zul`、`tree.zul` 有 frozen 的範例就各量一次，量表頭分界線仍存在）。
- **回歸範圍：** `chromium` 截圖（grid、listbox、tree 的 frozen 範例）、`forced-colors`、`tablet`。

### #38 — odd / even 列的 hover 底色不一致

- **元件 / 分類：** grid · THEME。強度待 D30。
- **她要的：** 單一、一致的 hover 狀態。
- **頁面與目標：** `grid.zul` 第 1 個 grid（Row States，4 列，偶數列和 odd 列都有）和第 2 個 grid（Basic）。
- **量法：** 對每一列，hover 前後各截一次該列中心的像素（`p.mouse.move` 到列上，截圖取一個沒有文字的空白點）。hover 造成的變化量 Δ = hover 後 RGB − hover 前 RGB（逐 channel）。
  不比較 computed 的 `background-color`，因為偶數列是半透明、odd 列是不透明，字串一定不同；只比最後看到的顏色。
- **判定檢查：**
  1. 同一個 grid 內，所有列的 Δ 彼此相差 **≤ 1**（每個 channel）。
  2. Δ 不是零（hover 有效果）：至少一個 channel 的絕對值 ≥ 3。
- **今天的 RED：** 偶數列約 −10、odd 列約 −18，相差約 8，判定 1 失敗。
- **保護項（今天就會通過）：** 判定 2。
- **也必須成立：**
  - **（修後才成立，今天會失敗，不是保護項）** hover 的強度符合 D30 的裁示（4%）：Δ 等於 `--zk-color-on-surface` 以該百分比疊在列底色上的結果，±1。
  - 凍結欄的 grid（Frozen Columns）hover 時，凍結欄 cell 的底色跟同一列其他 cell 一樣（沒有一格顏色不同）。
  - **（修後才成立，今天 odd 列不變色，不是保護項）** 公開 knob `--zk-grid-row-hover-bg` 設成 `rgb(255,0,0)` 後，偶數列 hover 變紅（knob 照樣有效）；odd 列也要跟著變，因為判定 1 要求一致。
  - `forcedColors: 'active'` 下的 hover 外觀不變。
  - 分組列（`.z-group`）hover 的底色不變。
- **回歸範圍：** `component-theming`（若有測試寫死 `grid-row-hover-bg` 的值）、`forced-colors`、`chromium` 截圖（hover 類的 baseline 可能變）。

### #39 — 表頭和內容文字沒對齊

- **元件 / 分類：** grid · THEME。她沒填嚴重度（模板預設值）。
- **頁面與目標：** `grid.zul` 第 2 個 grid（Basic，`Author` 欄有排序）和第 1 個 grid；`listbox.zul`、`tree.zul` 當作對照。
- **量法：** 用 `Range.selectNodeContents(文字節點).getBoundingClientRect().left` 取**文字本身**的左緣，不取欄位或 `padding` 的位置。表頭取 `.z-column-content` 底下的文字節點，內容取第一列對應欄的 `.z-label`。
- **步驟與判定檢查：**
  1. 未排序狀態：每一欄的 表頭文字左緣 − 第一列文字左緣 **== 0**（±0.5px），逐欄量（Name / Status；Author / Title / Publisher / Pages）。
  2. 排序之後（點 `Author` 一次，再點一次）：同樣逐欄 **== 0**。排序圖示出現不能把文字推開。
- **今天的 RED：** 4px（53 對 49），每一欄都一樣。
- **也必須成立：**
  - 排序圖示仍然看得見，而且沒有疊在文字上（圖示和文字的 bounding box 不相交）。
  - 欄選單按鈕 hover 時仍在欄的右側，沒有擠壓文字。
  - `align="right"` 的欄（Auxhead 範例）：表頭和內容的文字**右緣**對齊，誤差 ≤ 0.5px（保護項，今天 0）。
  - `align="center"` 的欄：表頭和內容的文字**中心**對齊，誤差 ≤ 0.5px。**這是判定檢查，不是保護項**（RED run 發現：今天差 2.0px，同一個空的 sorticon 佔位造成）。
  - listbox、tree 的表頭對齊結果跟 RED 記錄相同。如果它們今天也有 4px 的差，記進看板，**不在這一批順便修**。
  - 欄寬、列高不變（±0）。
- **回歸範圍：** `chromium` 截圖（grid 的所有 header baseline 會變）、`tablet`、`forced-colors`。
- **跟 #35 的關係：** 兩者改的是同一個元素（`.z-column-sorticon`）。**建議一起做**，不然 #39 修完位置、#35 又要重改圖示。驗證方法各自獨立，判定檢查互不依賴。

### 共同注意事項

- 這 6 個 issue 在 RED run 裡必須「判定檢查」全部失敗，保護項必須通過；#34、#37 如果 RED 結果顯示不是 THEME，退回 Planner 改分類，不進入實作。
- 「grid」的預覽頁沒有 `sort` 狀態的預設範例，Verifier 要用真的點擊產生，不要用 JS 直接加 class。
- 腳本、操作步驟、基準值放在 `gates/batch3-red/`，格式照 batch2-red。
- 跑完後，`doc/screenshots/` 的變動只能是上面各項列出的預期 baseline，其餘依「前置工作」那一節的流程（Opus 分類、使用者看過確認頁）處理。

### RED run 結果（2026-10-07，Sonnet Verifier）

報告：[gates/batch3-red.md](gates/batch3-red.md)；腳本與原始輸出：`gates/batch3-red/`。Opus 本週用量已滿，RED run 由 Sonnet 跑（使用者裁示）；修完後的最終判定仍等 Opus。

- **RED-correct：** #36 判定 1、2（都是 `pointer`）；#37 步驟 1、2（0/4 列，靜止與捲動後都是）；#38 判定 1（偶數列 −10、odd 列 −18，差 8）；#39 判定 1、2（4px；排序後 Author 欄 22px）。
- **方法有誤，已在上面各段修正（都發生在動工之前）：** #35 的 IoU 量法、#35「排序有作用」、#34 的 Frozen 保護項、#39 的 center 保護項；另補 #38 兩項的歸類和 alpha 門檻。#34 baseline 為 0。
- **#35 的修正還沒有重跑。** 修正後的量法要在 Generator 動工前，由 Verifier 對現況再跑一次，確認判定 1 失敗（`gates/batch3-red/i35-method.js` 已有 ink-box 版本的數字）。
- **#39 在 listbox 和 tree：** 非第一欄也有同樣 4px 差；第一欄因縮排和結構不同。依計畫不在這一批順便修，記進看板。

### #37 可行性結果與重新裁示（2026-10-07）

- **靜止時**：body 凍結欄 cell 在 grid、listbox、tree 都沒有任何 class、attribute、inline style，computed style 也沒差異。捲動後 ZK 才寫 `transform: translate3d(200px,0,0); z-index:1`。
- **但純 CSS 做得到：** 表頭靜止時就有 `.z-frozen-col`，用 `:has()` 加 `:nth-child` 能對到 body 的同一欄。Verifier 用頁面內注入的樣式測過：4/4 列在靜止與捲動 200px 後都有線，`x0` 沒動。
- 限制：凍結欄數要逐一列舉；group、auxhead、checkmark 欄可能讓 `:nth-child` 對不上；`:has()` 需要新瀏覽器。
- D29-A 的前提（純 CSS 做不到才開 ZK Jira）不成立，需要重新裁示（D32）。
- IceBlue：未量測（預覽頁沒有簡單的換主題方式）。

### D32 裁示（2026-10-07）：C，CSS 先修，同時開 ZK Jira

- **先做的（本批）：** 在 `frozen.css` 加規則，用 `:has()` + `:nth-child`，N = 1..4，線用 `box-shadow: inset -1px 0 0 var(--zk-color-outline-variant)`（外側陰影加邊框在水平捲動後 body 看不見，已量過 0/3，不採用）。對象：grid、listbox、tree。限制（colspan 列、5 欄以上、smooth 關閉、`:has()` 舊瀏覽器）寫進規則上方的註解。
- **同時記錄的 ZK Jira（依「所有 P1 做完才開 Jira」的規則，先記在看板 BLOCKED 那組）：** 請 widget 在 body 凍結欄 cell 加 class，之後換成 class 選擇器、拿掉限制。Jira 內文註明使用者說 IceBlue 也有同樣的邊框問題（未量測）。
- **#37 的驗證方法補充（Verifier 在 RED 之外另加；暫時頁的腳本還沒存進 gates/，由 Verifier 重建）：**
  1. 原判定不變：grid.zul 第 5 個 grid，4 列都有分界線；捲動後線不動、仍 4 列。
  2. 新增版面（用暫時頁，量完刪除，不進 repo）：凍結 1、3 欄；含 group 列；含 auxhead；`start="1"`；listbox + `checkmark`；listbox；tree。每種靜止與捲動到底後，所有**資料列**都要有線。
  3. 已知限制，**不算失敗**：group 列本身沒有線；第一欄 cell 用 `colspan` 的那一列沒有線。Verifier 要確認這兩種情況只是「沒有線」，沒有線出現在錯的欄，也沒有版面位移。
  4. 保護項：沒有 `<frozen>` 的 grid、listbox、tree 不出現分界線；凍結欄 hover 底色 alpha ≥ 0.99。
  5. 參考結果（Planner 用注入規則量過，不是正式判定）：9 種版面 8 種全通過，colspan 那種 1/2。

### D33 裁示（2026-10-07，post-fix 驗證之後）

使用者：**第一欄 cell 用 `colspan` 在規格上本來就不支援**，所以驗證方法要呈現「不支援」的結果，不要求線出現在正確位置。

- #37 的 colspan 那一列：**不對線的位置做任何斷言**（不要求沒有線，也不要求沒有錯位線），只要求記錄量到的現象，以及版面沒有位移（欄寬、列高、cell 位置與修前相同）。
- 這一項不再是 FAIL 條件。Sonnet Verifier 回報的 GATE3: FAIL 因此只剩這一條的標準錯誤，**#37 其餘判定全部通過**，等同通過（暫定，Opus 重跑後正式）。
- 規則本身不改，不加 `:not(:has(> [colspan]))`。規則上方註解的「colspan 列」限制改寫為「不支援」。

### D34、D35 裁示與 Verifier 模型（2026-10-07）

- **D34-A：** 長標籤被排序圖示壓住，這批不改佈景，把使用者可用的 CSS 寫法記進 follow-up（[marble-theme-followups.md](../marble-theme-followups.md) 第 11 項）。
- **D35：** 凍結欄 hover 的不透明門檻，**使用者訂 alpha ≥ 0.98**（取代我原先的 0.99）。grid 0.9948、listbox 與 tree 0.9896 都通過；0.5、0.9 的透字仍會被擋下。
- **最終判定的模型：** 使用者問為何要等 Opus。原因只是 2026-10-05 的裁示把 Verifier 定為 Opus。使用者同意改用 **Fable** 做最終判定（2026-10-07），不必等 10/10。

### 第三批最終判定（2026-10-07，Fable）

- 第 1 輪 [gates/batch3-final.md](gates/batch3-final.md)：`GATE3-FINAL: FAIL (#37)`。#34、#35、#36、#38、#39 通過；#37 判定通過，只有「巢狀元件不該有線」的保護項失敗（body 規則用後代選擇器，巢狀的 grid／listbox／tree 也被畫上線）。這是規則的缺陷，不是已知限制。
- 第 2 輪 [gates/batch3-final-r2.md](gates/batch3-final-r2.md)：Generator 把 body 規則改成從 widget 根到列的完整子選擇器鏈；**`GATE3-FINAL-R2: PASS`**。巢狀的非凍結 widget 0 條線，巢狀的凍結 widget 只有自己的線；D32 所有版面靜止與捲動後都通過；colspan 列只記錄，版面沒有位移；凍結 hover alpha grid 0.9948、listbox 與 tree 0.9896（門檻 0.98）。
- 回歸：component-theming 107/107、forced-colors 17/17、focus-scan 58 通過、hit-target 3/3。chromium 3 項（grid、listbox、tree gallery）和 tablet 2 項（grid、paging gallery）失敗，**全部 E**，沒有 D 或 U，兩輪的差異像素數相同。尚未重新產生 baseline，等你看確認頁核准。
- **方法本身的問題（Verifier 回報，已接受）：** (1) #34「佈景 CSS diff 必須是空的」在同批改同一個檔時量不到，這一條取消，改由 Planner 看 diff 確認；(2) 回歸範圍要涵蓋所有含 grid 的預覽頁（`paging-tablet` 就是例子）；(3) 凍結 5 欄在原欄寬下分界線落在 viewport 外，N≥5 改用窄欄量，結果是沒有線也沒有畫錯欄。
- 備註：Verifier 為了讓 8085 吃到新 CSS，重新 build 並重啟了 8085；順便結束了一個 2026-10-06 遺留、沒有 listen 的 appRun wrapper。

### 第三批 baseline 重新產生（2026-10-07）

使用者核准 D37（grid、listbox、tree、paging-tablet）與 D38-A（grid-tablet，既有的凍結表頭問題記成 follow-up 14）。分類報告：[gates/batch3-baseline.md](gates/batch3-baseline.md)；Generator 報告：[gates/batch3-baseline-regen.md](gates/batch3-baseline-regen.md)。

- 用 `--update-snapshots=changed`，限定 chromium 的 grid、listbox、tree gallery 和 tablet 的 grid、paging gallery；沒有用 `=all`，沒有跑 forced-colors-gallery。
- 結果：變動的 PNG 正好是這 5 張，沒有新增，沒有 `*-forced-colors.png`。重新產生後 chromium 130/130、tablet 55/55 全過。Planner 自己再看了一次 `git status`，結果相同。
- 未 commit。

---

## 第四批：biglistbox 捲軸（#31、#78）

狀態：**已核准**（2026-10-07，D39-A、D40-A 含退路，見下方「裁示」）。2026-10-07 由 Planner 起草；決策編號沿用本文件，從 D39 起。
兩個 issue 都落在同一段 CSS：`../zkcml/zkmax/src/main/resources/web/js/zkmax/big/css/biglistbox.css:97-217`（`.z-biglistbox-wscroll-*`）。**根因各自獨立**：#31 是捲軸「軌道的位置與範圍」，#78 是捲軸「外觀」。驗證方法各自獨立，建議同一批做。
Jess 的截圖已存在 [gates/batch4-red/ref/](gates/batch4-red/ref/)；現況量測腳本是 `gates/batch4-red/measure-current.js`。

### 現況量測（2026-10-07，Planner，8085，viewport 1280×900，不是 RED run）

| 項目 | 實測 | 意義 |
|---|---|---|
| 第一個 biglistbox（`#stripedBiglist`，5 列 × 5 欄，200px 高） | 垂直捲軸軌道 `top` = 188、高 200，表頭 188–227。**軌道從 widget 最上緣開始，蓋住 39px 的表頭**；`::before` 的 6% 灰色軌道槽畫在表頭範圍內（Jess #31 紅框處） | #31 的直接證據 |
| 同一個 biglistbox 的水平捲軸 | 欄寬合計 650px < 內寬 1214px，水平**不能**捲，但軌道 `display:block`、14px 高，槽仍畫在底部（截圖可見灰帶）；水平 thumb `display:none` | #31「不能捲的地方不該有捲軸區」的第二個實例 |
| 第二個 biglistbox（`#biglist`，500px 高） | 垂直軌道同樣從最上緣起，軌道槽同樣蓋住表頭；垂直 thumb `display:none` | 同上 |
| thumb | 8px 寬、`on-surface` 38% 的圓角灰條，距右緣 3px；軌道槽 8px、`on-surface` 6%，一直都在 | #78 的「現況」 |
| 文件裡的捲軸（`doc/contracts/scrollbar.md` s11，`zul.Scrollbar` 靜止狀態） | 靜止時只有一條 8px 圓角、`--zk-color-outline-variant` 的淺灰條，**沒有軌道槽**；thumb 6px、`outline`；hover 才出現軌道與箭頭 | #78 她要的樣子（`ref/i78-expected.png`：淺灰圓角條，無槽，垂直、水平各一條） |

**這裡有一個互相衝突的既有規格：** `doc/contracts/biglistbox.md` 的 sc6 明文規定要有「一直顯示的 6% 軌道槽」（理由：thumb 在資料量小時擠在角落，要讓捲動區域看得出來）。#78 的期望圖沒有這條槽，所以 #78 要不要照做，等於要不要退掉 sc6 —— 見 D40。

### 這一批要先裁示的事

**D39 · #31 的範圍。** Jess 的原文：「如果這塊區域不能捲（例如 sticky 表頭），就不該有捲軸區」。
- **A（建議）：** 兩件都修 —— 垂直軌道不得蓋住表頭；某個方向的內容放得下時，那個方向完全不畫軌道（含槽）。 ｜ 代價：多一個「放得下就隱藏」的判斷；若只能靠 JS 做，會動到 `Biglistbox.ts`（超出純 CSS，要回報 Planner）。
- **B：** 只修表頭被蓋住這一件。 ｜ 代價：水平軌道在不能捲時仍畫一條灰帶，Jess 會再回報一次。

**D40 · #78 的目標外觀。**
- **A（建議）：** 照文件裡捲軸的靜止狀態：thumb 取 `--zk-color-outline-variant`、圓角，**不畫軌道槽**；寬度與距邊緣的距離，以「同一次量測裡 `scrollbar.zul` 量到的值」為準，不由我手寫。同時退掉 contract sc6（`doc/contracts/biglistbox.md`、`DESIGN.md` 一併改）。 ｜ 代價：資料量小時 thumb 縮在角落，沒有槽可以看出捲動範圍（sc6 當初要防的情況）；箭頭維持隱藏（WScroll 的 thumb 大小算法依賴，不動）。
- **B：** 保留槽，只把 thumb 改成文件的顏色與寬度。 ｜ 代價：仍然不像文件的樣子（文件沒有槽），Jess 大概會再提。
- **C：** 不改，在文件註明 biglistbox 的捲軸是另一種樣式（WScroll，非 `zul.Scrollbar`）。 ｜ 代價：等於婉拒 #78，要你同意並回覆 Jess。

### 共用的量法（所有檢查都用，不限定修法）

- **頁面：** `${PREVIEW_URL}/biglistbox.zul`，兩個現成 widget：`#stripedBiglist`（垂直可捲、水平不可捲）和 `#biglist`（兩個方向都可捲）。另外要一個**兩個方向都放得下**的 widget：2 列 × 3 欄、200px 高。預覽頁沒有，由 Verifier 在 `zkpreview/src/main/webapp/web/` 建暫時頁（`biglistbox-fits.zul`，沿用 `FakerMatrixModel(2, 3)`），**量完刪除，不進 repo**（比照第三批 #37）。
- **只看像素與命中測試，不讀 CSS 屬性**，所以不管修法是改 `top`、改 `height`、改 `display` 還是改 `::before`。截圖 devicePixelRatio 用 2；顏色差用 CIE76 ΔE；量之前先注入 `*{transition:none!important;animation:none!important}`，並等 `document.fonts.ready`。
- **基準色：** 空白處的底色取 widget 內、沒有任何 cell 的區域（`#stripedBiglist` 的 x 在欄寬合計右側）取中位數，不取 CSS 值。
- **記號：** `H` = 該 widget 的 `.z-biglistbox-head-outer` bounding box；`B` = `.z-biglistbox-body-outer`；`R` = 內框右緣。

### #31 — 捲軸不該蓋住表頭、不能捲時不該有捲軸區

- **判定檢查：**
  1. **表頭範圍內沒有捲軸（命中測試）：** 對 3 個 widget，在 `x = R − 7`、`y = H 垂直中心` 做 `elementFromPoint`，結果**不是**任何 class 含 `wscroll` 的元素或其後代。
  2. **表頭範圍內沒有捲軸（像素）：** 只對 `#stripedBiglist` 和暫時頁（它們的表頭右側是空白，`#biglist` 的表頭右側有文字，不納入像素比對）：`x ∈ [R − 14, R − 1]`、`y ∈ [H.top + 2, H.bottom − 2]` 的每個像素，與「同一個 y 範圍、`x ∈ [R − 34, R − 21]`」的中位數色 ΔE **≤ 2**。
  3. **（D39-A 才有）垂直放得下時，右側整條都沒有：** 暫時頁，`x ∈ [R − 14, R − 1]`、整個 widget 高度內，每個像素與底色 ΔE ≤ 2。
  4. **（D39-A 才有）水平放得下時，底部整條都沒有：** `#stripedBiglist`（水平放得下）與暫時頁，`y ∈ [B.bottom − 14, B.bottom − 1]`、`x ∈ 該 widget 內「所有欄之外」的空白區`，每個像素與底色 ΔE ≤ 2。
- **今天的 RED（預測，RED run 要確認）：** 1 失敗（`elementFromPoint` 命中 `.z-biglistbox-wscroll-vertical`）；2 失敗（6% 灰槽 ≈ ΔE 5）；3、4 失敗（槽仍畫著）。
- **保護項（今天就會通過）：**
  - **該有的軌道還在：** `#stripedBiglist` 的垂直 thumb，與底色 ΔE ≥ 10 的像素存在，而且 thumb 的最上緣 ≥ `B.top`；`#biglist` 的水平 thumb 同理，最左緣 ≥ `B.left`。
  - **還能捲：** 在 `#biglist` 上滾輪往下，第一列文字從 `y = 0` 變成其他列，thumb 往下移動；捲到底後 thumb 的下緣 ≤ `B.bottom`、上緣 ≥ `B.top`（對應 contract sc5，水平方向同樣檢查）。
  - **拖得動：** 從 thumb 中心按下，往下拖 40px 後放開，列有跟著捲動。
  - **表頭不動：** 捲動前後，`H` 的 bounding box 完全相同。
  - **表頭可以點：** 點 `#biglist` 最右一欄表頭靠右緣的位置（`x = R − 20`），排序圖示的狀態有變。（命中測試過關之後，這一條防止修法把表頭的事件擋掉。）
- **也必須成立：**
  - 把 widget 切成 `vflex="min"`（頁面上的 Change V/Hflex → `min`）再重量判定 1、2：軌道仍然不蓋住表頭。（軌道高度若由 JS 在 resize 時重算，這一條抓得到。）
  - `forcedColors: 'active'` 下，判定 1 同樣成立。
- **不涵蓋：** `frozenCols`／`fixFrozenCols` 組合（頁面上的下拉清單要 composer 才有內容，這一批不處理，記進看板）；touch 版（`zkmax/css/tablet/_scrollbar.css`）只靠回歸範圍的 `tablet` 專案看。
- **回歸範圍：** `chromium` 截圖（biglistbox 相關 baseline 預期會變：槽不再蓋住表頭）、`tablet`、`forced-colors`、`component-theming`（若有測試寫死 wscroll 的值）。

### #78 — 捲軸外觀要和文件裡的捲軸一致

- **前提：** D40。以下依 D40-A 寫；B 的差別已標出，C 不需要驗證（只需要看板與回覆）。
- **量法（參照式）：** 同一次量測裡，先在 `${PREVIEW_URL}/scrollbar.zul` 量出「文件裡的捲軸」的靜止狀態，當作期望值，再量 biglistbox，兩者比較。期望值由 Verifier 在 RED 階段量出並存檔（`gates/batch4-red/doc-scrollbar.json`），**不由 Planner 寫死**，避免我抄錯。
  - 文件捲軸的量法：取 `scrollbar.zul` 上一個垂直捲軸的靜止狀態（滑鼠不在其上），像素掃描 thumb：顏色、寬度、與所屬容器內框右緣的距離、圓角（thumb 最上一列兩端像素 ≠ thumb 色，中心 = thumb 色）。
  - biglistbox 的量法：`#stripedBiglist` 的垂直 thumb（滑鼠不在其上），同一組量。
- **判定檢查（D40-A）：**
  1. thumb 顏色與文件捲軸 thumb 的顏色 ΔE **≤ 3**（探針取 `--zk-color-outline-variant` 的計算值當第二個依據，兩者都要符合）。
  2. thumb 寬度與文件捲軸的差 **≤ 1px**。
  3. thumb 距容器內框右緣的距離與文件捲軸的差 **≤ 1px**。
  4. thumb 是圓角：最上一列兩端的像素不是 thumb 色，中心是 thumb 色（同文件捲軸）。
  5. **沒有軌道槽：** 軌道範圍內、thumb 以外的像素（thumb 上方、下方各取 8px 以上），與底色 ΔE ≤ 2。（D40-B 時這一項不檢查，改成：槽的顏色維持現狀。）
  6. **水平方向同樣成立：** `#biglist` 的水平 thumb 做 1–5（高度取代寬度、距下緣取代距右緣）。
- **今天的 RED（預測）：** 1 失敗（`on-surface` 38% 約 rgb(165,165,165)，對 `outline-variant` 的淺灰）；5 失敗（6% 槽）；2、3 要看文件捲軸量到的值，今天 thumb 8px、距右 3px，可能其中一項已經相符 —— **相符的那項就是保護項，RED run 要如實標出，不算方法錯。**
- **保護項（今天就會通過）：**
  - 滾輪、拖曳、thumb 位置範圍（同 #31 的保護項，兩批共用同一組腳本）。
  - 水平放得下的 widget，thumb 數量為 0（沒有半隱半現的 thumb）。
  - thumb 會跟著 token 換色（**今天不會通過，不是保護項，是判定**）：在 `:root` 注入 `--zk-color-outline-variant: rgb(255, 0, 0)`，thumb 中心像素變成紅色（ΔE ≤ 3）。這項證明沒有寫死顏色。
  - **品牌色：** `<html data-brand="copper">` 後，thumb 色等於該品牌下 `--zk-color-outline-variant` 的計算值。
- **只記錄、不判定（比照 D33 的做法）：**
  - `forcedColors: 'active'` 下 thumb 是否看得見：瀏覽器會把背景色強制成 Canvas，thumb 可能消失。RED 與最終都量一次，把結果寫進看板；如果消失，記為 follow-up，不擋本批。
  - 滑鼠移到 thumb 上的顏色（文件捲軸的 hover 是整條軌道與箭頭，biglistbox 沒有對應的狀態，本批不要求一致）。
- **也必須成立：** `component-theming` 與 `forced-colors` 測試沒有因為這個改動而新失敗；contract 與規範文件（`doc/contracts/biglistbox.md` sc1/sc2/sc6、`DESIGN.md` 的 biglistbox 捲軸段）已跟著修正，且與實際量到的值一致。**這一項由 Planner 檢查 diff，不由 Verifier 判定。**
- **回歸範圍：** 同 #31（兩者共用一輪截圖與回歸）。

### 共同注意事項

- RED run 的 Verifier 先把 `doc-scrollbar.json` 與兩個 widget 的現況存進 `gates/batch4-red/`，格式照 batch3-red。**#31 的判定 1–4、#78 的判定 1、5、6 與 token 換色，必須全部失敗；保護項必須通過**；有任何一項判定今天就通過，代表方法量錯了，退回 Planner 重寫。
- 最終判定的模型沿用 D35（Fable）；Generator 為 Sonnet。
- 這兩個 issue 的 Generator brief 要先寫明：**軌道高度由 `WScroll` 的 JS 在 resize／載入時重算，還是純 CSS**，這會決定「軌道從表頭下緣開始」能不能純 CSS 做到。表頭高度不固定（實測 39px，隨字級／density 改變），純 CSS 要找到不依賴固定數字的做法；若做不到，修法會碰到 `Biglistbox.ts`（EE，`../zkcml/`），照 #35 的規矩先回報 Planner，不自己決定。
- `doc/screenshots/` 的變動只能是上面預期的 biglistbox baseline，其餘依「前置工作」那一節的流程（分類、確認頁、使用者核准）處理。

### 裁示（2026-10-07，議題頁：https://claude.ai/artifact/8MZiA3iBE8N1GLmaEV8B6x）

- **D39-A：** #31 兩件都修（軌道不蓋表頭，放得下的方向完全不畫軌道）。純 CSS 做不到、要動 `Biglistbox.ts` 時，先回報 Planner 再決定。
- **D40-A，附退路（使用者）：** #78 先照文件靜止狀態做；**因為底層 JS 不同（`WScroll` 對 `zul.Scrollbar`），如果做不到一樣的效果，就改成 C**（不改，在文件註明差異，回覆 Jess）。
  - **「做不到」的判準（Planner 訂，事先寫明，不在修完後調整）：** 判定檢查 1–4（thumb 顏色、寬度、距邊緣、圓角）與判定 5（沒有槽）任一項，經 Generator 最多 3 輪仍無法在容許範圍內相符，**而且**原因出在 `WScroll` 的幾何算法（thumb 大小、`_gap`、`endbar` 位置夾制）而不是單純沒做好，就算做不到。轉 C 時：還原 #78 的 CSS 改動、sc6 保留、在 `doc/contracts/biglistbox.md` 註明差異、看板記錄、回覆 Jess 的文字交給你過目後才貼。
  - 動到 `Biglistbox.ts` 或 `WScroll.ts` 來湊外觀，不算「做得到」：那是改行為，不是改外觀，須另行核准。

### 第四批 RED run 結果（2026-10-07，Fable Verifier）

報告：[gates/batch4-red.md](gates/batch4-red.md)；腳本與原始輸出：`gates/batch4-red/`。暫時頁已刪除，沒有改任何來源檔。結論 `RED4: METHOD-DEFECTS`。

- **RED-correct：** #31 判定 1（三個 widget 都命中 `.z-biglistbox-wscroll-vertical`；`vflex=min`、forced-colors 下同樣失敗）；#78 判定 1（ΔE 22.56）、3（距右 3 對 0）、5（槽 ΔE 4.51）、6、token 換色。保護項全部通過。
- **文件捲軸期望值**（`doc-scrollbar.json`）：量 `scrollbar.zul` 第 2 個 grid（`data-embedscrollbar="true"`，embedded 模式才有靜止狀態）的 `.z-scrollbar-vertical-embed`：顏色 rgb(224,224,224)（`--zk-color-outline-variant` 疊白底）、寬 8px、距容器內框右緣 0、圓角。

**方法修正（Planner 裁定，動工之前；以下取代上文對應的措辭）：**

1. **#31 判定 2、3、4 的像素帶**：原本的帶含 widget 自己的 1px 邊框與圓角（224），會讓修好後也過不了。改為：取 widget 的 border-box 內縮 1px、**排除四角各 10px**；判定 4 的 y 範圍改為 `[box.bottom − 15, box.bottom − 2]`。今天用修正後的帶仍失敗（4.51 / 9.06 / 4.51），符合 RED。
2. **「`#biglist` 兩個方向都可捲」不成立**（預設模型 100×10，垂直放得下）：垂直方向的保護項（滾輪、拖曳、夾制）一律用 `#stripedBiglist`；`#biglist` 只做水平方向，另外切到 `MultipleRow` 重做垂直一次。
3. **#78 的品牌色項**：`data-brand` 不改 `outline-variant`，且今天就失敗，等同判定 1 → **刪除該項**，不當保護項也不另立判定。token 換色那一項保留為判定。
4. **#78 判定 6 的「距下緣」**：以「看得見的內框下緣」（`box.bottom − 1`）為基準，容許 ±1px。原因：`.z-biglistbox-outer` 溢出 1px，`B.bottom = box.bottom + 1`。
5. 文件捲軸只在 embedded 模式有靜止狀態，量法要指明 `data-embedscrollbar="true"`；判定 5 取 thumb 下方（上方區不存在）；「表頭不動」以 widget 為基準；#78 判定 4（圓角）今天就相符，改列保護項。

**可行性（給 Generator brief，Verifier 在頁內注入 CSS 實測，未寫入 repo）：**

- 軌道 div 的幾何**完全是純 CSS**，JS 從不碰；thumb 的位置由 JS 算（`top = head.offsetHeight + scale × step`，相對軌道頂），所以**軌道不能用 CSS 往下移**（會雙重位移）。內容放得下時 JS 只對 `-drag`／`-endbar` 做 `display:none`，軌道本身仍是 block。
- **純 CSS 可達 D39-A + D40-A：** 軌道 `visibility:hidden` + `-drag{visibility:visible}`、`::before{content:none}`、`-drag{background:var(--zk-color-outline-variant)}`，垂直 `left:6px`、水平 `top:4px`。命中測試跳過軌道、不畫像素、不依賴表頭高度、不需要 `:has()`；resize 後 JS 的顯示／隱藏仍相容。striped 與 fits 的 #31 判定全 0，#78 判定 1–5 全過，滾輪、夾制、拖曳正常。
- 限制：forced-colors 下 thumb 與文件的 embed rail 都看不見（兩者都靠 `background-color`，記為 follow-up，不擋本批）；touch 版（`tablet/_scrollbar.css`）未量。
- **對 D40 退路的意義：** 純 CSS 已實測可達，所以預期不會觸發「轉 C」。

### 第四批 RED run 第二輪（2026-10-07，Fable）

報告：[gates/batch4-red-r2.md](gates/batch4-red-r2.md)；`RED4-R2: RED-correct`。修正後的量法下，#31 判定 1–4、#78 判定 1、3、5、6、token 換色今天全部失敗；所有保護項通過；文件捲軸期望值與第一輪完全相同。
- **記錄（Planner 確認）：** #78 判定 6 的子項「水平距下緣」依修正 4 的定義今天就相符（差 1px），**列為保護項**；判定 6 整體仍因垂直子項失敗，所以判定 6 保留。
- 方法定稿，之後不再修改；修完只拿這一版判定。

### 第四批最終判定（2026-10-07，Fable）與裁示

- [gates/batch4-final.md](gates/batch4-final.md)：**`GATE4-FINAL: PASS`**。#31 判定 1–4 最差 ΔE 0（RED 時 4.51 / 9.06 / 4.51）；#78 thumb 顏色對文件 ΔE 0、寬 8、距右 0、圓角、無槽；水平方向同樣通過；token 換色通過。**D40 退路沒有觸發**，#78 照 A 完成。
- 回歸：component-theming 107/107、forced-colors 17/17、hit-target 3/3、chromium 130/130、focus-scan 57 通過、tablet 52/55。3 項失敗：`biglistbox-tablet` E；`slider-tablet`、`calendar-tablet` U（來源是 `64f1c07b9d`、`778b5a809f`，與本批無關）。
- 議題頁：https://claude.ai/artifact/MHmozeSCPGHFAvkUDL9bs6。使用者裁示（2026-10-07）：**D41-A**（重生 `biglistbox-tablet.png`）、**D42-A**（slider、calendar 的 tablet baseline 不在本批處理，記進 follow-up）、**D43-A**（thumb hover 保留比靜止深一階，`--zk-color-outline`）。
- 備註：8085 是共用資源，回歸中途被另一個 session 停掉一次；方法層的建議是回歸前先在看板宣告使用中。

---

## 第五批：cascader／chosenbox／combobox 清單與晶片（#8 #12 #13 #16 #17）

> 狀態：**方法草案，待使用者裁示（D44–D47），尚未動工。** 本節的 D 編號延續本文件（上一個是 D43）。
> 日期：2026-10-07。看板上第四批之後的下一個 P1 群組。

### 為什麼是這五個、不含 #22 與 #27

- #8、#12、#13、#16、#17 都是「輸入元件的彈出清單或晶片」，檔案集中：`../zkcml/zkmax/src/main/resources/web/js/zkmax/inp/css/{cascader,chosenbox}.css` 與 `zul/src/main/resources/web/js/zul/inp/css/combobox.css`，沿用同一組預覽頁（`cascader.zul`、`chosenbox.zul`、`combobox.zul`）。
- **#22（inputgroup）與 #27（rating）不排入：** 工作樹上 `inputgroup.css`、`rating.css`、`_forced-colors.css` 有另一個 session 未提交的修改（對應 `doc/marble-inputgroup-rating-fixes-plan.md`，已標記「已實作並驗證」但還沒 commit）。等那邊提交後，再看這兩個 issue 是否已被涵蓋，不在這邊重做。
- 預覽頁沒有 `inputgroup`、`rating` 以外的衝突檔案；本批只會碰上述三個 CSS 檔與（若需要）三個預覽頁。

### 共用量法

- **頁面：** `${PREVIEW_URL}/{cascader,chosenbox,combobox}.zul`；`devicePixelRatio` 2；量之前注入 `*{transition:none!important;animation:none!important}` 並等 `document.fonts.ready`。
- **字型屬性（#12、#16）直接讀 `getComputedStyle`：** 這兩項問的就是字型屬性本身，沒有「改法不同但像素相同」的問題，所以不必繞像素。
- **幾何與位置（#8、#13）只看像素與命中測試**，不讀 CSS，沿用第四批的規矩。文字位置用 `Range.getBoundingClientRect()` 量裸文字節點。
- **Verifier 不看 CSS diff**；Generator 為 Sonnet；最終判定模型沿用 D35（Fable）。

### #12 — chosenbox 晶片不要特殊字型

- **判定：** 對 `chosenbox.zul` 上每一個晶片（`.z-chosenbox-item-content`，至少 3 個，含 hover 與 focus 狀態各量一次）：`font-style` = `normal`；`font-weight` = `400`。
- **今天的 RED（預測，RED run 要確認）：** `font-weight` 失敗（`label-large` 的 weight token，原始碼 `chosenbox.css:55`）；`font-style` 是否為 italic **尚未在原始碼找到**，可能來自 ZK 預設樣式或預覽頁本身 —— RED run 要量出來源；若是預覽頁造成的，記為 DEMO，不算本批修正。
- **保護項：** 晶片字級不變（仍為 `label-large` 的 size）；晶片高度不變（±0px）；刪除鈕仍可點（命中測試）。

### #13 — 建立新晶片的那一列，圖示與文字的間距與對齊

- **判定：** 在 `chosenbox.zul` 上開 creatable 的 chosenbox，輸入不存在的字，量 `.z-chosenbox-empty-creatable` 那一列：
  1. 圖示右緣到文字左緣的水平距離 **≥ 8px**。
  2. 圖示垂直中心與文字垂直中心的差 **≤ 1px**。
  3. 圖示與文字的左緣與其他選項（`.z-chosenbox-option`）的文字左緣對齊（差 ≤ 1px）。
- **今天的 RED（預測）：** 判定 1 失敗；原始碼寫了 `gap: var(--zk-spacing-2)`（`chosenbox.css:166`）卻看起來沒生效，要查原因（圖示是 `::before` 還是真的元素、文字是不是裸節點）。2、3 不確定，RED run 如實回報。
- **保護項：** 該列整列可點、hover 色塊涵蓋整列寬度。

### #16 — combobox 說明文字的層級

- **判定：** `combobox.zul` 的「With description」那一組，對每個 `.z-comboitem`：說明文字的 `color` = `--zk-color-on-surface-variant` 的計算值；`font-size` = `--zk-typescale-body-small-size` 的計算值；主標籤的 color 與 size **不變**。再用像素確認：說明文字與主標籤的前景色 ΔE ≥ 15（Jess 說的「讀起來不是同一級」）。
- **今天的 RED：** 說明文字 color 為 `rgba(0,0,0,0.87)`、size 與標籤相同（issue 內文已量過）→ 3 項皆失敗。
- **保護項：** 選中與 hover 狀態下，說明文字仍與背景維持 ≥ 4.5:1；列高不低於今天（兩行不被截）。
- **注意：** 說明文字的 class 要先確認（`.z-comboitem-description` 是否存在），Generator brief 要寫明。

### #17 — 唯讀 combobox 不該能選取文字

- **判定：** `combobox.zul` 上的 `readonly="true"` combobox，對輸入框做三連點與 Ctrl+A；`window.getSelection().toString()` 為空，且輸入框內沒有選取高亮的像素（與非選取狀態的同區域 ΔE ≤ 2）。
- **保護項（今天就通過）：** 非唯讀的 combobox 仍能選取、輸入；唯讀 combobox 仍能點開下拉並選項（value 會變）；鍵盤 Tab 可聚焦、焦點環還在。
- **今天的 RED：** 選取字串非空、高亮像素出現。
- **取捨見 D45：** 唯讀欄位通常仍允許複製。

### 這一批要先裁示的事

**D44 · 批次範圍。**
- **A（建議）：** 只做 #8 #12 #13 #16 #17（五個，三個檔案）。 ｜ 代價：combobutton（#18 #19）、slider（#24–26）留給下一批。
- **B：** 加上 combobutton #18 #19 一起做。 ｜ 代價：多一個檔案、一組新的預覽頁量法，RED run 時間約 +40%；hover 區段歸屬的量法要另外設計。

**D45 · #17 的做法。**
- **A（建議）：** 照 Jess 的要求，唯讀輸入框 `user-select: none`。 ｜ 代價：使用者無法反白複製唯讀欄位的文字；ZK 的 `readonly` combobox 是「只能選」的狀態，複製的需求低，但不是零。
- **B：** 保留可選取、只把選取高亮設成透明。 ｜ 代價：看不到反白但字還是可以複製，「不要暗示可編輯」達成，但行為上仍可選取，和 Jess 寫的「不該被選取」字面不符，可能被再回報。

**D46 · #8 要怎麼解讀「選項要撐滿下拉寬度」。** Jess 只給了一張圖，沒有說明哪一欄。
- **A（建議）：** RED run 先重現她的畫面並截圖給你確認；預設解讀為「最後一欄（或單欄）的選項列，hover／選取的色塊要到達 popup 右緣」。 ｜ 代價：多一個確認點，通常不會卡住。
- **B：** 解讀為「所有欄平分 popup 寬度」。 ｜ 代價：會改變多層級展開時整個 popup 的寬度行為，不只是樣式，可能碰到 `Cascader.ts`。

**D47 · #12 若 italic 來自預覽頁而非 CSS。**
- **A（建議）：** 只修 `font-weight`；italic 記為 DEMO 並回覆 Jess，不算本批。 ｜ 代價：Jess 那邊那一項要等 demo 修。
- **B：** 同一批把預覽頁也修掉。 ｜ 代價：多碰一個預覽檔；#12 的完成要等 demo 頁的 commit。

### 共同注意事項

- RED run 先確認：判定今天**必須失敗**、保護項**必須通過**；有判定今天就通過，代表方法量錯，退回 Planner（同第四批）。
- 8085 是共用資源：回歸前先在看板宣告使用中；另一個 session 目前在動 inputgroup／rating，回歸時 `inputgroup`、`rating`、`forced-colors` 的失敗要先對照它的變更再歸因。
- `doc/screenshots/` 與 `zkpreview/doc/screenshots/` 的變動只能是本批預期的三個元件 baseline；**工作樹上現有的 `*-forced-colors.png` 變動不是本批的，不得 `git add`**，逐路徑暫存。

### 裁示（2026-10-07，議題頁：https://claude.ai/artifact/8eruz4g5LioBRxk5njrHCL）

使用者：「先照建議的做」→ **D44-A、D45-A、D46-A、D47-A**。
- D44-A：只做 #8 #12 #13 #16 #17。
- D45-A：#17 用 `user-select: none`；已知代價是唯讀欄位不能反白複製。
- D46-A：#8 解讀為最後一欄的色塊到 popup 右緣；RED run 先重現她的畫面並截圖，Planner 確認解讀後才算定稿。
- D47-A：#12 只修 `font-weight`；italic 若來自預覽頁，記為 DEMO，不在本批。

### 第五批 RED run 結果（2026-10-07，Fable）

報告：[gates/batch5-red.md](gates/batch5-red.md)；證據：`gates/batch5-red/`。結論 `RED5: METHOD-DEFECTS`。沒有暫時頁、沒有改來源檔。8085 在中途被別的 session 重啟過一次（約 55 秒），chosenbox 用舊 server、combobox／cascader 用新 server，同一工作樹，未見差異。

**今天的量測（RED-correct = 判定今天失敗）：**
- **#8：** 單欄 hover 色塊 160px、popup 內緣差 38px → 失敗（RED-correct）。**雙欄色塊已到 popup 內緣（0px）→ 今天就過，列保護項。** 選取列沒有背景色塊（只有藍字），「選取色塊」沒有東西可量。
- **#12：** 4 個晶片 rest／hover／focus 全是 `italic`、`500` → 兩項皆失敗。**italic 來源是根元素 `<i class="z-chosenbox">`（`zkmax/inp/mold/chosenbox.js:21`）的瀏覽器預設，不是預覽頁。**
- **#13：** 建立列計算 `display:block`，所以 `gap`、`align-items` 無效，圖示與文字貼在一起（gap 0px）→ 判定 1 失敗。圖示是 `<i class="z-chosenbox-icon z-chosenbox-create z-icon-plus-square">`，文字是 `<span>`。
- **#16：** 說明文字的 class 是 `.z-comboitem-inner`（不是 description）；今天 color `rgba(0,0,0,0.87)`、13px、與主標籤 ΔE 0 → 三項失敗。
- **#17：** 三連點與 Cmd+A 都選到 "Item 1"、高亮 2304 px → 失敗。**頁內注入 `user-select:none` 後仍選得到、高亮不變：Chromium 對 `<input readonly>` 不理會 `user-select`，D45-A 純 CSS 做不到。** `::selection{background:transparent}` 高亮 0 px，但字串仍可選。

**方法修正（Planner 裁定，動工之前；取代上文對應措辭）：**
1. **#8：** 補判定小節。判定＝單欄 hover 時，最後一欄色塊右緣到 popup 內緣的差 ≤ 1px，且空帶命中測試不是 popup 空白。雙欄 0px 列保護項（修法不能把它弄壞）。「選取」那一半刪除（今天沒有色塊，Jess 也沒要求）。
2. **#12：** font-style 與 font-weight 兩項都在本批（italic 是 theme 範圍，D47-A 的條件分支不成立，不需裁示）。
3. **#13：** 判定 2 以「字形 ink 中心」為基準（今天差 1.25，門檻 ≤ 1px）；判定 3 改列保護項（今天 icon 左緣 = 選項文字左緣，差 0），並寫明比的是 icon 左緣；「可點」只做命中測試（預覽頁無伺服端處理，點了不會建晶片）。
4. **#16：** Generator brief 註明：說明元素是 `.z-comboitem-inner`、主標籤是裸文字節點；選取列的 color 設在 `li` 上會一併套到說明文字，要處理。
5. **#17：** Ctrl+A 改 Cmd+A（macOS Chromium 的 Ctrl+A 是游標移動）；像素基準取「已聚焦、選取收合」的狀態（否則焦點環本身 3150 px 差異）；判定改量法見 D48。

**D45 重問 → D48（待裁示）。** 見議題頁。

### 裁示（2026-10-07，議題頁：https://claude.ai/artifact/B5HBezUYQVC7Gez41CtemT）

**D48-A（使用者）：** 使用者的解讀：Jess 看到的是「從下拉選了項目之後，該項目文字變成選取反白」，只要避免這個情形就可以。
- **#17 的判定改為：** 唯讀 combobox 從下拉選一個項目後、以及三連點、Cmd+A 之後，輸入框內的反白像素與未選取狀態的同區域 ΔE ≤ 2（反白像素數 0）。**不再要求 `getSelection().toString()` 為空。**
- 做法：純 CSS，唯讀輸入框的 `::selection` 背景與文字色設成透明／繼承。
- 保護項不變（非唯讀仍可選取與輸入、唯讀仍可開下拉挑選、Tab 聚焦與焦點環還在）。另加一項：**非唯讀 combobox 的反白仍然看得到**（防止修法把所有 combobox 的反白都關掉）。
- 回覆 Jess 時說明：唯讀欄位的文字仍可複製，但不再出現會被誤認為可編輯的反白。

---

## 第六批：combobutton／slider 系列／rating／inputgroup（#18 #19 #22 #24 #25 #26 #27）

> 狀態：**方法定稿前草案（2026-10-08），依 [jess-review-decision-principles.md](jess-review-decision-principles.md) 第四節直接進行，不另開議題頁。** 本節沒有新的 D 編號；若 RED run 之後出現第五節的例外，才會開議題。
> 工作樹檢查（2026-10-08）：`combobutton.css`、`slider.css`、`rating.css`、`inputgroup.css`、`multislider.css`、`rangeslider.css` 皆無未提交修改，無別的 session 重疊。

### #22、#27 是否已被已提交的修正涵蓋

- **#22（inputgroup 邊框寬度不同）：** 疑似已被 `29b6d0629e`（後綴接縫 2px → 1px、數字框同 textbox）涵蓋。**不假設，RED run 實測**：若所有接縫已是 1px 且同色 → 標記「已涵蓋」、不改程式碼、只更新看板並留言；若仍有不一致 → 轉為本批的修正項。
- **#27（rating 唯讀／停用游標）：** `b2aa291a03` 只處理 `iconSclass`，**沒有**碰游標。原始碼：`.z-rating-disabled`／`.z-rating-readonly` 在每顆 `<i>` 上設 `cursor: default; pointer-events: none`，所以滑鼠實際落在外層 `.z-rating`，而它是 `cursor: pointer`（`rating.css:22`）。預測為 THEME 缺陷，列入本批。

### 共用量法

- **頁面：** `${PREVIEW_URL}/{combobutton,slider,multislider,rangeslider,rating,inputgroup}.zul`；viewport 1280×900；量之前注入 `*{transition:none!important;animation:none!important}` 並等 `document.fonts.ready`；各狀態之間重新載入頁面（避免上一個焦點狀態殘留）。
- **游標：** 沿用共用規則（`elementFromPoint` 的 computed `cursor`）。
- **狀態色塊（hover／active／focus）：** 只看像素。對指定矩形取平均色，與「靜止」狀態同矩形比較 ΔE（CIE76 以上皆可，需在報告註明）；ΔE ≥ 2 視為「有變化」，≤ 1 視為「沒變化」。**不讀 CSS**，不依賴 `::before` 或 `:has()` 等寫法。
- **預覽頁缺實例時：** 若某個判定需要的實例（停用的 combobutton、readonly／disabled rating、有 `slidingtext` 的 slider）預覽頁沒有，Verifier **停下回報缺哪一個**，由 Planner 補預覽頁後再跑；不自行在頁內注入。
- Verifier 不看 CSS diff；Generator 為 Sonnet；最終判定為 Fable（D35）。

### #18 — combobutton：hover 要落在游標底下的那一半

DOM：`.z-combobutton-content`（標籤，含 `::before` 狀態層）內有 `.z-combobutton-button`（箭頭，絕對定位靠右、32px 寬、不透明底）。矩形定義：**箭頭矩形** = `.z-combobutton-button` 的 bounding rect；**標籤矩形** = `.z-combobutton-content` 的 bounding rect 去掉箭頭矩形後左邊的部分。

- **判定 J18-1（今天必須失敗）：** 預設（filled）combobutton，滑鼠停在箭頭中心：箭頭矩形（排除圖示字形，取矩形內側 3px 以內的邊緣環帶）相對靜止 ΔE ≥ 2，**且**標籤矩形 ΔE ≤ 1。
- **判定 J18-2（今天必須失敗）：** 同上，toolbar mold（`.z-combobutton-toolbar`）也成立。
- **判定 J18-3（今天必須失敗）：** 滑鼠在箭頭上按下不放（`:active`，未放開）：箭頭矩形 ΔE ≥ 2 且標籤矩形 ΔE ≤ 1。
- **保護項（今天必須通過）：** (a) 滑鼠停在標籤中心：標籤矩形 ΔE ≥ 2 且箭頭矩形 ΔE ≤ 1。(b) 在標籤上按下不放：標籤矩形有變化、箭頭沒有。(c) Tab 聚焦：整顆（標籤矩形）有焦點色塊（ΔE ≥ 2），焦點行為不變。(d) 開啟狀態（`z-combobutton-open`）的外觀與今天相同（標籤矩形與箭頭矩形的平均色各 ΔE ≤ 1）。(e) 停用的 combobutton 滑過沒有變化（兩個矩形 ΔE ≤ 1）。(f) 兩段高度、寬度、分隔線位置不變（±0px）。
- **範圍（R6）：** 只處理 hover 與 active；focus 與 open 狀態不動。

### #19 — combobutton：停用狀態的箭頭底色要與標籤相同

- **判定 J19-1（今天預期失敗）：** 停用的 filled combobutton，箭頭矩形與標籤矩形各取「角落 3×3px（避開字形與分隔線）」的平均色：ΔE ≤ 1。**RED 要確認今天確實失敗**（Jess 的截圖箭頭較深）；若今天已通過，代表她看到的不是這個狀態，退回 Planner。
- **判定 J19-2：** 停用的 toolbar mold 同理（兩段都透明或同色）：ΔE ≤ 1。
- **保護項：** 啟用的 filled 與 toolbar combobutton 兩段底色相同（今天通過，不得變）；停用文字與圖示色不變（前景像素色 ΔE ≤ 2）；停用文字對比不低於今天。
- **預測（RED 要驗）：** `--zk-color-disabled-container` 若為半透明，箭頭疊在標籤之上會雙重上色而變深。若真是如此，修法是讓箭頭在停用時不重複上底色；Generator brief 只寫判定，不寫修法。

### #22 — inputgroup（只量，通過則標記已涵蓋）

- **量法：** `inputgroup.zul` 上每一個水平 inputgroup（前綴、後綴、前後、數字框）：沿控制項垂直中線取像素，找出相鄰兩個控制項之間「邊框色」連續像素的寬度。
- **判定 J22-1：** 所有接縫的邊框寬度 = 1px，且與外框同色（ΔE ≤ 2）。
- **判定 J22-2：** 同一頁所有 inputgroup 的外框寬度一致（上下左右各 1px，聚焦時的 2px 不計）。
- **今天的預期：** 通過（已涵蓋）。通過 → 不改程式碼；任何一項失敗 → 回報位置與數字，由 Planner 決定轉為修正項。

### #24 — multislider／rangeslider：游標只在有功能的地方，hover 只亮游標底下的那顆

- **量法（游標以「點了會不會動」為準，不寫死哪一塊該是 pointer）：** 在 `multislider.zul`（水平 3 組、垂直 2 組）與 `rangeslider.zul` 的每個 widget 外框內，以 8px 為間距取格點，另外加上軌道上與軌道上下方 padding 區的點。對每個點：記錄 `elementFromPoint` 的 computed `cursor`；再在**重新載入的頁面**於該點點一下，看任何一顆 thumb 的位置是否改變。分類：
  - **thumb 上**（點落在某 thumb 的 bounding rect 內）：游標必須是 `grab`（今天已是）。
  - **會動的點**（點了有 thumb 移動）：游標可以是 `pointer`。
  - **不會動的點**（既不在 thumb 上，點了也沒有 thumb 移動）：游標必須是 `default` 或 `auto`。
- **判定 J24-1（今天必須失敗）：** 全部「不會動的點」游標為 `default`／`auto`。今天整個 widget 外框都是 `pointer`。**RED 若發現沒有任何「不會動的點」（整個外框都會動），J24-1 今天就通過 → 方法量錯，退回 Planner。**
- **判定 J24-2（今天必須失敗）：** 3 組的水平 multislider，滑鼠停在 thumb A 上：thumb A 周圍的 hover 環（以 thumb 中心為圓心、半徑 10–18px 的環帶）相對靜止 ΔE ≥ 2；其餘每一顆 thumb 的環帶 ΔE ≤ 1。滑鼠停在軌道上（不在任何 thumb 上）：所有 thumb 的環帶 ΔE ≤ 1。
- **判定 J24-3（今天必須失敗）：** rangeslider 同 J24-2。
- **保護項：** (a) thumb 上游標 `grab`、按下不放為 `grabbing`（今天通過）。(b) 重疊 thumb 的命中：每顆 thumb 中心的 `elementFromPoint` 就是那顆 thumb（`z-index` 修正不得退化）。(c) 拖曳 thumb 後 thumb 位置與填色區隨之更新（行為不變）。(d) 停用的 multislider／rangeslider 游標與今天相同（RED 記錄，最終比對）。(e) **plain slider（`slider.zul`）：** `Slider.ts` 的 `doClick_` 綁在 widget 根元素上，整個外框點了都會動，所以其游標 `pointer` 與 thumb 的 hover 範圍（今天是單顆）都應維持原樣；RED 用同一個「點了會不會動」量法記錄，不列判定。
- **範圍（R6、R9）：** Jess 寫的是 multislider 與 rangeslider；plain slider 若 RED 證實整個外框可點，就不改。**focus-within 目前也是「一個聚焦、全部亮環」，與 hover 同類，但 Jess 沒寫，記進 follow-up、不在本批。**

### #25 — slider 提示（slidetip）對齊

- **量法：** `slider.zul`：在 thumb 中心按下、水平（或垂直）移動 10px 後**不放開**，`#zul_slidetip`（class `z-slider-popup`）此時存在。量：提示框 bounding rect、thumb bounding rect、提示文字的字形 ink 範圍（`Range.getBoundingClientRect()` 或像素）。
- **判定 J25-1（今天預期失敗）：** 水平 slider（含 sphere mold）：提示框水平中心與 thumb 水平中心差 ≤ 1px。
- **判定 J25-2（今天預期失敗）：** 垂直 slider：提示框垂直中心與 thumb 垂直中心差 ≤ 1px。
- **判定 J25-3：** 文字在提示框內置中：ink 水平中心與框水平中心差 ≤ 1px、ink 垂直中心與框垂直中心差 ≤ 1px（水平與垂直兩種 slider 各量）。
- **保護項：** 提示框與 thumb 不重疊（框與 thumb 的 bounding rect 沒有交集）；提示框仍在 viewport 內；拖曳中隨 thumb 跟隨；提示文字顏色／字級不變；放開後提示消失（`#zul_slidetip` 不存在）。
- **注意：** 位置由 JS 的 `zk(...).position(btn, 'before_start'|'end_before')` 設定，CSS 無法改基準，只能在 CSS 內補偏移。若 RED 發現偏移量取決於提示寬度（所以固定 px 補不了），先確認純 CSS 能否做到（例如以百分比位移）；做不到就停下回報（例外第 3 項）。**預設只量到中心對齊；Jess 說的 "check both horizontal & vertical" 解讀為水平與垂直兩種方向的 slider 各自對齊，並含文字在框內置中（R6 取最小解讀，留言時說明）。**

### #26 — slider knob mold：數字輸入框改 inline 樣式

- **解讀（R6，取最小）：** 比照框架的 inplace 輸入框（`input.css:201-210`：靜止時底色與邊框透明；ZK 在 focus 時移除 inplace class，回到一般輸入框外觀）。靜止時：無底色、無邊框、文字樣式不變；聚焦時：出現一般輸入框的聚焦外觀，讓使用者知道在編輯。
- **判定 J26-1（今天必須失敗）：** `slider.zul` 的 knob（`.z-slider-input`），靜止（未聚焦）時：輸入框矩形內部取樣（避開文字）與其外側緊鄰的背景色 ΔE ≤ 2；輸入框外緣一圈（1px）與外側背景 ΔE ≤ 2（沒有可見邊框）。
- **判定 J26-2：** 聚焦時：輸入框出現可見的聚焦指示，其顏色與一般 textbox 聚焦環的顏色一致（ΔE ≤ 3，比較 `z-textbox` 在同頁或相鄰預覽頁上聚焦時的環色），且與緊鄰背景對比 ≥ 3:1。**今天這項若已通過，記為保護項；若今天沒有聚焦指示，記錄後把「聚焦時回到一般輸入框外觀」列入修法。**
- **保護項：** 文字樣式不變（`color`、`font-weight`、`font-size`、`text-align`、`font-family` 計算值相同）；輸入框的位置與大小不變（±0px）；輸入數字後 Enter，knob 弧線與值更新（行為不變，用 curpos 或弧線像素判斷）；forced-colors 下輸入框仍可辨認（既有 forced-colors 套件通過）。

### #27 — rating：停用或唯讀時游標為 default

- **判定 J27-1（今天必須失敗）：** `rating.zul` 上每個 `readonly` 與每個 `disabled` 的 rating（水平與垂直都含）：星星中心、星星之間的間隙、外層 `.z-rating` 的任一內部點，`elementFromPoint` 的 computed `cursor` 皆為 `default`（或 `auto`）。
- **保護項：** (a) 可互動 rating 的星星中心游標 `pointer`（今天通過）。(b) 可互動 rating hover 時星星仍放大（`transform` scale）且已選星著色；readonly／disabled 不放大、不變色（`pointer-events: none` 行為不變）。(c) 點擊可互動 rating 仍會改變選取（行為不變）。(d) 星星間隙游標在可互動 rating 上**只記錄、不判定**（4px 熱區，Jess 沒有要求）。
- **範圍：** 只動游標；不碰 `iconSclass` 相關規則（`b2aa291a03` 已處理）。

### 回歸範圍

- Playwright 回歸套件：component-theming、forced-colors、chromium、tablet、hit-target、focus-scan。**已知既有失敗** `slider-tablet`、`calendar-tablet`（D42-A）不處理，仍須與今天相同的原因失敗。
- baseline 預期變動：`combobutton-gallery`、`slider-gallery`（knob、提示若在 gallery 內）、`rating-gallery`（游標不影響像素，預期**不變**）；`multislider`／`rangeslider` gallery 在靜止狀態預期不變。**任何預期之外的 baseline 變動都要歸因。**
- 8085 是共用資源：回歸前在證據報告首行宣告使用中。

### 第六批 RED run 結果與方法定稿（2026-10-08）

報告：[gates/batch6-red.md](gates/batch6-red.md)；證據 `gates/batch6-red/`。結論 `RED6: METHOD-DEFECTS`，下列修正由 Planner 裁定，**定稿後不再改**（取代上文對應措辭）。

**今天的實測（判定今天失敗＝RED-correct）：** #18 J18-1/2/3 失敗（hover 箭頭時亮的是標籤，filled 標籤 ΔE 6.88、箭頭 0；按住時標籤 10.37）；#19 失敗（箭頭 196 vs 標籤 224，ΔE 10.02，原因：`--zk-color-disabled-container` = `#0000001f` 半透明，content 與 button 各塗一層，button 疊在 content 上）；#24 J24-1/2/3 失敗（不會動的點 73–99% 全是 `pointer`；hover 單顆時所有 thumb 的環帶都亮 ΔE 5.0–5.5）；#26 J26-1 失敗；#27 J27-1 失敗（11 顆 rating 中 4 顆 readonly／disabled 全部 `pointer`，命中的是外層 `.z-rating`）。plain slider 整框 198/198 點都會動、hover 只亮單顆 → 不改。

**方法修正：**
1. **#18：** 保護項 (a)(b) 限定 filled。**新增判定 J18-4（今天必須失敗）：** toolbar mold，滑鼠停在標籤（及在標籤上按住）時，箭頭環帶 ΔE ≤ 1（今天 3.99／5.98）；J18-2 維持。
2. **#19：** J19-2 改為保護項（停用 toolbar 兩段仍同色，今天 ΔE 0，不得變）。判定只剩 J19-1。
3. **#22：** 寬度判定（J22-1 寬度、J22-2）今天全數通過 → **已涵蓋，不改程式碼**。顏色門檻改 ≤ 3（半透明邊框疊在不同底色上，ΔE 2.16／2.45 是必然）。停用 textbox 邊框較淡（ΔE 14）不在 Jess 截圖內，也不是「寬度」問題 → 記進 follow-up，不在本批。
4. **#24：** 「thumb 上」定義為距 thumb 中心 ≤ 10px（圓形，不用 rect）；格點區域 = root ∪ track；另加每個 mark label 與 mark dot 的中心（會動的點，游標可 `pointer`）。**新增保護項：** 今天「會動」的點（`z-sliderbuttons-area`、track、mark 元素）修正後游標仍是 `pointer`；停用 widget 的游標代理值維持 `auto`（元素是外層 div）。範圍說明：本批只調整 CSS 游標與 hover 環的範圍，**不把裸軌道變成可點**（那是 widget JS 的行為）。
5. **#25：** J25-3 改為保護項（今天文字已置中）。J25-1／J25-2 的做法見下一點。**結構性發現：** 提示框是 `body` 下的 `#zul_slidetip.z-slider-popup`，只有這個 class（加上使用者 sclass），**沒有方向 class**，所以 CSS 分不出水平或垂直 slider；水平需要 `translateX(calc(-50% + 10px))`，垂直需要 `translateY(-4px)`，同一條規則會讓另一個方向更歪。純 CSS 做不到 → 例外第 3 項（要動 `Slider.ts`），**本批 #25 暫停，不交 Generator，其餘照常**；選項在批末議題頁。
6. **#26：** J26-2 定為判定（今天失敗）：聚焦時輸入框外框 = 一般 textbox 聚焦環（`2px solid --zk-color-primary`，ΔE ≤ 3），不得使用瀏覽器預設 outline；且輸入框矩形與文字位置在 rest／focus 之間不位移（±0px）。J26-1 維持。
7. **#27：** 維持原判定。可互動星星間隙的游標記錄為 `pointer`（今天），修正後可以是 `default`，不判定。

### 第六批最終判定後的方法更正（2026-10-08，Planner 的錯誤，已揭露）

[gates/batch6-final.md](gates/batch6-final.md)：`GATE6-FINAL` 以字面值判為 FAIL，唯一未過的是 **J18-3 與 J18-4 的「按住」部分**（按住箭頭時標籤 10.37；按住標籤時 toolbar 箭頭 5.98）。這兩個數字在按住中 `blur()` 後變成 0，來源是 `:focus-within` 狀態層（滑鼠按下就取得焦點），不是 `:active`。
- **錯在方法：** RED run 時修正前 `:active` 與 focus 兩層都是 10.37，無法分辨，我誤寫成「來自 `:active`、修後可達成 ≤ 1」。而焦點狀態是 R6 明寫「不動」、保護項 (c) 要求維持的，所以純 CSS 下字面值不可能達到。不是 Generator 沒做到。
- **更正：** J18-3 與 J18-4 的按住部分，以**排除焦點層（按住中 blur 探針）**的值判定。依 Verifier 的數據：按住箭頭 → 箭頭 9.74／標籤 0；按住標籤 → toolbar 箭頭 0，皆符合。**這是定稿後的改動，原因是原方法對 `:focus-within` 的推論有誤，不是為了配合修法調整門檻；修法與判定值都沒變。**
- **未處理（follow-up）：** 按住時焦點層會讓整個標籤亮（hover 的同類現象，Jess 沒寫），若要消除需改焦點規則（例如只在 `:focus-visible` 顯示）。

### #25 更正與定稿（2026-10-08，使用者指出可由 slider 根元素的方向 class 判定）

**更正：** 上文「提示框沒有方向 class、純 CSS 做不到、列為例外第 3 項」不成立。提示框雖在 `body` 下，拖曳時按住的 thumb 是 `:active`，其祖先 slider 帶 `z-slider-horizontal`／`z-slider-vertical`，所以 `body:has(.z-slider-horizontal .z-slider-button:active)` 能判定方向。實測（8085，真實拖曳）：水平拖曳時 horizontal 條件成立、vertical 不成立，垂直相反，提示框都存在。**不需要改 `Slider.ts`，議題 D50 的議題頁作廢。**
**範圍：** 只改 `slider.css` 的 `.z-slider-popup`（提示框定位偏移）。plain slider 的 thumb、軌道不動。
**判定（沿用上文 J25-1／J25-2，RED 已量過今天失敗）：** J25-1 水平提示框中心與 thumb 中心水平差 ≤ 1px（文字「5」「50」「100」各量，default／sphere／scale 三種 mold）；J25-2 垂直提示框中心與 thumb 中心垂直差 ≤ 1px（default／sphere）。
**保護項：** 文字在框內置中（J25-3，今天通過）；提示框與 thumb 不重疊；仍在 viewport 內；隨 thumb 跟隨；放開後 `#zul_slidetip` 不存在；顏色／字級不變；plain slider 以外的 widget 的 `.z-slider-popup` 沒有被誤套（頁面上沒有拖曳時不受影響）。
**RED：** 不重跑。#25 的 RED 數字（批次 6 RED 報告）在 `.z-slider-popup` 規則未動的情況下仍有效；#26 對 `slider.css` 的修改只涉及 `.z-slider-input`。

## 第七批：selectbox 箭頭、listbox 捲軸欄位藍條（#29 #3）

> 來源：A 線 [lines/line-a-plan.md](lines/line-a-plan.md)，2026-10-08 合併時逐節搬入，內容未改寫（僅標題改為本文件編號）。D52–D55 的裁示見決策原則第七節索引。


### 共用量法

- 頁面：`${PREVIEW_URL}/{selectbox,bandbox}.zul`，`PREVIEW_URL=http://localhost:8085`；viewport 1280×900；量之前注入 `*{transition:none!important;animation:none!important}` 並等 `document.fonts.ready`。
- 色塊與像素比較沿用第 6 批慣例：矩形取平均色，ΔE（CIE76 以上）≥ 2 視為有變化、≤ 1 視為沒變化；**不讀 CSS**，不依賴特定寫法。
- 預覽站 DOM id 是 uuid，用 class 選取；selectbox 的 `::picker-icon` 是偽元素，**只能用像素量**。
- 證據報告首行宣告「使用 8085」；量測前確認伺服的是新 build（比對 `.css.dsp`／`zk.wcs`），必要時重啟。
- Verifier 不看 CSS diff；Generator 為 Sonnet；最終判定用 Fable（D35）。

### #29 — selectbox 箭頭比例

Jess 的描述：箭頭「看起來比例不對」，參考圖是 MD3 的小型實心三角（`arrow_drop_down`，方向不管）。現況原始碼：`selectbox.css:98-102` 的 `::picker-icon` 沒有設圖形，用的是瀏覽器內建的 ▼ 字元，只調了 `font-size:16px` 與顏色；同族的 combobox 下拉箭頭是 `chevron-down.svg` 遮罩、14px（`combobox.css:63-77`）。

- **量法：** 以像素量箭頭的 ink 範圍。對 `selectbox.zul` 預設狀態的 selectbox，取控制項右側 40px 內、扣掉 1px 邊框後，與底色 ΔE ≥ 8 的像素外接矩形，得到箭頭的寬、高、垂直中心、右緣距控制項外緣。同頁或 `combobox.zul` 取 combobox 箭頭同樣量一次，當同族基準。另量 Jess 參考圖的箭頭做「MD3 基準」記錄（10×5 dp 的三角，在 1x 的 ink 約 10×5px）。**以上數字 RED 全部記錄。**
- **判定 J29-1（今天預期失敗）：** 箭頭 ink 的高寬比與面積落在同族基準 ±25%（以 combobox 的 chevron 為準；若 D52 裁示改用 MD3 實心三角，則改以 MD3 基準量）。**RED 若發現今天已經落在範圍內，代表量錯或她看到的不是這個狀態，退回 Planner。**
- **判定 J29-2（今天預期失敗）：** 箭頭 ink 的垂直中心與控制項（含邊框）的垂直中心差 ≤ 1px；右緣距控制項外緣與 combobox 的箭頭差 ≤ 2px。
- **保護項（今天必須通過）：** (a) selectbox 外框的寬、高與今天相同（±0px）；(b) 選取文字的左緣與垂直位置相同（±0px）；(c) hover、focus 外觀不變（邊框色、聚焦環取樣相同）；(d) disabled 的透明度與底色不變；(e) 打開選單（`:open`）時箭頭仍旋轉 180°（旋轉後的 ink 外接矩形與未旋轉者鏡像相符）；(f) forced-colors 套件通過，箭頭在 forced-colors 下仍可辨識；(g) 非 `base-select` 瀏覽器的後備路徑（`background-image` 的 `chevron-down-gray.svg`）不動，也不得引入重複的第二個箭頭。
- **範圍（R6、R9）：** 只動箭頭的圖形與尺寸；不改選項清單、popup、`:open` 的動畫。
- **預期的例外（RED 後視數據決定是否開議題）：** 她附的參考圖是**實心三角**，框架內同族（combobox、bandbox 的下拉鈕）用的是 **Lucide chevron**。這就是原則 1（MD3）與原則 2（框架一致）可能互相衝突的情形，**不自行決定**。RED 先量出三者的 ink 數字；若「縮小並對齊成 chevron」就能讓高寬比與位置落在 MD3 基準的 ±25% 內，則不衝突、直接修；若兩者形狀差異本身就是她的訴求，列為例外第 1 項，以議題頁問（D52）。

### #3 — bandbox 的 listbox 右側藍條

Jess 的描述：bandpopup 內的 listbox，右側有一條「怪怪的藍條」（截圖中是表頭右端、捲軸上方的一小塊淡藍色欄位，與捲軸軌道的灰色不同色）。頁面：`bandbox.zul` 的「Bandpopup with Rich Content (Listbox)」區（`listbox height="180px"`）。

- **R6 最小解讀：** 表頭列右端、與垂直捲軸同一欄位的那一格，顏色應與表頭其他部分一致（不是獨立的藍色塊）。
- **量法：** 在重新載入的頁面點開該 bandbox 的按鈕，等 popup 顯示。找出垂直捲軸欄位的 x 範圍（以 `.z-listbox-body` 的 `offsetWidth - clientWidth` 與右緣推得），在表頭列的 y 範圍內取該欄位的平均色，與表頭列內兩個欄位之間的空白處平均色比較 ΔE。**RED 先用 `elementsFromPoint` 找出這塊是哪個元素、哪條規則上的色，記入報告。**
- **判定 J3-1（今天預期失敗）：** 表頭列右端欄位與表頭其他部分的 ΔE ≤ 2。**RED 若今天已通過，退回 Planner（她看到的不是這個狀態）。**
- **判定 J3-2（今天預期失敗，若 RED 證實有第二個藍色塊才適用）：** popup 內 listbox 區域沒有其他與周圍 ΔE ≥ 4 且色相偏藍的直條。
- **範圍規則（避免擴大）：** RED 要同時在 `listbox.zul` 找一個**同樣有垂直捲軸**的 listbox，量相同位置。
  - 若**只有 bandpopup 內**才有 → 修在 bandbox／bandpopup 的 CSS，本批處理。
  - 若**一般 listbox 也有** → 這個缺陷屬於 listbox 元件，修在 `listbox.css` 會改變所有 listbox 的外觀（超出 issue 所述範圍）→ **例外第 4、9 項，停下來問**（D53）。
- **保護項（今天必須通過）：** (a) 捲軸的軌道與滑塊色、寬度不變（沿用 D40-A、D43-A 的基準）；(b) 表頭欄寬與 body 欄寬逐欄對齊（±0px）；(c) popup 的陰影、邊框、圓角、`min-width` 不變；(d) listbox 的列 hover、選取色不變（`secondary-container`，D10-A）；(e) popup 外框尺寸與位置相同（±0px）；(f) 其他 bandbox 例子（`Content` 純文字）外觀不變。

### 回歸範圍（第 7 批）

component-theming、hit-target、focus-scan（該批元件）；forced-colors（selectbox 動到顏色與圖形時跑）；gallery：`selectbox`、`bandbox`（以及若動到 `listbox.css` 才加跑 listbox 的 gallery）。chromium、tablet 全項只在合併後於 `marble` 跑一次（平行線文件第八節）。已知失敗 `calendar-tablet`、`slider-tablet`、`grid-header-gallery` 不計。
baseline 預期變動：`selectbox-gallery`（箭頭）；`bandbox-gallery` 若只有展開狀態才含 popup，靜止畫面預期**不變**。任何預期外的 baseline 變動都要歸因。

### 第 7 批 RED run 結果與方法定稿（2026-10-08）

報告 [../gates/batch7-red.md](gates/batch7-red.md)，證據 `gates/batch7-red/`，結論 `RED7: METHOD-DEFECTS`。8085 伺服的是現行 build（`.css.dsp` md5 與 build 檔相同），未重啟。

**今天的實測：**

- #29：selectbox 箭頭 ink 11×9px（面積 53.75，垂直中心差 +0.5，右緣距 12.77）；同族 combobox chevron 8×5（面積 15.5，右緣距 12.08）；MD3 參考圖是 4×8 的實心三角（名目 10×5）。位置今天就對，**失敗的只有尺寸**：外框 w/h 比 chevron 大 +37.5%／+80%。
- #3：藍條就是 **`th.z-listhead-bar`**（捲軸欄位對應的表頭格），`background-color: rgb(240,244,250)`，6×53px；表頭其餘為白，ΔE 5.18。**一般 listbox 也有**（`listbox-header.zul` 第 9 個，同元素同色同 ΔE）→ 依範圍規則觸發例外，**D53**。沒有第二個藍塊，J3-2 不適用。
- 環境：Playwright headless 預設 `--hide-scrollbars`，捲軸欄寬 0，藍條畫不出來（gallery baseline 也看不到，所以 gallery 不會替這項把關）。量這項必須 `ignoreDefaultArgs:['--hide-scrollbars']`。

**方法修正（定稿後不再改）：**

1. **J29-2 改為保護項**：今天就通過（中心差 0.5、右緣距差 0.69），修後不得退步。
2. **J29-1 改量外框**，不比 ink 面積（實心三角與空心 chevron 的面積不可比）：箭頭 ink 外框的寬與高各與基準的差 ≤ 25%。**基準由 D52 裁示決定：** 選項 A（chevron）→ combobox 的 8×5；選項 B（實心三角）→ MD3 名目 10×5。今天兩者皆失敗。
3. **保護項 (e)** 旋轉後的 ink 與未旋轉者鏡像，容差：外框 ±0.5px、垂直中心 ±1px。
4. **J3-2 刪除**（不適用）。**J3-1 維持**：捲軸欄位那一格與表頭其餘部分 ΔE ≤ 2，必須在有佔寬捲軸的環境量（見上）。
5. **#3 保護項補一項：** 一般 listbox（`listbox-header.zul` 第 9 個）與 bandpopup 內的 listbox 同步修好，兩處都量。
6. **最終 run 與 baseline：** 量 #3 時拿掉 `--hide-scrollbars`；因 gallery 看不到，另存兩張有捲軸的證據截圖（修前、修後）當 Jess 留言與基準。
7. **(g) 後備路徑**只能用 Firefox 驗（已裝）；WebKit 也支援 base-select，不當後備驗證。

**等待裁示（議題頁，標 `[A]`）：** D52（#29 箭頭形狀：chevron 或實心三角）、D53（#3 修 `listbox.css`，影響所有 listbox 的捲軸欄位）。裁示前，第 7 批不交 Generator；第 8 批方法與 RED 照常進行（平行線文件第九節：各線自己等待）。


## 第八批：menubar 與 navbar（#48 #49 #51）

> 來源：A 線 [lines/line-a-plan.md](lines/line-a-plan.md)，2026-10-08 合併時逐節搬入，內容未改寫（僅標題改為本文件編號）。D52–D55 的裁示見決策原則第七節索引。


> 方法在第 7 批結束後、本批開工時才寫（原則：一批一批寫）。以下只是已掌握的事實與預測，**不是定稿**。

- **#48（menubar 項目未對齊）：** Jess 的截圖是 File 展開後的 popup，紅線落在 New／Save／Exit 文字的左緣，`Open`（一個 `z-menu`，不是 `z-menuitem`）的文字看起來略偏左。預測：popup 內的 `.z-menu-content` 與 `.z-menuitem-content` 兩套規則（`menu.css:315-340` 與 `:442-460`）padding 相同，但**圖示欄**的寬度不同（`z-menuitem-image` 16px、iconSclass 18px、submenu 的 `z-menu-image`），造成文字起點不一致。RED 量每一列文字 ink 的左緣。
- **#49（menubar 項目前多餘空白）：** 截圖是 View 選單，兩個 `checkmark="true"` 的項目都沒有被勾選，左側留了一整欄。原始碼（`menu.css:400-412`）是**刻意保留**勾選欄：`visibility:hidden` 預留位置，勾選時才顯示，避免切換時文字位移。看板備註「likely a reserved icon column — real tradeoff」。這是「MD3 的版面穩定」與「Jess 看到的多餘空白」的取捨；RED 先量實際空白寬度，再決定是否為例外（第 1 項，D54）。
- **#51（navbar 子項未縮排）：** 原始碼 `nav.css:198-200` 只替 `.z-navitem-content` 縮排（固定 `calc(16px + 26px)`），**沒有處理巢狀的 `.z-nav-content`**，所以 Contact 底下的 Settings（也是 `z-nav`）與它的父層同一縮排；第三層的 navitem 也不會再多縮一階。看板備註說「needs a depth class from ZK」，但巢狀結構 `.z-nav > ul > .z-nav > ul` 本身就能用祖先選擇器區分層級，**預測純 CSS 可行**（宣告「做不到」之前先查，見決策原則第六批教訓）。同時要涵蓋 collapsed 的 `.z-nav-popup`（Jess 第二張圖）。檔案在 zkcml，**提交順序 zkcml 先**。

### 第 8 批方法（2026-10-08，RED 前草案；RED 後依第 7 批慣例定稿）

**共用量法：** 頁面 `/menubar.zul`、`/navbar.zul`，viewport 1280×900，關閉 transition 並等 `document.fonts.ready`；每個狀態重新載入頁面。量「位置」一律用文字 ink 左緣與圖示 ink 左緣（`Range.getBoundingClientRect()` 或像素），不讀 CSS。證據報告首行宣告使用 8085。**捲軸欄位那題的教訓：Playwright 預設 `--hide-scrollbars`，量到與捲軸有關的版面時要 `ignoreDefaultArgs:['--hide-scrollbars']`。**

**#48 — menubar popup 項目對齊（R6 最小解讀：同一個 popup 內，所有列的文字起點一致）**
- 量法：`menubar.zul` 第一個 menubar 的 Project 與 File（iconSclass 版）展開，對 popup 內每一列（`z-menuitem`、`z-menu`、停用列）量文字 ink 左緣與圖示 ink 左緣；有 `image` 的列與有 `iconSclass` 的列、純文字列分別記錄。再展開 `About` 子選單同樣量。RED 先記錄 Jess 截圖那個 popup 是哪一種混合。
- J48-1（今天預期失敗）：同一個 popup 內，**有圖示的列**文字左緣互差 ≤ 1px；圖示左緣互差 ≤ 1px（`z-menu` 列與 `z-menuitem` 列要相同）。若今天通過，代表 Jess 看到的是另一種混合，退回 Planner。
- 保護項：列高、列間距不變（±0px）；hover／選取狀態層色不變；右側子選單箭頭位置不變；圖示尺寸（`image` 16px、iconSclass 18px）不變；停用列透明度不變；水平 menubar 頂層項目位置不變。
- **範圍：** 只對齊文字起點。圖示欄寬統一（例如讓 16px 的 image 與 18px 的 iconSclass 佔同寬）是可能的修法，但是否採用由 RED 數字決定；若需要統一圖示尺寸則超出 issue，列為例外第 4 項。

**#49 — menubar 勾選欄的多餘空白**
- 量法：`View` 選單（`checkmark="true"`，兩項皆未勾選）展開，量文字左緣距 popup 內緣的距離；對照同 popup 內無 checkmark 的選單（如 File）與一個已勾選項的版面。
- **這是版面穩定與視覺空白的取捨，不是缺陷，RED 後用 D54 問。** 事先備好的選項：A 保留（回覆 Jess：勾選時文字不位移是 MD3 的做法，附前後截圖），B 當整個 popup **沒有任何已勾選項**時收掉那一欄（`:has()`；代價：第一次勾選時文字右移，版面跳動），C 把預留欄縮窄。RED 只量數字，不先修。

**#51 — navbar 巢狀縮排**
- 量法：`navbar.zul` 第一個垂直 navbar（Contact → Settings → 三個子項，共三層），展開 Contact 與 Settings，量每一列**文字 ink 左緣**；再切 collapsed 與 popup（`.z-nav-popup`）同樣量。
- J51-1（今天預期失敗）：第二層的 nav 群組標題（Settings）文字左緣比第一層（Contact）大 ≥ 12px；第三層項目（Edit profile…）比第二層項目（Reply…）大 ≥ 12px（每一層縮排一致，容差 ±1px）。
- J51-2（今天預期失敗）：popup 模式（collapsed 展開或 `z-nav-popup`）同樣逐層縮排。
- 保護項：第一層位置不變；項目高度不變；hover／選取的狀態層仍是整列滿寬（狀態層矩形左右緣與 navbar 內緣相同，不因縮排縮短）；展開箭頭位置不變；badge 位置不變；collapsed 模式下第一層圖示位置不變；水平 navbar 不變。
- **預測（RED 驗）：** 純 CSS 可做，以巢狀祖先選擇器逐層縮排，不需 ZK 的深度 class。

**回歸：** component-theming、hit-target、focus-scan、forced-colors（navbar 動到顏色才跑）；gallery `menubar`、`navbar`。

### 第 8 批 RED run 結果與方法定稿（2026-10-08）

報告 [../gates/batch8-red.md](gates/batch8-red.md)，證據 `gates/batch8-red/`，結論 `RED8: METHOD-DEFECTS`。8085 當時伺服的是現行 build。

**今天的實測：**

- **#48：** Jess 截圖是第二個 menubar 的 File popup（三個 `menuitem iconSclass` 加巢狀 `z-menu`「Open」）。文字 ink 左緣 New 92、Open **86.5**、Save 91.5、Exit 92，Open 偏左 5.5px。原因：`z-menu` 列的 `<i>` 盒寬 13px，`z-menuitem` 的是 18px。另一種混合（Project popup 的 `image` 16px 與 iconSclass 18px）也有 2–2.5px 差；純文字列、同種列、停用列都 ≤ 1px。
- **#49：** View popup 的預留勾選欄讓文字距內緣 40px，同 popup 內純文字列是 16px，多 24px；勾選後文字位移 0px（這就是預留的目的）。
- **#51：** 展開式 L1 文字 74.5、L2 item 101、**L2 nav（Settings）74.5（與 L1 相同）**、**L3 item 101（與 L2 相同）**。巢狀 DOM `.z-navbar > ul > li.z-nav > ul > li.z-nav > ul > li.z-navitem` 可純靠祖先選擇器分層，**不需要 ZK 的深度 class**（預測成立）。collapsed popup：L3 比 L2 多 66px，但那是瀏覽器預設的巢狀 `ul` 樣式（`list-style: circle`、`padding-left: 40px`）造成，列前還有圓點，L3 的 hover 狀態層沒有觸及 popup 內緣。

**方法修正（定稿後不再改）：**

1. **J48-1 範圍：** 只判 Jess 截圖的混合（`menuitem iconSclass` 與巢狀 `z-menu` 同一 popup）：文字 ink 左緣互差 ≤ 1px。圖示改量 **ink 中心**（互差 ≤ 1px），不量 ink 左緣（同種三列就差 2px，受字形側邊距影響）。`image` 與 iconSclass 的 2px 差**只記錄、不判定、不修**（R6、R9），列入 follow-up。
2. **J51-1 維持**（展開式逐層縮排，每層 ≥ 12px、容差 ±1px，今天兩個差皆 0）。
3. **J51-2 重寫（popup，今天三條皆失敗）：** (a) popup 內 L3 項目文字比 L2 項目多 12–30px；(b) popup 內巢狀列沒有 bullet、列框與 L2 同左緣；(c) L3 hover 狀態層左右緣與 popup 內緣相同（滿寬）。
4. **保護項補充：** 「狀態層滿寬」對展開式三層與 popup L2 今天通過，不得退步；popup L3 的滿寬併入 J51-2(c)。第一層位置、列高、箭頭、badge 不變；navbar 展開後寬度變動屬內容撐開，比對要在同一狀態。
5. **#49：** 只記數字，不修，等 D54。


### A 線狀態紀錄（批次 7、8）

| 日期 | 事項 | 結果 |
|---|---|---|
| 2026-10-08 | 開工：讀三份規則文件、五個 issue 原文與截圖、對應 CSS；寫第 7 批方法草案 | 本文件 |
| 2026-10-08 | 第 7 批 RED run：RED7 METHOD-DEFECTS，方法定稿；D52、D53 開議題頁 https://claude.ai/artifact/YEmniKT1wYojgm4p9LUHKF 等裁示 | gates/batch7-red.md |
| 2026-10-08 | 第 8 批方法草案寫入，派 RED run | 見第三節 |
| 2026-10-08 | 使用者裁示 **D52-A**（selectbox 箭頭改為同族 chevron 8×5，基準為 combobox）、**D53-A**（改 `listbox.css`，所有 listbox 的 `th.z-listhead-bar` 與表頭同色）。#3 檔案所有權確認為 `zul/.../sel/css/listbox.css`。派 Generator。 | 第 7 批進入實作 |
| 2026-10-08 | 第 7 批 Generator 完成並通過範圍檢查（selectbox.css、listbox.css）；第 8 批 RED run 完成並定稿；8085 已重啟載入第 7 批 build | gates/batch7-gen.md、gates/batch8-red.md |
| 2026-10-08 | 使用者裁示 **D54-A**：#49 保留預留勾選欄，不改 CSS；留言說明並附前後截圖（勾選前後文字位移 0px）。#49 以「已回覆、無程式碼變更」計入看板，需要使用者同意婉拒（已同意）。 | https://claude.ai/artifact/CiepA68xEkvLN5zdzEXw3Y |
| 2026-10-08 | 第 7 批最終判定 `GATE7-FINAL: FAIL`（只差 #29 保護項 (f)：forced-colors 下新箭頭消失，原因是 mask 以 background-color 上色，forced-colors 會把它變成 Canvas）。修正：在 `selectbox.css` 內加 `@media (forced-colors: active)` 把 `::picker-icon` 設 `CanvasText`（與 combobox 的 `_forced-colors.css` (2e) 同法）。**未動共用檔 `tokens/_forced-colors.css`；合併時可考慮把這一條移進去（follow-up）。** 同時 build 第 8 批 CSS，重啟 8085，重跑第 7 批 forced-colors 項與第 8 批最終判定。 | gates/batch7-final.md |
| 2026-10-08 | 第 7、8 批複驗通過（`GATE7-FINAL-R2: PASS`、`GATE8-FINAL: PASS`）；D55-B 後重生 selectbox 三張 baseline；提交 zkcml `ae9e58ace`、zk `c86505884b`、證據 `be097ba277`；五則 Jess 留言已貼（#29 #3 #48 #49 #51），截圖在追蹤 repo `screenshots/batch7/`、`batch8/` | gates/batch7-comments.md、gates/batch8-comments.md |

## 第十一批：C 類容器（#53 tabbox accordion、#54 panel、#55 window、#57 borderlayout）

建立日期：2026-10-08。決策編號從 **D56** 起（尚未使用）。議題頁標題加 `[A]`。證據 `gates/batch11-*`，截圖 `screenshots/batch11/`。

### 環境與所有權（開工前核對，2026-10-08）

- 工作樹：`zk` 有**不屬於本批**的未提交修改 `zul/.../sel/css/tree.css`（treecell align）與 `zul/.../wgt/css/button.css`（outlined／text 色彩變體的 `box-shadow`，看似 B 線 #4 的內容）；`zkcml` 有 `.gitignore`、`lib/spel2js/package-lock.json`、`zk85themebuilder/`。**都不在本批檔案內，不碰、不暫存**（逐路徑暫存）。B 線 worktree `ZK10/jess-b/zk` 在 `jess/line-b`，本批四個 issue 的檔案與 B 線批次 9、10 的清單（messagebox、runtime-error、loading、errorbox、button、calendar、label、fisheyebar、portallayout）沒有重疊。
- 8085：java pid 77212 在聽；本 session 沒有 Verifier 在量，RED 前不需重啟（RED 先比對 `.css.dsp`／`zk.wcs` 確認伺服的是現行 build）。

| 線 | 批次 | issue | 預計動到的檔案 |
|---|---|---|---|
| A | 11 | #53 tabbox accordion | `zul/src/main/resources/web/js/zul/tab/css/tabbox.css`（只動 `.z-tabbox-accordion` 區段） |
| A | 11 | #54 panel | `zul/.../wnd/css/panel.css` |
| A | 11 | #55 window | `zul/.../wnd/css/window.css`（`.z-window-move-ghost`） |
| A | 11 | #57 borderlayout | **預覽頁** `zkpreview/src/main/webapp/web/borderlayout.zul`（見下：預測為 DEMO，不改 `borderlayout.css`） |

四個都在 `zul`，**本批沒有 zkcml 檔案**。預覽頁屬於本線：`tabbox.zul`、`panel.zul`、`window.zul`、`borderlayout.zul`。共用檔案一律不動。

### 已掌握的事實（開工前讀原始碼與 issue 原圖，RED 驗，不照單全收）

- **#53：** 原圖（accordion 的 Tab1 標題）。`tabbox.css:576-590` accordion 的 `.z-tab` 用 `body-large` 字級＋`title-small` 字重、**沒設 line-height**；水平 mold 的 `.z-tab`（`:89-91`）用 `label-large` 的字級、字重、行高。Jess 的標題是「text & icon style looks very different from others」，內文只寫「Font-size & font-weight, etc.」。chevron 是用 `border-right/bottom` 畫的旋轉方塊（`:666-676`），不是同族的 chevron 遮罩（D52-A）。
- **#54：** 原圖是同一頁並排 `border="rounded"`（紅框，無外框）與 `border="normal"`（有框）。**根因（原始碼）：** `Panel.ts:1026` `_bordered()` 對 `rounded` 回 false → `domClass_` 加 `z-panel-noborder`（`:1299`）；`panel.css:159-162` `.z-panel-noborder { border:none; box-shadow:none }`。`rounded` 同時沒有 `z-panel-noframe`（`:1307` 只在非 rounded 時加），所以 `.z-panel-noborder:not(.z-panel-noframe)` 剛好只選到 `rounded`／`rounded+`，與 `border="none"`（noborder＋noframe）分得開。看板「`panel.css:17` 其實有設 border」是對的，但被 `:159` 蓋掉（同為 class 選擇器，後寫者勝）。
- **#55：** 原圖是 GIF（70 幀）。拖曳中 `Window.ts:50-77` 建 `#zk_wndghost.z-window-move-ghost`（內容只有空的 `<dl>` 與複製來的標題列），原視窗 `visibility:hidden`。`window.css:205-209` 對整個 ghost 設 `opacity:0.5`＋focus-ring outline，所以**複製的標題列也被淡成一半**，ghost 本身沒有底色，後面的頁面內容直接透出來。
- **#57：** 原圖紅框是 North／South 的裸文字，藍框是 West／East／Center 有 padding。**預覽頁 `borderlayout.zul` 的 West／East／Center 內容都包了 `<div sclass="z-p-4">`，North／South 沒有**；`borderlayout.css` 的 `.z-north-body`／`.z-west-body` 都沒有 padding，頁首註解也寫明「ZK layout primitives have NO default padding by design」。預測屬 **DEMO（R5）**，不改 theme。預覽頁中 North／South 沒有任何貼邊 toolbar 的例子。

### 共用量法

- 頁面 `${PREVIEW_URL}/{tabbox,panel,window,borderlayout}.zul`，`PREVIEW_URL=http://localhost:8085`；viewport 1280×900；量之前注入 `*{transition:none!important;animation:none!important}` 並等 `document.fonts.ready`；每個狀態重新載入頁面。
- 色塊與像素比較沿用慣例（平均色、ΔE ≥ 2 有變化、≤ 1 沒變）；位置用 ink 或 `getBoundingClientRect()`，computed style 只用來**讀字級、字重、行高、opacity 這類沒有像素替代的值**，不依賴特定 CSS 寫法。
- 證據報告首行宣告「使用 8085」；量測前比對 `.css.dsp`／`zk.wcs`。Verifier 不看 CSS diff，最終判定用 Fable（D35）。Playwright 量版面時一律 `ignoreDefaultArgs:['--hide-scrollbars']`（本批沒有捲軸題，但環境要像使用者的）。

### #53 — accordion 標題的字型與圖示（R6 最小解讀：標題字型與水平 mold 的 tab 一致）

- **量法：** `tabbox.zul` 的 accordion 區（第 438、457 行兩個 `mold="accordion"`）與同頁的水平 tabbox。取：水平 tab 的文字（未選取、已選取）、accordion 標題的文字（未選取、已選取、disabled）的 `font-size`、`font-weight`、`line-height`（computed）；再用像素量文字 ink 高度（x-height 或大寫字高）當交叉驗證。另量 accordion 右側 chevron 的 ink 外框（寬、高、右緣距標題右內緣）與同族 combobox chevron（`combobox.zul`，基準 8×5、右緣距約 12px，D52-A）；水平 tabbox 若有圖示也記錄尺寸。**RED 全部記錄，並重現 Jess 的畫面（Tab1 已選取＋展開）。**
- **判定 J53-1（今天預期失敗）：** accordion 標題文字的 font-size、font-weight、line-height 與水平 tab 同狀態的值**完全相同**（computed 字串相等），像素 ink 高度差 ≤ 1px。**RED 若發現今天已相等，代表她看到的不是字型（或值在別處被蓋掉），退回 Planner。**
- **圖示的事先判準（RED 後套用，不事後再挑）：** 量 accordion chevron ink 的寬與高。若各與同族 8×5 基準相差 ≤ 25% → 圖示視為與同族一致，**不改**，留言只講字型；若任一邊超過 25% → 圖示列入本批：改用與 D52-A 相同的 chevron 遮罩（8×5），並補 `@media (forced-colors: active)` 的 `CanvasText`（決策原則第七節）；此時 J53-2 = 「chevron ink 外框的寬、高各與 8×5 差 ≤ 25%，垂直中心與標題中心差 ≤ 1px」。改圖示會改變 accordion 的預設外觀範圍（原則第五節第 4 項），**若 RED 顯示需要改圖示，先開議題頁問（D56）再交 Generator。**
- **保護項（今天必須通過）：** (a) accordion 各標題列高（含展開／收合、disabled）不變（±0px）；若字型改變使行高改變，記錄差值，容許 ≤ 2px 並在報告標出（`min-height: --zk-tab-height` 通常吸收）；(b) 標題文字左緣、chevron 右緣位置不變（±0px，字寬變小不算）；(c) 已選取／hover／disabled 的底色與文字色、狀態層不變（ΔE ≤ 1）；(d) 展開內容（`-cave`）的字型、padding 不變；(e) 水平、垂直 mold 的 tab 完全不變（像素比對）；(f) 展開、收合動畫仍能完成（`jq.slideDown` 不卡在 0 高，見 `tabbox.css:540-545` 註解）。
- **範圍（R9）：** 只動 `.z-tabbox-accordion .z-tab`（字型）；不改顏色、padding、間距、動畫。

### #54 — `border="rounded"` panel 沒有外框（R6 最小解讀：外框 1px 回來，其他不動）

- **量法：** `panel.zul` 中所有 `border="rounded"` 的 panel（第 12、24、66、90、125 行附近，含無標題、collapsed 的版本）與同頁 `border="normal"`、`border="none"` 各一個。每個 panel 取外框 4 邊（外緣內 0.5px 的線）、4 個圓角像素、陰影帶（底邊外 1–6px 的平均色）與頁面背景的 ΔE；量外框尺寸、head 與 body 的位置與分隔線。**RED 先確認 `rounded` 的 root class 含 `z-panel-noborder` 且不含 `z-panel-noframe`（對照 `border="none"` 兩者皆有），記入報告。**
- **判定 J54-1（今天預期失敗）：** `border="rounded"` 的 panel，4 邊外緣線與頁面背景的 ΔE ≥ 6，且與同頁 `border="normal"` panel 的外框色 ΔE ≤ 3。
- **判定 J54-2（今天預期通過，修後不得退步）：** `rounded` 的圓角仍在（左上角外緣的角落像素與頁面背景相同、與 `normal` 的方角不同）。
- **記錄、不判定（R6、R9）：** `rounded` 的陰影與 head 分隔線今天都沒有；`normal` 有。最小解讀只還外框；陰影與 head 分隔線**只記數字，不修**。ZK 語意上 `rounded` 是「圓角外框、沒有內框」，head 分隔線屬於內框，所以不回；陰影屬 Jess 沒提，列 follow-up。
- **保護項：** (a) `border="normal"` 與 `border="none"` 的外框、陰影、尺寸像素不變（ΔE ≤ 1、±0px）；(b) `rounded` 的 panel 外框盒子尺寸（含邊框）不變（`box-sizing:border-box`，±0px）；內容區因邊框內縮 1px 屬預期，記錄；(c) 標題、icons、toolbar、body 的文字與 icon ink 位置移動 ≤ 1px；(d) collapsed 的 `rounded` panel 仍收合、有外框；(e) 無標題的 `rounded` panel（`noheader`）也有外框；(f) forced-colors：外框用 `border`，不依賴 background，確認 forced-colors 下 `rounded` panel 外框可見；(g) 拖曳／縮放的 ghost 外觀不變。
- **範圍：** 只改 `panel.css`。`.z-window-noborder` 是否有同樣問題（Window 的 `border` 只有 none／normal）只查不改。

### #55 — window 拖曳 ghost 的透明度（R6 最小解讀：ghost 的標題列不被淡化；其餘不動）

- **量法：** `window.zul` 的 overlapped 視窗（`position="right, top"` 的 Overlapped，Jess 的 GIF 那一個）。用 Playwright `mouse.down` 在標題列、`mouse.move` 80px 並**按住不放**，此時 `#zk_wndghost` 存在。取：(a) ghost 內標題列文字 ink 最暗像素的顏色，與同一視窗閒置時標題文字 ink 最暗像素比較 ΔE；(b) ghost 及其子孫節點的 computed `opacity`；(c) ghost 的 outline 色與寬度、尺寸、位置；(d) ghost 內部（標題列以下）的像素：透出多少背後頁面。**同時對 `panel.zul` 的可拖曳 panel（`border` 有 `rounded` 者、`draggable`）做同一個拖曳，記錄 panel 的 ghost 是否同樣淡化（`.z-panel-move-ghost`，`panel.css:179-183`）。**RED 要重現 Jess 的畫面（標題列淡、後面內容透出）。
- **判定 J55-1（今天預期失敗）：** 拖曳中 ghost 標題文字 ink 最暗像素與閒置標題文字 ink 的 ΔE ≤ 3（即文字沒有被淡成一半）。
- **判定 J55-2（今天預期失敗）：** ghost 及其所有子孫的 computed `opacity` 皆為 1。
- **保護項：** (a) ghost 的 focus-ring outline 仍可見（outline 色與寬度不變，ΔE ≤ 1）；(b) ghost 的尺寸、位置、`z-index` 不變（±0px）；(c) 拖曳結束後視窗落在 ghost 的位置（位移 ±1px）；(d) 閒置、最大化、`mode="modal"`／`highlighted` 的視窗外觀不變；(e) sizable 的縮放（`#zk_ddghost.z-window-resize-faker`）不變；(f) forced-colors 下 ghost 的外框仍可見。
- **範圍（R9）：** 只動 `.z-window-move-ghost`。ghost 內部是否要有底色（今天透出背景）是 Jess 沒寫的設計選擇，**RED 只記錄；若最小解讀（標題不淡化）重現後仍不能解決她看到的「內容變透明」，列為例外第 6 項（D56）**。panel 的 ghost 若同樣淡化，列 follow-up，不在本批改（`panel.css` 本批只為 #54 動，R9）。

### #57 — North／South 內容缺少 padding（預測 DEMO，R5）

- **量法：** `borderlayout.zul` 全頁（目前 North／South 有裸文字的例子在第 23–27、38–39、51–52、80–101 行附近；RED 以頁面實測為準，逐一列出每個 borderlayout 的 N／S／W／E／C 內容）。每個區域取「內容文字 ink 左緣距該區域 body 左內緣」。同時用 `elementsFromPoint` 確認 West／East／Center 的 padding 來自哪個元素（預期：預覽頁的 `div.z-p-4`，不是 theme 的 `.z-west-body`）。再搜尋預覽站其他頁面（`*.zul`）有無 `north`／`south` 內放貼邊 toolbar 的用法，作為「若改 theme 會被弄壞」的證據。
- **判定 J57-1（今天預期失敗）：** 同一個 borderlayout 內，North／South 內容文字的左緣偏移與 West／East 內容一致（容差 ±1px），涵蓋頁面上所有 N／S 有文字的 borderlayout。
- **判定 J57-2（今天預期通過，修後不得退步）：** 修後 `borderlayout.css` 未被修改；`.z-north-body`／`.z-south-body` 的 computed padding 仍為 0（證明沒有把樣式加進 theme）。
- **保護項：** (a) 各區域外框、splitter、標題列位置不變（±0px，N／S 高度由 size 決定，內容改變不得撐高）；(b) West／East／Center 不變；(c) `border="none"` 例子與 Auto Scroll 例子的捲動行為不變；(d) 其他頁面不受影響（本批只改 `borderlayout.zul`）。
- **為什麼不改 theme：** 若在 `.z-north-body`／`.z-south-body` 加 padding，所有使用者的 North／South 都會多出 padding，貼邊的 toolbar、menubar 會離開邊緣（改變預設外觀範圍，原則第五節第 4 項）；West／East／Center 本來就沒有 padding，是預覽頁自己包了 `z-p-4`，所以兩邊不一致只是 demo 的不一致。留言要老實說明，並附前後截圖。

### 回歸範圍（第 11 批）

component-theming、hit-target、focus-scan（tabbox、panel、window、borderlayout 的 gallery 與互動）；forced-colors（#54 動到邊框、#55 動到 ghost 時跑；#53 若改圖示一定要跑）。gallery：`tabbox`、`panel`、`window`、`borderlayout`。chromium、tablet 全項只在合併後於 `marble` 跑一次。已知失敗 `calendar-tablet`、`slider-tablet`、`grid-header-gallery` 不計。
baseline 預期變動：`tabbox-gallery`（accordion 字型）、`panel-gallery`（rounded 外框）、`borderlayout-gallery`（預覽頁 padding）；`window-gallery` 預期**不變**（ghost 只在拖曳中）。任何預期外的變動都要歸因。baseline 只用 `--update-snapshots=changed`（可能被權限擋下，D55-B：需要時告訴使用者，不繞過）。

### 狀態紀錄（第 11 批）

| 日期 | 事項 | 結果 |
|---|---|---|
| 2026-10-08 | 開工：讀四份規則文件、四個 issue 原文與原圖（含 #55 GIF 抽幀）、四個 CSS／預覽頁；寫方法草案 | 本節 |

### 第 11 批 RED run 結果與方法定稿（2026-10-08）

報告 [../gates/batch11-red.md](../gates/batch11-red.md)，證據 `gates/batch11-red/`，結論 `RED11: METHOD-DEFECTS`。8085 伺服的是現行 build（md5 相同），未重啟。五個判定今天都失敗、兩個預期通過的都通過。

**今天的實測：**

- **#53：** 水平 tab `.z-tab-text` 14px／500／20px；accordion 16px／500／20px（三個狀態相同）。**字重、行高今天已相同，只有 font-size 不同**；同字 "Tab1" ink 高 11（14px）vs 12.5（accordion）。chevron ink 11×7，同族 8×5 → 寬 +37.5%、高 +40%，**兩邊都超過 25%，依事先判準觸發 D56**。
- **#54：** 六個 rounded（含 noheader、collapsed）root class 為 `z-panel z-panel-noborder`、無 `noframe`（與預測相符）；4 邊外緣全白（ΔE 0），normal 為 (224)（ΔE 10.82）。圓角、陰影、head 分隔線今天都沒有。forced-colors 下所有 panel（含 `none`）本來就有 1px `CanvasText` 框（`_forced-colors.css:27-39`）。
- **#55：** ghost 標題最深 (143) vs 閒置 (33)，ΔE 46.66；ghost opacity 0.5，子孫 1；ghost 內部（標題以下）100% 透出背景。**panel 根本沒有 move ghost**（`Panel._initMove` 無 `ghosting`），`.z-panel-move-ghost` 是死規則。
- **#57：** BL0／BL1 的 N/S 文字左緣偏移 0／0.5，W／E／C 為 16／17／16.5；BL3–5 今天就一致。W／E／C 的 padding 全來自預覽頁 `div.z-p-4`；`.z-north-body`／`.z-south-body` computed padding 0。預覽站沒有 north/south 放貼邊 toolbar 的例子。**BL0／BL1 的 N/S body 只有 19px**（60px 扣 40px header），20px 文字今天就溢出有捲軸。

**方法修正（定稿後不再改）：**

1. **J55-1 落點：** 一律在**空白區**拖曳（Overlapped 往 jess −80/+120、normal −80/−200），不蓋在其他內容上，避免量到透出的字。
2. **#55 保護項 (a)：** outline 今天是 50% 合成色 (154,182,231)。改為「outline 2px 可見，色為 focus ring 色 (55,111,208) 或其 50% 合成」，不要求與今天相同；baseline 預期變動。
3. **#55 panel 項刪除**（不適用）；`.z-panel-move-ghost` 死規則列 follow-up，不動。
4. **J53-1 只比 font-size**（字重、行高今天已相等，仍列保護項）；ink 交叉驗證用同字（垂直 mold Tab1–3 vs accordion Tab1–3）。
5. **J54-2 加強：** 修後 rounded 邊線中段 ΔE ≥ 6，且線從角落 2–4px 起（今天「整個外緣都白」是空泛通過）；與 normal 比較時，panel 1 的 footer toolbar 下框線會被誤量，**底邊改量兩端各 8px**。J54 forced-colors (f) 只當回歸（今天就成立）。
6. **J57-1 範圍：** 修 BL0–BL2 的 N/S（W/E/C 一致即可），BL3–5 今天就過，保護項要守住。**BL0／BL1 的 N/S 高度要一併調整**：內容改包 `z-p-4`（與 W/E/C 同一個包裝），N/S 的 size 調到能容納 52px（BL0 `25%`、BL1 `35%`）；判定加 **J57-3：N/S 內容無捲軸、文字不被切**（`scrollHeight ≤ clientHeight`）。保護項 (a) 的「N/S 高度不變」改為「除 BL0／BL1 的 N/S size 外，其餘區域外框與 splitter 位置不變」。
7. **「弄壞貼邊 toolbar」** 只能引文件與程式碼論述（預覽站無此例），留言中如實說明。
8. **#53 chevron 中心**今天隨方向偏 ±2px；若改遮罩，J53-2 的中心判定改為「展開／收合兩個方向中心差 ≤ 1px」。
9. 新發現（記入 follow-up，不修）：forced-colors 下 `border="none"` panel 也畫 1px 黑框；window ghost 修後 outline 會變深。

**等待裁示（議題頁，標 `[A]`）：** D56（#53 chevron 是否改為同族遮罩）。裁示前 #53 只做 font-size；#54 #55 #57 直接交 Generator。

### 第 11 批最終判定第一輪（2026-10-08）

報告 [../gates/batch11-final.md](../gates/batch11-final.md)，`GATE11-FINAL: FAIL`（第一輪）。J53-1、J54-1/2、J55-1/2、J57-1/2/3 全部 PASS；core 回歸 184 passed／0 failed；gallery 差異逐列歸因皆為預期。失敗兩項：

1. **#57 保護項 (b)：** BL1 的 N/S 35% 使中間只剩 50px，放不下 52px 的 `z-p-4` 內容，W/E/C 出現 6px 捲軸。我的算術錯誤（沒有扣 40px header）。**修正：BL1 N/S 改 32%**（N/S body 56、中間 body 68，皆 ≥ 52）。
2. **#54 保護項 (b) 口徑（Planner 裁定，非 D 編號）：** 還原 1px 外框時，內容撐高（auto height）的 rounded panel 外框盒必然 +2px（與 `border="normal"` 同理），固定高度的 panel ±0。保護項 (b) 改為「固定高度 ±0px；auto 高度 +2px（= 上下各 1px 外框）」；panel gallery 頁高 +4px 屬此連帶。**這是修好 issue 的直接結果，不是越界。**
3. **口徑確認：** #57 BL0／BL1 的 W/E/C 與 south 因 N/S size 改變而下移（40px／依 BL1 調整後重量），屬預期連帶。

事故記錄：`forced-colors-gallery` 專案會直接覆寫 `zkpreview/doc/screenshots/*-forced-colors.png`，Verifier 已還原到 HEAD；**之後回歸一律排除 `forced-colors-gallery` 專案**。`gallery` 專案的 1% 容差對 borderlayout 這類淡色底變動不敏感，baseline 預期變動不會以失敗呈現，需另以像素量。

**待裁示（併入同一頁）：** D57（#55 ghost 標題以下仍 100% 透出背景，是否加底色）。

### 第 11 批裁示與第二輪（2026-10-08）

R2 結論 `GATE11-FINAL-R2: PASS`（#54、#57、#53 字型、#55 最小解讀）。使用者裁示（議題頁 https://claude.ai/artifact/GA1iLWCjFetrvSFr62mssM）：

- **D56-A：** #53 accordion 箭頭換成與 D52-A 相同的 chevron 遮罩（8×5），補 forced-colors。
- **D57-B：** #55 ghost 內部加 surface 底色（不再透出背景）。**這會改變所有 Window 拖曳的外觀，使用者已知悉。**

**第二輪判定（只新增，第一輪項目要全部維持通過）：**

- **J53-2（今天預期失敗）：** accordion chevron ink 外框寬、高各與 8×5 差 ≤ 25%；展開與收合兩個方向的垂直中心與標題中心差 ≤ 1px（今天 ±2px）；右緣距標題右內緣與 combobox 的 12px 差 ≤ 2px。
- **J53-3（保護）：** forced-colors 下 chevron 可見（ink 非空）；展開時 chevron 旋轉 180°（ink 外框鏡像，容差外框 ±0.5px、中心 ±1px）；選取狀態 chevron 色仍為 `on-primary-container`、未選取為 `on-surface-variant`（取樣 ΔE ≤ 3）；hover／disabled 外觀、列高 48／pitch 49 不變；展開動畫仍完成。
- **J55-3（今天預期失敗）：** 拖曳 ghost 標題以下的區域（空白區落點）取樣色與 `--zk-color-surface` 的頁面色 ΔE ≤ 2，且不受背後內容影響（把 ghost 蓋在有文字的內容上，取樣色相同）。
- **J55-4（保護）：** 第一輪 J55-1/2 仍通過；outline（focus ring 色 2px）可見；ghost 尺寸、位置、z-index 不變；放開後落點位移 0；forced-colors 下 ghost 可見（outline 可見且內部不為全透明疊字）。
- **回歸：** 同第一輪；**排除 `forced-colors-gallery` 專案**；forced-colors 全量要跑。

### 第 11 批第三輪（2026-10-08）

`GATE11-FINAL-R3: FAIL`，只有一條：J53-2 右緣距（chevron ink 右緣距 tab 右緣 15，combobox 12.08，差 2.92 > 2）。其餘（J53-1、J53-3、J55-1～4、#54、#57、回歸 core 184／0 failed）全部 PASS。原因：accordion 標題左右 padding 16px，selectbox 的 `margin-right:-4px` 是針對 12px 內距算的。**修正：`margin-right` 改 `-7px`（不放寬判準）**，只量 J53-2 右緣距與中心不退步。

### 第 11 批最終判定與看板列（2026-10-08）

`GATE11-FINAL-R4: PASS`（[../gates/batch11-final.md](../gates/batch11-final.md)）。D56-A、D57-B 已實作並驗證。#53 chevron 8×5、右緣距 12（combobox 12.08）、兩方向中心差 0；#55 ghost 標題 ΔE 46.66 → 0、內部底色 = `--zk-color-surface`；#54 rounded 外框 ΔE 0 → 10.82；#57 預覽頁 N/S 與 W/E 一致，BL1 無捲軸。core 回歸 184 passed／0 failed。

| State | Issues | Count |
|---|---|---|
| Fixed and verified in `zk` (batch 11, tabbox accordion / panel / window / borderlayout demo; Fable gate PASS after four rounds, pure CSS plus one preview-page fix), committed 2026-10-09 (`3c4c4f066a`), commented 2026-10-09 ([gates/batch11-comments.md](../gates/batch11-comments.md)), awaiting the designer to close | #53 (accordion title 14px + family chevron 8×5, D56-A), #54 (`border="rounded"` outline restored), #55 (drag ghost opaque title and surface fill, D57-B), **#57 fixed in the preview page, not the theme (R5)** — [gates/batch11-final.md](../gates/batch11-final.md) | 4 |

Follow-ups：`.z-panel-move-ghost` 是死規則（panel 不建 ghost）；forced-colors 下 `border="none"` 的 panel 也畫 1px 黑框（`_forced-colors.css` 沒排除 `z-panel-noborder`）；`gallery` 專案的 1% 容差對淡色底變動不敏感；`forced-colors-gallery` 專案會覆寫 repo PNG，回歸一律排除；accordion 的 disabled 列 ink 左緣 −0.5px（字形側邊距）。

| 2026-10-09 | 第 11 批 baseline 重生（使用者同意 Bash 權限；tabbox、tabbox-misc、panel 用 `changed`，borderlayout 與 tabbox-misc 因在 gallery 容差內用 `=all` 只針對該元件）；提交 zk `3c4c4f066a`（無 zkcml 變更）、證據 `5314332b7e`；四則 Jess 留言已貼（#53 #54 #55 #57），截圖在追蹤 repo `screenshots/batch11/`。D56-A、D57-B 已實作。 | gates/batch11-comments.md |

## 第 9、10 批（B 線，2026-10-08／09）

> 以下由 B 線的 [lines/line-b-plan.md](lines/line-b-plan.md) 逐節搬入（標題降一級、相對連結改寫，內容未改）。B 線在 `jess/line-b` 完成，於 2026-10-09 以 `--ff-only` 合併進 `marble`（zkcml 先、zk 後），合併後完整回歸見 [gates/merge-1.md](gates/merge-1.md)（MERGE1 PASS）。看板列已併入 [jess-review-triage.md](jess-review-triage.md)；該計畫檔本身保留。

### 一、環境（已建好）

| 項目 | 值 |
|---|---|
| 目錄 | `ZK10/jess-b/zk`、`ZK10/jess-b/zkcml`（從 `marble` 的 `4809af10b8` / `47012fa5b` 分出） |
| 分支 | `jess/line-b`（兩個 repo） |
| 預覽站 | `http://127.0.0.1:8105`，從 `jess-b/zk/zkpreview` 啟動 |
| Verifier 的 `PREVIEW_URL` | `http://127.0.0.1:8105`（絕不量 8085） |

建置結果見 [parallel-lines 第十節](jess-review-parallel-lines.md)。

### 二、各 issue 的初步判定（開工前讀原始碼與設計師截圖的結果）

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

### 三、#72–#74 的查證：ZK 有沒有輸出每個按鈕的 class

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

### 四、批次分組與檔案所有權

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

### 五、流程與預計順序

依原則第三節。批次 9 先做：

1. 寫驗證方法（判定今天必須失敗、保護項今天必須通過）→ RED run（Verifier，Fable，看 8105）
2. Generator（Sonnet）修 CSS → 範圍檢查 → 最終判定（Fable，不看 diff）
3. baseline（只用 `--update-snapshots=changed`，只重生自己元件）→ 逐路徑提交到 `jess/line-b`（zkcml 先、zk 後）
4. 每批完成後 rebase `marble`、合併，才貼 Jess 留言（平行線文件第七節）

### 六、已提出的待決事項

| 編號 | 議題 | 狀態 |
|---|---|---|
| D80 | #72 X 鈕 hover 範圍（messagebox 限定／Window 全體／不改） | **已決：B（所有 Window 改中性），2026-10-08，使用者**。實作細節待 D84 |
| D81 | #73、#74 歸 DEMO 還是 ZK-CORE | **已決：A（ZK-CORE）**；已開 [ZK-6187](https://zkoss.atlassian.net/browse/ZK-6187)（2026-10-08），連結已貼在 #73、#74 的 comment |
| D82 | #1 errorbox 三角脫離：ZK-CORE 並開 ZK Jira | **已決：A，2026-10-08，使用者**。已開 [ZK-6188](https://zkoss.atlassian.net/browse/ZK-6188)，連結已貼 #1 的 comment。**備註：已驗證（2026-10-08，[gates/zk-6188-verify](gates/zk-6188-verify/README.md)）：** 在預覽頁 `errorbox.zul` 拖曳換向可重現（殘留 `top`，三角在箱子內）；Jira 的 Workaround 注入後三角位置正確。**限制：** 沒有逐字用 Jira 內文的 `<window>＋<textbox>` 片段（需新增頁面）；「反方向換位時三角留在箱子外」一句來自 GIF 與機制推論，未另外實測 |
| D83 | #47 fisheyebar 兩個方向一起修（水平預設外觀會變） | **已決：A，2026-10-08，使用者**。Generator 改 `zkex/.../fisheye.css` 中 |
| D84 | D80-B 的實作：`--zk-window-close-hover-bg` 是文件記載的公開 token（`doc/spec/component-theme-variables.md:231`，預設 `error-container`）。只改規則會讓這個旋鈕失效；改 token 預設值要動共用的 `tokens/_component-theme.css`（平行線文件第九節 1）與 spec 表格 | 待使用者 |

### 七、批次 9 驗證方法（2026-10-08，RED run 前定稿；RED 之後只允許 Planner 依 RED 結果修方法，之後不再改）

通則：Verifier 用 Playwright（`--output` 指向 `gates/batch9-red/`），`PREVIEW_URL=http://127.0.0.1:8105`，量測前關閉 transition。所有量測只看 `getBoundingClientRect`、`getComputedStyle` 與像素，不依賴特定 CSS 寫法。DOM id 是 uuid，用 class 或固定 id（`#zk_err`、`#zk_showBusy`）選取。

#### J66 runtime-error：關閉鈕在最右角（頁面 `runtime-error.zul`，點「Trigger Error」與「Trigger Multiple Errors」）

| 編號 | 判定（今天必須失敗） |
|---|---|
| J66-1 | `#zk_err-remove-btn`（關閉）的右緣 > `#zk_err-refresh-btn`（重新整理）的右緣，且關閉鈕右緣與 `#zk_err-p` 內容區右緣（扣除 padding）的距離 ≤ 1px |

保護項（今天必須通過）：
- P66-a 兩個按鈕仍可見，各 32×32；`.errornumbers` 的右緣 ≤ 兩顆按鈕中較左者的左緣。
- P66-b 錯誤圖示（`#zk_err-p::before`）仍在最左，24×24。
- P66-c 點關閉鈕後 `#zk_err` 消失（行為不變）；點重新整理鈕不會把關閉鈕換位。
- P66-d 1 筆與 2 筆錯誤時，上述順序一致。

#### J71 loading：內容置中（頁面 `loading.zul`，觸發全頁 busy 與元件級 busy）

| 編號 | 判定（今天必須失敗） |
|---|---|
| J71-1 | 全頁 `.z-loading`：內容（`.z-loading-indicator`）的上下間距差 ≤ 1px，且左右間距差 ≤ 1px（間距 = indicator 外框到 `.z-loading` 外框的距離，扣掉 CSS padding 不算；直接比較兩側實際空白） |
| J71-2 | 元件級 `.z-apply-loading`（`.z-apply-loading-indicator`）同 J71-1 |

保護項：
- P71-a `.z-loading` 仍為 `position: absolute`，z-index 高於 `.z-modal-mask`，`cursor: wait`。
- P71-b 旋轉圖示 20×20、仍在動（兩個時間點的旋轉角不同）；圖示與文字垂直中心差 ≤ 1px。
- P71-c 內容仍不換行（單行）；框的圓角、陰影、底色不變。
- P71-d 框相對於螢幕的位置（ZK 以 inline left/top 置中）不因本修改移動超過 1px。

#### J1 errorbox：小三角貼齊箱體（頁面 `errorbox.zul` 的真實 errorbox；`usecase/item-editor.zul` 的空白必填欄位）

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

#### J72 X 鈕 hover（D80-B：所有 Window 一起改中性；D84-A：保留 `--zk-window-close-hover-bg` 旋鈕，改預設值）

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

### 七之二、批次 10 驗證方法（2026-10-08，RED run 前定稿）

通則同第七節。`PREVIEW_URL=http://127.0.0.1:8105`。

#### J4 button：text 變體不該有 box-shadow（頁面 `button.zul`）
根因（原始碼）：`.z-button-text-{secondary,success,warning,error,info}.z-button`（`button.css:226-230`）沒有重設 `box-shadow`，吃到 `.z-button` 的 `--zk-button-elevation`；`.z-button-text.z-button`（:218）有重設。
- **J4-1（今天必須失敗）：** `z-button-text`、`-secondary`、`-success`、`-warning`、`-error`、`-info` 六種，靜止、hover、聚焦、按住四個狀態，computed `box-shadow` 皆為 `none`，且按鈕外圍 4px 內的像素與頁面背景一致（ΔE ≤ 1，CIE76；無陰影暈）。
- **保護項：** P4-a filled／outlined／icon／fab 各變體的靜止與 hover `box-shadow` 與 RED 完全相同（filled 靜止 resting、hover elevation-2 保留）；P4-b disabled 全變體 `none`；P4-c text 變體文字色、hover 狀態層（`::before` opacity）、`cursor` 不變；P4-d 按鈕尺寸 rect 不變。

#### J6 calendar：disabled 日期同色（頁面 `calendar.zul` 的 constraint="no past" 範例）
根因（原始碼）：`.z-calendar-body tbody td.z-calendar-weekend`（0,2,2）蓋過 `.z-calendar-cell.z-calendar-disabled`（0,2,0）。
- **J6-1（今天必須失敗）：** 該範例當月所有 disabled 日期（含週六、週日）的 computed `color` 相同，且文字像素最深色 ΔE ≤ 1。
- **J6-2：** 同頁 disabled 日期仍全部有刪除線（`text-decoration-line: line-through`）、`cursor: not-allowed`、`pointer-events: none`。
- **保護項：** P6-a 同月可選週末日的色 = 可選平日的色（`--zk-calendar-fg`），與 RED 相同；P6-b 選取日（含週末選取日）文字色 = `on-primary`，圓盤顏色不變；P6-c 月外日 opacity 0.38 不變；P6-d 週末表頭色不變；P6-e hover 圓盤只出現在可選日；P6-f 其他 constraint 範例（`no future`、`before/after`）同樣 disabled 同色。

#### J40 label：checkbox 與 radio 文字同字級（頁面 `label.zul`，同頁也有 `checkbox.zul`、`radio.zul` 可交叉量）
根因（原始碼）：`.z-radio-content`（`checkbox.css:306`）用 `--zk-typescale-label-large-size`（14px）；`.z-checkbox`、`.z-checkbox-content`、`.z-radio`、`.z-label`、input 都是 `--zk-typescale-body-medium-size`（13px）。依原則二（框架一致）取 13px。
- **J40-1（今天必須失敗）：** 同一頁上 checkbox 文字與 radio 文字的 computed `font-size`、`font-weight`、`line-height` 全部相同。
- **保護項：** P40-a checkbox 文字 13px 不變；P40-b radio 圓圈（外圈、內點）尺寸、radio 控制高度（`min-height`）、文字與圓圈垂直中心差（RED 值 ≤ 現值 + 0）不變；P40-c radio disabled／checked／focus 狀態外觀不變；P40-d `label.zul` 上 `z-flex` 居中範例的文字垂直置中不變（量文字中心與圓圈中心差，修改後 ≤ RED + 1px）。

#### J47 fisheyebar（RED 探索：先重現再定判定）
頁面 `fisheyebar.zul`，勾選「Vertical orient」。設計師量到：容器變 80×480，每個圖示寬縮成 1px（高 64px），圖示 y≈729 跑出容器（容器 y 321–801）。Fisheye 項目由 JS 以 inline `left`／`top` 絕對定位（`Fisheyebar.ts syncAttr`），而主題 CSS 把 `.z-fisheyebar` 設為 `display:flex; flex-direction:row`、`.z-fisheye-image` 設為 `width/height:100%`，可能與 JS 版面衝突。
- **RED 要回報：** 水平與垂直兩個方向下，容器 rect、每個 `.z-fisheye` 的 rect／`position`／inline left／top／width／height、`.z-fisheye-image` rect，以及哪條 CSS 規則造成 1px 寬（用 computed style 與逐條關閉規則的量測判斷，**不得改檔案**，用 `page.addStyleTag` 在頁面內試驗）。
- **預定判定（RED 後依實測定稿）：** J47-1 垂直方向時每個項目的 rect 完整落在容器內、寬度 ≥ `itemWidth`（頁面設定值）；J47-2 水平方向與 RED 相同（保護）；J47-3 magnify（滑鼠移動）後放大的項目仍在容器內。

#### J61 tbeditor（RED 探索：先重現再定判定）
頁面 `portallayout.zul` 的 Editor 區（`<tbeditor/>`）。設計師：圖示「又大又粗」，與 `utility/icons`（`/web/utility/icons.zul` 或同名頁）不一致。
- **RED 要回報：** tbeditor 工具列每顆按鈕圖示的繪製方式（font glyph／mask／img／svg）、實際渲染尺寸、筆畫粗細（以像素或 mask 來源判斷）、顏色；`utility/icons` 頁的標準圖示尺寸、筆畫、顏色（同一量法）；兩者差異表。再量工具列按鈕尺寸與分隔線。**不得改檔案。**
- **預定判定（RED 後依實測定稿，採最小解讀 R6）：** J61-1 圖示渲染尺寸 = `utility/icons` 的標準尺寸（±1px）；J61-2 圖示色 = `on-surface-variant` 一類的 token 色；保護項：按鈕命中尺寸（hit-target 不縮小）、hover／active／disabled 狀態層、工具列換行位置不變。

#### 批次 10 RED 結果與方法定稿（2026-10-08，Fable，8105；[gates/batch10-red/report.md](gates/batch10-red/report.md)）

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

#### 批次 10a（#4 #6 #40 #61）GATE10-FINAL 第 1 輪：FAIL（2026-10-08，Fable，8105；[gates/batch10-final/report.md](gates/batch10-final/report.md)）

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

#### 批次 10a 第 2 輪：GATE10-FINAL2 PASS（2026-10-08，Fable，8105；[gates/batch10-final2/report.md](gates/batch10-final2/report.md)）

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

#### #47 fisheyebar：GATE47-FINAL PASS（2026-10-08，Fable，8105；[gates/batch47-final/report.md](gates/batch47-final/report.md)）

D83-A（使用者裁示）：兩個方向一起修。Generator 只在 `zkex/.../menu/css/fisheye.css` 加兩行：`.z-fisheyebar { position: relative }`、`.z-fisheye { position: absolute }`（ZK 的 JS 以 inline left／top／寬／高絕對定位項目，主題 CSS 原本讓 `.z-fisheye` 是 static，位置被忽略、寬度被 flex 壓縮）。

| 判定 | RED | 現在 |
|---|---|---|
| J47-1 垂直 | 六項寬 1.33px，全擠在 y=713（Δw −78.7） | 六項 80×80，l=32、t=321+80k，Δ 全為 0 |
| J47-2 水平 | 寬 68、上移 8px（Δw −12、Δt −8） | 六項 80×80，l=32+80k、t=321，Δ 全為 0 |
| J47-3 magnify（停穩 600ms） | 水平 51/76.5/102…；垂直 1/1.5/2… | 80/120/160/120/80/80，Δ 全為 0 |
| 保護項 | — | 圖片比例、cursor、標籤、切回水平、容器尺寸全通過 |
| 回歸 | — | 184 passed、0 failed |

**揭露：** (1) magnify 有 transition 拖尾：滑鼠移動後立即量，寬高落後 20–80px，600ms 後為 0（left／top 立即到位）。這是既有的 `transition: width/height`，不是這次造成，不處理。(2) 放大項目超出容器（水平 magnify 第 1 項 l=−48、第 6 項 r=592）是 ZK 演算法的設計。(3) 定稿的 P47-a 寫「top 10%」，RED 實際是 20%，採「與 RED 相同比例」分支。(4) 垂直後 `aria-orientation` 仍是 horizontal，是 ZK widget 問題（follow-up）。

#### baseline 重生（2026-10-08，Planner）

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

#### #72：GATE72-FINAL PASS（2026-10-08，Fable，8105；[gates/batch72-final/report.md](gates/batch72-final/report.md)）

D80-B（所有 Window 一起改中性）＋D84-A（保留旋鈕、改預設值）。Generator 改三處：`window.css` 的 `.z-window-close:hover` 文字色 `on-error-container` → `on-surface`；`tokens/_component-theme.css:64` 的 `--zk-window-close-hover-bg` 預設 `var(--zk-color-error-container)` → `var(--zk-window-icon-hover-bg)`（共用檔，使用者以 D84-A 授權這一行）；`doc/spec/component-theme-variables.md:231` 的預設值欄。token 不新增、不改名、不刪除。

| 判定 | RED | 現在 |
|---|---|---|
| J72-1 close hover 背景 vs 同視窗參考鈕 | (254,205,199) | (240,244,250)＝參考鈕，ΔE 0.00；computed color `rgba(0,0,0,.87)`＝參考鈕 |
| J72-2 vs RED 的 error 色 | 0 | ΔE 23.13 |
| P72-c 旋鈕 | — | 注入 `#ffcc00` 後像素 ΔE 0.00，移除後回中性（四個視窗皆同） |
| P72-a／d／e | — | 靜止值與 rect 逐值相同；點 X 能關閉；focus ring 與參考鈕相同；forced-colors 17 passed |
| 回歸 | — | 184 passed、0 failed；window／messagebox／panel／caption 相關 7 passed |

glyph 像素 (31,32,32) vs RED (127,0,10)；形狀未變（156 px，與 RED 相同）。**baseline：無需重生**（hover 不在任何快照；清單為空）。**限制：** messagebox 沒有 maximize／minimize，參考鈕是把 close 節點複製成 `z-window-icon` 的合成節點；P72-b、focus ring 在 RED 沒有對照值，只記錄現值並證明與參考鈕一致。

#### D85-A 與 rebase（2026-10-09，使用者裁示 D85-A）

**起因：** 合併前發現 `marble` 上提交 `1c739948643`（hawkchen，「reset button elevation on colour variants and honour treecol align in Marble」）已在 `button.css` 加了等效的 `box-shadow: none`（五個彩色 `text-*` 變體、五個彩色 `outlined-*` 變體、icon 按鈕），與 B 線 #4 的五行改動重疊。試算合併無衝突，但依平行線文件第七節停下回報；使用者裁示 D85-A：丟掉 B 線的五行、保留 `marble` 的那份。

**做法：** 兩個 repo 先建 `backup/line-b-pre-rebase-d85`；`git rebase marble`（zkcml 先、zk 後，無衝突）；在 rebase 後的樹上移除 B 線 `button.css` 的五行，`button.css` 與 `marble` 逐位元相同；重建 CSS 與全部 jar；8105 重啟並確認 served CSS。

**GATE-REBASE：PASS**（Fable，8105；[gates/rebase-d85/report.md](gates/rebase-d85/report.md)）：J4 與 GATE10-FINAL 完全相同（24 個（變體、狀態）`none`，環 ΔE 0）；`outlined-*` 五變體由 resting 變 none 是 `marble` 提交的預期效果；#66、#71、#6、#40、#61、#47、#72 的 gate 腳本原樣重跑，數值相同（差異僅旋轉圖示瞬時值、翻到的日期、build hash）；回歸 184 passed、27 chromium、8 gallery，0 failed。

**button-gallery baseline：** rebase 前重生的版本帶有 outlined 彩色變體的 resting 陰影，rebase 後畫面已不同（容差吸收）。在 rebase 後的樹上重生，新舊差異約 375 px（亮度差 > 3），即 outlined 彩色變體失去陰影。

**揭露：** `button.zul` 量不到「icon 按鈕」重設：頁上唯一的 icon-only 按鈕 class 只有 `z-button`，與 `marble` 提交處理的 `z-button-icon` 不同；與 B 線無關。

#### 合併與合併後完整回歸（2026-10-09）

兩個 repo 的 `marble` 皆 `git merge --ff-only jess/line-b`（zkcml 先、zk 後），未推送。8085 在 `marble` 上重建並重啟後跑完整回歸（[gates/merge-1.md](gates/merge-1.md)）：**MERGE1: PASS**，443 passed／10 failed／47 skipped（focus-scan 既有 skip），**無法歸因 0**。

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

#### Jess 留言（2026-10-09）

合併與完整回歸（MERGE1 PASS）之後，對 #66、#71、#72、#4、#6、#40、#47、#61 各貼一則留言（`# Root cause / # Solution / # Result`，附修改後截圖，截圖在 tracker repo 的 `screenshots/batch9/`、`batch10/`，在合併後的 `marble` build（8085）上拍），內容與連結見 [gates/batch9-10-comments.md](gates/batch9-10-comments.md)。#73、#74、#1 的 ZK Jira 連結留言已於 2026-10-08 貼出。

**揭露：** 上傳截圖時，我的「檔案是否已存在」檢查一度誤判（GitHub 404 時 `--jq .sha` 輸出 `null`，不是空字串），全部被略過、**沒有上傳**；我用資料夾列表確認後改用 HTTP 狀態碼判斷，重新上傳，之後列表確認 9 張都在。這個誤判沒有造成覆寫或錯誤上傳。

**尚未做、由你決定：** 推送、關閉 issue。**目前 `marble` 的合併與提交都只在本機，未推送**；留言裡的截圖在 tracker repo，連結可用，但設計師看不到本機的程式碼狀態。

### 八、紀錄（逐批追加）

#### 批次 9 RED run（2026-10-08，Fable，8105；報告 [gates/batch9-red/report.md](gates/batch9-red/report.md)）

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

#### 批次 9a（#66、#71）最終判定：GATE9-FINAL PASS（2026-10-08，Fable，8105；報告 [gates/batch9-final/report.md](gates/batch9-final/report.md)）

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
