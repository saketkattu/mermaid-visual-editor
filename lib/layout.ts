import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@xyflow/react'
import type { Direction, FlowNodeData } from './store'

const NODE_WIDTH = 150
const NODE_HEIGHT = 60

const RANKDIR: Record<Direction, string> = {
  TD: 'TB',
  LR: 'LR',
  BT: 'BT',
  RL: 'RL',
}

export function applyDagreLayout(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  direction: Direction = 'TD'
): Node<FlowNodeData>[] {
  // Only layout top-level nodes — child nodes (inside subgraphs) keep relative positions
  const topLevelNodes = nodes.filter((n) => !n.parentId)

  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: RANKDIR[direction], nodesep: 60, ranksep: 80 })

  for (const node of topLevelNodes) {
    const w = typeof node.style?.width === 'number' ? node.style.width : NODE_WIDTH
    const h = typeof node.style?.height === 'number' ? node.style.height : NODE_HEIGHT
    g.setNode(node.id, { width: w, height: h })
  }

  const topLevelIds = new Set(topLevelNodes.map((n) => n.id))
  for (const edge of edges) {
    if (topLevelIds.has(edge.source) && topLevelIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target)
    }
  }

  dagre.layout(g)

  return nodes.map((node) => {
    // Child nodes: don't move (positions are relative to parent)
    if (node.parentId) return node

    const layout = g.node(node.id)
    if (!layout) return node

    const w = typeof node.style?.width === 'number' ? node.style.width : NODE_WIDTH
    const h = typeof node.style?.height === 'number' ? node.style.height : NODE_HEIGHT
    return {
      ...node,
      position: {
        x: layout.x - w / 2,
        y: layout.y - h / 2,
      },
    }
  })
}
