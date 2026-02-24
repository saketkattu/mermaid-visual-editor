'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface PreviewPanelProps {
  syntax: string
}

let initialized = false
let renderId = 0

export function PreviewPanel({ syntax }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
      })
      initialized = true
    }
  }, [])

  useEffect(() => {
    if (!containerRef.current) return

    const render = async () => {
      // Use a unique ID each render to avoid "element already exists" errors
      const id = `mermaid-render-${++renderId}`
      try {
        const { svg } = await mermaid.render(id, syntax)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)
        }
      } catch (err) {
        // Clean up the leftover element mermaid may have inserted on error
        document.getElementById(id)?.remove()
        setError(err instanceof Error ? err.message : 'Render error')
      }
    }

    render()
  }, [syntax])

  return (
    <div className="w-96 border-l border-gray-200 bg-white flex flex-col">
      <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">Mermaid Preview</span>
        {error && (
          <span className="text-xs text-red-500">Syntax error</span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {error ? (
          <div className="text-xs text-red-400 font-mono whitespace-pre-wrap bg-red-50 p-3 rounded">
            {error}
          </div>
        ) : (
          <div ref={containerRef} className="flex items-center justify-center min-h-full" />
        )}
      </div>

      {/* Syntax display */}
      <div className="border-t border-gray-200 bg-gray-900 p-3">
        <pre className="text-xs text-green-400 font-mono overflow-auto max-h-40 whitespace-pre">
          {syntax}
        </pre>
      </div>
    </div>
  )
}
