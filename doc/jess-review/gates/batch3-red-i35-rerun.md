# Batch 3 · #35 修正量法後的 RED 重跑（2026-10-07）

- 對象：目前 code，Option A（只改排序圖示；欄選單維持 caret；舊判定 3 略過）。
- 量法：每個圖示裁到自己的 ink bounding box（補成正方形）、縮成 16x16、devicePixelRatio 4、墨跡門檻 0.5；判定 1 用 IoU < 0.5。
- 腳本：`batch3-red/i35-rerun.js`（沿用 `i35-method.js` 的 `grab` / `normalized` / `iou`）；原始數字：`batch3-red/i35-rerun.json`。
- 頁面：`grid.zul` 第 2 個 grid（Basic）Title 欄，真實點擊並等 server round trip；`grid-grouping.zul` 第一個 `.z-group-icon`。

## 結果

| 檢查 | 量到 | 門檻 | 今天 | 分類 |
|---|---|---|---|---|
| 判定 1 desc：IoU(排序, 欄選單) | 0.867 | < 0.5 | FAIL | RED-correct |
| 判定 1 desc：IoU(排序, 群組圖示) | 1.000 | < 0.5 | FAIL | RED-correct |
| 判定 2 asc：IoU(排序, 欄選單) | 0.135 | < 0.5 | PASS | RED-correct（保護項） |
| 判定 2 asc：IoU(排序, 群組圖示) | 0.122 | < 0.5 | PASS | RED-correct（保護項） |
| IoU(asc 排序, desc 排序) | 0.122 | < 0.9 | PASS | RED-correct（保護項） |
| 未排序欄沒有排序圖示墨跡（Author / Title / Publisher） | 三者 `.z-column-sorticon i` 都沒有 box，墨跡 0 | 無墨跡 | PASS | RED-correct（保護項） |
| 對比 ≥ 3:1（靜止） | asc 5.74、desc 5.74 | ≥ 3 | PASS | RED-correct（保護項） |
| forcedColors active 下看得見 | asc / desc 墨跡 244 px、對比 21 | 有墨跡 | PASS | RED-correct（保護項） |
| title | `Ascending Order` / `Descending Order` | 存在 | PASS | RED-correct（保護項） |
| 排序有作用（新頁面點一次） | `The Northern Clemency` → `Hurry Down Sunshine` | 變更 | PASS | RED-correct（保護項） |

Class 現況：asc 排序 `z-icon-caret-up`、desc 排序 `z-icon-caret-down`、欄選單 `z-icon-caret-down`。desc 的 IoU 會 >= 0.5 是因為三者是同一個 caret 字形（群組圖示 1.000 是同一字形的位置不同，欄選單 0.867 是 bounding box 大小差異）。

## 備註

- 「未排序欄沒有墨跡」今天是空洞成立：未排序時 `.z-column-sorticon i` 沒有 box。修完後若改成永遠有 box，要靠墨跡量法才判得出，所以腳本已用 ink 判斷（有 box 時量 inkPx）。
- forcedColors 兩個狀態的 IoU 與 normal 完全相同（0.135 / 0.122 / 0.867 / 1.000）。
- 排序有作用只比對一次點擊前後（舊腳本點兩次的問題已避免）。

RED: OK
