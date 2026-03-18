## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-24 - Accordion Accessibility and Focus Management
**Learning:** Collapsible sections like accordions often lack structural context for screen readers (`aria-expanded`, `aria-controls`) and visible focus states for keyboard users because of custom styling.
**Action:** When building or modifying collapsible UI components, always ensure accessibility by including `aria-expanded={isOpen}`, `aria-controls` linked to a unique ID (e.g., via React's `useId()`), and visible focus states (e.g., `focus-visible:ring-2` with `focus-visible:outline-none`).
