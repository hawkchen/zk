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
