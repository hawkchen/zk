# Gate：第五批 RED run，cascader／chosenbox／combobox 清單與晶片（#8 #12 #13 #16 #17）

- **日期：** 2026-10-07，Verifier，量現在的程式碼（8085，Playwright Chromium 147.0.7727.15，viewport 1280×900，deviceScaleFactor 2，已注入 `*{transition:none!important;animation:none!important}`、等 `document.fonts.ready`，量測前游標移到 (2,2)）。
- **範圍：** D44-A（只做 #8 #12 #13 #16 #17）、D45-A（#17 `user-select:none`）、D46-A（#8 = 最後一欄色塊到 popup 右緣，先重現截圖）、D47-A（#12 只修 font-weight，italic 若來自預覽頁記 DEMO）。
- **腳本與原始輸出：** `gates/batch5-red/`：`lib.js`（複製自 batch4-red：幾何、截圖解碼、CIE76 ΔE）、`probe-dom.js/.json` + `probe-*.png`（三頁 DOM 形狀探針）、`red8.js/.json` + `red8-*.png`、`red12.js/.json` + `red12-*.png`、`red13.js/.json` + `red13-*.png`、`red16.js/.json` + `red16-*.png`、`red17.js/.json` + `red17-*.png`、`feas17.js/.json`、`feas17b.js/.json` + `feas17*.png`（#17 可行性探針，頁內注入 CSS，不寫 repo）、`ref/jess-*.png`（Jess 的 issue 截圖，比對用）。
- **沒有修改** 任何 theme/CSS/TS/Java 檔案，沒有看 diff；**沒有建立**暫時預覽頁（三個現成頁面夠用），所以沒有東西要刪。工作樹上另一個 session 的 inputgroup／rating／forced-colors 變更沒有碰。
- **8085 中斷：** chosenbox 兩支跑完後、combobox 三支第一次跑時 8085 `ERR_CONNECTION_REFUSED`。當時有兩個其他 session 的 `appRun` wrapper 在跑、另有剛啟動 18 秒的 gradle，判斷是別的 session 在重啟，**我沒有 kill 也沒有自己重啟**，等約 55 秒後它以新 PID（66666）回來，之後所有量測在同一個 server 上完成。chosenbox（#12 #13）是舊 server 量的、combobox／cascader 是新 server 量的；兩者都是同一份工作樹的 build，沒有看到差異。
- **選取 widget 的方式：** DOM id 是 uuid，一律用 class 或 `zk.$(n)` 的 widget 屬性（`_creatable`、`firstChild._description`）定位；cascader 的 `-icon` 被 root 攔截 pointer events，要點 root 本身（預選那一個右端有清除 ×，點 x=60 的 label 區）。

## 結論摘要

