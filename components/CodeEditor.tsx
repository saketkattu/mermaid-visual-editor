'use client'

import { useFlowStore } from '@/lib/store'
import { PreviewPanel } from '@/components/PreviewPanel'

export function CodeEditor() {
  const rawCode = useFlowStore((s) => s.rawCode)
  const setRawCode = useFlowStore((s) => s.setRawCode)
  const diagramType = useFlowStore((s) => s.diagramType)

  const title = diagramType === 'sequence' ? 'Sequence Diagram' : 'Mindmap'

  return (
    <div className="flex h-full w-full">
      {/* ── Left: code editor ─────────────────────────────────────────── */}
      <div className="w-1/2 h-full flex flex-col border-r border-gray-200 bg-white">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80 flex items-center justify-between flex-shrink-0">
          <span className="text-sm font-semibold text-gray-700">{title} Editor</span>
          <span className="text-xs text-gray-400">Edit Mermaid syntax</span>
        </div>
        <textarea
          value={rawCode}
          onChange={(e) => setRawCode(e.target.value)}
          className="flex-1 font-mono text-sm p-4 resize-none outline-none bg-white text-gray-900 leading-relaxed"
          spellCheck={false}
          aria-label={`${title} code editor`}
        />
      </div>

      {/* ── Right: live preview ────────────────────────────────────────── */}
      <div className="w-1/2 h-full">
        <PreviewPanel syntax={rawCode} />
      </div>
    </div>
  )
}
