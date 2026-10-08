使用 8105

# GATE-REBASE：B 線 `jess/line-b` rebase 到 `marble` 後的重驗證（D85-A）

- 日期：2026-10-09；Verifier：Fable；`PREVIEW_URL=http://127.0.0.1:8105`（B 線 jess-b worktree，rebase 後重啟）。Playwright 1.59.1、Chromium、viewport 1280×900、DPR 2、transition／animation 關閉；色差一律 CIE76 ΔE。
- 樹的狀態：`HEAD` = `c2be329389`，`git merge-base marble HEAD` = `1c73994864`（rebase 的基底就是 marble 上「reset button elevation on colour variants」那個提交；`1c739948643` 是 HEAD 的祖先）。B 線在其上 5 個提交。worktree 的 `marble` ref 之後又前進到 `87597fbf62`，不在本次樹內。
- 工作樹另有一個**未提交、非本人所為**的修改：`zul/src/main/resources/web/js/zul/wgt/css/button.css`（`git diff --stat`：5 insertions、5 deletions，mtime 2026-10-09 00:04）。依規則未讀其內容與 diff；只記錄存在。8105 伺服的 build 以下一節的 `zk.wcs` 為準。
- 本目錄只新增腳本、JSON、截圖與 Playwright 輸出／log；未改 CSS／TS／Java／預覽頁／baseline／文件，未 commit，未用 `--update-snapshots`。`git status --porcelain zkpreview/ doc/screenshots/` 執行前（`git-status-before.txt`，0 行）與執行後皆空；`zkpreview/test-results/` 不存在；未設 `FOCUS_SCAN_UPDATE`。

## 〇、build 確認

`GET /web/button.zul` → 200，頁面引用 `/zkres/web/80d82998/zul/css/zk.wcs`（各 gate 當時為 `80d82a23`／`80d82a3d`／`80d82a15`／`80d82a1a`，hash 已不同）。取回該 `zk.wcs`（541,642 bytes，存為 `zk.wcs.txt`）：

| 標記 | 結果 |
|---|---|
| `.z-button-text-secondary.z-button,.z-button-text-success.z-button,.z-button-text-warning.z-button,.z-button-text-error.z-button,.z-button-text-info.z-button{box-shadow:none}`（marble 合併規則） | **命中 1 筆** |
| `.z-button-text-error.z-button{…box-shadow:none…}`（B 線舊寫法，單獨帶陰影重設） | **0 筆**；實際只有 `.z-button-text-error.z-button{color:var(--zk-color-error,#d32f2f);background-color:#0000;border:none}`，不含 `box-shadow` |
| 順帶：`.z-button-outlined-secondary.z-button,…,.z-button-outlined-info.z-button{box-shadow:none}` | 命中（marble 1c739948643 的 outlined 彩色變體重設） |

→ 伺服的是 rebase 後的新 build，#4 的五行 `box-shadow: none` 已不在 B 線，改由 marble 規則提供。

## 一、J4（#4）摘要表

腳本 `rb4.js` 從 `batch10-final/final4.js` 複製，**唯一調整是輸出檔名**（`final4-*`→`rb4-*`、`final4.json`→`rb4.json`；`diff` 共 5 行，全是檔名）。`lib.js` 從 `batch10-final/` 原樣複製。P4-a 的「預期變化」處理放在本報告的判讀，不改腳本（腳本本來就只量不判）。對照值取 `batch10-final/final4.log`／`report.md`。

