# Batch 3 screenshot baseline regeneration 報告

## 執行前
`git status --short zkpreview/doc/screenshots doc/screenshots` 為空。Preview app 於 http://127.0.0.1:8085 回應 200（未另起 server）。

## 指令（cwd = zkpreview，PREVIEW_URL=http://127.0.0.1:8085）
1. `npx playwright test --config src/test/playwright/playwright.config.ts --project=chromium --update-snapshots=changed -g "(^| )(grid|listbox|tree) gallery$"` -> 3 passed（listbox、grid、tree gallery 皆 re-generated）
2. `npx playwright test --config src/test/playwright/playwright.config.ts --project=tablet --update-snapshots=changed -g "tablet-(grid|paging) gallery$"` -> 2 passed（grid-tablet、paging-tablet re-generated）

## 執行後 git status（regen 後與 full run 後相同）
```
 M zkpreview/doc/screenshots/grid-gallery.png
 M zkpreview/doc/screenshots/grid-tablet.png
 M zkpreview/doc/screenshots/listbox-gallery.png
 M zkpreview/doc/screenshots/paging-tablet.png
 M zkpreview/doc/screenshots/tree-gallery.png
```
恰為核准的 5 張；無 untracked PNG、無 *-forced-colors.png、無需 checkout 還原。

## Full project（無 update flag，各跑一次）
- chromium: 130 passed, 0 failed
- tablet: 55 passed, 0 failed

未 commit、未 stage。
