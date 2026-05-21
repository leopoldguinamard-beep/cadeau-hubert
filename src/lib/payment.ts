interface BudgetEntry {
  participantId: string
  amount: number
}

export function computePayments(
  budgets: BudgetEntry[],
  finalCost: number
): { participantId: string; amountDue: number }[] {
  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)

  if (finalCost >= totalBudget) {
    // Tout le monde paie son budget complet
    return budgets.map(b => ({ participantId: b.participantId, amountDue: b.amount }))
  }

  // Le cadeau coûte moins cher : on réduit en commençant par les plus gros contributeurs
  // Principe d'équité : réduction proportionnelle
  const ratio = finalCost / totalBudget
  const payments = budgets.map(b => ({
    participantId: b.participantId,
    amountDue: Math.floor(b.amount * ratio * 100) / 100, // arrondi au centime inférieur
  }))

  // Correction d'arrondi : le reste va au premier participant
  const assigned = payments.reduce((s, p) => s + p.amountDue, 0)
  const remainder = Math.round((finalCost - assigned) * 100) / 100
  if (remainder > 0 && payments.length > 0) {
    payments[0].amountDue = Math.round((payments[0].amountDue + remainder) * 100) / 100
  }

  return payments
}

export function buildPaymentLinks(phone: string, amount: number, label: string) {
  const encodedLabel = encodeURIComponent(label)
  const cleanPhone = phone.replace(/\s/g, '')

  return [
    {
      name: 'Lydia',
      url: `https://lydia-app.com/pay?phone=${cleanPhone}&amount=${amount}&note=${encodedLabel}`,
      color: '#00B4F0',
    },
    {
      name: 'PayPal',
      url: `https://paypal.me/${cleanPhone.replace('+', '')}/${amount}EUR`,
      color: '#003087',
    },
    {
      name: 'Revolut',
      url: `https://revolut.me/pay`,
      color: '#191C1F',
    },
    {
      name: 'Wero',
      url: `https://wero.eu/send?phone=${cleanPhone}&amount=${amount}&label=${encodedLabel}`,
      color: '#5B2D8E',
    },
  ]
}
