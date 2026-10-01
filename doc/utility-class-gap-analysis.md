# Marble Utility Classes — Gap Analysis Against Bootstrap, Vaadin Lumo and Vuetify

Status: analysis, 2026-10-01. No code changed.
Related: [utility-class-naming-review.md](utility-class-naming-review.md), [utility-class-discovery.md](utility-class-discovery.md).

## 1. Summary

Marble ships ~380 utility classes in `zul/src/main/resources/web/zul/css/utility/`. Spacing,
display, basic flex/grid, overflow, position and the text basics are on par with the three
references. The gaps fall into three groups:

1. **Whole categories Marble lacks** that at least two references ship: opacity, pointer/selection
   interaction, visibility, vertical-align, z-index scale, object-fit, aspect ratio, text
   decoration, word-break / whitespace, transitions.
2. **Thin categories**: borders (no colour, width or style), flex (no `align-self`,
   `align-content`, `order`), sizing (no viewport or max units), position offsets (0 only),
   grid (no spans).
3. **Responsive variants**: Marble has breakpoint suffixes only for `display`. All three
   references also make flex, spacing, text-align and/or typography responsive.

A fourth, cheap group: **tokens Marble already defines but exposes no class for** — the 15 MD3
type roles, elevation 4–5, three surface-container steps, `on-*-container` text colours,
`outline`, and the mono font family.

## 2. Frameworks compared

