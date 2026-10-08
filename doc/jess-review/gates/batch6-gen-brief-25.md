# 第六批 #25 Generator brief（slider 提示框對齊）

你是 Generator。只改 CSS，不開瀏覽器量測、不碰文件、不 commit。Verifier 之後會在不看 diff 的情況下用像素判定。

## 可改的檔案（只有一個）
`zul/src/main/resources/web/js/zul/inp/css/slider.css`，只動 `.z-slider-popup` 附近（提示框定位）。不要動 `.z-slider-input` 等其他規則。build 依 `.claude/skills/marble-theme/SKILL.md`。不加 `!important`、不寫死色值。

## 問題與數字（gates/batch6-red.md）
拖曳 slider 時 ZK 把 `#zul_slidetip.z-slider-popup` 加到 `<body>`，用 JS `position(thumb, 'before_start'|'end_before')` 定位，**提示框的左緣對 thumb 的左緣（水平）／頂緣對 thumb 的頂緣（垂直）**，所以：
- 水平：提示框水平中心偏離 thumb 中心 = (提示寬 − 20)/2（「5」1.5px、「50」5.0px、「100」7.4px），提示框在 thumb 上方。
- 垂直：提示框在 thumb 右側，垂直中心偏離 = (提示高 28 − 20)/2 = 4px。

## 要求
提示框中心與 thumb 中心對齊（水平 slider 看水平中心、垂直 slider 看垂直中心，差 ≤ 1px；thumb 是 20×20）。提示寬度不固定，所以位移要用提示框自身尺寸（`translate` 的百分比）。

## 提示：用 `:has()` 判定方向
提示框在 `body` 下、沒有方向 class；但拖曳時被按住的 thumb 是 `:active`，其祖先 slider 有方向 class。已實測在真實拖曳中成立：
`body:has(.z-slider-horizontal .z-slider-button:active)` 水平成立、`body:has(.z-slider-vertical .z-slider-button:active)` 垂直成立。
水平：`translate: calc(-50% + 10px) 0`（把提示框左緣對 thumb 左緣，改為中心對 thumb 中心）；垂直：`translate: 0 calc(-50% + 10px)`。請用 `translate` 屬性（不是 `transform`），並在註解寫明原因（JS 以左／頂緣對齊、提示框無方向 class）。需涵蓋 default、sphere、scale 三種 mold 與 vertical default／sphere。

## 保護
文字仍在框內置中；提示框與 thumb 不重疊（水平在 thumb 上方、垂直在右側，今天間隙 0；位移不得造成交集）；顏色／字級／padding 不變；沒有拖曳時 `.z-slider-popup` 不存在（不受影響）。若純 CSS 做不到，說明並停手，不要改 TS。

## 回報
改了哪些行與理由、build 指令與結果。
