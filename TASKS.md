# Task List — Mermaid.js Visual Editor

Status legend: `[ ]` todo · `[x]` done · `[-]` skipped/deferred

---

## M1 — Skeleton
> **Goal:** Blank canvas where you can add and connect nodes, and get valid Mermaid output.
> **Validation:** Draw a 5-node flowchart → copy syntax → paste into mermaid.live → renders correctly.

### 1.1 Project Setup
- [x] `pnpm create next-app@latest . --typescript --tailwind --app --eslint`
- [x] Install dependencies: `pnpm add reactflow zustand mermaid`
- [x] Install dev dependencies: `pnpm add -D @types/node`
- [x] Clean out default Next.js boilerplate (page.tsx, globals.css)
- [x] Configure `tailwind.config.ts` to include `./components/**` in content paths
- [x] Verify: `pnpm dev` runs at `localhost:3000` with no errors

### 1.2 Canvas Setup
- [x] Create `components/Canvas.tsx` — React Flow wrapper with `ReactFlowProvider`
- [x] Add empty canvas with background grid (`<Background />` component from React Flow)
- [x] Add `<Controls />` (zoom in/out/reset) from React Flow
- [x] Set canvas to fill the full viewport height
- [x] Verify: blank canvas renders with grid and controls

### 1.3 Zustand Store
- [x] Create `lib/store.ts` with Zustand
- [x] Store shape: `{ nodes: Node[], edges: Edge[], addNode, onNodesChange, onEdgesChange, onConnect }`
- [x] Wire store's `onNodesChange` and `onEdgesChange` to React Flow's `onNodesChange`/`onEdgesChange` props
- [x] Wire store's `onConnect` to React Flow's `onConnect` prop

### 1.4 Add Node
- [x] Create `components/Toolbar.tsx` with an "Add Node" button
- [x] On click: dispatch `addNode` to store — adds a new node at a fixed/random position with label "Node"
- [x] Verify: clicking "Add Node" places a draggable node on canvas

### 1.5 Basic Mermaid Serializer
- [x] Create `lib/serializer.ts`
- [x] Implement `serialize(nodes, edges): string` function
- [x] Output format:
  ```
  graph TD
  A[Label]
  B[Label]
  A --> B
  ```
- [x] Node IDs must be valid Mermaid identifiers (alphanumeric, no spaces) — sanitize labels
- [x] Verify: given 2 nodes + 1 edge → correct Mermaid string returned

### 1.6 Copy Syntax Button
- [x] Add "Copy Syntax" button to Toolbar
- [x] On click: call `serialize(nodes, edges)` → copy result to clipboard via `navigator.clipboard.writeText`
- [x] Show brief "Copied!" confirmation (simple state toggle, 1.5s timeout)
- [x] Verify: click button → paste into mermaid.live → diagram renders

### M1 Checkpoint
- [x] Draw 5 nodes, connect them, copy syntax, verify in mermaid.live

---

## M2 — Core UX
> **Goal:** Full editing experience — shapes, labels, delete, live preview, inline rename.
> **Validation:** Recreate a real diagram (e.g., a user auth flow) without touching raw Mermaid syntax.

### 2.1 Custom Node Component
- [x] Create `components/NodeTypes/FlowNode.tsx`
- [x] Node renders a label that is double-clickable to edit (use `<input>` with `contentEditable` or controlled input)
- [x] On blur or Enter: commit label, update node data in store
- [x] Register node type in React Flow: `nodeTypes={{ flowNode: FlowNode }}`
- [x] Update `addNode` in store to use `type: 'flowNode'`

### 2.2 Node Shapes
- [x] Add `shape` field to node data: `'rectangle' | 'rounded' | 'diamond' | 'circle'`
- [x] In `FlowNode.tsx`, apply different CSS border styles per shape:
  - rectangle: default square borders
  - rounded: `border-radius: 9999px` (pill) or moderate rounding
  - diamond: CSS rotate transform + clip
  - circle: `border-radius: 50%`, fixed equal width/height
- [x] Update `serialize()` in `lib/serializer.ts` to use shape for Mermaid syntax:
  - rectangle → `A[Label]`
  - rounded → `A(Label)`
  - diamond → `A{Label}`
  - circle → `A((Label))`
- [x] Add shape picker to Toolbar (4 icon buttons or a dropdown)
- [x] Shape picker sets the shape for the NEXT added node (or selected node if selection is implemented)

### 2.3 Edge Labels
- [x] React Flow edges support `label` prop natively — expose this in the UI
- [x] On edge double-click: show an inline input for the edge label
- [x] Store edge label in edge data
- [x] Update `serialize()` to emit: `A -->|label| B` when edge has a label
- [x] Verify: label appears on edge in canvas and in serialized output

### 2.4 Delete Nodes and Edges
- [x] Listen for `keydown` event on the canvas wrapper
- [x] On Backspace or Delete: remove selected nodes and their connected edges from store
- [x] React Flow exposes `onNodesDelete` and `onEdgesDelete` callbacks — use these
- [x] Verify: select node → press Delete → node and its edges removed

### 2.5 Live Mermaid Preview Panel
- [x] Create `components/PreviewPanel.tsx`
- [x] Accept `syntax: string` prop
- [x] On mount and when `syntax` changes: call `mermaid.render('preview', syntax)` → inject SVG into panel
- [x] Handle mermaid render errors gracefully (show error message, keep last valid render)
- [x] Add "Toggle Preview" button in Toolbar — show/hide panel via state
- [x] Panel renders as a fixed right sidebar (e.g., `w-96`)
- [x] Initialize mermaid in `useEffect` on app load: `mermaid.initialize({ startOnLoad: false, theme: 'default' })`

