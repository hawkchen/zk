# Jess review：兩條並行線的分工與合併規則

建立日期：2026-10-08。適用：第 7 批起，剩餘 30 個 issue（P1 26 + DECIDE 4）。
流程本身不變，仍依 [jess-review-decision-principles.md](jess-review-decision-principles.md)（每批流程、第五節例外）。本文件只規定「兩個 session 同時做時，怎麼不互相踩」。

## 一、為什麼只開兩條

- 預覽站是共用資源，每次 CSS 改完都要重建並重啟；兩條線共用同一台會互相量到舊 build（第 6 批已遇到一次）。所以每條線要有自己的預覽站。
- 看板、驗證計畫、決策原則三份文件是共用的，多條線同時追加會衝突。兩條線的合併成本可控，三條以上先不開。
- 例外要停下問使用者；並行的批次可能同時需要裁示，兩條線的議題量使用者還能一次處理。

**D51（已決，2026-10-08，使用者）：** 允許並行使用不同的 port。**條件：第二台預覽站必須從自己的 worktree 啟動**（B 線 `ZK10/jess-b/zk`、port 8105）。過去「一台就好」的規則是因為同一個目錄的兩台 server 共用 zul／zkmax 的 jar，為 8086 建置曾經弄壞正在跑的 8085；各 worktree 有自己的建置輸出，就不會互踩。**同一個 worktree 絕不開第二台，也不碰另一條線的 port。**

## 二、分線

| 線 | 批次 | issue | 預計動到的檔案（開工前由該線 Planner 核對後填入第五節） |
|---|---|---|---|
| **A** | 7 | #29 selectbox、#3 bandbox | `zul/.../inp/css/` 的 selectbox、bandbox |
| **A** | 8 | #48 #49 menubar、#51 navbar | menubar 在 `zul/.../menu/css/menu.css`，navbar 在 `zkcml/zkmax/.../nav/css/nav.css` |
| **B** | 9 | #72 #73 #74 messagebox、#66 runtime-error、#71 loading、#1 errorbox | `zul/.../wgt/css/` 與 `zul/.../utl/css/` 附近 |
| **B** | 10 | #4 button、#6 calendar、#40 label、#47 fisheyebar、#61 portallayout | 各自的元件 CSS；#47、#61 在 `zkcml` |
| 之後 | 11+ | C 類容器（#53 #54 #55 #57）、F 類 DECIDE（#30 #10 #68 #11） | 兩條線有空檔再分；F 類每個都要使用者裁示 |

批次編號預先分配（A：7、8；B：9、10），證據目錄、截圖資料夾、決策編號都用這個區分，避免撞名：

| 項目 | A 線 | B 線 |
|---|---|---|
| 證據目錄 | `gates/batch7-*`、`gates/batch8-*` | `gates/batch9-*`、`gates/batch10-*` |
| 追蹤 repo 截圖 | `screenshots/batch7/`、`batch8/` | `screenshots/batch9/`、`batch10/` |
| 決策編號 D | D51–D79 | D80–D109（決策編號每份文件各自重新編號的慣例照舊，這裡只是為了兩線寫進同一份原則文件時不撞號） |

## 三、環境：每條線自己的目錄與預覽站

| | A 線 | B 線 |
|---|---|---|
| 目錄 | 現有主要工作目錄 `ZK10/zk`、`ZK10/zkcml`（分支 `marble`） | 新的 worktree：`ZK10/jess-b/zk`、`ZK10/jess-b/zkcml` |
| 分支 | `marble`（直接提交，與目前做法相同） | `jess/line-b`（從 `marble` 分出） |
| 預覽站 port | 8085（維持現狀） | 8105 |

