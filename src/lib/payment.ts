interface BudgetEntry {
  participantId: string
  amount: number
}

function r2(n: number) { return Math.floor(n * 100) / 100 }

/**
 * Algorithme de répartition équitable :
 * 1. Part équitable théorique = coût / nb participants
 * 2. Ceux dont le budget < part équitable paient leur budget en totalité
 * 3. Le reste est réparti proportionnellement aux budgets des participants restants
 */
export function computePayments(
  budgets: BudgetEntry[],
  finalCost: number
): { participantId: string; amountDue: number }[] {
  const n = budgets.length
  if (n === 0) return []

  const fairShare = finalCost / n

  const underAvg = budgets.filter(b => b.amount < fairShare)
  const remaining = budgets.filter(b => b.amount >= fairShare)

  const paidByUnder = underAvg.reduce((s, b) => s + b.amount, 0)
  const remainingCost = finalCost - paidByUnder
  const remainingBudgetTotal = remaining.reduce((s, b) => s + b.amount, 0)

  const results: { participantId: string; amountDue: number }[] = []

  for (const b of underAvg) {
    results.push({ participantId: b.participantId, amountDue: r2(b.amount) })
  }

  for (const b of remaining) {
    const share = remainingBudgetTotal > 0
      ? remainingCost * (b.amount / remainingBudgetTotal)
      : remainingCost / remaining.length
    results.push({ participantId: b.participantId, amountDue: r2(share) })
  }

  // Correction d'arrondi : le centime restant va au dernier participant "restant"
  const assigned = results.reduce((s, p) => s + p.amountDue, 0)
  const diff = Math.round((finalCost - assigned) * 100) / 100
  if (diff !== 0 && results.length > 0) {
    results[results.length - 1].amountDue =
      Math.round((results[results.length - 1].amountDue + diff) * 100) / 100
  }

  return results
}

/**
 * Estime la part d'un participant pour un coût donné.
 * Utilisé côté client dans VoteFlow pour l'affichage en temps réel.
 */
export function computeMyShare(
  allBudgets: number[],
  myBudget: number,
  giftCost: number
): number {
  const n = allBudgets.length
  if (n === 0 || giftCost <= 0) return 0

  const fairShare = giftCost / n

  if (myBudget < fairShare) return myBudget

  const paidByUnder = allBudgets.filter(b => b < fairShare).reduce((s, b) => s + b, 0)
  const remainingCost = giftCost - paidByUnder
  const remainingTotal = allBudgets.filter(b => b >= fairShare).reduce((s, b) => s + b, 0)

  return remainingTotal > 0 ? remainingCost * (myBudget / remainingTotal) : 0
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
