import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { computePayments } from '@/lib/payment'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { project_id, admin_token, selected_suggestion_ids } = await req.json()

  if (!project_id || !admin_token || !selected_suggestion_ids?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .eq('admin_token', admin_token)
    .single()

  if (!project) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  // Calculer le coût final à partir des prix des suggestions sélectionnées
  const { data: selectedSuggestions } = await db
    .from('suggestions')
    .select('id, price')
    .in('id', selected_suggestion_ids)

  const final_cost = (selectedSuggestions ?? []).reduce((sum, s) => sum + (s.price ?? 0), 0)

  if (final_cost <= 0) return NextResponse.json({ error: 'Les suggestions sélectionnées n\'ont pas de prix renseigné.' }, { status: 400 })

  // Récupérer tous les budgets
  const { data: budgets } = await db.from('budgets').select('participant_id, amount').eq('project_id', project_id)
  if (!budgets?.length) return NextResponse.json({ error: 'Aucun budget trouvé' }, { status: 400 })

  const paymentAmounts = computePayments(
    budgets.map(b => ({ participantId: b.participant_id, amount: b.amount })),
    final_cost
  )

  // Insérer les paiements
  const paymentRows = paymentAmounts.map(p => ({
    project_id,
    participant_id: p.participantId,
    amount_due: p.amountDue,
  }))
  await db.from('payments').upsert(paymentRows, { onConflict: 'project_id,participant_id' })

  // Marquer les suggestions gagnantes (approved = true) et les autres (approved = false)
  await db.from('suggestions').update({ approved: false }).eq('project_id', project_id)
  await db.from('suggestions').update({ approved: true }).in('id', selected_suggestion_ids)

  // Mettre à jour le projet
  await db.from('projects').update({
    status: 'payment',
    selected_suggestion_id: selected_suggestion_ids[0],
    final_cost,
  }).eq('id', project_id)

  return NextResponse.json({ ok: true })
}
