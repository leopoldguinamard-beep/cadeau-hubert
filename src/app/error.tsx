'use client'

import { useEffect } from 'react'

export default function Error({
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
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
        <div className="text-5xl mb-4">😕</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Une erreur est survenue</h1>
        <p className="text-gray-600 mb-6">
          Ne t&apos;inquiète pas, ça arrive. Réessaie ou contacte l&apos;organisateur.
        </p>
        <button
          onClick={reset}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Réessayer
        </button>
      </div>
    </main>
  )
}
