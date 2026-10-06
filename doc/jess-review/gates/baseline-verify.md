# Baseline 重新產生、D23-A、D22-B / D25-A：最終驗證（Verifier）

- 日期：2026-10-06
- 角色：Verifier（全新 context，只量測，不修正）。沒有看 product CSS 的 diff，沒有 `git add`／commit，沒有執行任何形式的 `--update-snapshots`，沒有執行 `forced-colors-gallery`，沒有啟動或停止 8085。
- 判定依據：`jess-review-verification-plan.md` 的「前置工作：重新產生過時的截圖 baseline」判定檢查、「D23-A」、「前置工作（續）：D22-B」判定檢查，以及 D25-A 註記。
- Scratch：`<scratchpad>/verify-final/`（`<scratchpad>` = `/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/462190b7-5cfd-4433-8c32-a8b9e3fcddce/scratchpad`）。
- Script：`doc/jess-review/gates/baseline-verify/`
  - `make-mut.js`：把 `screenshot.spec.ts`、`focus-ring-scan.spec.ts` **複製**到 scratch，加上由環境變數 `MUT_CSS` 控制的注入 hook（沒設就是 no-op），並放入 scratch config。repo 的 spec 只讀不改。
  - `mut.config.ts`：import **真正的** `playwright.config.ts`，保留它的 `chromium`／`focus-scan` project 原樣（所以生效的就是 config 裡的 0.05），只改 `testDir`、絕對路徑的 `snapshotDir`、`updateSnapshots: 'none'`（連 missing 也不寫）；只有設定 `THRESH` 時才覆寫 chromium 的 threshold。
  - `make-pre-d23.js`：用 `git show HEAD:` 的 focus spec 加上 organigram 的 transition 修正，重建 D23 之前的版本（給 B3 前後對照）。
  - `c3-measure.screenshot.spec.ts`：C3 的量測（重現截圖狀態、讀 live computed style、decode baseline PNG）。
  - `summ.js`：把 Playwright JSON reporter 的結果整理成逐項狀態。

## 修改前後的檔案 checksum（全部相同）

我沒有修改任何 repo 檔案（mutation 全部在 scratch 的複本上做）。前後 `shasum` 完全一致：

| 檔案 | 前 | 後 |
|---|---|---|
| `zkpreview/src/test/playwright/screenshot.spec.ts` | `0d5c5b7d0ae0e46f2f583884a07c75f1bb1c34ef` | 同 |
| `zkpreview/src/test/playwright/focus-ring-scan.spec.ts` | `6ddc5dd9c6e20988d6c5a5e0b1f7444e2dada6c3` | 同 |
| `zkpreview/src/test/playwright/playwright.config.ts` | `b8b35304fa99f02b4815ef476eeb069a82804425` | 同 |
| `doc/screenshot-tolerance-policy.md` | `6a3578a5d721421493db02ac341f13d24ac8c651` | 同 |
| `zkpreview/doc/focus-ring-known-clips.json` | `678a1b3e80973a28f868846173b033f5acd102fc` | 同 |
| `zkpreview/doc/screenshots/*.png`（287 張） | `png-sha-before.txt` | `diff` 無差異 |

`zkpreview/src/test/playwright/` 底下其餘 14 個 spec 的 checksum 也前後相同。`git status --short` 前後只差我新增的 `doc/jess-review/gates/baseline-verify/`（以及本報告）。

## A. Baselines

### A1 / C2 / C5：`chromium` 連跑 3 次 — **PASS**

```
cd zkpreview && PREVIEW_URL=http://127.0.0.1:8085 npx playwright test \
  --config src/test/playwright/playwright.config.ts --project=chromium --reporter=line --output=<scratch>/out-chromium-N
```

| 次 | 結果 | exit |
|---|---|---|
| 1 | 130 passed（1.7m） | 0 |
| 2 | 130 passed（1.7m） | 0 |
| 3 | 130 passed（1.7m） | 0 |

用的是真正的 config，threshold 0.05 生效中（見 C1）。130 項包含 4 張新截圖（combobox／searchbox／chosenbox dropdown、chosenbox chip focus），所以這也涵蓋 C2（0.05 下 3 次全過）和 C5（新截圖 3 次都過）。

### A2：PNG 變動範圍 — **PASS**

`git status --short --untracked-files=all zkpreview/doc/screenshots`：

- ` M`：33 張，和核准清單（第一輪 27 張 + 第二輪 doublebox、decimalbox、combobutton × hover、focus 共 6 張）做 `diff`，**完全相同**。
- `??`：正好 4 張：`chosenbox-chip-focus.png`、`chosenbox-dropdown.png`、`combobox-dropdown.png`、`searchbox-dropdown.png`。
- 沒有其他狀態碼；`*-forced-colors.png` 出現 0 次。

