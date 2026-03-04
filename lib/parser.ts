import type { Edge, Node } from '@xyflow/react'
import type {
  ArrowType,
  CurveStyle,
  Direction,
  EdgeStyle,
  FlowEdgeData,
  FlowNodeData,
  Look,
  NodeShape,
  Theme,
} from './store'
import { applyDagreLayout } from './layout'

// ─── Public result type ───────────────────────────────────────────────────────

export interface ParseResult {
  nodes: Node<FlowNodeData>[]
  edges: Edge<FlowEdgeData>[]
  direction: Direction
  theme: Theme
  look: Look
  curveStyle: CurveStyle
  error: string | null
}

// ─── Node shape detection ─────────────────────────────────────────────────────
// Inverts the shapeWrap() function from serializer.ts.
// Each regex matches the suffix after the node ID.

function parseNodeSuffix(suffix: string): { shape: NodeShape; label: string } | null {
  let m: RegExpMatchArray | null

  // double-circle: ((("label")))
  m = suffix.match(/^\({3}"([^"]*)"\){3}$/)
  if (m) return { shape: 'double-circle', label: m[1] }

  // circle: (("label"))
  m = suffix.match(/^\({2}"([^"]*)"\){2}$/)
  if (m) return { shape: 'circle', label: m[1] }

  // stadium: (["label"])
  m = suffix.match(/^\(\["([^"]*)"\]\)$/)
  if (m) return { shape: 'stadium', label: m[1] }

  // rounded: ("label")
  m = suffix.match(/^\("([^"]*)"\)$/)
  if (m) return { shape: 'rounded', label: m[1] }

  // subroutine: [["label"]]
  m = suffix.match(/^\[\["([^"]*)"\]\]$/)
  if (m) return { shape: 'subroutine', label: m[1] }

  // cylinder: [("label")]
  m = suffix.match(/^\[\("([^"]*)"\)\]$/)
  if (m) return { shape: 'cylinder', label: m[1] }

  // hexagon: {{"label"}}
  m = suffix.match(/^\{\{"([^"]*)"\}\}$/)
  if (m) return { shape: 'hexagon', label: m[1] }

  // diamond: {"label"}
  m = suffix.match(/^\{"([^"]*)"\}$/)
  if (m) return { shape: 'diamond', label: m[1] }

  // parallelogram: [/"label"/]
  m = suffix.match(/^\[\/?"([^"]*)"\/?\]$/)
  if (m && suffix.startsWith('[/"') && suffix.endsWith('/]')) return { shape: 'parallelogram', label: m[1] }

  // trapezoid: [/"label"\]   (starts /", ends \])
  if (suffix.startsWith('[/"') && suffix.endsWith('\\]')) {
    m = suffix.match(/^\[\/"([^"]*)"\\\]$/)
    if (m) return { shape: 'trapezoid', label: m[1] }
  }

  // parallelogram-alt: [\"label"\]  (starts \", ends \])
  if (suffix.startsWith('[\\') && suffix.endsWith('\\]')) {
    m = suffix.match(/^\[\\"([^"]*)"\\\]$/)
    if (m) return { shape: 'parallelogram-alt', label: m[1] }
  }

  // trapezoid-alt: [\"label"/]  (starts \", ends /])
  if (suffix.startsWith('[\\') && suffix.endsWith('/]')) {
    m = suffix.match(/^\[\\"([^"]*)"\/\]$/)
    if (m) return { shape: 'trapezoid-alt', label: m[1] }
  }

  // asymmetric: >"label"]
  m = suffix.match(/^>"([^"]*)"\]$/)
  if (m) return { shape: 'asymmetric', label: m[1] }

  // rectangle: ["label"]
  m = suffix.match(/^\["([^"]*)"\]$/)
  if (m) return { shape: 'rectangle', label: m[1] }

  return null
}

// ─── Edge connector mapping ───────────────────────────────────────────────────
// Inverts edgeConnector() from serializer.ts.

const CONNECTOR_MAP: Record<string, { edgeStyle: EdgeStyle; arrowType: ArrowType }> = {
  '-->':    { edgeStyle: 'solid',  arrowType: 'arrow' },
  '---':    { edgeStyle: 'solid',  arrowType: 'none' },
  '<-->':   { edgeStyle: 'solid',  arrowType: 'bidirectional' },
  '--o':    { edgeStyle: 'solid',  arrowType: 'circle' },
  '--x':    { edgeStyle: 'solid',  arrowType: 'cross' },
  '-.-':    { edgeStyle: 'dashed', arrowType: 'none' },
  '<-.->':  { edgeStyle: 'dashed', arrowType: 'bidirectional' },
  '-.-o':   { edgeStyle: 'dashed', arrowType: 'circle' },
  '-.-x':   { edgeStyle: 'dashed', arrowType: 'cross' },
  '-.->' :  { edgeStyle: 'dashed', arrowType: 'arrow' },
  '===':    { edgeStyle: 'thick',  arrowType: 'none' },
  '<===>':  { edgeStyle: 'thick',  arrowType: 'bidirectional' },
  '==>':    { edgeStyle: 'thick',  arrowType: 'arrow' },
}

// ─── Line classifiers ─────────────────────────────────────────────────────────

interface EdgeParseResult {
  source: string
  target: string
  label?: string
  edgeStyle: EdgeStyle
  arrowType: ArrowType
}

function tryParseEdge(line: string): EdgeParseResult | null {
  // With label: src CONNECTOR|"label"| tgt
  const withLabel = line.match(/^(\w+)\s+([-<>=.ox]+)\|"([^"]*)"\|\s+(\w+)$/)
  if (withLabel) {
    const [, src, conn, label, tgt] = withLabel
    const type = CONNECTOR_MAP[conn]
    if (type) return { source: src, target: tgt, label, ...type }
  }

  // Without label: src CONNECTOR tgt
  const noLabel = line.match(/^(\w+)\s+([-<>=.ox]+)\s+(\w+)$/)
  if (noLabel) {
    const [, src, conn, tgt] = noLabel
    const type = CONNECTOR_MAP[conn]
    if (type) return { source: src, target: tgt, ...type }
  }

  return null
}

function tryParseNode(line: string): { id: string; label: string; shape: NodeShape } | null {
  const m = line.match(/^(\w+)(.+)$/)
  if (!m) return null
  const [, id, suffix] = m
  const result = parseNodeSuffix(suffix.trim())
  if (!result) return null
  return { id, ...result }
}

// ─── JSON extractor (depth-counted, handles nested objects) ───────────────────

function extractJson(s: string, fromIndex: number): string {
  let depth = 0
  let i = fromIndex
  while (i < s.length) {
    if (s[i] === '{') depth++
    else if (s[i] === '}') {
      depth--
      if (depth === 0) return s.slice(fromIndex, i + 1)
    }
    i++
  }
  return ''
}

// ─── Default node factory ─────────────────────────────────────────────────────

function makeNode(id: string, label?: string, shape: NodeShape = 'rectangle'): Node<FlowNodeData> {
  return {
    id,
    type: 'flowNode',
    position: { x: 0, y: 0 },
    data: { label: label ?? id, shape },
  }
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseMermaidFlowchart(syntax: string): ParseResult {
  const empty: ParseResult = {
    nodes: [], edges: [],
    direction: 'TD', theme: 'default', look: 'classic', curveStyle: 'basis',
    error: null,
  }

  try {
    const lines = syntax.split('\n').map((l) => l.trim()).filter(Boolean)

    let direction: Direction = 'TD'
    let theme: Theme = 'default'
    let look: Look = 'classic'
    let curveStyle: CurveStyle = 'basis'
    let foundHeader = false
    let currentSubgraphId: string | null = null
    let edgeIdx = 0

    const nodesMap = new Map<string, Node<FlowNodeData>>()
    const edges: Edge<FlowEdgeData>[] = []
    const pendingStyles = new Map<string, Partial<Pick<FlowNodeData, 'fillColor' | 'strokeColor' | 'textColor'>>>()
    const pendingLinkStyles = new Map<number, string>()

    for (const line of lines) {
      // ── Frontmatter %%{ init: {...} }%%
      if (line.startsWith('%%')) {
        const initIdx = line.indexOf('init:')
        if (initIdx >= 0) {
          const jsonStart = line.indexOf('{', initIdx + 5)
          if (jsonStart >= 0) {
            const jsonStr = extractJson(line, jsonStart)
            if (jsonStr) {
              try {
                const cfg = JSON.parse(jsonStr) as Record<string, unknown>
                if (typeof cfg.theme === 'string') theme = cfg.theme as Theme
                if (typeof cfg.look === 'string') look = cfg.look as Look
                const fc = cfg.flowchart as Record<string, unknown> | undefined
                if (typeof fc?.curve === 'string') curveStyle = fc.curve as CurveStyle
              } catch { /* ignore */ }
            }
          }
        }
        continue
      }

      // ── Flowchart header
      const headerMatch = line.match(/^flowchart\s+(TD|LR|BT|RL)/)
      if (headerMatch) {
        direction = headerMatch[1] as Direction
        foundHeader = true
        continue
      }

      if (!foundHeader) continue

      // ── Subgraph block
      if (line.startsWith('subgraph ')) {
        const m = line.match(/^subgraph\s+(\w+)(?:\s+\["([^"]*)"\])?/)
        if (m) {
          currentSubgraphId = m[1]
          const label = m[2] ?? m[1]
          nodesMap.set(currentSubgraphId, {
            ...makeNode(currentSubgraphId, label),
            data: { label, shape: 'rectangle', isSubgraph: true },
            style: { width: 320, height: 220 },
            zIndex: -1,
          })
        }
        continue
      }

      if (line === 'end') {
        currentSubgraphId = null
        continue
      }

      // ── style line
      if (line.startsWith('style ')) {
        const m = line.match(/^style\s+(\w+)\s+(.+)$/)
        if (m) {
          const [, nodeId, stylePart] = m
          const s: Partial<Pick<FlowNodeData, 'fillColor' | 'strokeColor' | 'textColor'>> = {}
          for (const part of stylePart.split(',')) {
            const sep = part.indexOf(':')
            if (sep < 0) continue
            const k = part.slice(0, sep).trim()
            const v = part.slice(sep + 1).trim()
            if (k === 'fill') s.fillColor = v
            else if (k === 'stroke') s.strokeColor = v
            else if (k === 'color') s.textColor = v
          }
          pendingStyles.set(nodeId, s)
        }
        continue
      }

      // ── linkStyle line
      if (line.startsWith('linkStyle ')) {
        const m = line.match(/^linkStyle\s+(\d+)\s+stroke:([^\s,]+)/)
        if (m) pendingLinkStyles.set(parseInt(m[1], 10), m[2])
        continue
      }

      // ── Edge line (try before node, since edges contain connector chars)
      const edgeData = tryParseEdge(line)
      if (edgeData) {
        edges.push({
          id: `edge_${edgeIdx++}`,
          source: edgeData.source,
          target: edgeData.target,
          type: 'flowEdge',
          label: edgeData.label,
          data: { edgeStyle: edgeData.edgeStyle, arrowType: edgeData.arrowType },
        })
        // Ensure referenced nodes exist (implicit node creation)
        if (!nodesMap.has(edgeData.source)) nodesMap.set(edgeData.source, makeNode(edgeData.source))
        if (!nodesMap.has(edgeData.target)) nodesMap.set(edgeData.target, makeNode(edgeData.target))
        continue
      }

      // ── Node declaration line
      const nodeData = tryParseNode(line)
      if (nodeData) {
        const node = makeNode(nodeData.id, nodeData.label, nodeData.shape)
        if (currentSubgraphId) {
          node.parentId = currentSubgraphId
          node.extent = 'parent'
        }
        nodesMap.set(nodeData.id, node)
      }
    }

    if (!foundHeader) {
      return { ...empty, error: 'No valid flowchart header found. Start with "flowchart TD" (or LR/BT/RL).' }
    }

    if (nodesMap.size === 0) {
      return { ...empty, error: 'No nodes found. Add at least one node.' }
    }

    // Apply pending node styles
    let nodes = [...nodesMap.values()].map((node) => {
      const style = pendingStyles.get(node.id)
      return style ? { ...node, data: { ...node.data, ...style } } : node
    })

    // Apply pending link styles
    edges.forEach((edge, i) => {
      const sc = pendingLinkStyles.get(i)
      if (sc) edge.data = { ...edge.data, strokeColor: sc } as FlowEdgeData
    })

    // Layout
    nodes = applyDagreLayout(nodes, edges, direction)

    return { nodes, edges, direction, theme, look, curveStyle, error: null }
  } catch (err) {
    return { ...empty, error: err instanceof Error ? err.message : 'Parse error' }
  }
}
