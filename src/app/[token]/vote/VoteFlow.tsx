'use client'

import { useState } from 'react'
import { pageBg } from '@/lib/bgStyle'
import { computeMyShare } from '@/lib/payment'

interface Suggestion {
  id: string
  title: string
  description: string | null
  reason: string | null
  photo_url: string | null
  price: number | null
}

interface Comment {
  id: string
  suggestion_id: string
  participant_id: string
  content: string
  created_at: string
  username: string
}

interface Props {
  participantId: string
  participantName: string
  projectId: string
  recipientName: string
  round2End: string
  suggestions: Suggestion[]
  budgetAmount: number
  allBudgets: number[]
  recipientPhotoUrl?: string | null
  voteCounts: Record<string, number>
  initialVotes: string[]
  alreadyVoted: boolean
  initialComments: Comment[]
}

const QUICK_EMOJIS = ['😂', '❤️', '👍', '🎁', '🎉', '😍', '🔥', '💯', '🤔', '😅']

export default function VoteFlow({
  participantId,
  participantName,
  projectId,
  recipientName,
  round2End,
  suggestions,
  budgetAmount,
  allBudgets,
  recipientPhotoUrl,
  voteCounts,
  initialVotes,
  alreadyVoted,
  initialComments,
}: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set(initialVotes))
  const [submitted, setSubmitted] = useState(alreadyVoted)
  const [loading, setLoading] = useState(false)

  // Commentaires
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({})
  const [submittingComment, setSubmittingComment] = useState<string | null>(null)

  const bg = pageBg(recipientPhotoUrl)
  const myUsername = participantName
  const maxVotes = Math.max(...Object.values(voteCounts), 1)
  const totalVotes = Object.values(voteCounts).reduce((s, v) => s + v, 0)

  const selectedTotal = Array.from(selected).reduce((sum, id) => {
    const s = suggestions.find(s => s.id === id)
    return sum + (s?.price ?? 0)
  }, 0)

  const myShare = budgetAmount > 0
    ? computeMyShare(allBudgets, budgetAmount, selectedTotal)
    : selectedTotal

  const gaugePercent = budgetAmount > 0 ? Math.min((myShare / budgetAmount) * 100, 100) : 0
  const isOverBudget = budgetAmount > 0 && myShare > budgetAmount

  const wouldExceed = (price: number) => {
    if (budgetAmount <= 0) return false
    return computeMyShare(allBudgets, budgetAmount, selectedTotal + price) > budgetAmount
  }

  const toggle = (id: string) => {
    if (submitted) return
    const s = suggestions.find(s => s.id === id)
    const price = s?.price ?? 0
    const isCurrentlySelected = selected.has(id)
    if (isCurrentlySelected) {
      const next = new Set(selected); next.delete(id); setSelected(next); return
    }
    if (wouldExceed(price)) return
    const next = new Set(selected); next.add(id); setSelected(next)
  }

  const handleSubmit = async () => {
    if (!selected.size) return alert('Vote pour au moins un cadeau.')
    setLoading(true)
    const res = await fetch('/api/votes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: participantId, project_id: projectId, suggestion_ids: Array.from(selected) }),
    })
    setLoading(false)
    if (res.ok) setSubmitted(true)
    else alert('Erreur, réessaie.')
  }

  // Commentaires
  const toggleComments = (suggestionId: string) => {
    setExpandedComments(prev => {
      const next = new Set(prev)
      next.has(suggestionId) ? next.delete(suggestionId) : next.add(suggestionId)
      return next
    })
  }

  const appendEmoji = (suggestionId: string, emoji: string) => {
    setCommentInputs(prev => ({ ...prev, [suggestionId]: (prev[suggestionId] ?? '') + emoji }))
    if (!expandedComments.has(suggestionId)) {
      setExpandedComments(prev => new Set(prev).add(suggestionId))
    }
  }

  const submitComment = async (suggestionId: string) => {
    const content = commentInputs[suggestionId]?.trim()
    if (!content) return
    setSubmittingComment(suggestionId)
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: participantId, suggestion_id: suggestionId, project_id: projectId, content }),
    })
    if (res.ok) {
      const created = await res.json()
      setComments(prev => [...prev, { ...created, username: myUsername }])
      setCommentInputs(prev => ({ ...prev, [suggestionId]: '' }))
    }
    setSubmittingComment(null)
  }

  return (
    <main className={`min-h-screen ${bg.className} py-10 px-4`} style={bg.style}>
      <div className="max-w-xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-5 text-center">
          <div className="text-4xl mb-2">🗳️</div>
          <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {recipientName}</h1>
          <p className="text-gray-500 mt-1">
            Round 2 — tu votes en tant que <span className="font-semibold text-indigo-600">{myUsername}</span>
          </p>
        </div>

        {/* Jauge budget */}
        {budgetAmount > 0 && !submitted && (
          <div className="bg-white rounded-2xl p-5 border border-indigo-100 space-y-3">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">Ta part estimée</p>
              <p className="text-sm font-semibold">
                <span className={isOverBudget ? 'text-red-600' : 'text-indigo-600'}>{myShare.toFixed(0)} €</span>
                <span className="text-gray-400"> / {budgetAmount.toFixed(0)} €</span>
              </p>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${isOverBudget ? 'bg-red-500' : gaugePercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                style={{ width: `${gaugePercent}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              {selected.size === 0
                ? 'Sélectionne les cadeaux pour lesquels tu veux voter'
                : isOverBudget ? '⚠️ Dépasse ton budget'
                : `Il te resterait ${(budgetAmount - myShare).toFixed(0)} € de marge`}
            </p>
          </div>
        )}

        {/* Cartes suggestions */}
        <div className="space-y-4">
          {suggestions.map(s => {
            const count = voteCounts[s.id] ?? 0
            const isSelected = selected.has(s.id)
            const blocked = !isSelected && wouldExceed(s.price ?? 0)
            const suggestionComments = comments.filter(c => c.suggestion_id === s.id)
            const isExpandedComments = expandedComments.has(s.id)

            return (
              <div
                key={s.id}
                className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                  submitted ? 'cursor-default border-transparent'
                  : blocked ? 'cursor-not-allowed border-transparent opacity-40'
                  : isSelected ? 'cursor-pointer border-indigo-500'
                  : 'cursor-pointer border-transparent hover:border-gray-200'
                }`}
              >
                {/* Zone de vote (cliquable) */}
                <div onClick={() => toggle(s.id)}>
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
                            {budgetAmount > 0 && allBudgets.length > 0 && (
                              <span className="text-xs font-normal text-gray-400 ml-1">
                                (ta part ≈ {computeMyShare(allBudgets, budgetAmount, s.price).toFixed(0)} €)
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      {!submitted && (
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-1 ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                          {isSelected && <span className="text-white text-xs">✓</span>}
                        </div>
                      )}
                    </div>
                    {s.description && <p className="text-sm text-gray-500 mt-1">{s.description}</p>}
                    {blocked && <p className="text-xs text-red-400 mt-2">Budget insuffisant pour ajouter ce cadeau</p>}

                    {submitted && (
                      <div className="mt-3 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: totalVotes ? `${(count / maxVotes) * 100}%` : '0%' }} />
                        </div>
                        <span className="text-sm text-gray-500">{count} vote{count > 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section commentaires (ne déclenche pas le vote) */}
                <div className="border-t border-gray-100 px-4" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => toggleComments(s.id)}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-indigo-600 py-2.5 transition-colors"
                  >
                    💬 {suggestionComments.length > 0
                      ? `${suggestionComments.length} commentaire${suggestionComments.length > 1 ? 's' : ''}`
                      : 'Commenter'}
                    <span className="ml-0.5">{isExpandedComments ? '▲' : '▼'}</span>
                  </button>

                  {isExpandedComments && (
                    <div className="pb-4 space-y-3">
                      {/* Liste des commentaires */}
                      {suggestionComments.length > 0 && (
                        <div className="space-y-2">
                          {suggestionComments.map(c => (
                            <div key={c.id} className="flex items-start gap-2">
                              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0 mt-0.5">
                                {c.username}
                              </div>
                              <div className="bg-gray-50 rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-gray-800 flex-1 break-words">
                                {c.content}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Emojis rapides */}
                      <div className="flex gap-1.5 flex-wrap">
                        {QUICK_EMOJIS.map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => appendEmoji(s.id, emoji)}
                            className="text-xl hover:scale-125 transition-transform active:scale-95"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      {/* Champ de saisie */}
                      <div className="flex gap-2 items-center">
                        <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                          {myUsername}
                        </div>
                        <input
                          type="text"
                          placeholder="Ton commentaire..."
                          value={commentInputs[s.id] ?? ''}
                          onChange={e => setCommentInputs(prev => ({ ...prev, [s.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') submitComment(s.id) }}
                          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => submitComment(s.id)}
                          disabled={!commentInputs[s.id]?.trim() || submittingComment === s.id}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-40 hover:bg-indigo-700 transition-colors"
                        >
                          {submittingComment === s.id ? '…' : '→'}
                        </button>
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
