使用 8105

# GATE47-FINAL：#47 fisheyebar 最終判定（2026-10-08，Fable，8105）

依 `lines/line-b-plan.md`「批次 10 RED 結果與方法定稿」第 5 點（J47）與使用者裁示 D83-A（垂直、水平一起修）。只量測，不改任何檔案；只寫入本目錄。

## 一、build 確認

`GET http://127.0.0.1:8105/web/fisheyebar.zul` → 200；頁面引用 `/zkres/web/80d82a15/zul/css/zk.wcs`，取回（539,754 bytes）後比對：

- `.z-fisheyebar{…flex-direction:row;display:flex;position:relative}` — 含 `position:relative` ✔
- `.z-fisheye{cursor:pointer;transition:width …, height …;flex-direction:column;justify-content:flex-end;align-items:center;display:flex;position:absolute}` — 含 `position:absolute` ✔

RED 時兩者皆為 `static`（`red47.json` computed），確認 8105 伺服的是新 build。CSS 原始檔與 diff 未讀。

## 二、摘要表

座標皆為 viewport CSS px、DPR 2；「rect = inline」指六個 `.z-fisheye` 的 `getBoundingClientRect` 與「容器原點 + inline left/top、inline width/height」逐項相減，門檻 ±1px。

| 編號 | 判定 | RED 數值 | 現在數值 | 結果 |
|---|---|---|---|---|
| J47-1 | 垂直：六項 rect = inline（±1px） | 寬 **1.33**、全部 t=713；Δw −78.7、Δt 最多 +392 | 六項 80×80，l=32、t=321/401/481/561/641/721；六項 Δl/Δt/Δw/Δh **全為 0**（maxAbsDelta 0） | **通過** |
| J47-2 | 水平：六項 rect = inline（±1px） | 寬 **68**、t=313（Δw −12、Δt −8、Δl +16…−4） | 六項 80×80，l=32/112/192/272/352/432、t=321；Δ **全為 0** | **通過** |
| J47-3 | magnify（指到第 3 項、停穩 600ms）：六項 rect = inline | 水平 51/76.5/102/76.5/51/51 寬（Δw −29～−58）；垂直 1/1.5/2/1.5/1/1 寬（Δw −79～−158） | 水平與垂直皆 **80/120/160/120/80/80**（寬＝高），六項 Δ 全為 0；放大項超出容器（ZK 設計，不判） | **通過** |
| J47-3 附 | transition 拖尾（開啟 transition、移動後**立即**量 vs 600ms 後） | 未量 | 立即量：水平 maxAbsDelta 20.05（第 3 項寬 139.95 vs inline 160）、再移到第 4 項立即量 40、離開立即量 80；垂直 25.41／40／80。**600ms 後三次皆 0**。見第三節 4 | 回報（定稿無門檻） |
| P47-a | `.z-fisheye-image` 佔項目比例 | 水平 l 0.1／t 0.2／w 0.8／h 0.8（54.39×64 於 68×80）；垂直 w 被壓成 1.06 | 水平、垂直、magnify 五個狀態 24 項全為 **l 0.1／t 0.2／w 0.8／h 0.8**（64×64 於 80×80；96 於 120；128 於 160）；僅被放大且顯示標籤的第 3 項 t 0.078（文字佔去底部，見 P47-c） | **通過**（與 RED 水平比例相同；定稿字面的「10%」頂偏移在 RED 就是 20%，見第五節 2） |
| P47-b | `cursor: pointer` | pointer | 五個狀態六項皆 `pointer` | 通過 |
| P47-c | `.z-fisheye-text` 標籤位置 | RED 無數值（僅截圖 `red47-h-magnify.png` 可見「Project」在第 3 項下方） | 靜止：六項 `display:none`；magnify：僅第 3 項 `display:block`，rect 43.19×15.59，底緣與項目底緣齊（rel b=0）、水平置中（centreDx 0）、位於圖片正下方；`final47-h-magnify.png` 與 RED 的 E2 截圖 **byte-identical**（`cmp`） | 通過（與 RED E2 相同；見第五節 1） |
| P47-d | 切回水平恢復 | E2 下恢復無殘留 | 垂直 → 水平後 六項 rect/inline 與初始水平完全相同（Δ 全 0，`final47-h-back.png`） | 通過 |
| P47-e | 容器尺寸 | 垂直 80×480 @ (32,321)；水平 480×80 @ (32,321) | 垂直 **80×480 @ (32,321)**；水平 **480×80 @ (32,321)**；容器 computed `position: relative` | 通過 |
| P47-f | 水平方向整體外觀：magnify 靜止時項目是否在容器左右邊界內 | E2 同樣：第 1 項 l=−48、第 6 項 r=592 | 靜止：六項全在容器內（l 32…432，r ≤ 512）。magnify 靜止：第 1 項 inline left −80 → l=**−48**（超出容器左緣 80px、也超出 viewport 左緣 48px）、第 6 項 inline left 480 → r=**592**（超出右緣 80px）；第 2–5 項在左右範圍內但上緣超出（t 241–281 < 321） | 回報：超出與 RED E2 完全相同，是 ZK magnify 演算法（itemMax 160 > 容器高 80）往外長，依定稿不判 |
| 回歸 | 四 project 全跑 + chromium／gallery `-g fisheye` | — | 184 passed、47 skipped、0 failed；chromium `-g fisheye` 無測試；gallery fisheyebar **1 failed**（預期視覺變化，見第四節） | 通過（失敗為預期） |