- `zkpreview/settings.gradle` 以 `../../zk`、`../../zkcml` 找原始碼，所以 worktree 必須是 `ZK10/jess-b/zk` 加 `ZK10/jess-b/zkcml` 的並排結構（與 `ZK10/d5base`、`ZK10/dsp` 相同）。
- 建立（B 線 session 開工前一次性）：
  ```bash
  git -C /Users/hawk/Documents/workspace/ZK10/zk    worktree add -b jess/line-b /Users/hawk/Documents/workspace/ZK10/jess-b/zk marble
  git -C /Users/hawk/Documents/workspace/ZK10/zkcml worktree add -b jess/line-b /Users/hawk/Documents/workspace/ZK10/jess-b/zkcml marble
  ```
  然後在 `jess-b/zk` 與 `jess-b/zk/zkpreview`（以及 `jess-b/zkcml` 若有 package.json）執行 `npm ci`。**這一步尚未實際跑過，第一次建立時要確認 CSS build 與 8105 預覽站都能起來，把結果記在本文件第八節。**
- 啟動 B 線預覽站：`cd ZK10/jess-b/zk/zkpreview && tail -f /dev/null | withjdk.sh 17 ./gradlew appRun -PhttpPort=8105 --console=plain`（stdin 要保持開著）。每次 CSS build 後都要重啟，並用 `zk.wcs` 內容比對確認伺服的是新 build（Verifier 的前置檢查）。
- Verifier 的 `PREVIEW_URL` 由各線 Planner 在派工指令中寫明自己的 port。**絕不量到另一條線的 port。**
- 預覽站的 gradle build 目錄各自獨立，不會互相覆蓋。

## 四、角色與 session

- 每條線一個獨立的 Claude Code session，各自擔任該線的 Planner；Generator（Sonnet）與 Verifier（Fable）仍是該 Planner 派的子 agent。
- 實作者與量測者必須是不同的 agent（原則不變）。**一條線的 Verifier 不讀另一條線的 diff 或工作目錄。**
- 不從 `git status` 推論檔案歸屬（既有規則）。B 線在自己的 worktree，A 線的未提交修改看不到；A 線工作樹上若出現不屬於自己批次的修改，先停下問使用者。

## 五、檔案所有權

1. 開工前，各線 Planner 把該批要動的檔案清單寫進自己的驗證計畫小節，並在本節加一列（誰、哪個批次、哪些檔）。
2. **同一個檔案同一時間只屬於一條線。** 另一條線需要時，停下問使用者（原則第五節第 11 項）。
3. **共用檔案一律不動，除非先停下來問：** 任何 `tokens/` 下的檔案（新增、改名、刪除 `--zk-` token 屬於例外第 5 項）、`_forced-colors.css`、`lang.xml`／`lang-addon.xml`、`zkpreview/doc/font-size-baseline.json`、`playwright.config.ts`、各個 `*.spec.ts`。
4. 預覽頁（`zkpreview/src/main/webapp/web/*.zul`）按元件各屬於其批次，與 CSS 同一條線。

| 線 | 批次 | 檔案（開工時填） |
|---|---|---|
| A | 7 | `zul/.../wgt/css/selectbox.css`、`zul/.../sel/css/listbox.css`（D53-A）、`zkpreview/doc/screenshots/selectbox-{gallery,hover,focus}.png`（已完成並提交） |
| A | 8 | `zul/.../menu/css/menu.css`（menubar 在 zul，不在 zkcml）、`zkcml/zkmax/.../nav/css/nav.css`（已完成並提交） |
| A | 11 | `zul/.../tab/css/tabbox.css`（accordion 區段）、`zul/.../wnd/css/panel.css`、`zul/.../wnd/css/window.css`、預覽頁 `zkpreview/.../web/borderlayout.zul`、`zkpreview/doc/screenshots/{tabbox,tabbox-misc,panel,borderlayout}-gallery.png`（已完成並提交；本批無 zkcml 檔案） |
| B | 9 | （待填） |
| B | 10 | （待填） |

## 六、文件與決策編號

- **共用文件只在合併時更新**，各線平時不改：`jess-review-triage.md`（看板）、`jess-review-verification-plan.md`、`jess-review-decision-principles.md`。
- 各線把自己的內容寫在專屬文件：
  - A：`doc/jess-review/lines/line-a-plan.md`（方法、RED 摘要、裁示、看板列草稿）
  - B：`doc/jess-review/lines/line-b-plan.md`（同上）
  - 證據與報告仍放 `gates/batchN-*`（編號已分開，不會撞）。
