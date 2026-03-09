## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2026-03-09 - Discoverability of Implicit Actions
**Learning:** The canvas UI relies heavily on an implicit 'double-click to edit' interaction pattern for nodes and edges. While this keeps the interface clean, it completely hides this core functionality from screen readers and reduces discoverability for new users.
**Action:** Always add explicit `title="Double-click to edit"` and descriptive `aria-label` attributes to the containers of editable elements that rely on implicit interactions like double-click.
