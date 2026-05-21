export type ProjectStatus = 'round1' | 'round2' | 'payment' | 'done'

export interface Project {
  id: string
  admin_token: string
  recipient_name: string
  message: string | null
  admin_email: string
  admin_phone: string
  round1_end: string
  round2_end: string
  payment_deadline: string
  selected_suggestion_id: string | null
  final_cost: number | null
  status: ProjectStatus
  created_at: string
}

export interface Participant {
  id: string
  project_id: string
  email: string
  token: string
  round1_done: boolean
  round2_done: boolean
  created_at: string
}

export interface Suggestion {
  id: string
  project_id: string
  participant_id: string
  title: string
  description: string | null
  reason: string | null
  photo_url: string | null
  approved: boolean
  created_at: string
}

export interface Budget {
  id: string
  project_id: string
  participant_id: string
  amount: number
  created_at: string
}

export interface Vote {
  id: string
  project_id: string
  participant_id: string
  suggestion_id: string
  created_at: string
}

export interface Payment {
  id: string
  project_id: string
  participant_id: string
  amount_due: number
  paid: boolean
  created_at: string
}
