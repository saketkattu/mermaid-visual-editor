import type { Edge, Node } from '@xyflow/react'
import type { FlowNodeData } from './store'
import { serialize } from './serializer'

/** Trigger a browser file download with given content */
function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadMmd(nodes: Node<FlowNodeData>[], edges: Edge[]) {
  download('diagram.mmd', serialize(nodes, edges), 'text/plain')
}

export function saveDiagramJson(nodes: Node<FlowNodeData>[], edges: Edge[]) {
  const payload = JSON.stringify({ nodes, edges }, null, 2)
  download('diagram.json', payload, 'application/json')
}

export function loadDiagramJson(): Promise<{ nodes: Node<FlowNodeData>[]; edges: Edge[] }> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return reject(new Error('No file selected'))
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target?.result as string)
          if (!parsed.nodes || !parsed.edges) throw new Error('Invalid diagram file')
          resolve(parsed)
        } catch (err) {
          reject(err)
        }
      }
      reader.readAsText(file)
    }
    input.click()
  })
}
