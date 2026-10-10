# Jess review C 線：批次 14（CSS 相關的 follow-ups）

建立日期：2026-10-09。依 [../jess-review-parallel-lines.md](../jess-review-parallel-lines.md) 第六節，本文件是 C 線專屬，共用文件平時不改。流程依 [../jess-review-decision-principles.md](../jess-review-decision-principles.md)。
決策編號從 **D110** 起，議題頁標題加 `[C]`，證據 `gates/batch14-*`。環境：`ZK10/zk`、`ZK10/zkcml`，分支 `marble`，預覽站 8085。

## 一、環境與所有權（2026-10-09 核對）

- `zk` 工作樹只有 `doc/jess-review/lines/line-a-plan.md` 有未提交修改（A 線的 #10 Switch 方法，57 行新增）；`checkbox.css`、預覽頁 `checkbox.zul`、`doc/contracts/checkbox.md` 尚未被改。`zkcml` 有 `.gitignore`、`lib/spel2js/package-lock.json`、未追蹤的 `zk85themebuilder/`。**都不在本批範圍，不碰。**
- A 線的檔案（`checkbox.css`、`checkbox.zul`、`doc/contracts/checkbox.md`，可能還有 `_forced-colors.css`）本批一律不動。

## 二、清單重算（逐項回到原始碼核對）

### 核對後撤掉的項目

| 候選 | 核對結果 | 處理 |
|---|---|---|
| `checkbox.css` 第 580 行孤立的 `}` | 不是孤立。它關閉第 24 行的 `@layer zk-components {`；整檔括號平衡，沒有負深度 | 撤掉；A 線完成 #10 後也不需要處理 |
| `.z-panel-move-ghost` 是死規則 | **不是死規則。** Panel 自己不建 ghost，但 zkcml 的 `Portallayout.ts:471` 建了 `class="z-panel-move-ghost"` 的 ghost，`portallayout.css:142` 的註解寫明它「覆寫 panel.css 的規則」 | 撤掉；刪除會變成跨 repo 的連動修改，收益只是少 5 行 |
| panel `border="rounded"` 的陰影與 head 分隔線 | 已經是既有裁示：決策原則「一致性基準」表的 #54 列寫「陰影與 head 分隔線不加」 | 撤掉 |
| accordion disabled 列 ink 左緣 −0.5px | 第 11 批已判定為字形側邊距，不是 CSS 缺陷 | 撤掉 |
| `z-button-outlined-{secondary…info}` 有 resting 陰影 | 已修：`button.css:205-210` 對五個變體設 `box-shadow: none` | 撤掉 |
| `.z-tbeditor-dropdown button svg` 半透明 token 色 | `tbeditor.css:241-246` 那條規則沒有設顏色，沒核對到 | 撤掉（若你記得是哪一行，再補） |
| #49 留言中的 MD3 數字未驗證 | 不是 CSS 問題 | 不在本批；需要時另用一次查證 |
| fisheye 垂直後 `aria-orientation` 未更新 | widget 問題 | 範圍外 |

### 保留的項目

**P 類：純 CSS，檔案不是共用檔，與 A 線無重疊**

| # | 項目 | 檔案 | 核對到的事實 |
|---|---|---|---|
| P1 | toast info 圖示對比 3.13:1 | `wgt/css/toast.css` | `.z-toast-info .z-toast-icon` 用 `--zk-toast-accent`（預設 `--zk-color-status-info` #007fab），底是 `--zk-toast-bg`（`surface-container-highest`）。`--zk-toast-accent` 是公開旋鈕 |
| P2 | toast 與 notification 同嚴重度底色色階不同 | `wgt/css/toast.css`、`wgt/css/notification.css` | toast 用 `--zk-color-{warning,error}-container`；notification 用 `color-mix(... 12%, surface)`；info 兩者連種類都不同（toast 是中性灰，notification 是 12% 藍）。notification 的箭頭邊框色也跟著那組 mix |
| P3 | 水平 navbar 下拉內的巢狀群組標題與第一層同縮排 | `zkcml/zkmax/.../nav/css/nav.css` | 第 8 批 follow-up，`.z-navbar-horizontal .z-nav > ul`（271 行）一帶沒有逐層縮排 |
| P4 | menu 列 `image`（16px）與 iconSclass（18px）文字起點差約 2px | `zul/.../menu/css/menu.css` | 第 8 批 follow-up，Jess 沒寫，R9 當時不修 |
| P5 | tbeditor 的 view-html、fullscreen 按鈕 hover 不變藍 | `zkcml/zkmax/.../tbeditor/css/tbeditor.css` | 第 10 批維持原行為（原本就走 `currentColor` 純黑），既有不一致 |

