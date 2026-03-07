'use client'

import { useShallow } from 'zustand/react/shallow'
import { useFlowStore } from '@/lib/store'
import { applyDagreLayout } from '@/lib/layout'
import { ObjectSettingsSection } from './ObjectSettingsSection'
import { DiagramSettingsSection } from './DiagramSettingsSection'
import { MermaidLiveSection } from './MermaidLiveSection'

interface InspectorPanelProps {
  syntax: string
  onCollapse: () => void
}

const NEU_BG = 'var(--neu-bg)'

// Tree/hierarchy icon — clearly communicates "arrange into a layout"
function IconAutoLayout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Root node */}
      <rect x="9" y="1" width="6" height="4" rx="1" />
      {/* Left child */}
      <rect x="2" y="16" width="6" height="4" rx="1" />
      {/* Right child */}
      <rect x="16" y="16" width="6" height="4" rx="1" />
      {/* Trunk */}
      <line x1="12" y1="5" x2="12" y2="11" />
      {/* Branch */}
      <line x1="5" y1="11" x2="19" y2="11" />
      {/* Left leg */}
      <line x1="5" y1="11" x2="5" y2="16" />
      {/* Right leg */}
      <line x1="19" y1="11" x2="19" y2="16" />
    </svg>
  )
}

function Separator() {
  return (
    <div
      style={{
        height: 1,
        background: 'rgba(163,177,198,0.35)',
        margin: '16px 0',
      }}
    />
  )
}

export function InspectorPanel({ syntax, onCollapse }: InspectorPanelProps) {
  const { setNodes } = useFlowStore(useShallow((s) => ({ setNodes: s.setNodes })))
  const nodesLength = useFlowStore((s) => s.nodes.length)

  const handleAutoLayout = () => {
    const { nodes, edges, direction } = useFlowStore.getState()
    if (nodes.length === 0) return
    setNodes(applyDagreLayout(nodes, edges, direction))
  }

  return (
    <div
      style={{
        width: 320,
        height: '100vh',
        background: NEU_BG,
        boxShadow: 'var(--neu-shadow-raised)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px 12px',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: '#374151', letterSpacing: '-0.01em' }}>
          Inspector
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
          {/* Auto Layout */}
          <button
            onClick={handleAutoLayout}
            disabled={nodesLength === 0}
            title="Auto-arrange nodes into a hierarchy"
            aria-label="Auto Layout"
            style={{
              background: NEU_BG,
              border: 'none',
              borderRadius: 10,
              boxShadow: 'var(--neu-shadow-raised)',
              height: 28,
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              cursor: nodesLength === 0 ? 'not-allowed' : 'pointer',
              opacity: nodesLength === 0 ? 0.4 : 1,
              color: '#6B7280',
              fontSize: 11,
              fontWeight: 500,
              transition: 'box-shadow 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <IconAutoLayout />
            Auto Layout
          </button>

          {/* Collapse */}
          <button
            onClick={onCollapse}
          title="Collapse inspector"
          aria-label="Collapse inspector"
          style={{
            background: NEU_BG,
            border: 'none',
            borderRadius: 10,
            boxShadow: 'var(--neu-shadow-raised)',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#9ca3af',
            fontSize: 14,
            transition: 'box-shadow 0.15s',
          }}
        >
            ×
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 20px' }}>
        <ObjectSettingsSection />
        <Separator />
        <DiagramSettingsSection />
        <Separator />
        <MermaidLiveSection syntax={syntax} />
      </div>
    </div>
  )
}
