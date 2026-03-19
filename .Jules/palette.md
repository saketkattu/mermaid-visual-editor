## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2025-02-13 - Collapsible Component Accessibility
**Learning:** Custom accordion and collapsible components need explicit relationship mappings for screen readers and visible focus indicators for keyboard navigation.
**Action:** When building collapsible UI components, always include `aria-expanded={isOpen}`, `aria-controls` linked to a unique ID generated via `useId()`, a descriptive `aria-label` on the toggle, and visible focus states (e.g. `focus-visible:ring-2`) to ensure full accessibility.
