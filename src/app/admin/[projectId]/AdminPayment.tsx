'use client'

import { useState, useEffect } from 'react'

interface Props {
  project: { recipient_name: string; final_cost: number | null; admin_phone: string }
  suggestion: { title: string; photo_url: string | null } | null
  participants: Array<{ id: string; email: string; token: string }>
}

export default function AdminPayment({ project, suggestion, participants }: Props) {
  const [origin, setOrigin] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(`${origin}/${token}/payment`)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const copyAll = () => {
    const links = participants.map(p => `${p.email} : ${origin}/${p.token}/payment`).join('\n')
    navigator.clipboard.writeText(links)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">C&apos;est parti !</h1>
          <p className="text-gray-500 mt-1">Le cadeau est choisi — plus qu&apos;à collecter l&apos;argent.</p>
        </div>

        {/* Récap cadeau */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Cadeau choisi</h2>
          {suggestion && (
            <div className="flex gap-4">
              {suggestion.photo_url && (
                <img src={suggestion.photo_url} alt={suggestion.title} className="w-24 h-24 object-cover rounded-xl flex-shrink-0" />
              )}
              <div>
                <p className="text-xl font-bold text-gray-900">{suggestion.title}</p>
                {project.final_cost && (
                  <p className="text-indigo-600 font-semibold mt-1">{project.final_cost.toFixed(2)} €</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Liens de paiement individuels */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-800">Liens de paiement</h2>
              <p className="text-sm text-gray-500">Envoie le lien à chaque participant — il verra son montant exact</p>
            </div>
            <button
              onClick={copyAll}
              className="text-sm text-indigo-600 font-medium border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Tout copier
            </button>
          </div>
          <div className="space-y-2">
            {participants.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.email}</p>
                  <p className="text-xs text-gray-400 font-mono truncate">{origin}/{p.token}/payment</p>
                </div>
                <button
                  onClick={() => copyLink(p.token)}
                  className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex-shrink-0"
                >
                  {copiedToken === p.token ? 'Copié !' : 'Copier'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 text-center">
          <p className="text-indigo-800 font-medium">
            Tous les participants vont t&apos;envoyer l&apos;argent, n&apos;hésite pas à les relancer dans deux jours si besoin, puis achète le cadeau. Bon anniversaire à {project.recipient_name} ! 🎂
          </p>
        </div>
      </div>
    </main>
  )
}