| 項目 | 判定檢查今天 | 保護項今天 | 方法問題 |
|---|---|---|---|
| #8（D46-A）單欄 hover 色塊到 popup 右緣 | 色塊 98–258（160px），popup 內緣 296 → **差 38px，失敗，RED-correct**；空帶命中測試是 popup 本身、點了不會展開 | — | **計畫沒有 #8 的判定／保護項小節**（只有 D46）；量法要先補 |
| #8 雙欄最後一欄 hover 色塊 | Kyoto 色塊 258–418 = popup 內緣 418 → **今天就相符** | → 應改為保護項 | **METHOD-DEFECT（歸類）** |
| #8「選取」色塊 | 選取狀態沒有背景色塊（只有文字變藍）→ **無物可量** | — | **METHOD-DEFECT（定義）** |
| #12 判定 `font-weight` = 400 | 4 個晶片 rest／hover／focus 都是 **500**（`label-large` weight token），失敗，RED-correct | — | 無 |
| #12 判定 `font-style` = normal | 4 個晶片三種狀態都是 **italic**，失敗，RED-correct；**來源是 widget root `<i class="z-chosenbox">` 的 UA 預設**，不是預覽頁、也沒有任何作者樣式規則 | — | **METHOD-DEFECT（範圍）**：D47 的 DEMO 分支不成立，italic 是 theme 範圍 |
| #12 保護項 | — | 字級 14px（= `label-large` size）、晶片高 28px、刪除鈕命中 `.z-chosenbox-icon`、點了晶片 2→1：全部通過 | 無 |
| #13 判定 1 圖示→文字 ≥ 8px | **0px**（rect）／−0.5px（字形 ink），失敗，RED-correct；原因見下（row 是 `display:block`，`gap` 無效） | — | 無 |
| #13 判定 2 垂直中心差 ≤ 1px | rect：icon 468 vs 文字 469 → **1.0，今天就過**；ink：468 vs 469.25 → 1.25，不過 | — | **METHOD-DEFECT（基準未定義）** |
| #13 判定 3 左緣對齊 ≤ 1px | icon 左緣 293 = 選項文字左緣 293 → **差 0，今天就過**（文字左緣 309，差 16 = icon 寬） | → 應改為保護項（加 gap 後不得位移） | **METHOD-DEFECT（歸類／定義）** |
| #13 保護項 | — | 整列 5 點命中都在列內；hover 色塊 277–495 = popup 內緣 277–495：通過。**點該列不會建立晶片**（預覽頁沒有伺服端 listener） | **說明**：「可點」只能用命中測試 |
| #16 判定 color／size／ΔE | 說明文字 `rgba(0,0,0,0.87)`（token 期望 `rgba(0,0,0,0.6)`）、13px（期望 12px）、與主標籤 ΔE **0** → 三項失敗，RED-correct | — | 說明：class 是 `.z-comboitem-inner`；主標籤 13px = body-medium |
| #16 保護項 | — | 說明文字對比 rest 16.1／hover 13.98／selected 11.28（≥ 4.5）；列高 56px、兩行都在列內：通過 | 無 |
| #17 判定 選取字串空、無高亮 | 三連點 → `"Item 1"`（0–6），高亮色塊 (179,215,254) 2304 device px、ΔE 27.78；Cmd+A 同 → 失敗，RED-correct | — | **METHOD-DEFECT（前提）**：`user-select:none` 在 Chromium 147 對 `<input readonly>` **不阻止選取**（探針），D45-A 照字面做不到 |
| #17 保護項 | — | 非唯讀可打字（`abc`）可選取；唯讀可點開下拉、挑 Item 1 後 value 變；Tab 1 跳就到、`:focus-visible` 真、焦點環像素 ΔE 77.55：全部通過 | Ctrl+A 在 macOS Chromium 是游標移動（要寫 Cmd+A）；像素基準要在「已聚焦、選取收合」狀態取 |

## #8（D46-A）— 重現 Jess 的畫面

Jess 的截圖（`ref/jess-8-a.png`）：單欄（USA／Japan／New Zealand）、Japan 列 hover、紅框框住 popup 右側一條空白直帶（箭頭欄之外）。我們的重現 `red8-default-A-single-hover.png` 和它一樣：

| 狀態 | popup（viewport px） | `.z-cascader-cave` | hover／選取列 | 色塊像素（列頂 +3px 掃描，排除 1px 邊框） | 色塊右緣距 popup 內緣 |
|---|---|---|---|---|---|
| A 單欄、hover Japan（預設 cascader，trigger 200px） | 97–297，寬 200（inline `min-width:200px` = trigger 寬）、border 1px、padding 0 → 內緣 98–296 | `display:inline-block`、計算寬 **160px**（98–258） | li 98–258，`rgba(0,0,0,0.04)` | 一段 98→258，寬 160，色 (245,245,245) | **38px**（空帶 258–296 是白的） |
| B 雙欄、hover Kyoto（點 Japan 展開第二欄） | 97–419，寬 **322** = 2×160 + 2 border | 兩個 cave 各 160（98–258、258–418） | Kyoto li 259–418 | 一段 258→418，寬 160 | **0px** |
| C 預選 Japan／Kyoto（trigger 220px，min-width 220） | 276–598，寬 322 | 兩個 cave 各 160 | `z-cascader-selected` 的 Japan、Kyoto：背景 `rgba(0,0,0,0)` | 列頂 +3px **沒有任何非白像素**；列中只有藍色文字字形段（(75,125,212) 等） | 無色塊可量 |

