'use client'

import { useReactFlow } from '@xyflow/react'
import { useState } from 'react'

const NEU_BG = 'var(--neu-bg)'

function ZoomBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
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
        cursor: 'pointer',
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

export function ZoomControls() {
  const { zoomIn, zoomOut, fitView, getZoom } = useReactFlow()
  const [zoom, setZoom] = useState<number | null>(null)

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
