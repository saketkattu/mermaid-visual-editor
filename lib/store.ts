import { create } from 'zustand'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type EdgeMarkerType,
  type Node,
  type NodeChange,
} from '@xyflow/react'

// ─── Node shape types ────────────────────────────────────────────────────────
export type NodeShape =
  | 'rectangle'
  | 'rounded'
  | 'stadium'
  | 'subroutine'
  | 'cylinder'
  | 'circle'
  | 'double-circle'
  | 'diamond'
  | 'hexagon'
  | 'parallelogram'
  | 'parallelogram-alt'
  | 'trapezoid'
  | 'trapezoid-alt'
  | 'asymmetric'

// ─── Edge style types ─────────────────────────────────────────────────────────
export type EdgeStyle = 'solid' | 'dashed' | 'thick'
export type ArrowType = 'arrow' | 'none' | 'bidirectional' | 'circle' | 'cross'

// ─── Diagram-level settings ───────────────────────────────────────────────────
export type Direction = 'TD' | 'LR' | 'BT' | 'RL'
export type Theme = 'default' | 'dark' | 'forest' | 'neutral' | 'base'
export type Look = 'classic' | 'handDrawn'
export type CurveStyle =
  | 'basis'
  | 'bumpX'
  | 'bumpY'
  | 'cardinal'
  | 'catmullRom'
  | 'linear'
  | 'monotoneX'
  | 'monotoneY'
  | 'natural'
  | 'step'
  | 'stepAfter'
  | 'stepBefore'

// ─── Data types ───────────────────────────────────────────────────────────────
export interface FlowNodeData extends Record<string, unknown> {
  label: string
  shape: NodeShape
  fillColor?: string
  strokeColor?: string
  textColor?: string
}

export interface FlowEdgeData extends Record<string, unknown> {
  edgeStyle?: EdgeStyle
  arrowType?: ArrowType
  strokeColor?: string
}

// ─── History snapshot ─────────────────────────────────────────────────────────
type Snapshot = {
  nodes: Node<FlowNodeData>[]
  edges: Edge<FlowEdgeData>[]
}

const MAX_HISTORY = 50
let nodeCounter = 1

// ─── Store interface ──────────────────────────────────────────────────────────
interface FlowState {
  nodes: Node<FlowNodeData>[]
  edges: Edge<FlowEdgeData>[]
  direction: Direction
  theme: Theme
  look: Look
  curveStyle: CurveStyle
  past: Snapshot[]
  future: Snapshot[]

  // React Flow change handlers
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void

  // Node operations
  addNode: (shape?: NodeShape) => void
  addNodeAtPosition: (position: { x: number; y: number }, shape?: NodeShape) => void
  updateNodeLabel: (id: string, label: string) => void
  updateNodeShape: (id: string, shape: NodeShape) => void
  updateNodeStyle: (
    id: string,
    style: Partial<Pick<FlowNodeData, 'fillColor' | 'strokeColor' | 'textColor'>>
  ) => void
  setNodes: (nodes: Node<FlowNodeData>[]) => void
  loadDiagram: (nodes: Node<FlowNodeData>[], edges: Edge<FlowEdgeData>[]) => void

  // Edge operations
  updateEdgeLabel: (id: string, label: string) => void
  updateEdgeType: (id: string, updates: Partial<FlowEdgeData>) => void

  // Diagram settings
  setDirection: (direction: Direction) => void
  setTheme: (theme: Theme) => void
  setLook: (look: Look) => void
  setCurveStyle: (curveStyle: CurveStyle) => void

  // History
  pushHistory: () => void
  undo: () => void
  redo: () => void

  // Selection operations
  duplicateSelected: () => void
}

// ─── Helper: compute edge markers based on arrowType ─────────────────────────
function computeMarkers(arrowType: ArrowType): {
  markerEnd?: EdgeMarkerType
  markerStart?: EdgeMarkerType
} {
  if (arrowType === 'none') return {}
  if (arrowType === 'bidirectional') {
    return {
      markerEnd: { type: MarkerType.ArrowClosed },
      markerStart: { type: MarkerType.ArrowClosed },
    }
  }
  return { markerEnd: { type: MarkerType.ArrowClosed } }
}

