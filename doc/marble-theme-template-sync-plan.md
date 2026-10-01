# Marble CSS → zkThemeTemplate 同步計畫

## 摘要

目標：`zk` repo 的 `marble` 分支往後每次異動 Marble CSS 原始檔時，自動同步一份到外部的
`zkThemeTemplate` repo（`git@github.com:zkoss/zkThemeTemplate.git`）的 `marble` 分支，做法比照
IceBlue 當年的同步慣例，但改用 repo 內建的 GitHub Actions 取代舊有、只存在於 Jenkins 伺服器上的
Job。

已定案：
- 機制：`zk` repo 內的 GitHub Actions workflow，在 push 到 `marble` 分支時觸發，把 CSS 原始檔複製並
  push 到 `zkThemeTemplate` 的 `marble` 分支。
- 範圍：只同步手寫的 `.css` 原始檔（`zul/src/main/resources/web/zul/css/` 與
  `zul/src/main/resources/web/js/zul/<pkg>/css/`），不含編譯後的 `.css.dsp`，也不含 `zkcml`
  （EE）那份。
- 起手式：先在 `zkThemeTemplate` 建一個 `marble_origin` 備份分支保留現狀，再校準 `marble` 分支跟
  `zk` 現在的狀態一致。

**重要更正（相對於先前討論的假設）：** 原本以為 `zkThemeTemplate` 的 `marble` 分支是遷移前留下的
舊快照，需要整支重設。實際比對兩邊 87 個 CSS 檔案的內容後發現：**80 個檔案完全一致，只有 7 個檔案
有差異**，而且這 7 個差異全部對應到 `zk` 這邊最近 5 個 commit（`ZK-6112` 系列，把 `.z-card` 改名
`.z-paper`、統一字重與 surface colour 命名、砍掉重複的 utility class 別名、補完寬高百分比 scale、
簡化 flex/gap 命名）。也就是說 `zkThemeTemplate` 的 `marble` 分支其實一直跟 `zk` 保持同步到
2026-09-12，只是最近這 5 個 commit 還沒追上去。**這不影響最終決策方向（D1/D2/D3 仍然成立），但代表
「校準」實際上只是同步 7 個檔案，不是整支分支重寫。**這個更正不影響結論，但大幅降低了起手式的風險與
工作量。

## 階段拆解

### 階段 0：一次性校準（起手式）
1. 在 `zkThemeTemplate` 建立 `marble_origin` 分支，指向目前 `marble` 分支的 HEAD
   （`80e81e1b`，"ZK-6112: record the P3 gate verdict and close out P3"），保留現狀當備份。
2. 把 7 個有差異的檔案從 `zk` 的 `marble` 分支同步過去，用一個 commit 說明是追上 `zk` 最近 5 個
   commit 的內容。
3. 這一步需要有 `zkThemeTemplate` 的 push 權限才能執行——目前我這邊只確認得到 read 權限
   （`git ls-remote` 成功），沒辦法確認 write 權限。

### 階段 1：建立 GitHub Actions workflow + 密鑰
1. 需要一位有 `zkoss/zkThemeTemplate` repo admin 權限的人：產生一組有寫入權限的 deploy key（或
   PAT），加到 `zkThemeTemplate` 的 Deploy Keys（勾選 Allow write access）。
2. 把私鑰存進 `zk` repo 的 GitHub Actions Secrets（建議命名 `ZKTHEMETEMPLATE_DEPLOY_KEY`，比照現有
   `SSH_KEY` 的用法但這組要有寫入權限，`SSH_KEY` 目前只拿來唯讀 checkout `zkcml`，不能重複用）。
3. `.github/workflows/sync-marble-theme.yml`：
   - 觸發條件：push 到 `marble` 分支，且改動落在
     `zul/src/main/resources/web/zul/css/**` 或 `zul/src/main/resources/web/js/zul/*/css/**`。
   - checkout `zk`（完整歷史，`fetch-depth: 0`，因為要逐一走訪這次 push 帶的每個 commit），再用
     `ZKTHEMETEMPLATE_DEPLOY_KEY` checkout `zkThemeTemplate` 的 `marble` 分支。
   - **一對一重放（1:1 replay）：** 用 `git rev-list --reverse --first-parent` 列出這次 push 範圍內
     （`github.event.before`..`github.sha`）的每個 commit，依序處理。每個 commit 都用 `git archive`
     取出「那個時間點」的 CSS 原始檔狀態，整個 rsync 進 `zkThemeTemplate`；如果跟上一個狀態比對後有
     實際差異，就在 `zkThemeTemplate` 建立**一個對應的 commit**（保留原 commit 的 subject/body、作者
     姓名信箱、作者時間，並在 commit message 加一行 `Synced-from: zkoss/zk@<sha>` 可追溯回去）；沒有
     實際改到 CSS 的 commit（例如只是改 demo ZUL、文件）就跳過，不產生對應 commit。
   - 所有 commit 都處理完之後，一次性 `push` 回 `zkThemeTemplate` 的 `marble` 分支。
   - 如果 `github.event.before` 是全零（新分支）或不是 `zk` 這邊可辨識的祖先（例如 force-push），就
     退回成只同步「這次 push 完的最終狀態」當一個 commit，不嘗試逐筆重放。

