import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import JoinForm from './JoinForm'

interface Props {
  params: Promise<{ projectId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projectId } = await params
  const db = supabaseAdmin()

  const { data: project } = await db
    .from('projects')
    .select('recipient_name, recipient_photo_url')
    .eq('id', projectId)
    .single()

  const title = project ? `Cadeau groupé pour ${project.recipient_name} 🎁` : 'KDO'
  const description = 'Tu es invité(e) à participer à un cadeau groupé !'
  const image = project?.recipient_photo_url

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      ...(image && {
        images: [{ url: image, width: 1200, height: 630, alt: project!.recipient_name }],
      }),
    },
  }
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
