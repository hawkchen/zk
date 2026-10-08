使用 8105

# GATE72-FINAL：#72 Window X 鈕 hover 中性（D80-B 所有 Window 一起改；D84-A 保留 `--zk-window-close-hover-bg` 旋鈕、改預設值）

日期：2026-10-08。Verifier 只量測、不修改；只寫入本目錄。方法依 `lines/line-b-plan.md`「### J72」小節；RED 數值取自 `gates/batch9-red/red72.json`。

## 1. build 確認

`GET /web/messagebox.zul`（127.0.0.1:8105）回 200，頁面引用 `/zkres/web/80d82a1a/zul/css/zk.wcs`（RED 當時是 `80d82a3c`，build hash 已不同）。該 `zk.wcs`（539,745 bytes）含：

- `z-window-close:hover{background-color:var(--zk-window-close-hover-bg);color:var(--zk-color-on-surface)}` — 符合指定字串
- `--zk-window-close-hover-bg:var(--zk-window-icon-hover-bg)`（整份 wcs 僅此一處定義）
- `.z-window-icon:hover{background-color:var(--zk-window-icon-hover-bg);color:var(--zk-color-on-surface)}`

判定：伺服的是新 build，繼續量測。

## 2. 摘要表

像素皆為 DPR 2 截圖內部（inset 6px）中位數；ΔE 為 CIE76。「現在」四個視窗（messagebox Question、messagebox Error、embedded、overlapped）數值完全相同，表中合併列出。

| 編號 | 項目 | RED | 現在 | 判定 |
|---|---|---|---|---|
| J72-1 | close hover 背景像素 vs 同視窗非 close 圖示鈕 hover 背景 | close (254,205,199)；參考鈕 RED 未量 | close (240,244,250)；參考鈕 (240,244,250)；**ΔE = 0.00**（≤ 3） | 通過 |
| J72-1 | close hover computed `color` vs 參考鈕 | close `oklch(0.375 0.154 26.4)` | close `rgba(0, 0, 0, 0.87)` = 參考鈕 `rgba(0, 0, 0, 0.87)` | 通過 |
| J72-2 | close hover 背景 vs RED (254,205,199) | ΔE 0（即 RED） | (240,244,250)，**ΔE = 23.13**（≥ 10） | 通過 |
| P72-a | 靜止：背景／色／圓角 | `rgba(0,0,0,0)`／`rgba(0,0,0,0.6)`／`9999px`；像素 (255,255,255) | 同 RED：`rgba(0, 0, 0, 0)`／`rgba(0, 0, 0, 0.6)`／`9999px`；像素 (255,255,255) | 通過 |
| P72-a | rect（靜止與 hover 相同） | mb 832,112→864,144；emb 283,449→315,481；ovl 1226,733→1258,765（皆 32×32） | 三者逐值相同；hover 時 rect 不變 | 通過 |
| P72-b | maximize／minimize hover 值 vs RED | **RED 未量 maximize／minimize** | maximize hover：bg `rgb(240, 244, 250)`、color `rgba(0, 0, 0, 0.87)`、像素 (240,244,250)、glyph (31,32,32) | 無 RED 對照（見 §5）；記錄現值 |
| P72-c | 注入 `:root { --zk-window-close-hover-bg: #ffcc00 }` 後 close hover 像素 | — | computed `rgb(255, 204, 0)`；像素 (255,204,0)，**ΔE = 0.00** vs #ffcc00（≤ 3）；移除後 `rgb(240, 244, 250)`／像素 (240,244,250)，ΔE = 0 vs 中性值 | 通過（四個視窗皆同） |
| P72-d | 點 X 鈕關閉 | — | messagebox（Question／Error）：點後 `.z-messagebox-window` 消失；embedded：`.z-window` 12→11；overlapped：11→10 | 通過 |
| P72-d | 鍵盤聚焦 focus ring | RED 未量 | Tab 到 close：`:focus-visible` 為真、outline `rgb(0, 95, 204) auto 1px`、box-shadow none；程式 focus 時 close 與參考鈕 outline／box-shadow 逐字相同 | 通過（close 與參考鈕一致；無 RED 對照） |
| P72-e | forced-colors 回歸 | — | 17 passed、0 failed（§4） | 通過 |

