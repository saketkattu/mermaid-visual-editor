import type { Edge, Node } from '@xyflow/react'
import type { FlowNodeData, NodeShape } from './store'

/** Sanitize a node ID so it's a valid Mermaid identifier (alphanumeric + underscore) */
function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_]/g, '_')
}

/** Escape label text for Mermaid — quotes inside labels need to be handled */
function escapeLabel(label: string): string {
  return label.replace(/"/g, "'")
}

/** Wrap a label in the correct Mermaid shape syntax */
function shapeWrap(id: string, label: string, shape: NodeShape): string {
  const safeId = sanitizeId(id)
  const safeLabel = escapeLabel(label)
  switch (shape) {
    case 'rounded':
      return `${safeId}("${safeLabel}")`
    case 'diamond':
      return `${safeId}{"${safeLabel}"}`
    case 'circle':
      return `${safeId}(("${safeLabel}"))`
    case 'rectangle':
    default:
      return `${safeId}["${safeLabel}"]`
  }
}

export function serialize(nodes: Node<FlowNodeData>[], edges: Edge[]): string {
  if (nodes.length === 0) return 'graph TD\n  %% Add nodes to get started'

  const lines: string[] = ['graph TD']

  // Node declarations
  for (const node of nodes) {
    const shape = node.data.shape ?? 'rectangle'
    const label = node.data.label || node.id
    lines.push(`  ${shapeWrap(node.id, label, shape)}`)
  }

  // Edge declarations
  for (const edge of edges) {
    const src = sanitizeId(edge.source)
    const tgt = sanitizeId(edge.target)
    const label = edge.label as string | undefined
    if (label && label.trim()) {
      lines.push(`  ${src} -->|"${escapeLabel(label)}"| ${tgt}`)
    } else {
      lines.push(`  ${src} --> ${tgt}`)
    }
  }

  return lines.join('\n')
}