// ─── Store ────────────────────────────────────────────────────────────────────
export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],
  direction: 'TD',
  theme: 'default',
  look: 'classic',
  curveStyle: 'basis',
  past: [],
  future: [],

  pushHistory: () => {
    const { nodes, edges, past } = get()
    const snapshot: Snapshot = {
      nodes: nodes.map((n) => ({ ...n, data: { ...n.data } })),
      edges: edges.map((e) => ({ ...e, data: { ...(e.data ?? {}) } as FlowEdgeData })),
    }
    set({ past: [...past.slice(-(MAX_HISTORY - 1)), snapshot], future: [] })
  },

  undo: () => {
    const { past, nodes, edges, future } = get()
    if (past.length === 0) return
    const prev = past[past.length - 1]
    const current: Snapshot = { nodes, edges }
    set({
      nodes: prev.nodes,
      edges: prev.edges,
      past: past.slice(0, -1),
      future: [current, ...future.slice(0, MAX_HISTORY - 1)],
    })
  },

  redo: () => {
    const { past, nodes, edges, future } = get()
    if (future.length === 0) return
    const next = future[0]
    const current: Snapshot = { nodes, edges }
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past.slice(-(MAX_HISTORY - 1)), current],
      future: future.slice(1),
    })
  },

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<FlowNodeData>[] }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) as Edge<FlowEdgeData>[] }),

  onConnect: (connection) => {
    get().pushHistory()
    const markers = computeMarkers('arrow')
    set({
      edges: addEdge(
        { ...connection, type: 'flowEdge', ...markers, data: { edgeStyle: 'solid', arrowType: 'arrow' } },
        get().edges
      ) as Edge<FlowEdgeData>[],
    })
  },

  addNode: (shape: NodeShape = 'rectangle') => {
    get().pushHistory()
    const id = `node_${nodeCounter++}`
    const offset = (nodeCounter * 30) % 200
    const newNode: Node<FlowNodeData> = {
      id,
      type: 'flowNode',
      position: { x: 150 + offset, y: 100 + offset },
      data: { label: 'Node', shape },
    }
    set({ nodes: [...get().nodes, newNode] })
  },

  addNodeAtPosition: (position, shape: NodeShape = 'rectangle') => {
    get().pushHistory()
    const id = `node_${nodeCounter++}`
    const newNode: Node<FlowNodeData> = {
      id,
      type: 'flowNode',
      position,
      data: { label: 'Node', shape },
    }
    set({ nodes: [...get().nodes, newNode] })
  },

  updateNodeLabel: (id, label) => {
    get().pushHistory()
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n
      ),
    })
  },

  updateNodeShape: (id, shape) => {
    get().pushHistory()
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, shape } } : n
      ),
    })
  },

  updateNodeStyle: (id, style) => {
    get().pushHistory()
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...style } } : n
      ),
    })
  },

  updateEdgeLabel: (id, label) => {
    get().pushHistory()
    set({ edges: get().edges.map((e) => (e.id === id ? { ...e, label } : e)) })
  },

  updateEdgeType: (id, updates) => {
    get().pushHistory()
    const arrowType = updates.arrowType
    const markerUpdates = arrowType !== undefined ? computeMarkers(arrowType) : {}
    set({
      edges: get().edges.map((e) =>
        e.id === id
          ? { ...e, ...markerUpdates, data: { ...(e.data ?? {}), ...updates } as FlowEdgeData }
          : e
      ),
    })
  },

  setNodes: (nodes) => {
    get().pushHistory()
    set({ nodes })
  },

  loadDiagram: (nodes, edges) => {
    get().pushHistory()
    const stampedNodes = nodes.map((n) => ({ ...n, type: 'flowNode' }))
    const stampedEdges = edges.map((e) => ({ ...e, type: 'flowEdge' })) as Edge<FlowEdgeData>[]
    set({ nodes: stampedNodes, edges: stampedEdges })
  },

  setDirection: (direction) => set({ direction }),
  setTheme: (theme) => set({ theme }),
  setLook: (look) => set({ look }),
  setCurveStyle: (curveStyle) => set({ curveStyle }),

  duplicateSelected: () => {
    const { nodes, edges } = get()
    const selectedNodes = nodes.filter((n) => n.selected)
    if (selectedNodes.length === 0) return
    get().pushHistory()
    const idMap = new Map<string, string>()
    const newNodes = selectedNodes.map((n) => {
      const newId = `node_${nodeCounter++}`
      idMap.set(n.id, newId)
      return {
        ...n,
        id: newId,
        position: { x: n.position.x + 30, y: n.position.y + 30 },
        selected: true,
      }
    })
    const selectedIds = new Set(selectedNodes.map((n) => n.id))
    const newEdges = edges
      .filter((e) => selectedIds.has(e.source) && selectedIds.has(e.target))
      .map((e) => ({
        ...e,
        id: `edge_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
      }))
    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      edges: [...edges, ...newEdges],
    })
  },
}))