補充：hover 時圖示 glyph 像素中位數 (31,32,32)，與 RED 的 (127,0,10) ΔE = 60.58（不再是 error 色族的深紅）。

## 3. 細節與截圖

腳本：`final72.js`（從 `batch9-red/red72.js` 複製，調整見 §5）、`lib.js`（原樣複製）。原始數據 `final72.json`、console `final72.log`。

| 視窗 | 頁面／開法 | 參考鈕 | rest 截圖 | hover 截圖 | 參考鈕 hover | 旋鈕注入 |
|---|---|---|---|---|---|---|
| messagebox（Question） | `/web/messagebox.zul`，點「Question」 | 無 maximize／minimize → 複製 close 節點、className 改為 `z-window-icon`，插在 close 左側（§5） | `final72-messagebox-rest.png` | `final72-messagebox-hover.png` | `final72-messagebox-ref-hover.png` | `final72-messagebox-knob.png` |
| messagebox（Error，RED 也有量，附帶） | `/web/messagebox.zul`，點「Error」 | 同上 | `final72-messagebox-error-rest.png` | `final72-messagebox-error-hover.png` | `final72-messagebox-error-ref-hover.png` | `final72-messagebox-error-knob.png` |
| embedded | `/web/window.zul`，`.z-window-embedded:not(.z-window-noborder)` 第一個（「With Title」，有 maximize／minimize） | 真實 `.z-window-maximize` | `final72-embedded-rest.png` | `final72-embedded-hover.png` | `final72-embedded-ref-hover.png` | `final72-embedded-knob.png` |
| overlapped | `/web/window.zul`，`.z-window-overlapped:not(.z-window-noborder)` 第一個 | 真實 `.z-window-maximize` | `final72-overlapped-rest.png` | `final72-overlapped-hover.png` | `final72-overlapped-ref-hover.png` | `final72-overlapped-knob.png` |

每個視窗的數值（四者相同）：

- rest：computed bg `rgba(0, 0, 0, 0)`、color `rgba(0, 0, 0, 0.6)`、icon `::before` 色同、radius `9999px`；像素 (255,255,255)（header 白底）。
- hover：computed bg `rgb(240, 244, 250)`、color `rgba(0, 0, 0, 0.87)`；像素內部 (240,244,250)、glyph (31,32,32)、glyph 像素數 156（與 RED 的 156 相同 → 圖示形狀未變）。
- 參考鈕 hover：computed bg `rgb(240, 244, 250)`、color `rgba(0, 0, 0, 0.87)`；像素 (240,244,250)、glyph (31,32,32)。
- messagebox header：bg `rgb(255, 255, 255)`、color `oklch(0.23 0.0726 260.564)`，與 RED 相同。
- 目視：`final72-messagebox-hover.png` 右側 close 為淡藍灰圓形狀態層、深灰 X；`final72-messagebox-knob.png` 為黃色 #ffcc00 圓形；`final72-embedded-ref-hover.png` 為 maximize 鈕同色狀態層。

## 4. 回歸

`cd zkpreview && PREVIEW_URL=http://127.0.0.1:8105 npx playwright test --config src/test/playwright/playwright.config.ts ...`，`--output` 指到本目錄；未用 `--update-snapshots`。

| 套件 | 指令／log | 結果 |
|---|---|---|
| `component-theming`、`hit-target`、`focus-scan`、`forced-colors` | `--project=component-theming --project=hit-target --project=focus-scan --project=forced-colors --reporter=list --output <本目錄>/pw-regression`（`pw-regression.log`） | **184 passed、47 skipped、0 failed**（2.2m）。分項：component-theming 107、focus-scan 57（+47 skipped，全是既有 skip，數量同批次 9／11 最終判定）、forced-colors 17、hit-target 3 |
| `chromium`、`gallery`，`-g 'window\|messagebox\|panel\|caption'` | `--project=chromium --project=gallery -g 'window|messagebox|panel|caption' --reporter=list --output <本目錄>/pw-visual`（`pw-visual.log`） | **7 passed、0 failed**（4.7s）：chromium `window › gallery`、`panel › gallery`、`container-header-height › window header…`、`… panel header…`、`important-removal-guards › messagebox button row…`；gallery `caption`、`messagebox` |

