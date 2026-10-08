使用 8105

# Jess review B 線批次 9 — RED run 報告（2026-10-08）

- 預覽站：`http://127.0.0.1:8105`（B 線，jess-b worktree），未修改任何 CSS／TS／Java／預覽頁；本目錄只新增量測腳本、原始 JSON 與截圖。
- 工具：Playwright 1.59.1（jess-b `zkpreview/node_modules`），Chromium，viewport 1280×900，DPR 2（J1 另跑一次 DPR 1）。量測前注入 `transition:none; animation:none`（J71 的旋轉圖示除外）。
- 腳本：`lib.js`（抄自 batch6-final，改指 jess-b 與 8105）、`red66.js`、`red71.js`、`red1.js`、`red72.js`；DOM 探測 `probe-dom.js`、`probe-errorbox.js`、`probe-errorbox2.js`；`crop.js` 只做放大裁圖。原始數值在同名 `.json`。
- 判定依 `lines/line-b-plan.md` 第七節，RED 期望：判定（J）今天失敗、保護項（P）今天通過。

## 一、結論摘要表

| 編號 | 判定 | RED 結果 | 數值 |
|---|---|---|---|
| J66-1 | 關閉鈕右緣 > 重新整理鈕右緣，且與內容右緣 ≤ 1px | **失敗**（符合 RED） | 1 筆／2 筆相同：關閉鈕右緣 820、重新整理鈕右緣 864、`#zk_err-p` 內容右緣（880 − padding-right 16）= 864；關閉鈕距內容右緣 44px |
| P66-a | 兩鈕可見、各 32×32；`.errornumbers` 右緣 ≤ 較左鈕左緣 | 通過 | 兩鈕皆 32×32、可見；`.errornumbers` 右緣 776 ≤ 關閉鈕左緣 788 |
| P66-b | 錯誤圖示在最左、24×24 | 通過 | `#zk_err-p::before` 24×24；紅色像素邊界 x 425–447（內容左緣 424，+1px）、右緣 447 < `.errornumbers` 左緣 460 |
| P66-c | 點關閉鈕後 `#zk_err` 消失；重新整理鈕不換位 | 通過（見缺陷 6） | 點關閉鈕後 `#zk_err` 自 DOM 移除；游標停在重新整理鈕上，關閉鈕 rect 不變；點重新整理鈕後 `#zk_err` 移除、1.5s 內未觀測到導航 |
| P66-d | 1 筆與 2 筆錯誤順序一致 | 通過 | 兩次皆 關閉鈕 x=788、重新整理鈕 x=832 |
| J71-1 | 全頁 `.z-loading` 上下／左右間距差 ≤ 1px | **失敗**（符合 RED） | 間距 上 16／下 21／左 24／右 24 → 垂直差 5px、水平差 0 |
| J71-2 | 元件級 `.z-apply-loading` 同上 | **失敗**（符合 RED） | 間距 上 16／下 21／左 24／右 24 → 垂直差 5px、水平差 0 |
| P71-a | absolute、z-index 高於遮罩、cursor wait | 通過 | 全頁：absolute、z-index 1450 > `.z-modal-mask` 1449、wait；元件級：absolute、89500 > `.z-apply-mask` 89000、wait |
| P71-b | 圖示 20×20、仍在轉；圖示與文字垂直中心差 ≤ 1px | 通過 | offsetWidth/Height 20×20；260ms 內 transform 矩陣改變、圖示像素變動 307/2704（全頁）、311/2500（元件級）；中心差 0 |
| P71-c | 單行；圓角、陰影、底色 | 通過（基準已記錄） | 文字 1 個 client rect、nowrap；radius 12px；shadow `rgba(0,0,0,.12) 0 4px 12px, rgba(0,0,0,.14) 0 2px 4px`；底色 rgb(232,238,247) |
| P71-d | 框位置（inline left/top）基準 | 已記錄 | 全頁 inline left 569.5／top 421.5，框中心對 viewport 中心偏 (−0.21, 0)；元件級 left 152／top 521，對 demoWin 中心偏 (−0.23, 0) |
| J1-1 | 三角底邊貼內容邊緣 ≤ 1px、中心距角 ≥ 8px | **通過**（不符合 RED，見缺陷 1） | left／right／up／down 四向：底邊距離皆 0px；中心皆在範圍內 |
| J1-2 | 三角底邊中點與內容邊框同色（ΔE ≤ 3）、無縫隙 | **通過**（不符合 RED，見缺陷 1） | 四向：邊框像素與三角底像素皆 rgb(211,47,47)，ΔE 0；三角自內容邊緣起連續 5.5px（DPR 2）／5px（DPR 1），無背景色像素 |
| P1-a | 圖示距內容左緣 12、關閉鈕距右緣 4 | 通過 | 四向皆 12／4 |
| P1-b | 內容 cursor move、寬 260 | 通過（基準已記錄） | 四向：content cursor `move`、`.z-errorbox` 寬 260、`.z-errorbox-content` 寬 244 |
| P1-c | 靜態範例逐像素基準 | 已記錄 | `red1-static.png`；`.z-errorbox` [32,186,260×54]、content cursor `default` |
| P1-d | 三角尖端距目標欄位邊緣 ≤ 8px | left／right／down 通過；up 失敗（見缺陷 2） | 尖端距欄位：left 2.5、right 2.5、down 2.5；up 對欄位**下**緣 42.5（對欄位上緣 2.5，箱子與欄位重疊） |
| P1-e | 靜態 `default`、真實 `move` | 通過 | 靜態 content `default`；真實 content `move` |
| J72（重現） | messagebox X 鈕 hover 色 | 已重現 | rest：bg 透明、color rgba(0,0,0,.6)；hover：bg `oklch(0.89 0.056 26.4)`（像素 254,205,199）、color `oklch(0.375 0.154 26.4)`（字形像素 127,0,10）。**一般 `.z-window`（embedded、overlapped）hover 值完全相同** |

