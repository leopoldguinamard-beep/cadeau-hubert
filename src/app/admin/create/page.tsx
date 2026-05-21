'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateProject() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    recipient_name: '',
    message: '',
    admin_email: '',
    admin_phone: '',
    round1_end: '',
    round2_end: '',
    payment_deadline: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const project = await res.json()
    if (!res.ok) { alert(project.error); setLoading(false); return }

    router.push(`/admin/${project.id}?token=${project.admin_token}`)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🎁</div>
          <h1 className="text-3xl font-bold text-gray-900">Nouveau cadeau groupé</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Le cadeau</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pour qui ?</label>
                <input
                  type="text"
                  required
                  placeholder="Hubert"
                  value={form.recipient_name}
                  onChange={e => setForm({ ...form, recipient_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message pour les participants <span className="text-gray-400">(optionnel)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Hubert a son anniversaire le 15 juin, on s'organise pour lui faire une surprise !"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tes infos (admin)</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ton email</label>
                <input
                  type="email"
                  required
                  placeholder="toi@email.com"
                  value={form.admin_email}
                  onChange={e => setForm({ ...form, admin_email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ton numéro de téléphone <span className="text-gray-400">(pour le paiement)</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="+33 6 12 34 56 78"
                  value={form.admin_phone}
                  onChange={e => setForm({ ...form, admin_phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Dates des rounds</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fin du Round 1 — suggestions &amp; budgets</label>
                <input
                  type="date"
                  required
                  value={form.round1_end}
                  onChange={e => setForm({ ...form, round1_end: e.target.value, round2_end: '', payment_deadline: '' })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${form.round1_end ? 'text-gray-700' : 'text-gray-400'}`}>
                  Fin du Round 2 — votes
                </label>
                <input
                  type="date"
                  required
                  disabled={!form.round1_end}
                  min={form.round1_end}
                  value={form.round2_end}
                  onChange={e => setForm({ ...form, round2_end: e.target.value, payment_deadline: '' })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${form.round2_end ? 'text-gray-700' : 'text-gray-400'}`}>
                  Deadline de paiement
                </label>
                <input
                  type="date"
                  required
                  disabled={!form.round2_end}
                  min={form.round2_end}
                  value={form.payment_deadline}
                  onChange={e => setForm({ ...form, payment_deadline: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-lg transition-colors"
          >
            {loading ? 'Création en cours...' : 'Créer le cadeau groupé'}
          </button>
        </form>
      </div>
    </main>
  )
}
