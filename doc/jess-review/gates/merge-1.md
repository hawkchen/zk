使用 8085（marble，B 線合併後）

# merge-1：B 線（批次 9、10）合併進 `marble` 後的完整回歸

- 日期：2026-10-09（Playwright `startTime` 2026-10-08T16:33:53Z，執行 3.8 分鐘）
- 執行者：Verifier（只量測、不修改）
- zk `marble` HEAD：`22748267cc`（ZK-6112: drop the duplicated text button shadow and refresh the button baseline）；zkcml `marble` HEAD：`47047af80`（fisheye items absolute）
- 證據目錄：`doc/jess-review/gates/merge-1/`（`run.log`、`results.json`、`test-results/<test>/*-{expected,actual,diff}.png`、`diff-early.txt`、裁圖 `*-expected.png`／`*-actual.png`、量測工具 `diffpng.js`／`crop.js` 複製自 `batch6-final/`）

## 1. build 確認

- `GET /web/button.zul` → 200，`zk.wcs` href = `/zkres/web/80d82998/zul/css/zk.wcs`，帶 session cookie取回 542,352 bytes。
- 四個標記全部命中（各 1 次）：

| 標記 | 來源 | 命中 |
|---|---|---|
| `z-error #zk_err-remove-btn{order:1}` | B 線 #66（runtime-error） | 1 |
| `tbeditor-button-pane svg{width:14px` | B 線 #61（tbeditor，zkcml） | 1 |
| `.z-window-close:hover{background-color:var(--zk-window-close-hover-bg);color:var(--zk-color-on-surface)}` | B 線 #72（window） | 1 |
| `.z-window-move-ghost` | A 線 #55（window drag ghost） | 1 |

→ 8085 伺服的是合併後的 `marble` build。

## 2. 方法

- `cd zkpreview && PREVIEW_URL=http://127.0.0.1:8085 npx playwright test --config src/test/playwright/playwright.config.ts --project=chromium --project=gallery --project=component-theming --project=forced-colors --project=tablet --project=hit-target --project=focus-scan --workers=2 --output=doc/jess-review/gates/merge-1/test-results --reporter=list,json`
- `playwright.config.ts` 的 `baseURL` 是 `process.env.PREVIEW_URL ?? 'http://localhost:8085'`，沒有寫死別的 port；`--list` 確認七個 project 名稱存在（chromium 132、gallery 82、component-theming 107、forced-colors 17、tablet 55、hit-target 3、focus-scan 104）。
- 沒有 `--update-snapshots`、沒有 `UPDATE_FONT_BASELINE`、沒有跑 `forced-colors-gallery`。
- 像素量法：Playwright 自己的數字（`run.log`）＋ `diffpng.js`（任一通道 >8 的像素數、首末差異列、100px 帶狀分佈），裁圖以 `crop.js` 從 expected／actual 各切一張比對。
- `git status --short` 執行前後比對：**唯一差異是新增 `?? doc/jess-review/gates/merge-1/`**；`zkpreview/` 下 0 行變動（`zkpreview/doc/` 沒被改），共用 `zkpreview/test-results/` 的 mtime 仍是 Oct 8 15:47（本次沒寫進去）。

## 3. 各 project 結果

| project | passed | failed | skipped | 備註 |
|---|---|---|---|---|
| chromium | 131 | 1 | 0 | `tree › gallery` |
| gallery | 79 | 3 | 0 | `component-theming`、`grid-header`（已知）、`grid-paging` |
| component-theming | 107 | 0 | 0 | — |
| forced-colors | 17 | 0 | 0 | — |
| tablet | 49 | 6 | 0 | `calendar`（已知）、`slider`（已知）、`toolbar`、`biglistbox`、`panel`、`selectbox` |
| hit-target | 3 | 0 | 0 | — |
| focus-scan | 57 | 0 | 47 | skipped 與前幾批相同（47） |
| **合計** | **443** | **10** | **47** | exit 1 |

批次 6 的上一次完整回歸（2026-10-08，合併前）是 450 passed／3 failed（三個已知）／47 skipped；測試總數相同（500），本次多了 7 個失敗。

## 4. 失敗清單與歸因（已知三項另列第 5 節）

像素數欄：「PW」= Playwright 回報；「>8」= `diffpng.js` 任一通道 >8 的像素數。diff 圖都在 `test-results/<目錄>/<名稱>-diff.png`。