- baseline 像素差清單：**無**。`pw-visual/` 與 `pw-regression/` 目錄為空（Playwright 沒有產生任何 diff／actual 檔），所有截圖比對通過。
- 已知失敗（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）：不在本次 -g 範圍內，未執行，無需排除。
- component-theming 有無斷言 `--zk-window-close-hover-bg` 或 error-container：**沒有**。`component-theming.spec.ts` 內 grep `window-close-hover`、`error-container` 皆無結果；與 window 相關的測試只有 `window — regional surface/radius override, sibling untouched`（:77）與兩個 messagebox 測試（:711、:721，量 header border 與 `--zk-messagebox-bg`），皆未觸及 close 鈕 hover。:826 提到「close button's icon is pinned to on-surface」的是 toast，與 window 無關。
- forced-colors（P72-e）：17 passed、0 failed，無新失敗。

## 5. 方法缺陷與腳本調整

腳本相對 `red72.js` 的調整（全部列出）：

1. 輸出檔名 `red72-*` → `final72-*`；新增每個視窗的 rest 截圖、參考鈕 hover 截圖、旋鈕截圖。
2. `colors()` 多讀 `outline`、`boxShadow`、`:focus-visible`（P72-d 用）；`measure()` 把像素計算抽成 `pixels()` 供 rest／hover／旋鈕共用，演算法不變（inset 6px 中位數、glyph = ΔE ≥ 20）。
3. 新增 `refSelector()`：同視窗內找 `.z-window-maximize`，沒有則 `.z-window-minimize`，再沒有則複製 close 節點並把 className 改為 `z-window-icon`（以 `data-j72` 屬性定位）。messagebox 走到第三種；embedded／overlapped 用真實 maximize。
4. 新增 `knob()`（`addStyleTag` 注入 → hover → 移除 → hover）與 `focusAndClose()`（程式 focus、從參考鈕 Tab 到 close、點 close 後檢查 DOM）。
5. 同一頁面上 embedded 關閉後接著量 overlapped（RED 在同一頁面依同順序量兩者；關閉 embedded 不影響 overlapped 的 rect，由 rect 與 RED 相同證實）。

方法上的缺陷／歧義（如實回報，未自行改方法）：

- **P72-b 無 RED 對照**：RED（`red72.json`）只量了 close 鈕，沒有 maximize／minimize 的 hover 值，因此「與 RED 相同」無法直接判定；本報告只記錄現值（`rgb(240, 244, 250)`／`rgba(0, 0, 0, 0.87)`）。間接證據：close 現在的 hover 值 = maximize 現在的 hover 值，而 RED 的 close 值 ≠ 現值，表示改動落在 close 這一側。
- **messagebox 的參考鈕是合成的**：messagebox 沒有 maximize／minimize，方法寫「用 `.z-window-icon` 的 hover 值」，我用「複製 close 節點、class 只留 `z-window-icon`、插進同一 header」取得；這等於在相同 DOM 脈絡下量 `.z-window-icon:hover`，但不是頁面原有的節點。截圖 `final72-messagebox-*.png` 左側多出的 X 就是這個複本。
- **P72-d focus ring 無 RED 對照**：RED 未量 focus；只能證明 close 與參考鈕的 focus 樣式相同、Tab 可到達且 `:focus-visible` 生效。
- 「鍵盤聚焦」用的是從參考鈕按 Tab；messagebox 的參考鈕是複本（DOM 中位於 close 之前），Tab 一次確實落到 close。
- gallery project 以 -g 過濾後只跑到 `caption`、`messagebox`（gallery-scan 沒有名為 window／panel 的測試），window／panel 的 gallery 截圖由 chromium project 的 `window › gallery`、`panel › gallery` 涵蓋。

## 6. 結論

J72-1、J72-2 通過；P72-a、P72-c、P72-d、P72-e 通過；P72-b 無 RED 對照，現值與 close 一致、無異常。回歸 0 失敗、0 baseline 像素差。

GATE72-FINAL: PASS
