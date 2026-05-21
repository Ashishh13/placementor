'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function NotFound() {
  useEffect(() => {
    document.title = '404 — Page Not Found'
  }, [])

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0a0a0f',
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px',
      }}
    >
      <h1 style={{ fontSize: '5rem', fontWeight: 900, margin: 0 }}>404</h1>
      <p style={{ color: '#71717a', margin: '12px 0 24px' }}>Page not found</p>
      <Link
        href="/"
        style={{
          background: 'linear-gradient(to right, #7c3aed, #2563eb)',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '12px',
          textDecoration: 'none',
          fontWeight: 500,
        }}
      >
        Go Home
      </Link>
    </div>
  )
}