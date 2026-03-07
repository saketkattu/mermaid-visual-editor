'use client'

'use client'

import { useState, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'
import { useFlowStore } from '@/lib/store'
import { ShapePickerPopover } from '@/components/ShapePickerPopover'
import { SettingsPopover } from '@/components/SettingsPopover'
import { ImportModal } from '@/components/ImportModal'

interface TopToolbarProps {
  inspectorOpen: boolean
  onToggleInspector: () => void
  onOpenPalette?: () => void
  syntax: string
}

const NEU_BG = 'var(--neu-bg)'

function NeuIconBtn({
  onClick,
  disabled,
  active,
  title,
  children,
}: {
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  title?: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        background: NEU_BG,
        border: 'none',
        borderRadius: 12,
        boxShadow: active ? 'var(--neu-shadow-inset)' : 'var(--neu-shadow-raised)',
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        color: active ? '#4F46E5' : '#6B7280',
        fontSize: 16,
        transition: 'box-shadow 0.15s, color 0.15s',
        flexShrink: 0,
      }}
    >
      {children}
    </button>
  )
}

function Divider() {
  return (
    <div style={{ width: 1, height: 20, background: 'rgba(163,177,198,0.4)', margin: '0 4px', flexShrink: 0 }} />
  )
}

// Simple SVG icons
const IconLayers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
)

const IconPointer = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
  </svg>
)

const IconCube = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
)


const IconUndo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 14 4 9 9 4" />
    <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
  </svg>
)

const IconRedo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 14 20 9 15 4" />
    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
  </svg>
)

const IconCopy = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
)

const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

export function TopToolbar({ inspectorOpen, onToggleInspector, onOpenPalette, syntax }: TopToolbarProps) {
  const [shapePickerOpen, setShapePickerOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const { undo, redo, setDrawingShape, addSubgraph } = useFlowStore(
    useShallow((s) => ({
      undo: s.undo, redo: s.redo,
      setDrawingShape: s.setDrawingShape,
      addSubgraph: s.addSubgraph,
    }))
  )

  const pastLength = useFlowStore((s) => s.past.length)
  const futureLength = useFlowStore((s) => s.future.length)
  const drawingShape = useFlowStore((s) => s.drawingShape)
  const shapePickerRef = useRef<HTMLDivElement>(null)
  const settingsRef = useRef<HTMLDivElement>(null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(syntax)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handlePointer = () => {
    setDrawingShape(null)
  }

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', pointerEvents: 'auto' }}>
      {importOpen && <ImportModal onClose={() => setImportOpen(false)} />}
      {/* Main pill */}
      <div
        style={{
          background: NEU_BG,
          borderRadius: 50,
          boxShadow: 'var(--neu-shadow-raised)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}
      >
        {/* Layers / Inspector toggle */}
        <NeuIconBtn onClick={onToggleInspector} active={inspectorOpen} title="Toggle Inspector panel">
          <IconLayers />
        </NeuIconBtn>

        {/* Pointer / Select mode */}
        <NeuIconBtn onClick={handlePointer} active={!drawingShape} title="Select mode (Escape)">
          <IconPointer />
        </NeuIconBtn>

        {/* Shape picker */}
        <div ref={shapePickerRef} style={{ position: 'relative' }}>
          <NeuIconBtn onClick={() => { setShapePickerOpen((v) => !v); setSettingsOpen(false) }} active={shapePickerOpen} title="Shape picker">
            <IconCube />
          </NeuIconBtn>
          {shapePickerOpen && <ShapePickerPopover onClose={() => setShapePickerOpen(false)} />}
        </div>

        <Divider />

        {/* Undo */}
        <NeuIconBtn onClick={undo} disabled={pastLength === 0} title="Undo (Ctrl+Z)">
          <IconUndo />
        </NeuIconBtn>

        {/* Redo */}
        <NeuIconBtn onClick={redo} disabled={futureLength === 0} title="Redo (Ctrl+Shift+Z)">
          <IconRedo />
        </NeuIconBtn>

        <Divider />

        {/* Import Mermaid */}
        <NeuIconBtn onClick={() => setImportOpen(true)} title="Import Mermaid syntax">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </NeuIconBtn>

        {/* Copy syntax */}
        <NeuIconBtn onClick={handleCopy} active={copied} title="Copy Mermaid syntax">
          <IconCopy />
        </NeuIconBtn>

        {/* Add Group */}
        <NeuIconBtn onClick={() => addSubgraph()} title="Add a group/subgraph container">
          ⬡
        </NeuIconBtn>

        {/* Command palette trigger */}
        {onOpenPalette && (
          <>
            <Divider />
            <NeuIconBtn onClick={onOpenPalette} title="Command palette (⌘K)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </NeuIconBtn>
          </>
        )}

        {/* Settings */}
        <div ref={settingsRef} style={{ position: 'relative' }}>
          <NeuIconBtn onClick={() => { setSettingsOpen((v) => !v); setShapePickerOpen(false) }} active={settingsOpen} title="Settings">
            <IconSettings />
          </NeuIconBtn>
          {settingsOpen && <SettingsPopover onClose={() => setSettingsOpen(false)} />}
        </div>
      </div>

      {/* Draw mode hint */}
      {drawingShape && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#4F46E5',
            color: 'white',
            fontSize: 11,
            fontWeight: 500,
            padding: '5px 12px',
            borderRadius: 50,
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 12px rgba(79,70,229,0.4)',
          }}
        >
          Drawing: {drawingShape} — click &amp; drag on canvas — Esc to cancel
        </div>
      )}
    </div>
  )
}
