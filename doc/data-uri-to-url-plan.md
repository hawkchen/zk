# D5 元件圖檔改為路徑載入：做法與結果

來源：`DOC/meeting/2026-09-30 RD-support marble introduction - meeting conclusion.md` 議題 D5。
相關文件：`doc/image-url-scenarios.md`（CE／EE／主題情境與需求對照）、`doc/data-uri-performance-claims.md`（效能事實查核）、`doc/css-variable-url-prefix.md`（變數方案評估，已被本文的做法取代）。
日期：2026-10-08。狀態：**已實作並提交於分支 `marble-d5-url-images`（`ZK10/d5/{zk,zkcml}`），尚未合併回 `marble`**。

## 1. 盤點（改動前，branch `marble`）

| 項目 | 數量 |
|---|---|
| zul 元件 CSS 內的 `url(data:...)` | 60 處（14 個檔案），去重後 27 個 SVG（約 5.8 KB），全是 `image/svg+xml` |
| zul 的 Lucide 圖示集 | 1,943 個，由 `scripts/build-css.js` 產生，佔 `norm.css.dsp` 的 86% |
| EE（zkex／zkmax）元件 CSS | 14 個（zkmax 9：signature、goldenlayout；zkex 5：colorbox，含 2 個 GIF） |
| 改動前 `zk.wcs` | 1,371,519 B（gzip 146,169 B），含 2,015 個 data URI |

會議說的「約 29 個」就是 zul 的 27 個元件圖；真正讓 CSS 變大的是圖示集。

### 對「從 git 歷史還原舊圖檔」的更正

Marble 之前的版本（`2100200284^`）沒有這 27 個圖，舊的只有 23 個 IceBlue 用的 PNG。這些 SVG 是 Marble 新畫的，不是舊圖轉成編碼，所以直接從 CSS 解碼成 `.svg` 檔。

## 2. 最終做法

**元件 CSS 直接寫 `url(~./<模組>/img/…)`，由 `WcsExtendlet` 在組好整個 `zk.wcs` 回應後，一次把所有 `url(~./…)` 換成真網址。**

```text
build（scripts/build-css.js）
  元件 CSS         mask-image: url(~./zul/img/marble/checkmark.svg)
  1,943 個圖示規則 .z-icon-x{--_icon:url(~./zul/img/icons/x.svg)}     → norm.css.dsp
  @font-face       src:url(~./zul/font/inter-latin-variable.woff2)    → norm.css.dsp
                │
請求 GET /zkres/web/<build>/zul/css/zk.wcs
                ▼
WcsExtendlet.service()
  ① include norm.css.dsp，加上整個語言的 css-uri 元件 CSS（zul、zkex、zkmax）
  ② 寫進同一個緩衝區
  ③ 緩衝區含 "~./" 時，用正規表示式找出每個 url(~./…)，
     以 Encodes.encodeURL 換成 url("/<ctx>/zkres/web/<build>/…")
     （與 DSP 的 ${c:encodeURL} 同一個方法）
  ④ gzip、寫出
```

- 路徑中的模組名（`zul`、`zkex`、`zkmax`）本來就足以讓 classpath 找到檔案，轉換不需要知道檔案屬於 CE 或 EE，所以 **CE 對 EE 零依賴**。
- 圖檔位置：zul 的 27 個在 `zul/img/marble/`（提交的 `.svg`）；圖示集每個一檔在 `zul/img/icons/`（build 產生，不提交）；EE 的在 `zkex/img/marble/`、`zkmax/img/marble/`。
- `zk.wcs` 只剩一個 `<stylesheet href="~./zul/css/norm.css.dsp"/>`，沒有任何 `<function>`。

### 曾評估、已放棄的做法

