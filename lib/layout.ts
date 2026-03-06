import dagre from '@dagrejs/dagre'
import type { Edge, Node } from '@xyflow/react'
import type { Direction, FlowNodeData } from './store'

const NODE_WIDTH = 150
const NODE_HEIGHT = 60

const SUBGRAPH_PADDING_TOP = 40
const SUBGRAPH_PADDING_X = 20
const SUBGRAPH_PADDING_BOTTOM = 20

const RANKDIR: Record<Direction, string> = {
  TD: 'TB',
  LR: 'LR',
  BT: 'BT',
  RL: 'RL',
}

function nodeSize(node: Node<FlowNodeData>): { w: number; h: number } {
  return {
    w: typeof node.style?.width === 'number' ? node.style.width : NODE_WIDTH,
    h: typeof node.style?.height === 'number' ? node.style.height : NODE_HEIGHT,
  }
}

export function applyDagreLayout(
  nodes: Node<FlowNodeData>[],
  edges: Edge[],
  direction: Direction = 'TD'
): Node<FlowNodeData>[] {
  if (nodes.length === 0) return nodes

  // Build lookup maps
  const nodeById = new Map(nodes.map((n) => [n.id, n]))
  const childrenByParent = new Map<string, Node<FlowNodeData>[]>()
  const topLevelNodes: Node<FlowNodeData>[] = []

  for (const node of nodes) {
    if (node.parentId) {
      const list = childrenByParent.get(node.parentId) ?? []
      list.push(node)
      childrenByParent.set(node.parentId, list)
    } else {
      topLevelNodes.push(node)
    }
  }

  // Map each node to its effective top-level ID (itself or its parent subgraph)
  const toTopLevel = (id: string): string => {
    const node = nodeById.get(id)
    return node?.parentId ?? id
  }

  // ── Pass 1: Layout children within each subgraph ──────────────────────────
  const subgraphSizes = new Map<string, { width: number; height: number }>()
  const childPositions = new Map<string, { x: number; y: number }>()

  for (const [parentId, children] of childrenByParent) {
    const childIds = new Set(children.map((c) => c.id))

    const g = new dagre.graphlib.Graph()
    g.setDefaultEdgeLabel(() => ({}))
    g.setGraph({ rankdir: RANKDIR[direction], nodesep: 50, ranksep: 60 })

    for (const child of children) {
      const { w, h } = nodeSize(child)
      g.setNode(child.id, { width: w, height: h })
    }

    // Add edges between children of this subgraph
    for (const edge of edges) {
      if (childIds.has(edge.source) && childIds.has(edge.target)) {
        g.setEdge(edge.source, edge.target)
      }
    }

    dagre.layout(g)

    // Compute bounding box of laid-out children
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    for (const child of children) {
      const layout = g.node(child.id)
      if (!layout) continue
      const { w, h } = nodeSize(child)
      const left = layout.x - w / 2
      const top = layout.y - h / 2
      minX = Math.min(minX, left)
      minY = Math.min(minY, top)
      maxX = Math.max(maxX, left + w)
      maxY = Math.max(maxY, top + h)
    }

    // Store child positions relative to subgraph (with padding offset)
    for (const child of children) {
      const layout = g.node(child.id)
      if (!layout) continue
      const { w, h } = nodeSize(child)
      childPositions.set(child.id, {
        x: layout.x - w / 2 - minX + SUBGRAPH_PADDING_X,
        y: layout.y - h / 2 - minY + SUBGRAPH_PADDING_TOP,
      })
    }

    // Compute subgraph size to fit all children + padding
    const contentWidth = maxX - minX
    const contentHeight = maxY - minY
    subgraphSizes.set(parentId, {
      width: Math.max(200, contentWidth + SUBGRAPH_PADDING_X * 2),
      height: Math.max(120, contentHeight + SUBGRAPH_PADDING_TOP + SUBGRAPH_PADDING_BOTTOM),
    })
  }

  // ── Pass 2: Layout top-level nodes with computed subgraph sizes ───────────
  const g = new dagre.graphlib.Graph()
  g.setDefaultEdgeLabel(() => ({}))
  g.setGraph({ rankdir: RANKDIR[direction], nodesep: 60, ranksep: 80 })

  for (const node of topLevelNodes) {
    const sgSize = subgraphSizes.get(node.id)
    if (sgSize) {
      g.setNode(node.id, { width: sgSize.width, height: sgSize.height })
    } else {
      const { w, h } = nodeSize(node)
      g.setNode(node.id, { width: w, height: h })
    }
  }

  // Add edges: map child endpoints to their parent subgraph for cross-boundary edges
  const topLevelIds = new Set(topLevelNodes.map((n) => n.id))
  const addedEdges = new Set<string>()
  for (const edge of edges) {
    const src = toTopLevel(edge.source)
    const tgt = toTopLevel(edge.target)
    // Skip self-edges (both endpoints in same subgraph) and missing nodes
    if (src === tgt) continue
    if (!topLevelIds.has(src) || !topLevelIds.has(tgt)) continue
    const key = `${src}->${tgt}`
    if (addedEdges.has(key)) continue
    addedEdges.add(key)
    g.setEdge(src, tgt)
  }

  dagre.layout(g)

  // ── Assemble final positions ──────────────────────────────────────────────
  return nodes.map((node) => {
    // Child nodes: use positions computed in Pass 1
    if (node.parentId) {
      const pos = childPositions.get(node.id)
      if (!pos) return node
      return { ...node, position: pos }
    }

    // Top-level nodes
    const layout = g.node(node.id)
    if (!layout) return node

    const sgSize = subgraphSizes.get(node.id)
    const w = sgSize?.width ?? nodeSize(node).w
    const h = sgSize?.height ?? nodeSize(node).h

    const updated = {
      ...node,
      position: {
        x: layout.x - w / 2,
        y: layout.y - h / 2,
      },
    }

    // Update subgraph style dimensions
    if (sgSize) {
      updated.style = { ...node.style, width: sgSize.width, height: sgSize.height }
    }

    return updated
  })
}
