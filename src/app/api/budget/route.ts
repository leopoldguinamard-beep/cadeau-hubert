import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { str, positiveNumber } from '@/lib/validate'
import { notifyAdmin } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()

  let token: string, project_id: string, amount: number
  try {
    const body = await req.json()
    token = str(body.token, 36)
    project_id = str(body.project_id, 36)
    amount = positiveNumber(body.amount, 100_000)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const { data: participant } = await db
    .from('participants')
    .select('id, first_name, projects(admin_email, recipient_name, admin_name, admin_token)')
    .eq('token', token)
    .eq('project_id', project_id)
    .single()

  if (!participant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const participant_id = participant.id

  const { error: budgetError } = await db
    .from('budgets')
    .upsert({ participant_id, project_id, amount }, { onConflict: 'project_id,participant_id' })

  if (budgetError) {
    console.error('[budget] upsert error:', budgetError.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }

  await db.from('participants').update({ round1_done: true }).eq('id', participant_id)

  // Notification admin (awaited — serverless would cut fire-and-forget)
  const project = participant.projects as unknown as {
    admin_email: string
    recipient_name: string
    admin_name: string | null
    admin_token: string
  } | null
  if (project?.admin_email) {
    const who = participant.first_name ?? 'Un participant'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const adminLink = `${appUrl}/admin/${project_id}?token=${project.admin_token}`
    await notifyAdmin(
      project.admin_email,
      `💰 ${who} a soumis son budget — KDO de ${project.recipient_name}`,
      `<p><strong>${who}</strong> vient de compléter le Round 1 (idées + budget) pour le KDO de ${project.recipient_name}.</p>
       <p><a href="${adminLink}" style="color:#4f46e5;font-weight:600">→ Voir mon tableau de bord</a></p>`,
    )
  }

  return NextResponse.json({ ok: true })
}
