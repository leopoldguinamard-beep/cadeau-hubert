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
  if (!apiKey) return // Not configured — silent no-op

  const senderEmail = process.env.BREVO_SENDER_EMAIL ?? 'noreply@example.com'
  const senderName = process.env.BREVO_SENDER_NAME ?? 'KDO'

  try {
    await fetch('https://api.brevo.com/v3/smtp/email', {
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
  } catch {
    // Fire-and-forget: email errors must never crash the main flow
  }
}

/**
 * Notify an admin that something happened in their project.
 */
export async function notifyAdmin(
  adminEmail: string,
  subject: string,
  htmlMessage: string,
): Promise<void> {
  await sendEmail({ to: adminEmail, subject, htmlContent: htmlMessage })
}