### A3：`focus-scan` 連跑 3 次，organigram 3 次都過 — **PASS**

用 JSON reporter 逐項讀狀態（`<scratch>/focus-runN.json`）：

| 次 | passed | skipped | failed | flaky | organigram node |
|---|---|---|---|---|---|
| 1 | 57 | 47 | 0 | 0 | passed |
| 2 | 57 | 47 | 0 | 0 | passed |
| 3 | 57 | 47 | 0 | 0 | passed |

### A4：organigram mutation — **PASS**

在 scratch 複本中，於測試自己的 `transition: none` 注入之後再注入：
`@media (forced-colors: active) { .z-orgitem-selected > .z-orgnode:focus-visible { outline-color: Highlight !important } }`

| 執行 | organigram node |
|---|---|
| 對照（不注入） | passed |
| 注入 | **failed**：`ring [5,0,73] (offset -2px) vs the fill it is painted on, [5,0,73] from .z-orgnode` |
| 移除注入後 | passed |

## B. D23-A

### B1：tree row、listbox row 在 3 次 focus-scan 都過 — **PASS**

見 A3 的 3 次 JSON：`tree: tree row`、`listbox: listbox row` 3 次都是 `passed`（不是 `skipped`）。

### B2：鍵盤條件的選取 + 焦點規則 mutation — **PASS**

注入：
`@media (forced-colors: active) { .z-tree:has(.z-focus-a:focus-visible) .z-treerow.z-treerow-focus.z-treerow-selected, .z-listbox:has(.z-focus-a:focus-visible) .z-listitem.z-listitem-focus.z-listitem-selected { outline-color: Highlight !important } }`

| 執行 | tree row | listbox row | 其他 3 項 |
|---|---|---|---|
| 對照 | passed | passed | passed |
| 注入 | **failed**：`ring [5,0,73] (offset -2px) … from .z-treerow z-treerow-selected z-treerow-f…` | **failed**：`ring [5,0,73] (offset -2px) … from .z-listitem z-listitem-selected z-listite…` | passed |
| 移除後 | passed | passed | passed |

offset 是 -2px，表示量到的是 `.z-focus-a:focus-visible` 條件下的列焦點框規則本身；D23 之前的路徑量到的是瀏覽器預設 `outline: auto`（offset 0px，見 B3）。

### B3：navbar、paging、organigram 結果和 D23 之前相同 — **PASS**

用 `make-pre-d23.js` 重建 D23 之前的 spec（HEAD + organigram 的 transition 修正，也就是 `baseline-regen-gen.md` 量測時的狀態），只跑「selected + focused」這一組，跑 2 次：

| 項目 | D23 之前（2 次） | D23 之後（A3 的 3 次 + mut 對照 2 次） |
|---|---|---|
| navbar item | passed, passed | 全部 passed |
| paging button | passed, passed | 全部 passed |
| organigram node | passed, passed | 全部 passed |
| tree row | failed, failed（`ring [5,0,73] (offset 0px) … from .z-treerow z-treerow-selected`） | 全部 passed |
| listbox row | （不存在） | 全部 passed |

全專案計數也對得上：`baseline-regen-gen.md` 記錄 D23 前為 55 passed／1 failed／47 skipped（56 項有斷言），現在是 57 passed／47 skipped（多了 listbox row 一項，tree row 轉為通過）。`baseline-d23-gen.md` 的 57／47 也一致。

### B4：讀 `focus-ring-scan.spec.ts` 的 diff — **PASS**

- tree／listbox 的項目帶 `host`，測試用 `el.closest(f.host)?.querySelector('.z-focus-a')` 找 `.z-focus-a`，也就是被標記那一列**所屬的同一個** `.z-tree`／`.z-listbox` 裡的 `.z-focus-a`；CDP 對它強加 `:focus` + `:focus-visible`（標記 `data-fs-force`），列本身不強加。列加上 `-selected` 和 `-focus` 兩個 class。
- 找不到 `.z-focus-a` 時回傳 `false`，接著 `expect(ok).toBe(true)` 會**失敗**，不會變成 skip。
- 可能「空轉通過」的路徑只有 `test.skip(outlineStyle === 'none' || width === 0)`。我的所有執行中，tree row 和 listbox row 都是 `passed`，不是 `skipped`（JSON reporter 逐項確認），所以確實有斷言。B2 的 mutation 讓兩項都失敗，也證明斷言是在檢查真實的焦點框規則。
- 另外檢查：`fillFrom` 為 `(nothing)` 時明確失敗，不會拿黑色當底色比對。
- 小提醒（不影響判定）：`querySelector('.z-focus-a')` 取的是 host 內第一個，如果之後預覽頁出現巢狀 listbox／tree，可能抓到內層的。目前頁面上沒有這種情況。

## C. D22-B / D25-A

### C1：threshold mutation — **PASS**

