import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = 'Cadeau Groupé <onboarding@resend.dev>'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL!

export async function sendRound2Email(
  emails: string[],
  recipientName: string,
  tokens: string[],
  round2End: string
) {
  await Promise.all(
    emails.map((email, i) =>
      resend.emails.send({
        from: FROM,
        to: email,
        subject: `🗳️ C'est l'heure de voter pour le cadeau de ${recipientName} !`,
        html: `
          <h2>Le moment de voter est arrivé !</h2>
          <p>L'admin a sélectionné les meilleures idées. À toi de voter pour ton cadeau préféré.</p>
          <p><a href="${APP_URL}/${tokens[i]}/vote" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Je vote !</a></p>
          <p style="color:#888;font-size:12px;">Les votes ferment le ${new Date(round2End).toLocaleDateString('fr-FR')}.</p>
        `,
      })
    )
  )
}

export async function sendPaymentEmail(
  email: string,
  recipientName: string,
  token: string,
  amountDue: number,
  adminPhone: string,
  paymentDeadline: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `💸 Le cadeau de ${recipientName} est choisi — à toi de payer !`,
    html: `
      <h2>Le cadeau est décidé !</h2>
      <p>Ta part : <strong>${amountDue.toFixed(2)} €</strong></p>
      <p>Envoie l'argent à l'admin via l'application de ton choix :</p>
      <p><a href="${APP_URL}/${token}/payment" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir les liens de paiement</a></p>
      <p>Numéro de l'admin : <strong>${adminPhone}</strong></p>
      <p style="color:#888;font-size:12px;">Deadline : ${new Date(paymentDeadline).toLocaleDateString('fr-FR')}.</p>
    `,
  })
}

export async function sendAdminNotificationEmail(
  adminEmail: string,
  recipientName: string,
  participantEmail: string,
  step: 'round1' | 'round2',
  adminUrl: string
) {
  const stepLabel = step === 'round1' ? '📝 Round 1 — suggestions & budget' : '🗳️ Round 2 — vote'
  const stepDesc = step === 'round1'
    ? 'a soumis ses suggestions et son budget'
    : 'a voté pour son cadeau préféré'

  await resend.emails.send({
    from: FROM,
    to: adminEmail,
    subject: `${step === 'round1' ? '📝' : '🗳️'} ${participantEmail.slice(0, 3)} a répondu — cadeau de ${recipientName}`,
    html: `
      <h2>Nouvelle réponse reçue 🎁</h2>
      <p><strong>${participantEmail}</strong> ${stepDesc}.</p>
      <p>Étape : <strong>${stepLabel}</strong></p>
      <p><a href="${adminUrl}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Voir le dashboard admin</a></p>
    `,
  })
}

export async function sendParticipantInviteEmail(
  email: string,
  recipientName: string,
  token: string,
  adminMessage: string | null,
  round1End: string
) {
  await resend.emails.send({
    from: FROM,
    to: email,
    subject: `🎁 On prépare un cadeau pour ${recipientName} !`,
    html: `
      <h2>On organise un cadeau groupé pour ${recipientName} 🎉</h2>
      ${adminMessage ? `<p><em>"${adminMessage}"</em></p>` : ''}
      <p>Clique ci-dessous pour proposer des idées et indiquer ton budget (anonyme !).</p>
      <p><a href="${APP_URL}/${token}" style="background:#6366f1;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Participer au cadeau</a></p>
      <p style="color:#888;font-size:12px;">Les suggestions ferment le ${new Date(round1End).toLocaleDateString('fr-FR')}.</p>
    `,
  })
}
