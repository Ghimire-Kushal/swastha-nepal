import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from '@/lib/auth'
import type { SessionPayload } from '@/types/auth'

const PUBLIC_PATHS = new Set(['/', '/login', '/register'])

function roleHome(role: SessionPayload['role']): string {
  if (role === 'doctor') return '/doctor'
  if (role === 'lab_technician') return '/lab'
  return '/dashboard'
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth-token')?.value

  const isPublic = PUBLIC_PATHS.has(pathname) || pathname.startsWith('/api/')

  if (isPublic) {
    if ((pathname === '/login' || pathname === '/register') && token) {
      try {
        const session = await verifyToken(token)
        return NextResponse.redirect(new URL(roleHome(session.role), request.url))
      } catch {
        // Invalid token — let them proceed to login
      }
    }
    return NextResponse.next()
  }

  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    await verifyToken(token)
    return NextResponse.next()
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('auth-token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
