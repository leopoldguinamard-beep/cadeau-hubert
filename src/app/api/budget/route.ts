import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { token, project_id, amount } = await req.json()

  if (!token || !project_id || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Champs manquants ou montant invalide' }, { status: 400 })
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

  const { error: budgetError } = await db
    .from('budgets')
    .upsert({ participant_id, project_id, amount }, { onConflict: 'project_id,participant_id' })

  if (budgetError) {
    console.error('[budget] upsert error:', budgetError.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }

  await db.from('participants').update({ round1_done: true }).eq('id', participant_id)

  return NextResponse.json({ ok: true })
}
