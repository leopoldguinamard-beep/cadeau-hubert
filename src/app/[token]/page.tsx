import { supabaseAdmin } from '@/lib/supabase'
import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Round1Flow from './Round1Flow'
import LateJoinFlow from './LateJoinFlow'

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
  const title = `🎁 Cadeau groupé pour ${name}`
  const description = 'Tu es invité(e) à participer à un cadeau groupé !'
  return {
    title,
    description,
    openGraph: { title, description, ...(image && { images: [{ url: image, width: 1200, height: 630, alt: name }] }) },
  }
}

export default async function ParticipantPage({ params }: Props) {
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
    message: string | null
    round1_end: string
    round2_end: string
    status: string
    recipient_photo_url: string | null
  }

  // Phase paiement → redirige directement vers la page de paiement
  if (project.status === 'payment' || project.status === 'done') {
    redirect(`/${token}/payment`)
  }

  // Phase round2
  if (project.status === 'round2') {
    // Déjà voté
    if (participant.round2_done) {
      return (
        <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Vote enregistré !</h1>
            <p className="text-gray-600">Merci — l&apos;admin va bientôt finaliser le cadeau.</p>
          </div>
        </main>
      )
    }
    // A fait le round1 → redirige vers vote
    if (participant.round1_done) {
      redirect(`/${token}/vote`)
    }
    // Arrive en retard (pas fait le round1) → flux de rattrapage
    return (
      <LateJoinFlow
        participantId={participant.id}
        projectId={project.id}
        recipientName={project.recipient_name}
        token={token}
        recipientPhotoUrl={project.recipient_photo_url}
      />
    )
  }

  // Phase round1 — déjà fait
  if (participant.round1_done) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h1>
          <p className="text-gray-600">
            Tes suggestions et ton budget sont enregistrés. Rendez-vous le{' '}
            <strong>{new Date(project.round2_end).toLocaleDateString('fr-FR')}</strong> pour voter !
          </p>
        </div>
      </main>
    )
  }

  // Phase round1 — pas encore fait
  return (
    <Round1Flow
      participantId={participant.id}
      projectId={project.id}
      recipientName={project.recipient_name}
      message={project.message}
      round2End={project.round2_end}
      recipientPhotoUrl={project.recipient_photo_url}
    />
  )
}
