'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { pageBg } from '@/lib/bgStyle'

interface Props {
  projectId: string
  recipientName: string
  recipientPhotoUrl: string | null
}

export default function JoinForm({ projectId, recipientName, recipientPhotoUrl }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bg = pageBg(recipientPhotoUrl)

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/participants/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, email, first_name: firstName }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error ?? 'Une erreur est survenue.')
      setLoading(false)
      return
    }

    router.push(`/${data.token}`)
  }

  return (
    <main className={`min-h-screen ${bg.className} flex items-center justify-center px-4`} style={bg.style}>
      <div className="w-full max-w-sm">
        <form onSubmit={handleJoin} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="text-center pb-2">
            <div className="text-5xl mb-3">🎁</div>
            <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {recipientName}</h1>
            <p className="text-gray-500 mt-2 text-sm">Entre tes infos pour accéder à ta page personnelle.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ton prénom</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Léo"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ton adresse email</label>
            <input
              type="email"
              required
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
            {loading ? 'Chargement...' : "C'est parti !"}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Si tu as déjà participé, tu retrouveras ta progression.
          </p>
        </form>
      </div>
    </main>
  )
}
