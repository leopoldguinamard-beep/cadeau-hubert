import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { str } from '@/lib/validate'
import { notifyAdmin } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()

  let token: string, project_id: string, suggestion_ids: string[]
  try {
    const body = await req.json() as {
      token: unknown
      project_id: unknown
      suggestion_ids: unknown
    }
    token = str(body.token, 36)
    project_id = str(body.project_id, 36)
    if (!Array.isArray(body.suggestion_ids) || !body.suggestion_ids.length) {
      throw new Error('Aucune suggestion sélectionnée')
    }
    suggestion_ids = (body.suggestion_ids as unknown[]).map(id => str(id, 36))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const { data: participant } = await db
    .from('participants')
    .select('id, first_name, projects(admin_email, recipient_name, admin_token)')
    .eq('token', token)
    .eq('project_id', project_id)
    .single()

  if (!participant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const participant_id = participant.id

  const { data: budget } = await db
    .from('budgets')
    .select('amount')
    .eq('participant_id', participant_id)
    .single()

  if (!budget) return NextResponse.json({ error: 'Budget introuvable' }, { status: 400 })

  await db.from('votes').delete().eq('participant_id', participant_id).eq('project_id', project_id)

  const rows = suggestion_ids.map(sid => ({ participant_id, project_id, suggestion_id: sid }))
  const { error } = await db.from('votes').insert(rows)
  if (error) {
    console.error('[votes] insert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }

  await db.from('participants').update({ round2_done: true }).eq('id', participant_id)

  // Fire-and-forget admin notification
  const project = participant.projects as unknown as {
    admin_email: string
    recipient_name: string
    admin_token: string
  } | null
  if (project?.admin_email) {
    const who = participant.first_name ?? 'Un participant'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
    const adminLink = `${appUrl}/admin/${project_id}?token=${project.admin_token}`
    notifyAdmin(
      project.admin_email,
      `🗳️ ${who} a voté — KDO de ${project.recipient_name}`,
      `<p><strong>${who}</strong> vient de voter pour le KDO de ${project.recipient_name}.</p>
       <p><a href="${adminLink}" style="color:#4f46e5;font-weight:600">→ Voir mon tableau de bord</a></p>`,
    )
  }

  return NextResponse.json({ ok: true })
}
