## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-05-18 - Missing ARIA on Expandable Containers
**Learning:** The custom `AccordionSection` UI container in `InspectorPanel.tsx` lacked the fundamental `aria-expanded` and `aria-controls` properties, as well as distinct focus-visible states for keyboard navigation, leading to poor screen reader and keyboard UX.
**Action:** When building or modifying collapsible UI components, prioritize keyboard navigation and screen-reader accessibility by always implementing unique element linking using React's `useId()`, mapping toggle states directly to `aria-expanded`, linking toggles to regions with `aria-controls`, and providing a visible focus indicator using `focus-visible`.