- 合併時，合併負責人把兩份 line 文件的內容併入看板與驗證計畫（逐節搬入，不改寫內容），計數與狀態列以追蹤 repo 為準重算。
- 這個結構與第 1–6 批不同：之前方法直接追加到 `jess-review-verification-plan.md`。從第 7 批起改放 `lines/`，合併時再併入。

## 七、提交與合併

**提交（每條線自己）：** 規則不變——逐路徑暫存、暫存前後各查一次 `git diff --cached --name-only`、zkcml 先於 zk、訊息 `ZK-6112: …` 英文。baseline 只用 `--update-snapshots=changed`（或在 gallery 通過但像素有變時，只針對該元件的 gallery 用 `=all`，如第 6 批），只重生自己元件的檔案。

**合併（B 線 → `marble`，由 A 線的 session 或使用者執行）：**
1. B 線完成一批後，在 `jess/line-b` 上 `git rebase marble`（zk 與 zkcml 兩個 repo 各一次），先解衝突再繼續。
2. 衝突處理：
   - 程式碼檔案：理論上不衝突（檔案所有權）。發生了就代表所有權規則被破壞，停下回報。
   - 元件 baseline PNG：不手動合併；衝突時以該線自己的元件重生。
   - `zkpreview/doc/font-size-baseline.json`：不手動合併；合併後在 `marble` 上由持有者重生並在提交訊息說明。
   - 看板與驗證計畫：把 line 文件併入，見第六節。
3. `git merge --ff-only jess/line-b` 到 `marble`（zkcml 先，zk 後）。不 force push、不改寫已共用的歷史。
4. 合併後在 `marble` 上，A 線的預覽站（8085）重建重啟，跑一次**完整回歸**（chromium、gallery、component-theming、forced-colors、tablet、hit-target、focus-scan），回歸結果存 `gates/merge-N.md`。已知失敗（`calendar-tablet`、`slider-tablet`、`grid-header-gallery`）不計，其餘失敗要歸因到哪條線。
5. 合併完才對 B 線的 issue 貼 Jess 留言（留言宣稱「已修正」，必須是 `marble` 上已有的狀態）；A 線照舊在提交後貼。
6. 推送與關閉 issue 仍由使用者決定。

**合併節奏：** B 線每完成一批就合併一次，不累積多批。這樣單次衝突量小，也讓 A 線盡早看到 B 線的結果。

## 八、回歸測試的分工

- 各線在自己的 port 上，每批跑：該批元件的 gallery 與互動腳本、`component-theming`、`hit-target`、`focus-scan`；`forced-colors` 在批次動到顏色或邊框時跑。
- **完整回歸**（含 tablet、chromium 全項）只在合併後於 `marble` 跑一次，不在兩線同時跑，避免互相拖慢與誤判。
- Verifier 用 Playwright 時 `--output` 指向 scratchpad 或各線自己的 gates 目錄，不寫進共用的 `test-results`。

## 九、例外與裁示

- 原則第五節全部適用。**議題頁標題前面加線別**（例如 `[A] D52 …`），使用者一眼知道是哪條線。
- 兩條線的議題同時出現時，各線自己等待，不替另一條線決定。
- 新增的例外（第五節之外）：
  1. 需要動第五節第 3 點列出的共用檔案。
  2. 發現另一條線的檔案有問題或兩條線的修法互相影響。
  3. rebase 或合併出現程式碼衝突。
  4. 回歸出現無法歸因到某一條線的失敗。

## 十、尚未驗證的事

