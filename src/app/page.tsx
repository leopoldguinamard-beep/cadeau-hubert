import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 px-4">
      <div className="text-center max-w-lg">
        <div className="text-6xl mb-6">🎁</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Cadeau Groupé</h1>
        <p className="text-lg text-gray-600 mb-8">
          Organisez facilement un cadeau collectif : suggestions, votes, et paiement — tout en un.
        </p>
        <Link
          href="/admin/create"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors"
        >
          Créer un cadeau groupé
        </Link>
      </div>
    </main>
  )
}
