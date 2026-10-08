# Batch 8 — issue comments (POSTED 2026-10-08, screenshots under `screenshots/batch8/` in the tracker repo)

## #48

# Root cause

In a menu popup, a submenu row (such as "Open") reserved a 13px box for its icon while a normal item reserved 18px, so the submenu's label started about 5px to the left of the other labels.

# Solution

The submenu icon now gets the same 18px box as a normal item. Labels in the popup line up (spread 0.5px, before 5.5px) and the icon centres match (0px, before 2.5px). Row height, hover and the arrow position are unchanged.

I noticed but did not change: an item with an image icon (16px) and an item with an icon class (18px) in the same popup still differ by about 2px. It is not in your screenshot, so tell me if it should be part of this issue.

# Result

![file popup](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch8/48-file-popup.png?raw=true)

## #49

# Root cause

This is the reserved check column, not stray spacing. Menu items with checkmark enabled always keep a 24px column at the left for the check mark, hidden until the item is checked. That way the labels do not jump sideways when a check appears.

# Solution

No change. Removing the column when nothing is checked would make every label shift right the first time something is checked, which is worse than the blank space. The column follows the usual Material pattern for selectable menus. Measured: the label stays at the same position before and after checking (0px shift).

If you still prefer a narrower column or no reserved space, tell me which and I will do it.

# Result

Nothing checked:

![unchecked](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch8/49-view-unchecked.png?raw=true)

After checking "Sort by Name" (labels do not move):

![checked](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch8/49-view-checked.png?raw=true)

## #51

# Root cause

Only leaf items had an indent. A group inside a group (Settings inside Contact) used the same left padding as its parent, and a third level used the same padding as the second, so nesting was not visible. In the collapsed-navbar popup the nested lists also picked up the browser's default bullet and 40px padding.

# Solution

Each nesting level now indents one step (26px) further than its parent, for groups and items, and the hover highlight still spans the full row. In the popup the nested lists have no bullet or extra padding, so the nested rows line up with the others and indent one step per level. The first level, arrows and badges are unchanged. Measured text positions: Contact 74.5, Settings 100.5, Edit profile 127.

# Result

![expanded navbar](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch8/51-navbar-expanded.png?raw=true)

Popup of the collapsed navbar:

![collapsed popup](https://github.com/hawkchen/marble-issue/blob/main/screenshots/batch8/51-collapsed-popup.png?raw=true)