knob 是 `--zk-listbox-selected-bg`。在 scratch 複本的 `listbox › gallery` 截圖前注入：
`:root, .z-listbox, .z-listitem { --zk-listbox-selected-bg: rgb(213,230,255) !important; }`
然後用 `expect.poll` 等 `.z-listitem.z-listitem-selected` 的 computed `background-color` 等於 `rgb(213, 230, 255)` 才截圖（避開 background transition）。每次都有記錄讀值：`MUT-PROBE .z-listitem.z-listitem-selected backgroundColor=rgb(213, 230, 255)`。

| 執行 | threshold | 結果 |
|---|---|---|
| 對照（不注入） | 0.05（真正 config） | passed |
| 注入 | 0.05（真正 config，沒有覆寫） | **failed**：`41783 pixels (ratio 0.02 of all image pixels) are different.` |
| 注入 | 0.2（`THRESH=0.2`，只覆寫 scratch config 的 chromium project） | **passed** |
| 移除後 | 0.05 | passed |

0.2 的對照沒有修改 `playwright.config.ts`，是 scratch config import 真正的 config 後再覆寫。

### C2：見 A1 — **PASS**

### C3：新截圖拍到正確的顏色 — **PASS**

`c3-measure.screenshot.spec.ts` 照 `screenshot.spec.ts` 的步驟重現每張截圖的狀態，用和 `padShot` 相同的算法算出 clip（box − PAD，左上角 clamp 到 0），把 item 的 rect 換算成 PNG 座標（內縮 1px），用 zkpreview 的 `playwright-core/lib/utilsBundle` 的 `PNG` decode **已提交的 baseline**。底色取 item 範圍內的主色（排除字形像素），另外取一個左側 padding 點。PNG 尺寸都和算出的 clip 尺寸相同，所以座標換算是對齊的。

| PNG | 狀態 class | PNG 尺寸 = clip | item 在 PNG 的範圍 (x0,y0,x1,y1) | 主色（像素數／總數） | padding 點 → rgb | live computed `background-color` | `--zk-color-secondary-container` 解析值 | 差 |
|---|---|---|---|---|---|---|---|---|
| `combobox-dropdown.png` | `z-comboitem z-comboitem-selected` | 229×96 | (13,49,215,82) | 200,213,234（6695／6902） | (15,66) → 200,213,234 | `oklch(0.87 0.0317461 260.564)` = 200,213,234 | 同左 = 200,213,234 | 0,0,0 |
| `searchbox-dropdown.png` | `z-searchbox-item z-searchbox-selected` | 238×264 | (21,65,216,98) | 200,213,234（6420／6664） | (23,82) → 200,213,234 | 同上 = 200,213,234 | 200,213,234 | 0,0,0 |
| `chosenbox-chip-focus.png` | `z-chosenbox-item z-chosenbox-item-focus` | 224×94 | (20,18,91,43) | 200,213,234（1567／1872） | (22,31) → 200,213,234 | 同上 = 200,213,234 | 200,213,234 | 0,0,0 |

oklch 轉 rgb 是在頁面上用 1×1 canvas 畫出來讀的。`--zk-color-secondary-container` 是用一個 `background: var(--zk-color-secondary-container)` 的 probe 元素，放在 item 的 parent 裡解析。`chosenbox-dropdown.png` 依 D25-A 不套用 C3／C4。

### C4：新截圖抓得到退步 — **PASS**

對每個 item 注入 `background-color: rgb(213,230,255) !important`，並用 probe 確認 computed 值已變成 `rgb(213, 230, 255)` 才截圖。

| 測試 | 對照 | 注入（0.05） | 移除後 |
|---|---|---|---|
| `combobox › dropdown`（`.z-comboitem.z-comboitem-selected`） | passed | **failed**：7181 px（ratio 0.33） | passed |
| `searchbox dropdown › dropdown`（`.z-searchbox-item.z-searchbox-selected`） | passed | **failed**：6840 px（ratio 0.11） | passed |
| `chosenbox dropdown › chip focus`（`.z-chosenbox-item.z-chosenbox-item-focus`） | passed | **failed**：1780／1781 px（ratio 0.09） | passed |

### C5：見 A1 — **PASS**

### C6：git 範圍 — **PASS**

`zkpreview/` 底下除了 PNG 以外的未提交變動（`git status --short --untracked-files=all zkpreview`），正好是：
- ` M zkpreview/src/test/playwright/focus-ring-scan.spec.ts`
- ` M zkpreview/src/test/playwright/playwright.config.ts`
- ` M zkpreview/src/test/playwright/screenshot.spec.ts`

`doc/screenshot-tolerance-policy.md` 是 ` M`（+15／−2：knobs 表的 `threshold` 列、新增 section 5，原 section 5 改為 6）。

