# Batch 6 — issue comments (POSTED 2026-10-08 with after-fix screenshots under `screenshots/batch6/` in the tracker repo)

## #18

# Root cause

The hover and pressed state layer was one overlay on the whole label element, and the arrow is a child of that element. The filled arrow has an opaque background that sits on top of the overlay, so hovering the arrow lit the label instead; in the toolbar mold the arrow is transparent, so one hover lit both halves.

# Solution

The label and the arrow now each have their own state layer. Hovering or pressing the arrow changes only the arrow; hovering or pressing the label changes only the label. The strength is the same as before. Keyboard focus and the open state still apply to the whole button.

# Result

Hover on the arrow (arrow lit, label untouched):

![hover arrow](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/18-hover-arrow.png?raw=true)

Hover on the label (label lit, arrow untouched):

![hover label](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/18-hover-label.png?raw=true)

Measured on the running preview: hovering the arrow changes the arrow by ΔE 6.5 and the label by 0 (before: arrow 0, label 6.9); the toolbar mold behaves the same (arrow 0 when the label is hovered, before 4.0).
Note: pressing the mouse also gives the button keyboard focus, and the focus layer still tints the whole label then. That is the existing focus style, which I left alone; tell me if you want it limited to keyboard focus.

## #19

# Root cause

The disabled container colour is semi-transparent (12% black). Both the label and the arrow (which sits on top of the label) painted it, so the arrow got the colour twice and came out darker (196 vs 224 in grey value).

# Solution

The disabled arrow no longer paints its own background and shows the label's. Both segments are now the same grey (ΔE 0); text and icon colours are unchanged. The disabled toolbar mold was already uniform.

# Result

![disabled combobutton](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/19-disabled.png?raw=true)

## #22

# Root cause

The suffix addon had no merged border, so the input's right border and the addon's left border drew a 2px seam next to the 1px outer border.

# Solution

Already fixed in 29b6d0629e (ZK-6112, merge a trailing addon with its input): the trailing rules now match the leading ones, and the number boxes share the textbox rules. I re-measured every inputgroup on the preview page (suffix, both sides, number boxes, textarea, vertical): every seam and outer border is exactly 1px, in the same colour.

# Result

![inputgroup seams](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/22-inputgroup.png?raw=true)

One thing I noticed but did not change: a disabled textbox uses a lighter border than its addon. It is not in your screenshot, so tell me if it should be part of this issue.

## #24

# Root cause

The pointer cursor was set on the whole multislider / rangeslider box, so it showed everywhere, including padding where a click does nothing. The hover ring was also scoped to the whole widget instead of the thumb, so hovering anywhere lit every thumb.

# Solution

The box now uses the default cursor; the pointer stays only on the parts that react to a click (the track and the filled area), and thumbs keep grab / grabbing. The hover ring is scoped to the single thumb under the pointer. Applies to both multislider and rangeslider. The focus ring is unchanged.

# Result

![hover one thumb](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/24-hover-one-thumb.png?raw=true)

Measured: of 3,476 points that do nothing when clicked, none still shows the pointer cursor (before, 73–99% of them did); every point that does react still shows it. With 6 thumbs, hovering one lights only that one (before: all six).
Note: a plain slider is not changed, because clicking anywhere on it moves the thumb, so the pointer cursor there is correct.

## #26

# Root cause

The knob's number input had a tinted background and a visible border, so it looked like a field of its own, unlike the other inputs.

# Solution

It now follows the inplace input style: no background and no border while idle, text style unchanged. When focused it gets the standard textbox focus ring (2px primary), replacing the browser's default outline, and the text does not move between the two states.

# Result

![knob inline input](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/26-knob.png?raw=true)

Measured: idle background and border are identical to the page background; focus ring colour matches the textbox ring (ΔE 0); box size and text position unchanged.

## #27

# Root cause

The readonly and disabled stars ignore the pointer, so the mouse actually lands on the rating's outer wrapper, which had the pointer cursor.

# Solution

A rating whose stars are readonly or disabled now uses the default cursor on its wrapper. Interactive ratings still show the pointer on the stars; hover scaling and click behaviour are unchanged.

# Result

The cursor does not show in a static screenshot, so the label below is the measured value over a star:

![readonly rating](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/27-readonly.png?raw=true)

Measured on the 4 readonly / disabled ratings (horizontal and vertical): star centres, gaps and wrapper all show the default cursor (before: pointer).


## #25

# Root cause

While dragging, ZK places the tooltip with its left edge (horizontal slider) or top edge (vertical slider) on the thumb's edge, not its centre. The offset depends on the tooltip's width (1.5px for one digit, 7.4px for three), and vertical sliders were off by 4px. The text inside the tooltip was already centred.

# Solution

The tooltip is now shifted by half of its own size, so its centre sits on the thumb's centre. The direction (horizontal or vertical) is taken from the slider that is being dragged, so both orientations and all molds (default, sphere, scale) are covered. Colours, font size and padding are unchanged.

# Result

Horizontal (tooltip centred above the thumb):

![horizontal](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/25-horizontal.png?raw=true)

Vertical (tooltip centred on the thumb, to its right):

![vertical](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch6/25-vertical.png?raw=true)

Measured on the running preview: centre offset 0.2px for tooltips "5", "6", "50" and "100" (before 1.5 to 7.4px) and 0px on vertical sliders (before 4px); the tooltip text stays centred in its box and never overlaps the thumb.
