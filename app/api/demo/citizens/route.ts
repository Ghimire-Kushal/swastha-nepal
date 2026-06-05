/**
 * Demo citizen lookup API — simulates what Nepal's national citizenship API would return.
 * Since the real citizenship/NID API is not publicly accessible, this endpoint serves
 * 1000 pre-seeded demo citizens for development and demonstration purposes.
 *
 * GET /api/demo/citizens?citizenshipNumber=XX-XX-XX-XXXXX  — exact lookup
 * GET /api/demo/citizens?q=search&limit=20                 — search by name or citizenship number
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const ALLOWED_ROLES = ['doctor', 'lab_technician', 'hospital_admin', 'government_admin', 'pharmacist', 'nurse']

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!ALLOWED_ROLES.includes(session.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = request.nextUrl
  const citizenshipNumber = searchParams.get('citizenshipNumber')?.trim()
  const q = searchParams.get('q')?.trim()
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)

  // ── Exact citizenship number lookup ────────────────────────────────────────
  if (citizenshipNumber) {
    const patient = await prisma.patient.findUnique({
      where: { citizenshipNumber },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
    })

    if (!patient) {
      return NextResponse.json(
        { found: false, error: 'No citizen found with this citizenship number' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      found: true,
      citizen: formatCitizen(patient),
    })
  }

  // ── Search by name or citizenship number prefix ────────────────────────────
  if (q) {
    if (q.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    const results = await prisma.patient.findMany({
      where: {
        verificationStatus: 'demo',
        OR: [
          { user: { name: { contains: q, mode: 'insensitive' } } },
          { citizenshipNumber: { startsWith: q } },
          { district: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
      take: limit,
      orderBy: { user: { name: 'asc' } },
    })

    return NextResponse.json({
      total: results.length,
      citizens: results.map(formatCitizen),
    })
  }

  // ── List (paginated) ───────────────────────────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
  const skip = (page - 1) * limit

  const [total, results] = await Promise.all([
    prisma.patient.count({ where: { verificationStatus: 'demo' } }),
    prisma.patient.findMany({
      where: { verificationStatus: 'demo' },
      include: {
        user: { select: { name: true, phone: true, email: true } },
      },
      take: limit,
      skip,
      orderBy: { citizenshipNumber: 'asc' },
    }),
  ])

  return NextResponse.json({
    total,
    page,
    pages: Math.ceil(total / limit),
    citizens: results.map(formatCitizen),
  })
}

function formatCitizen(patient: {
  id: string
  citizenshipNumber: string | null
  dateOfBirth: Date | null
  gender: string | null
  bloodType: string | null
  district: string | null
  province: string | null
  address: string | null
  user: { name: string; phone: string | null; email: string }
}) {
  return {
    patientId: patient.id,
    citizenshipNumber: patient.citizenshipNumber,
    name: patient.user.name,
    dateOfBirth: patient.dateOfBirth?.toISOString().slice(0, 10) ?? null,
    gender: patient.gender,
    bloodType: patient.bloodType,
    district: patient.district,
    province: patient.province,
    address: patient.address,
    phone: patient.user.phone,
    // email exposed only so demo users can log in; a real national API would not return this
    _demoEmail: patient.user.email,
  }
}
