Uses 8085

# 第 12 批 RED：#10 Switch（Material 2 → Material Design 3）

Verifier 回報全文的整理版。報告檔因 harness hook 不允許 subagent 寫檔，由 Planner 依其回報寫入；數字未改動。證據（PNG、`measure.js`、`measurements.json`）在 session scratchpad：`.../scratchpad/batch12-red/`。

- 環境：8085，Chromium（Playwright 1.59.1，`ignoreDefaultArgs:['--hide-scrollbars']`），viewport 1280×900。`zk.wcs` 646238 bytes，sha256 `8ec605d2190dc6fc…`，含現行 switch 區段（軌道 34×14、滑塊 20、`::before` 38）。
- DOM：`span.z-checkbox.z-checkbox-switch > input + label.z-checkbox-mold + label.z-checkbox-content`。
- token（頁面讀到）：`--zk-color-outline` = `rgba(0,0,0,.23)`（疊白底 `#c4c4c4`）、`surface-container-highest` `#e0e8f4`、`primary` `#376fd0`、`on-primary` `#fff`、`--zk-state-hover-opacity` .08、`--zk-state-disabled-opacity` .38、`--zk-control-height` 40px（compact 32px）。ΔE 為 CIE76，半透明 token 先疊在頁面背景再比。

## 判定（今天必須失敗）：六項全 FAIL，RED 成立

| 判定 | 量到 | 結果 |
|---|---|---|
| J10-1 軌道 52×32 | off、on 皆 34×14 | FAIL |
| J10-2 滑塊 16／24 | computed off、on 皆 20×20；ink on 19×20，off 17×18（白滑塊疊白底，只抓到重疊處與陰影） | FAIL |
| J10-3 位置 | 垂直中心差 0（已達標）；水平：off 中心距左緣 7px、on 距右緣 7px（期望 16±1.5） | FAIL（垂直已達標） |
| J10-4 關閉態配色 | 無外框；軌道填 `#9d9d9d`；滑塊 `#fff`。ΔE：外框 14.42、填色 27.82、滑塊 20.84 | FAIL |
| J10-5 開啟態配色 | 無外框；填 `#9bb7e7`（50% primary）；滑塊 `#376fd0`。ΔE：填色 40.76、滑塊 77.55；「無外框環」子項已成立 | FAIL |
| J10-6 hover 狀態層 | `::before` 38×38（期望 40±1）；中心差 0；opacity .08；顏色 ΔE 0／0.68 | FAIL（只差尺寸） |

## DEMO：Switch 獨立區塊

頁面區塊標題只有 `States`、`Tristate Mold`；沒有 `Switch`；四個 switch 是 `States` 網格內的一列。FAIL。

## 保護項（BEFORE 數值）

| # | 結果 | 備註 |
|---|---|---|
| 1 點擊／空白鍵切換 | PASS | |
| 2 focus-visible、focus-scan | PASS | outline 2px primary，offset 2px；`focus-scan -g "scan checkbox"` 1 passed |
| 3 disabled | PASS | root opacity .38、`pointer-events:none`、點擊後 class 不變；mold 自己 computed `cursor:pointer`（見缺陷 7） |
| 4 標籤間距、字型、列高 | PASS | 間距 12px；`400 13px/20px Inter`；列高 40px |
| 5 其他 checkbox／radio／toggle 像素 | PASS（基線已記錄） | `checkbox-page-before.png` sha256 前 16 碼 `3a618e093a067c19` |
| 6 usecase 頁 switch | PASS | account-settings `[1038,138.59,34,14]`／`[1038,203.59,34,14]`；brand-switcher `[367.25,634.59,34,14]`；index `[187,73,34,14]`；無重疊、無裁切 |
| 7 compact 置中 | PASS | default 列 40／mold 14／偏移 0；compact 列 32／偏移 0。暗色：主題沒有暗色模式，N/A |
| 8 R10 滑塊對軌道 ≥ 3:1 | **今天即 FAIL** | off：`#fff` vs `#9d9d9d` 2.71:1；on：`#376fd0` vs `#9bb7e7` 2.37:1 |
| 9 forced-colors | PASS | off `1px solid canvastext`、滑塊 `#000`；on 填 highlight、滑塊 `#fff` |
| 10 頁面可渲染 | PASS | 四個頁面 200；僅 `usecase/index.zul` 的 `localhost:50000/zk-live-reload.js` ERR_CONNECTION_REFUSED（與主題無關） |

## 方法缺陷（Verifier 提出）

1. 半透明 token 的 ΔE 基準未定義（要疊在實際背景）。
2. J10-2 的 ink 交叉驗證在 off 態今天無效（白滑塊疊白底）。
3. **J10-4 與保護項 8 互斥**：照 MD3（off 滑塊 = outline，軌道 = surface-container-highest），Marble token 下對比只有 1.41:1（MD3 參考色 `#79747E`／`#E6E0E9` 為 3.51:1）；on 態 `#fff`／`#376fd0` 為 4.83:1。
4. 暗色不可量。
5. DEMO 判定文字要改成「`States` 網格內 `.z-checkbox-switch` 為 0」。
6. 保護項 10 要排除 live-reload 的 console error。
7. 保護項 3 的 not-allowed 只是 computed 值。
8. J10-3 ink 中心與 computed 中心差 0.84px，容差要容得下。

RED12-10: DONE
