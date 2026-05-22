import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ---------------------------------------------------------------------------
// Rate limiter — lazily initialised, skipped if env vars are not configured
// ---------------------------------------------------------------------------
let _ratelimit: Ratelimit | null | undefined // undefined = not yet attempted

function getRatelimit(): Ratelimit | null {
  if (_ratelimit !== undefined) return _ratelimit

  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    _ratelimit = null
    return null
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    _ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, '1 m'),
      analytics: false,
    })
    return _ratelimit
  } catch {
    _ratelimit = null
    return null
  }
}

// ---------------------------------------------------------------------------
// Proxy (Next.js 16 — was "middleware" in earlier versions)
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ------------------------------------------------------------------
  // 1. Admin token → HttpOnly cookie
  //    /admin/[projectId]?token=xxx  →  redirect to clean URL + set cookie
  // ------------------------------------------------------------------
  const adminMatch = pathname.match(/^\/admin\/([^/]+)$/)
  if (adminMatch) {
    const token = request.nextUrl.searchParams.get('token')
    if (token) {
      const projectId = adminMatch[1]
      const cleanUrl = new URL(request.url)
      cleanUrl.searchParams.delete('token')

      const response = NextResponse.redirect(cleanUrl)
      response.cookies.set(`admin_${projectId}`, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/',
      })
      return response
    }
  }

  // ------------------------------------------------------------------
  // 2. Rate limiting on API routes (skipped if Upstash not configured)
  // ------------------------------------------------------------------
  if (pathname.startsWith('/api/')) {
    const limiter = getRatelimit()
    if (limiter) {
      try {
        const ip =
          request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          request.headers.get('x-real-ip') ??
          'anonymous'

        const { success } = await limiter.limit(ip)
        if (!success) {
          return NextResponse.json(
            { error: 'Trop de requêtes, réessaie dans une minute.' },
            { status: 429 },
          )
        }
      } catch {
        // Never let a rate-limit error block a real request
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:projectId',
    '/api/:path*',
  ],
}
