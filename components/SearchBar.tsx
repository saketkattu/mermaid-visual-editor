'use client'

interface SearchBarProps {
  onOpen: () => void
}

export function SearchBar({ onOpen }: SearchBarProps) {
  return (
    <button
      onClick={onOpen}
      title="Open command palette (⌘K)"
      style={{
        background: 'var(--neu-bg)',
        borderRadius: 50,
        boxShadow: 'var(--neu-shadow-concave)',
        padding: '7px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 240,
        cursor: 'text',
        border: 'none',
        pointerEvents: 'auto',
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <span style={{ fontSize: 12, color: '#9ca3af', userSelect: 'none' }}>
        Search or command…
      </span>
      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#c4cdd8', background: 'var(--neu-bg)', borderRadius: 6, padding: '2px 6px', boxShadow: 'var(--neu-shadow-raised)', fontFamily: 'monospace' }}>
        ⌘K
      </span>
    </button>
  )
}
