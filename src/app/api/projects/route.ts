import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const formData = await req.formData()

  const recipient_name = formData.get('recipient_name') as string
  const message = formData.get('message') as string | null
  const admin_name = formData.get('admin_name') as string
  const admin_email = formData.get('admin_email') as string
  const admin_phone = formData.get('admin_phone') as string
  const round1_end = formData.get('round1_end') as string
  const round2_end = formData.get('round2_end') as string
  const payment_deadline = formData.get('payment_deadline') as string
  const photo = formData.get('photo') as File | null

  if (!recipient_name || !admin_name || !admin_email || !admin_phone || !round1_end || !round2_end || !payment_deadline) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  let recipient_photo_url: string | null = null
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop()
    const path = `recipients/${Date.now()}.${ext}`
    const { error: uploadError } = await db.storage
      .from('suggestions')
      .upload(path, photo, { contentType: photo.type })
    if (uploadError) {
      console.error('[projects] Photo upload failed:', uploadError.message)
    } else {
      const { data: urlData } = db.storage.from('suggestions').getPublicUrl(path)
      recipient_photo_url = urlData.publicUrl
      console.log('[projects] Photo uploaded:', recipient_photo_url)
    }
  }

  const { data, error } = await db
    .from('projects')
    .insert({ recipient_name, message, admin_name, admin_email, admin_phone, round1_end, round2_end, payment_deadline, recipient_photo_url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}
