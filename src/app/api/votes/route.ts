import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { participant_id, project_id, suggestion_ids } = await req.json() as {
    participant_id: string
    project_id: string
    suggestion_ids: string[]
  }

  if (!participant_id || !project_id || !suggestion_ids?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  // Budget total vs coût des cadeaux votés : vérification côté serveur
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
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await db.from('participants').update({ round2_done: true }).eq('id', participant_id)

  return NextResponse.json({ ok: true })
}