- **空帶的互動：** A 狀態在 Japan 列、x = 260／277.5／295 做 `elementFromPoint` → 都是 `DIV.z-cascader-popup`（不是 li）；在 x = 277 點一下 → cave 數仍 1（沒展開），popup 還開著。也就是空帶不只沒有色塊，也不是列的一部分。
- **幾何結論（給 Planner 確認解讀）：** popup 寬 = max(trigger 寬, Σ cave 寬 + 2)；cave 固定 160px。所以空帶**只在 Σ cave 寬 < trigger 寬時出現**（單欄 160 < 200／220；雙欄 320 > 220 就沒有）。截圖顯示的就是這個單欄情況；D46-A「最後一欄的色塊要到 popup 右緣」在單欄今天失敗、在雙欄今天已經成立。三層以上的 model 預覽頁沒有，沒量。
- **forced-colors（記錄）：** hover 列頂 +3px 沒有非白像素 → hover 色塊在 forced-colors 下**看不見**（靠 `background-color`）；只有文字。單欄／雙欄都一樣。

## #12 — 晶片字型

`chosenbox.zul` 上 4 個 `.z-chosenbox-item-content`（Default 的 Apple／Banana、Disabled 的 Apple／Banana），rest、hover（游標在第一個晶片文字上）、focus（點第一個 chosenbox 的 input，root 得到 `z-chosenbox-focus`）各量一次：

| 狀態 | font-style | font-weight | font-size | line-height | 晶片高（`.z-chosenbox-item`） |
|---|---|---|---|---|---|
| rest／hover／focus，4 個晶片全部 | **italic** | **500** | 14px | 20px | 28px |

token：`--zk-typescale-label-large-size` 14px、`--zk-typescale-label-large-weight` 500、`--zk-typescale-body-medium-weight` 400。

**italic 的來源（只指位置，不提修法）：** 從晶片往上走，`DIV.z-chosenbox-item-content`（italic）← `SPAN.z-chosenbox-item`（italic）← **`I.z-chosenbox`（italic，root）**，root 的父元素不是 italic。對 root 掃過頁面上所有 stylesheet（含巢狀規則）：**沒有任何作者規則對它宣告 `font-style`**，root 也沒有 inline style。root 用 `<i>` 標籤是 widget mold 寫的（`zkcml/zkmax/src/main/resources/web/js/zkmax/inp/mold/chosenbox.js:21` `out.push('<i', ...)`），italic 是瀏覽器 UA 樣式表對 `<i>` 的預設；`chosenbox.css` 裡沒有 `font-style` 這個字，base 的 `_icons.css:19` 只重設圖示。**預覽頁沒有造成 italic 的東西** → 不是 DEMO，D47-A 的分支不成立。font-weight 500 來自 `chosenbox.css:55` `font-weight: var(--zk-typescale-label-large-weight)`（與計畫一致）。

**保護項（今天）：** 字級 14px、晶片高 28px（4 個都一樣，三種狀態不變）；刪除鈕中心 `elementFromPoint` → `I.z-chosenbox-icon z-icon-times`（鈕內）；真的點下去晶片 2 → 1。全部通過。
**記錄：** `data-brand="copper"` 下 italic／500／14px 不變；forced-colors 下 italic／500 不變，color `rgb(0,0,0)`。

## #13 — 建立新晶片那一列

用「createMessage + noResultsText」那個 creatable chosenbox（Jess 截圖的那一個），先點 input（空輸入，選項列全顯示）量參考值，再打 `ffff`：

- **選項列參考：** popup 276–496（220px，border 1px，padding 0）；`.z-chosenbox-option` rect 左緣 277、`padding-left:16px`、文字左緣（Range）**293**。
- **建立列 DOM：** `<div class="z-chosenbox-empty z-chosenbox-empty-creatable z-chosenbox-option z-chosenbox-option-hover"><i class="z-chosenbox-icon z-chosenbox-create z-icon-plus-square"></i><span>Add new ffff</span></div>`。**圖示是真的 `<i>` 元素**（`display:inline`，字形由 `::before` 畫：`inline-block` 16×16 的 mask），**文字不是裸節點、是 `<span>`**（`display:inline`），兩者之間沒有空白字元。
- **為什麼 `gap: var(--zk-spacing-2)` 沒有效果：** 該列計算出來 `display: block`、`gap: 8px`、`align-items: center`、`padding-left: 16px`、`line-height: 20px`。`gap` 只對 flex／grid／multi-column 容器有效，block 容器裡的兩個 inline 子元素緊貼排列，所以 `<i>`（右緣 309）和 `<span>`（左緣 309）之間是 0；`align-items` 同樣在 block 上無效。這是觀察，不是修法。