repo 裡 `git status --short` 列出的其他項目（照規定只列出，不判斷是誰的）：

| 狀態 | 路徑 | 和這次工作的關係 |
|---|---|---|
| M | `.gitignore` | 看起來無關 |
| M | `.mcp.json` | 看起來無關 |
| M | `doc/jess-review/jess-review-verification-plan.md` | 相關（計畫文件本身） |
| M | `doc/marble-theme-followups.md` | 相關（item 8、item 10 的紀錄） |
| M | `doc/spec/data-dense-mode.md` | 看起來無關 |
| ?? | `doc/css-variable-benchmark/` | 看起來無關 |
| ?? | `doc/css-variable-performance-evidence.md` | 看起來無關 |
| ?? | `doc/css-variable-url-prefix.md` | 看起來無關 |
| ?? | `doc/data-uri-performance-claims.md` | 看起來無關 |
| ?? | `doc/debug-console-plan.md` | 看起來無關 |
| ?? | `doc/dsp-removal-iceblue-coexistence.md` | 看起來無關 |
| ?? | `doc/jess-review/gates/baseline-classify.md`、`baseline-classify/` | 相關（分類報告） |
| ?? | `doc/jess-review/gates/baseline-d22-gen.md`、`baseline-d23-gen.md`、`baseline-regen-gen.md` | 相關（Generator 報告） |
| ?? | `doc/jess-review/gates/baseline-verify/`、`baseline-verify.md` | 本次 Verifier 新增 |
| ?? | `doc/theme-pack-retirement-brief-for-jean.md`、`doc/theme-pack-retirement-evaluation.md` | 看起來無關 |
| ?? | `logs/` | 看起來無關 |

### C7：`screenshot.spec.ts` 與 `playwright.config.ts` 的 diff — **PASS（附注意事項）**

- **threshold 範圍：** `expect: { toHaveScreenshot: { threshold: 0.05 } }` 寫在 `chromium` project 物件裡，不是頂層 config。`gallery`、`tablet`、`forced-colors-gallery` 等 project 不受影響。實測也印證：C1 不覆寫時是 0.05（失敗），覆寫成 0.2 才通過。
- **等待狀態 class、移開指標：**
  - combobox：`expect(popup).toBeVisible()` + `expect(.z-comboitem-selected).toHaveCount(1)`，有 `mouse.move(0,0)`。
  - searchbox：`popup:visible` count 1 + `.z-searchbox-selected` count 1，有 `mouse.move(0,0)`。
  - chosenbox dropdown：`popup:visible` count 1 + `.z-chosenbox-option-hover` count 1，有 `mouse.move(0,0)`。
  - chosenbox chip：`.z-chosenbox-item-focus` count 1（全頁），有 `mouse.move(0,0)`。
  - 4 個都透過 `padShot`，帶 `animations: 'disabled'` 和 `maxDiffPixels: 20`。
- **flake 風險（實測沒有發生，只列出）：**
  1. combobox 只斷言「有 1 個 selected item」，沒有斷言是第 2 項。如果 ArrowDown 的行為變了，會以截圖差異的形式失敗，不會誤判通過，但錯誤訊息比較難懂。
  2. searchbox 依賴 `.nth(1)`（頁面上第 2 個非 disabled 的 searchbox 有預選項目）。預覽頁調整順序就會失效（會以 count 斷言失敗，不會空轉）。
  3. ZK popup 的開啟是 JS 動畫，`animations: 'disabled'` 管不到。目前靠 `toHaveScreenshot` 的「連續兩次截圖一致」機制吸收，3 次全跑加上 C4 的對照執行，都沒有出現 flake。
  4. 0.05 也套用在 16 張 gallery 截圖上，而 gallery 沒有 `maxDiffPixels` 的下限。3 次全跑都穩定，但未來如果出現次像素的顏色雜訊，gallery 會最先反映。

## 其他觀察

- `doc/screenshot-tolerance-policy.md` 第 34 行附近仍寫「`playwright.config.ts` has **no** global `expect: { toHaveScreenshot: … }` block」。嚴格來說仍然正確（設定在 project 層級），但讀者可能誤會；新的 section 5 有說明。不影響判定。
- Verifier 的 scratch config 設了 `updateSnapshots: 'none'`，所以 mutation 執行時就算名稱對不上，也不會寫入 baseline。PNG checksum 前後一致。

## 結論

| 檢查 | 結果 |
|---|---|
| A1 | PASS |
| A2 | PASS |
| A3 | PASS |
| A4 | PASS |
| B1 | PASS |
| B2 | PASS |
| B3 | PASS |
| B4 | PASS |
| C1 | PASS |
| C2 | PASS |
| C3 | PASS |
| C4 | PASS |
| C5 | PASS |
| C6 | PASS |
| C7 | PASS（附 flake 風險注意事項） |

VERDICT: PASS
