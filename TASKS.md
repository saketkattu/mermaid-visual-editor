# Task List — Mermaid.js Visual Editor

Status legend: `[ ]` todo · `[x]` done · `[-]` skipped/deferred

---

## M1 — Skeleton
> **Goal:** Blank canvas where you can add and connect nodes, and get valid Mermaid output.
> **Validation:** Draw a 5-node flowchart → copy syntax → paste into mermaid.live → renders correctly.

### 1.1 Project Setup
- [ ] `pnpm create next-app@latest . --typescript --tailwind --app --eslint`
- [ ] Install dependencies: `pnpm add reactflow zustand mermaid`
- [ ] Install dev dependencies: `pnpm add -D @types/node`
- [ ] Clean out default Next.js boilerplate (page.tsx, globals.css)
- [ ] Configure `tailwind.config.ts` to include `./components/**` in content paths
- [ ] Verify: `pnpm dev` runs at `localhost:3000` with no errors

### 1.2 Canvas Setup
- [ ] Create `components/Canvas.tsx` — React Flow wrapper with `ReactFlowProvider`
- [ ] Add empty canvas with background grid (`<Background />` component from React Flow)
- [ ] Add `<Controls />` (zoom in/out/reset) from React Flow
- [ ] Set canvas to fill the full viewport height
- [ ] Verify: blank canvas renders with grid and controls

### 1.3 Zustand Store
- [ ] Create `lib/store.ts` with Zustand
- [ ] Store shape: `{ nodes: Node[], edges: Edge[], addNode, onNodesChange, onEdgesChange, onConnect }`
- [ ] Wire store's `onNodesChange` and `onEdgesChange` to React Flow's `onNodesChange`/`onEdgesChange` props
- [ ] Wire store's `onConnect` to React Flow's `onConnect` prop

### 1.4 Add Node
- [ ] Create `components/Toolbar.tsx` with an "Add Node" button
- [ ] On click: dispatch `addNode` to store — adds a new node at a fixed/random position with label "Node"
- [ ] Verify: clicking "Add Node" places a draggable node on canvas

### 1.5 Basic Mermaid Serializer
- [ ] Create `lib/serializer.ts`
- [ ] Implement `serialize(nodes, edges): string` function
- [ ] Output format:
  ```
  graph TD
  A[Label]
  B[Label]
  A --> B
  ```
- [ ] Node IDs must be valid Mermaid identifiers (alphanumeric, no spaces) — sanitize labels
- [ ] Verify: given 2 nodes + 1 edge → correct Mermaid string returned

### 1.6 Copy Syntax Button
- [ ] Add "Copy Syntax" button to Toolbar
- [ ] On click: call `serialize(nodes, edges)` → copy result to clipboard via `navigator.clipboard.writeText`
- [ ] Show brief "Copied!" confirmation (simple state toggle, 1.5s timeout)
- [ ] Verify: click button → paste into mermaid.live → diagram renders

### M1 Checkpoint
- [ ] Draw 5 nodes, connect them, copy syntax, verify in mermaid.live

---

## M2 — Core UX
> **Goal:** Full editing experience — shapes, labels, delete, live preview, inline rename.
> **Validation:** Recreate a real diagram (e.g., a user auth flow) without touching raw Mermaid syntax.

### 2.1 Custom Node Component
- [ ] Create `components/NodeTypes/FlowNode.tsx`
- [ ] Node renders a label that is double-clickable to edit (use `<input>` with `contentEditable` or controlled input)
- [ ] On blur or Enter: commit label, update node data in store
- [ ] Register node type in React Flow: `nodeTypes={{ flowNode: FlowNode }}`
- [ ] Update `addNode` in store to use `type: 'flowNode'`

### 2.2 Node Shapes
- [ ] Add `shape` field to node data: `'rectangle' | 'rounded' | 'diamond' | 'circle'`
- [ ] In `FlowNode.tsx`, apply different CSS border styles per shape:
  - rectangle: default square borders
  - rounded: `border-radius: 9999px` (pill) or moderate rounding
  - diamond: CSS rotate transform + clip
  - circle: `border-radius: 50%`, fixed equal width/height
- [ ] Update `serialize()` in `lib/serializer.ts` to use shape for Mermaid syntax:
  - rectangle → `A[Label]`
  - rounded → `A(Label)`
  - diamond → `A{Label}`
  - circle → `A((Label))`
- [ ] Add shape picker to Toolbar (4 icon buttons or a dropdown)
- [ ] Shape picker sets the shape for the NEXT added node (or selected node if selection is implemented)

### 2.3 Edge Labels
- [ ] React Flow edges support `label` prop natively — expose this in the UI
- [ ] On edge double-click: show an inline input for the edge label
- [ ] Store edge label in edge data
- [ ] Update `serialize()` to emit: `A -->|label| B` when edge has a label
- [ ] Verify: label appears on edge in canvas and in serialized output

### 2.4 Delete Nodes and Edges
- [ ] Listen for `keydown` event on the canvas wrapper
- [ ] On Backspace or Delete: remove selected nodes and their connected edges from store
- [ ] React Flow exposes `onNodesDelete` and `onEdgesDelete` callbacks — use these
- [ ] Verify: select node → press Delete → node and its edges removed