| # | 測試 | project | 錯誤摘要 | PW 像素 | >8 像素／差異列 | 看到的變化（裁圖） | 歸因 |
|---|---|---|---|---|---|---|---|
| 1 | `tree › gallery` | chromium | `toHaveScreenshot` 失敗，尺寸相同 1280×6358 | 1,737 | 2,978；列 4038–4073、x 73–458（整頁只有這一塊） | `tree-4030-*.png`：paging-position 的 radio 文字 `top／bottom／both` 字級變小、間距縮短，後面的「Change Paging Mold」按鈕整體左移（寬度不變 345／346） | **B 線 #40（`5a4e788b12`，`.z-radio-content` 14→13px）的預期效果**；B 線只重切 `radiogroup-gallery.png`，`tree.zul` 內嵌的 radio 沒被重切。非回歸。 |
| 2 | `gallery › grid-paging` | gallery | 期望 1280×1376、實際 1280×1336（**−40px**） | 24,918（ratio 0.02） | 101,806；列 33–1307 | `gp-top-*.png`：(a) 第 3 列的 `Apple／Orange／Lemon` radio 從兩行變一行（−40px 整頁上移）；(b) baseline 標題「Grid Paging」是未載入 Inter 的 fallback 細字、實際是 Inter medium（與 `grid-header` 已知失敗同一種 font-race baseline）；(c) Head 2 的 datebox 從 122px 變 144px 寬；(d) 表頭文字左移 4px（`Index` 52→48） | **B 線 #40（radio 字級）＋既有過時 baseline**。(a) 是 B 線預期效果；(b)(c)(d) 都早於合併：baseline 最後一次是 `cd02d18943`（2026-09-11），之後批次 3（`2efcdc65c9` 表頭對齊，10-07）、批次 4（`778b5a809f` datebox cols，10-07）都沒重切這張，批次 6 全量跑時靠 1% 容差吃掉（當時 ratio 未超）。本次 (a) 把高度改掉，尺寸不符直接失敗。 |
| 3 | `gallery › component-theming` | gallery | 期望 1280×18387、實際 1280×18391（**+4px**）＋ 5s 穩定逾時 | 無（尺寸不符） | 1,068,559；列 1199–18326 | `ct-2700-*.png`：「Panel (default)」與「Panel (regional override)」兩個 `border="rounded"` panel 各多了 1px 圓角外框（各 +2px → +4px，之後整頁下移）；`ct-1800-*.png`：listbox 選取列 rgb(213,230,255)→(200,213,234)；`ct-1150-*.png`：grid 表頭文字左移 4px | **A 線 #54（`3c4c4f066a`，rounded panel 取回 1px outline）＋既有過時 baseline**。panel 外框是 A 線預期效果，A 線只重切 panel／tabbox／borderlayout 自己的 gallery，`component-theming.zul` 內嵌的 panel 沒被重切；選取列色（批次 2 `da217e4d6a`，10-06）與表頭對齊（批次 3）早於合併，baseline 最後一次是 `43d2a7d4ee`（2026-09-11）。 |
| 4 | `tablet-toolbar › gallery` | tablet | 期望 834×1539、實際 834×1495（**−44px**） | 620 | 2,147；列 1394–1470、x 32–367 | `tb-1370-*.png`：overflow toolbar 的「Print」不再換到第二行，改成同一行＋右側「…」溢位鈕 | **A 線批次 11（`7e88ecd117`，toolbar overflow popup icon／wrapping／width）的預期效果**；A 線沒跑 tablet，`toolbar-tablet.png` 最後一次是 `5c4888e54a`（2026-09-12）。 |
| 5 | `tablet-biglistbox › gallery` | tablet | 尺寸相同 834×1112 | 38 | 120；列 493–554、x 233–633 | `bl-480-*.png`：頁面控制列的兩個 selectbox 箭頭由實心 ▼ 換成 chevron | **A 線批次 7 #29（`c86505884b`，selectbox 箭頭改用 combobox chevron）的預期效果**；`biglistbox.zul` 內嵌 selectbox。`biglistbox-tablet.png` 最後一次是 `42fec29a7f`（2026-10-07，批次 4，早於 #29 的 10-08）。 |
| 6 | `tablet-panel › gallery` | tablet | 期望 834×2510、實際 834×2514（**+4px**） | 15,195 | 59,479；列 186–2445 | `pn-170-*.png`：第一個 panel 多了 1px 圓角外框，之後各 rounded panel 同樣，整頁累積下移 | **A 線 #54（`3c4c4f066a`）的預期效果**；`panel-tablet.png` 最後一次 2026-09-12，A 線只重切 `panel-gallery.png`。 |
| 7 | `tablet-selectbox › gallery` | tablet | 尺寸相同 834×442 | 56 | 181；列 199–358、x 128–567 | `sb-190-*.png`：三個 selectbox 箭頭 ▼ → chevron | **A 線 #29（`c86505884b`）的預期效果**；A 線重切了 `selectbox-gallery／hover／focus.png`，沒重切 `selectbox-tablet.png`（2026-09-12）。 |

