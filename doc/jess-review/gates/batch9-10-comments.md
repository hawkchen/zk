# Batches 9 and 10 (line B) — issue comments (POSTED 2026-10-09 with after-fix screenshots under `screenshots/batch9/` and `screenshots/batch10/` in the tracker repo)

Posted after the merge into `marble` ([gates/merge-1.md](merge-1.md)). Screenshots were taken on the merged `marble` build (8085). #73, #74 and #1 were commented earlier with their ZK Jira links (ZK-6187, ZK-6188) and are not repeated here.

| Issue | Comment |
|---|---|
| #66 | https://github.com/hawkchen/marble-issue/issues/66 |
| #71 | https://github.com/hawkchen/marble-issue/issues/71 |
| #72 | https://github.com/hawkchen/marble-issue/issues/72 |
| #4 | https://github.com/hawkchen/marble-issue/issues/4 |
| #6 | https://github.com/hawkchen/marble-issue/issues/6 |
| #40 | https://github.com/hawkchen/marble-issue/issues/40 |
| #47 | https://github.com/hawkchen/marble-issue/issues/47 |
| #61 | https://github.com/hawkchen/marble-issue/issues/61 |

## #66

# Root cause

The header of the runtime error panel is a flex row laid out in DOM order: error count, close button, refresh button. So the refresh button sat in the far corner and the close button in the middle.

# Solution

The close button is now ordered last, so it sits in the far right corner and the refresh button is to its left. Only the visual order changed: the DOM and the keyboard Tab order (close first, then refresh) are the same as before.

# Result

![runtime error after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch9/66-after.png?raw=true)

Measured on the running preview: the distance from the close button to the right edge of the header content was 44px and is now 0px (same with one error and with two errors).

## #71

# Root cause

The content of the loading box (spinner and text) is an `inline-flex` box inside a block box. An inline-level box sits on a text line, and the line's descender space added 5px below it: 16px above the content, 21px below.

# Solution

The content is now a block-level flex box, so there is no extra line. Top and bottom spacing are both 16px, left and right 24px, for the full-page loading box and for the component-level "Processing..." box.

# Result

![loading after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch9/71-after.png?raw=true)

The box is 5px shorter than before (57px to 52px). ZK centres it on its own, and the centre of the box on the screen is unchanged.

## #72

# Root cause

The hover colour of the window close button was the error container for every window, including the messagebox. That is how the Window component styled it, not something specific to the messagebox.

# Solution

The close button hover is now the same neutral hover as the other window icon buttons (maximize, minimize), for all windows, so the messagebox and a normal window stay consistent. The theme variable `--zk-window-close-hover-bg` stays as the override; only its default changed, to the neutral hover colour.

# Result

![close button hover after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch9/72-close-hover.png?raw=true)

Measured on the messagebox, an embedded window and an overlapped window: the close hover background equals the hover of the other icon buttons (ΔE 0) and is no longer red (ΔE 23 away from the old colour). Setting `--zk-window-close-hover-bg` to another colour still takes effect.
Note: a custom theme that relied on the old error default will now see the neutral colour unless it sets the variable.

## #4

# Root cause

The coloured text buttons (secondary, success, warning, error, info) did not reset the base button elevation the way the primary text button does, so they showed the resting shadow.

# Solution

The elevation is reset for all coloured text buttons. A fix for the same shadow had already landed on the main branch (`1c739948643`, it also resets the coloured outlined buttons); I verified the result on that code and dropped my duplicate change.

# Result

![text buttons after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch10/4-text-buttons.png?raw=true)

Measured for all five coloured text buttons at rest, hover and pressed: no shadow, and the pixels around each button match the page background (ΔE 0). With keyboard focus there is no shadow either, only the focus outline.

## #6

# Root cause

It is not intentional. Weekend day cells set their text colour with a more specific selector than the disabled style, so disabled Saturdays and Sundays kept the normal dark text colour while disabled weekdays were grey.

# Solution

The disabled style now wins over the weekend colour. All disabled days use the same grey with the strike-through. Enabled weekend days, the selected day and days from the neighbouring month are unchanged.

# Result

![disabled days after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch10/6-disabled-days.png?raw=true)

The calendar with `constraint="no past"`, in the current month: the past days 1 to 8 are all the same grey, including Saturday 3 and Sunday 4. Measured: the disabled weekdays and weekends differed by ΔE 40 before and by 0 now.

## #40

# Root cause

There was no reason for the difference. The radio label used the "label large" type size (14px), while the checkbox, the label and the inputs use "body medium" (13px). The radio was the outlier.

# Solution

The radio label now uses the same size, weight and line height as the checkbox label.

# Result

![radio and checkbox after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch10/40-radio-checkbox.png?raw=true)

Measured: both labels are 13px, weight 400, line height 20px. The radio circle size and the vertical alignment are unchanged (text and circle centres within 0.5px). The radios on other pages, for example the paging controls of the tree and the grid, use 13px now too.

## #47

# Root cause

ZK positions each fisheye item with inline `left`, `top`, `width` and `height`. The theme made the items static flex items, so those values were ignored and the width was squeezed: 1.33px wide in the vertical orientation. The horizontal orientation was off too (items 68px wide instead of 80px, and 8px too high).

# Solution

The bar is now a positioning context and the items are absolutely positioned, so they follow ZK's layout in both orientations. This also changes the horizontal bar: its items are now the configured 80px wide.

# Result

Vertical:

![vertical fisheyebar after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch10/47-vertical.png?raw=true)

Horizontal:

![horizontal fisheyebar after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch10/47-horizontal.png?raw=true)

Measured: in the vertical orientation the six items are 80x80 and stacked inside the 80x480 bar; in the horizontal orientation they are 80x80 in a row. While the pointer magnifies an item the sizes follow ZK's values once the transition ends.

## #61

# Root cause

The toolbar icons are `svg` elements with no size, so each one stretched to the button width with the default 150px height (35x150) and its strokes were scaled up to 3 to 4.5px. Two of them (View HTML and Fullscreen) were also drawn in plain black while the rest were grey.

# Solution

The icons are 14x14, the same size as the toolbar button icons elsewhere, and all use the same single tone.

# Result

![toolbar after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch10/61-toolbar.png?raw=true)

Measured: strokes are about 1.5 to 2px, and the darkest pixels of any two of the 20 icons differ by ΔE 0.4 at most (Fullscreen was ΔE 26 darker before).
Not changed: on hover, View HTML and Fullscreen still do not turn blue like the other icons. Tell me if you want that aligned too.

