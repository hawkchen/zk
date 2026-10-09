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

## 七、第 11 批：C 類容器（#53 tabbox accordion、#54 panel、#55 window、#57 borderlayout）

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

### 第 11 批最終判定與看板列草稿（2026-10-08）

`GATE11-FINAL-R4: PASS`（[../gates/batch11-final.md](../gates/batch11-final.md)）。D56-A、D57-B 已實作並驗證。#53 chevron 8×5、右緣距 12（combobox 12.08）、兩方向中心差 0；#55 ghost 標題 ΔE 46.66 → 0、內部底色 = `--zk-color-surface`；#54 rounded 外框 ΔE 0 → 10.82；#57 預覽頁 N/S 與 W/E 一致，BL1 無捲軸。core 回歸 184 passed／0 failed。

| State | Issues | Count |
|---|---|---|
| Fixed and verified in `zk` (batch 11, tabbox accordion / panel / window / borderlayout demo; Fable gate PASS after four rounds, pure CSS plus one preview-page fix), committed 2026-10-09 (`3c4c4f066a`), commented 2026-10-09 ([gates/batch11-comments.md](../gates/batch11-comments.md)), awaiting the designer to close | #53 (accordion title 14px + family chevron 8×5, D56-A), #54 (`border="rounded"` outline restored), #55 (drag ghost opaque title and surface fill, D57-B), **#57 fixed in the preview page, not the theme (R5)** — [gates/batch11-final.md](../gates/batch11-final.md) | 4 |

Follow-ups：`.z-panel-move-ghost` 是死規則（panel 不建 ghost）；forced-colors 下 `border="none"` 的 panel 也畫 1px 黑框（`_forced-colors.css` 沒排除 `z-panel-noborder`）；`gallery` 專案的 1% 容差對淡色底變動不敏感；`forced-colors-gallery` 專案會覆寫 repo PNG，回歸一律排除；accordion 的 disabled 列 ink 左緣 −0.5px（字形側邊距）。

| 2026-10-09 | 第 11 批 baseline 重生（使用者同意 Bash 權限；tabbox、tabbox-misc、panel 用 `changed`，borderlayout 與 tabbox-misc 因在 gallery 容差內用 `=all` 只針對該元件）；提交 zk `3c4c4f066a`（無 zkcml 變更）、證據 `5314332b7e`；四則 Jess 留言已貼（#53 #54 #55 #57），截圖在追蹤 repo `screenshots/batch11/`。D56-A、D57-B 已實作。 | gates/batch11-comments.md |

| 2026-10-09 | **A 線第 11 批合併完成**：方法與結果併入 verification-plan（第十一批）、decision-principles（D56-A、D57-B、第十一批做法、一致性基準表三列）、triage 看板（41/82，剩餘 21）、parallel-lines（第五節檔案所有權）。B 線（`jess/line-b`）仍未合併，本次未處理。 | 共用文件 |

## 八、第 12 批：DECIDE 類（#30 #68 #10 #11）

建立日期：2026-10-09。決策編號從 **D59** 起（D58「推送」仍未裁示）。議題頁標題加 `[A]`。證據 `gates/batch12-*`。

### 剩餘清單重算（2026-10-09，以追蹤 repo 為準）

- 82 個 issue 全部仍 open；52 個有 `# Root cause` 留言（49 已修 + 3 已開 ZK Jira）。沒有留言的 30 個：DECIDE 4（#30 #10 #68 #11）、DEMO 14、ZK-CORE 12（尚未開 Jira）。**P1 剩 0**，看板「剩餘 21 = P1 17 + DECIDE 4」與「尚未開始：P1 (6) + DECIDE (4)」已過期，合併時改為只剩 DECIDE 與範圍外兩類。
- B 線（批次 9、10）已於 2026-10-09 併入 `marble`（`gates/merge-1.md`），沒有所有權衝突。
- 工作樹有不屬於本批的變更（不碰、不推論歸屬）：zk 的 `.gitignore`、`lib/spel2js/package-lock.json`；zkcml 的 `zk85themebuilder/`。

### 裁示

