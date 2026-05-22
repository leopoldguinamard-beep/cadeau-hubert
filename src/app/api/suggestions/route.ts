import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { str, strOpt, priceOpt } from '@/lib/validate'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const formData = await req.formData()

  let token: string, project_id: string, title: string
  let description: string | null, reason: string | null, price: number | null
  try {
    token = str(formData.get('token'), 36)
    project_id = str(formData.get('project_id'), 36)
    title = str(formData.get('title'), 100)
    description = strOpt(formData.get('description'), 1000)
    reason = strOpt(formData.get('reason'), 500)
    price = priceOpt(formData.get('price'))
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const photo = formData.get('photo') as File | null

  const { data: participant } = await db
    .from('participants')
    .select('id')
    .eq('token', token)
    .eq('project_id', project_id)
    .single()

  if (!participant) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const participant_id = participant.id

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    if (!ALLOWED_MIME.includes(photo.type)) {
      return NextResponse.json({ error: 'Format d\'image non supporté' }, { status: 400 })
    }
    if (photo.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'Image trop lourde (max 5 Mo)' }, { status: 400 })
    }
    const ext = photo.name.split('.').pop()
    const path = `${project_id}/${participant_id}-${Date.now()}.${ext}`
    const { error: uploadError } = await db.storage
      .from('suggestions')
      .upload(path, photo, { contentType: photo.type })
    if (!uploadError) {
      const { data: urlData } = db.storage.from('suggestions').getPublicUrl(path)
      photo_url = urlData.publicUrl
    } else {
      console.error('[suggestions] upload error:', uploadError.message)
    }
  }

  const { data, error } = await db
    .from('suggestions')
    .insert({ participant_id, project_id, title, description, reason, price, photo_url })
    .select()
    .single()

  if (error) {
    console.error('[suggestions] insert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
  return NextResponse.json(data)
}