## 二、各 issue 量測細節

### J66 runtime-error（`red66.js` → `red66.json`，截圖 `red66-1err.png`、`red66-2err.png`）

- 觸發：點「Trigger Error」／「Trigger Multiple Errors」。`zk.error` 的滑入是 JS 動畫，注入的 no-animation CSS 擋不住，腳本改為輪詢 `#zk_err` rect 連續兩次相同後才量（否則量到 29.5px 高的半截框，見 `probe-runtime-error-1.png`）。
- `#zk_err`（`.z-error`，fixed）[400,16,480×105]（2 筆：×125）；`#zk_err-p` [400,16,480×57]，padding 12/16/12/24（上/右/下/左）。
- `.errornumbers` [460,34,316×20]，文字「1 Errors」／「2 Errors」。
- `#zk_err-remove-btn` [788,28,32×32]（右緣 820）；`#zk_err-refresh-btn` [832,28,32×32]（右緣 864）。內容右緣 = 880 − 16 = 864，所以今天是重新整理鈕貼右，關閉鈕在其左 44px 處 → J66-1 失敗。
- 圖示：`::before` 24×24 block；紅色像素邊界 x 425–447、y 33–55（`#zk_err-p` 內容左緣 424）。
- 行為：游標移到重新整理鈕上，關閉鈕 rect 不變；點關閉鈕 800ms 後 `#zk_err` 不存在；點重新整理鈕 1.5s 內 `page.on('load')` 未觸發，`#zk_err` 亦不存在。
- 2 筆錯誤時 `.messages` 為單一元素含兩行文字（`First error message.`／`Second error message.`），按鈕位置與 1 筆完全相同。

### J71 loading（`red71.js` → `red71.json`，截圖 `red71-global.png`、`red71-component.png`）

- 動畫處理：用 `*:not(.z-loading-icon):not(.z-apply-loading-icon)` 關閉其他元素的 transition/animation，圖示保持旋轉。
- 全頁：`.z-loading` [569.5,421.5,140.58×57]，`.z-loading-indicator` [593.5,437.5,92.58×20]，`.z-loading-icon` offset 20×20（旋轉中 bbox 25.4），文字 Range rect [625.5,439.5,60.58×16]。間距 上 16／下 21／左 24／右 24。
- 元件級：`.z-apply-loading` [152,521,159.55×57]，indicator [176,537,111.55×20]，icon 20×20，文字 [208,539,79.55×16]。間距同上。
- 旋轉：全頁 `transform` 由 `matrix(0.549,-0.836,…)` 變為 `matrix(0.449,0.894,…)`（265ms），animation-name `z-loading-spin`、play-state running；元件級同。
- 圖示中心 y = 文字中心 y（447.5／547），差 0。

