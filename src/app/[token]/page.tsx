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
  const title = `🎁 KDO pour ${name}`
  const description = 'Tu es invité(e) à participer à un KDO !'
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
    admin_name: string | null
    message: string | null
    round1_end: string | null
    round2_end: string | null
    status: string
    recipient_photo_url: string | null
  }
  const adminName = project.admin_name ?? "l'organisateur"

  // Phase paiement → redirige directement vers la page de paiement
  if (project.status === 'payment' || project.status === 'done') {
    redirect(`/${token}/payment`)
  }

  // Phase round2 → redirige vers vote (qu'ils aient déjà voté ou non — on peut modifier)
  if (project.status === 'round2') {
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

  // Phase round1 — fetcher le budget actuel si déjà soumis
  let currentBudget: number | null = null
  if (participant.round1_done) {
    const { data: budgetRow } = await db
      .from('budgets')
      .select('amount')
      .eq('participant_id', participant.id)
      .single()
    currentBudget = budgetRow?.amount ?? null
  }

  return (
    <Round1Flow
      token={token}
      projectId={project.id}
      recipientName={project.recipient_name}
      adminName={adminName}
      message={project.message}
      round2End={project.round2_end}
      recipientPhotoUrl={project.recipient_photo_url}
      alreadySubmitted={participant.round1_done}
      currentBudget={currentBudget}
    />
  )
}
