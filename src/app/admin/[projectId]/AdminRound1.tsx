'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  project: { id: string; recipient_name: string; round1_end: string; round2_end: string }
  suggestions: Array<{
    id: string
    title: string
    description: string | null
    reason: string | null
    photo_url: string | null
    approved: boolean
    participants: { email: string } | null
  }>
  participants: Array<{ id: string; email: string; round1_done: boolean }>
  totalBudget: number
  adminUrl: string
  adminToken: string
}

export default function AdminRound1({ project, suggestions, participants, totalBudget, adminUrl, adminToken }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [origin, setOrigin] = useState('')
  useEffect(() => { setOrigin(window.location.origin) }, [])

  const toggleSuggestion = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  const copyLink = () => {
    navigator.clipboard.writeText(`${origin}/rejoindre/${project.id}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleApprove = async () => {
    if (!selected.size) return alert('Sélectionne au moins une suggestion.')
    setLoading(true)
    const res = await fetch('/api/admin/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: project.id,
        admin_token: adminToken,
        suggestion_ids: Array.from(selected),
      }),
    })
    if (!res.ok) { alert('Erreur'); setLoading(false); return }
    router.refresh()
  }

  const done = participants.filter(p => p.round1_done).length
  const total = participants.length

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🎁</div>
          <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {project.recipient_name}</h1>
          <p className="text-gray-500 mt-1">Dashboard admin — Round 1</p>
        </div>

        {/* Lien à partager aux participants */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Lien à envoyer aux participants</h2>
            <p className="text-sm text-gray-500">Chacun entre son email en arrivant sur la page.</p>
          </div>
          <div className="flex gap-2">
            <input
              readOnly
              value={`${origin}/rejoindre/${project.id}`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50"
            />
            <button
              onClick={copyLink}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <div className="border-t pt-4">
            <p className="text-xs text-gray-400 mb-1">Ton lien admin (garde-le pour toi)</p>
            <p className="text-xs font-mono text-gray-500 break-all">{origin}{adminUrl}</p>
          </div>
        </div>

        {/* Progression */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Progression</h2>
          <div className="flex items-center gap-4">
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className="bg-indigo-500 h-3 rounded-full transition-all"
                style={{ width: total ? `${(done / total) * 100}%` : '0%' }}
              />
            </div>
            <span className="text-sm font-medium text-gray-600">{done}/{total} participants</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Budget total collecté (anonyme) : <strong>{totalBudget.toFixed(2)} €</strong>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Round 1 ferme le {new Date(project.round1_end).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Suggestions */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-1">Suggestions ({suggestions.length})</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sélectionne celles qui passent au Round 2, puis valide.
          </p>
          {suggestions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Aucune suggestion pour l&apos;instant.</p>
          ) : (
            <div className="space-y-4">
              {suggestions.map(s => (
                <label
                  key={s.id}
                  className={`flex gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                    selected.has(s.id) ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mt-1 h-5 w-5 accent-indigo-600 flex-shrink-0"
                    checked={selected.has(s.id)}
                    onChange={() => toggleSuggestion(s.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      {s.photo_url && (
                        <img src={s.photo_url} alt={s.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        {s.description && <p className="text-sm text-gray-600 mt-1">{s.description}</p>}
                        {s.reason && (
                          <p className="text-sm text-indigo-700 mt-1 italic">&ldquo;{s.reason}&rdquo;</p>
                        )}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}

          {suggestions.length > 0 && (
            <button
              onClick={handleApprove}
              disabled={loading || !selected.size}
              className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Envoi des votes...' : `Valider la sélection et lancer le Round 2 (${selected.size} idée${selected.size > 1 ? 's' : ''})`}
            </button>
          )}
        </div>
      </div>
    </main>
  )
}
