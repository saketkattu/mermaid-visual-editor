# Mermaid.js Visual Editor — Build Plan

## Problem

Mermaid.js users face escalating friction as diagram complexity grows. Manual syntax authoring becomes cognitively taxing, error-prone, and hard to iterate on visually. The core tension: human visual thinking vs. text-based diagram construction.

## Chosen Approach

**Visual-first drag-and-drop editor** — users build flowcharts by dragging nodes and connecting edges. Mermaid syntax is generated automatically as output, never hand-typed.

- **Distribution**: Open-source, local-first. Users clone the repo and run a local dev server. No hosted deployment.
- **MVP scope**: Flowchart diagrams only (most common, simplest graph model).
- **Phase 2**: Obsidian plugin (local-first philosophy aligns with PKMS users).

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14 (App Router) | Fast setup, React ecosystem, good DX |
| Visual Canvas | React Flow (XY Flow) | Industry-standard node editor, MIT license, excellent docs |
| Mermaid Render | mermaid.js | Official library — used for live preview panel only |
| State | Zustand | Lightweight state for canvas nodes/edges + derived syntax |
| Styling | Tailwind CSS | Fast iteration |
| Language | TypeScript | Type safety for graph model |
| Package Manager | pnpm | Faster local installs |

---

## Architecture

### Source of Truth: Canvas State → Derived Syntax

```
User drags nodes/edges
       ↓
  Zustand Store { nodes[], edges[] }
       ↓
  Mermaid Serializer (lib/serializer.ts)
       ↓
  Mermaid syntax string
       ↓
  Preview panel + Export (.mmd / clipboard)
```

The canvas state is canonical. Mermaid syntax is always derived — never parsed back in for MVP.

### Node Shape → Mermaid Syntax Mapping

| Shape | React Flow Label | Mermaid Syntax |
|-------|-----------------|----------------|
| Rectangle | default | `A[Label]` |
| Rounded | rounded | `A(Label)` |
| Diamond | decision | `A{Label}` |
| Circle | circle | `A((Label))` |

### File Structure

```
/
├── app/
│   ├── page.tsx              # Main editor page
│   └── layout.tsx
├── components/
│   ├── Canvas.tsx            # React Flow wrapper + event handlers
│   ├── NodeTypes/
│   │   └── FlowNode.tsx      # Custom node with inline label editing
│   ├── PreviewPanel.tsx      # Mermaid.js live render panel
│   └── Toolbar.tsx           # Add node, shape picker, export, toggle preview
├── lib/
│   ├── serializer.ts         # nodes[] + edges[] → Mermaid syntax string (KEY FILE)
│   └── store.ts              # Zustand store
└── package.json
```

---

## MVP Feature Scope

### In Scope
- Add nodes (toolbar button or double-click canvas)
- Connect nodes with edges (drag from handle)
- Rename nodes (double-click node label)
- Node shapes: rectangle, rounded, diamond, circle
- Edge labels
- Delete nodes/edges (Backspace/Delete key)
- Live Mermaid preview panel (toggleable)
- Export: copy syntax to clipboard
- Export: download as `.mmd` file
- Save/load canvas as `.json` file

### Out of Scope (MVP)
- Sequence diagrams, mindmaps, Gantt, ER diagrams
- Undo/redo
- Subgraphs
- Import Mermaid syntax → canvas
- Collaborative editing
- Obsidian plugin

---

## Milestones

| Milestone | Description | Validation Gate |
|-----------|-------------|-----------------|
| **M1 — Skeleton** | Project setup, blank canvas, add/connect nodes, basic serializer, copy button | Draw 5-node flowchart → get valid Mermaid output |
| **M2 — Core UX** | Node shapes, edge labels, delete, live preview panel, inline rename | Recreate a real diagram without touching syntax |
| **M3 — Polish + Release** | File save/load, keyboard shortcuts, auto-layout (Dagre), README, MIT license | Stranger clones repo + draws flowchart in under 5 min |
| **M4 — Community** | Post to r/ObsidianMD, Obsidian Discord, Mermaid GitHub, HN Show HN | GitHub stars, issues filed, top requested features |

---

## Key Risk: Layout Expectation Paradox

Users expect Mermaid's auto-layout. This tool uses manual positioning (React Flow).

**Mitigations:**
1. Frame manual layout as the value prop — "you control the layout vs. Mermaid's unpredictable auto-arrange"
2. Add auto-layout button in M3 using `@dagrejs/dagre` (React Flow has native support)
3. Mermaid syntax output is layout-direction agnostic — it's valid Mermaid regardless of canvas position

---

## Verification

1. Unit test `lib/serializer.ts`: given known node/edge arrays → assert exact Mermaid output strings
2. Manual: draw flowchart → export → paste into mermaid.live → confirm correct render
3. Setup test: fresh clone → `pnpm install && pnpm dev` → runs without errors
4. User test: share repo with 3-5 PKMS/Obsidian users → observe unguided usage
