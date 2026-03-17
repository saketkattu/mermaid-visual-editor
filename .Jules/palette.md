## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-25 - Collapsible Accordion Accessibility
**Learning:** The custom `AccordionSection` component within the `InspectorPanel` was previously missing ARIA attributes to announce state and controls for screen reader users, preventing them from knowing sections are collapsible or their current state. Furthermore, missing visible focus rings hampered keyboard navigation visibility.
**Action:** When building collapsible UI components (like an accordion), always provide `aria-expanded={isOpen}`, link the toggle button to the target content using `aria-controls={contentId}` mapping to a dynamic ID via React's `useId()`, and ensure keyboard focus states (e.g., `focus-visible:ring-2`) exist.