| 判定 | rect 量法 | 字形（ink）量法 | 結果 |
|---|---|---|---|
| 1. 圖示右緣→文字左緣 ≥ 8px | 309 → 309 = **0** | icon ink 右緣 310 → 文字 ink 左緣 309.5 = **−0.5** | 失敗，RED-correct |
| 2. 垂直中心差 ≤ 1px | icon rect 458–478（20px 行框）中心 468；文字 rect 461–477 中心 469 → **1.0（過）** | icon 字形 461.5–474.5 中心 468；文字字形 464–474.5 中心 469.25 → **1.25（不過）** | **基準未定義** |
| 3. 左緣與選項文字左緣對齊 ≤ 1px | icon 左緣 293 vs 選項文字左緣 293 → **0（過）**；若指「文字」左緣：309 → 差 16 | — | **今天就過（以 icon 為準）** |

第一個 creatable（「Add new」沒有 `{0}`）同樣 gap 0。

**保護項（今天）：** 該列 x = 279／331.5／386／440.5／493（列中 y）`elementFromPoint` 全在列內（DIV 或其 SPAN）；hover 色塊（列頂 +2px 掃描）277→495 = popup 內緣 277–495，色 (245,245,245)：通過。**點該列之後晶片仍是 0 個**：creatable 的建立要靠應用程式處理事件（預覽頁沒有 listener），不是 CSS 能驗的，「整列可點」只能寫成命中測試。
**記錄：** forced-colors 下 plus 圖示有 435 個 ink 像素（看得見）。

## #16 — combobox 說明文字

「With description」那個 combobox（widget 以 `firstChild._description` 找），點按鈕打開，兩個 `.z-comboitem`：

- **說明文字的 class：`.z-comboitem-inner`**（`<span>`，在 `.z-comboitem-text` 內、`<br>` 之後）；**沒有 `.z-comboitem-description`**。主標籤是 `.z-comboitem-text` 裡的**裸文字節點**（`Item&nbsp;1`），所以「主標籤不變」要量 `.z-comboitem-text` 的計算樣式。
- token：`--zk-color-on-surface-variant` = `#0009` → `rgba(0,0,0,0.6)`；`--zk-typescale-body-small-size` 12px；`--zk-color-on-surface` `rgba(0,0,0,0.87)`；body-medium 13px、body-large 16px。

| 元素 | color | font-size | weight | line-height |
|---|---|---|---|---|
| 主標籤 `.z-comboitem-text`（兩項） | `rgba(0,0,0,0.87)` | **13px**（= body-medium，不是 body-large） | 400 | 20px |
| 說明 `.z-comboitem-inner`（兩項） | **`rgba(0,0,0,0.87)`**（期望 `rgba(0,0,0,0.6)`） | **13px**（期望 12px） | 400 | 20px |

像素：主標籤與說明文字各取 Range 框內最暗像素，都是 (33,33,33) → **ΔE 0**（期望 ≥ 15）。三項判定都失敗，RED-correct。

**保護項（今天）：** 說明文字（計算色疊在列底色上）對比 rest 16.1、hover（底 `rgba(0,0,0,0.08)` → (235,235,235)）13.98、selected（底 `oklch(0.87 0.03 260)` → (200,213,234)，文字被 li 的 selected 規則改成 `oklch(0.235 …)` → (21,30,45)）11.28；列高 56px；說明文字 Range 底緣 ≤ li 底緣：通過。
**給 Generator brief 的觀察（記錄）：** 選取列是在 `li.z-comboitem-selected` 上覆寫 `color`，主標籤與說明文字一起繼承；說明文字改 token 後，選取列的對比預估約 4.9（0.6 黑疊在 (200,213,234)），剛好過 4.5，Generator 要留意 selected 規則與說明文字規則的先後。
**記錄：** `data-brand="copper"` 不改 `--zk-color-on-surface-variant`（仍 `#0009`），說明文字仍 0.87；forced-colors 下 token 與兩段文字都是 `rgb(0,0,0)`、ΔE 0（系統色下靠顏色分層本來就不存在，只剩字級）。

