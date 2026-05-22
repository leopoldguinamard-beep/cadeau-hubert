import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'KDO — Organisez un KDO facilement',
  description: 'Organisez facilement un KDO : suggestions, vote, et paiement — le tout sans prise de tête.',
}

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 px-4 py-16">
      <div className="max-w-lg w-full space-y-8 text-center">
        <div>
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">KDO</h1>
          <p className="text-lg text-gray-600">
            Organisez un KDO en quelques minutes — idées, vote, et répartition du coût, tout en un.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">📝</span>
            <div>
              <p className="font-semibold text-gray-900">Round 1 — Les idées</p>
              <p className="text-sm text-gray-500">Chaque participant propose des idées et indique son budget (anonyme).</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">🗳️</span>
            <div>
              <p className="font-semibold text-gray-900">Round 2 — Le vote</p>
              <p className="text-sm text-gray-500">L&apos;admin sélectionne les meilleures idées, tout le monde vote.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-2xl">💸</span>
            <div>
              <p className="font-semibold text-gray-900">Paiement</p>
              <p className="text-sm text-gray-500">La répartition est calculée automatiquement, chacun paie sa juste part.</p>
            </div>
          </div>
        </div>

        <Link
          href="/admin/create"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 rounded-2xl text-lg transition-colors"
        >
          Créer un KDO →
        </Link>
      </div>
    </main>
  )
}
