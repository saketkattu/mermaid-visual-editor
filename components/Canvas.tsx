'use client'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEffect, type MouseEvent } from 'react'

import { useFlowStore } from '@/lib/store'
import { FlowNode } from './NodeTypes/FlowNode'
import { FlowEdge } from './EdgeTypes/FlowEdge'

const nodeTypes = { flowNode: FlowNode }
const edgeTypes = { flowEdge: FlowEdge }

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, addNodeAtPosition } =
    useFlowStore()
  const { screenToFlowPosition } = useReactFlow()

  // N key → add node at canvas center (only when not typing in an input)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return
      if (e.key === 'n' || e.key === 'N') {
        addNode()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [addNode])

  // Double-click on empty canvas pane → add node at click position
  const handleDoubleClick = (e: MouseEvent) => {
    // Ignore double-clicks on nodes, edges, or controls
    const target = e.target as Element
    if (target.closest('.react-flow__node') || target.closest('.react-flow__edge')) return
    if (target.closest('.react-flow__controls') || target.closest('.react-flow__minimap')) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNodeAtPosition(position)
  }

  return (
    <div className="flex-1 relative" onDoubleClick={handleDoubleClick}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-gray-50"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
        <Controls />
        <MiniMap nodeStrokeWidth={3} zoomable pannable />
      </ReactFlow>

      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <p className="text-lg font-medium">Canvas is empty</p>
            <p className="text-sm mt-1">
              Double-click canvas or press <kbd className="px-1 py-0.5 rounded bg-gray-100 text-gray-500 text-xs font-mono">N</kbd> to add a node
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// CanvasInner needs to be inside ReactFlowProvider — exported wrapper stays clean
export function Canvas() {
  return <CanvasInner />
}
