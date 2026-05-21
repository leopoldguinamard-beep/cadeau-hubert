'use client'

import { useState, useEffect } from 'react'

interface Props {
  project: { id: string; recipient_name: string; final_cost: number | null; admin_phone: string; admin_name?: string | null }
  winners: Array<{ title: string; photo_url: string | null; price: number | null }>
  participants: Array<{ id: string; first_name: string | null; email: string }>
}

export default function AdminPayment({ project, winners, participants }: Props) {
  const [origin, setOrigin] = useState('')
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  useEffect(() => { setOrigin(window.location.origin) }, [])

  const copyLink = () => {
    const url = `${origin}/rejoindre/${project.id}`
    const msg = `💸 Le cadeau de ${project.recipient_name} est choisi ! C'est l'heure de payer ta part. Clique ici : ${url}`
    navigator.clipboard.writeText(msg)
    setCopiedToken('all')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">C&apos;est parti !</h1>
          <p className="text-gray-500 mt-1">Le cadeau est choisi — plus qu&apos;à collecter l&apos;argent.</p>
        </div>

        {/* Récap cadeaux */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">
            Cadeau{winners.length > 1 ? 'x' : ''} choisi{winners.length > 1 ? 's' : ''}
          </h2>
          <div className="space-y-3">
            {winners.map((w, i) => (
              <div key={i} className="flex gap-4">
                {w.photo_url && (
                  <img src={w.photo_url} alt={w.title} className="w-16 h-16 object-cover rounded-xl flex-shrink-0" />
                )}
                <div>
                  <p className="text-lg font-bold text-gray-900">{w.title}</p>
                  {w.price != null && (
                    <p className="text-indigo-600 font-semibold mt-0.5">{w.price.toFixed(2)} €</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          {project.final_cost != null && winners.length > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700">Total : {project.final_cost.toFixed(2)} €</p>
            </div>
          )}
          {project.final_cost != null && winners.length === 1 && (
            <p className="text-indigo-600 font-semibold mt-2">{project.final_cost.toFixed(2)} €</p>
          )}
        </div>

        {/* Lien universel */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
          <div>
            <h2 className="font-semibold text-gray-800 mb-1">Lien à partager</h2>
            <p className="text-sm text-gray-500">Envoie ce lien à tout le monde — chacun entre son email pour voir sa part.</p>
          </div>
          <div className="flex gap-2">
            <input readOnly value={`${origin}/rejoindre/${project.id}`} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono bg-gray-50" />
            <button onClick={copyLink} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              {copiedToken === 'all' ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <div className="border-t pt-3 space-y-1.5">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{p.first_name ?? p.email}</span>
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
