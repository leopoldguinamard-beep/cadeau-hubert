'use client'

import { useState, useRef, useEffect } from 'react'
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

  const round1Ref = useRef<HTMLInputElement>(null)
  const round2Ref = useRef<HTMLInputElement>(null)
  const paymentRef = useRef<HTMLInputElement>(null)

  // Ouvre le calendrier Round 1 au montage
  useEffect(() => {
    try { round1Ref.current?.showPicker() } catch {}
  }, [])

  // Ouvre le calendrier Round 2 dès que Round 1 est rempli
  useEffect(() => {
    if (form.round1_end) {
      setTimeout(() => { try { round2Ref.current?.showPicker() } catch {} }, 50)
    }
  }, [form.round1_end])

  // Ouvre le calendrier paiement dès que Round 2 est rempli
  useEffect(() => {
    if (form.round2_end) {
      setTimeout(() => { try { paymentRef.current?.showPicker() } catch {} }, 50)
    }
  }, [form.round2_end])

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

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800">Planning</h2>

            {/* Round 1 */}
            <div className="border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📝</span>
                <div>
                  <p className="font-medium text-gray-800 text-sm">Round 1 — Suggestions &amp; budgets</p>
                  <p className="text-xs text-gray-500">Chacun propose des idées et indique un budget anonyme.</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date de fin</label>
                <input
                  ref={round1Ref}
                  type="date"
                  required
                  value={form.round1_end}
                  onChange={e => setForm({ ...form, round1_end: e.target.value, round2_end: '', payment_deadline: '' })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Round 2 — apparaît dès que round1 est rempli */}
            {form.round1_end && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🗳️</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Round 2 — Votes</p>
                    <p className="text-xs text-gray-500">Tu valides les meilleures idées, tout le monde vote pour son préféré.</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date de fin</label>
                  <input
                    ref={round2Ref}
                    type="date"
                    required
                    min={form.round1_end}
                    value={form.round2_end}
                    onChange={e => setForm({ ...form, round2_end: e.target.value, payment_deadline: '' })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

            {/* Paiement — apparaît dès que round2 est rempli */}
            {form.round2_end && (
              <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💸</span>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">Paiement</p>
                    <p className="text-xs text-gray-500">Deadline pour que chacun t&apos;envoie sa part avant d&apos;acheter le cadeau.</p>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date limite</label>
                  <input
                    ref={paymentRef}
                    type="date"
                    required
                    min={form.round2_end}
                    value={form.payment_deadline}
                    onChange={e => setForm({ ...form, payment_deadline: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
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
