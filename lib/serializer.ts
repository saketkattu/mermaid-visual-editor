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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_')
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, "'")
}

/** Wrap a label in the correct Mermaid shape syntax for all 14 shapes */
function shapeWrap(id: string, label: string, shape: NodeShape): string {
  const sid = sanitizeId(id)
  const lbl = escapeLabel(label)
  switch (shape) {
    case 'rounded':
      return `${sid}("${lbl}")`
    case 'stadium':
      return `${sid}(["${lbl}"])`
    case 'subroutine':
      return `${sid}[["${lbl}"]]`
    case 'cylinder':
      return `${sid}[("${lbl}")]`
    case 'circle':
      return `${sid}(("${lbl}"))`
    case 'double-circle':
      return `${sid}((("${lbl}")))`
    case 'diamond':
      return `${sid}{"${lbl}"}`
    case 'hexagon':
      return `${sid}{{"${lbl}"}}`
    case 'parallelogram':
      return `${sid}[/"${lbl}"/]`
    case 'parallelogram-alt':
      // Backslash is the Mermaid shape delimiter → use String.raw to avoid escaping issues
      return String.raw`${sid}[\"${lbl}"\]`
    case 'trapezoid':
      return String.raw`${sid}[/"${lbl}"\]`
    case 'trapezoid-alt':
      return String.raw`${sid}[\"${lbl}"/]`
    case 'asymmetric':
      return `${sid}>"${lbl}"]`
    case 'rectangle':
    default:
      return `${sid}["${lbl}"]`
  }
}

/** Build the Mermaid edge connector string based on style and arrow type */
function edgeConnector(edgeStyle: EdgeStyle, arrowType: ArrowType): string {
  if (edgeStyle === 'dashed') {
    switch (arrowType) {
      case 'none':          return '-.-'
      case 'bidirectional': return '<-.->'
      case 'circle':        return '-.-o'
      case 'cross':         return '-.-x'
      default:              return '-.->'
    }
  }
  if (edgeStyle === 'thick') {
    switch (arrowType) {
      case 'none':          return '==='
      case 'bidirectional': return '<===>'
      default:              return '==>'
    }
  }
  // solid (default)
  switch (arrowType) {
    case 'none':          return '---'
    case 'bidirectional': return '<-->'
    case 'circle':        return '--o'
    case 'cross':         return '--x'
    default:              return '-->'
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface SerializeOptions {
  direction?: Direction
  theme?: Theme
  look?: Look
  curveStyle?: CurveStyle
}

export function serialize(
  nodes: Node<FlowNodeData>[],
  edges: Edge<FlowEdgeData>[],
  options: SerializeOptions = {}
): string {
  const { direction = 'TD', theme = 'default', look = 'classic', curveStyle = 'basis' } = options

  if (nodes.length === 0) {
    return `flowchart TD\n  %% Add nodes to get started`
  }

  const lines: string[] = []

  // ── Frontmatter for non-default settings ──────────────────────────────────
  const initConfig: Record<string, unknown> = {}
  if (theme !== 'default') initConfig.theme = theme
  if (look !== 'classic') initConfig.look = look
  if (curveStyle !== 'basis') initConfig.flowchart = { curve: curveStyle }

  if (Object.keys(initConfig).length > 0) {
    lines.push(`%%{ init: ${JSON.stringify(initConfig)} }%%`)
  }

  // ── Graph header ──────────────────────────────────────────────────────────
  lines.push(`flowchart ${direction}`)

  // ── Node declarations ─────────────────────────────────────────────────────
  for (const node of nodes) {
    const shape = (node.data.shape ?? 'rectangle') as NodeShape
    const label = node.data.label || node.id
    lines.push(`  ${shapeWrap(node.id, label, shape)}`)
  }

  // ── Node styles (only for custom-coloured nodes) ──────────────────────────
  for (const node of nodes) {
    const parts: string[] = []
    if (node.data.fillColor) parts.push(`fill:${node.data.fillColor}`)
    if (node.data.strokeColor) parts.push(`stroke:${node.data.strokeColor}`)
    if (node.data.textColor) parts.push(`color:${node.data.textColor}`)
    if (parts.length > 0) {
      lines.push(`  style ${sanitizeId(node.id)} ${parts.join(',')}`)
    }
  }

  // ── Edge declarations ─────────────────────────────────────────────────────
  for (const edge of edges) {
    const src = sanitizeId(edge.source)
    const tgt = sanitizeId(edge.target)
    const label = typeof edge.label === 'string' ? edge.label : undefined
    const edgeStyle = (edge.data?.edgeStyle as EdgeStyle) ?? 'solid'
    const arrowType = (edge.data?.arrowType as ArrowType) ?? 'arrow'
    const connector = edgeConnector(edgeStyle, arrowType)

    if (label?.trim()) {
      lines.push(`  ${src} ${connector}|"${escapeLabel(label)}"| ${tgt}`)
    } else {
      lines.push(`  ${src} ${connector} ${tgt}`)
    }
  }

  // ── Edge custom colours (linkStyle by index) ──────────────────────────────
  edges.forEach((edge, i) => {
    const strokeColor = edge.data?.strokeColor as string | undefined
    if (strokeColor) {
      lines.push(`  linkStyle ${i} stroke:${strokeColor}`)
    }
  })

  return lines.join('\n')
}