### 2.6 Selection Handling
- [x] React Flow tracks selected nodes via `selected` prop on node data
- [x] When a node is selected: Toolbar shape picker changes the selected node's shape (not just next-added)
- [x] Visual: selected node has highlighted border

### M2 Checkpoint
- [x] Draw a user auth flow (Register → Verify Email → Login → Dashboard) with decision diamonds
- [x] Toggle preview → Mermaid renders correctly
- [x] Edit labels inline, delete nodes, verify preview updates

---

## M3 — Polish + Open Source Release
> **Goal:** Production-ready OSS repo. A stranger can clone it and use it in under 5 minutes.
> **Validation:** Fresh clone → `pnpm install && pnpm dev` → working editor in browser.

### 3.1 Download as .mmd
- [x] Add "Download .mmd" button to Toolbar
- [x] On click: call `serialize()` → create Blob → trigger download via `<a>` element with `download` attribute
- [x] Filename: `diagram.mmd`

### 3.2 Save Canvas as JSON
- [x] Add "Save" button to Toolbar
- [x] Serialize `{ nodes, edges }` as JSON → download as `diagram.json`
- [x] Add "Load" button → file input (accept `.json`) → parse and load nodes/edges into store

### 3.3 Auto-Layout (Dagre)
- [x] Install: `pnpm add @dagrejs/dagre`
- [x] Create `lib/layout.ts` — implement `applyDagreLayout(nodes, edges): Node[]`
- [x] Use `dagre.graphlib.Graph`, set `rankdir: 'TB'` (top-to-bottom)
- [x] Add "Auto Layout" button to Toolbar → applies layout, updates node positions in store
- [x] Verify: messy graph → click Auto Layout → clean top-down arrangement

### 3.4 Keyboard Shortcuts
- [x] `N` — add a new node at canvas center
- [x] `Backspace` / `Delete` — delete selected nodes/edges (already done in M2, confirm works)
- [x] `Escape` — deselect all
- [x] Add keyboard shortcut legend in a `?` help tooltip in the UI corner

### 3.5 Empty State
- [x] When canvas has no nodes: show centered placeholder text "Double-click to add a node, or click Add Node in the toolbar"
- [x] Implement double-click on canvas background → adds node at click position

### 3.6 README
- [x] Write `README.md` covering:
  - What it is (1 sentence)
  - Screenshot or GIF of the editor in use
  - Quick start: `git clone` → `pnpm install` → `pnpm dev`
  - Feature list
  - Roadmap (link to TASKS.md or GitHub Issues)
  - Contributing guide (basic)
  - License

### 3.7 Open Source Hygiene
- [x] Add `LICENSE` file (MIT)
- [x] Add `.gitignore` (Next.js standard)
- [x] Add `.nvmrc` or `engines` field in `package.json` specifying Node version
- [x] Initialize git repo: `git init` → initial commit
- [x] Push to GitHub as public repo

### M3 Checkpoint
- [x] Fresh clone on a clean machine → `pnpm install && pnpm dev` → editor opens
- [x] Full workflow: add nodes → shape them → connect → auto-layout → toggle preview → download .mmd

---

## Phase 1 — Flowchart Capabilities
> **Goal:** Enhance diagramming capabilities to support ~80% of Mermaid's full flowchart feature set.

### P1.1 Advanced Node Shapes
- [x] Stadium/Pill (`[label]`)
- [x] Subroutine (`[[label]]`)
- [x] Cylinder (`[(label)]`)
- [x] Hexagon (`{{label}}`)
- [x] Parallelogram (`[/label/]`)
- [x] Parallelogram-alt (`[\label\]`)
- [x] Trapezoid (`[/label\]`)
- [x] Trapezoid-alt (`[\label/]`)
- [x] Double-circle (`(((label)))`)
- [x] Asymmetric (`>label]`)

### P1.2 Advanced Edge Types
- [x] Line styles: solid / dashed / thick
- [x] Arrow types: arrow / none / bidirectional / circle-end / cross-end
- [x] Edge color picker
- [x] Serialize to proper Mermaid operators (`-->`, `---`, `-.->`, `===`, etc.)

### P1.3 Diagram Settings
- [x] Direction selector (TD / LR / BT / RL)
- [x] Theme picker (default / dark / forest / neutral / base)
- [x] Hand-drawn sketch toggle (Mermaid `look: handDrawn`)
- [x] Curve style selector (12 d3-shape curves)

### P1.4 Node Styling
- [x] Fill color picker
- [x] Border color picker
- [x] Text color picker
- [x] Reset to defaults
- [x] Serialize as Mermaid style definitions

### P1.5 Advanced Interactions
- [x] History: Undo / Redo (Ctrl+Z / Ctrl+Shift+Z)
- [x] Duplicate selected nodes (Ctrl+D)
- [x] 4 handles per node (Top/Bottom/Left/Right) for better routing
- [x] SVG Export

### P1.6 UI Redesign (Excalidraw/FigJam style)
- [x] Full-screen canvas background
- [x] Absolute positioned floating UI panels
- [x] Clean, accessible toolbar grouping
- [x] Rounded styling with backdrop blur and subtle shadows

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
| Sequence diagrams | Different graph model — needs separate canvas logic |
| Mindmap support | Tree-based layout, separate node types |
| Obsidian plugin | Port canvas component into Obsidian plugin API |
| Subgraphs | Nested node groups in React Flow |
