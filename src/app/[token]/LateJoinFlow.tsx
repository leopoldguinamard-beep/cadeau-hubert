'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { pageBg } from '@/lib/bgStyle'

interface Props {
  participantId: string
  projectId: string
  recipientName: string
  token: string
  recipientPhotoUrl?: string | null
}

export default function LateJoinFlow({ participantId, projectId, recipientName, token, recipientPhotoUrl }: Props) {
  const router = useRouter()
  const bg = pageBg(recipientPhotoUrl)
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const amount = parseFloat(budget)
    if (!amount || amount <= 0) { setError('Entre un budget valide.'); return }
    setError('')
    setLoading(true)

    const res = await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, project_id: projectId, amount }),
    })

    if (!res.ok) { setError('Erreur, réessaie.'); setLoading(false); return }
    router.push(`/${token}/vote`)
  }

  return (
    <main className={`min-h-screen ${bg.className} flex items-center justify-center px-4`} style={bg.style}>
      <div className="max-w-md w-full space-y-5">
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div className="text-center pb-2">
            <div className="text-5xl mb-3">🎁</div>
            <h1 className="text-2xl font-bold text-gray-900">KDO pour {recipientName}</h1>
            <p className="text-gray-500 mt-1">Tu arrives un peu après le début — pas de problème !</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            La phase de suggestions est terminée, mais tu peux encore participer au vote et au KDO.
            Indique juste ton budget pour qu&apos;on calcule ta part.
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Ton budget</h2>
            <p className="text-sm text-gray-500">
              Ce montant est <strong>100% anonyme</strong> — personne ne le verra.
              Il sert uniquement à calculer ta part équitable.
            </p>
          </div>

          <div className="relative">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="25"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              autoFocus
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Valider et voter →'}
          </button>
        </div>
      </div>
    </main>
  )
}
