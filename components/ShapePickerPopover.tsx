'use client'

import { useEffect, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFlowStore, type NodeShape } from '@/lib/store'
import { ShapeIcon, ALL_SHAPES } from '@/components/ShapeIcons'

interface ShapePickerPopoverProps {
  onClose: () => void
}

const NEU_BG = 'var(--neu-bg)'

export function ShapePickerPopover({ onClose }: ShapePickerPopoverProps) {
  const ref = useRef<HTMLDivElement>(null)

  const { drawingShape, setDrawingShape, updateNodeShape } = useFlowStore(
    useShallow((s) => ({
      drawingShape: s.drawingShape,
      setDrawingShape: s.setDrawingShape,
      updateNodeShape: s.updateNodeShape,
    }))
  )

  const selectedNodes = useFlowStore(useShallow((s) => s.nodes.filter((n) => n.selected)))
  const hasNodeSelection = selectedNodes.length > 0

  const displayShape: NodeShape =
    selectedNodes.length === 1 ? selectedNodes[0].data.shape : (drawingShape ?? 'rectangle')

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.addEventListener('mousedown', handleClick)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.removeEventListener('mousedown', handleClick)
    }
  }, [onClose])

  const handleShapeClick = (shape: NodeShape) => {
    if (hasNodeSelection) {
      selectedNodes.forEach((n) => updateNodeShape(n.id, shape))
    } else {
      setDrawingShape(shape)
      onClose()
    }
  }

  const rows = [ALL_SHAPES.slice(0, 7), ALL_SHAPES.slice(7)]

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 'calc(100% + 8px)',
        left: '50%',
        transform: 'translateX(-50%)',
        background: NEU_BG,
        borderRadius: 20,
        boxShadow: 'var(--neu-shadow-raised)',
        padding: '16px',
        zIndex: 50,
        minWidth: 320,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', marginBottom: 10, textTransform: 'uppercase' }}>
        {hasNodeSelection ? 'Change Shape' : 'Draw Shape'}
      </div>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 6, marginBottom: ri === 0 ? 6 : 0 }}>
          {row.map(({ shape, label }) => {
            const isActive = hasNodeSelection
              ? selectedNodes.every((n) => n.data.shape === shape)
              : drawingShape === shape || (!drawingShape && displayShape === shape)
            return (
              <button
                key={shape}
                title={label}
                aria-label={label}
                onClick={() => handleShapeClick(shape)}
                style={{
                  width: 36,
                  height: 32,
                  borderRadius: 10,
                  border: 'none',
                  background: NEU_BG,
                  boxShadow: isActive ? 'var(--neu-shadow-inset)' : 'var(--neu-shadow-raised)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.15s',
                  color: isActive ? '#4F46E5' : '#6b7280',
                }}
              >
                <ShapeIcon shape={shape} stroke={isActive ? '#4F46E5' : '#6b7280'} />
              </button>
            )
          })}
        </div>
      ))}
      {!hasNodeSelection && drawingShape && (
        <div style={{ marginTop: 10, fontSize: 11, color: '#4F46E5', textAlign: 'center' }}>
          Click &amp; drag on canvas to draw — Esc to cancel
        </div>
      )}
    </div>
  )
}
