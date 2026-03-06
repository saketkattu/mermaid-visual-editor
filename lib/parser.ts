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
// Parses a node suffix like [label], (label), {label}, etc.
// Supports both quoted ("label") and unquoted (label) forms.

function parseNodeSuffix(suffix: string): { shape: NodeShape; label: string } | null {
  let m: RegExpMatchArray | null

  // double-circle: ((("label"))) or (((label)))
  m = suffix.match(/^\({3}"?([^"()]*)"?\){3}$/)
  if (m) return { shape: 'double-circle', label: m[1] }

  // stadium: (["label"]) or ([label])
  m = suffix.match(/^\(\["?([^"\]]*)"?\]\)$/)
  if (m) return { shape: 'stadium', label: m[1] }

  // circle: (("label")) or ((label))
  m = suffix.match(/^\({2}"?([^"()]*)"?\){2}$/)
  if (m) return { shape: 'circle', label: m[1] }

  // rounded: ("label") or (label)
  m = suffix.match(/^\("?([^"()]*)"?\)$/)
  if (m) return { shape: 'rounded', label: m[1] }

  // subroutine: [["label"]] or [[label]]
  m = suffix.match(/^\[\["?([^"\]]*)"?\]\]$/)
  if (m) return { shape: 'subroutine', label: m[1] }

  // cylinder: [("label")] or [(label)]
  m = suffix.match(/^\[\("?([^"()]*)"?\)\]$/)
  if (m) return { shape: 'cylinder', label: m[1] }

  // hexagon: {{"label"}} or {{label}}
  m = suffix.match(/^\{\{"?([^"{}]*)"?\}\}$/)
  if (m) return { shape: 'hexagon', label: m[1] }

  // diamond: {"label"} or {label}
  m = suffix.match(/^\{"?([^"{}]*)"?\}$/)
  if (m) return { shape: 'diamond', label: m[1] }

  // parallelogram: [/"label"/] or [/label/]
  if (suffix.startsWith('[/"') || suffix.startsWith('[/')) {
    m = suffix.match(/^\[\/"?([^"]*)"?\/\]$/)
    if (m) return { shape: 'parallelogram', label: m[1] }
  }

  // trapezoid: [/"label"\] or [/label\]
  if (suffix.startsWith('[/') && suffix.endsWith('\\]')) {
    m = suffix.match(/^\[\/"?([^"]*)"?\\\]$/)
    if (m) return { shape: 'trapezoid', label: m[1] }
  }

  // parallelogram-alt: [\"label"\] or [\label\]
  if (suffix.startsWith('[\\') && suffix.endsWith('\\]')) {
    m = suffix.match(/^\[\\"?([^"]*)"?\\\]$/)
    if (m) return { shape: 'parallelogram-alt', label: m[1] }
  }

  // trapezoid-alt: [\"label"/] or [\label/]
  if (suffix.startsWith('[\\') && suffix.endsWith('/]')) {
    m = suffix.match(/^\[\\"?([^"]*)"?\/\]$/)
    if (m) return { shape: 'trapezoid-alt', label: m[1] }
  }

  // asymmetric: >"label"] or >label]
  m = suffix.match(/^>"?([^"\]]*)"?\]$/)
  if (m) return { shape: 'asymmetric', label: m[1] }

  // rectangle: ["label"] or [label]
  m = suffix.match(/^\["?([^"\]]*)"?\]$/)
  if (m) return { shape: 'rectangle', label: m[1] }

  return null
}

// ─── Extract a node reference from the start of a string ─────────────────────
// Returns the node ID, its shape/label, and the remaining string after the node.
// Handles: ID[label], ID(label), ID{label}, ID((label)), ID>label], etc.
// Also handles bare IDs like: ID

interface NodeRef {
  id: string
  label: string
  shape: NodeShape
  rest: string
}

function extractNodeRef(str: string): NodeRef | null {
  str = str.trim()

  // Match the node ID (word characters)
  const idMatch = str.match(/^(\w+)/)
  if (!idMatch) return null

  const id = idMatch[1]
  let after = str.slice(id.length)

  // If there's no shape suffix, it's a bare ID
  if (!after || /^\s/.test(after[0])) {
    return { id, label: id, shape: 'rectangle', rest: after }
  }

  // Try to find the matching closing bracket for the shape
  const shapeStr = extractBalancedShape(after)
  if (shapeStr) {
    const parsed = parseNodeSuffix(shapeStr)
    if (parsed) {
      return {
        id,
        label: parsed.label,
        shape: parsed.shape,
        rest: after.slice(shapeStr.length),
      }
    }
  }

  // If we can't parse the shape, treat as bare ID
  return { id, label: id, shape: 'rectangle', rest: after }
}

// Extract a balanced bracket expression from the start of a string.
// Handles nested brackets like (([label])), {label}, etc.
function extractBalancedShape(str: string): string | null {
  if (!str) return null

  const open = str[0]
  let closeChar: string
  if (open === '[') closeChar = ']'
  else if (open === '(') closeChar = ')'
  else if (open === '{') closeChar = '}'
  else if (open === '>') closeChar = ']'
  else return null

  // For '>' asymmetric shape, just find the closing ']'
  if (open === '>') {
    const closeIdx = str.indexOf(']')
    if (closeIdx < 0) return null
    return str.slice(0, closeIdx + 1)
  }

  const brackets: Record<string, string> = { '[': ']', '(': ')', '{': '}' }
  const stack: string[] = []
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (ch in brackets) {
      stack.push(brackets[ch])
    } else if (ch === closeChar || ch === ']' || ch === ')' || ch === '}') {
      if (stack.length > 0 && stack[stack.length - 1] === ch) {
        stack.pop()
        if (stack.length === 0) {
          return str.slice(0, i + 1)
        }
      } else {
        return null
      }
    }
  }
  return null
}