**S 類：需要動共用檔，先問你**

| # | 項目 | 共用檔 | 核對到的事實 |
|---|---|---|---|
| S1 | selectbox 的 forced-colors 規則移到共用檔 | `tokens/_forced-colors.css` 與 `selectbox.css` | 規則在 `selectbox.css:119-126`；共用檔裡沒有 selectbox 的 picker-icon |
| S2 | forced-colors 下 `border="none"` 的 panel 也畫 1px 黑框 | `tokens/_forced-colors.css` | 規則 `.z-window, .z-panel, …`（26-39 行）註解寫「讓邊界保留」，是刻意的；`.z-window` 同樣不分 border。**建議不改** |
| S3 | 空轉的測試 `shell-is-bare-and-icon-clears-stripe` | `screenshot.spec.ts:1392` | 檔案存在，位置與紀錄一致 |
| S4 | #3 的捲軸欄位沒有測試守著 | 新增或修改 `*.spec.ts` | gallery 在 `--hide-scrollbars` 下看不到 |
| S5 | gallery 的 1% 容差吸收淡色底變化 | `gallery-scan.spec.ts:73` | `maxDiffPixelRatio: 0.01`；合併回歸（`merge-1.md`）已發現兩張 baseline 從 2026-09-11 起過期卻沒失敗 |
| S6 | 已知失敗 `calendar-tablet`、`slider-tablet`、`grid-header-gallery` | baseline PNG | `calendar-tablet` 現在多了 #6 的一段（y 2200–2404），重切要含；`grid-header` 是字型載入競態，重切可能不穩定 |

## 三、待裁示（議題頁，標 `[C]`）

D110 批次切法與範圍、D111 P1 修法、D112 P2 方向、D113 S1／S3／S4 是否動共用檔、D114 S2 維持現狀、D115 S5／S6 要不要在本批處理。內容見議題頁。

## 四、狀態紀錄

| 日期 | 事項 | 結果 |
|---|---|---|
| 2026-10-09 | 開工：讀平行線文件、決策原則、A 線與 B 線文件、看板；回原始碼核對候選；寫本文件並開議題頁，**等裁示，不派工** | 本文件 |

## 五、裁示（2026-10-09，使用者）

| 編號 | 裁示 |
|---|---|
| D110-A | 本批做 P1 + P2 + P3 + P4；P5 不做 |
| D111-A | P1：在 `toast.css` 把圖示色與 `on-surface` 混深，旋鈕 `--zk-toast-accent` 仍有效 |
| D112-A | P2：notification 改用 toast 的 `*-container` token（info 用 `surface-container-highest`），箭頭色一起改 |
| D113-B | S1、S3、S4 都做（動共用檔 `_forced-colors.css`、`screenshot.spec.ts`、新增測試） |
| D114-A | S2 維持現狀，看板記為刻意 |
| D115（使用者：「都處理」） | S5（收緊 gallery 容差）與 S6（三個已知失敗）都在本批處理。**風險已告知：** 收緊容差會讓過期 baseline 爆出，所以順序是先重切再收緊（見第六節 Phase 5） |

## 六、方法（Planner 寫，RED 後定稿）

**共用量法：** `PREVIEW_URL=http://localhost:8085`，viewport 1280×900，量前注入 `*{transition:none!important;animation:none!important}` 並等 `document.fonts.ready`，每個狀態重新載入；Playwright 一律 `ignoreDefaultArgs:['--hide-scrollbars']`。像素以渲染結果為準，computed style 只讀沒有像素替代的值。證據首行宣告使用 8085，量前比對 `zk.wcs`。Verifier 不看 diff。

