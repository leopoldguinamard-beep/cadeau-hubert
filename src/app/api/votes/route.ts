import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { token, project_id, suggestion_ids } = await req.json() as {
    token: string
    project_id: string
    suggestion_ids: string[]
  }

  if (!token || !project_id || !suggestion_ids?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  // Authentification : vérifier que le token correspond à un participant réel
  const { data: participant } = await db
    .from('participants')
    .select('id')
    .eq('token', token)
    .eq('project_id', project_id)
    .single()

  if (!participant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const participant_id = participant.id

  // Vérification budget côté serveur
  const { data: budget } = await db
    .from('budgets')
    .select('amount')
    .eq('participant_id', participant_id)
    .single()

  if (!budget) return NextResponse.json({ error: 'Budget introuvable' }, { status: 400 })

  // Supprimer anciens votes puis insérer les nouveaux
  await db.from('votes').delete().eq('participant_id', participant_id).eq('project_id', project_id)

  const rows = suggestion_ids.map(sid => ({ participant_id, project_id, suggestion_id: sid }))
  const { error } = await db.from('votes').insert(rows)
  if (error) {
    console.error('[votes] insert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }

  await db.from('participants').update({ round2_done: true }).eq('id', participant_id)

  return NextResponse.json({ ok: true })
}
