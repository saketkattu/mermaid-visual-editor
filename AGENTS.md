# Repository Guidelines

## Project Structure & Module Organization
- `app/`: route entrypoints, global styles, and layout
- `components/`: UI and canvas pieces, including custom React Flow node and edge types
- `lib/`: core logic for parsing, serialization, layout, file I/O, and Zustand state
- `public/`: static assets served by Next.js
- `docs/`: product notes, screenshots, and research material

Start with `TASKS.md` before making changes. Keep UI concerns in `components/` and pure diagram logic in `lib/`. Use the `@/*` import alias for cross-folder imports.

## Build, Test, and Development Commands
- `pnpm dev`: start the local dev server on `http://localhost:3000`
- `pnpm build`: create a production build; this should pass before any commit
- `pnpm start`: run the production server locally
- `pnpm lint`: run ESLint with Next.js core-web-vitals and TypeScript rules
- `node --test lib\\fileio.test.ts lib\\serializer.test.ts lib\\store.test.ts`: run the current unit tests

Use `pnpm` only. On Windows, use `cmd /c pnpm ...` if PowerShell blocks `pnpm.ps1`.

## Coding Style & Naming Conventions
Write strict TypeScript and follow the existing style:

- 2-space indentation
- single quotes
- no semicolons unless required
- PascalCase for React components and component files
- camelCase for helpers and store actions
- lowercase utility modules in `lib/` (`serializer.ts`, `parser.ts`)

Lint before opening a PR. No separate formatter is configured.

## Architecture Guardrails
- Canvas state in `lib/store.ts` is the single source of truth; Mermaid syntax must be derived through `serialize()`
- Mermaid import flows only through `parseMermaidFlowchart()` in `lib/parser.ts`
- Do not mutate Zustand state directly; use store actions
- Call `pushHistory()` before any store mutation so undo/redo stays intact
- Keep React Flow types consistent: nodes use `flowNode`, edges use `flowEdge`
- Preserve subgraph behavior: containers use `data.isSubgraph`, children use `parentId` and `extent: 'parent'`

## Testing Guidelines
Tests live beside source files in `lib/` and use `node:test` plus `node:assert`.

- name tests `*.test.ts`
- keep tests near the module they cover
- prefer focused tests for serialization, parsing, store transitions, and subgraphs

Add or update tests when changing `lib/` behavior.

## Commit & Pull Request Guidelines
Recent history favors short, imperative commit subjects such as `Fix broken layout for imported flowcharts with subgraphs`.

- use one-line imperative commit messages
- keep PRs scoped to one concern
- include a description and screenshots/GIFs for UI changes
- call out test and lint results in the PR body

Open an issue first for larger changes.
