'use client'

import { useFlowStore } from '@/lib/store'
import type { DiagramType } from '@/lib/store'

const TYPES: { value: DiagramType; label: string; title: string }[] = [
  { value: 'flowchart', label: 'Flowchart', title: 'Visual flowchart editor' },
  { value: 'sequence', label: 'Sequence',  title: 'Sequence diagram (code + preview)' },
  { value: 'mindmap',  label: 'Mindmap',   title: 'Mindmap (code + preview)' },
]

export function DiagramTypeSwitcher() {
  const diagramType = useFlowStore((s) => s.diagramType)
  const setDiagramType = useFlowStore((s) => s.setDiagramType)
  const nodeCount = useFlowStore((s) => s.nodes.length)

  const handleSwitch = (type: DiagramType) => {
    if (type === diagramType) return
    if (
      diagramType === 'flowchart' &&
      nodeCount > 0 &&
      type !== 'flowchart' &&
      !confirm('Switch to code editor? Your flowchart canvas will be preserved and restored when you switch back.')
    ) {
      return
    }
    setDiagramType(type)
  }

  return (
    <div className="pointer-events-auto bg-white border border-gray-200/80 shadow-lg rounded-full flex items-center p-1 gap-0.5">
      {TYPES.map(({ value, label, title }) => (
        <button
          key={value}
          onClick={() => handleSwitch(value)}
          title={title}
          aria-label={title}
          aria-pressed={diagramType === value}
          className={[
            'px-3 py-1 text-xs font-medium rounded-full transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
            diagramType === value
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
