import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
//endpoint to list all patients, only accessible by doctors, lab technicians, and admins, sorted by name
export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const allowedRoles = ['doctor', 'lab_technician', 'admin']
  if (!allowedRoles.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const patients = await prisma.patient.findMany({
    select: {
      id: true,
      citizenshipNumber: true,
      user: { select: { name: true } },
    },
    orderBy: { user: { name: 'asc' } },
  })

  return NextResponse.json({
    patients: patients.map((p) => ({
      id: p.id,
      name: p.user.name,
      citizenshipNumber: p.citizenshipNumber ?? '',
    })),
  })
}
