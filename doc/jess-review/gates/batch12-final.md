Uses 8085

# 第 12 批 FINAL：#10 Switch（Material 2 → Material Design 3）

Verifier（Fable，未看 diff）的回報整理版，由 Planner 寫入（Verifier 不可寫 repo 檔）。證據在 session scratchpad `.../scratchpad/batch12-final/`（PNG、腳本、`measurements-final.json`、`regression.json`）。方法見 `lines/line-a-plan.md` 第八節與「#10 方法修訂」；RED 見 [batch12-red/report.md](batch12-red/report.md)。

新 build 確認：`zk.wcs`（`/zkres/web/80d8265b/zul/css/zk.wcs`）542919 bytes、sha256 `fd9f962ea54fb833…`（RED：646238 bytes、`8ec605d2190dc6fc…`），switch 區段含 52px／32px。

## 判定（BEFORE → AFTER）

| 判定 | AFTER | BEFORE | 結果 |
|---|---|---|---|
| J10-1 軌道 52×32 | off、on 皆 52×32 | 34×14 | PASS |
| J10-2 滑塊 16／24 | computed 16／24、圓形；ink 差 0 | 20／20 | PASS |
| J10-3 位置 | 垂直差 0；水平 off 距左 16.0、on 距右 16.0 | 7／7 | PASS |
| J10-4 關閉態配色 | 外框 2px，ΔE 0.46；填色 ΔE 0；滑塊（on-surface-variant）ΔE 0 | 無外框、`#9d9d9d`、`#fff` | PASS |
| J10-5 開啟態配色 | 填色、滑塊 ΔE 0；無外框環 | `#9bb7e7`、`#376fd0` | PASS |
| J10-6 hover 狀態層 | 40×40、中心差 0、opacity .08 | 38×38 | PASS |
| DEMO | 有 `Switch` 標題；區塊內 4 個；`States` 網格內 0 | 無 | PASS |

## 保護項

1–7、9 PASS（列高差 0／0／0／0；label 間距 12px 不變；checkbox／radio／toggle／tristate 像素 maxΔE 0；usecase 三頁無重疊無裁切；compact 置中；forced-colors on／off 可分辨）。
**保護項 8（R10）：** 關閉態滑塊對軌道 5.36:1（BEFORE 2.71），開啟態 4.83:1（BEFORE 2.37）。
**記錄、不判定：** 軌道外框 ink 對白底 2.13:1（outline token 疊白底 1.74:1，Marble 全站 outline token 的問題，不在本批處理）；off 軌道填色對白底 1.23:1。

位移（預期）：mold Δ(w +18, h +18)；account-settings 與 index 右對齊所以 x −18；DEMO 把 Switch 列移出網格，使 Toggle 列 y −48、Tristate 區 y +86（像素不變）。

## 回歸（8085 實跑，未用 `--update-snapshots`，排除 `forced-colors-gallery`）

441 passed／12 failed／47 skipped。component-theming 107／0、focus-scan 57／0、hit-target 3／0、forced-colors 17／0、chromium 131／1、gallery 79／3、tablet 47／8。

| 失敗 | 歸因 |
|---|---|
| chromium `checkbox-gallery`（631→717px） | **本批預期**：Switch 區塊獨立、外觀改變 |
| tablet `checkbox-tablet`（696→796px） | **本批預期** |
| gallery `grid-header`、tablet `calendar`、`slider` | 已知失敗，不計 |
| gallery `component-theming`、tablet `toolbar`、`panel`、`biglistbox`、`selectbox` | 已在 [merge-1.md](merge-1.md) 歸因：A 線 #54、批次 11 toolbar、#29 的預期效果，baseline 過舊（tablet 與 component-theming 未重切）。與本批無關（diff 區域無 checkbox／switch） |
| gallery `menubar`、tablet `menubar` | merge-1 當時沒有這兩項。差異在 menubar 頁首字級、menupopup 上移 16px、menuitem 圖示列，沒有 switch。**歸因：`221d6ed74b`（2026-10-09，`menu.css`／`a.css`／`A.ts`，menubar 圖示間距與垂直 menubar 對齊，不屬本批）；`menubar-gallery.png`／`menubar-tablet.png` 最後一次更新 2026-09-12 以前。** 本批不處理，記 follow-up |
| `grid-paging`（merge-1 有） | 本次回歸沒有失敗 |

Verifier 另列的觀察：這 7 個非 switch 失敗的 diff 區域都沒有 checkbox／switch 元素，switch 的選擇器全是 `.z-checkbox-switch`，含 switch 的預覽頁只有本批 4 頁。

GATE12-10-FINAL: PASS
