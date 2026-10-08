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
