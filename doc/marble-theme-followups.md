# Marble Theme Follow-ups

Deferred work on the Marble theme and the harness that verifies it. Items 1–5 are
concrete work steps converted from the 2026-07-22 process audit
(`doc/orchestrator-playbook-review.md`, since deleted); later items are added as they are
deferred, and name where the decision was taken. Each item is independent —
pick any up in a fresh session. When an item ships, delete its section here and
update the cross-references it names.

## 1. Brand-flip regression project

Goal: prove the theme recolors end-to-end when a customer overrides the seed token.
The per-component `x-brand-decl` check guards declarations only; nothing tests the
cascade (`doc/spec/brand-override.md`) across real pages.

- [ ] Add a `brand-flip` project to `src/test/playwright/playwright.config.ts`.
- [ ] New spec `brand-flip.spec.ts`: load representative pages (e.g. `button.zul`,
      `checkbox.zul`, `tabbox.zul`), inject
      `:root { --zk-color-primary: <distinct seed hue> }` via `addStyleTag` before
      measuring, `await document.fonts.ready`.
- [ ] Assert via computed styles, not screenshots: primary button background, checked
      checkbox/radio fill, tab indicator, and focus-ring color all shift hue with the
      injected seed (containers/overlays derive via `oklch(from …)` — assert the hue
      moved, not exact channel values).
- [ ] Add npm script `test:brand-flip` mirroring `test:forced-colors`.
- [ ] Remove the matching bullet from `doc/spec/new-component-checklist.md` § Known limits.

## 2. Compact-preset regression project

Goal: prove controls actually shrink under density compact mode. The per-component
`x-density` probe shrinks seed tokens one at a time; nothing tests the whole preset.

- [ ] Add a `compact` project to `src/test/playwright/playwright.config.ts`.
- [ ] New spec: render pages twice — default vs `data-density="compact"` on the host
      (per `doc/spec/data-dense-mode.md`; alternatively load the `doc/marble-compact.css`
      tuning preset) — and assert rendered control heights (button, textbox, combobox,
      listbox row) drop by the ladder delta from `tokens/_sizing.css`.
- [ ] Remove the matching bullet from `doc/spec/new-component-checklist.md` § Known limits.

## 3. render-smoke auto-discovery

Goal: stop hand-maintaining the `PAGES` list — new preview pages should be
smoke-tested automatically, like `gallery-scan.spec.ts` already does.

- [ ] Convert `src/test/playwright/render-smoke.spec.ts` from the hardcoded `PAGES`
      array to auto-discovery of `src/test/resources/web/*.zul` (reuse/share the
      discovery + SKIP-set helper from `gallery-scan.spec.ts`).
- [ ] Keep an explicit SKIP set for pages that are not standalone.
- [ ] Then delete bookkeeping item 3 (render-smoke `PAGES`) from
      `doc/spec/new-component-checklist.md` § Orchestrator bookkeeping gate AND the
      matching item in `doc/orchestrator-playbook.md` Step 4c (renumber), plus the
      Known-limits bullet — the obligation becomes automatic.

## 4. Evaluator migration to Playwright (capture + measurement)

Goal: remove the Chrome-MCP single point of failure (a `gif_creator` tab-group desync
once stalled Gate 2), get deterministic waits, and lift the 4-parallel-evaluator
Chrome-tab cap.

- [ ] Map the evaluator's ready-state gate to Playwright waits
      (`domcontentloaded` + per-page marker + `document.fonts.ready` — same recipe as
      the usecase screenshot specs; never `networkidle`, ZK AU keeps the connection busy).
- [ ] Replace `javascript_tool` computed-style measurement with `page.evaluate` in a
      parametrized helper under `src/test/playwright/` (disable CSS transitions before
      measuring border-color/box-shadow).
- [ ] Capture per-matrix artefacts via Playwright screenshots into `doc/screenshots/<comp>/`.
- [ ] Rewrite `.claude/agents/zk-theme-evaluator.md` §3/§3a/§3b + Tools lists: drop
      Chrome-MCP, allow Playwright runs. The existing §3a Playwright screenshot
      fallback is the seed of this migration.
- [ ] Raise the parallel-evaluator cap in `doc/orchestrator-playbook.md` Step 2 /
      Parallel execution rules accordingly.

## 5. Generator batch-build parallelism (conditional — do NOT do preemptively)

Trigger: only if Generator strict serialization becomes the throughput bottleneck
(it is not today — most rows are VERIFIED and Generator dispatches are rare).

- [ ] Generators become edit-only: skip `npm run build:css` in the Generator.
- [ ] The orchestrator runs ONE build per batch after all Generators of the batch return.
- [ ] On build failure, attribute by bisect (rebuild with half the diffs applied).
- [ ] Update `.claude/agents/zk-theme-generator.md` (build step + Tools) and
      `doc/orchestrator-playbook.md` Step 5/6 (serial-dispatch rule).

## 6. `.z-label` re-declares what it already inherits (deferred to P4)

Deferred to P4 by the user on 2026-09-11 (chat decision D6). This is shipped theme CSS
touching every Label in every ZK app, so it does not belong in a preview-only change.

Goal: delete the redundant declarations on `.z-label` so typography and colour set on a
container reach the text, instead of adding paired utility classes to work around it.

### The finding

`.z-label` (`zul/src/main/resources/web/js/zul/wgt/css/label.css`, the rule at the top of
the `zk-components` layer) declares five properties. All five reproduce what the Label
would otherwise inherit from `body` (`zul/src/main/resources/web/zul/css/base/_reset.css`):

