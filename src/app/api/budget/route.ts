import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendAdminNotificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { participant_id, project_id, amount } = await req.json()

  if (!participant_id || !project_id || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Champs manquants ou montant invalide' }, { status: 400 })
  }

  const { error: budgetError } = await db
    .from('budgets')
    .upsert({ participant_id, project_id, amount }, { onConflict: 'project_id,participant_id' })

  if (budgetError) return NextResponse.json({ error: budgetError.message }, { status: 500 })

  await db.from('participants').update({ round1_done: true }).eq('id', participant_id)

  // Notification admin
  const { data: participant } = await db
    .from('participants')
    .select('email, token')
    .eq('id', participant_id)
    .single()

  const { data: project } = await db
    .from('projects')
    .select('recipient_name, admin_email, admin_token')
    .eq('id', project_id)
    .single()

  if (participant && project) {
    const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/${project_id}?token=${project.admin_token}`
    sendAdminNotificationEmail(
      project.admin_email,
      project.recipient_name,
      participant.email,
      'round1',
      adminUrl
    ).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
