import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { emailVal } from '@/lib/validate'
import { sendEmail, getAppUrl } from '@/lib/email'

export async function POST(req: NextRequest) {
  const db = supabaseAdmin()

  let email: string
  try {
    const body = await req.json()
    email = emailVal(body.email)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 })
  }

  // Look up all projects for this admin email
  const { data: projects } = await db
    .from('projects')
    .select('id, admin_token, recipient_name')
    .eq('admin_email', email)

  // Always return success to avoid email enumeration
  if (!projects?.length) {
    return NextResponse.json({ ok: true })
  }

  const baseUrl = getAppUrl(req)

  const linksHtml = projects
    .map(
      p =>
        `<li style="margin-bottom:8px"><strong>KDO de ${p.recipient_name}</strong><br>
        <a href="${baseUrl}/admin/${p.id}?token=${p.admin_token}" style="color:#4f46e5">
          ${baseUrl}/admin/${p.id}?token=${p.admin_token}
        </a></li>`,
    )
    .join('')

  await sendEmail({
    to: email,
    subject: `🔑 Tes liens admin KDO`,
    htmlContent: `
      <p>Bonjour,</p>
      <p>Voici tes liens admin pour accéder à tes projets KDO :</p>
      <ul style="padding-left:1rem">${linksHtml}</ul>
      <p style="color:#6b7280;font-size:12px">
        Garde ces liens précieusement — ils te donnent accès complet à tes projets.
      </p>
    `,
  })

  return NextResponse.json({ ok: true })
}
