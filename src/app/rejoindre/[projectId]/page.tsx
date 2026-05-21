import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import JoinForm from './JoinForm'

interface Props {
  params: Promise<{ projectId: string }>
}

export default async function JoinPage({ params }: Props) {
  const { projectId } = await params
  const db = supabaseAdmin()

  const { data: project } = await db
    .from('projects')
    .select('id, recipient_name, recipient_photo_url, status')
    .eq('id', projectId)
    .single()

  if (!project) return notFound()

  return (
    <JoinForm
      projectId={project.id}
      recipientName={project.recipient_name}
      recipientPhotoUrl={project.recipient_photo_url}
    />
  )
}
