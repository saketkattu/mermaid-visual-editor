## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2025-05-18 - Discoverability of Hidden Canvas Interactions
**Learning:** Double-click interactions in canvas interfaces are fundamentally hidden, making them a common accessibility and usability failure point. Users often don't realize nodes or edges can be renamed because there is no visual affordance indicating text is editable.
**Action:** Always add native tooltips (`title="Double-click to edit"`) to interactable labels on canvas elements (like nodes and edges) to provide immediate, low-intrusion guidance on hover.
