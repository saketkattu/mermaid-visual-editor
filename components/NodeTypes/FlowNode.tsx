'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useCallback, useRef, useState } from 'react'
import { useFlowStore, type FlowNodeData, type NodeShape } from '@/lib/store'

// ─── SVG shape paths (viewBox 0 0 200 100, preserveAspectRatio="none") ────────
// All points are in the 200×100 coordinate space so they stretch with the node.

function SvgHexagon({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  return (
    <polygon
      points="50,2 150,2 198,50 150,98 50,98 2,50"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

function SvgParallelogram({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  return (
    <polygon
      points="28,2 198,2 172,98 2,98"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

function SvgParallelogramAlt({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  return (
    <polygon
      points="2,2 172,2 198,98 28,98"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

function SvgTrapezoid({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  // Wider at top
  return (
    <polygon
      points="2,2 198,2 175,98 25,98"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

function SvgTrapezoidAlt({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  // Wider at bottom
  return (
    <polygon
      points="25,2 175,2 198,98 2,98"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

function SvgAsymmetric({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  return (
    <polygon
      points="2,2 178,2 198,50 178,98 2,98"
      fill={fill}
      stroke={stroke}
      strokeWidth={sw}
    />
  )
}

function SvgCylinder({
  fill,
  stroke,
  sw,
}: {
  fill: string
  stroke: string
  sw: number
}) {
  // Database cylinder: rect body + ellipse caps. viewBox="0 0 200 120"
  return (
    <>
      <rect x={sw} y={18} width={200 - sw * 2} height={84} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Top cap */}
      <ellipse cx={100} cy={18} rx={100 - sw} ry={16} fill={fill} stroke={stroke} strokeWidth={sw} />
      {/* Bottom cap outline only */}
      <ellipse cx={100} cy={102} rx={100 - sw} ry={16} fill={fill} stroke={stroke} strokeWidth={sw} />
    </>
  )
}

// ─── Shape → SVG renderer map ─────────────────────────────────────────────────
type SvgShapeRenderer = (props: { fill: string; stroke: string; sw: number }) => React.ReactNode

const SVG_RENDERERS: Partial<Record<NodeShape, SvgShapeRenderer>> = {
  hexagon: SvgHexagon,
  parallelogram: SvgParallelogram,
  'parallelogram-alt': SvgParallelogramAlt,
  trapezoid: SvgTrapezoid,
  'trapezoid-alt': SvgTrapezoidAlt,
  asymmetric: SvgAsymmetric,
  cylinder: SvgCylinder,
}

const IS_SVG_SHAPE = new Set<NodeShape>(Object.keys(SVG_RENDERERS) as NodeShape[])

// ─── Four-directional handles (shown on all shapes) ──────────────────────────
function NodeHandles() {
  return (
    <>
      <Handle type="target" position={Position.Top} className="!bg-blue-300 hover:!bg-blue-500 !w-2.5 !h-2.5" />
      <Handle type="target" position={Position.Left} className="!bg-blue-300 hover:!bg-blue-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-300 hover:!bg-blue-500 !w-2.5 !h-2.5" />
      <Handle type="source" position={Position.Right} className="!bg-blue-300 hover:!bg-blue-500 !w-2.5 !h-2.5" />
    </>
  )
}

// ─── Inline label editor ──────────────────────────────────────────────────────
interface LabelProps {
  value: string
  editing: boolean
  draft: string
  setDraft: (v: string) => void
  onCommit: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  rotate?: boolean
  color?: string
}

function NodeLabel({
  value,
  editing,
  draft,
  setDraft,
  onCommit,
  onKeyDown,
  inputRef,
  rotate,
  color,
}: LabelProps) {
  const rotClass = rotate ? '-rotate-45' : ''
  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={onCommit}
        onKeyDown={onKeyDown}
        className={`bg-transparent border-none outline-none text-center text-sm w-full ${rotClass}`}
        autoFocus
      />
    )
  }
  return (
    <span
      className={`text-center break-words text-sm font-medium leading-snug select-none ${rotClass}`}
      style={{ color: color || '#1f2937' }}
    >
      {value}
    </span>
  )
}

// ─── Main FlowNode component ──────────────────────────────────────────────────
export function FlowNode({ id, data, selected }: NodeProps) {
  const nodeData = data as FlowNodeData
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(nodeData.label)
  const inputRef = useRef<HTMLInputElement>(null)
  const updateNodeLabel = useFlowStore((s) => s.updateNodeLabel)

  const commitLabel = useCallback(() => {
    const trimmed = draft.trim() || 'Node'
    updateNodeLabel(id, trimmed)
    setEditing(false)
  }, [draft, id, updateNodeLabel])

  const handleDoubleClick = useCallback(() => {
    setDraft(nodeData.label)
    setEditing(true)
    setTimeout(() => inputRef.current?.select(), 0)
  }, [nodeData.label])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation()
      if (e.key === 'Enter') commitLabel()
      if (e.key === 'Escape') setEditing(false)
    },
    [commitLabel]
  )

  const shape = (nodeData.shape ?? 'rectangle') as NodeShape
  const fillColor = nodeData.fillColor || '#ffffff'
  const strokeColor = nodeData.strokeColor || (selected ? '#3b82f6' : '#9ca3af')
  const textColor = nodeData.textColor || '#1f2937'
  const strokeWidth = selected ? 3 : 2

  const labelProps: LabelProps = {
    value: nodeData.label,
    editing,
    draft,
    setDraft,
    onCommit: commitLabel,
    onKeyDown: handleKeyDown,
    inputRef,
    color: textColor,
  }

  // ── SVG-backed shapes ──────────────────────────────────────────────────────
  if (IS_SVG_SHAPE.has(shape)) {
    const Renderer = SVG_RENDERERS[shape]!
    const isCylinder = shape === 'cylinder'
    return (
      <div
        className="relative cursor-pointer select-none"
        style={{
          minWidth: 130,
          minHeight: isCylinder ? 80 : 54,
        }}
        onDoubleClick={handleDoubleClick}
      >
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          viewBox={isCylinder ? '0 0 200 120' : '0 0 200 100'}
          preserveAspectRatio="none"
        >
          <Renderer fill={fillColor} stroke={strokeColor} sw={strokeWidth} />
        </svg>
        <div
          className="relative z-10 flex items-center justify-center w-full h-full px-8 py-3"
          style={{ minHeight: isCylinder ? 80 : 54 }}
        >
          <NodeLabel {...labelProps} />
        </div>
        <NodeHandles />
      </div>
    )
  }

  // ── Diamond (CSS rotate-45) ────────────────────────────────────────────────
  if (shape === 'diamond') {
    return (
      <div
        className="relative flex items-center justify-center cursor-pointer select-none"
        style={{
          minWidth: 90,
          minHeight: 90,
          backgroundColor: fillColor,
          border: `${strokeWidth}px solid ${strokeColor}`,
          transform: 'rotate(45deg)',
          borderRadius: 4,
        }}
        onDoubleClick={handleDoubleClick}
      >
        <NodeLabel {...labelProps} rotate />
        <NodeHandles />
      </div>
    )
  }

  // ── CSS-based shapes (rectangle, rounded, stadium, subroutine, circle, double-circle) ──
  const baseStyle: React.CSSProperties = {
    backgroundColor: fillColor,
    border: `${strokeWidth}px solid ${strokeColor}`,
  }

  let extraStyle: React.CSSProperties = {}
  let extraClass = ''

  switch (shape) {
    case 'rounded':
      extraStyle = { borderRadius: 12 }
      break
    case 'stadium':
      extraStyle = { borderRadius: 9999, paddingLeft: 20, paddingRight: 20 }
      break
    case 'subroutine':
      extraStyle = {
        borderRadius: 3,
        outline: `2px solid ${strokeColor}`,
        outlineOffset: 4,
      }
      break
    case 'circle':
      extraStyle = { borderRadius: '50%' }
      extraClass = '!min-w-[80px] !min-h-[80px] !aspect-square'
      break
    case 'double-circle':
      extraStyle = {
        borderRadius: '50%',
        boxShadow: `0 0 0 3px ${fillColor}, 0 0 0 5px ${strokeColor}`,
      }
      extraClass = '!min-w-[80px] !min-h-[80px] !aspect-square'
      break
    default: // rectangle
      extraStyle = { borderRadius: 4 }
  }

  return (
    <div
      className={`relative flex items-center justify-center px-4 py-2.5 cursor-pointer select-none min-w-[100px] ${extraClass}`}
      style={{ ...baseStyle, ...extraStyle }}
      onDoubleClick={handleDoubleClick}
    >
      <NodeHandles />
      <NodeLabel {...labelProps} />
    </div>
  )
}
