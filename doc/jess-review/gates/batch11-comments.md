# Batch 11 — issue comments (POSTED 2026-10-09, screenshots under `screenshots/batch11/` in the tracker repo)

## #53

# Root cause

Two things made the accordion header look different from the other tabs. The header text used the body-large size (16px) while the horizontal and vertical tabs use label-large (14px). The expand arrow was a rotated square drawn with borders (11×7px), not the chevron used by the dropdown arrows elsewhere, and it sat about 2px off the vertical centre of the row.

# Solution

The header text now uses the same size as the other tabs (14px; weight and line height were already the same). The arrow is now the shared chevron, 8×5px with the same 12px inset from the right edge as the combobox, centred on the row in both the collapsed and expanded states (it flips 180° when expanded). It also stays visible in forced-colors mode. Row height, colours, hover and disabled states are unchanged.

# Result

Before:

![before](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/53-before.png?raw=true)

After (Tab1 expanded):

![after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/53-after.png?raw=true)

## #54

# Root cause

For `border="rounded"` ZK marks the panel as "no inner border", and the theme's rule for that class removed the whole outline (and shadow) — meant for `border="none"`. So rounded panels lost their frame, while the outline set on the panel was overridden.

# Solution

`border="rounded"` panels get their 1px outline back, in the same colour as `border="normal"`, with the rounded corners kept. `border="none"` is unchanged. I did not add the shadow or the line under the header: a rounded panel has neither today, and you did not mention them. A panel whose height comes from its content is now 2px taller (the two outline pixels), the same as a normal panel.

# Result

Before:

![before](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/54-before.png?raw=true)

After (rounded on the left, normal on the right):

![after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/54-after.png?raw=true)

## #55

# Root cause

While dragging, ZK shows a frame (the "ghost") with a copy of the title bar and hides the real window. The whole ghost was set to 50% opacity, so the copied title bar was washed out, and the ghost had no background, so the page behind showed straight through the body.

# Solution

The ghost is no longer faded and now has the surface colour as its background. The title text is as dark as in the idle window (colour difference 0, before about 47), the blue outline is at full strength, and nothing behind shows through. Size, position and where the window lands after the drop are unchanged. This changes how every window looks while being dragged.

If you wanted the ghost to show the real window content while dragging, tell me; that needs a change in ZK's script, not in the theme.

# Result

Before (frame from dragging a window):

![before](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/55-before.png?raw=true)

After (dragging the "Overlapped" window over the content):

![after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/55-after.png?raw=true)

## #57

# Root cause

This is in the preview page, not in the theme. The page wraps the West, East and Center content in a div with 16px padding, and North and South have bare text. A borderlayout region has no padding of its own, on purpose: a toolbar or menubar placed in North or South should sit flush against the edge.

# Solution

I changed the preview page: North and South content now has the same 16px wrapper, so all five regions line up (text starts 16–17px from the left edge in every region). The North and South sizes in the first two examples were increased so the padded content fits without a scrollbar. Examples where all five regions are bare were left as they are. The theme CSS is unchanged.

If you would rather have the theme add padding to North and South for everyone, tell me. It would also move any flush toolbar or menubar away from the edge, so I did not do it without asking.

# Result

Before:

![before](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/57-before.png?raw=true)

After:

![after](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch11/57-after.png?raw=true)
