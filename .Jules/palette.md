## 2024-05-24 - Modal Accessibility and Focus Management
**Learning:** Import modal was missing screen reader context (`role="dialog"`, `aria-labelledby`, `aria-describedby`) and live regions for asynchronous parsing feedback. Keyboard focus states on buttons were also missing.
**Action:** When building modals, always include proper ARIA roles and labels, ensure focus visible states on all interactive elements, and use `aria-live` regions for any dynamic status updates (like the parser feedback) so screen readers can announce them.

## 2024-06-25 - Implicit Action Discoverability and Accessibility
**Learning:** The 'double-click to edit' interaction pattern on canvas nodes and edges was implicit. While visually minimal, it lacked affordances for new users and was entirely opaque to screen readers because of missing semantic attributes and tooltips.
**Action:** When relying on implicit actions (like double-click or keyboard shortcuts) instead of explicit buttons, maintain discoverability and accessibility by always including explicit `title` tooltips explaining the action, proper `aria-label` attributes for screen readers, and visible keyboard focus states (`focus-visible:ring-2`) when the element becomes interactive.
