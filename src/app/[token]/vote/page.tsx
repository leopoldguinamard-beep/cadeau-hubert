import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import VoteFlow from './VoteFlow'

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
  const title = `🗳️ Vote pour le cadeau de ${name} !`
  const description = 'Les idées sont sélectionnées — à toi de voter pour ton cadeau préféré !'
  return {
    title,
    description,
    openGraph: { title, description, ...(image && { images: [{ url: image, width: 1200, height: 630, alt: name }] }) },
  }
}

export default async function VotePage({ params }: Props) {
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
    round2_end: string
    status: string
    recipient_photo_url: string | null
    admin_name: string | null
  }

  if (project.status !== 'round2') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center max-w-md">
          <div className="text-5xl mb-4">{project.status === 'round1' ? '⏳' : '✅'}</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {project.status === 'round1' ? 'Le Round 2 n\'est pas encore ouvert' : 'Les votes sont clôturés'}
          </h1>
          <p className="text-gray-600">Consulte tes emails pour la suite.</p>
        </div>
      </main>
    )
  }

  const { data: suggestions } = await db
    .from('suggestions')
    .select('id, title, description, reason, photo_url, price')
    .eq('project_id', project.id)
    .eq('approved', true)

  const { data: budget } = await db
    .from('budgets')
    .select('amount')
    .eq('participant_id', participant.id)
    .single()

  // Tous les budgets (pour calculer la part selon l'algorithme équitable)
  const { data: allBudgetsRaw } = await db
    .from('budgets')
    .select('amount')
    .eq('project_id', project.id)
  const allBudgets = (allBudgetsRaw ?? []).map(b => b.amount)

  // Votes de tous pour afficher les résultats
  const { data: allVotes } = await db
    .from('votes')
    .select('suggestion_id')
    .eq('project_id', project.id)

  const voteCounts: Record<string, number> = {}
  for (const v of allVotes ?? []) {
    voteCounts[v.suggestion_id] = (voteCounts[v.suggestion_id] ?? 0) + 1
  }

  // Votes existants de ce participant
  const { data: myVotes } = await db
    .from('votes')
    .select('suggestion_id')
    .eq('participant_id', participant.id)

  const myVoteIds = (myVotes ?? []).map(v => v.suggestion_id)

  // Commentaires
  const { data: commentsRaw } = await db
    .from('comments')
    .select('id, suggestion_id, participant_id, content, created_at, participants(first_name, email)')
    .eq('project_id', project.id)
    .order('created_at', { ascending: true })

  const getDisplayName = (p: { first_name?: string | null; email?: string } | null) => {
    if (p?.first_name) return p.first_name
    const email = p?.email ?? ''
    const part = email.slice(0, 3)
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
  }

  const initialComments = (commentsRaw ?? []).map(c => ({
    id: c.id as string,
    suggestion_id: c.suggestion_id as string,
    participant_id: c.participant_id as string,
    content: c.content as string,
    created_at: c.created_at as string,
    username: getDisplayName(c.participants as unknown as { first_name?: string | null; email?: string } | null),
  }))

  return (
    <VoteFlow
      participantId={participant.id}
      participantName={participant.first_name ?? getDisplayName({ email: participant.email })}
      projectId={project.id}
      recipientName={project.recipient_name}
      round2End={project.round2_end}
      suggestions={suggestions ?? []}
      budgetAmount={budget?.amount ?? 0}
      allBudgets={allBudgets}
      recipientPhotoUrl={project.recipient_photo_url}
      voteCounts={voteCounts}
      initialVotes={myVoteIds}
      alreadyVoted={participant.round2_done}
      initialComments={initialComments}
    />
  )
}
