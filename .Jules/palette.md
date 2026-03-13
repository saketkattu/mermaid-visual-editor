## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-07-25 - Custom Accordion Component Accessibility
**Learning:** Custom accordion implementations often lack semantic relationships between the toggle button and the expandable content, making it difficult for screen reader users to understand the state and structure. Keyboard focus visibility is also frequently omitted.
**Action:** When building or modifying collapsible UI components (e.g., accordions or expandable sections), ensure accessibility by including `aria-expanded={isOpen}`, a descriptive `aria-label` on the toggle button, `aria-controls` linking to the content's `id`, and explicitly marking decorative icons with `aria-hidden="true"`. Also ensure clear `focus-visible` styles are applied.
