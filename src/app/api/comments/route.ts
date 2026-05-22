import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { str } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()

  let token: string, suggestion_id: string, project_id: string, content: string
  try {
    const body = await req.json()
    token = str(body.token, 36)
    suggestion_id = str(body.suggestion_id, 36)
    project_id = str(body.project_id, 36)
    content = str(body.content, 500)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

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
    .insert({ participant_id, suggestion_id, project_id, content })
    .select('id, suggestion_id, participant_id, content, created_at')
    .single()

  if (error) {
    console.error('[comments] insert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
  return NextResponse.json(data)
}
