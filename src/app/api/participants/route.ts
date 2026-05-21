import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendParticipantInviteEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const body = await req.json()
  const { project_id, emails } = body as { project_id: string; emails: string[] }

  if (!project_id || !emails?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const project = await db.from('projects').select('*').eq('id', project_id).single()
  if (project.error) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

  const rows = emails.map(email => ({ project_id, email }))
  const { data, error } = await db.from('participants').upsert(rows, { onConflict: 'project_id,email' }).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Envoyer les invitations
  await Promise.allSettled(
    (data ?? []).map(p =>
      sendParticipantInviteEmail(
        p.email,
        project.data.recipient_name,
        p.token,
        project.data.message,
        project.data.round1_end
      )
    )
  )

  return NextResponse.json({ count: data?.length })
}
