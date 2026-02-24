'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useCallback, useRef, useState } from 'react'
import { useFlowStore, type FlowNodeData } from '@/lib/store'

const shapeClasses: Record<string, string> = {
  rectangle: 'rounded-md',
  rounded: 'rounded-full px-5',
  diamond: 'rotate-45',
  circle: 'rounded-full aspect-square',
}

const labelClasses: Record<string, string> = {
  diamond: '-rotate-45',
}

export function FlowNode({ id, data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(nodeData.label)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel)

  const commitLabel = useCallback(() => {
    const trimmed = draft.trim() || 'Node'
    updateNodeLabel(id, trimmed)
    setEditing(false)
  }, [draft, id, updateNodeLabel])

  const handleDoubleClick = useCallback(() => {
    setDraft(nodeData.label)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [nodeData.label])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') commitLabel()
      if (e.key === 'Escape') setEditing(false)
    },
    [commitLabel]
  )

  const shape = nodeData.shape ?? 'rectangle'
  const isCircleOrDiamond = shape === 'circle' || shape === 'diamond'
  const minW = isCircleOrDiamond ? 'min-w-[80px] min-h-[80px]' : 'min-w-[100px]'

  return (
    <div
      onDoubleClick={handleDoubleClick}
      className={[
        'relative flex items-center justify-center px-4 py-2 cursor-pointer select-none',
        'bg-white border-2 text-sm font-medium text-gray-800',
        selected ? 'border-blue-500 shadow-md' : 'border-gray-300',
        shapeClasses[shape],
        minW,
      ].join(' ')}
      style={{ minHeight: shape === 'circle' ? 80 : undefined }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />

      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitLabel}
          onKeyDown={handleKeyDown}
          className={[
            'bg-transparent border-none outline-none text-center text-sm w-full',
            labelClasses[shape] ?? '',
          ].join(' ')}
          autoFocus
        />
      ) : (
        <span className={['text-center break-all', labelClasses[shape] ?? ''].join(' ')}>
          {nodeData.label}
        </span>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}
