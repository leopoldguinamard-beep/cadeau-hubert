import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const body = await req.json()
  const { recipient_name, message, admin_email, admin_phone, round1_end, round2_end, payment_deadline } = body

  if (!recipient_name || !admin_email || !admin_phone || !round1_end || !round2_end || !payment_deadline) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data, error } = await db
    .from('projects')
    .insert({ recipient_name, message, admin_email, admin_phone, round1_end, round2_end, payment_deadline })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