| | Bootstrap 5.3 | Vaadin Lumo Utility Classes | Vuetify 3 |
|---|---|---|---|
| Kind | CSS framework | Java server-side UI framework (ZK's closest competitor) | Vue component framework, Material Design |
| Why chosen | User-specified; the vocabulary Marble already follows | Same audience as ZK: Java developers styling server-rendered components; exposed as `LumoUtility` Java constants | Same design language as Marble (Material), same token-driven model |
| Source checked | getbootstrap.com/docs/5.3/utilities | `LumoUtility.java` on `vaadin/flow-components` main | `packages/docs/src/pages/en/styles/*.md` on `vuetifyjs/vuetify` master |

Tailwind CSS is excluded by request. (Lumo's naming is Tailwind-derived, but its set is curated.)

## 3. Category matrix

✅ = has it ・ ◐ = partial ・ — = none. "Marble" column reflects the current `marble` branch.

| Category | Bootstrap | Lumo | Vuetify | Marble | Marble's gap |
|---|---|---|---|---|---|
| Margin / padding | ✅ 0–5, auto | ✅ xs–xl, auto, negative | ✅ 0–16, auto, negative `n1–n16` | ✅ 0–16, auto | No negative margins |
| Gap | ✅ + row/column | ✅ + row/column | ✅ `ga/gr/gc` | ✅ + x/y | — |
| Display | ✅ responsive + print | ✅ responsive | ✅ responsive + print | ✅ responsive + print + container query | `table*` values (low value) |
| Flex direction / wrap / grow / shrink | ✅ | ✅ | ✅ | ✅ | — |
| justify-content / align-items | ✅ | ✅ | ✅ | ✅ | — |
| **align-self** | ✅ | ✅ | ✅ | — | Missing |
| **align-content** | ✅ | ✅ | ✅ | — | Missing |
| **order** | ✅ 0–5, first, last | — | ✅ 0–12, first, last | — | Missing |
| Grid columns | (layout grid, not utility) | ✅ 1–12 | (layout grid) | ✅ 1–6, auto, auto-fill | — |
| **Grid col/row span, rows, flow** | — | ✅ | — | ◐ `z-grid-col-full` only | Spans and rows |
| Float, clearfix | ✅ | — | ✅ | ✅ | — |
| Overflow | ✅ | ✅ | ✅ | ✅ | — |
| Position | ✅ | ✅ | ✅ | ✅ | — |
| **Position offsets** | ✅ 0/50/100 + `translate-middle` | ✅ incl. negative | ◐ 0 | ◐ 0 | 50%/100%, centring helper |
| Width / height | ✅ 25–100, auto | ✅ xs–xl, full, auto | ✅ 0/25/33/50/66/75/100 | ✅ 25–100, auto | — |
| **Viewport & max/min sizing** | ✅ `vw/vh-100`, `min-vh-100`, `mw/mh-100` | ✅ `h-screen`, `max-w-screen-*`, min/max-h | ✅ `h-screen`, `fill-height` | ◐ `min-w/h-0` only | Viewport units, `max-w-100`, `max-h-100` |
| Border on/off per side | ✅ | ✅ | ✅ | ✅ | — |
| **Border colour** | ✅ | ✅ | ✅ | — | Missing (fixed to `outline-variant`) |
| **Border width / style** | ✅ width 1–5 | ✅ dashed, dotted | ✅ thin–xl, dashed, dotted, double | — | Missing |
| Radius | ✅ 0–5, circle, pill | ✅ none, s–l, full | ✅ 0–xl, pill, circle | ✅ none–xl, full | — |
| **Radius per side / corner** | ✅ top/end/bottom/start | — | ✅ t/e/b/s + corners | — | Missing |
| Shadow / elevation | ✅ none, sm, base, lg | ✅ none, xs–xl | ✅ 0–24 | ◐ 0–3 | Levels 4–5 (tokens exist) |
| Background colour | ✅ + `-subtle` | ✅ + 10/50 tints | ✅ every theme colour | ✅ MD3 roles | `surface-container-lowest/high/highest` (tokens exist) |
| Text colour | ✅ + `-emphasis`, `body-secondary` | ✅ header/body/secondary/tertiary | ✅ + high/medium emphasis | ✅ MD3 roles | `on-*-container`, `on-surface-variant` (tokens exist) |
| **Opacity** | ✅ 0/25/50/75/100 | — | ✅ 0–100 step 10 + MD3 state opacities | — | Missing |
| **Cursor** | — | — | ✅ 12 values | — | Missing |
| **Pointer events / user-select** | ✅ | — | ✅ pointer-events | — | Missing |
| **Visibility** | ✅ `visible` / `invisible` | — | — | — | Missing |
| **Vertical align** | ✅ 6 values | — | — | — | Missing |
| **Z-index scale** | ✅ n1, 0–3 | ✅ 0–50, auto | — | ◐ 5 semantic layers | Generic small scale |
| **Object fit / position** | ✅ | — | — | — | Missing |
| **Aspect ratio** | ✅ 1x1, 4x3, 16x9, 21x9 | ✅ square, video | — | — | Missing |
| Text align | ✅ responsive | ✅ | ✅ responsive, justify | ✅ start/center/end | `justify`, responsive |
| Text transform | ✅ | ✅ | ✅ | ✅ | — |
| **Text decoration** | ✅ underline, line-through, none | — | ✅ + overline | — | Missing |
| **Wrap / break / whitespace** | ✅ `text-wrap`, `text-nowrap`, `text-break` | ✅ `whitespace-*` (5) | ✅ `text-wrap`, `text-no-wrap`, `text-break` | ◐ `z-text-nowrap` | `wrap`, `break`, `pre-line`, `pre-wrap` |
| Truncate | ✅ | ✅ | ✅ | ✅ | — |
| Font size | ✅ fs-1–6 | ✅ 2xs–3xl, responsive | ✅ MD3 type roles, responsive | ✅ xs–8xl, h1–h7 | Responsive |
| **MD3 type roles** (display/headline/title/body/label) | — | — | ✅ 15 roles | — | Missing (tokens `--zk-typescale-*` exist) |
| Font weight / style / line height | ✅ | ✅ | ✅ | ✅ | — |
| **Monospace font** | ✅ `font-monospace` | — | ✅ | — | Missing (token exists) |
| **Transition** | — | ✅ 7 values | ◐ transition components, not classes | — | Missing |
| Backdrop blur | — | ✅ | — | — | Low priority |
| **Dividers** | ✅ `vr` | ✅ `divide-x/y` | — | — | Missing |
| Stack | ✅ hstack/vstack | — | — | ✅ + sizes | — |
| Screen-reader only | ✅ + `-focusable` | ✅ | ✅ + `-focusable` | ◐ no focusable variant | `visually-hidden-focusable` (skip links) |
| Focus ring | ✅ `focus-ring` | — | — | — | Missing (a comment in `tokens/_colors.css` refers to a `.z-focus-ring` that does not exist) |
| Stretched link, link colours | ✅ | — | — | — | Low priority for ZK |
| Icon size | — | ✅ s/m/l | — | — | Worth considering for `z-icon-*` |
| List style none, box sizing | — | ✅ | — | — | Low priority |
| Container query display | — | — | — | ✅ unique | — |
| Surface primitive (`z-paper`) | — | — | — | ✅ | — |

## 4. Missing categories, by priority

Priority = how many references ship it × how often ZK pages need it ÷ cost.

### P1 — small, self-contained, commonly needed

| # | Category | Proposed classes | Shipped by |
|---|---|---|---|
| 1 | Opacity | `z-opacity-0/25/50/75/100` | Bootstrap, Vuetify |
| 2 | Cursor | `z-cursor-pointer/default/move/grab/not-allowed/text/wait/help` | Vuetify |
| 3 | Pointer events, user-select | `z-pointer-none/auto`, `z-select-none/all/text/auto` (see D2) | Bootstrap, Vuetify |
| 4 | Visibility | `z-visible`, `z-invisible` | Bootstrap |
| 5 | align-self, align-content, order | `z-self-*`, `z-content-*`, `z-order-first/last/0–5` | all three |
| 6 | Text decoration | `z-underline`, `z-line-through`, `z-no-underline` | Bootstrap, Vuetify |
| 7 | Wrap / break / whitespace | `z-text-wrap`, `z-text-break`, `z-whitespace-pre-line/pre-wrap` | all three |
| 8 | Border colour & style | `z-border-primary/error/…`, `z-border-dashed/dotted`, `z-border-2` | all three |
| 9 | Sizing extras | `z-max-w-100`, `z-max-h-100`, `z-vh-100`, `z-min-vh-100`, `z-vw-100` | all three |
| 10 | Classes for existing tokens | MD3 type roles (`z-text-display-large` … `z-text-label-small`), `z-elevation-4/5`, `z-bg-surface-container-lowest/high/highest`, `z-text-on-*-container`, `z-font-mono`, `z-border-outline` | Vuetify (roles), all (elevation steps) |
| 11 | Focusable screen-reader text | `z-visually-hidden-focusable` | Bootstrap, Vuetify |

### P2 — useful, more design work

| # | Category | Notes |
|---|---|---|
| 12 | Responsive variants beyond display | Flex direction, justify/align, gap, spacing, text-align. Biggest functional gap and biggest size cost — see D1. |
| 13 | Z-index scale | A small generic scale (`z-z-0…3`) next to the semantic `z-index-*` layers; naming is awkward under the `z-` prefix. |
| 14 | Object fit / aspect ratio | `z-object-cover/contain`, `z-aspect-square/video/4x3` — for `<image>`, `<iframe>`, `<video>` |
| 15 | Position offsets and centring | `z-top-50`, `z-start-50`, `z-translate-middle` |
| 16 | Radius per side | `z-rounded-top/end/bottom/start` |
| 17 | Grid spans | `z-col-span-1…6`, `z-row-span-*` |
| 18 | Transition | `z-transition-none/colors/opacity/transform`, bound to `--zk-motion-*` |
| 19 | Vertical align | `z-align-middle/top/bottom/baseline` — note the naming review rejected `z-align-*` for flex; vertical-align would reclaim it with Bootstrap's meaning |

### P3 — low value for ZK, list for completeness

Negative margins, dividers (`divide-x/y`, `vr`), icon size, `list-none`, box-sizing, backdrop blur,
link-colour utilities, stretched link, `table*` display values, focus-ring utility.

## 5. Decisions required

### D1 — Should breakpoint variants extend beyond `display`?

- **Background:** Marble generates `-sm/-md/-lg/-xl` only for `display` (plus container-query
  display). All three references also make flex, spacing and text-align responsive.
- **Options:**
  - **A (recommended): flex direction, justify, align-items, gap and text-align only.** Covers the
    common "stack on mobile, row on desktop" case. Roughly +200 classes.
  - **B: also spacing.** Matches Bootstrap/Vuetify. Spacing × 4 breakpoints adds ~500 classes —
    more than Marble's whole current set.
  - **C: none.** Point users at container queries and `z-cq-*`. Zero cost, but a Bootstrap
    developer will look for `z-flex-md-row` and not find it.

### D2 — Naming for pointer-events — **IMPLEMENTED: Option A (recommended; awaiting confirmation)**

- **Background:** Bootstrap's `pe-none` means `pointer-events: none`, but Marble's `z-pe-*` is
  already padding-end (Bootstrap uses `pe-*` for both, distinguished only by value).
  `z-pe-none` next to `z-pe-4` would mean two unrelated properties.
- **Options:**
  - **A (recommended): `z-pointer-none` / `z-pointer-auto`.** Unambiguous; Tailwind-style
    (`pointer-events-none`) shortened.
  - **B: `z-pe-none`.** Bootstrap-identical, but repeats the ambiguity.

## 6. Implemented — P1, the Bootstrap / Lumo subset (2026-10-01)

Scope: the P1 items that Bootstrap or Lumo ships. Left out because only Vuetify has them: cursor
(#2) and the MD3 type-role classes (part of #10). D2 is implemented as Option A (`z-pointer-*`).

| Category | Classes | CSS | Preview page |
|---|---|---|---|
| Opacity | `z-opacity-0/25/50/75/100` | `utility/_interactions.css` (new) | `utility/opacity.zul` (new) |
| Visibility | `z-visible`, `z-invisible` | `_interactions.css` | `utility/visibility.zul` (new) |
| Pointer events, user-select | `z-pointer-none/auto`, `z-user-select-all/auto/none` | `_interactions.css` | `utility/interactions.zul` (new) |
| align-self, align-content, order | `z-self-auto/start/center/end/stretch/baseline`, `z-align-content-start/center/end/between/around/stretch`, `z-order-first/0–5/last` | `_layout.css` | `utility/layout.zul` |
| Sizing | `z-max-w-100`, `z-max-h-100`, `z-vw-100`, `z-vh-100`, `z-min-vw-100`, `z-min-vh-100` | `_layout.css` | `utility/layout.zul` |
| Screen reader | `z-visually-hidden-focusable` | `_layout.css` | `utility/layout.zul` |
| Text decoration, monospace | `z-text-decoration-underline/line-through/none`, `z-font-monospace` | `_typography.css` | `utility/typography.zul` |
| Wrap / break / whitespace | `z-text-wrap`, `z-text-break`, `z-whitespace-pre/pre-line/pre-wrap` | `_typography.css` | `utility/typography.zul` |
| Border colour, style, width | `z-border-outline/primary/secondary/success/warning/error/info`, `z-border-dashed/dotted`, `z-border-2` | `_borders.css` | `utility/borders.zul` |
| Colours for existing tokens | `z-bg-surface-container-lowest/high/highest`, `z-text-on-primary/secondary/error/success/warning-container` | `_colors.css` | `utility/colors.zul` |
| Elevation | `z-elevation-4/5` | `_elevation.css` | `utility/elevation.zul` |

### 6.1 Verification

Every class is applied with `sclass` to a real ZK widget (Button, Textbox, Label, A, Image,
Groupbox, Window, Vlayout, Checkbox) and checked by `zkpreview/src/test/playwright/utility-additions.spec.ts`
(project `utility-additions`, 17 tests). Each test checks the computed value and the effect the
class is meant to have: the click passes through, the row renders C B A, the skip link appears on
focus, one click selects the whole id, and so on.

- Proved the tests can fail: with every new rule removed from the served `zk.wcs`, all 17 fail.
  The first `z-user-select-auto` case still passed with the rules removed, so it was a no-op; it
  was moved from a Label (already `auto`) to a Button (`none` by default).
- Regression: `smoke`, `responsive`, `print` and `zindex` pass. `font-size` changed only on the 9
  pages edited here (8 utility pages + the SPA nav); its baseline was recaptured and re-run green.
  `focus-scan` fails 2 forced-colors cases (tree row, organigram node); they fail the same way with
  the new rules removed, so they are not caused by this change.
- No collision: no new class name is emitted by ZK's widget JS (CE, zkmax, zkex).

### 6.2 What ZK developers need to know

None of the classes failed on a ZK widget. These behaviours were measured, and each preview page
says so next to its example:

| Class | Behaviour on ZK widgets |
|---|---|
| `z-text-on-*-container` | Needed because a Label sets its own colour, so the text colour from `z-bg-*-container` never reaches a Label. |
| `z-border-error` on Textbox | Overrides the focus colour as well: on focus the border goes to 2px but stays red instead of turning primary. |
| `z-text-wrap` on Button | A Button is `white-space: nowrap` and clips overflowing text; the class makes it wrap. |
| `z-text-decoration-none` on A | A Marble link has no underline at rest, only on hover; the class removes the hover underline. |
| `z-user-select-auto` | Useful on a Button (`user-select: none` by default); no effect on a Label. |
| `z-pointer-none` | Blocks the mouse only; keyboard focus and Enter still reach the widget. Use `disabled` to block every input. |
| `z-order-*` | Changes the order you see, not the Tab order. |
| `z-invisible` | Not the same as ZK's `visible="false"`, which removes the widget (`display: none`). `z-invisible` keeps its space. |

## 7. Verification of this analysis

- Marble set: extracted from every selector in `zul/src/main/resources/web/zul/css/utility/*.css`
  on 2026-10-01; tokens from `zul/src/main/resources/web/zul/css/tokens/`.
- Lumo: class string constants in `LumoUtility.java` (vaadin/flow-components, main).
- Vuetify: class tables in `packages/docs/src/pages/en/styles/*.md` (vuetifyjs/vuetify, master).
- Bootstrap: 5.3 utilities and helpers documentation.
