# Batch 12 (line A) — Jira and comments SENT

Status: SENT 2026-10-09 (D61-A). Jira: ZK-6191. Comments posted on #30 and #68. #69 not commented.
Decision behind this: D60-A (see `doc/jess-review/lines/line-a-plan.md`, section 8).

## 1. ZK Jira draft (feature request)

**Project:** ZK  **Type:** Feature Request  **Affects Version/s:** 11.0.0 (confirm against the tracker's version list)

**Summary:** Provide an opt-in inline error mode for input validation, and let the errorbox be non-draggable

**Description:**

### Background

The Marble theme (default look-and-feel from ZK 11.0) follows Material Design 3. In MD3, a field error is shown as supporting text under the field, not as a floating callout (https://m3.material.io/components/text-fields/specs). ZK shows every validation error in an `Errorbox` popup. The designer review of Marble raised three related points about it.

### What is needed

1. **Inline error mode (opt-in).** Show the error message as a line under the input instead of a popup. The default behavior must stay the popup, so existing applications are unchanged. The input already has an error style (red border), so only the message placement is missing.
2. **Errorbox must be able to stay put.** `zul.inp.Errorbox` always creates a `zk.Draggable` in `bind_`, so users can drag it away from its input. This is rarely expected and is not MD3 style. Provide a way to turn dragging off (a property or a client-side flag).
3. **Errorboxes covering each other or neighbouring inputs.** With several invalid fields close together, the popups overlap and hide the next input. An inline mode would remove the problem. For the popup mode, a placement that avoids covering the adjacent field would help.

### Why CSS cannot solve it

- The popup is created by `InputElement` on the server and positioned by the widget; there is no slot under the field for a message.
- The drag handler is attached in JavaScript, so a stylesheet cannot disable it (a `cursor` reset only hides the symptom).

### Related

- A separate issue already tracks `Errorbox._fixarrow` leaving stale `left`/`top` (ZK-6188).
- Source: Marble design review, issues hawkchen/marble-issue #30, #68, #69.

## 2. Comment drafts for the tracker (to post after the Jira exists)

Replace `ZK-XXXX` with the real key. No screenshots needed (no code change).

### #30

# Root cause

ZK shows validation errors in a floating `Errorbox` popup, created by the server (`InputElement`) and placed by the widget. The input has an error style, but there is no place under the field for a message, so a theme stylesheet cannot turn the popup into MD3 supporting text.

# Solution

No theme change. Inline error text needs a new display mode in the widget, so it is tracked as a ZK feature request: ZK-XXXX (opt-in inline mode, default stays the popup). ZK 11.0 keeps the popup.

### #68

# Root cause

The errorbox is draggable because the widget attaches a `zk.Draggable` when it is bound. A stylesheet cannot switch that off.

# Solution

No theme change. Letting the errorbox stay put is part of ZK-XXXX. The cursor no longer shows "move" where the box cannot be moved (#67, already fixed).

### #69 (not yet commented; it is a ZK-CORE item from the deferred list)

Only comment if the user also wants #69 answered now. Same Jira, point 3.