| Property | `body` sets | `.z-label` sets | |
|---|---|---|---|
| `font-family` | `var(--zk-typescale-font-family)` | `var(--zk-typescale-font-family)` | token-identical |
| `font-size` | `var(--zk-typescale-body-medium-size)` | `var(--zk-typescale-body-medium-size)` | token-identical |
| `font-weight` | `var(--zk-typescale-body-medium-weight)` | `var(--zk-typescale-body-medium-weight)` | token-identical |
| `line-height` | `var(--zk-typescale-body-medium-line-height)` | `var(--zk-typescale-body-medium-line-height)` | token-identical |
| `color` | `var(--zk-color-on-background)` | `var(--zk-color-on-surface)` | different token, **same value** `rgba(0, 0, 0, 0.87)` |

So in the default case the rule changes nothing. Its only effect is to block every
contextual override: an element's own declaration beats an inherited value, and
inheritance is not a cascade competitor, so `@layer` order and specificity are irrelevant.
ZK wraps raw text in a `zul.wgt.Label`, so this hits any text inside a styled container.

Both `git log` and the file itself carry no rationale — the rule arrived wholesale with
`2100200284` ("replace the LESS theme pipeline with the Marble CSS sources"), so treat it
as migration residue, not a considered decision, until evidence says otherwise.

### Why it is worth doing

- It is the root cause of the 52 remaining dead text colours (chat D6): a `z-bg-*` class
  sets `background-color` **and** `color` in one rule; the background belongs on the
  wrapper and the colour on the label, so the class cannot move. Deleting `.z-label`'s
  `color` fixes all 52 with **no new classes and no paired-class API**.
- The alternative considered and rejected was adding five utilities —
  `.z-text-on-primary-container`, `.z-text-on-secondary-container`,
  `.z-text-on-surface-variant`, `.z-text-on-success-container`,
  `.z-text-on-error-container` (none exist today; only `.z-text-on-primary` and
  `.z-text-on-surface` do). Rejected because it forces authors to remember that
  `z-bg-X` and `z-text-on-X` are a pair, which is the thing MD3's container/on-container
  pairing exists to avoid.
- The same logic covers the four font properties. Had `.z-label` not declared them,
  commit `47d26068ed` (1223 typography rewrites across 142 preview pages) would not have
  been necessary — those wrappers would simply have worked. That commit is still correct
  authoring per `reference/zul-authoring.md` and should stay; it is just symptom-level.

### Scope of the 52 occurrences

Counted after `47d26068ed` in `zkpreview/src/main/webapp/web/**/*.zul`:

| Wrapper class | Count | Example page |
|---|---|---|
| `z-bg-primary-container` | 44 | `dnd.zul`, `utility/spacing.zul` |
| `z-bg-secondary-container` | 4 | `utility/responsive.zul` |
| `z-bg-surface-variant` | 2 | `dnd.zul` |
| `z-bg-success-container` | 1 | `utility/print.zul` |
| `z-bg-error-container` | 1 | `utility/zindex.zul` |

Severity is **fidelity, not accessibility**: those container backgrounds sit at lightness
0.87–0.92 and the wrongly-inherited `on-surface` is 87% black, so contrast passes. What is
lost is MD3's colour semantics — five semantic containers all render the same neutral grey
text instead of their paired hue.

`z-bg-*` has no consumer outside the preview pages: zero hits in `zul/`, `zkmax` and
`zkex` component CSS (`button.css` mentions `.z-bg-*` only in a comment) and zero in
`zktest`.

### Steps

- [ ] Stage 1 — delete only `color: var(--zk-color-on-surface);` from `.z-label`. This is
      the minimal change that closes D6. Verify before going further.
- [ ] Stage 2 — only if stage 1 is clean, evaluate deleting the four font properties too,
      which is what would make container typography work generally.
- [ ] Audit what currently relies on `.z-label` *resetting* an inherited colour — a Label
      inside any component that sets its own `color` will start following that colour.
      Grep component CSS for rules that set `color` on a container whose content is a
      Label (chips, badges, coloured panel captions, selected rows, filled buttons).
- [ ] If a component genuinely needs its Labels pinned, fix it at that component's own
      selector, not by restoring the theme-global declaration.

### Verification bar

Run against a preview app on a free port (`cd zkpreview && ./start.sh <port>`; never
assume 8085 is free — other sessions use it, and zkpreview serves the live working tree):

- [ ] `probe.js` on a `z-bg-*` wrapper: the inner `.z-label` computes the container's
      paired `on-*` colour rather than `rgba(0, 0, 0, 0.87)`.
- [ ] Playwright, all projects that passed for `47d26068ed`: `smoke` (115), `framework`
      (7), `responsive` (4), `print` (2), `zindex` (2), and `gallery` (82).
- [ ] `gallery` will legitimately move on pages whose text colour changes — regenerate
      only those baselines, and use bare `--update-snapshots` (preset `changed` in
      @playwright/test 1.59.x), never `=all`, which rewrites all 82.
- [ ] `cd zktest && ./gradlew test` — this is shipped CSS, so the component suites matter
      here in a way they did not for a preview-only change.
- [ ] Check both themes and `forced-colors`; `_forced-colors.css` overrides colour
      independently and must still win.

### Cross-references

- Chat decision D6, 2026-09-11 — deferred to P4 rather than done inline.
- `47d26068ed` — the preview-side sweep; its commit message records the 41-vs-52 count
  correction and the `z-bg-*` carve-out.
- `.claude/skills/marble-theme/reference/zul-authoring.md` § "ZK wraps raw text in a Label"
  — states the authoring rule; update it if stage 2 lands, since the rule's premise
  changes.
- `.claude/skills/marble-theme/SKILL.md` rule 5: "When a theme-global invention collides
  with a ZK JS assumption, the first option to evaluate is *deleting the invention*." That
  is the principle this item applies.
