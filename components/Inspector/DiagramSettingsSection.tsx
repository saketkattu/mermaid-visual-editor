'use client'

import { useShallow } from 'zustand/react/shallow'
import { useFlowStore, type Direction, type Theme, type CurveStyle } from '@/lib/store'
import { applyDagreLayout } from '@/lib/layout'
import { DIRECTIONS, THEMES, CURVE_STYLES } from '@/components/ShapeIcons'

const NEU_BG = 'var(--neu-bg)'

function NeuBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick?: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
      style={{
        background: NEU_BG,
        border: 'none',
        borderRadius: 8,
        boxShadow: active ? 'var(--neu-shadow-inset)' : 'var(--neu-shadow-raised)',
        padding: '5px 10px',
        fontSize: 11,
        fontWeight: 500,
        color: active ? '#4F46E5' : '#6B7280',
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
      }}
    >
      {children}
    </button>
  )
}

const sectionLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: '#9ca3af',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  marginBottom: 10,
}

const subLabelStyle: React.CSSProperties = {
  fontSize: 10,
  color: '#9ca3af',
  marginBottom: 6,
}

const selectStyle: React.CSSProperties = {
  background: NEU_BG,
  boxShadow: 'var(--neu-shadow-concave)',
  border: 'none',
  borderRadius: 8,
  padding: '5px 8px',
  fontSize: 11,
  color: '#374151',
  outline: 'none',
  cursor: 'pointer',
  width: '100%',
}

export function DiagramSettingsSection() {
  const { direction, theme, look, curveStyle, setDirection, setTheme, setLook, setCurveStyle, setNodes } =
    useFlowStore(
      useShallow((s) => ({
        direction: s.direction,
        theme: s.theme,
        look: s.look,
        curveStyle: s.curveStyle,
        setDirection: s.setDirection,
        setTheme: s.setTheme,
        setLook: s.setLook,
        setCurveStyle: s.setCurveStyle,
        setNodes: s.setNodes,
      }))
    )

  const handleDirectionChange = (dir: Direction) => {
    setDirection(dir)
    const { nodes, edges } = useFlowStore.getState()
    if (nodes.length > 0) setNodes(applyDagreLayout(nodes, edges, dir))
  }

  return (
    <div>
      <div style={sectionLabelStyle}>Diagram Settings</div>

      <div
        style={{
          background: NEU_BG,
          borderRadius: 14,
          boxShadow: 'var(--neu-shadow-concave)',
          padding: '14px',
        }}
      >
        {/* Layout */}
        <div style={subLabelStyle}>Layout Direction</div>
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {DIRECTIONS.map(({ value, label, title }) => (
            <NeuBtn key={value} onClick={() => handleDirectionChange(value)} active={direction === value} title={title}>
              {label}
            </NeuBtn>
          ))}
        </div>

        {/* Theme */}
        <div style={subLabelStyle}>Theme</div>
        <div style={{ marginBottom: 10 }}>
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)} className="focus-visible:ring-2 focus-visible:ring-indigo-500" style={selectStyle} aria-label="Theme">
            {THEMES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Curve Style */}
        <div style={subLabelStyle}>Curve Style</div>
        <div style={{ marginBottom: 10 }}>
          <select value={curveStyle} onChange={(e) => setCurveStyle(e.target.value as CurveStyle)} className="focus-visible:ring-2 focus-visible:ring-indigo-500" style={selectStyle} aria-label="Curve Style">
            {CURVE_STYLES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        {/* Hand-drawn */}
        <NeuBtn
          onClick={() => setLook(look === 'handDrawn' ? 'classic' : 'handDrawn')}
          active={look === 'handDrawn'}
          title="Toggle hand-drawn look"
        >
          ✏ Hand-drawn {look === 'handDrawn' ? 'On' : 'Off'}
        </NeuBtn>
      </div>
    </div>
  )
}
