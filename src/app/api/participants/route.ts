import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const body = await req.json()
  const { project_id, emails } = body as { project_id: string; emails: string[] }

  if (!project_id || !emails?.length) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const project = await db.from('projects').select('id').eq('id', project_id).single()
  if (project.error) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

  const rows = emails.map(email => ({ project_id, email }))
  const { data, error } = await db.from('participants').upsert(rows, { onConflict: 'project_id,email' }).select()
  if (error) {
    console.error('[participants] upsert error:', error.message)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }

  return NextResponse.json({ count: data?.length })
}
