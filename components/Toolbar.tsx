'use client'

import { useState } from 'react'
import {
  useFlowStore,
  type ArrowType,
  type CurveStyle,
  type Direction,
  type EdgeStyle,
  type FlowEdgeData,
  type NodeShape,
  type Theme,
} from '@/lib/store'
import { serialize } from '@/lib/serializer'
import { applyDagreLayout } from '@/lib/layout'
import { downloadMmd, saveDiagramJson, loadDiagramJson } from '@/lib/fileio'

// ─── Shape icon SVGs ──────────────────────────────────────────────────────────

function ShapeIcon({ shape }: { shape: NodeShape }) {
  const s = '#6b7280'
  const f = 'white'
  const sw = 1.5
  switch (shape) {
    case 'rectangle':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><rect x={1} y={2} width={22} height={12} rx={1} fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'rounded':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><rect x={1} y={2} width={22} height={12} rx={5} fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'stadium':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><rect x={1} y={2} width={22} height={12} rx={7} fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'subroutine':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><rect x={2} y={3} width={20} height={10} rx={1} fill={f} stroke={s} strokeWidth={sw} /><rect x={4} y={5} width={16} height={6} rx={0} fill="none" stroke={s} strokeWidth={0.8} /></svg>
    case 'cylinder':
      return <svg viewBox="0 0 24 18" className="w-6 h-4"><rect x={2} y={5} width={20} height={10} fill={f} stroke={s} strokeWidth={sw} /><ellipse cx={12} cy={5} rx={10} ry={3} fill={f} stroke={s} strokeWidth={sw} /><ellipse cx={12} cy={15} rx={10} ry={3} fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'circle':
      return <svg viewBox="0 0 16 16" className="w-4 h-4"><circle cx={8} cy={8} r={6} fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'double-circle':
      return <svg viewBox="0 0 16 16" className="w-4 h-4"><circle cx={8} cy={8} r={6} fill={f} stroke={s} strokeWidth={sw} /><circle cx={8} cy={8} r={4} fill="none" stroke={s} strokeWidth={0.8} /></svg>
    case 'diamond':
      return <svg viewBox="0 0 16 16" className="w-4 h-4"><polygon points="8,1 15,8 8,15 1,8" fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'hexagon':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><polygon points="7,2 17,2 23,8 17,14 7,14 1,8" fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'parallelogram':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><polygon points="5,2 23,2 19,14 1,14" fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'parallelogram-alt':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><polygon points="1,2 19,2 23,14 5,14" fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'trapezoid':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><polygon points="1,2 23,2 20,14 4,14" fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'trapezoid-alt':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><polygon points="4,2 20,2 23,14 1,14" fill={f} stroke={s} strokeWidth={sw} /></svg>
    case 'asymmetric':
      return <svg viewBox="0 0 24 16" className="w-6 h-4"><polygon points="1,2 19,2 23,8 19,14 1,14" fill={f} stroke={s} strokeWidth={sw} /></svg>
  }
}

const ALL_SHAPES: { shape: NodeShape; label: string }[] = [
  { shape: 'rectangle',       label: 'Rectangle' },
  { shape: 'rounded',         label: 'Rounded' },
  { shape: 'stadium',         label: 'Stadium' },
  { shape: 'diamond',         label: 'Diamond' },
  { shape: 'circle',          label: 'Circle' },
  { shape: 'double-circle',   label: 'Double Circle' },
  { shape: 'hexagon',         label: 'Hexagon' },
  { shape: 'subroutine',      label: 'Subroutine' },
  { shape: 'cylinder',        label: 'Cylinder/DB' },
  { shape: 'parallelogram',   label: 'Parallelogram' },
  { shape: 'parallelogram-alt', label: 'Para. Alt' },
  { shape: 'trapezoid',       label: 'Trapezoid' },
  { shape: 'trapezoid-alt',   label: 'Trap. Alt' },
  { shape: 'asymmetric',      label: 'Asymmetric' },
]

const DIRECTIONS: { value: Direction; label: string; title: string }[] = [
  { value: 'TD', label: '↓', title: 'Top → Down' },
  { value: 'LR', label: '→', title: 'Left → Right' },
  { value: 'BT', label: '↑', title: 'Bottom → Top' },
  { value: 'RL', label: '←', title: 'Right → Left' },
]

