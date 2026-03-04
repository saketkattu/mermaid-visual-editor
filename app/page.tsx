'use client'

import { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { Canvas } from '@/components/Canvas'
import { Toolbar } from '@/components/Toolbar'
import { PreviewPanel } from '@/components/PreviewPanel'
import { useFlowStore } from '@/lib/store'
import { serialize } from '@/lib/serializer'

function EditorContent() {
  const [previewOpen, setPreviewOpen] = useState(false)
  const { nodes, edges, direction, theme, look, curveStyle } = useFlowStore()
  const syntax = serialize(nodes, edges, { direction, theme, look, curveStyle })

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-50 text-gray-900 font-sans">
      <div className="absolute inset-0 z-0">
        <Canvas />
      </div>

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
