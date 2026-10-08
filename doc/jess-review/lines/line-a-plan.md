# Jess review A 線：批次 7、8 的方法、結果與看板列草稿

建立日期：2026-10-08。依 [../jess-review-parallel-lines.md](../jess-review-parallel-lines.md) 第六節，本文件是 A 線專屬，**共用文件（看板、驗證計畫、決策原則）平時不改，合併時才併入**。
流程依 [../jess-review-decision-principles.md](../jess-review-decision-principles.md)；第五節例外與平行線文件第九節例外才停下來問。
決策編號 D 用 A 線區段（D51–D79；D51 已被使用者裁定為「允許並行使用不同 port」）。本文件從 **D52** 起。議題頁標題前加 `[A]`。

## 一、環境與所有權

- 目錄 `ZK10/zk`、`ZK10/zkcml`，分支 `marble`，預覽站 **8085**（現況：java pid 58306 在聽）。證據 `gates/batch7-*`、`gates/batch8-*`；追蹤 repo 截圖 `screenshots/batch7/`、`batch8/`。
- 工作樹檢查（2026-10-08）：`zk` 只有未追蹤的 `doc/` 與 `logs/`；`zkcml` 有 `.gitignore`、`lib/spel2js/package-lock.json` 的修改與未追蹤的 `zk85themebuilder/`，**都不在本線檔案範圍內，不碰、不暫存**。

### 檔案所有權（平行線文件第五節要求的那一列，填在這裡，合併時併入）

| 線 | 批次 | issue | 預計動到的檔案（RED run 後確認） |
|---|---|---|---|
| A | 7 | #29 selectbox | `zul/src/main/resources/web/js/zul/wgt/css/selectbox.css` |
| A | 7 | #3 bandbox | 起點 `zul/.../inp/css/bandbox.css`、`zul/.../wnd/css/bandpopup.css`；若 RED 證實 blue bar 出自 listbox 的表頭／捲軸欄位，才可能是 `zul/.../sel/css/listbox.css`（見 #3 的範圍規則） |
| A | 8 | #48 #49 menubar | `zul/src/main/resources/web/js/zul/menu/css/menu.css`（**不是 zkcml**；平行線文件第二節「待確認路徑」的答案） |
| A | 8 | #51 navbar | `zkcml/zkmax/src/main/resources/web/js/zkmax/nav/css/nav.css`（zkcml） |

預覽頁（屬於本線）：`zkpreview/src/main/webapp/web/{selectbox,bandbox,menubar,navbar}.zul` 與 `pv/{selectbox,bandbox}-content.zul`。
共用檔案（`tokens/`、`_forced-colors.css`、`lang*.xml`、`font-size-baseline.json`、`playwright.config.ts`、`*.spec.ts`）一律不動；需要時依平行線文件第九節例外第 1 項停下問。

## 二、第 7 批：selectbox 箭頭、bandbox 藍條（#29 #3）

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

報告 [../gates/batch7-red.md](../gates/batch7-red.md)，證據 `gates/batch7-red/`，結論 `RED7: METHOD-DEFECTS`。8085 伺服的是現行 build（`.css.dsp` md5 與 build 檔相同），未重啟。

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

## 三、第 8 批：menubar 與 navbar（#48 #49 #51）

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

報告 [../gates/batch8-red.md](../gates/batch8-red.md)，證據 `gates/batch8-red/`，結論 `RED8: METHOD-DEFECTS`。8085 當時伺服的是現行 build。

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

## 四、狀態紀錄

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

## 五、看板列草稿（合併時併入 `jess-review-triage.md`，逐字搬入）

| State | Issues | Count |
|---|---|---|
| Fixed and verified in `zk` (batch 7, selectbox/bandbox-listbox; Fable gate PASS after one forced-colors fix round, pure CSS), committed 2026-10-08 (`c86505884b`), commented 2026-10-08 with after-fix screenshots ([gates/batch7-comments.md](../gates/batch7-comments.md)), awaiting the designer to close | #29 (chevron 8×5, D52-A), #3 (`th.z-listhead-bar` now matches the header in every listbox, D53-A) — [gates/batch7-final-r2.md](../gates/batch7-final-r2.md) | 2 |
| Fixed and verified in `zk` (batch 8, menubar/navbar; Fable gate PASS, pure CSS), committed 2026-10-08 (`ae9e58ace` zkcml; `c86505884b` zk), commented 2026-10-08 ([gates/batch8-comments.md](../gates/batch8-comments.md)), awaiting the designer to close | #48, #51; **#49 answered without a code change (D54-A: the reserved check column is deliberate, label shift 0px)** — [gates/batch8-final.md](../gates/batch8-final.md) | 3 |

**計數：** A 線貢獻 5 個（#29 #3 #48 #49 #51）；合併時以追蹤 repo 為準重算總數。

## 六、Follow-ups（不是 tracker issue）

- `image`（16px）與 iconSclass（18px）圖示的 menu 列在同一 popup 內文字起點差約 2px（Jess 沒寫）。
- 水平 navbar 的下拉選單：巢狀群組標題（Settings）仍與第一層同縮排，同 #51 的症狀，未動。
- selectbox 的 forced-colors 規則目前在 `selectbox.css` 內，慣例位置是共用檔 `tokens/_forced-colors.css` (2e)；合併時可移過去。
- Playwright 預設 `--hide-scrollbars`，與捲軸欄位有關的缺陷（#3）在 gallery baseline 看不到，沒有測試守著。可考慮加一個有捲軸的 listbox 測試（需動 `*.spec.ts`，屬共用檔，須先問）。
- #49 留言中「與 Material 慣例相同」一句，Verifier 的 MD3 數字是憑記憶、未驗證；如設計師反駁再查官方規格。
| 2026-10-08 | **A 線合併完成**：方法與結果併入 verification-plan（第七批、第八批）、decision-principles（D51–D55、第七八批做法、一致性基準表）、triage 看板（37/82，剩餘 25）、parallel-lines（第五節檔案所有權）。B 線（`jess/line-b`）尚未合併：其 zkcml 工作樹仍有未提交修改（`fisheye.css`），故本次不 rebase、不 ff。 | 共用文件 |
