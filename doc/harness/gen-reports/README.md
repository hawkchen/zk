# Generator reports

Per-component reports written by the `zk-theme-generator` subagent (one file per run, `<component>.md`), read by
`zk-theme-evaluator` and the orchestrator. This directory replaces the theme template's untracked `tasks/gen-reports/`;
the eval reports live beside it in `../eval-reports/`. Keep it tracked: an empty directory would not survive a clone.