**階段：** Phase 1 RED（Fable）→ Phase 2 Generator A（Sonnet，P1–P4 CSS，zkcml 與 zk）→ Phase 3 build、重啟 8085、最終判定 → Phase 4 Generator B（S1 S3 S4 測試與共用檔）→ Phase 5 Verifier 跑回歸；baseline 重切（含 S6），最後才收緊 S5 容差並再跑 gallery → 提交。

### P1 toast info 圖示對比
- **J-P1-1（今天預期失敗）：** `.z-toast-info .z-toast-icon` 的 ink 色（取圖示內飽和度最高的像素）對 toast 底色的 WCAG 對比 ≥ 4.5:1。RED 記錄今天的數字（token 算出 3.68；看板記 3.13）。
- **保護項：** (a) 注入 `:root{--zk-toast-accent:#6750a4}` 後 info 圖示色仍隨之改變（與預設的 ΔE ≥ 10）；(b) warning／error 圖示、close 圖示、三種底色、尺寸與位置不變（ΔE ≤ 1，±0px）；(c) forced-colors 下圖示可見。

### P2 notification 與 toast 同色階
- **J-P2-1（今天預期失敗）：** 同嚴重度（info、warning、error）notification `.z-notification-content` 底色與 toast `.z-toast-content` 底色 ΔE ≤ 2。
- **J-P2-2（今天預期失敗）：** notification info 圖示對底色對比 ≥ 4.5:1（與 P1 同一標準）。
- **J-P2-3：** 四個方向的箭頭（`-left -right -up -down`，各開一個例子）顏色與 content 底色 ΔE ≤ 2。RED 要記錄今天各方向的箭頭色；已知 left 用 `status-*` 色，預期失敗。
- **保護項：** 尺寸、位置、字型、關閉鈕、不透明（沿用既有測試 `variant-backgrounds-are-opaque`）、forced-colors、`component-theming` 全過；toast 本身除 P1 外不動。

### P3 水平 navbar 下拉的巢狀縮排
- **量法：** `navbar.zul` 找水平 navbar 中帶有巢狀 `z-nav` 的下拉；若頁面沒有這種例子，RED 回報，由 Planner 決定在預覽頁加例子。量展開後每層文字 ink 左緣。
- **J-P3-1（今天預期失敗）：** 下拉內第二層的群組標題文字左緣比第一層大 12–30px（容差 ±1），第三層項目比第二層項目大 12–30px。
- **保護項：** 第一層位置、列高、hover 狀態層滿寬、垂直 navbar 與 popup 模式（已在 #51 修好）不變。

### P4 menu 列 image 與 iconSclass 文字起點
- **量法：** `menubar.zul` Project popup（含 `image` 16px 與 iconSclass 18px 混合）每列文字 ink 左緣與圖示 ink 中心。
- **J-P4-1（今天預期失敗）：** 同一 popup 內有圖示的列，文字 ink 左緣互差 ≤ 1px，圖示 ink 中心互差 ≤ 1px。
- **保護項：** #48 的混合（iconSclass 列與巢狀 `z-menu`）仍 ≤ 1px；列高、列距、圖示尺寸（16／18）、hover 層、右側箭頭、水平 menubar 不變。

### S1 selectbox forced-colors 規則搬到 `_forced-colors.css`
- **判定：** 搬移後 `selectbox.css` 不再有 `forced-colors` 區塊；`_forced-colors.css` 有對應規則，緊鄰 combobox caret (2e)。forced-colors 下 selectbox 箭頭 ink 非空且與搬移前相同（ΔE ≤ 1、外框 ±0）。非 forced-colors 外觀不變。**開工前先 `git status`：若 `_forced-colors.css` 有 A 線未提交修改，停下問。**

### S3 修空轉測試
- `screenshot.spec.ts` 的 `shell-is-bare-and-icon-clears-stripe`：第三條斷言改為守住「色條不存在」（`stripeWidth === 0`）並保留圖示距內容左緣 ≥ 8px；測試名稱改為如實反映。**非空轉驗證：** Verifier 在 scratchpad 的複本中注入 `.z-notification-content::before{content:'';display:block;width:4px}`，測試必須失敗。