## #17 — 唯讀 combobox 的文字選取

預覽頁的 `readonly="true"` combobox value 是空的，先用下拉挑 Item 1（這本身就是保護項）再量。輸入框今天 `user-select: auto`。像素基準 = 已聚焦、`setSelectionRange(0,0)` 的狀態（焦點環在兩張圖裡都有，差異只剩選取高亮）。

| 操作 | `getSelection().toString()` | `selectionStart–End` | 高亮像素（文字帶，與基準比） | 結果 |
|---|---|---|---|---|
| 三連點 | `"Item 1"` | 0–6 | 2304 device px 變色，色 (179,215,254)，x 589–624.5，最差 ΔE 27.78（`red17-default-ro-triple.png`，與 Jess 的截圖一樣） | 失敗，RED-correct |
| Cmd+A（Meta+A） | `"Item 1"` | 0–6 | 同上 | 失敗，RED-correct |
| Ctrl+A（Control+A） | `""` | 0–0 | 0 | macOS Chromium 的 Control+A 是「游標到行首」，不是全選；**計畫寫的「Ctrl+A」在這台機器要用 Cmd+A** |
| 滑鼠拖曳 14→60px | `""` | 6–6 | 0 | 在 red17.js 的序列裡沒選到（游標落在尾端）；在 feas17.js 的序列（先 `setSelectionRange(0,0)` 再拖）有選到。拖曳在 harness 裡不穩，不建議當判定 |

**保護項（今天）：** 非唯讀（Default）combobox 打 `abc` → value `abc`，三連點選到 `abc`；唯讀 combobox 點按鈕 → popup `display:block`、兩個項目，點 Item 1 → value `Item 1`；從 Default 的 input 按 Tab **1 跳**到唯讀 input，`:focus-visible` 真，root 外框像素 focus (55,111,208) vs blur 白 → ΔE 77.55（焦點環在）。全部通過。
**記錄：** forced-colors 下三連點仍選取、高亮 (55,51,109)、焦點環 ΔE 100。

### D45-A 的可行性探針（頁內注入，`feas17.json`、`feas17b.json`，不是判定）

| 注入 | 三連點 字串 | 三連點 高亮像素 | Cmd+A | 下拉挑選 | Tab 焦點環 |
|---|---|---|---|---|---|
| `.z-combobox-readonly .z-combobox-input{user-select:none;-webkit-user-select:none}`（計算值確認為 `none`） | **仍是 `"Item 1"`**（0–6） | **仍 2304 px、ΔE 27.78**（與沒注入一樣） | 同 | （序列有疑，見下） | — |
| V1 `…::selection{background:transparent;color:inherit}`（D45-B 的形狀） | 仍是 `"Item 1"` | **0 px、ΔE 0.91（看不到高亮）** | 字串仍非空、無高亮 | Item 2 ✓ | reached、focus-visible ✓ |
| V2 `…{pointer-events:none}` | `"Item 1"`（但 active 不是 input，點擊落到 root span） | 2304 px（含焦點變化） | 字串非空 | 回傳 Item 1（預期 Item 2）— 行為混亂 | ✓ |

→ **Chromium 147 對 `<input readonly>` 不理會 `user-select:none`**（選取字串與高亮都和今天一樣）；純 CSS 能做到的是 V1「看不到高亮但字串仍可選」，正是 D45-B 的取捨。D45-A 照字面（CSS）做不到，需要 Planner 重裁：改判定（只量高亮像素、字串改記錄）或改用 JS（不在 Generator 的 CSS 範圍）。`user-select:none` 探針裡「再挑一次回傳 Item 1（預期 Item 2）」原因未查，V1 用同一序列挑到 Item 2，所以不作結論。

