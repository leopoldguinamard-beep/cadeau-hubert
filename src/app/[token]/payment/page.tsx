import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { pageBg } from '@/lib/bgStyle'
import PaymentActions from './PaymentActions'

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
  const title = `💸 C'est l'heure de payer pour le KDO de ${name} !`
  const description = `Le KDO est choisi — envoie ta part !`
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
    admin_name: string | null
    admin_phone: string
    final_cost: number | null
    selected_suggestion_id: string | null
    status: string
    payment_deadline: string | null
    recipient_photo_url: string | null
  }
  const adminName = project.admin_name ?? "l'organisateur"

  const bg = pageBg(project.recipient_photo_url)

  if (project.status !== 'payment' && project.status !== 'done') {
    return (
      <main className={`min-h-screen ${bg.className} flex items-center justify-center px-4`} style={bg.style}>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
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

  const { data: winners } = await db
    .from('suggestions')
    .select('title, photo_url, price')
    .eq('project_id', project.id)
    .eq('approved', true)

  return (
    <main className={`min-h-screen ${bg.className} py-10 px-4`} style={bg.style}>
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">💸</div>
          <h1 className="text-2xl font-bold text-gray-900">KDO pour {project.recipient_name}</h1>
          <p className="text-gray-500 mt-1">C&apos;est l&apos;heure de payer !</p>
        </div>

        {winners && winners.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
            <p className="text-sm text-gray-500">KDO{winners.length > 1 ? 's choisis' : ' choisi'}</p>
            {winners.map((w, i) => (
              <div key={i} className="flex gap-4 items-center">
                {w.photo_url && (
                  <Image src={w.photo_url} alt={w.title} width={80} height={80} className="w-20 h-20 object-cover rounded-xl flex-shrink-0" />
                )}
                <div>
                  <p className="text-lg font-bold text-gray-900">{w.title}</p>
                  {w.price != null && (
                    <p className="text-gray-400 text-sm">{w.price.toFixed(2)} €</p>
                  )}
                </div>
              </div>
            ))}
            {project.final_cost && winners.length > 1 && (
              <p className="text-sm text-gray-500 border-t pt-3">Coût total : <strong>{project.final_cost.toFixed(2)} €</strong></p>
            )}
          </div>
        )}

        <div className="bg-indigo-600 rounded-2xl p-6 text-center text-white">
          <p className="text-indigo-200 text-sm mb-1">Ta part</p>
          <p className="text-4xl font-bold">{payment?.amount_due?.toFixed(2) ?? '—'} €</p>
          <p className="text-indigo-300 text-xs mt-2">
            {project.payment_deadline ? <>Deadline : {new Date(project.payment_deadline).toLocaleDateString('fr-FR')}</> : 'Règle dès que possible'}
          </p>
        </div>

        <PaymentActions
          phone={project.admin_phone}
          amount={payment?.amount_due ?? 0}
          adminName={adminName}
        />
      </div>
    </main>
  )
}