### S4 捲軸欄位測試
- 新增一個測試（放在 listbox 相關的既有 spec 內），以不隱藏捲軸的 Chromium 開 `listbox-header.zul` 與 bandbox popup：`th.z-listhead-bar` 寬度 > 0（證明捲軸欄位真的存在，不空轉），且底色與同列其他 `th` ΔE ≤ 2。**非空轉驗證：** 注入 `th.z-listhead-bar{background:rgb(240,244,250)}` 的複本必須失敗。

### S5、S6 測試工具
- **S6：** 先查三個已知失敗各自的原因（`calendar-tablet` 含 #6 的一段；`slider-tablet`；`grid-header-gallery` 的字型競態）。原因是過期 baseline 才重切；若是真迴歸，停下回報。`grid-header` 重切後連跑三次確認穩定。
- **S5：** 先以試跑量出「容差降為 0.002（約 1,800 px）」時 gallery 的失敗清單，逐張歸因為過期或雜訊。過期者用 `--update-snapshots=changed` 重切並在紀錄揭露；雜訊多到無法穩定時，容差取能穩定通過的最小值並記錄。最後一步才改 `gallery-scan.spec.ts:73`，再連跑兩次 gallery 全綠。

## 七、RED 結果與方法定稿（2026-10-09）

報告 [../gates/batch14-red.md](../gates/batch14-red.md)，證據 `gates/batch14-red/`，結論 `RED14: METHOD-DEFECTS`。8085 伺服的是現行 build。

**今天的實測：** P1 toast info 圖示 3.68:1（看板的 3.13 不是對這個底色，**數字更正，不影響結論**）；P2 底色 ΔE info 5.07／warning 11.97／error 13.54，notification info 圖示 3.88:1，left 箭頭用 `status-*` 實色（ΔE 52–79），warning／error 的 right／down 箭頭因半透明透出陰影（ΔE 2.11／4.22）；P3 水平下拉的巢狀群組標題比同層項目少 26.5px；P4 image 列與 iconSclass 列文字起點差 2.5px，圖示 ink 中心只差 1.0px；S6 三個失敗**都是過期 baseline、可重現**（沒有字型競態，calendar-tablet 也沒有「多一段」）。

**方法修正（定稿後不再改）：**
1. **P3 改量「對齊同層項目」，不量第三層。** 水平下拉內的巢狀清單今天畫不出來（巢狀 ul 被 `.z-navbar-horizontal .z-nav > ul` 設成 absolute，再被 `overflow:hidden` 裁掉），是另一個缺陷，**依 R9 不在本批修，列 follow-up**。J-P3-1 改為：巢狀群組標題文字 ink 左緣與同一下拉內同層 navitem 的 ink 左緣差 ≤ 1px；第三層只用 DOM 的 `padding-left` 判定（比其父群組標題多 26px），不用像素。
2. **P4 的圖示中心判準收緊為 ≤ 0.5px**（今天 1.0，沒有鑑別力）；文字 ink 左緣互差 ≤ 1px 不變。修後文字起點不限定是 +42 或 +44，只要求同 popup 內一致，且圖示尺寸（16／18）不變。
3. **J-P2-3 取樣區：** 箭頭三角形內部、距 content 邊 ≥ 2px；info 的 right／up／down 今天是 `surface-container-highest`（非 `status-info`）。修後四個方向對 content 底色 ΔE ≤ 2，且不再透出陰影。
4. **P1 最終 run 用像素 ink 比 ΔE**（warning／error 的 computed 是 oklch 相對色字串，不可直接比）。
5. **S6：** 三個都符合「過期才重切」，重切後各連跑兩次確認為零差。
6. popup 模式列高 36、水平下拉 40 是今天的事實，保護項以此為準。

## 八、結果（2026-10-09）

