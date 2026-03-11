## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-25 - Reusable Button wrappers omitting aria-label
**Learning:** The custom Neumorphic button wrappers in this application (`NeuBtn`, `ZoomBtn`, `NeuIconBtn`) commonly accept a `title` prop for tooltips but frequently fail to pass it as an `aria-label` to the underlying `<button>`. This causes screen readers to announce "button" with no context for icon-only buttons.
**Action:** When creating or modifying generic UI button wrappers, always ensure that `aria-label` is mapped either explicitly or fallback to `title` (e.g., `aria-label={ariaLabel || title}`) to prevent accessibility silences on icon-only variations.
