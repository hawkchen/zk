# Batch 5 — issue comments (POSTED 2026-10-07 with after-fix screenshots under `screenshots/batch5/` in the tracker repo; the posted text adds a "Result" image section)

Post with `GH_TOKEN=$(gh auth token --user hawkchen) gh issue comment --repo hawkchen/marble-issue <n> --body-file ...`. The designer closes the issues.

## #8 — cascader Options should fill the full dropdown width

# Root cause

Each column of the cascader popup was sized to its own content (160px), while the popup itself is at least as wide as the input. With a single column the item highlight stopped 38px short of the popup edge, and the empty strip on the right was dead space (clicking it did nothing).

# Solution

The popup now lays its columns out in a row and the last column takes the remaining width, so the hover highlight reaches the popup edge and the whole row is clickable. With several columns the popup was already exactly as wide as its columns, so nothing changes there.

Verified on the running preview app: highlight-to-edge gap 38px before, 0px after; clicking the former dead strip now expands the item.

## #12 — chosenbox Remove special style on chips

# Root cause

The chosenbox root is rendered as an `<i>` element, so the chips inherited the browser's italic. The chip text also used the label-large weight (500).

# Solution

The root resets `font-style` to normal and the chip text uses the body weight (400). Size (14px) and chip height (28px) are unchanged. Measured on rest, hover and focus states.

## #13 — chosenbox Adjust alignment and spacing for chip creation label

# Root cause

The widget writes an inline `display: block` on the create row, which overrides the stylesheet's flex layout, so the `gap` and `align-items` we declared never applied and the icon touched the text.

# Solution

The icon now carries its own right margin (8px) and is vertically centred against the text. Measured: icon-to-text gap 0px before, 8px after; vertical centres differ by 0.75px (1.25px before). The row is still fully clickable and its hover fill still reaches the popup edge.

## #16 — combobox Adjust description style

# Root cause

The description line (`.z-comboitem-inner`) had no rule of its own and inherited the label's colour and size, so both lines looked equal.

# Solution

The description uses `--zk-color-on-surface-variant` and `--zk-typescale-body-small-size` as suggested; the label is unchanged. Contrast stays above 4.5:1 in rest (5.74), hover (5.44) and selected (7.75) states, including on the selected row, where the description is mixed from the selected text colour.

## #17 — combobox Shall not select text of is read only

# Root cause

Choosing an item from a read-only combobox leaves its text selected, and the selection highlight made it look editable.

# Solution

The selection highlight of read-only comboboxes is now transparent, so no highlight appears after choosing an item, on triple-click or on select-all. Editable comboboxes keep their highlight.

Note: browsers ignore `user-select: none` on a read-only `<input>`, so the text can still be selected and copied; only the visible highlight is removed. If you want the text to be truly unselectable, that needs a change in the widget (JavaScript) rather than in the theme.
