# Gate：第八批 Generator（A 線）— #48、#51

只改 CSS，沒有開瀏覽器、沒有 build、沒有 commit。未動 #49（`.z-menuitem-icon.z-icon-check` 規則不變）。`npx stylelint` 對兩個檔案都無輸出（通過）。以下是依 RED 數字做的預測，**尚未量測**，等 Planner build 後由 Verifier 驗。

## 1. #48 — `zul/src/main/resources/web/js/zul/menu/css/menu.css`（+7 行）

在 `.z-menupopup .z-menu-content::before` 之前新增：

```css
.z-menupopup .z-menu-content [class*="z-icon-"]:not(.z-menu-icon) {
    font-size: 18px;
    flex-shrink: 0;
}
```

- 原因：popup 內 `z-menuitem` 的 iconSclass 規則（`.z-menuitem-content [class*="z-icon-"]:not(.z-menuitem-icon)`）設 `font-size: 18px`，所以 `<i>` 盒 18px；`z-menu` 列沒有對應規則，`<i>` 繼承文字大小，盒只有 13px，文字因此左移 5px（RED：86.5 vs 92）。
- 新規則讓 `z-menu` 列的 iconSclass 盒也是 18px，文字 ink 左緣與圖示 ink 中心都跟 `z-menuitem` 列對齊（預測 5px 差消失）。
- `:not(.z-menu-icon)` 排除右側 caret（`z-menu-icon z-icon-caret-*`，仍是 12px、`margin-left:auto`），所以箭頭位置不變。
- 沒碰：`image` 16px 列、列高、padding、hover／selected 狀態層、勾選欄。頂層 menubar 的 `.z-menu-content` 不受影響（選擇器限定在 `.z-menupopup` 內）。巢狀子選單的 `.z-menupopup` 是 `li.z-menu` 的子節點、不在 `a.z-menu-content` 內，不會被誤中。
- 沒設 `color`：`z-menuitem` 圖示是 `on-surface-variant`，`z-menu` 圖示顏色沒有被要求對齊，維持不變（若 Planner 要顏色也一致，是另一個 follow-up）。

## 2. #51 — `zkcml/zkmax/src/main/resources/web/js/zkmax/nav/css/nav.css`（+42 行）

### (a) 展開式垂直 navbar（`.z-navbar-vertical` 範圍內，位於 `.z-nav > ul .z-navitem-content` 縮排規則之後）

用巢狀 `.z-nav > ul > …` 子代選擇器判斷深度，**縮排放在 content 元素（`.z-nav-content`／`.z-navitem-content`）的 `padding-left`**，不動 `ul`，所以狀態層仍滿寬。每層 +26px（`calc(var(--zk-spacing-4) + N*26px)`）：

| 層 | nav 群組標題 | navitem |
|---|---|---|
| L1 | 16（不變） | 16（不變） |
| L2 | **42**（新） | 42（既有規則） |
| L3 | **68**（新） | **68**（新） |
| L4 | **94**（新） | **94**（新） |
| L5 | — | **120**（新） |

預測：Settings 文字 74.5 → ~100.5（比 Contact 多 26）；Edit profile 101 → ~127（比 Reply 多 26）。第一層、箭頭（`::after`）、badge（`margin-left:auto`）、列高都沒動。限定 `.z-navbar-vertical` 是因為水平 navbar 的下拉被列為保護項（「水平 navbar 不變」）。

### (b) popup（`ul.z-nav-popup`，位於 `.z-nav-popup .z-nav-content, … .z-navitem-content` 之後、Collapsed 區塊之前）

1. 新增 `.z-nav-popup ul { list-style: none; margin: 0; padding: 0; }`：popup 搬到 body 之後沒有 `.z-navbar` 祖先，`.z-navbar ul` 的 reset 碰不到，巢狀 `ul` 拿到瀏覽器預設的 `list-style: circle`、`padding-left: 40px`（RED 根因）。reset 後 bullet 消失、巢狀列與 L2 同左緣、L3 hover 狀態層滿寬。
2. 新增逐層縮排（popup 內 L2 的 nav／item 是 16，維持不變）：popup 內 L3 的 nav 標題與 item = 42，L4 item = 68。L3 item 原本就會被 `.z-nav > ul .z-navitem-content`（42）涵蓋，新規則只是把 L3 nav 標題與 L4 補齊。預測：L3 文字比 L2 多 26px（在 12–30 內）。
- `.z-nav-popup` L1／L2 外觀沒動；`.z-nav-popup-horizontal` 沒有獨立規則，沿用同一組。

## 3. 風險與備註

- 沒有加 `!important`、沒有新 token、沒有硬編碼色；新規則都在既有 `@layer zk-components` 區塊內。
- 預測的最大風險：popup L3 的 hover 狀態層是否真的因 `ul` 的 40px padding 消失而滿寬（`.z-nav > ul` 有 `overflow:hidden`，但 `ul` 本身現在左緣貼齊 popup）；請 Verifier 重量 J51-2(c)。
- 既有的 `.z-navitem-content:hover { background-color: rgba(0,0,0,0.08) }` 是 pre-existing 的硬編碼色，未動，僅提醒。
- 提交順序：zkcml 先。

## 4. `git diff --stat`

zk（本批檔案）：
```
 zul/src/main/resources/web/js/zul/menu/css/menu.css | 7 +++++++
 1 file changed, 7 insertions(+)
```
zkcml（本批檔案）：
```
 .../main/resources/web/js/zkmax/nav/css/nav.css | 42 ++++++++++++++++++++++
 1 file changed, 42 insertions(+)
```
（兩個 stat 都限定本批檔案路徑；zk 另有他人未提交的 `listbox.css`、`selectbox.css` 變更，不屬於本批。）
