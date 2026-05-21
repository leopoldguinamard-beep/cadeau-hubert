import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { computePayments } from '@/lib/payment'
import { sendPaymentEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { project_id, admin_token, selected_suggestion_id, final_cost } = await req.json()

  if (!project_id || !admin_token || !selected_suggestion_id || !final_cost) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', project_id)
    .eq('admin_token', admin_token)
    .single()

  if (!project) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

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

  // Mettre à jour le projet
  await db.from('projects').update({
    status: 'payment',
    selected_suggestion_id,
    final_cost,
  }).eq('id', project_id)

  // Envoyer les mails de paiement
  const { data: participants } = await db
    .from('participants')
    .select('id, email, token')
    .eq('project_id', project_id)

  if (participants) {
    await Promise.allSettled(
      participants.map(p => {
        const payment = paymentAmounts.find(pa => pa.participantId === p.id)
        if (!payment) return Promise.resolve()
        return sendPaymentEmail(
          p.email,
          project.recipient_name,
          p.token,
          payment.amountDue,
          project.admin_phone,
          project.payment_deadline
        )
      })
    )
  }

  return NextResponse.json({ ok: true })
}
