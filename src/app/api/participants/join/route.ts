import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { str, emailVal } from '@/lib/validate'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()

  let project_id: string, email: string, first_name: string
  try {
    const body = await req.json()
    project_id = str(body.project_id, 36)
    email = emailVal(body.email)
    first_name = str(body.first_name, 50)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  const { data: project } = await db
    .from('projects')
    .select('status')
    .eq('id', project_id)
    .single()

  if (!project) return NextResponse.json({ error: 'Lien invalide' }, { status: 404 })

  const { data, error } = await db
    .from('participants')
    .upsert({ project_id, email, first_name }, { onConflict: 'project_id,email' })
    .select('token')
    .single()

  if (error) return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })

  return NextResponse.json({ token: data.token })
}