| 編號 | 判定 | GATE10-FINAL 數值 | 現在數值 | 結果 |
|---|---|---|---|---|
| J4-1 | 六 text 變體 × 四狀態 computed `box-shadow: none`；靜止／hover／按住 4px 環（左右上三側）ΔE ≤ 1 | 24 個 (變體,狀態) 全 `none`；環四側 ΔE 全 0（0／3904 px > 1）；聚焦只看 computed（環 77.55 為 focus outline） | **完全相同**：24 個全 `none`；靜止／hover／按住 4px 環四側 ΔE **0**（0／3904）、8px 環 0；聚焦 computed `none`，環 77.55（`z-button-text`／`-info` 底側 0，被容器裁掉，同 gate） | **通過** |
| P4-a（filled） | filled／secondary 靜止 resting、hover elevation-2 | 靜止 `rgba(50,50,93,.024) 0 2px 5px -1px, rgba(0,0,0,.05) 0 1px 3px -1px`、hover `rgba(0,0,0,.12) 0 2px 6px, rgba(0,0,0,.14) 0 1px 2px`；環 2.79／16.52 | 逐字相同；環 2.79／16.52 | 通過 |
| P4-a（`z-button-outlined`） | none／none | none／none，環 0 | none／none，環 0 | 通過 |
| P4-a（`z-button-outlined-{secondary,success,warning,error,info}`） | gate 時五顆靜止／hover 皆 resting（環 2.79） | resting／resting ×5 | **none／none ×5，環 0** | **預期變化（marble 1c739948643）**，不判失敗 |
| P4-a（iconOnly：頁面上唯一「有圖示、無文字」的按鈕，class 只有 `z-button`） | 靜止 resting、hover elevation-2 | resting／elevation-2，環 2.79／16.52，rect 46×36 | **與 gate 相同**：resting／elevation-2，環 2.79／16.52，rect 46×36 | 通過（見第四節 1：任務說明提到的「icon 按鈕重設為 none」在本頁量不到） |
| P4-b | disabled 全變體 `none` | 22 顆 none | 22 顆 none | 通過 |
| P4-c | 文字色／`::before` opacity／cursor | primary `rgb(55,111,208)`／`oklch(.54 .066 260.6)`／`rgb(46,125,50)`／`rgb(189,63,0)`／`rgb(211,47,47)`／`rgb(0,127,171)`；0／.08／.12／.12；pointer | 逐字相同 | 通過 |
| P4-d | 按鈕 rect | text 76.69×36、outlined 78.69×36、icon 46×36 | 相同 | 通過 |

J4 結論：**通過**。text 六變體 24 個 (變體,狀態) 的 computed 與像素環與 gate 逐值相同；保護項除 outlined 彩色五變體依 marble 提交變為 `none`（預期）外，其餘全部與 gate／RED 相同。

## 二、煙霧測試對照表（各 gate 腳本原樣重跑）

腳本一律複製到本目錄、**只改輸出檔名**（`finalNN-*`→`rbNN-*`、`finalNN.json`→`rbNN.json`；`rb61.js` 只改 `const P = 'final61r2'`→`'rb61'`），判定值與邏輯未動；每支腳本與原檔的 `diff` 已逐一確認只有檔名行。三個來源目錄的 `lib.js`（batch9-final／batch10-final／batch72-final）只有第 1 行註解不同，故共用 `batch10-final/lib.js` 一份。對照方式：以 `jcmp.py`（scratchpad，數值容差 0.5、字串逐字）把 gate 的 JSON 與本次 JSON 逐葉比對，另 `diff` 各 log。