## 三、細節（`final47.js` → `final47.json`、`final47.log`）

截圖：水平 `final47-h.png`、垂直 `final47-v.png`、magnify `final47-h-magnify.png`／`final47-v-magnify.png`、切回 `final47-h-back.png`。

1. **水平（`final47-h.png`）**：checkbox `checked=false`；容器 (32,321) 480×80。六項 rect `l = 32 + 80k`、`t = 321`、80×80，與 inline `left 0/80/…/400px, top 0, 80×80` 完全一致；圖片 64×64 位於 (l+8, t+16)。`final47-h.png` 與 RED 的 `red47-exp-E2_itemAbsolute_barRelative-h.png` byte-identical。
2. **垂直（`final47-v.png`）**：checkbox `checked=true`（`aria-orientation` 仍 `horizontal`，已知 widget 問題）；容器 (32,321) 80×480。六項 rect `l = 32`、`t = 321 + 80k`、80×80，與 inline `left 0, top 0/80/…/400px` 一致。（與 RED E2 的 `-v.png` 只差截圖裁切寬度 624 vs 864，內容相同。）
3. **magnify**（指標 (232,361)／(72,521) = 第 3 項名目中心，停 600ms）：
   - 水平：inline `left −80/0/120/280/400/480, top 0/−40/−80/−40/0/0, 80/120/160/120/80/80` → rect l −48/32/152/312/432/512、t 321/281/241/281/321/321，Δ 全 0。
   - 垂直：inline `left 0/−20/−40/−20/0/0, top −80/0/120/280/400/480` → rect l 32/12/−8/12/32/32、t 241/321/441/601/721/801，Δ 全 0。
   - 兩張 magnify 截圖與 RED E2 的對應截圖 byte-identical。
4. **transition 拖尾（第二個 context，移除 lib 的 NOANIM style tag 後量）**：

   | 時點 | 水平 maxAbsDelta | 水平六項寬 | 垂直 maxAbsDelta |
   |---|---|---|---|
   | 指到第 3 項、立即 | 20.05 | 88.84/123.25/139.95/105.55/80/80（inline 80/120/160/120/80/80） | 25.41 |
   | +600ms | 0 | 80/120/160/120/80/80 | 0 |
   | 移到第 4 項、立即 | 40 | 仍是上一狀態 80/120/160/120/80/80（inline 已變 80/80/120/160/120/80） | 40 |
   | +600ms | 0 | 80/80/120/160/120/80 | 0 |
   | 離開、立即 | 80 | 仍 80/80/120/160/120/80（inline 全 80） | 80 |
   | +600ms | 0 | 全 80 | 0 |

   結論：寬高有 `transition`，移動瞬間 rect 確實落後 inline（最多 = 相鄰狀態的尺寸差 40／80px），600ms 內全部收斂到 inline；left/top 沒有 transition（位置立即到位，拖尾只在 w/h）。NOANIM 下（主序列）則一律 Δ 0。定稿未對拖尾設門檻，僅回報。
5. **標籤**：`.z-fisheye-text`（Folder／Reading Glasses／Project／Email／Globe／Spyglass）靜止時 `display:none`；magnify 時只有被指到的第 3 項 `display:block`，rect (210.41,385.41) 43.19×15.59（水平）／(50.41,585.41)（垂直），底緣 = 項目底緣、置中、在圖片下方；圖片因此上移到項目 7.8% 處（128×128 仍佔 80%）。

## 四、回歸（`cd zkpreview`，`PREVIEW_URL=http://127.0.0.1:8105`，`--output` 指到本目錄；未用 `--update-snapshots`）

