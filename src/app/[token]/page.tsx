import { supabaseAdmin } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Round1Flow from './Round1Flow'

interface Props {
  params: Promise<{ token: string }>
}

export default async function ParticipantPage({ params }: Props) {
  const { token } = await params
  const db = supabaseAdmin()

  const { data: participant } = await db
    .from('participants')
    .select('*, projects(*)')
    .eq('token', token)
    .single()

  if (!participant) return notFound()

  const project = participant.projects as {
    id: string
    recipient_name: string
    message: string | null
    round1_end: string
    round2_end: string
    status: string
  }

  if (project.status !== 'round1') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Le Round 1 est terminé</h1>
          <p className="text-gray-600">
            {project.status === 'round2'
              ? 'Consulte ton email — le Round 2 (vote) est en cours !'
              : 'Le cadeau a été choisi. Consulte ton email pour payer.'}
          </p>
        </div>
      </main>
    )
  }

  if (participant.round1_done) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Merci !</h1>
          <p className="text-gray-600">
            Tes suggestions et ton budget sont enregistrés. Rendez-vous le{' '}
            <strong>{new Date(project.round2_end).toLocaleDateString('fr-FR')}</strong> pour voter !
          </p>
        </div>
      </main>
    )
  }

  return (
    <Round1Flow
      participantId={participant.id}
      projectId={project.id}
      recipientName={project.recipient_name}
      message={project.message}
      round2End={project.round2_end}
    />
  )
}
