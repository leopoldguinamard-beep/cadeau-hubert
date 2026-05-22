import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const formData = await req.formData()

  const token = formData.get('token') as string
  const project_id = formData.get('project_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const reason = formData.get('reason') as string | null
  const priceRaw = formData.get('price') as string | null
  const price = priceRaw ? parseFloat(priceRaw) : null
  const photo = formData.get('photo') as File | null

  if (!token || !project_id || !title) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
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

  let photo_url: string | null = null
  if (photo && photo.size > 0) {
    if (!ALLOWED_MIME.includes(photo.type)) {
      return NextResponse.json({ error: 'Format d\'image non supporté' }, { status: 400 })
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
