import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const formData = await req.formData()

  const participant_id = formData.get('participant_id') as string
  const project_id = formData.get('project_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const reason = formData.get('reason') as string | null
  const priceRaw = formData.get('price') as string | null
  const price = priceRaw ? parseFloat(priceRaw) : null
  const photo = formData.get('photo') as File | null

  if (!participant_id || !project_id || !title) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    const ext = photo.name.split('.').pop()
    const path = `${project_id}/${participant_id}-${Date.now()}.${ext}`
    const { error: uploadError } = await db.storage
      .from('suggestions')
      .upload(path, photo, { contentType: photo.type })
    if (!uploadError) {
      const { data: urlData } = db.storage.from('suggestions').getPublicUrl(path)
      photo_url = urlData.publicUrl
    }
  }

  const { data, error } = await db
    .from('suggestions')
    .insert({ participant_id, project_id, title, description, reason, price, photo_url })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
