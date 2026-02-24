'use client'

import { useState } from 'react'
import { useFlowStore, type NodeShape } from '@/lib/store'
import { serialize } from '@/lib/serializer'
import { applyDagreLayout } from '@/lib/layout'
import { downloadMmd, saveDiagramJson, loadDiagramJson } from '@/lib/fileio'

interface ToolbarProps {
  onTogglePreview: () => void
  previewOpen: boolean
}

const SHAPES: { shape: NodeShape; label: string; icon: string }[] = [
  { shape: 'rectangle', label: 'Rectangle', icon: '▭' },
  { shape: 'rounded', label: 'Rounded', icon: '▬' },
  { shape: 'diamond', label: 'Diamond', icon: '◇' },
  { shape: 'circle', label: 'Circle', icon: '○' },
]

export function Toolbar({ onTogglePreview, previewOpen }: ToolbarProps) {
  const { addNode, nodes, edges, updateNodeShape, setNodes, loadDiagram } = useFlowStore()
  const [activeShape, setActiveShape] = useState<NodeShape>('rectangle')
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const selectedNodes = nodes.filter((n) => n.selected)
  const hasSelection = selectedNodes.length > 0
  const displayShape =
    selectedNodes.length === 1 ? selectedNodes[0].data.shape : activeShape

  const handleShapeClick = (shape: NodeShape) => {
    setActiveShape(shape)
    if (hasSelection) selectedNodes.forEach((n) => updateNodeShape(n.id, shape))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(serialize(nodes, edges))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAutoLayout = () => {
    if (nodes.length === 0) return
    setNodes(applyDagreLayout(nodes, edges))
  }

  const handleLoad = async () => {
    try {
      setLoadError(null)
      const { nodes: n, edges: e } = await loadDiagramJson()
      loadDiagram(n, e)
    } catch (err) {
      if (err instanceof Error && err.message !== 'No file selected') {
        setLoadError('Invalid file')
        setTimeout(() => setLoadError(null), 3000)
      }
    }
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-white border-b border-gray-200 shadow-sm z-10 flex-wrap">

      {/* Shape picker */}
      <div className="flex items-center gap-1 border border-gray-200 rounded-md p-1">
        {SHAPES.map(({ shape, label, icon }) => (
          <button
            key={shape}
            title={hasSelection ? `Change selected to ${label}` : label}
            onClick={() => handleShapeClick(shape)}
            className={[
              'w-8 h-8 rounded flex items-center justify-center text-base transition-colors',
              displayShape === shape
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-500 hover:bg-gray-100',
            ].join(' ')}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Add Node */}
      <button
        onClick={() => addNode(activeShape)}
        className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        title="Add node (N)"
      >
        + Add Node
      </button>

      {/* Auto Layout */}
      <button
        onClick={handleAutoLayout}
        disabled={nodes.length === 0}
        className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Auto-arrange nodes top-to-bottom"
      >
        ⬡ Auto Layout
      </button>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Load JSON */}
      <button
        onClick={handleLoad}
        className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
        title="Load diagram from .json file"
      >
        {loadError ?? 'Load'}
      </button>

      {/* Save JSON */}
      <button
        onClick={() => saveDiagramJson(nodes, edges)}
        disabled={nodes.length === 0}
        className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Save diagram as .json"
      >
        Save
      </button>

      {/* Download .mmd */}
      <button
        onClick={() => downloadMmd(nodes, edges)}
        disabled={nodes.length === 0}
        className="px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        title="Download as .mmd file"
      >
        ↓ .mmd
      </button>

      <div className="flex-1" />

      {/* Help hint */}
      <span className="text-xs text-gray-400 hidden lg:block">
        Double-click canvas or press <kbd className="px-1 rounded bg-gray-100 font-mono">N</kbd> to add · Double-click node/edge to rename
      </span>

      <div className="w-px h-6 bg-gray-200 mx-1" />

      {/* Toggle Preview */}
      <button
        onClick={onTogglePreview}
        className={[
          'px-3 py-1.5 text-sm font-medium rounded-md border transition-colors',
          previewOpen
            ? 'bg-gray-100 border-gray-300 text-gray-700'
            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
        ].join(' ')}
      >
        {previewOpen ? 'Hide Preview' : 'Show Preview'}
      </button>

      {/* Copy Syntax */}
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-900 transition-colors min-w-[120px]"
      >
        {copied ? '✓ Copied!' : 'Copy Syntax'}
      </button>
    </div>
  )
}
