interface Props {
  project: { recipient_name: string; final_cost: number | null; admin_phone: string }
  suggestion: { title: string; photo_url: string | null } | null
  participants: Array<{ id: string; email: string }>
}

export default function AdminPayment({ project, suggestion, participants }: Props) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900">C&apos;est parti !</h1>
          <p className="text-gray-500 mt-1">Les participants ont reçu leur lien de paiement.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Récapitulatif</h2>
          {suggestion && (
            <div className="flex gap-4 mb-4">
              {suggestion.photo_url && (
                <img src={suggestion.photo_url} alt={suggestion.title} className="w-24 h-24 object-cover rounded-xl" />
              )}
              <div>
                <p className="text-sm text-gray-500">Cadeau choisi</p>
                <p className="text-xl font-bold text-gray-900">{suggestion.title}</p>
                {project.final_cost && (
                  <p className="text-indigo-600 font-semibold mt-1">{project.final_cost.toFixed(2)} €</p>
                )}
              </div>
            </div>
          )}
          <p className="text-sm text-gray-600">
            {participants.length} participants ont reçu un mail avec leur montant à payer et les liens de paiement vers ton numéro <strong>{project.admin_phone}</strong>.
          </p>
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
