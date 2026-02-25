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
    <div className="flex flex-col h-screen bg-gray-50">
      <Toolbar
        onTogglePreview={() => setPreviewOpen((v) => !v)}
        previewOpen={previewOpen}
      />
      <div className="flex flex-1 overflow-hidden">
        <Canvas />
        {previewOpen && <PreviewPanel syntax={syntax} />}
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
