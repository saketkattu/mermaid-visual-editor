import { create } from 'zustand'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'

export type NodeShape = 'rectangle' | 'rounded' | 'diamond' | 'circle'

export interface FlowNodeData extends Record<string, unknown> {
  label: string
  shape: NodeShape
}

let nodeCounter = 1

interface FlowState {
  nodes: Node<FlowNodeData>[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (shape?: NodeShape) => void
  addNodeAtPosition: (position: { x: number; y: number }, shape?: NodeShape) => void
  updateNodeLabel: (id: string, label: string) => void
  updateNodeShape: (id: string, shape: NodeShape) => void
  updateEdgeLabel: (id: string, label: string) => void
  setNodes: (nodes: Node<FlowNodeData>[]) => void
  loadDiagram: (nodes: Node<FlowNodeData>[], edges: Edge[]) => void
}

export const useFlowStore = create<FlowState>((set, get) => ({
  nodes: [],
  edges: [],

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) as Node<FlowNodeData>[] }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (connection) =>
    set({ edges: addEdge({ ...connection, type: 'flowEdge' }, get().edges) }),

  addNode: (shape: NodeShape = 'rectangle') => {
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
    const id = `node_${nodeCounter++}`
    const newNode: Node<FlowNodeData> = {
      id,
      type: 'flowNode',
      position,
      data: { label: 'Node', shape },
    }
    set({ nodes: [...get().nodes, newNode] })
  },

  updateNodeLabel: (id, label) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, label } } : n
      ),
    }),

  updateNodeShape: (id, shape) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, shape } } : n
      ),
    }),

  updateEdgeLabel: (id, label) =>
    set({
      edges: get().edges.map((e) =>
        e.id === id ? { ...e, label } : e
      ),
    }),

  setNodes: (nodes) => set({ nodes }),

  loadDiagram: (nodes, edges) => {
    // Re-stamp node/edge types so custom components are used after load
    const stampedNodes = nodes.map((n) => ({ ...n, type: 'flowNode' }))
    const stampedEdges = edges.map((e) => ({ ...e, type: 'flowEdge' }))
    set({ nodes: stampedNodes, edges: stampedEdges })
  },
}))
