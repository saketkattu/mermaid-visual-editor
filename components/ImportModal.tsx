'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { parseMermaidFlowchart } from '@/lib/parser'
import type { ParseResult } from '@/lib/parser'
import { useFlowStore } from '@/lib/store'

interface ImportModalProps {
  onClose: () => void
}

export function ImportModal({ onClose }: ImportModalProps) {
  const importDiagram = useFlowStore((s) => s.importDiagram)
  const [value, setValue] = useState('')
  const [result, setResult] = useState<ParseResult | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Live parse feedback with 300ms debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!value.trim()) { setResult(null); return }
    debounceRef.current = setTimeout(() => {
      setResult(parseMermaidFlowchart(value))
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [value])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleImport = useCallback(() => {
    if (!result || result.error) return
    const { nodes, edges, direction, theme, look, curveStyle } = result
    importDiagram(nodes, edges, { direction, theme, look, curveStyle })
    onClose()
  }, [result, importDiagram, onClose])

  const canImport = result !== null && result.error === null && result.nodes.length > 0

  const statusText = () => {
    if (!value.trim()) return null
    if (!result) return <span className="text-gray-400">Parsing…</span>
    if (result.error) return <span className="text-red-500">{result.error}</span>
    return (
      <span className="text-emerald-600">
        {result.nodes.length} node{result.nodes.length !== 1 ? 's' : ''},&nbsp;
        {result.edges.length} edge{result.edges.length !== 1 ? 's' : ''} detected
      </span>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-[580px] max-h-[85vh] flex flex-col border border-gray-200/60">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Import Mermaid Syntax</h2>
            <p className="text-xs text-gray-400 mt-0.5">Paste a flowchart definition to load it onto the canvas</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Textarea */}
        <div className="flex-1 overflow-hidden flex flex-col p-4 gap-2">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="flex-1 w-full font-mono text-xs text-gray-800 bg-gray-50 border border-gray-200 rounded-lg p-3 resize-none outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`flowchart TD\n  A["Start"] --> B{"Decision?"}\n  B --> |"Yes"| C["Do it"]\n  B --> |"No"| D["Skip"]`}
            spellCheck={false}
            rows={14}
          />
          <div className="text-xs min-h-[16px]">{statusText()}</div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!canImport}
            className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Import to Canvas
          </button>
        </div>
      </div>
    </div>
  )
}
