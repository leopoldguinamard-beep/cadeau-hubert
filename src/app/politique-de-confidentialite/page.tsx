import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Politique de confidentialité — KDO',
  description: 'Comment KDO collecte et utilise tes données.',
}

export default function PolitiqueDeConfidentialite() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-8 space-y-6">
        <div>
          <Link href="/" className="text-indigo-600 text-sm hover:underline">← Retour</Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4 mb-1">Politique de confidentialité</h1>
          <p className="text-sm text-gray-400">Dernière mise à jour : mai 2025</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">1. Données collectées</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Lors de ta participation à un KDO, nous collectons :
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Ton prénom et ton adresse email (pour t&apos;identifier et te retrouver)</li>
            <li>Ton budget (stocké de façon anonyme — l&apos;organisateur ne le voit pas)</li>
            <li>Tes idées de KDO et tes votes</li>
            <li>Tes commentaires sur les suggestions</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">2. Utilisation</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Tes données sont utilisées uniquement pour organiser le KDO auquel tu participes.
            Elles ne sont ni vendues, ni partagées avec des tiers.
            Ton budget est utilisé uniquement pour calculer la répartition équitable des coûts.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">3. Conservation</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Tes données sont conservées le temps nécessaire à la réalisation du KDO.
            Tu peux demander la suppression de tes données à tout moment en contactant l&apos;organisateur.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">4. Hébergement</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Les données sont hébergées sur{' '}
            <a href="https://supabase.com" className="text-indigo-600 hover:underline" target="_blank" rel="noopener noreferrer">Supabase</a>
            {' '}(Union européenne).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-800">5. Tes droits</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            Conformément au RGPD, tu as le droit d&apos;accéder, de rectifier et de supprimer tes données.
            Contacte l&apos;organisateur du KDO pour exercer ces droits.
          </p>
        </section>
      </div>
    </main>
  )
}
