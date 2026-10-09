#!/bin/bash
SP=/private/tmp/claude-501/-Users-hawk-Documents-workspace-ZK10-zk/414792ca-78fd-4570-999b-214d5ada1e79/scratchpad/batch14-final/pw
cd /Users/hawk/Documents/workspace/ZK10/zk/zkpreview || exit 1
export PREVIEW_URL=http://localhost:8085
for p in component-theming hit-target focus-scan forced-colors chromium gallery tablet; do
  echo "=== $p start $(date)" >> $SP/summary.log
  npx playwright test --config src/test/playwright/playwright.config.ts --project=$p --output=$SP/out-$p --reporter=list > $SP/$p.log 2>&1
  echo "=== $p exit=$? end $(date)" >> $SP/summary.log
  /usr/bin/grep -E "^\s+[0-9]+ (passed|failed|flaky|skipped|did not run)" $SP/$p.log >> $SP/summary.log
done
echo "=== ALL DONE $(date)" >> $SP/summary.log
