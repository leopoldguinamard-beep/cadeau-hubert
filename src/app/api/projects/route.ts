import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { str, strOpt, emailVal } from '@/lib/validate'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const formData = await req.formData()

  let recipient_name: string, admin_name: string, admin_email: string, admin_phone: string
  let message: string | null
  try {
    recipient_name = str(formData.get('recipient_name'), 100)
    admin_name = str(formData.get('admin_name'), 50)
    admin_email = emailVal(formData.get('admin_email'))
    admin_phone = str(formData.get('admin_phone'), 30)
    message = strOpt(formData.get('message'), 500)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const round1_end = (formData.get('round1_end') as string) || null
  const round2_end = (formData.get('round2_end') as string) || null
  const payment_deadline = (formData.get('payment_deadline') as string) || null
  const photo = formData.get('photo') as File | null

  let recipient_photo_url: string | null = null
  if (photo && photo.size > 0) {
    if (!ALLOWED_MIME.includes(photo.type)) {
      return NextResponse.json({ error: 'Format d\'image non supporté' }, { status: 400 })
    }
    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image trop lourde (max 5 Mo)' }, { status: 400 })
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
