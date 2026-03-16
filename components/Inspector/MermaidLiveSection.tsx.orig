'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

let initialized = false
let renderId = 0

const NEU_BG = 'var(--neu-bg)'

interface MermaidLiveSectionProps {
  syntax: string
}

function DiagramView({ syntax, containerRef }: { syntax: string; containerRef: React.RefObject<HTMLDivElement | null> }) {
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const render = async () => {
      const id = `mermaid-insp-${++renderId}`
      try {
        const { svg } = await mermaid.render(id, syntax)
        if (containerRef.current) {
          containerRef.current.innerHTML = svg
          setError(null)
        }
      } catch (err) {
        document.getElementById(id)?.remove()
        setError(err instanceof Error ? err.message : 'Render error')
      }
    }
    render()
  }, [syntax, containerRef])

  if (error) {
    return (
      <div style={{ fontSize: 10, color: '#ef4444', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
        {error}
      </div>
    )
  }
  return <div ref={containerRef} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 40 }} />
}

function ExpandModal({ syntax, onClose }: { syntax: string; onClose: () => void }) {
  const modalContainerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(syntax)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)',
        zIndex: 300,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
      }}
    >
      <div
        style={{
          background: NEU_BG,
          borderRadius: 24,
          boxShadow: 'var(--neu-shadow-raised)',
          width: '100%',
          maxWidth: 900,
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Modal header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid rgba(163,177,198,0.3)', flexShrink: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>Mermaid Preview</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleCopy}
              style={{
                background: NEU_BG,
                border: 'none',
                borderRadius: 10,
                boxShadow: copied ? 'var(--neu-shadow-inset)' : 'var(--neu-shadow-raised)',
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 500,
                color: copied ? '#4F46E5' : '#6B7280',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
            >
              {copied ? '✓ Copied' : 'Copy Syntax'}
            </button>
            <button
              onClick={onClose}
              style={{
                background: NEU_BG,
                border: 'none',
                borderRadius: 10,
                boxShadow: 'var(--neu-shadow-raised)',
                width: 34,
                height: 34,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#9ca3af',
                fontSize: 18,
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Diagram area */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            padding: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: NEU_BG,
          }}
        >
          <DiagramView syntax={syntax} containerRef={modalContainerRef} />
        </div>

        {/* Syntax block */}
        <div
          style={{
            background: '#1E2130',
            padding: '14px 20px',
            maxHeight: 140,
            overflow: 'auto',
            flexShrink: 0,
          }}
        >
          <pre style={{ margin: 0, fontSize: 11, color: '#86efac', fontFamily: 'monospace', whiteSpace: 'pre', lineHeight: 1.6 }}>
            {syntax || '— empty —'}
          </pre>
        </div>
      </div>
    </div>
  )
}

export function MermaidLiveSection({ syntax }: MermaidLiveSectionProps) {
  const inlineContainerRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    if (!initialized) {
      mermaid.initialize({ startOnLoad: false, theme: 'default', securityLevel: 'strict' })
      initialized = true
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(syntax)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      {expanded && <ExpandModal syntax={syntax} onClose={() => setExpanded(false)} />}

      <div>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
            Mermaid Live
          </span>

          {/* Expand button */}
          <button
            onClick={() => setExpanded(true)}
            title="Expand preview"
            style={{
              background: NEU_BG,
              border: 'none',
              borderRadius: 8,
              boxShadow: 'var(--neu-shadow-raised)',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6B7280',
              transition: 'box-shadow 0.15s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </button>

          {/* Copy syntax button */}
          <button
            onClick={handleCopy}
            style={{
              background: NEU_BG,
              border: 'none',
              borderRadius: 8,
              boxShadow: copied ? 'var(--neu-shadow-inset)' : 'var(--neu-shadow-raised)',
              padding: '4px 10px',
              fontSize: 11,
              fontWeight: 500,
              color: copied ? '#4F46E5' : '#6B7280',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* Inline preview */}
        <div
          style={{
            background: NEU_BG,
            borderRadius: 14,
            boxShadow: 'var(--neu-shadow-concave)',
            padding: 12,
            minHeight: 80,
            marginBottom: 10,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={() => setExpanded(true)}
          title="Click to expand"
        >
          <DiagramView syntax={syntax} containerRef={inlineContainerRef} />
        </div>

        {/* Syntax dark card */}
        <div
          style={{
            background: '#1E2130',
            borderRadius: 14,
            boxShadow: 'var(--neu-shadow-inset)',
            padding: '12px 14px',
            maxHeight: 140,
            overflow: 'auto',
          }}
        >
          <pre style={{ margin: 0, fontSize: 10, color: '#86efac', fontFamily: 'monospace', whiteSpace: 'pre', lineHeight: 1.6 }}>
            {syntax || '— empty —'}
          </pre>
        </div>
      </div>
    </>
  )
}