| issue | 對照 gate | 比對葉數 | 不同葉數 | 不同處是什麼 | 判定項數值（gate → 現在） | 相同？ |
|---|---|---|---|---|---|---|
| #66 runtime-error | batch9-final | 217 | **0** | — | 關閉鈕右緣 864、重新整理鈕右緣 820、關閉鈕距內容右緣 0；兩鈕 32×32；圖示 `::before` 24×24、紅色像素 x 425–447 y 33–55；hover 不換位；點關閉後 `#zk_err` 消失；1 筆／2 筆順序相同（x 788／832）→ 全部相同 | **相同** |
| #71 loading | batch9-final | 257 | 31 | 全部是旋轉中圖示的瞬時 bbox／`transform` 矩陣／取樣時間戳、`z-loading` 的 uuid、像素變動分母（2704／2500 隨 bbox）——動畫相位噪音，不是判定值 | 全頁：box 569.5,424 140.58×52、gaps 上 16／下 16／左 24／右 24、dV 0、dH 0、icon offset 20×20、中心差 0、z-index 1450>1449、wait、單行、12px、陰影字串、bg rgb(232,238,247)、inline 569.5／424、中心偏 (−0.21,0)；元件級：152,523.5 159.55×52、同 gaps、89500>89000、inline 152／523.5、對 demoWin 偏 (−0.23,0) → 逐值相同；旋轉仍 running、像素變動 306／305 px（gate 312／306） | **相同** |
| #6 calendar | batch10-final | 1446 | 27 | 全部是**日期翻頁**：gate 2026-10-08 跑、本次瀏覽器 now = 10-09（UTC 16:10 = 台北 10-09 00:10），no past 的「8」由可選變 disabled、no future 的「9」由 disabled 變可選，hover 探針的可選平日由 8 改抓 9。群組數量 5→6／16→15 隨之改變 | disabled 平日與週末 computed `rgba(0,0,0,.38)`、最深像素 (98,98,98)、群內與跨群 ΔE **0**；Mar 2020 no past 31 天 .38 ΔE 0；no future 當月 ΔE 0；line-through／not-allowed／pe none；可選日 .87 (33,33,33)；選取日白字、圓盤 (55,111,208)；表頭 th `.6`；hover 可選 (237,237,237)、disabled (255,255,255) 不成立 → 全部相同 | **相同**（差異為環境日期） |
| #40 label／radio | batch10-final | 998 | **0** | — （log 亦 byte-identical） | checkbox 與 radio 皆 13px／400／20px；圓圈 20×20、內點 13×13、min-height 40；墨水中心差 +0.5／+1.5；radio 狀態色 (102,102,102)／(55,111,208)／(197,197,197)、focus outline 2px primary、`::before` 36px .12、暈 2037 px → 相同 | **相同** |
| #61 tbeditor | batch10-final2 | 6654 | **0** | — （log 亦 byte-identical） | 20 顆 svg 14×14 在 35×35 按鈕內；align-left／undo／strong 筆畫 2／1.5／1.5；最深像素 (96,98,100)／(95,97,99)，190 對兩兩 ΔE 最差 0.41、>3 為 0；opacity .6、fill／color 不透明黑；分隔線 1×35 `.12`；兩列 233／268；hover 底 primary 8%、18 顆 fill→primary 最深 (55,111,208)；dropdown 18×18 → 相同 | **相同** |
| #47 fisheyebar | batch47-final | 2179 | **0** | log 只在 `lagProbe`（transition 拖尾「立即」讀值，定稿無門檻）差 0.02–0.47px；五張截圖 `rb47-{h,v,h-magnify,v-magnify,h-back}.png` 與 gate 的 `final47-*.png` **byte-identical**（`cmp`） | 垂直／水平／magnify 六項 rect = inline，Δ 全 0；magnify 80/120/160/120/80/80；圖片 l .1／t .2／w .8／h .8；cursor pointer；標籤只在第 3 項 display block；切回水平 Δ 0；容器 80×480／480×80 @ (32,321) → 相同 | **相同** |
| #72 window close hover | batch72-final | 612 | 16 | 全部是 icon mask URL 內的 build hash（`80d82a1a`→`80d82998`）；log byte-identical | 四個視窗 close hover computed bg `rgb(240,244,250)`、color `rgba(0,0,0,.87)`、像素 (240,244,250)、glyph (31,32,32)、156 px；與參考鈕 ΔE 0；vs RED (254,205,199) ΔE 23.13；靜止透明／`.6`／9999px；rect 32×32 不變；旋鈕注入 #ffcc00 像素 (255,204,0) ΔE 0、移除後恢復；點 X 關閉；focus-visible outline 與參考鈕相同 → 相同 | **相同** |

煙霧測試結論：七個 issue 的判定值全部與各自 gate 相同（±0.5px／ΔE ±1 內；#66／#40／#61／#47 連 JSON 都 0 差異）。差異只來自動畫相位（#71）、日期翻頁（#6）、build hash（#72）、拖尾探針噪音（#47）。

## 三、回歸

`cd zkpreview && PREVIEW_URL=http://127.0.0.1:8105 npx playwright test --config src/test/playwright/playwright.config.ts …`，`--output` 指到本目錄；未用 `--update-snapshots`。執行前以 `--list` 確認 `-g` 命中的 35 個測試（27 chromium + 8 gallery）對應的 23 張 baseline 都存在於 `zkpreview/doc/screenshots/`（避免 missing 模式寫檔）。

| 執行 | 結果 | log／輸出 |
|---|---|---|
| `component-theming`、`hit-target`、`focus-scan`、`forced-colors`（全跑） | **184 passed、47 skipped、0 failed**（2.3m，exit 0）；47 skipped 全是 `focus-scan` 既有 skip，數量同前四次 gate | `pw-regression.log`；`pw/` 只有 `.last-run.json` |
| `chromium` `-g "button\|checkbox\|calendar\|label\|portallayout\|radiogroup\|tbeditor\|fisheye\|window\|messagebox"` | **27 passed、0 failed**（21.9s）：button gallery／default-{hover,focus,active}／outlined-{hover,focus,active}／color-variant-disabled-state／md3-gap、checkbox gallery／hover／focus／tristate、window gallery、radiogroup hover／focus、container-header-height window header、important-removal-guards messagebox button row、combobutton hover／focus、label-css-is-served，及 -g 子字串順帶命中的 combobox／coachmark ×3／stepbar ×2 | `pw-chromium.log`；`pw-chromium/` 只有 `.last-run.json` |
| `gallery` 同 -g | **8 passed、0 failed**（9.5s）：calendar、combobutton、fisheyebar、label、messagebox、portallayout、radiogroup、tbeditor | `pw-gallery.log`；`pw-gallery/` 只有 `.last-run.json` |

