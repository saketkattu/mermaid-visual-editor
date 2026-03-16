## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-25 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found multiple instances where reusable button components (`NeuBtn`) and standalone buttons (like 'Close' and 'Expand preview' in modals) had `title` attributes but were missing `aria-label`. This made them inaccessible to screen readers.
**Action:** When creating or modifying generic UI button wrappers in this application (e.g., `NeuBtn`, `ZoomBtn`, `NeuIconBtn`), always ensure that `aria-label` is mapped explicitly or falls back to `title` (e.g., `aria-label={title}`) to maintain accessibility for icon-only buttons.
