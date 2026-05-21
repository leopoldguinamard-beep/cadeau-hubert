import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { participant_id, suggestion_id, project_id, content } = await req.json()

  if (!participant_id || !suggestion_id || !project_id || !content?.trim()) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data, error } = await db
    .from('comments')
    .insert({ participant_id, suggestion_id, project_id, content: content.trim() })
    .select('id, suggestion_id, participant_id, content, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
