'use client'

import { useEffect, useRef, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFlowStore } from '@/lib/store'
import { applyDagreLayout } from '@/lib/layout'
import { serialize } from '@/lib/serializer'
import { ALL_SHAPES, ShapeIcon } from '@/components/ShapeIcons'
import { ImportModal } from '@/components/ImportModal'

interface CommandPaletteProps {
  onClose: () => void
}

type CommandItem = {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  action: () => void
}

const NEU_BG = 'var(--neu-bg)'

export function CommandPalette({ onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIdx, setActiveIdx] = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const { undo, redo, setNodes, setDrawingShape } = useFlowStore(
    useShallow((s) => ({
      undo: s.undo,
      redo: s.redo,
      setNodes: s.setNodes,
      setDrawingShape: s.setDrawingShape,
    }))
  )

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleAutoLayout = () => {
    const { nodes, edges, direction } = useFlowStore.getState()
    if (nodes.length === 0) return
    setNodes(applyDagreLayout(nodes, edges, direction))
    onClose()
  }

  const handleCopySyntax = async () => {
    const { nodes, edges, direction, theme, look, curveStyle } = useFlowStore.getState()
    await navigator.clipboard.writeText(serialize(nodes, edges, { direction, theme, look, curveStyle }))
    onClose()
  }

  const shapeCommands: CommandItem[] = ALL_SHAPES.map(({ shape, label }) => ({
    id: `shape-${shape}`,
    label: `Draw ${label}`,
    description: 'Click & drag on canvas',
    icon: <ShapeIcon shape={shape} />,
    action: () => { setDrawingShape(shape); onClose() },
  }))

  const actionCommands: CommandItem[] = [
    { id: 'undo', label: 'Undo', description: 'Ctrl+Z', icon: '↩', action: () => { undo(); onClose() } },
    { id: 'redo', label: 'Redo', description: 'Ctrl+Shift+Z', icon: '↪', action: () => { redo(); onClose() } },
    { id: 'layout', label: 'Auto Layout', description: 'Re-arrange nodes', icon: '⬡', action: handleAutoLayout },
    { id: 'copy', label: 'Copy Mermaid Syntax', description: 'Copy to clipboard', icon: '📋', action: handleCopySyntax },
    { id: 'import', label: 'Import Mermaid Syntax', description: 'Parse .mmd onto canvas', icon: '⬆', action: () => { setImportOpen(true) } },
  ]

  const allCommands = [...actionCommands, ...shapeCommands]

  const filtered = query.trim()
    ? allCommands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        (c.description?.toLowerCase() ?? '').includes(query.toLowerCase())
      )
    : allCommands

  // Keep activeIdx in bounds when filtered list shrinks
  const safeActiveIdx = Math.min(activeIdx, Math.max(0, filtered.length - 1))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIdx((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIdx((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[safeActiveIdx]) {
      filtered[safeActiveIdx].action()
    }
  }

  return (
    <>
      {importOpen && <ImportModal onClose={() => { setImportOpen(false); onClose() }} />}
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
          zIndex: 200,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          paddingTop: 80,
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: NEU_BG,
            borderRadius: 20,
            boxShadow: 'var(--neu-shadow-raised)',
            width: 540,
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '14px 18px',
              borderBottom: '1px solid rgba(163,177,198,0.3)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search commands, shapes…"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: 14,
                color: '#374151',
              }}
            />
            <kbd style={{ fontSize: 11, color: '#9ca3af', background: NEU_BG, borderRadius: 6, padding: '2px 6px', boxShadow: 'var(--neu-shadow-raised)', fontFamily: 'monospace' }}>
              Esc
            </kbd>
          </div>

          {/* Results */}
          <div style={{ overflowY: 'auto', padding: '8px 8px' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                No commands found
              </div>
            ) : (
              filtered.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={item.action}
                  style={{
                    width: '100%',
                    background: NEU_BG,
                    border: 'none',
                    borderRadius: 12,
                    boxShadow: idx === safeActiveIdx ? 'var(--neu-shadow-inset)' : 'none',
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'box-shadow 0.1s',
                    marginBottom: 2,
                  }}
                  onMouseEnter={() => setActiveIdx(idx)}

                >
                  <span style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: idx === safeActiveIdx ? '#4F46E5' : '#6B7280' }}>
                    {item.icon}
                  </span>
                  <span style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: idx === safeActiveIdx ? '#4F46E5' : '#374151' }}>{item.label}</div>
                    {item.description && (
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{item.description}</div>
                    )}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