### 階段 2：驗證
1. 找一個真實的 CSS 變動（或刻意做一個小變動）push 到 `marble`，確認 workflow 有觸發，
   `zkThemeTemplate` 的 `marble` 分支收到對應 commit 且內容正確。
2. 確認 `zkThemeTemplate` 的預設分支仍是 `master`（不受影響），避免觸發 `zkcml` 那邊
   `zkthemebuilder/build.sh -u` 的 submodule 地雷（已在
   `.claude/skills/marble-theme/reference/iceblue-parity.md:134-139` 記錄過)。

## 技術附錄

### 路徑對照表
| zk repo | zkThemeTemplate repo |
|---|---|
| `zul/src/main/resources/web/zul/css/**` | `src/main/resources/web/zul/css/**` |
| `zul/src/main/resources/web/js/zul/<pkg>/css/**` | `src/main/resources/web/js/zul/<pkg>/css/**` |

單純去掉開頭的 `zul/` 這一層模組名稱，其餘路徑完全相同。

### 檔案統計（2026-09-30 比對結果）
- 比對範圍：87 個 `.css` 檔案（`zul/css` 下 24 個 + `js/zul/<pkg>/css` 下 63 個）。
- 完全一致：80 個。
- 有差異：7 個 ——
  `zul/css/tokens/_fonts.css`、`zul/css/tokens/_forced-colors.css`、
  `zul/css/utility/_colors.css`、`zul/css/utility/_components.css`、
  `zul/css/utility/_layout.css`、`zul/css/utility/_print.css`、
  `zul/css/utility/_typography.css`。
- 差異內容：`.z-card` → `.z-paper` 改名、`.z-fw-regular` → `.z-fw-normal`、
  移除 `.z-text-muted` / `.z-bg-surface-low` 等重複別名、寬高 breakpoint 命名從
  suffix 改成 infix、註解與文件連結更新。全部對應 `zk` 最近 5 個 `ZK-6112` commit，沒有衝突性的
  分歧內容。

### 既有 secrets 慣例
`zk` repo 現有 workflow（`zk-build.yml`、`dependency-submission.yml`、`codeql.yml`）用
`secrets.SSH_KEY` 傳給 `actions/checkout` 唯讀 checkout 私有的 `zkoss/zkcml`。目前沒有任何 workflow
會 push commit 到別的 repo，所以這次需要新的、有寫入權限的 secret，不能沿用 `SSH_KEY`。

### 執行狀態（持續更新）
- 階段 0（一次性校準）已完成：`zkThemeTemplate` 建了 `marble_origin` 備份分支保留校準前狀態，
  `marble` 分支已校準到跟 `zk` 一致，逐檔比對過確認無差異。
- `marble` 的實際開發目前是在 `hawkchen/zk`（個人 fork）進行，不是直接 push `zkoss/zk`——
  `zkoss/zk` 目前沒有 `marble` 分支。因此 `ZKTHEMETEMPLATE_DEPLOY_KEY` 這組 Secret 實際上要放在
  **`hawkchen/zk`**，不是原本以為的 `zkoss/zk`（第一次設定時放錯地方，已修正，用
  `scripts/setup-fork-deploy-key.sh` 重新設定在正確位置）。
- Workflow 已驗證過實際運作：`hawkchen/zk` 的 `marble` push 後，`zkThemeTemplate` 的 `marble` 分支
  有正確收到對應的同步 commit。
- `zkThemeTemplate` 的預設分支仍是 `master`，沒有受影響。

### 待確認事項
- `zkThemeTemplate` 本地 clone（`/Users/hawk/Documents/workspace/zkThemeTemplate`）除了 `marble`
  外還有不少 local-only 分支（如 `backup/pre-merge-ab-2026-08-13`、`iceblue`、`breeze` 等），這些
  跟這次同步計畫無關，執行時只會動到 `marble` 這一支。
- 如果之後 `marble` 的開發改成直接在 `zkoss/zk` 進行（或透過 PR 合併進去），`ZKTHEMETEMPLATE_DEPLOY_KEY`
  這組 Secret 需要跟著搬到 `zkoss/zk`，並考慮要不要把現在掛在 `hawkchen/zk` 上的那把 Deploy Key 收回。
