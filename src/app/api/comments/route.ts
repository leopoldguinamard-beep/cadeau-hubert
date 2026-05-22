import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { token, suggestion_id, project_id, content } = await req.json()

  if (!token || !suggestion_id || !project_id || !content?.trim()) {
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

  const { data, error } = await db
    .from('comments')
    .insert({ participant_id, suggestion_id, project_id, content: content.trim() })
    .select('id, suggestion_id, participant_id, content, created_at')
    .single()

  if (error) {
    console.error('[comments] insert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
  return NextResponse.json(data)
}