- ~~worktree 結構下的 `npm ci`、CSS build（`node scripts/build-css.js`）與 `zkpreview` composite build 能否一次通過。~~ **B 線實測（2026-10-08）：能起來，但不是一次通過，要多兩步，已排除：**
  - `npm ci`：`jess-b/zk`（8 秒）、`jess-b/zk/zkpreview`（1 秒）、`jess-b/zkcml`（5 秒）都通過。
  - CSS build：`node scripts/build-css.js --module zul` 通過（0.9 秒）；zkmax、zkex 在 `jess-b/zkcml` 目錄下以 `node ../zk/scripts/build-css.js --module <m>` 通過。
  - **坑 1：`zkpreview/gradlew` 在 git 裡是 `100644`，worktree 檢出後不可執行**（主目錄是手動 chmod 過的）。啟動指令改用 `bash ./gradlew`，不要 chmod（會讓 git 狀態變髒）。
  - **坑 2：只編譯、沒打包 jar，`appRun` 會失敗。** 首次啟動 4 分 16 秒後，Jetty 起來了但 webapp 找不到 `jess-b/zk/zkplus/build/libs/zkplus-11.0.0-SNAPSHOT.jar`，所有頁面 404，gradle 回報 `appRun FAILED`。主目錄有這些 jar 是因為以前跑過完整 build。**第一次建立 worktree 後必須先打包：**
    ```bash
    cd ZK10/jess-b/zk    && withjdk.sh 17 bash ./gradlew jar -x test --console=plain   # 3 分 32 秒
    cd ZK10/jess-b/zkcml && withjdk.sh 17 bash ./gradlew :zkex:jar :zkmax:jar :zuti:jar :za11y:jar -x test --console=plain   # 39 秒
    ```
  - 打包後啟動：`cd ZK10/jess-b/zk/zkpreview && tail -f /dev/null | withjdk.sh 17 bash ./gradlew appRun -PhttpPort=8105 --console=plain`，**31 秒**後 `/web/button.zul` 回 200。以 `lsof` 確認該 java 行程載入的是 `jess-b/zk/zul/build/libs/zul-…jar`（不是主目錄）。
  - **每次改 CSS 的重建流程（B 線第 9 批實測）：** 在 `jess-b/zk` 跑 `node scripts/build-css.js --module zul`，再 `withjdk.sh 17 bash ./gradlew :zul:jar -x test --console=plain`（43 秒），然後重啟 8105（約 30 秒）。重啟後取 `zk.wcs` 內容確認含新規則（例：新增的 `order:1`）。zkcml 的 CSS 同理，改用 `:zkmax:jar`／`:zkex:jar`。**只重啟 8105，8085 不受影響**（重啟時兩台都仍回 200）。
- 8105 與 8085 同時跑：兩台同時回 200（`messagebox.zul`、`fisheyebar.zul`）。當時機器 load average 約 100（許多 gradle／node 行程在跑），首次編譯因此較慢；穩態的記憶體與兩個 Verifier 同時量測的競爭**仍未驗證**。
- `lines/` 結構合併時的人工作業量是否合理，若太高改回「兩線輪流追加、合併時解衝突」。

## 十一、開工用的起始指令（貼給各線 session）

**A 線 session：**
> 繼續 Jess review，你是 A 線（批次 7、8）。先讀 doc/jess-review/jess-review-parallel-lines.md、decision-principles、triage 看板。工作目錄是主要的 ZK10/zk、ZK10/zkcml，預覽站 8085，分支 marble。批次 7：#29 selectbox、#3 bandbox；批次 8：#48 #49 menubar、#51 navbar。依平行線文件第六節把內容寫進 doc/jess-review/lines/line-a-plan.md，不改共用文件。只在原則第五節與本文件第九節的例外才停下來問。

**B 線 session：**
> 繼續 Jess review，你是 B 線（批次 9、10）。先讀 doc/jess-review/jess-review-parallel-lines.md、decision-principles、triage 看板。先依平行線文件第三節建立 worktree（ZK10/jess-b/zk、ZK10/jess-b/zkcml，分支 jess/line-b），預覽站用 8105，並把建置結果記回該文件第十節。批次 9：#72 #73 #74 messagebox、#66 runtime-error、#71 loading、#1 errorbox；批次 10：#4 button、#6 calendar、#40 label、#47 fisheyebar、#61 portallayout。內容寫進 doc/jess-review/lines/line-b-plan.md，不改共用文件。只在原則第五節與本文件第九節的例外才停下來問；#72 先確認 ZK 有沒有輸出每個按鈕的 class，沒有就歸 DEMO。
