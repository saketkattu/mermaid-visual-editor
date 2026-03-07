import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Mermaid Visual Editor',
  description: 'Visual drag-and-drop editor for Mermaid.js diagrams',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <head><script src="https://mcp.figma.com/mcp/html-to-design/capture.js" async></script></head>
      <body className="antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