### 2.5 Live Mermaid Preview Panel
- [ ] Create `components/PreviewPanel.tsx`
- [ ] Accept `syntax: string` prop
- [ ] On mount and when `syntax` changes: call `mermaid.render('preview', syntax)` → inject SVG into panel
- [ ] Handle mermaid render errors gracefully (show error message, keep last valid render)
- [ ] Add "Toggle Preview" button in Toolbar — show/hide panel via state
- [ ] Panel renders as a fixed right sidebar (e.g., `w-96`)
- [ ] Initialize mermaid in `useEffect` on app load: `mermaid.initialize({ startOnLoad: false, theme: 'default' })`

### 2.6 Selection Handling
- [ ] React Flow tracks selected nodes via `selected` prop on node data
- [ ] When a node is selected: Toolbar shape picker changes the selected node's shape (not just next-added)
- [ ] Visual: selected node has highlighted border

### M2 Checkpoint
- [ ] Draw a user auth flow (Register → Verify Email → Login → Dashboard) with decision diamonds
- [ ] Toggle preview → Mermaid renders correctly
- [ ] Edit labels inline, delete nodes, verify preview updates

---

## M3 — Polish + Open Source Release
> **Goal:** Production-ready OSS repo. A stranger can clone it and use it in under 5 minutes.
> **Validation:** Fresh clone → `pnpm install && pnpm dev` → working editor in browser.

### 3.1 Download as .mmd
- [ ] Add "Download .mmd" button to Toolbar
- [ ] On click: call `serialize()` → create Blob → trigger download via `<a>` element with `download` attribute
- [ ] Filename: `diagram.mmd`

### 3.2 Save Canvas as JSON
- [ ] Add "Save" button to Toolbar
- [ ] Serialize `{ nodes, edges }` as JSON → download as `diagram.json`
- [ ] Add "Load" button → file input (accept `.json`) → parse and load nodes/edges into store

### 3.3 Auto-Layout (Dagre)
- [ ] Install: `pnpm add @dagrejs/dagre`
- [ ] Create `lib/layout.ts` — implement `applyDagreLayout(nodes, edges): Node[]`
- [ ] Use `dagre.graphlib.Graph`, set `rankdir: 'TB'` (top-to-bottom)
- [ ] Add "Auto Layout" button to Toolbar → applies layout, updates node positions in store
- [ ] Verify: messy graph → click Auto Layout → clean top-down arrangement

### 3.4 Keyboard Shortcuts
- [ ] `N` — add a new node at canvas center
- [ ] `Backspace` / `Delete` — delete selected nodes/edges (already done in M2, confirm works)
- [ ] `Escape` — deselect all
- [ ] Add keyboard shortcut legend in a `?` help tooltip in the UI corner

### 3.5 Empty State
- [ ] When canvas has no nodes: show centered placeholder text "Double-click to add a node, or click Add Node in the toolbar"
- [ ] Implement double-click on canvas background → adds node at click position

### 3.6 README
- [ ] Write `README.md` covering:
  - What it is (1 sentence)
  - Screenshot or GIF of the editor in use
  - Quick start: `git clone` → `pnpm install` → `pnpm dev`
  - Feature list
  - Roadmap (link to TASKS.md or GitHub Issues)
  - Contributing guide (basic)
  - License

### 3.7 Open Source Hygiene
- [ ] Add `LICENSE` file (MIT)
- [ ] Add `.gitignore` (Next.js standard)
- [ ] Add `.nvmrc` or `engines` field in `package.json` specifying Node version
- [ ] Initialize git repo: `git init` → initial commit
- [ ] Push to GitHub as public repo

### M3 Checkpoint
- [ ] Fresh clone on a clean machine → `pnpm install && pnpm dev` → editor opens
- [ ] Full workflow: add nodes → shape them → connect → auto-layout → toggle preview → download .mmd

---

## M4 — Community Release
> **Goal:** Get the tool in front of real users. Gather structured feedback.

### 4.1 Community Posts
- [ ] r/ObsidianMD — post with screenshot, focus on PKMS angle
- [ ] Obsidian Discord `#share-showcase` channel
- [ ] Mermaid.js GitHub Discussions — link as a community tool
- [ ] Hacker News `Show HN:` post
- [ ] Dev.to or Hashnode write-up (optional but amplifies reach)

### 4.2 Feedback Tracking
- [ ] Enable GitHub Issues — label templates: `bug`, `feature-request`, `diagram-type`
- [ ] Pin a "What would you use this for?" discussion thread on GitHub
- [ ] Track: stars, issues filed, most-requested diagram types, reported friction points

### 4.3 Decision Gate
After 2-4 weeks, evaluate:
- [ ] Do users ask for Obsidian plugin? → begin Phase 2
- [ ] What diagram types are requested most? → prioritize M5 diagram types
- [ ] Is import (Mermaid syntax → canvas) a top request? → scope out AST parsing work
- [ ] Are there critical UX failures? → hotfix before proceeding

---

## Deferred (Post-MVP)

| Feature | Notes |
|---------|-------|
| Import Mermaid syntax → canvas | Requires Mermaid AST parser. Complex. High-value. |
| Undo/redo | Use `use-undoable` or Zustand middleware |
| Sequence diagrams | Different graph model — needs separate canvas logic |
| Mindmap support | Tree-based layout, separate node types |
| Obsidian plugin | Port canvas component into Obsidian plugin API |
| Subgraphs | Nested node groups in React Flow |
| Theming | Light/dark Mermaid themes, custom node colors |
