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
