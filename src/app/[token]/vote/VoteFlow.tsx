'use client'

import { useState } from 'react'

interface Suggestion {
  id: string
  title: string
  description: string | null
  reason: string | null
  photo_url: string | null
  price: number | null
}

interface Props {
  participantId: string
  projectId: string
  recipientName: string
  round2End: string
  suggestions: Suggestion[]
  budgetAmount: number   // mon budget individuel
  totalBudget: number    // somme de tous les budgets
  voteCounts: Record<string, number>
  initialVotes: string[]
  alreadyVoted: boolean
}

export default function VoteFlow({
  participantId,
  projectId,
  recipientName,
  round2End,
  suggestions,
  budgetAmount,
  totalBudget,
  voteCounts,
  initialVotes,
  alreadyVoted,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialVotes))
  const [submitted, setSubmitted] = useState(alreadyVoted)
  const [loading, setLoading] = useState(false)

  const maxVotes = Math.max(...Object.values(voteCounts), 1)
  const totalVotes = Object.values(voteCounts).reduce((s, v) => s + v, 0)

  // Somme des prix des cadeaux sélectionnés
  const selectedTotal = Array.from(selected).reduce((sum, id) => {
    const s = suggestions.find(s => s.id === id)
    return sum + (s?.price ?? 0)
  }, 0)

  // Part proportionnelle estimée : ce que je paierais si ces cadeaux étaient retenus
  const myShare = totalBudget > 0 && budgetAmount > 0
    ? selectedTotal * (budgetAmount / totalBudget)
    : selectedTotal

  const gaugePercent = budgetAmount > 0 ? Math.min((myShare / budgetAmount) * 100, 100) : 0
  const isOverBudget = budgetAmount > 0 && myShare > budgetAmount

  // Calcule si l'ajout d'un cadeau ferait dépasser le budget
  const wouldExceed = (price: number) => {
    if (budgetAmount <= 0) return false
    const newShare = totalBudget > 0
      ? (selectedTotal + price) * (budgetAmount / totalBudget)
      : selectedTotal + price
    return newShare > budgetAmount
  }

  const toggle = (id: string) => {
    if (submitted) return
    const s = suggestions.find(s => s.id === id)
    const price = s?.price ?? 0
    const isCurrentlySelected = selected.has(id)

    // Déselectionner : toujours autorisé
    if (isCurrentlySelected) {
      const next = new Set(selected)
      next.delete(id)
      setSelected(next)
      return
    }

    // Sélectionner : bloqué si ça ferait dépasser le budget
    if (wouldExceed(price)) return

    const next = new Set(selected)
    next.add(id)
    setSelected(next)
  }

  const handleSubmit = async () => {
    if (!selected.size) return alert('Vote pour au moins un cadeau.')
    setLoading(true)
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        participant_id: participantId,
        project_id: projectId,
        suggestion_ids: Array.from(selected),
      }),
    })
    setLoading(false)
    if (res.ok) setSubmitted(true)
    else alert('Erreur, réessaie.')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🗳️</div>
          <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {recipientName}</h1>
          <p className="text-gray-500 mt-1">Round 2 — Vote pour ton/tes cadeaux préférés</p>
        </div>

        {/* Jauge budget */}
        {budgetAmount > 0 && !submitted && (
          <div className="bg-white rounded-2xl p-5 border border-indigo-100 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">Ta part estimée</p>
              <p className="text-sm font-semibold">
                <span className={isOverBudget ? 'text-red-600' : 'text-indigo-600'}>
                  {myShare.toFixed(0)} €
                </span>
                <span className="text-gray-400"> / {budgetAmount.toFixed(0)} €</span>
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  isOverBudget ? 'bg-red-500' : gaugePercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${gaugePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {selected.size === 0
                ? 'Sélectionne les cadeaux pour lesquels tu veux voter'
                : isOverBudget
                ? '⚠️ Dépasse ton budget'
                : `Il te resterait ${(budgetAmount - myShare).toFixed(0)} € de marge`}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {suggestions.map(s => {
            const count = voteCounts[s.id] ?? 0
            const isSelected = selected.has(s.id)
            const blocked = !isSelected && wouldExceed(s.price ?? 0)
            return (
              <div
                key={s.id}
                onClick={() => toggle(s.id)}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                  submitted
                    ? 'cursor-default border-transparent'
                    : blocked
                    ? 'cursor-not-allowed border-transparent opacity-40'
                    : isSelected
                    ? 'cursor-pointer border-indigo-500'
                    : 'cursor-pointer border-transparent hover:border-gray-200'
                }`}
              >
                {s.photo_url && (
                  <img src={s.photo_url} alt={s.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{s.title}</p>
                      {s.price != null && (
                        <p className="text-indigo-600 font-bold text-base mt-0.5">
                          {s.price.toFixed(0)} €
                          {totalBudget > 0 && budgetAmount > 0 && (
                            <span className="text-xs font-normal text-gray-400 ml-1">
                              (ta part ≈ {(s.price * budgetAmount / totalBudget).toFixed(0)} €)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    {!submitted && (
                      <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${
                        isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                      }`}>
                        {isSelected && <span className="text-white text-xs">✓</span>}
                      </div>
                    )}
                  </div>
                  {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}

                  {blocked && (
                    <p className="text-xs text-red-400 mt-2">Budget insuffisant pour ajouter ce cadeau</p>
                  )}

                  {submitted && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-indigo-500 h-2 rounded-full transition-all"
                            style={{ width: totalVotes ? `${(count / maxVotes) * 100}%` : '0%' }}
                          />
                        </div>
                        <span className="text-sm text-gray-500">{count} vote{count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={loading || !selected.size}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {loading ? 'Envoi...' : `Valider mon vote (${selected.size} cadeau${selected.size > 1 ? 'x' : ''})`}
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-800 font-medium">
              ✅ Vote enregistré ! Les résultats seront annoncés d&apos;ici le{' '}
              {new Date(round2End).toLocaleDateString('fr-FR')}.
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
