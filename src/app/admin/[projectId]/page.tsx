import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import AdminRound1 from './AdminRound1'
import AdminRound2 from './AdminRound2'
import AdminPayment from './AdminPayment'

interface Props {
  params: Promise<{ projectId: string }>
  searchParams: Promise<{ token?: string }>
}

export default async function AdminPage({ params, searchParams }: Props) {
  const { projectId } = await params
  const { token } = await searchParams
  const db = supabaseAdmin()

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('admin_token', token ?? '')
    .single()

  if (!project) return notFound()

  const { data: suggestions } = await db
    .from('suggestions')
    .select('*, participants(email)')
    .eq('project_id', projectId)

  const { data: participants } = await db
    .from('participants')
    .select('id, email, token, round1_done, round2_done')
    .eq('project_id', projectId)

  const { data: votes } = await db
    .from('votes')
    .select('suggestion_id')
    .eq('project_id', projectId)

  const voteCounts: Record<string, number> = {}
  for (const v of votes ?? []) {
    voteCounts[v.suggestion_id] = (voteCounts[v.suggestion_id] ?? 0) + 1
  }

  const totalBudget = await db
    .from('budgets')
    .select('amount')
    .eq('project_id', projectId)
    .then(({ data }) => (data ?? []).reduce((s, b) => s + b.amount, 0))

  const adminUrl = `/admin/${projectId}?token=${token}`

  if (project.status === 'round1') {
    return (
      <AdminRound1
        project={project}
        suggestions={suggestions ?? []}
        participants={participants ?? []}
        totalBudget={totalBudget}
        adminUrl={adminUrl}
        adminToken={token ?? ''}
      />
    )
  }

  if (project.status === 'round2') {
    return (
      <AdminRound2
        project={project}
        suggestions={(suggestions ?? []).filter(s => s.approved)}
        participants={participants ?? []}
        voteCounts={voteCounts}
        totalBudget={totalBudget}
        adminToken={token ?? ''}
      />
    )
  }

  return (
    <AdminPayment
      project={project}
      winners={(suggestions ?? []).filter(s => s.approved)}
      participants={participants ?? []}
    />
  )
}
