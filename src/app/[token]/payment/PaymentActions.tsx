'use client'

import { useState } from 'react'

interface Props {
  phone: string
  amount: number
  adminName: string
}

export default function PaymentActions({ phone, amount, adminName }: Props) {
  const [copied, setCopied] = useState(false)

  const copyPhone = () => {
    navigator.clipboard.writeText(phone)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <p className="font-semibold text-gray-800">Payer {adminName}</p>

      <button
        onClick={copyPhone}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {copied ? '✓ Numéro copié !' : `📋 Copier le numéro : ${phone}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Ouvre Lydia ou Wero, entre ce numéro et envoie{' '}
        <strong>{amount.toFixed(2)} €</strong>
      </p>

      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://sumeria.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#00B4F0' }}
        >
          Lydia
        </a>
        <a
          href="https://wero-wallet.eu/fr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center py-3 px-4 rounded-xl font-semibold text-white text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#5B2D8E' }}
        >
          Wero
        </a>
      </div>
    </div>
  )
}
