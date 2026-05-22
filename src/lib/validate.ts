/**
 * Input validation helpers for API routes.
 * Throws an Error with a user-facing message if validation fails.
 */

export function str(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') throw new Error('Champ invalide')
  const trimmed = value.trim()
  if (trimmed.length === 0) throw new Error('Champ requis')
  if (trimmed.length > maxLen) throw new Error(`Maximum ${maxLen} caractères`)
  return trimmed
}

export function strOpt(value: unknown, maxLen: number): string | null {
  if (value == null || value === '') return null
  return str(value, maxLen)
}

export function emailVal(value: unknown): string {
  const s = str(value, 254)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new Error('Email invalide')
  return s.toLowerCase()
}

export function positiveNumber(value: unknown, max = 1_000_000): number {
  const n = parseFloat(String(value))
  if (isNaN(n) || n <= 0 || n > max) throw new Error('Nombre invalide')
  return n
}

export function priceOpt(value: unknown): number | null {
  if (value == null || value === '') return null
  const n = parseFloat(String(value))
  if (isNaN(n) || n < 0 || n > 100_000) throw new Error('Prix invalide')
  return n
}

export function uuidStr(value: unknown): string {
  return str(value, 36)
}
