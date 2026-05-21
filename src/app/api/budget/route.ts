import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

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

  return NextResponse.json({ ok: true })
}
