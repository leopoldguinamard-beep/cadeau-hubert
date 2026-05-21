import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import VoteFlow from './VoteFlow'

interface Props {
  params: Promise<{ token: string }>
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
  }

  if (project.status !== 'round2') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
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

  // Budget collectif total (pour calculer la part proportionnelle de chacun)
  const { data: allBudgets } = await db
    .from('budgets')
    .select('amount')
    .eq('project_id', project.id)
  const totalBudget = (allBudgets ?? []).reduce((s, b) => s + b.amount, 0)

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

  return (
    <VoteFlow
      participantId={participant.id}
      projectId={project.id}
      recipientName={project.recipient_name}
      round2End={project.round2_end}
      suggestions={suggestions ?? []}
      budgetAmount={budget?.amount ?? 0}
      totalBudget={totalBudget}
      recipientPhotoUrl={project.recipient_photo_url}
      voteCounts={voteCounts}
      initialVotes={myVoteIds}
      alreadyVoted={participant.round2_done}
    />
  )
}
