'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Suggestion {
  id: string
  title: string
  description: string | null
  photo_url: string | null
}

interface Props {
  project: { id: string; recipient_name: string; round2_end: string }
  suggestions: Suggestion[]
  participants: Array<{ id: string; email: string; token: string; round2_done: boolean }>
  voteCounts: Record<string, number>
  totalBudget: number
  adminToken: string
}

export default function AdminRound2({ project, suggestions, participants, voteCounts, totalBudget, adminToken }: Props) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState<string>('')
  const [finalCost, setFinalCost] = useState('')
  const [loading, setLoading] = useState(false)
  const [origin, setOrigin] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const done = participants.filter(p => p.round2_done).length
  const total = participants.length
  const maxVotes = Math.max(...Object.values(voteCounts), 1)

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${origin}/${token}/vote`)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const copyAll = () => {
    const links = participants.map(p => `${p.email} : ${origin}/${p.token}/vote`).join('\n')
    navigator.clipboard.writeText(links)
  }

  const handleFinalize = async () => {
    if (!selectedId || !finalCost) return alert('Sélectionne un cadeau et entre le coût final.')
    setLoading(true)
    const res = await fetch('/api/admin/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        admin_token: adminToken,
        selected_suggestion_id: selectedId,
        final_cost: parseFloat(finalCost),
      }),
    })
    if (!res.ok) { alert('Erreur'); setLoading(false); return }
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🗳️</div>
          <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {project.recipient_name}</h1>
          <p className="text-gray-500 mt-1">Dashboard admin — Round 2</p>
        </div>

        {/* Progression votes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Votes en cours</h2>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div className="bg-indigo-500 h-3 rounded-full transition-all" style={{ width: total ? `${(done / total) * 100}%` : '0%' }} />
            </div>
            <span className="text-sm font-medium text-gray-600">{done}/{total} ont voté</span>
          </div>
          <p className="text-sm text-gray-500">
            Budget total disponible : <strong>{totalBudget.toFixed(2)} €</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Round 2 ferme le {new Date(project.round2_end).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Liens de vote à partager */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Liens de vote</h2>
              <p className="text-sm text-gray-500">Envoie le lien à chaque participant par WhatsApp / SMS</p>
            </div>
            <button
              onClick={copyAll}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-800 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Tout copier
            </button>
          </div>
          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.email}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{origin}/{p.token}/vote</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {p.round2_done && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Voté ✓</span>}
                  <button
                    onClick={() => copyLink(p.token)}
                    className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {copiedToken === p.token ? 'Copié !' : 'Copier'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Résultats des votes */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Résultats des votes</h2>
          <div className="space-y-4">
            {suggestions.map(s => {
              const count = voteCounts[s.id] ?? 0
              return (
                <label
                  key={s.id}
                  className={`flex gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    selectedId === s.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="selected"
                    className="mt-1 h-5 w-5 accent-indigo-600 flex-shrink-0"
                    checked={selectedId === s.id}
                    onChange={() => setSelectedId(s.id)}
                  />
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      {s.photo_url && (
                        <img src={s.photo_url} alt={s.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        {s.description && <p className="text-sm text-gray-500 mt-0.5">{s.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${(count / maxVotes) * 100}%` }} />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{count} vote{count > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              )
            })}
          </div>
        </div>

        {/* Finaliser */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Finaliser le cadeau</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sélectionne le cadeau gagnant ci-dessus, entre le prix réel, et génère les liens de paiement.
          </p>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Coût réel du cadeau (€)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="Ex: 85.00"
              value={finalCost}
              onChange={e => setFinalCost(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {finalCost && totalBudget > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                Budget total : {totalBudget.toFixed(2)} € — les participants paieront {((parseFloat(finalCost) / totalBudget) * 100).toFixed(0)}% de leur budget annoncé.
              </p>
            )}
          </div>
          <button
            onClick={handleFinalize}
            disabled={loading || !selectedId || !finalCost}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Calcul en cours...' : 'Valider et générer les liens de paiement'}
          </button>
        </div>
      </div>
    </main>
  )
}
