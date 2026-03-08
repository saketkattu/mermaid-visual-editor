# Mermaid Visual Editor

A visual drag-and-drop editor for [Mermaid.js](https://mermaid.js.org) flowcharts. Build diagrams visually — export clean `.mmd` syntax.

No account. No cloud. Runs locally.

**[Try the live demo](https://mermaid-visual-editor-delta.vercel.app/)**

<img width="1914" height="904" alt="image" src="https://github.com/user-attachments/assets/8626790d-d5cc-4fe1-8dc1-0f3c78792d0b" />


Mermaid Visual Editor lets you draw flowcharts by dragging nodes and connecting edges on an infinite canvas. Mermaid syntax is generated automatically — you never hand-type it. Built with Next.js, React Flow, Zustand, and Mermaid.js.

### Install & Run

**Global install (recommended for repeat use):**
```bash
npm install -g mermaid-visual-editor
mermaid-visual-editor
```

**One-off (no install):**
```bash
npx mermaid-visual-editor
```

Both commands serve the app and open your browser at [http://localhost:3000](http://localhost:3000).

**Requirements:** Node.js 18+

---

### Development Setup

```bash
git clone https://github.com/saketkattu/mermaid-visual-editor.git
cd mermaid-visual-editor
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Requirements:** Node.js 18+, pnpm

---

## Why I Built This & Validation

### The Problem

Writing Mermaid syntax by hand works fine for small diagrams. As diagrams grow, it becomes cognitively taxing — syntax errors, layout frustration, editing fatigue. Users shift from *designing systems* to *debugging text*.

The core tension: **human visual thinking vs. text-based diagram construction.**

### Who Feels This Pain

**PKMS Power Users** — rely on plain-text workflows inside tools like Obsidian to maintain portable, future-proof knowledge systems. They tolerate syntax complexity until diagrams exceed a manageable threshold, at which point editing becomes disproportionately effortful.

**Technical Writers & Educators** — use Mermaid to communicate processes and flows in documentation. Syntax introduces friction that competes with their primary job: explaining ideas.

**System Architects & Developers** — value diagrams as structured, version-controlled artifacts. They experience diminishing returns when diagrams become visually complex but syntactically dense.

### Jobs-to-be-Done

- **When modeling complex systems**, I want to express relationships visually without fighting syntax, **so I can focus on thinking rather than formatting.**
- **When refining diagrams**, I want changes to feel lightweight and intuitive, **so I can iterate rapidly without cognitive fatigue.**
- **When storing diagrams in my knowledge workflows**, I want them to remain portable and future-proof, **so I avoid lock-in.**

### The Friction Matrix

| Current Approach | Strength | Breaking Point |
|-----------------|----------|----------------|
| **Manual syntax** | Maximum portability and precision | Syntax fatigue, high error frequency, cognitive overload as diagrams scale |
| **Mermaid Live Editor** | Official, free, syntax-complete | Context switching, no bi-directional workflow with local files |
| **Excalidraw / Whiteboards** | Highly intuitive visual manipulation | Loss of diagram-as-code benefits, weak portability |
| **AI-assisted generation** | Fast initial creation | Syntax errors, hallucinations, manual cleanup burden |

### Market Signals

Mermaid.js has substantial ecosystem penetration:

- **86,300+ GitHub Stars**
- **~2.8M Weekly NPM Downloads**
- **~350,000+ Mermaid-related Plugin Downloads** (Obsidian ecosystem)
- Estimated friction-affected users: **~2.5M–3M users**

**What users say:**

> *"Creating and editing diagrams visually is much more intuitive."*
>
> *"Syntax gets cumbersome real fast for larger mind maps."*
>
> *"Mermaid chooses poor layouts… lines are inconsistent."*
>
> *"Been waiting for something like this since forever."*

---

## Solution + Features

Mermaid Visual Editor takes a **visual-first** approach: draw first, export syntax. The canvas state is the source of truth — Mermaid syntax is always derived, never hand-typed.

### Drawing
- **Add nodes** — click `+ Add Node`, press `N`, or double-click the canvas
- **Connect nodes** — drag from the handle at the top/bottom/left/right of any node to another node
- **14 node shapes** — Rectangle, Rounded, Stadium, Diamond, Circle, Hexagon, Cylinder, and more
- **Rename** — double-click any node or edge label to edit inline

### Editing
- **Shape picker** — select a node, then click a shape to change it
- **Style picker** — customize node fill color, border color, and text color
- **Edge customization** — change line style (solid, dashed, thick) and arrow type
- **Delete** — select nodes/edges and press `Backspace` or `Delete`
- **Duplicate** — duplicate selected nodes and their edges by pressing `Ctrl+D`
- **Auto Layout** — arrange nodes top-to-bottom powered by Dagre
- **Undo/Redo** — full history stack (`Ctrl+Z` / `Ctrl+Shift+Z`)

### Diagram Settings
- **Direction** — switch layout direction (Top-to-Bottom, Left-to-Right, Bottom-to-Top, Right-to-Left)
- **Theme** — choose Mermaid theme (default, dark, forest, neutral, base)
- **Hand-drawn** — toggle Mermaid's `look: handDrawn` style
- **Curve Style** — choose from 12 routing algorithms

### Export & Save
- **Copy Syntax** — copies valid Mermaid `graph` syntax to clipboard
- **Download .mmd** — downloads the diagram as a `.mmd` file
- **Download .svg** — downloads the live rendered diagram as an `.svg` file
- **Save / Load** — save and reload the canvas as a `.json` file

### Preview
- **Show Preview** — live Mermaid.js render in a floating panel

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `N` | Add a new node |
| `Backspace` / `Delete` | Delete selected node(s) or edge(s) |
| `Ctrl + D` | Duplicate selected node(s) |
| `Ctrl + Z` | Undo |
| `Ctrl + Shift + Z` | Redo |
| `Escape` | Deselect all |

---

## Roadmap

### Near-term
- [ ] Import Mermaid syntax to canvas
- [ ] Subgraph support
- [ ] Sequence diagram support
- [ ] Mindmap support

### Medium-term
- [ ] Obsidian plugin
- [ ] Class diagram support
- [ ] ER diagram support
- [ ] State diagram support
- [ ] Dark mode for the editor UI

### Long-term
- [ ] Real-time collaboration
- [ ] AI-assisted diagram generation
- [ ] VS Code extension
- [ ] Two-way code-canvas sync

---

## Tech Stack & Architecture

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Visual Canvas | React Flow (XY Flow) |
| Mermaid Render | mermaid.js |
| State | Zustand |
| Styling | Tailwind CSS |
| Language | TypeScript |
| Layout | Dagre |
| Package Manager | pnpm |

### Architecture

```
User drags nodes/edges
       |
  Zustand Store { nodes[], edges[] }
       |
  Mermaid Serializer (lib/serializer.ts)
       |
  Mermaid syntax string
       |
  Preview panel + Export (.mmd / clipboard / .svg)
```

The canvas state is canonical. Mermaid syntax is always derived — never parsed back in.

---

## Contributing

PRs welcome. Open an issue first for large changes. See [CONTRIBUTING.md](CONTRIBUTING.md) for full guidelines.

```bash
pnpm dev     # development server
pnpm build   # production build → generates out/
pnpm lint    # lint
pnpm audit   # security audit
```

### CI

Every push and PR against `master` runs lint, audit, and build automatically via GitHub Actions.

### Releases

Releases are fully automated — do not manually edit the version in `package.json`.

1. Update `CHANGELOG.md` — move items from `[Unreleased]` to a new versioned section
2. Go to **Actions → Release → Run workflow**
3. Choose the bump type (`patch` / `minor` / `major`)

The workflow bumps `package.json`, commits, tags, publishes to npm, and creates a GitHub Release.

> **Required secret:** add `NPM_TOKEN` to repo Settings → Secrets → Actions before triggering a release.

---

## Security

See [SECURITY.md](SECURITY.md) for the vulnerability disclosure policy.

---

## License

MIT
