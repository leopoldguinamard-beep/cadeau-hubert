'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="fr">
      <body>
        <main
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#eef2ff',
            padding: '1rem',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              textAlign: 'center',
              maxWidth: '24rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>😕</div>
            <h1 style={{ fontWeight: 'bold', fontSize: '1.25rem', marginBottom: '0.5rem', color: '#111827' }}>
              Erreur inattendue
            </h1>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Quelque chose s&apos;est mal passé. Réessaie.
            </p>
            <button
              onClick={reset}
              style={{
                background: '#4f46e5',
                color: 'white',
                fontWeight: '600',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Réessayer
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