- **D116-A（使用者）：** 圖示改回 `color: var(--zk-toast-accent)`，旋鈕預設值改為 `color-mix(in srgb, var(--zk-color-status-info) 80%, var(--zk-color-on-surface))`（動共用檔 `_component-theme.css` 一行，同 D84-A 做法）。`toast.css` 因此與批次前相同。
- **GATE14-FINAL-R2：** 所有 CSS 判定通過（[../gates/batch14-final-r2.md](../gates/batch14-final-r2.md)）：P1 3.68 → 4.85:1，旋鈕 `#6750a4` 原樣呈現；P2 底色 ΔE 0／0／0、箭頭 12 格 ΔE 0、notification info 圖示 4.85:1；P3 標題與同層項目差 −26.5 → 0.5px；P4 文字起點差 2.5 → 0.5px、圖示中心差 1.0 → 0。component-theming 回到 107/0。未歸因失敗 0。R2 唯一失敗是 S4 新測試自己的 selector（`label` 應為 `.z-label`），Planner 修正並補上等待捲軸欄位寬度的 poll；修後兩個測試通過，bandbox 測試以注入 `th.z-listhead-bar` 底色的腳本證明非空轉（量到 `rgb(240,244,250)` 對 `rgba(0,0,0,0)`）。
- **S1：** 規則在 `_forced-colors.css` 以獨立規則 `(2e-cont)` 存在；Verifier 發現 minifier 把它併進 (2e) 的 selector list，**這個隔離在 served CSS 不存在**（不支援 `::picker-icon` 的瀏覽器會讓整條失效，連 combobox 規則一起掉）。目前支援的瀏覽器都沒問題，記為 follow-up。
- **S3：** 測試改名 `shell-is-bare-and-no-stripe`，注入 4px `::before` 後失敗（`Expected 0 Received 4`）。
- **S6：** 三個已知失敗都是過期 baseline，已重切並各連跑兩次零差：`calendar-tablet`、`slider-tablet`、`grid-header-gallery`。同時重切 merge-1 已列的 `toolbar-tablet`、`biglistbox-tablet`、`panel-tablet`、`selectbox-tablet`（A 線元件，早已過期）、`component-theming-gallery`，以及本批的 `toast-gallery`。
- **S5（未做，待裁示 D117）：** 試跑把 `maxDiffPixelRatio` 降為 0.002，gallery **82 個中 49 個失敗**（5,000–10,000 px，約 0.5–1%）。意思是容差現在吸收了大量累積的變化，收緊就得盲目重切 49 張，會把真正的迴歸一起蓋掉。已還原為 0.01，`gallery-scan.spec.ts` 沒有變更。
- **Follow-ups（新增）：** 水平 navbar 下拉內的巢狀清單被 `overflow:hidden` 裁掉，今天看不到第三層；menu popup 的 image 類圖示現在多 1px 邊距；notification／menubar／navbar gallery 的像素已變但在 1% 內。

## 九、S5／D117／D118 結果（2026-10-10）

- **D117（使用者）：** 只有預覽頁標題文字差異的頁面視為預期變更，重切 baseline。根因是 `47d26068ed`（2026-09-11）把字型 utility class 從外層 `<div>` 搬到 `<label>`，baseline 早於它。Verifier 逐頁分類（[../gates/batch14-gallery-classify.md](../gates/batch14-gallery-classify.md)）：37 頁 HEADING-ONLY（`d1f67d8f17` 已重切，連跑兩次全過）、11 頁 OTHER。
- **D118-B（使用者）：** 11 頁一起處理並收緊容差。9 頁是早期 commit 的預期變更（grid 欄頭左移 4px、selectbox chevron 與 radio 字級、rating 圖示、chosenbox chip、anchor 間距）；`progressmeter` 與 `barcode` 原本被判為不穩定。
  - `progressmeter`：根因是 widget JS 逐步更新 fill 的 inline width（擷取瞬間 84%，約 1.5s 後 100%），`transition-duration:0` 擋不住。`gallery-scan.spec.ts` 加一段 `waitForFunction`，等每個 `.z-progressmeter-image` 寬度等於 `aria-valuenow`（其他頁無此元素，等於不執行）。
  - `barcode`：Verifier 說連擷兩次差 321px，但我用預設 context（Desktop Chrome）連擷四次，雜湊完全相同（`fa6f49`），3 秒後也相同；判定是 Verifier 自己擷取環境的差異，不是頁面不穩。重切後連跑三次全過。
  - 11 頁重切後各連跑三次全過；容差由 `0.01` 收緊為 `0.002`，**整個 gallery 82/82 連跑兩次全過**。
- **S5 完成。** 容差約 1,800px（1280×704），原本約 9,000px。
