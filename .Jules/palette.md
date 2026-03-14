## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-25 - Collapsible Section Accessibility
**Learning:** Custom collapsible UI components (like Accordions) need proper ARIA mappings (`aria-expanded`, `aria-controls`) and visible focus states. Screen readers rely on `aria-expanded` to announce state changes, and keyboard users need `focus-visible` to know where their focus is.
**Action:** When building or modifying collapsible components, ensure accessibility by generating a unique ID (via `React.useId()`) to link the toggle button to the content area, updating `aria-expanded` dynamically, and adding focus styles (e.g., `focus-visible:ring-2`).
