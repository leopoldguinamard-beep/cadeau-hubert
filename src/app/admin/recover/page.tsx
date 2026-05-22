'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function RecoverAdminPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/recover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    setLoading(false)
    if (res.ok) {
      setSent(true)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Une erreur est survenue.')
    }
  }

  if (sent) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-sm">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email envoyé !</h1>
          <p className="text-gray-600">
            Si un projet existe pour <strong>{email}</strong>, tu vas recevoir ton lien admin sous peu.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-5">
          <div className="text-center">
            <div className="text-4xl mb-3">🔑</div>
            <h1 className="text-2xl font-bold text-gray-900">Retrouver mon lien admin</h1>
            <p className="text-gray-500 text-sm mt-2">
              Entre l&apos;adresse email que tu as utilisée pour créer le KDO.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email admin</label>
            <input
              type="email"
              required
              autoFocus
              placeholder="toi@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Envoi...' : 'Recevoir mon lien'}
          </button>

          <p className="text-center text-sm">
            <Link href="/" className="text-indigo-600 hover:underline">← Retour à l&apos;accueil</Link>
          </p>
        </form>
      </div>
    </main>
  )
}
