# ZK-6188 驗證（Planner，2026-10-08，8105）

腳本 `t.js`：在預覽頁 `errorbox.zul` 的 `Required field` 欄位觸發真實 errorbox，拖到欄位上方，量 pointer 的 inline style 與 rect；第二組先注入 Jira 的 Workaround（覆寫 `Errorbox.prototype._fixarrow`，先清空 pointer 的 left／top／right／bottom）。

| | 拖曳後 pointer inline | pointer y | 箱子底緣／內容底緣 | 結論 |
|---|---|---|---|---|
| 無 Workaround | `top: 33px; left: 91px; bottom: -4px;`（殘留舊 `top`） | 338–350 | 379／371 | 三角在箱子**內部**，重現 |
| 有 Workaround | `left: 91px; bottom: -4px;` | 371–383 | 379／371 | 三角掛在內容底緣下方，正確 |

**範圍：** 在預覽頁的 `errorbox.zul` 驗證，**沒有**逐字用 Jira 內文的 `<window>＋<textbox>` 片段（那需要新增頁面）；機制相同。Jira 內文中「反方向換位時三角留在箱子外面」一句來自設計師 GIF 的觀察與機制推論，沒有另外實測。
