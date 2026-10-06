# Template → zk 文件轉移缺口：盤點與補轉移紀錄

**狀態：** 已執行（2026-10-05）。裁示紀錄見 `marble-to-zk-execution-plan.md` 的 D209。

## 摘要

- 依據：`migration-manifest.md`（2026-09-08 定稿，09-09 執行）替每份文件決定了處置方式：MOVE / STAGED COPY / SKILL / ARCHIVE。
- P3 只有 rows 3.6、3.7+3.8、3.18、3.18b 實際搬了檔案，**manifest 列為 MOVE / STAGED COPY 的其餘文件沒有任何 row 負責**，所以一直沒轉過來。
- 2026-10-05 從 template HEAD `182e1092` 用 `git archive` 補轉移 **164 個檔案**，逐檔用 `cmp` 驗證跟 template HEAD 一致。
- 從這天起，`zk` 裡的副本才是要編輯的版本；template 那邊的原件不再更新。

| 類別 | 數量 | 處理 |
|---|---|---|
| A. manifest 判定 MOVE / STAGED COPY | 24 份，加上 `doc/migration/` 的附屬檔 | **已轉移**（共 156 檔，含 B 類） |
| B. manifest 判定 SKILL，但沒看到併入的證據 | 3 | **以檔案形式轉移**（使用者 D4-A），之後再評估要不要併入 skill |
| C. manifest 判定 ARCHIVE | 3 | 不轉移，符合計畫 |
| D. 9/9 新增，manifest 未分類 | 11 | **轉 8 份、不轉 3 份**（見下方） |
| 先前已轉移 | spec 26、contracts 131、screenshots 291（在 `zkpreview/doc/`）、3.18 的 12 個路徑 | — |

## A + B：已轉移（156 檔）

- `doc/jess-review/`：全部 6 份。
- `doc/migration/`：全部 138 檔，包含 migration plan、execution plan、manifest、risk assessment、appendix、session-memory-transfer、path-rewrite-map，以及 `drafts/ gates/ ledgers/ tools/`。
- `doc/backlog/css-cleanup-todo.md`。
- 架構與流程文件：`zk11-less-dsp-deprecation-evaluation.md`、`conditional-css-without-preprocessor.md`、`test-architecture.md`、`preview-deployment.md`、`design-review-feedback.md`、`zk-source-reference.md`、`zk-edition-components.md`。
- `focus-ring-clip-backlog.md`。
- B 類：`icon-library-evaluation-criteria.md`、`zk-framework-themability-recommendations.md`、`framework-feature-gaps.md`。

轉移是逐字複製，所以檔案內的路徑仍然是 template 的寫法，跟 3.18 的做法一樣。`doc/migration/tools/` 裡的腳本也都還指向 template，不是在 zk 裡執行用的。

## D 類：逐份判斷

判斷原則：已經被 zk 文件引用的就要轉（template 的規則：被追蹤文件引用的路徑本身也要被追蹤）；沒被引用的，看它描述的工作在 zk 是否已經做完。

| 檔案 | 判斷 | 理由 |
|---|---|---|
| `drop-less-pure-css-evaluation.md` | 轉 | 被 `conditional-css-without-preprocessor.md` 引用；屬於 LESS/DSP 決策的佐證 |
| `content-fit-similar-cases-audit.md` | 轉 | 被 `skill-gaps.md` 引用 |
| `multislider-knob-hit-target-analysis.md` | 轉 | 被 `skill-gaps.md` 引用 |
| `harness/escalation.md`、`library-config-issues.md`、`token-issues.md` | 轉 | 被 `orchestrator-playbook.md`、`work-status.md` 等引用；harness 的 append-only log |
| `harness/outcome-migration-log.jsonl` | 轉 | 被 `outcome-migration-status.md` 引用（目前是空檔） |
| `preview-url-indirection.md` | 轉 | 沒被引用，但 zk 的 contracts 都採用了它定下的 `preview: ${PREVIEW_URL}/…` 寫法，這份是該寫法的設計紀錄 |
| `backlog/component-theming-api-plan.md` | **不轉** | 計畫內容已經實作完成，見 `doc/spec/component-theme-variables.md` |
| `backlog/tier1-2-responsive-utilities.md` | **不轉** | 已經實作，見 `utility/_layout.css` 的 `z-d-md-*`；命名在 `52fc5b101d` 改成 infix 形式 |
| `documentation-conventions.md` | **不轉** | 它描述的 `npm run check:doc-links` 在 zk 不存在，轉過來會描述一個不存在的檢查 |

## C 類：ARCHIVE，不轉移

`daterangebox-focus-ux-review.md`、`skill-feedback-loop.md`、`state-coverage-audit.md`

## 無法確認的項目

manifest 列為 STAGED COPY 的 `tasks/todo.md`，已經不在 template 的 `tasks/` 底下（`tasks/` 不受 git 管理），無法得知內容去了哪裡。

## 已轉移但內容不同（預期中）

- `doc/skill-gaps.md`：3.18 備註過 F61，zk 端之後另有修改。
- `doc/verification-harness-decisions.md`：zk 於 2026-09-14 加入 DR-3。
- `harness-followups.md` 在 zk 已更名為 `marble-theme-followups.md`（`67dd066352`）。