### J1 errorbox（`red1.js` → `red1.json`、`red1-dpr1.json`）

設計師畫面重現：`usecase/index.zul` → 點「Item Detail」→ SKU 欄位（右半欄、`constraint="no empty"`）打一字再刪、Tab（按鍵之間要留 300ms，連打太快 ZK 不會驗證）。箱子出現在欄位左側、三角在箱子右側指向欄位，方向 class `z-errorbox-right`，截圖 `red1-designer-repro.png`（DPR 1：`red1-designer-repro-dpr1.png`）。**今天的畫面裡三角與箱子是貼合的**（局部放大 `red1-designer-repro-crop.png`、`red1-right-pointer.png`），和 `i1-1.png` 的「分離感」不同。

各方向取得方式與數值（DPR 2；`ptr` = `.z-errorbox-pointer` rect、`C` = `.z-errorbox-content` rect）：

| 方向 | 取得方式 | ptr | C | 底邊距離 | 中心／範圍 | 邊框 vs 三角底像素 | 三角連續長度 | 尖端距欄位 | 截圖 |
|---|---|---|---|---|---|---|---|---|---|
| left | `errorbox.zul` 200px「no empty」欄位，Tab | [228,426,12×12] | [240,420,244×58] | 0 | 432 ∈ [428,470] | (211,47,47) vs (211,47,47)，ΔE 0 | 5.5px | 2.5（欄位右緣 232） | `red1-left.png`、`red1-left-pointer.png` |
| right | usecase SKU（設計師路徑） | [769,157,12×12] | [525,151,244×58] | 0 | 163 ∈ [159,201] | ΔE 0 | 5.5px（DPR 1：5px） | 2.5（欄位左緣 777） | `red1-right.png`、`red1-right-pointer.png`、`-dpr1` 版 |
| up | `errorbox.zul` full-width 欄位，點空白處 blur | [1128,505,12×12] | [1028,517,244×58] | 0 | 1134 ∈ [1036,1264] | ΔE 0 | 5.5px | 對欄位下緣 42.5；對欄位上緣 2.5 | `red1-up.png`、`red1-up-crop.png` |
| down | 同 left 欄位，開箱前在 client 端 `zk.$(input).setConstraint('no empty,before_start')` 讓箱子開在欄位上方 | [126,404,12×12] | [40,346,244×58] | 0 | 132 ∈ [48,276] | ΔE 0 | 5.5px | 2.5（欄位上緣 412） | `red1-down.png`、`red1-down-pointer.png` |

- 像素掃描（`scan.pixels`）：沿三角中心線由內容內側 3px 掃到 bbox 外 2px。四向一致：內容底色 (254,205,199) → 1px 邊框 (211,47,47) → 三角 (211,47,47) 連續 5.5px → 抗鋸齒 (233,150,150) → 背景 (255,255,255)。邊框與三角之間沒有任何背景色像素。
- 箱子 inline style：`padding` 只在三角那一側 8px（例：left 為 `padding: 0 0 0 8px`），`.z-errorbox-content` 四向皆 244 寬、58 高。
- 觀察項（不計入判定）：
  - `red1-down-by-drag-observation.png`：把 left 箱子拖到欄位上方，`_fixarrow` 重算為 `down`，但 pointer inline 變成 `top: 11.5px; left: 80px; bottom: -4px;`——舊方向留下的 `top` 沒被清掉（`Errorbox.ts` `_fixarrow` 用 `pointer.style.top = undefined` 清值，瀏覽器視為無效值而忽略），三角落在箱子**內部**上方。這是 widget TS 行為，與 CSS 無關。
  - `red1-corner-observation.png`：拖到欄位右上方得到 `ld`（class `z-errorbox-down`、`left: 0px`），三角中心距角 6px，必然違反 J1-1 的「距角 ≥ 8px」。