| 執行 | 結果 | 記錄 |
|---|---|---|
| `component-theming`、`hit-target`、`focus-scan`、`forced-colors` | **184 passed、47 skipped、0 failed**（2.5m）；47 skipped 為 `focus-scan` 既有 skip，數量同批次 10a | `pw-regression.log`，`pw/` 空 |
| `chromium -g fisheye` | **No tests found**（chromium project 沒有 fisheye 測試；`--list` 事前確認只有 gallery 1 筆） | `pw-chromium.log` |
| `gallery -g fisheye` | **1 failed**：`gallery › fisheyebar`，10,187 px（ratio 0.02 > 0.01） | `pw-gallery.log`，`pw-gallery/gallery-scan-gallery-fisheyebar-gallery/{expected,actual,diff}.png` |

**gallery fisheyebar 失敗分析（diff 圖逐像素計數，紅 = 計入差異）：**

| 區域 | 紅 px | 說明 |
|---|---|---|
| 項目列（y ≥ 300） | **8,389**（1.4%） | 六項由 68×80、l=48 起、上移 8px → 80×80、l=32 起、t 對齊容器：**#47 的預期視覺變化**（D83-A 已裁示水平外觀會改） |
| 頁首／標題（y < 300） | 1,798（0.3%） | 「Fisheyebar」標題、CONTROLS、Toggle 文字的字級／字重不同：baseline `fisheyebar-gallery.png` 停在 cd02d18943f（2026-09-11 初版 oracle），未隨 43d2a7d4ee3「typography-utility sweep」重生；與 fisheye 無關，單獨 0.3% 不會觸發失敗 |

兩者合計 10,187 = Playwright 報的差異數。失敗由預期的 fisheye 變化觸發；通過後依平行線文件第七節，只對 `fisheyebar` gallery 重生 baseline（不設 `UPDATE_FONT_BASELINE`），本報告未重生。已知失敗（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）不在本次 project／filter 內。寫入檢查：`git status --porcelain zkpreview/ doc/screenshots/` 執行前（`git-status-before.txt`）與執行後皆 0 行。

## 五、方法缺陷與腳本調整

**腳本調整（`final47.js` 相對 `batch10-red/red47.js`＋`red47b.js`；`lib.js` 原樣複製）：**
1. 輸出改名 `final47-*.png`、`final47.json`、`final47.log`。
2. 刪除 E1–E7 CSS 注入實驗與 CSSOM 走訪（只量測）。
3. `dump()` 增加：每項 expected／delta／ok（±1px）、`insideX`、computed `cursor`／`position`、圖片佔比、`.z-fisheye-text` 的 display／rect／相對位置。
4. `magnify()` 停穩等待 500 → **600ms**（定稿指定）；離開後也等 600ms。
5. 加入 `red47b.js` 的「水平 → 垂直 → 水平」同頁序列（P47-d）。
6. 加入 `lagProbe()`：第二個 context 以 `page.evaluate` 移除 `lib.open` 注入的 NOANIM `<style>`（不改 lib.js），移動後立即與 600ms 後各量一次。
7. 方向一律讀 checkbox `checked`（RED 修正版做法），不用 `aria-orientation`。

**缺陷／歧義：**
1. P47-c 標籤「與 RED 比較」沒有 RED 數值可比（`red47.js` 未 dump `.z-fisheye-text`）；本報告以截圖 byte-identical（RED E2）加現況數值代替。
2. P47-a 定稿寫「10%/10%/80%/80%」，但 `.z-fisheye-image` 的 inline `top:10%` 在 flex column／`justify-content:flex-end` 下不生效（static），RED 與現在的頂偏移都是 **20%**；採定稿括號的「與 RED 相同的比例」分支判通過。
3. `chromium -g fisheye` 無測試（exit 1「No tests found」），不是失敗。
4. fisheyebar gallery baseline 早於 typography sweep（第四節），無法在不連舊 build 的情況下證明此測試在 #47 之前是否已通過；但頁首差異 0.3% 低於 1% 門檻，失敗歸因於 fisheye 變化。
5. transition 拖尾只量「立即」與「600ms」兩點，沒有量過渡曲線；定稿亦未設門檻。
6. `aria-orientation` 切垂直後仍 `horizontal`，follow-up（定稿已記）。

## 六、結論

J47-1、J47-2、J47-3 六項 rect 與 inline 在水平、垂直、magnify（停穩）五個狀態 Δ 全為 0；保護項（圖片比例、cursor、標籤、切回、容器尺寸）全部通過；magnify 放大項超出容器與 RED E2 完全相同，屬 ZK 設計；transition 拖尾在 600ms 內收斂；回歸 184 passed／0 failed，gallery fisheyebar 1 failed 為 D83-A 裁示的預期水平外觀變化（項目列 8,389 px），待 Planner 依第七節重生該張 baseline。

GATE47-FINAL: PASS
