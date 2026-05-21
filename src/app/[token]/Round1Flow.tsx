'use client'

import { useState } from 'react'

type Step = 'suggestions' | 'budget' | 'done'

interface SuggestionDraft {
  title: string
  description: string
  price: string
  photo: File | null
}

interface Props {
  participantId: string
  projectId: string
  recipientName: string
  message: string | null
  round2End: string
}

function blankDraft(): SuggestionDraft {
  return { title: '', description: '', price: '', photo: null }
}

export default function Round1Flow({ participantId, projectId, recipientName, message, round2End }: Props) {
  const [step, setStep] = useState<Step>('suggestions')
  const [drafts, setDrafts] = useState<SuggestionDraft[]>([blankDraft()])
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const updateDraft = (i: number, field: keyof SuggestionDraft, value: string | File | null) => {
    setDrafts(prev => prev.map((d, idx) => idx === i ? { ...d, [field]: value } : d))
  }

  const addDraft = () => setDrafts(prev => [...prev, blankDraft()])
  const removeDraft = (i: number) => setDrafts(prev => prev.filter((_, idx) => idx !== i))

  const submitSuggestions = async () => {
    const filled = drafts.filter(d => d.title.trim())
    if (!filled.length) { setErrors(['Ajoute au moins une idée.']); return }
    setErrors([])
    setLoading(true)

    for (const d of filled) {
      const fd = new FormData()
      fd.append('participant_id', participantId)
      fd.append('project_id', projectId)
      fd.append('title', d.title.trim())
      if (d.description) fd.append('description', d.description)
      if (d.price) fd.append('price', d.price)
      if (d.photo) fd.append('photo', d.photo)
      const res = await fetch('/api/suggestions', { method: 'POST', body: fd })
      if (!res.ok) {
        setLoading(false)
        setErrors([`Erreur lors de l'envoi de "${d.title.trim()}". Réessaie.`])
        return
      }
    }

    setLoading(false)
    setStep('budget')
  }

  const submitBudget = async () => {
    const amount = parseFloat(budget)
    if (!amount || amount <= 0) { setErrors(['Entre un budget valide.']); return }
    setErrors([])
    setLoading(true)

    const res = await fetch('/api/budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant_id: participantId, project_id: projectId, amount }),
    })

    setLoading(false)
    if (!res.ok) { setErrors(['Erreur, réessaie.']); return }
    setStep('done')
  }

  if (step === 'done') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h1>
          <p className="text-gray-600">
            Tes idées et ton budget (anonyme) sont enregistrés. Rendez-vous le{' '}
            <strong>{new Date(round2End).toLocaleDateString('fr-FR')}</strong> pour voter !
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎁</div>
          <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {recipientName}</h1>
          {message && <p className="text-gray-600 mt-1 italic">&ldquo;{message}&rdquo;</p>}
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(['suggestions', 'budget'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-0.5 bg-gray-200" />}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>{i + 1}</div>
            </div>
          ))}
        </div>

        {step === 'suggestions' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Idées de cadeau pour {recipientName}</h2>
              <p className="text-sm text-gray-500">Tu peux en proposer plusieurs.</p>
            </div>

            {drafts.map((d, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-gray-700">Idée {i + 1}</p>
                  {drafts.length > 1 && (
                    <button onClick={() => removeDraft(i)} className="text-red-400 text-sm hover:text-red-600">
                      Supprimer
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Nom du cadeau *"
                  value={d.title}
                  onChange={e => updateDraft(i, 'title', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Prix estimé *"
                    value={d.price}
                    onChange={e => updateDraft(i, 'price', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Description, pourquoi ce serait une bonne idée... (optionnel)"
                  value={d.description}
                  onChange={e => updateDraft(i, 'description', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Photo (optionnel)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => updateDraft(i, 'photo', e.target.files?.[0] ?? null)}
                    className="text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:border-0 file:rounded-lg file:bg-indigo-50 file:text-indigo-700 file:font-medium hover:file:bg-indigo-100"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addDraft}
              className="w-full border-2 border-dashed border-indigo-300 text-indigo-600 rounded-xl py-3 text-sm font-medium hover:bg-indigo-50 transition-colors"
            >
              + Ajouter une autre idée
            </button>

            {errors.map((e, i) => <p key={i} className="text-red-500 text-sm">{e}</p>)}

            <button
              onClick={submitSuggestions}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Envoi...' : 'Suivant : mon budget'}
            </button>
          </div>
        )}

        {step === 'budget' && (
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Ton budget</h2>
              <p className="text-sm text-gray-500">
                Ce montant est <strong>100% anonyme</strong> — personne, même l&apos;admin, ne saura ce que tu as mis.
                Il sert uniquement à calculer la répartition équitable des coûts.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (€)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  placeholder="25"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10"
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">€</span>
              </div>
            </div>

            {errors.map((e, i) => <p key={i} className="text-red-500 text-sm">{e}</p>)}

            <button
              onClick={submitBudget}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Enregistrement...' : 'Valider mon budget'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
