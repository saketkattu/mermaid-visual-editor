'use client'

import { useReactFlow } from '@xyflow/react'
import { useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFlowStore } from '@/lib/store'

const NEU_BG = 'var(--neu-bg)'

function ZoomBtn({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void
  title: string
  disabled?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      disabled={disabled}
      style={{
        background: NEU_BG,
        border: 'none',
        borderRadius: 10,
        boxShadow: 'var(--neu-shadow-raised)',
        width: 32,
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        color: '#6B7280',
        fontSize: 16,
        fontWeight: 500,
        transition: 'box-shadow 0.15s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

const IconUndo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
)

const IconRedo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 14 20 9 15 4" />
    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
  </svg>
)

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow()
  const [zoom, setZoom] = useState<number | null>(null)
  const { undo, redo } = useFlowStore(useShallow((s) => ({ undo: s.undo, redo: s.redo })))
  const pastLength = useFlowStore((s) => s.past.length)
  const futureLength = useFlowStore((s) => s.future.length)

  const handleZoomIn = () => {
    zoomIn()
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 100)
  }

  const handleZoomOut = () => {
    zoomOut()
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 100)
  }

  const handleFit = () => {
    fitView({ duration: 400, padding: 0.1 })
    setTimeout(() => setZoom(Math.round(getZoom() * 100)), 500)
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 24,
        left: 20,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        background: NEU_BG,
        borderRadius: 50,
        boxShadow: 'var(--neu-shadow-raised)',
        padding: '6px 10px',
        pointerEvents: 'auto',
        zIndex: 10,
      }}
    >
      <ZoomBtn onClick={undo} title="Undo (Ctrl+Z)" disabled={pastLength === 0}>
        <IconUndo />
      </ZoomBtn>
      <ZoomBtn onClick={redo} title="Redo (Ctrl+Shift+Z)" disabled={futureLength === 0}>
        <IconRedo />
      </ZoomBtn>

      <div style={{ width: 1, height: 16, background: 'rgba(163,177,198,0.4)', margin: '0 2px', flexShrink: 0 }} />

      <ZoomBtn onClick={handleZoomOut} title="Zoom out">−</ZoomBtn>

      <button
        onClick={handleFit}
        title="Fit view"
        style={{
          background: NEU_BG,
          border: 'none',
          borderRadius: 8,
          boxShadow: 'var(--neu-shadow-concave)',
          padding: '4px 10px',
          fontSize: 11,
          fontWeight: 600,
          color: '#6B7280',
          cursor: 'pointer',
          minWidth: 44,
          textAlign: 'center',
        }}
      >
        {zoom !== null ? `${zoom}%` : 'Fit'}
      </button>

      <ZoomBtn onClick={handleZoomIn} title="Zoom in">+</ZoomBtn>
    </div>
  )
}
