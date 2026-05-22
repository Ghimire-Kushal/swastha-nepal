import { prisma } from '@/lib/prisma'
import {
  DISEASE_STATS,
  HIGH_RISK_PATIENTS,
  HOSPITAL_ACTIVITY,
} from '@/lib/mock-admin-data'
import { getAuditLogs } from '@/lib/audit'

export async function getAdminSummary(_userId: string) {
  const [roleCounts, activePrescriptions, pendingLabOrders, totalAppointments] = await Promise.all([
    prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
    prisma.prescription.count({ where: { status: 'active' } }),
    prisma.labReport.count({ where: { status: { in: ['pending', 'processing'] } } }),
    prisma.appointment.count(),
  ])

  const byRole = Object.fromEntries(roleCounts.map((r) => [r.role, r._count.id]))

  return {
    totalPatients: byRole['patient'] ?? 0,
    totalDoctors: byRole['doctor'] ?? 0,
    totalPharmacists: byRole['pharmacist'] ?? 0,
    totalLabTechs: byRole['lab_technician'] ?? 0,
    activePrescriptions,
    pendingLabOrders,
    emergencyQRScans: 0,
    diseaseAlerts: 3,
  }
}

export async function getDiseaseStats(_userId: string) {
  const records = await prisma.medicalRecord.findMany({
    where: { diagnosis: { not: null } },
    select: { diagnosis: true },
    take: 500,
  })

  if (records.length === 0) return DISEASE_STATS

  const counts: Record<string, number> = {}
  for (const r of records) {
    if (r.diagnosis) {
      counts[r.diagnosis] = (counts[r.diagnosis] ?? 0) + 1
    }
  }

  const sorted = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count, trend: 0 }))

  return sorted.length > 0 ? sorted : DISEASE_STATS
}

export async function getDistrictStats(_userId: string) {
  const groups = await prisma.patient.groupBy({
    by: ['district', 'province'],
    _count: { id: true },
    where: { district: { not: null } },
    orderBy: { _count: { id: 'desc' } },
    take: 10,
  })

  if (groups.length === 0) {
    const { DISTRICT_STATS } = await import('@/lib/mock-admin-data')
    return DISTRICT_STATS
  }

  return groups.map((g) => ({
    district: g.district ?? 'Unknown',
    province: g.province ?? '',
    patients: g._count.id,
    highRisk: 0,
    hospitals: 0,
  }))
}

export async function getHighRiskPatients(_userId: string) {
  return HIGH_RISK_PATIENTS
}

export async function getVaccinationStats(_userId: string) {
  const groups = await prisma.vaccination.groupBy({
    by: ['vaccineName'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 8,
  })

  if (groups.length === 0) {
    const { VACCINATION_STATS } = await import('@/lib/mock-admin-data')
    return VACCINATION_STATS
  }

  const total = groups.reduce((sum, g) => sum + g._count.id, 0) || 1
  return groups.map((g) => ({
    vaccine: g.vaccineName,
    covered: Math.round((g._count.id / total) * 100),
    target: 100,
    beneficiaries: g._count.id,
  }))
}

export async function getHospitalActivity(_userId: string) {
  return HOSPITAL_ACTIVITY
}

export async function getMonthlyTrends(_userId: string) {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const [appointments, prescriptions, labReports] = await Promise.all([
    prisma.appointment.findMany({
      where: { scheduledAt: { gte: sixMonthsAgo } },
      select: { scheduledAt: true },
    }),
    prisma.prescription.findMany({
      where: { prescribedAt: { gte: sixMonthsAgo } },
      select: { prescribedAt: true },
    }),
    prisma.labReport.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ])

  const months: Record<string, { month: string; patients: number; prescriptions: number; labTests: number }> = {}

  const getKey = (d: Date) => {
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-US', { month: 'short' })
    return { key, label }
  }

  for (const a of appointments) {
    const { key, label } = getKey(a.scheduledAt)
    if (!months[key]) months[key] = { month: label, patients: 0, prescriptions: 0, labTests: 0 }
    months[key].patients++
  }
  for (const p of prescriptions) {
    const { key, label } = getKey(p.prescribedAt)
    if (!months[key]) months[key] = { month: label, patients: 0, prescriptions: 0, labTests: 0 }
    months[key].prescriptions++
  }
  for (const l of labReports) {
    const { key, label } = getKey(l.createdAt)
    if (!months[key]) months[key] = { month: label, patients: 0, prescriptions: 0, labTests: 0 }
    months[key].labTests++
  }

  const sorted = Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => v)

  if (sorted.length === 0) {
    const { MONTHLY_TRENDS } = await import('@/lib/mock-admin-data')
    return MONTHLY_TRENDS
  }

  return sorted
}

export async function getAdminAuditLogs(_userId: string, limit = 100) {
  return getAuditLogs(limit)
}
