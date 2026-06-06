import { NextRequest, NextResponse } from 'next/server'
import { signToken, setAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@/types/auth'

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  patient:          '/dashboard',
  doctor:           '/doctor',
  nurse:            '/nurse',
  lab_technician:   '/lab',
  pharmacist:       '/pharmacy',
  hospital_admin:   '/admin',
  government_admin: '/admin',
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 })
  }

  const { role } = await req.json() as { role: UserRole }
  if (!ROLE_DASHBOARDS[role]) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const user = await prisma.user.findFirst({
    where: { role },
    select: { id: true, name: true, email: true, role: true },
  })

  if (!user) {
    return NextResponse.json({ error: `No ${role} user found in database. Run the seed script first.` }, { status: 404 })
  }

  const token = await signToken({
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  })

  await setAuthCookie(token)

  return NextResponse.json({ ok: true, redirect: ROLE_DASHBOARDS[role] })
}