- **D59-A：** 第 12 批做 DECIDE 批，每題各開議題頁。順序：#30 → #68 → #10 + #11。
- **D60-A（#30，連帶 #68 #69）：** 11.0 維持彈出的 errorbox，不做行內模式。開一個 ZK Jira（feature request：opt-in 行內錯誤模式、errorbox 可關閉拖曳、遮擋問題），並在 #30、#68 留言說明。依據：行內模式要改 widget 與 Java（原則第五節例外 3），errorbox 的拖曳來自 `Errorbox.ts` `bind_` 的 `zk.Draggable`，CSS 關不掉。Jira 與留言草稿在 [../gates/batch12-drafts.md](../gates/batch12-drafts.md)，**尚未送出**，等使用者確認（例外 10）。

### 狀態

| 項目 | 狀態 |
|---|---|
| #30 #68 | D61-A：已建立 ZK-6191（New Feature，Affects 11.0.0），#30 #68 留言已貼（2026-10-09）；#69 未留言 |
| #10 #11 | 待開議題頁（D62） |

### D62-A（2026-10-09，使用者「照你的建議做」）

- **#10-A：** Switch 改成 MD3 規格，純 CSS；預覽頁 Switch 獨立成區塊。這是退掉 `doc/contracts/checkbox.md` sw1–sw9 的整條規格（原則第五節例外 4，使用者已裁示；contract 原寫「MD3 spec-sheet switch must NOT be used」）。依 R8 更新 contract 並在看板記錄。
- **#11-A：** 不改 CSS；在 #11 留言說明 `mold="toggle"` 是什麼、MD3 沒有對應元件，請設計師決定要不要保留。

### 第 12 批方法：#10 Switch（R6 最小解讀：幾何與配色照 MD3，不加圖示）

**範圍：** `zul/.../wgt/css/checkbox.css` 的 switch 區段（約 393–501 行）、預覽頁 `zkpreview/.../web/checkbox.zul`（Switch 獨立成區塊）、`doc/contracts/checkbox.md`（sw1–sw9）、`checkbox` gallery baseline（RED 後視像素變動決定）。**不動** `_forced-colors.css`（共用檔），除非 Verifier 證明 forced-colors 下壞掉，那時先問。不加新的公開 token（switch 目前沒有 `--zk-checkbox-*` 旋鈕）。圖示（打勾）是 MD3 的選配，不在最小解讀內，列 follow-up。

**環境：** `PREVIEW_URL=http://localhost:8085`，頁面 `/web/checkbox.zul`，viewport 1280×900，量測前注入 `*{transition:none!important;animation:none!important}` 並等 `document.fonts.ready`，每個狀態重新載入。`ignoreDefaultArgs:['--hide-scrollbars']`。證據首行宣告使用 8085，量測前比對 `zk.wcs`。

**判定（今天必須失敗）：**

- **J10-1：** 關、開兩態的軌道外框（`.z-checkbox-switch > .z-checkbox-mold` 的 `getBoundingClientRect`）為 52×32，各邊 ±1px。
- **J10-2：** 滑塊（`::after`，用 `getComputedStyle(mold,'::after')` 讀寬高，並以像素 ink 外框交叉驗證）：關閉 16×16、開啟 24×24（±1px），皆為圓形。
- **J10-3（位置）：** 滑塊中心垂直位於軌道中線 ±1px；水平：關閉時中心距軌道左緣 16px（±1.5）、開啟時距軌道右緣 16px（±1.5）。
- **J10-4（關閉態配色）：** 軌道有 2px 外框，外框 ink 與 `--zk-color-outline` 的 ΔE ≤ 3；軌道填色與 `--zk-color-surface-container-highest` 的 ΔE ≤ 3；滑塊色與 `--zk-color-outline` 的 ΔE ≤ 3。
- **J10-5（開啟態配色）：** 軌道填色與 `--zk-color-primary` 的 ΔE ≤ 3，且沒有與填色不同的外框環（外緣內 1px 的取樣色與填色 ΔE ≤ 3）；滑塊色與 `--zk-color-on-primary` 的 ΔE ≤ 3。
- **J10-6（hover 狀態層）：** hover 時滑塊外有 40px 的圓形狀態層（`::before`，寬高 40±1），中心與滑塊中心差 ≤ 1px；不透明度取 `--zk-state-hover-opacity`（0.08，取樣 ΔE 驗證有色差）。關閉態用 on-surface，開啟態用 primary。