- **每個模組另開 wcs**：`WcsExtendlet` 會把整個語言的 `css-uri` CSS（約 285 KB）附加到每個 wcs 回應，會重複載入。
- **`<function>` 讀 `images.css` 並用 `--zk-img-*` 變數**（proto 的 `ThemeCSSFns.includeCSS`）：CSS 無法拼接字串、`url()` 不接受變數，所以得為每張圖寫一個完整 `url()` 的變數，再想辦法讓 CE 找到 EE 的檔案；需要 classpath 掃描與新的 `metainfo/zk/` 慣例，且掃描不經過主題解析。整份後處理能取代這整套。
- **IceBlue 的做法**：IceBlue 的 `zk.wcs` 只含 zul 兩個樣式表；每個 EE 元件的 LESS 用 `.encodeURL(background-image, '~./zkex/img/...')`，編成該元件的 `.css.dsp`，由 DSP 在請求時換網址。路徑同樣寫死在 EE 檔案裡，差別是換網址的是 DSP、且 CE 不認得 EE。去除 DSP 後改由 `WcsExtendlet` 處理，CE 與 EE 仍互不認得。

## 3. 限制

- 只轉換經過 wcs 的 CSS 中寫成 `url(~./…)` 的部分。以 `<link>` 直接載入的樣式表（`tablet.css.dsp`、`skeleton.css.dsp`）不經過 wcs；它們目前沒有圖檔。
- 轉換不查主題 jar（與 IceBlue 的 `encodeURL` 相同）。主題專屬的圖需另一種寫法，目前不支援。
- 圖示改為獨立檔案後，**會比元件晚約 0.1–0.2 秒出現**（見第 5 節）。

## 4. 結果

| | 改動前 | 改動後 |
|---|---|---|
| `zk.wcs` 原始大小 | 1,371,519 B | 537,589 B（−61%） |
| `zk.wcs` gzip | 146,169 B | 63,701 B（−56%） |
| `zk.wcs` 內 data URI | 2,015 | 0 |

- 41 個圖檔 URL（zul 27、zkex 與 zkmax 14）與圖示 `.svg` 抽樣都回 200。
- `B110_ZK_6112Test` 4 項通過：`testFontFaceWithoutDsp`、`testImagesServedByUrl`（zul、圖示、zkex、zkmax 各一個圖檔回 200）、兩個 reset 測試。
- Playwright `gallery` 81/82 通過；唯一失敗 `grid-header`（4522 vs 4525 px）在改動前的 8085 也一樣，與本次無關。
- stylelint 無錯誤。

## 5. 慢速網路實測（2026-10-07）

條件：Chrome DevTools 模擬 1.6 Mbps／150 ms 延遲、CPU 4 倍降速、快取關閉、每次全新瀏覽器環境；`checkbox.zul`、`listbox.zul` 各 2 次取中位數；改動前＝8085，改動後＝8095（此時尚為過渡的 `<function>` 版本，圖檔的請求方式與最終版相同）。

| 頁面 | | `zk.wcs` 載完 | 元件出現 | 最後一個 `.svg` 載完 | 圖示比元件晚 |
|---|---|---|---|---|---|
| checkbox | 改動前 | 2,657 ms | 18,156 ms | （內嵌） | 0 |
| checkbox | 改動後 | 1,555 ms（−41%） | 17,804 ms | 17,978 ms | 約 174 ms |
| listbox | 改動前 | 2,664 ms | 21,731 ms | （內嵌） | 0 |
| listbox | 改動後 | 1,506 ms（−43%） | 21,311 ms | 21,395 ms | 約 84 ms |

- `zk.wcs` 快約 1.1 秒，但**頁面可用時間幾乎不變**（約 2%，在雜訊範圍內）：此條件下 ZK 客戶端啟動約 18 秒，遠大於 CSS 的差距。
- 每頁只多抓 2 個 `.svg`（只載入用到的圖示），代價是圖示比元件晚約 0.1–0.2 秒。
- 限制：樣本只有 2 次、2 個頁面；只量圖檔晚到的時間，沒有逐格影像比對閃爍。

## 6. 尚未驗證

- IceBlue 端對端：`testIceBlueOnly` 需要 IceBlue theme jar 並切換主題，我嘗試的方式沒有切換成功（斷言值仍是 Marble 的 24 px）。結構上的證據：`iceblue_c.jar` 內 111 個檔案沒有任何字面 `url(~./…)`，且非預設主題下 Marble 的元件 CSS 不會被載入。
- CE only 的實際部署、非根 context path、Spring Boot fat jar、嵌入頁（`browserDefault=true`）。