## 方法問題清單

1. **#8 沒有判定／保護項小節**（計畫第五批只有 D46 的解讀）。RED 量到：單欄 hover 色塊右緣距 popup 內緣 38px（失敗）、空帶不可命中也不可點；雙欄最後一欄 0px（今天就過）；選取狀態沒有色塊。**建議補寫：** 判定 =「單欄（Σ cave 寬 < popup 寬）時 hover 色塊右緣 = popup 內緣（差 ≤ 1px），且空帶內 `elementFromPoint` 命中該 li、點了會展開子欄」；保護項 =「雙欄時最後一欄色塊右緣仍 = 內緣（0px）、popup 寬仍 = Σ cave 寬 + 2、第一欄寬不變（160）」；「選取」改為「選取列文字色不變（藍）」或刪除。請 Planner 先確認 D46-A 的解讀就是這個單欄空帶（截圖 `red8-default-A-single-hover.png` 與 Jess 的一致）。
2. **#12 D47 的 DEMO 前提不成立：** italic 來自 widget root `<i>`（mold）+ UA 預設，無任何作者規則、預覽頁沒有造成它。**METHOD-DEFECT（範圍）。** 建議：`font-style` 判定納入本批（theme-rooted），D47-A 的「只修 font-weight」改為兩項都修；修法由 Generator 決定（本報告不提）。
3. **#13 判定 2 的基準未定義：** rect 中心差 1.0（過）、字形中心差 1.25（不過）。**METHOD-DEFECT。** 建議明寫「以字形 ink（截圖中與列底色 ΔE ≥ 20 的像素）的中心為準，差 ≤ 1px」；若用 rect，這項今天就過，要改成保護項。
4. **#13 判定 3 今天就過**（icon 左緣 = 選項文字左緣，差 0；列 padding-left 16 = 選項 padding-left 16）。**METHOD-DEFECT（歸類）。** 建議改為保護項「加了間距之後 icon 左緣仍 = 選項文字左緣（差 ≤ 1px）」；若 Planner 的本意是「文字左緣對齊」，今天差 16px，要明寫哪一個。
5. **#13 保護項「整列可點」：** 預覽頁沒有建立晶片的伺服端處理，點了不會出現晶片。**說明。** 建議寫成「列內 5 點 `elementFromPoint` 都命中該列（或其子元素）」，不要寫「點了會建立晶片」。
6. **#17 D45-A 的前提不成立：** `user-select:none` 在 Chromium 147 對 `<input readonly>` 不阻止選取（字串、高亮都不變）。**METHOD-DEFECT（前提）。** 可純 CSS 達到的只有 V1（高亮透明、字串仍可選 = D45-B）。建議 Planner 重裁 D45：A′ = 判定改成「三連點／Cmd+A 後文字帶像素與收合狀態 ΔE ≤ 2」（字串改記錄），或 B′ = 改 JS（超出 Generator CSS 範圍，另開）。
7. **#17「Ctrl+A」：** macOS Chromium 的 Control+A 是游標移動，要寫 Cmd+A（Playwright `Meta+A` 或 `ControlOrMeta+A`）；**像素基準**要在「input 已聚焦、選取收合」狀態取，否則焦點環本身就有 3150 px 差異（第一次跑就踩到）；滑鼠拖曳在 harness 裡不穩，不建議列為判定。
8. （說明）**#16：** 說明文字 class 是 `.z-comboitem-inner`（不是 `-description`）；主標籤是 `.z-comboitem-text` 的裸文字節點、字級 13px（body-medium）；選取列的 `color` 覆寫在 li 上、會一起套到說明文字，Generator brief 要寫明。
9. （說明）**#8 forced-colors：** hover 色塊靠 `background-color`，forced-colors 下看不見；與第四批捲軸同類，記看板 follow-up，不擋本批。

RED5: METHOD-DEFECTS (items #8 無判定小節且雙欄今天就過、選取無色塊, #12 italic 非 DEMO 需納入, #13 判定2 基準未定義, #13 判定3 今天就過, #17 user-select:none 在 Chromium 不阻止選取, #17 Ctrl+A→Cmd+A 與像素基準)