**使用者提交 `1c73994864`（button 彩色變體 elevation、treecol align）：** 沒有可歸因的失敗。`button-gallery.png` 在 B 線 rebase 後已重切（`22748267cc`，含使用者提交後的狀態），chromium 的 button 全數通過；`tree › gallery` 的差異只有列 4038–4073 的 radio 區，tree 本體（含 treecol）0 差異列。

**B 線其餘元件（button、calendar desktop、checkbox、label、portallayout、tbeditor、fisheyebar、window、messagebox、runtime-error／errorbox、loading）：** chromium／gallery 全數通過。

## 5. 已知失敗狀態

| 已知失敗 | 本次 | PW 像素 | >8 像素／差異列 | 與批次 6（合併前）比較 |
|---|---|---|---|---|
| `calendar-tablet` | 失敗 | 1,145 | 1,754；列 1425–2404 | 批次 6 是 1,088 px、兩區 y 1425–1474／1914–1963（datebox 邊框）。**本次多了 y 2200–2404 一段（666 px）**：`cal-2200-*.png` 顯示 disabled 月曆的週末日期由深色變成 disabled 灰 = **B 線 #6（`5a4e788b12`）的預期效果**，B 線只重切 `calendar-gallery.png`，tablet 沒動。仍歸已知失敗，但 baseline 重切時要含這段。 |
| `slider-tablet` | 失敗 | 2,354 | 16,727；列 852–1001 | 與批次 6 **完全相同**（2,354／16,727）。 |
| `grid-header-gallery` | 失敗 | 無（尺寸 4525 vs 4522） | 131,206；列 33–4455 | 批次 6 是 131,116、同樣 3px 高度差、同樣從 y=33 標題列開始（font-race baseline）。差 90 px 屬抗鋸齒雜訊。 |

## 6. 無法歸因項

無。七個新失敗全部對得上單一提交（第 4 節），且每一個都是「提交的預期效果落在沒被重切的其他頁面／tablet baseline」或「合併前就過時的 baseline」，沒有看到與任何提交無關的像素變化。

## 7. 方法缺陷／備註

1. **`component-theming` 的失敗同時帶 `Timeout 5000ms`（穩定逾時）**：這頁 18k px 高，verification.md 列的重型頁面一向會碰到；但本次還有 +4px 的尺寸不符，所以不是純 flake，量測以尺寸與裁圖為準。
2. **1% 容差掩蓋了既有的過時 baseline**：`grid-paging-gallery.png`、`component-theming-gallery.png` 兩張從 2026-09-11 起沒重切，批次 2／3／4 的變化都被 `maxDiffPixelRatio 0.01` 吸收，直到本次有高度變化才爆出來。歸因時我用的是「差異帶對到的提交日期 vs baseline 最後提交日期」，不是 `git stash`。
3. **兩條線都沒跑 tablet**（平行線文件第八節的分工），所以 A 線 #29／#54／批次 11 toolbar 的 tablet baseline 都還是 09-12 的，這是制度上可預期的結果，不是漏驗。
4. 已知失敗 `calendar-tablet` 的內容已經變了（多了 B 線 #6 的一段），「已知」的像素數不再是 1,088，重切時請一併帶上。
5. 量測時另外啟了 headless Chromium 跑 `diffpng.js`／`crop.js`（在 Playwright 跑完前就先量了前三個失敗），機器負載略高於 `--workers=2`，但不影響結果（diff 圖是 Playwright 寫的，我只讀）。

## 8. 待 Planner 處置（非本報告範圍，列出供參考）

- 重切（`--update-snapshots=changed`，只動列出的檔）：`tree-gallery.png`、`grid-paging-gallery.png`（B #40）；`component-theming-gallery.png`、`panel-tablet.png`（A #54）；`toolbar-tablet.png`（A 批次 11）；`biglistbox-tablet.png`、`selectbox-tablet.png`（A #29）；`calendar-tablet.png` 若要解已知失敗，現在含 B #6。
- 重切前請先對照本報告裁圖確認沒有其他夾帶變化（`grid-paging`、`component-theming` 兩張有多個批次的累積差異）。

MERGE1: PASS
