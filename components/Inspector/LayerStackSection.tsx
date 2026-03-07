'use client'

import { useReactFlow } from '@xyflow/react'
import { useFlowStore } from '@/lib/store'

const NEU_BG = 'var(--neu-bg)'

export function LayerStackSection() {
  const { fitView } = useReactFlow()
  const nodes = useFlowStore((s) => s.nodes)
  const onNodesChange = useFlowStore((s) => s.onNodesChange)

  const selectNode = (id: string) => {
    onNodesChange(nodes.map((n) => ({ type: 'select' as const, id: n.id, selected: n.id === id })))
    setTimeout(() => {
      fitView({ nodes: [{ id }], duration: 400, padding: 0.3 })
    }, 50)
  }

  if (nodes.length === 0) {
    return (
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          Layers
        </div>
        <div style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '12px 0' }}>
          No nodes yet
        </div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
        Layers ({nodes.length})
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
        {nodes.map((node) => {
          const isSelected = node.selected
          const isSubgraph = node.data.isSubgraph
          return (
            <button
              key={node.id}
              onClick={() => selectNode(node.id)}
              title={`Select ${node.data.label}`}
              style={{
                background: NEU_BG,
                border: 'none',
                borderRadius: 10,
                boxShadow: isSelected ? 'var(--neu-shadow-inset)' : 'var(--neu-shadow-soft)',
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'box-shadow 0.15s',
                width: '100%',
              }}
            >
              <span style={{ fontSize: 12, opacity: 0.5 }}>
                {isSubgraph ? '⬡' : '□'}
              </span>
              <span style={{ fontSize: 12, color: isSelected ? '#4F46E5' : '#374151', fontWeight: isSelected ? 600 : 400, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {node.data.label || node.id}
              </span>
              <span style={{ fontSize: 10, color: '#9ca3af', flexShrink: 0 }}>
                {node.data.shape ?? 'rect'}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
