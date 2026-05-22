/**
 * Email sending via Brevo REST API (no SDK, zero extra dependencies).
 * Silently no-ops if BREVO_API_KEY is not configured.
 *
 * Required env vars:
 *   BREVO_API_KEY          — Brevo API key (v3)
 *   BREVO_SENDER_EMAIL     — Verified sender email address
 *   BREVO_SENDER_NAME      — Display name (optional, defaults to "KDO")
 */

interface EmailOptions {
  to: string
  subject: string
  htmlContent: string
}

export async function sendEmail({ to, subject, htmlContent }: EmailOptions): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY not set — skipping email to', to)
    return
  }

  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? 'noreply@example.com'
  const senderName = process.env.BREVO_SENDER_NAME ?? 'KDO'

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('[email] Brevo error', response.status, text)
    }
  } catch (err) {
    console.error('[email] fetch error:', err)
  }
}

/**
 * Construit l'URL de base de l'app depuis la requête entrante.
 * Fiable sur tous les domaines (production, preview, custom domain).
 */
export function getAppUrl(req: { headers: { get: (k: string) => string | null } }): string {
  const host = req.headers.get('host') ?? ''
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

export async function notifyAdmin(
  adminEmail: string,
  subject: string,
  htmlMessage: string,
): Promise<void> {
  await sendEmail({ to: adminEmail, subject, htmlContent: htmlMessage })
}
