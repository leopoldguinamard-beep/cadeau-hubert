import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendRound2Email } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { project_id, admin_token, suggestion_ids } = await req.json()

  if (!project_id || !admin_token || !suggestion_ids?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .eq('admin_token', admin_token)
    .single()

  if (!project) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  // Approuver les suggestions sélectionnées
  await db.from('suggestions').update({ approved: false }).eq('project_id', project_id)
  await db.from('suggestions').update({ approved: true }).in('id', suggestion_ids)

  // Passer en round2
  await db.from('projects').update({ status: 'round2' }).eq('id', project_id)

  // Envoyer les mails de vote
  const { data: participants } = await db
    .from('participants')
    .select('email, token')
    .eq('project_id', project_id)

  if (participants?.length) {
    await sendRound2Email(
      participants.map(p => p.email),
      project.recipient_name,
      participants.map(p => p.token),
      project.round2_end
    )
  }

  return NextResponse.json({ ok: true })
}
