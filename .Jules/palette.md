## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-25 - Inspector Accessibility and Focus States
**Learning:** Collapsible sections like the `AccordionSection` in the Inspector Panel need an explicit relationship to their toggled content. Re-usable design system buttons (like `NeuBtn`) are easy to build with accessibility in mind, but it is frequently forgotten when instances only render an icon. Keyboard users need `focus-visible` outlines.
**Action:** Use React's `useId()` along with `aria-controls` and `aria-expanded` when building collapsibles. When creating or modifying generic UI button wrappers (e.g., `NeuBtn`), explicitly enforce or pass through `aria-label={title}` to prevent empty labels for icon-only instances. Apply `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500` to all interactive elements to ensure a clean, visible keyboard focus state.
