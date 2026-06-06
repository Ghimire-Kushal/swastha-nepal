import { NextRequest, NextResponse } from 'next/server'
import { signToken, setAuthCookie } from '@/lib/auth'
import type { UserRole } from '@/types/auth'

const DEMO_USERS: Record<UserRole, { sub: string; name: string; email: string }> = {
  patient:          { sub: '00000000-0000-0000-0000-000000000001', name: 'Demo Patient',         email: 'patient@demo.dev' },
  doctor:           { sub: '00000000-0000-0000-0000-000000000002', name: 'Dr. Demo Doctor',      email: 'doctor@demo.dev' },
  nurse:            { sub: '00000000-0000-0000-0000-000000000003', name: 'Demo Nurse',            email: 'nurse@demo.dev' },
  lab_technician:   { sub: '00000000-0000-0000-0000-000000000004', name: 'Demo Lab Tech',         email: 'lab@demo.dev' },
  pharmacist:       { sub: '00000000-0000-0000-0000-000000000005', name: 'Demo Pharmacist',       email: 'pharmacist@demo.dev' },
  hospital_admin:   { sub: '00000000-0000-0000-0000-000000000006', name: 'Demo Hospital Admin',   email: 'hospital@demo.dev' },
  government_admin: { sub: '00000000-0000-0000-0000-000000000007', name: 'Demo Gov Admin',        email: 'gov@demo.dev' },
}

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
  const user = DEMO_USERS[role]
  if (!user) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  const token = await signToken({
    sub: user.sub,
    email: user.email,
    name: user.name,
    role,
  })

  await setAuthCookie(token)

  return NextResponse.json({ ok: true, redirect: ROLE_DASHBOARDS[role] })
}
