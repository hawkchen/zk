# Batch 7 — issue comments (POSTED 2026-10-08, screenshots under `screenshots/batch7/` in the tracker repo)

## #29

# Root cause

The selectbox arrow was the browser's built-in ▼ glyph at 16px, about 11×9px of ink. The other dropdown arrows in the theme (combobox, bandbox) use a small chevron of 8×5px, so the selectbox arrow looked oversized next to them.

# Solution

The selectbox now draws the same chevron as the combobox, 8×5px (measured 7.5×5), in the same colour and at the same distance from the right edge. It still rotates when the list is open. The control size, text position and the hover, focus and disabled looks are unchanged. In high-contrast mode the arrow stays visible.

I kept the chevron rather than the solid triangle in your reference so the three dropdown controls stay consistent; if you would rather have the solid triangle everywhere, that is a separate change for all three.

# Result

![selectbox](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch7/29-selectbox.png?raw=true)

Open state:

![selectbox open](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch7/29-selectbox-open.png?raw=true)

## #3

# Root cause

The listbox header has one extra cell above the vertical scrollbar. It was painted in a light blue (rgb 240, 244, 250) while the rest of the header is white, so it read as a stray blue bar. It appears in every listbox that scrolls, not only inside a bandbox.

# Solution

That cell now has the same fill as the rest of the header (colour difference 0, before 5.2). The scrollbar, column widths and borders are unchanged. The fix is in the listbox styles, so plain listboxes with a scrollbar are fixed too.

# Result

![bandbox popup](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch7/3-bandbox-popup.png?raw=true)
