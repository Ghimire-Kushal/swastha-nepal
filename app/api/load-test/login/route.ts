import { NextRequest, NextResponse } from 'next/server'
import { findUserByEmail } from '@/lib/db'
import { verifyPassword } from '@/lib/password'
import { signToken } from '@/lib/auth'

// Load test only — disabled in production
// Concurrency limiter: prevents bcrypt from saturating the event loop
// under high parallel load. Max 50 active password verifications at once.
const MAX_CONCURRENT = 50
let active = 0
const queue: Array<() => void> = []

function acquire(): Promise<void> {
  return new Promise((resolve) => {
    if (active < MAX_CONCURRENT) {
      active++
      resolve()
    } else {
      queue.push(() => { active++; resolve() })
    }
  })
}

function release() {
  active--
  const next = queue.shift()
  if (next) next()
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  let body: { email?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { email, password } = body
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password required' }, { status: 400 })
  }

  const user = await findUserByEmail(email)
  if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  await acquire()
  let ok: boolean
  try {
    ok = await verifyPassword(password, user.passwordHash)
  } finally {
    release()
  }

  if (!ok) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

  const token = await signToken({ sub: user.id, email: user.email, name: user.name, role: user.role })
  return NextResponse.json({ token, role: user.role, name: user.name })
}