// ─── Edge connector matching ─────────────────────────────────────────────────

const CONNECTORS: { pattern: RegExp; edgeStyle: EdgeStyle; arrowType: ArrowType }[] = [
  // Dashed with arrows (longer patterns first)
  { pattern: /^<-\.->/, edgeStyle: 'dashed', arrowType: 'bidirectional' },
  { pattern: /^-\.->/, edgeStyle: 'dashed', arrowType: 'arrow' },
  { pattern: /^-\.-o/, edgeStyle: 'dashed', arrowType: 'circle' },
  { pattern: /^-\.-x/, edgeStyle: 'dashed', arrowType: 'cross' },
  { pattern: /^-\.-/, edgeStyle: 'dashed', arrowType: 'none' },
  // Thick
  { pattern: /^<===>/, edgeStyle: 'thick', arrowType: 'bidirectional' },
  { pattern: /^==>/, edgeStyle: 'thick', arrowType: 'arrow' },
  { pattern: /^===/, edgeStyle: 'thick', arrowType: 'none' },
  // Solid
  { pattern: /^<-->/, edgeStyle: 'solid', arrowType: 'bidirectional' },
  { pattern: /^-->/, edgeStyle: 'solid', arrowType: 'arrow' },
  { pattern: /^--o/, edgeStyle: 'solid', arrowType: 'circle' },
  { pattern: /^--x/, edgeStyle: 'solid', arrowType: 'cross' },
  { pattern: /^---/, edgeStyle: 'solid', arrowType: 'none' },
]

interface ConnectorMatch {
  edgeStyle: EdgeStyle
  arrowType: ArrowType
  label?: string
  rest: string
}

function matchConnector(str: string): ConnectorMatch | null {
  str = str.trim()

  // First try: -- label --> pattern (solid arrow with inline label)
  // Matches: -- text -->, -- text ---, etc.
  const dashLabelMatch = str.match(/^--\s+(.+?)\s+(-->|---|--o|--x|<-->)(.*)$/)
  if (dashLabelMatch) {
    const [, label, conn, rest] = dashLabelMatch
    for (const c of CONNECTORS) {
      if (c.pattern.test(conn)) {
        return { edgeStyle: c.edgeStyle, arrowType: c.arrowType, label, rest }
      }
    }
  }

  // Try: == label ==> pattern (thick with inline label)
  const thickLabelMatch = str.match(/^==\s+(.+?)\s+(==>|===|<===>)(.*)$/)
  if (thickLabelMatch) {
    const [, label, conn, rest] = thickLabelMatch
    for (const c of CONNECTORS) {
      if (c.pattern.test(conn)) {
        return { edgeStyle: c.edgeStyle, arrowType: c.arrowType, label, rest }
      }
    }
  }

  // Try: -. label .-> pattern (dashed with inline label)
  const dashedLabelMatch = str.match(/^-\.\s+(.+?)\s+\.->(.*)$/)
  if (dashedLabelMatch) {
    const [, label, rest] = dashedLabelMatch
    return { edgeStyle: 'dashed', arrowType: 'arrow', label, rest }
  }

  // Try connector with |label| or |"label"| suffix
  for (const c of CONNECTORS) {
    const m = str.match(c.pattern)
    if (m) {
      let rest = str.slice(m[0].length)
      // Check for |label| or |"label"| after connector
      const labelMatch = rest.match(/^\|"?([^"|]*)"?\|(.*)$/)
      if (labelMatch) {
        return { edgeStyle: c.edgeStyle, arrowType: c.arrowType, label: labelMatch[1], rest: labelMatch[2] }
      }
      return { edgeStyle: c.edgeStyle, arrowType: c.arrowType, rest }
    }
  }

  return null
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

    // Helper to register a node from a NodeRef
    const registerNode = (ref: NodeRef) => {
      if (!nodesMap.has(ref.id)) {
        const node = makeNode(ref.id, ref.label, ref.shape)
        if (currentSubgraphId) {
          node.parentId = currentSubgraphId
          node.extent = 'parent'
        }
        nodesMap.set(ref.id, node)
      }
    }

    for (const line of lines) {
      // ── Comment lines (%%): skip unless init directive
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
        const m = line.match(/^subgraph\s+(\w+)(?:\s+\["?([^"\]]*)"?\])?/)
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

      // ── Parse line as a chain of: NodeRef (connector NodeRef)*
      // This handles both standalone node declarations and edge lines
      // including inline node definitions like: A[label] --> B[label] --> C{decision}
      const firstNode = extractNodeRef(line)
      if (!firstNode) continue

      registerNode(firstNode)

      let remaining = firstNode.rest
      let prevNodeId = firstNode.id

      // Try to parse a chain of edges
      while (remaining.trim()) {
        const conn = matchConnector(remaining)
        if (!conn) break

        const targetRef = extractNodeRef(conn.rest)
        if (!targetRef) break

        registerNode(targetRef)

        edges.push({
          id: `edge_${edgeIdx++}`,
          source: prevNodeId,
          target: targetRef.id,
          type: 'flowEdge',
          label: conn.label,
          data: { edgeStyle: conn.edgeStyle, arrowType: conn.arrowType },
        })

        prevNodeId = targetRef.id
        remaining = targetRef.rest
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