const THEMES: { value: Theme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'dark',    label: 'Dark' },
  { value: 'forest',  label: 'Forest' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'base',    label: 'Base' },
]

const CURVE_STYLES: { value: CurveStyle; label: string }[] = [
  { value: 'basis',      label: 'Basis' },
  { value: 'linear',     label: 'Linear' },
  { value: 'cardinal',   label: 'Cardinal' },
  { value: 'catmullRom', label: 'Catmull-Rom' },
  { value: 'step',       label: 'Step' },
  { value: 'stepAfter',  label: 'Step After' },
  { value: 'stepBefore', label: 'Step Before' },
  { value: 'natural',    label: 'Natural' },
  { value: 'monotoneX',  label: 'Monotone X' },
  { value: 'monotoneY',  label: 'Monotone Y' },
  { value: 'bumpX',      label: 'Bump X' },
  { value: 'bumpY',      label: 'Bump Y' },
]

// ─── Shared micro-components ──────────────────────────────────────────────────

function Divider() {
  return <div className="w-px h-6 bg-gray-200/60 mx-1 flex-shrink-0" />
}

function Btn({
  onClick,
  disabled,
  active,
  title,
  children,
  primary,
}: {
  onClick?: () => void
  disabled?: boolean
  active?: boolean
  title?: string
  children: React.ReactNode
  primary?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={[
        'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 flex-shrink-0',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        primary
          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          : active
          ? 'bg-blue-100 text-blue-700'
          : 'bg-transparent text-gray-600 hover:bg-gray-100',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function FloatingPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`pointer-events-auto bg-white border border-gray-200/80 shadow-[0_4px_12px_rgb(0,0,0,0.06)] rounded-xl flex items-center p-1.5 gap-1 transition-shadow ${className}`}>
      {children}
    </div>
  )
}

// ─── Toolbar ──────────────────────────────────────────────────────────────────

interface ToolbarProps {
  onTogglePreview: () => void
  previewOpen: boolean
}

export function Toolbar({ onTogglePreview, previewOpen }: ToolbarProps) {
  const {
    nodes, edges,
    direction, theme, look, curveStyle,
    past, future,
    addNode, setNodes, loadDiagram,
    updateNodeShape, updateNodeStyle,
    updateEdgeType,
    setDirection, setTheme, setLook, setCurveStyle,
    undo, redo, duplicateSelected,
  } = useFlowStore()

  const [activeShape, setActiveShape] = useState<NodeShape>('rectangle')
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const selectedNodes = nodes.filter((n) => n.selected)
  const selectedEdges = edges.filter((e) => e.selected)
  const hasNodeSelection = selectedNodes.length > 0
  const hasEdgeSelection = selectedEdges.length > 0

  const displayShape = selectedNodes.length === 1 ? selectedNodes[0].data.shape : activeShape
  const firstEdgeData = hasEdgeSelection ? (selectedEdges[0].data as FlowEdgeData | undefined) : undefined
  const activeEdgeStyle = firstEdgeData?.edgeStyle ?? 'solid'
  const activeArrowType = firstEdgeData?.arrowType ?? 'arrow'

  const handleShapeClick = (shape: NodeShape) => {
    setActiveShape(shape)
    if (hasNodeSelection) selectedNodes.forEach((n) => updateNodeShape(n.id, shape))
  }

  const handleDirectionChange = (dir: Direction) => {
    setDirection(dir)
    if (nodes.length > 0) setNodes(applyDagreLayout(nodes, edges, dir))
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(serialize(nodes, edges, { direction, theme, look, curveStyle }))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAutoLayout = () => {
    if (nodes.length === 0) return
    setNodes(applyDagreLayout(nodes, edges, direction))
  }

  const handleLoad = async () => {
    try {
      setLoadError(null)
      const { nodes: n, edges: e } = await loadDiagramJson()
      loadDiagram(n, e)
    } catch (err) {
      if (err instanceof Error && err.message !== 'No file selected') {
        setLoadError('Invalid file')
        setTimeout(() => setLoadError(null), 3000)
      }
    }
  }

  const handleExportSvg = async () => {
    try {
      const mermaid = (await import('mermaid')).default
      const syntax = serialize(nodes, edges, { direction, theme, look, curveStyle })
      const { svg } = await mermaid.render(`svg-export-${Date.now()}`, syntax)
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'diagram.svg'
      a.click()
      URL.revokeObjectURL(url)
    } catch { /* ignore render errors */ }
  }

  return (
    <div className="flex justify-between items-start w-full">

      {/* ── Left corner controls ─────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <FloatingPanel>
          <Btn onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">↩</Btn>
          <Btn onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Shift+Z)">↪</Btn>
          <Divider />
          <Btn onClick={handleLoad} title="Load diagram from .json">{loadError ? 'Err' : 'Load'}</Btn>
          <Btn onClick={() => saveDiagramJson(nodes, edges)} disabled={nodes.length === 0} title="Save as .json">Save</Btn>
          <Divider />
          <Btn onClick={() => downloadMmd(nodes, edges, { direction, theme, look, curveStyle })} disabled={nodes.length === 0} title="Download .mmd">.mmd</Btn>
          <Btn onClick={handleExportSvg} disabled={nodes.length === 0} title="Export as SVG">SVG</Btn>
        </FloatingPanel>

        {/* Settings/Theme Panel */}
        <FloatingPanel>
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value as Theme)}
            className="text-xs bg-transparent text-gray-700 outline-none cursor-pointer py-1 px-2"
            title="Theme"
          >
            {THEMES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <Divider />
          <Btn
            onClick={() => setLook(look === 'handDrawn' ? 'classic' : 'handDrawn')}
            active={look === 'handDrawn'}
            title="Toggle hand-drawn look"
          >
            ✏ Sketch
          </Btn>
          <Divider />
          <select
            value={curveStyle}
            onChange={(e) => setCurveStyle(e.target.value as CurveStyle)}
            className="text-xs bg-transparent text-gray-700 outline-none cursor-pointer py-1 px-2"
            title="Curve Style"
          >
            {CURVE_STYLES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </FloatingPanel>

        {/* Selected Context properties floating below top-left items */}
        {hasNodeSelection && (
          <FloatingPanel className="mt-2 bg-blue-50/95 border-blue-200/60 shadow-md">
            <span className="text-xs font-semibold text-blue-800 px-2 flex-shrink-0">
              {selectedNodes.length === 1 ? '1 node' : `${selectedNodes.length} nodes`}
            </span>
            <Divider />
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer px-1">
              Fill
              <input
                type="color"
                defaultValue={selectedNodes[0].data.fillColor ?? '#ffffff'}
                onChange={(e) => selectedNodes.forEach((n) => updateNodeStyle(n.id, { fillColor: e.target.value }))}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer px-1">
              Border
              <input
                type="color"
                defaultValue={selectedNodes[0].data.strokeColor ?? '#9ca3af'}
                onChange={(e) => selectedNodes.forEach((n) => updateNodeStyle(n.id, { strokeColor: e.target.value }))}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer px-1">
              Text
              <input
                type="color"
                defaultValue={selectedNodes[0].data.textColor ?? '#1f2937'}
                onChange={(e) => selectedNodes.forEach((n) => updateNodeStyle(n.id, { textColor: e.target.value }))}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <Btn
              onClick={() =>
                selectedNodes.forEach((n) =>
                  updateNodeStyle(n.id, { fillColor: undefined, strokeColor: undefined, textColor: undefined })
                )
              }
            >
              Reset
            </Btn>
          </FloatingPanel>
        )}

        {hasEdgeSelection && (
          <FloatingPanel className="mt-2 bg-emerald-50/95 border-emerald-200/60 shadow-md">
            <span className="text-xs font-semibold text-emerald-800 px-2 flex-shrink-0">
              {selectedEdges.length === 1 ? '1 edge' : `${selectedEdges.length} edges`}
            </span>
            <Divider />
            {(['solid', 'dashed', 'thick'] as EdgeStyle[]).map((style) => (
              <Btn
                key={style}
                onClick={() => selectedEdges.forEach((e) => updateEdgeType(e.id, { edgeStyle: style }))}
                active={activeEdgeStyle === style}
                title={`${style} line`}
              >
                {style === 'solid' ? '─' : style === 'dashed' ? '╌' : '━'}
              </Btn>
            ))}
            <Divider />
            {(
              [
                { type: 'arrow',         label: '→' },
                { type: 'none',          label: '─' },
                { type: 'bidirectional', label: '↔' },
                { type: 'circle',        label: '─○' },
                { type: 'cross',         label: '─✕' },
              ] as { type: ArrowType; label: string }[]
            ).map(({ type, label }) => (
              <Btn
                key={type}
                onClick={() => selectedEdges.forEach((e) => updateEdgeType(e.id, { arrowType: type }))}
                active={activeArrowType === type}
              >
                {label}
              </Btn>
            ))}
            <Divider />
            <label className="flex items-center gap-1.5 text-xs font-medium text-gray-700 cursor-pointer px-1">
              <input
                type="color"
                defaultValue={(selectedEdges[0].data as FlowEdgeData | undefined)?.strokeColor ?? '#9ca3af'}
                onChange={(e) =>
                  selectedEdges.forEach((ed) => updateEdgeType(ed.id, { strokeColor: e.target.value }))
                }
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                title="Edge Color"
              />
            </label>
          </FloatingPanel>
        )}
      </div>

      {/* ── Top Center Canvas Tools ──────────────────────────────────────── */}
      <div className="flex gap-2 mx-4 absolute left-1/2 -translate-x-1/2 z-50">
        <FloatingPanel className="shadow-lg">
          <div className="flex flex-col gap-0.5 px-2 py-1">
            <div className="flex gap-1 justify-center">
              {ALL_SHAPES.slice(0, 7).map(({ shape, label }) => (
                <button
                  key={shape}
                  title={hasNodeSelection ? `Change to ${label}` : label}
                  onClick={() => handleShapeClick(shape)}
                  className={[
                    'w-8 h-7 rounded-md flex items-center justify-center transition-all',
                    displayShape === shape ? 'bg-blue-100 ring-2 ring-blue-500/50 shadow-sm' : 'hover:bg-gray-100',
                  ].join(' ')}
                >
                  <ShapeIcon shape={shape} />
                </button>
              ))}
            </div>
            <div className="flex gap-1 justify-center">
              {ALL_SHAPES.slice(7).map(({ shape, label }) => (
                <button
                  key={shape}
                  title={hasNodeSelection ? `Change to ${label}` : label}
                  onClick={() => handleShapeClick(shape)}
                  className={[
                    'w-8 h-7 rounded-md flex items-center justify-center transition-all',
                    displayShape === shape ? 'bg-blue-100 ring-2 ring-blue-500/50 shadow-sm' : 'hover:bg-gray-100',
                  ].join(' ')}
                >
                  <ShapeIcon shape={shape} />
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div className="px-2">
            <Btn onClick={() => addNode(activeShape)} primary title="Add node (N)">
              + Add
            </Btn>
          </div>
          <Divider />
          <Btn onClick={duplicateSelected} disabled={!hasNodeSelection} title="Duplicate (Ctrl+D)">
            ⊕ Dup
          </Btn>
        </FloatingPanel>
      </div>

      {/* ── Right side controls ─────────────────────────────────────────── */}
      <FloatingPanel>
        <div className="flex items-center gap-0.5 px-1">
          {DIRECTIONS.map(({ value, label, title }) => (
            <Btn key={value} onClick={() => handleDirectionChange(value)} active={direction === value} title={title}>
              {label}
            </Btn>
          ))}
        </div>
        <Divider />
        <Btn onClick={handleAutoLayout} disabled={nodes.length === 0} title="Auto-arrange nodes (Top-to-Bottom by default)">
          ⬡ Layout
        </Btn>
        <Divider />
        <Btn onClick={onTogglePreview} active={previewOpen}>
          {previewOpen ? 'Hide Preview' : 'Show Preview'}
        </Btn>
        <Divider />
        <Btn onClick={handleCopy} primary={!copied}>
          {copied ? '✓ Copied!' : 'Copy Syntax'}
        </Btn>
      </FloatingPanel>

    </div>
  )
}
