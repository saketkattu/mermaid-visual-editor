'use client'

import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Canvas } from '@/components/Canvas'
import { Toolbar } from '@/components/Toolbar'
import { PreviewPanel } from '@/components/PreviewPanel'
import { CodeEditor } from '@/components/CodeEditor'
import { DiagramTypeSwitcher } from '@/components/DiagramTypeSwitcher'
import { useFlowStore } from '@/lib/store'
import { serialize } from '@/lib/serializer'

function EditorContent() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const diagramType = useFlowStore((s) => s.diagramType)
  const { nodes, edges, direction, theme, look, curveStyle } = useFlowStore()
  const syntax = serialize(nodes, edges, { direction, theme, look, curveStyle })

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">

      {diagramType === 'flowchart' ? (
        <>
          {/* ── Visual canvas ── */}
          <div className="absolute inset-0 z-0">
            <Canvas />
          </div>

          {/* ── Toolbar overlay ── */}
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-4">
            <Toolbar
              onTogglePreview={() => setPreviewOpen((v) => !v)}
              previewOpen={previewOpen}
            />

            {previewOpen && (
              <div className="absolute right-4 top-24 bottom-4 w-[400px] pointer-events-auto shadow-2xl rounded-xl overflow-hidden border border-gray-200/50 bg-white">
                <PreviewPanel syntax={syntax} />
              </div>
            )}
          </div>
        </>
      ) : (
        /* ── Code editor + preview ── */
        <div className="absolute inset-0 z-0 pb-12">
          <CodeEditor />
        </div>
      )}

      {/* ── Diagram type switcher — always visible at bottom-center ── */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 z-50 flex justify-center">
        <DiagramTypeSwitcher />
      </div>

    </div>
  )
}

export default function Page() {
  return (
    <ReactFlowProvider>
      <EditorContent />
    </ReactFlowProvider>
  )
}
