# Batch 4 — drafted issue comments (NOT posted; Hawk reviews first)

Post with `GH_TOKEN=$(gh auth token --user hawkchen) gh issue comment --repo hawkchen/marble-issue <n> --body-file ...`. The designer closes the issues.

## #31 — biglistbox Scroll bar shall not overlap header

# Root cause

The custom scrollbar lane (`.z-biglistbox-wscroll-vertical` / `-horizontal`) is absolutely positioned over the whole widget (`top: 0; height: 100%`), and its track groove (`::before`) was always painted, whether or not that axis could scroll. So the groove ran through the sticky header, and a groove was drawn on an axis whose content already fit.

# Solution

The lane itself is now invisible (`visibility: hidden`, so it no longer paints or catches pointer events) and only the thumb is visible. The groove is removed. Nothing is drawn over the header, and an axis that fits shows no scrollbar at all. The thumb is still positioned by ZK's own scroll logic, so wheel, drag and the end stop behave as before.

Verified on the running preview app: no scrollbar pixels or hit targets inside the header band (before: groove ΔE 4.5 against the background, after: 0), including with `vflex="min"` and forced-colors; scrolling, dragging and clamping unchanged.

## #78 — biglistbox Scroll bar looks different

# Root cause

Biglistbox draws its own scrollbar with `zul.WScroll`, which Marble had styled as a dark thumb (38% on-surface) on an always-visible groove. The documented scrollbar's resting state is a single light pill with no groove.

# Solution

The thumb now uses `--zk-color-outline-variant`, 8px wide, fully rounded, flush with the edge, and the groove is gone — measured identical to the documented scrollbar's resting state (colour difference 0, same width and edge distance, both axes). The colour follows the token (a `--zk-color-outline-variant` override recolours it). On hover the thumb darkens to `--zk-color-outline` as a drag affordance, matching the native scrollbar. Arrow buttons stay hidden because WScroll sizes its thumb from them.

Known gap, tracked separately: under forced-colors the thumb (here and in the documented scrollbar) is painted with a background colour, which the browser overrides, so it is not visible there.