**保護項（今天必須通過）：**

1. 點擊軌道、滑塊、標籤文字任一處都能切換；空白鍵（focus 後）能切換；切換後 class 為 `-on`／`-off`。
2. focus-visible 時外圈（狀態層或 focus ring）可見，且 `focus-ring-scan` 通過。
3. disabled（關、開）：opacity 為 `--zk-state-disabled-opacity`（0.38），不回應點擊，游標 not-allowed。
4. 標籤與軌道的水平間距不變（±1px）；標籤文字字型不變。整列高度：`min-height: var(--zk-control-height)` 維持，記錄前後差值（軌道由 14 變 32，預期列高變動 ≤ 4px，在報告標出）。
5. checkbox、radio、toggle、tristate 的像素與位置不變（ΔE ≤ 1，±0px）。
6. 其他用到 switch 的頁面不壞：`usecase/account-settings.zul`、`usecase/brand-switcher.zul`、`usecase/index.zul` 的 switch 不與相鄰文字重疊、不被裁切；記錄前後位移。
7. 暗色與 compact（`--zk-control-height` 縮小）下，軌道仍垂直置中（±1px）。
8. R10：滑塊對軌道的對比 ≥ 3:1（關、開兩態），不達標要標出。
9. forced-colors：on 與 off 仍可分辨（軌道或滑塊色不同，ink 非空）；現有 `_forced-colors.css` 規則維持。
10. 回歸：component-theming、focus-scan、hit-target、forced-colors（排除 `forced-colors-gallery`）、chromium、gallery、tablet；已知失敗（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）不計。

**預覽頁（DEMO，R5）：** Switch 四個範例從目前的 Mold 網格移出，成為自己的區塊，標題為 `Switch`；Toggle 與 Tristate 保持原位。Verifier 的判定：頁面有獨立的 `Switch` 標題，四個 switch 在該區塊內，Mold 網格中不再有 `.z-checkbox-switch`。

### #10 方法修訂（RED 後、Generator 之前，Planner 裁定，2026-10-09）

RED 證實六項判定今天全 FAIL，方法可用；以下是 Verifier 指出的缺陷與裁定。**這是在看到 RED 結果後裁的**；修訂後定稿，GREEN 不再改。

1. **ΔE 基準：** 半透明 token 先疊在取樣位置下方的實際背景色（預覽頁為 `body` 的 `#fff`）再比。
2. **J10-2 ink：** 隱藏 `::after` 後做像素 diff，ink 外框以 ΔE > 12（去陰影）計；ink 與 computed 容許差 ±1px。
3. **J10-4 與保護項 8 互斥的裁定：** Marble 的 `--zk-color-outline` 是 `rgba(0,0,0,.23)`，與 MD3 參考色不同，直接照 MD3 對應會讓關閉態滑塊對軌道只有 1.41:1。**裁定：關閉態滑塊色改用 `--zk-color-on-surface-variant`（比 outline 深，其餘不變）**，軌道外框與軌道填色仍用 `--zk-color-outline`、`--zk-color-surface-container-highest`。判定 J10-4 的滑塊項改為「滑塊色與 `--zk-color-on-surface-variant`（疊底後）ΔE ≤ 3」。保護項 8（滑塊對軌道 ≥ 3:1，關、開兩態）維持為必須通過；軌道外框對頁面的對比（outline 在白底約 1.6:1）屬 Marble 全站 outline token 的問題，**只記錄並標出，不在本批處理**（R10、R9）。偏離 MD3 的只有關閉態滑塊色，並在留言與看板如實說明（R7）。
4. **保護項 7：** 刪除暗色一半（主題沒有暗色模式，N/A）；保留 compact。
5. **DEMO 判定：** 改為「頁面有獨立的 `Switch` 標題；四個 switch 在該區塊內；`States` 網格內 `.z-checkbox-switch` 為 0」。
6. **保護項 10：** 排除 `usecase/index.zul` 的 live-reload（`localhost:50000`）console error。
7. **保護項 3：** 游標只保護 computed 值（root `cursor:not-allowed`、`pointer-events:none` 不變），不要求實際顯示 not-allowed。
8. **J10-3 容差：** 水平 ±1.5 對 computed 幾何；ink 與 computed 差 ≤ 1px 視為一致。
9. **「已達標、GREEN 要維持」的子項：** J10-3 垂直置中、J10-5 無外框環、J10-6 的中心對齊／opacity／顏色。
10. **列高：** RED 量到列高 40px = `min-height`，軌道 14→32 預期列高變動為 0；保護項 4 的容許 ≤ 4px 收緊為 ±0（若不是 0，要在報告標出原因）。