- 靜態範例 `red1-static.png`：`.z-errorbox` [32,186,260×54]、pointer [152,232,12×12]、content [40,194,244×38]、icon [52,204,18×18]、close [262,204,18×18]、content cursor `default`。

### J72 messagebox X 鈕 hover（`red72.js` → `red72.json`）

| 目標 | rest bg／color | hover bg／color | hover 像素（內部中位數／字形中位數） | 截圖 |
|---|---|---|---|---|
| `.z-messagebox-window .z-window-close`（Question） | transparent／rgba(0,0,0,.6) | oklch(0.89 0.056 26.4)／oklch(0.375 0.154 26.4) | (254,205,199)／(127,0,10) | `red72-messagebox-hover.png` |
| 同上（Error 型） | 同上 | 同上 | 同上 | `red72-messagebox-error-hover.png` |
| `.z-window-embedded .z-window-close`（window.zul） | 同上 | 同上 | 同上 | `red72-window-embedded-hover.png` |
| `.z-window-overlapped .z-window-close` | 同上 | 同上 | 同上 | `red72-window-overlapped-hover.png` |

messagebox header：bg rgb(255,255,255)、color oklch(0.23 0.073 260.6)。hover 的 error 色調不是 messagebox 專屬，一般 window 的關閉鈕完全相同。

## 三、方法缺陷或歧義（不自行修改，交 Planner 定稿）

1. **J1-1／J1-2 今天四個方向全部通過**（DPR 2 與 DPR 1 皆然），無法當 RED。設計師 `i1-1.png` 的「三角和箱子分離」在現在的 build 上重現不出來（同一路徑、同一欄位）。建議：Planner 確認 GIF 的來源 build／瀏覽器；若 #1 已被先前批次順手修掉或本來就不是 CSS 問題，改列「不重現」並以 P1-a～P1-e 當回歸保護即可；或請設計師指出究竟是哪個像素間隙。
2. **P1-d 的「目標欄位邊緣」在 up 方向有歧義**：full-width 欄位的箱子不是「翻到欄位左邊」，而是 top 與欄位 top 相同、蓋在欄位右端（`red1-up-crop.png`），尖端距欄位上緣 2.5px、距下緣 42.5px。建議把 P1-d 定義為「距欄位最近一條邊 ≤ 8px」，或 up 方向改用不會重疊的欄位。
3. **down 方向在現有預覽頁取不到自然觸發**（ZK 預設 `end_before` + dodge 永遠先放右、左、下；縮小 viewport 只會捲頁）。本次用 client 端 `setConstraint('no empty,before_start')` 取得。Planner 決定是否接受此法，或在預覽頁加一個 `constraint="no empty,before_start"` 欄位（屬預覽頁修改，不在 Verifier 權限內）。
4. **拖曳換向不可用於 J1**：拖曳後 `_fixarrow` 留下舊方向的 inline `top`，三角掉進箱子裡（觀察項）。這是 `Errorbox.ts` 的問題，建議另開 ZK issue，J1 方法明寫「只量首次開啟的方向，不拖曳」。
5. **角落方向（lu/ld/ru/rd）必違反 J1-1 的「距角 ≥ 8px」**（pointer 被放在 `left/right: 0`，中心距角 6px）。建議 J1-1 明寫只適用 l/r/u/d 四個主方向。
6. **P66-c「點重新整理鈕不會把關閉鈕換位」無法照字面量**：點下去 `#zk_err` 整個消失（1.5s 內無導航）。本次改量「游標停在重新整理鈕上時關閉鈕 rect 不變」。建議改寫為 hover 版本，或刪除。
7. P71-b「圖示 20×20」要以 `offsetWidth/offsetHeight`（或 computed width/height）量，旋轉中的 `getBoundingClientRect` 是 23–25px；本次已用 offset 尺寸，建議方法文字補上。
8. J66：`zk.error` 的滑入是 JS 動畫，方法應註明要等 `#zk_err` rect 穩定再量，否則量到半截框。
9. J72／D80 參考：hover 的 error 色調來自一般 window 關閉鈕的規則（embedded、overlapped 一併相同），不是 messagebox 專屬；D80 的裁示要決定的是「所有 window 的 X 鈕」，不只 messagebox。

GATE9-RED: DONE
