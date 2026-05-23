import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import type { SessionPayload } from '@/types/auth'

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

function roleHome(role: SessionPayload['role']): string {
  if (role === 'doctor') return '/doctor'
  if (role === 'lab_technician') return '/lab'
  if (role === 'pharmacist') return '/pharmacy'
  if (role === 'hospital_admin' || role === 'government_admin') return '/admin'
  return '/dashboard'
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self)'
  )
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  const isPublic =
    PUBLIC_PATHS.has(pathname) ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/emergency/')

  if (isPublic) {
    if ((pathname === '/login' || pathname === '/register') && token) {
      try {
        const session = await verifyToken(token)
        return addSecurityHeaders(NextResponse.redirect(new URL(roleHome(session.role), request.url)))
      } catch {
        // Invalid token — let them proceed to login
      }
    }
    return addSecurityHeaders(NextResponse.next())
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return addSecurityHeaders(NextResponse.redirect(loginUrl))
  }

  try {
    await verifyToken(token)
    return addSecurityHeaders(NextResponse.next())
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return addSecurityHeaders(response)
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