**失敗清單：無。baseline 像素差清單：無**（三個輸出目錄都沒有 expected／actual／diff 圖）。已知失敗（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）不在本次 project／filter 內。

**歸因（rebase 是否引入差異）：** 沒有任何失敗，故沒有「rebase 引入的失敗」。特別檢查任務點名的 `button-gallery`：其 baseline `zkpreview/doc/screenshots/button-gallery.png` 最後由 B 線 `d451a08460` 在 rebase **前**的樹重生（當時 outlined 彩色五變體仍有 resting 陰影），而 marble 1c739948643 未動任何 baseline；rebase 後這五顆陰影變 `none`（第一節 P4-a 實測），所以畫面確實與 baseline 不同，但 chromium project 的 `threshold 0.05` 把 resting 陰影（環 ΔE 2.79）吸收掉，測試仍 pass——與 batch10-final 報告缺陷 6 記錄的現象同一機制（當時 text 彩色變體失去同一種陰影也沒觸發失敗）。換言之 `button-gallery` 現在通過不是因為 baseline 與畫面一致，而是容差；若日後重生 button-gallery baseline，會把這個 marble 變化吸進去，這不是 B 線的改動。其餘 22 張 baseline 涉及的元件（calendar／label／portallayout／radiogroup／tbeditor／fisheyebar 由 `d451a08460` 重生；其餘為 09-11／10-06 舊 baseline）在 marble 這 5 個提交中沒有相關 CSS 變更可對應，且本次全部 pass。

## 四、方法缺陷、歧義與環境紀錄（不自行改方法）

1. **「icon 按鈕的陰影重設為 none」在 `button.zul` 量不到。** 任務說明寫 marble 1c739948643 也把 icon 按鈕重設為 `none`，但 `final4.js` 的 iconOnly 取的是頁面上唯一「有圖示、無文字」的按鈕（index 4／5），其 class 只有 `z-button`（filled），本次量到仍是 resting／elevation-2，與 gate 和 RED 完全相同。這表示 marble 的 icon 規則針對的是別的 class（本頁沒有該元素），或 `button.zul` 沒有對應樣本；本報告按定稿 P4-a「與 RED 相同」判通過，並記錄 iconOnly 現值未變。若 Planner 要驗 marble 的 icon 規則，需指定頁面與 class。
2. **工作樹有未提交的 `button.css` 修改**（5+／5−，mtime 10-09 00:04，早於本次量測開始的 00:10）。不是本人所為；依規則未讀內容。8105 的 `zk.wcs` 已確認含 marble 合併規則、不含 B 線舊寫法，所以量到的 build 與 D85-A 的描述一致；但「rebase 後的樹」與「伺服的 build」是否完全等於 `HEAD`，取決於這個未提交修改是否已進 build，本報告無法判斷，請 Planner／使用者確認。
3. **#6 的日期翻頁**：腳本依瀏覽器當日計算 no past／no future 的群組，gate（10-08）與本次（10-09）的 disabled／enabled 集合各差一天；判定（群內 ΔE、computed、刪除線）不受影響，但逐葉對照會永遠有這種差異，日後比對時需先排除。
4. **#71 的 JSON 含動畫相位值**（bbox／transform／時間戳），逐葉對照必有差異；判定值（gaps、offset、中心差）不含這些。
5. **#72 的 JSON 含 build hash**（mask URL），同上。
6. 回歸容差吸收了 marble 對 outlined 彩色變體的陰影變化（第三節），screenshot 回歸對這類 ΔE < 3 的陰影差異沒有偵測力；「0 baseline 像素差」不代表畫面與 baseline 相同。
7. `rb47.js` 的 lagProbe「立即」讀值（timing 相依、定稿無門檻）本次與 gate 差 0.02–0.47px，屬噪音，僅記錄。

## 五、結論

- build：8105 伺服 rebase 後的樹（marble 合併規則命中、B 線舊寫法 0 筆）。
- J4：text 六變體 24 個 (變體,狀態) `box-shadow: none`、環 ΔE 0，與 gate 逐值相同；保護項全部與 RED／gate 相同，唯 `z-button-outlined-{secondary,success,warning,error,info}` 靜止／hover 由 resting 變 `none`，為 marble 1c739948643 的預期變化。
- 煙霧測試：#66、#71、#6、#40、#61、#47、#72 判定值全部與各自 gate 相同。
- 回歸：184＋27＋8 passed、0 failed、0 baseline 像素差；沒有 rebase 引入的失敗（button-gallery 的 marble 變化被容差吸收，已歸因）。

GATE-REBASE: PASS