### 第 12 批最終判定與看板列草稿（2026-10-09）

`GATE12-10-FINAL: PASS`（[../gates/batch12-final.md](../gates/batch12-final.md)）。#10：軌道 34×14 → 52×32、滑塊 20 → 16／24、位置 7 → 16、列高 ±0；R10 滑塊對軌道 off 2.71 → 5.36、on 2.37 → 4.83；回歸 component-theming／forced-colors／hit-target／focus-scan 全綠。提交 `11217ddc48`（zk；本批無 zkcml 檔案），baseline 重生 `checkbox-gallery.png`、`checkbox-tablet.png`（`--update-snapshots=changed`，已逐張看圖）。留言：#10 https://github.com/hawkchen/marble-issue/issues/10#issuecomment-6081832769 ；#11 https://github.com/hawkchen/marble-issue/issues/11#issuecomment-6081325796 ；#30 #68 見 `batch12-drafts.md`。D59-A、D60-A、D61-A、D62-A 已執行。

| State | Issues | Count |
|---|---|---|
| Fixed and verified in `zk` (batch 12, checkbox switch; Fable gate PASS, pure CSS plus a preview-page change), committed 2026-10-09 (`11217ddc48`), commented 2026-10-09, awaiting the designer to close | #10 (switch follows MD3: track 52×32, thumb 16/24; off-state thumb uses `on-surface-variant` for contrast; own `Switch` section on the preview page, D62-A) — [gates/batch12-final.md](../gates/batch12-final.md) | 1 |
| Answered without a code change, commented 2026-10-09 | #11 (`mold="toggle"` is a public checkbox mold with no MD3 counterpart; asked the designer to decide, D62-A) | 1 |
| ZK-CORE, ZK Jira filed 2026-10-09, comment with the link posted | #30, #68 → [ZK-6191](https://zkoss.atlassian.net/browse/ZK-6191) (opt-in inline error mode, non-draggable errorbox; D60-A, D61-A). #69 is covered by the same Jira but has no comment yet | 2 |

Follow-ups（不是 tracker issue）：

- `checkbox.css` 結尾多一個孤立的 `}`（第 580 行附近，既有，未確認是否影響 build）。
- switch 的打勾圖示（MD3 選配）未做。
- 軌道外框 ink 對白底 2.13:1（outline token 全站偏淡），關閉態軌道填色對白底 1.23:1；屬 Marble 全站 outline／surface token，不在本批。
- `menubar-gallery.png`、`menubar-tablet.png` 與 `221d6ed74b`（menubar 圖示間距，不屬本批）不一致，baseline 要由該提交的持有者重生。
- `_forced-colors.css` 的 switch 規則（1px border）仍沿用，forced-colors 套件通過；若日後要與 MD3 軌道配合調整，屬共用檔，須先問。
- `gallery › grid-paging` 在 merge-1 失敗、本次回歸未失敗，可能已被其他人重切，合併時再確認。

| 2026-10-09 | **第 12 批完成**：DECIDE 4 題全部處理（#30 #68 → ZK-6191；#10 修正；#11 回覆）。看板剩餘（範圍內）0；範圍外 DEMO 14、ZK-CORE 12（其中 #30 #68 已開 Jira）。尚未併入共用文件。 | line-a-plan.md |
