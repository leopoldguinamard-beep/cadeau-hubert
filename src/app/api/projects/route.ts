import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const formData = await req.formData()

  const recipient_name = formData.get('recipient_name') as string
  const message = formData.get('message') as string | null
  const admin_name = formData.get('admin_name') as string
  const admin_email = formData.get('admin_email') as string
  const admin_phone = formData.get('admin_phone') as string
  const round1_end = (formData.get('round1_end') as string) || null
  const round2_end = (formData.get('round2_end') as string) || null
  const payment_deadline = (formData.get('payment_deadline') as string) || null
  const photo = formData.get('photo') as File | null

  if (!recipient_name || !admin_name || !admin_email || !admin_phone) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  let recipient_photo_url: string | null = null
  if (photo && photo.size > 0) {
    if (!ALLOWED_MIME.includes(photo.type)) {
      return NextResponse.json({ error: 'Format d\'image non supporté' }, { status: 400 })
    }
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
    }
  }

  const { data, error } = await db
    .from('projects')
    .insert({ recipient_name, message, admin_name, admin_email, admin_phone, round1_end, round2_end, payment_deadline, recipient_photo_url })
    .select()
    .single()

  if (error) {
    console.error('[projects] insert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }

  return NextResponse.json(data)
}
