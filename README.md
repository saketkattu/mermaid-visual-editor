# Mermaid Visual Editor

A visual drag-and-drop editor for [Mermaid.js](https://mermaid.js.org) flowcharts. Build diagrams visually — export clean `.mmd` syntax.

No account. No cloud. Runs locally.

**[→ Try the live demo](https://mermaid-visual-editor-delta.vercel.app/)**

![Mermaid Visual Editor screenshot](docs/screenshot.png)

---

## Why

Writing Mermaid syntax by hand works fine for small diagrams. As diagrams grow, it becomes cognitively taxing — syntax errors, layout frustration, editing fatigue. This tool lets you **draw first, export syntax** rather than the other way around.

---

## Quick Start

```bash
git clone https://github.com/saketkattu/mermaid-visual-editor.git
cd mermaid-visual-editor
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

**Requirements:** Node.js 18+, pnpm

---

## Features

### Drawing
- **Add nodes** — click `+ Add Node`, press `N`, or double-click the canvas
- **Connect nodes** — drag from the handle at the top/bottom/left/right of any node to another node
- **14 node shapes** — Full suite including Rectangle, Rounded, Stadium, Diamond, Circle, Hexagon, Cylinder, and more
- **Rename** — double-click any node or edge label to edit inline

### Editing
- **Shape picker** — select a node, then click a shape to change it
- **Style picker** — customize node fill color, border color, and text color
- **Edge customization** — change line style (solid, dashed, thick) and arrow type
- **Delete** — select nodes/edges and press `Backspace` or `Delete`
- **Duplicate** — duplicate selected nodes and their edges by pressing `Ctrl+D`
- **Auto Layout** — click `⬡ Auto Layout` to arrange nodes top-to-bottom (powered by Dagre)
- **Undo/Redo** — full history stack (`Ctrl+Z` / `Ctrl+Shift+Z`)

### Diagram Settings
- **Direction** — switch layout direction (Top-to-Bottom, Left-to-Right, Bottom-to-Top, Right-to-Left)
- **Theme** — choose Mermaid theme (default, dark, forest, neutral, base)
- **Hand-drawn** — toggle Mermaid's `look: handDrawn` style
- **Curve Style** — choose from 12 routing algorithms

### Export & Save
- **Copy Syntax** — copies valid Mermaid `graph` syntax to clipboard
- **↓ .mmd** — downloads the diagram as a `.mmd` file
- **↓ .svg** — downloads the live rendered diagram as an `.svg` file
- **Save / Load** — save and reload the canvas as a `.json` file

### Preview
- **Show Preview** — live Mermaid.js render in a floating panel

---

## Keyboard Shortcuts

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

- [ ] Import Mermaid syntax → canvas
- [ ] More diagram types (sequence, mindmap)
- [ ] Subgraph support
- [ ] Obsidian plugin

---

## Contributing

PRs welcome. Open an issue first for large changes.

```bash
pnpm dev     # development server
pnpm build   # production build
pnpm lint    # lint
```

---

## License

MIT © 2025
