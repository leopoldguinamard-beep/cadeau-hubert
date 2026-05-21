import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()
  const { project_id, email } = await req.json()

  if (!project_id || !email) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data: project } = await db
    .from('projects')
    .select('status')
    .eq('id', project_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })

  // Upsert : retrouve le participant existant ou en crée un nouveau
  const { data, error } = await db
    .from('participants')
    .upsert({ project_id, email }, { onConflict: 'project_id,email' })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ token: data.token })
}
