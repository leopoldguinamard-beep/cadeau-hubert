import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { buildPaymentLinks } from '@/lib/payment'

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params
  const db = supabaseAdmin()
  const { data: p } = await db.from('participants').select('project_id').eq('token', token).single()
  if (!p) return { title: 'KDO' }
  const { data: project } = await db.from('projects').select('recipient_name, recipient_photo_url').eq('id', p.project_id).single()
  const name = project?.recipient_name ?? ''
  const image = project?.recipient_photo_url
  const title = `💸 C'est l'heure de payer pour le cadeau de ${name} !`
  const description = 'Le cadeau est choisi — envoie ta part à l\'admin !'
  return {
    title,
    description,
    openGraph: { title, description, ...(image && { images: [{ url: image, width: 1200, height: 630, alt: name }] }) },
  }
}

export default async function PaymentPage({ params }: Props) {
  const { token } = await params
  const db = supabaseAdmin()

  const { data: participant } = await db
    .from('participants')
    .select('*, projects(*)')
    .eq('token', token)
    .single()

  if (!participant) return notFound()

  const project = participant.projects as {
    id: string
    recipient_name: string
    admin_phone: string
    final_cost: number | null
    selected_suggestion_id: string | null
    status: string
    payment_deadline: string
    recipient_photo_url: string | null
  }

  const bgStyle = project.recipient_photo_url ? {
    backgroundImage: `linear-gradient(rgba(238,242,255,0.55), rgba(245,243,255,0.55)), url(${project.recipient_photo_url})`,
    backgroundSize: 'cover' as const,
    backgroundPosition: 'center top' as const,
  } : undefined
  const bgClass = project.recipient_photo_url ? '' : 'bg-gradient-to-br from-indigo-50 to-purple-50'

  if (project.status !== 'payment' && project.status !== 'done') {
    return (
      <main className={`min-h-screen ${bgClass} flex items-center justify-center px-4`} style={bgStyle}>
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Le paiement n&apos;est pas encore ouvert</h1>
          <p className="text-gray-600">Consulte tes emails pour la suite.</p>
        </div>
      </main>
    )
  }

  const { data: payment } = await db
    .from('payments')
    .select('amount_due, paid')
    .eq('participant_id', participant.id)
    .single()

  const { data: suggestion } = project.selected_suggestion_id
    ? await db.from('suggestions').select('title, photo_url').eq('id', project.selected_suggestion_id).single()
    : { data: null }

  const paymentLinks = buildPaymentLinks(
    project.admin_phone,
    payment?.amount_due ?? 0,
    `Cadeau pour ${project.recipient_name}`
  )

  return (
    <main className={`min-h-screen ${bgClass} py-10 px-4`} style={bgStyle}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💸</div>
          <h1 className="text-2xl font-bold text-gray-900">Cadeau pour {project.recipient_name}</h1>
          <p className="text-gray-500 mt-1">C&apos;est l&apos;heure de payer !</p>
        </div>

        {suggestion && (
          <div className="bg-white rounded-2xl shadow-sm p-5 flex gap-4 items-center">
            {suggestion.photo_url && (
              <img src={suggestion.photo_url} alt={suggestion.title} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
            )}
            <div>
              <p className="text-sm text-gray-500">Cadeau choisi</p>
              <p className="text-lg font-bold text-gray-900">{suggestion.title}</p>
              {project.final_cost && (
                <p className="text-gray-500 text-sm">Coût total : {project.final_cost.toFixed(2)} €</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-indigo-600 rounded-2xl p-6 text-center text-white">
          <p className="text-indigo-200 text-sm mb-1">Ta part</p>
          <p className="text-4xl font-bold">{payment?.amount_due?.toFixed(2) ?? '—'} €</p>
          <p className="text-indigo-300 text-xs mt-2">
            Deadline : {new Date(project.payment_deadline).toLocaleDateString('fr-FR')}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <div>
            <p className="font-semibold text-gray-800 mb-1">Payer l&apos;admin</p>
            <p className="text-sm text-gray-500 mb-3">
              Numéro : <strong className="text-gray-800 select-all">{project.admin_phone}</strong>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {paymentLinks.map(link => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: link.color }}
              >
                {link.name}
              </a>
            ))}
          </div>
          <p className="text-xs text-gray-400 text-center">
            Entre le numéro de l&apos;admin dans l&apos;appli de ton choix et envoie <strong>{payment?.amount_due?.toFixed(2)} €</strong>.
          </p>
        </div>
      </div>
    </main>
  )
}
