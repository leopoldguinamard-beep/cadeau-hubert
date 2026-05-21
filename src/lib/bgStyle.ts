import type { CSSProperties } from 'react'

/** Retourne className + style inline pour le fond de page.
 *  Si photoUrl est fourni : photo en fond avec un léger voile indigo.
 *  Sinon : dégradé indigo-50 → purple-50 par défaut.
 */
export function pageBg(photoUrl: string | null | undefined): {
  className: string
  style?: CSSProperties
} {
  if (!photoUrl) {
    return { className: 'bg-gradient-to-br from-indigo-50 to-purple-50' }
  }
  return {
    className: '',
    style: {
      backgroundImage: `linear-gradient(rgba(238,242,255,0.55), rgba(245,243,255,0.55)), url(${photoUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center top',
    },
  }
}
