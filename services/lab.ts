import { prisma } from '@/lib/prisma'

export async function getLabTechProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, phone: true },
  })
  if (!user) return null
  return {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? '',
    labName: '',
    certificationNumber: '',
  }
}

export async function getLabStats(userId: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [pendingOrders, processingOrders, completedToday, abnormalReports] = await Promise.all([
    prisma.labReport.count({ where: { status: 'pending' } }),
    prisma.labReport.count({ where: { status: 'processing' } }),
    prisma.labReport.count({
      where: { processedById: userId, status: 'completed', completedAt: { gte: today } },
    }),
    prisma.labReport.count({ where: { isAbnormal: true, status: 'completed' } }),
  ])

  return { pendingOrders, processingOrders, completedToday, abnormalReports }
}

export async function getPendingOrders(_userId: string) {
  const rows = await prisma.labReport.findMany({
    where: { status: { in: ['pending', 'processing'] } },
    orderBy: { createdAt: 'asc' },
    include: {
      patient: {
        include: {
          user: { select: { name: true } },
        },
      },
      orderedBy: { include: { user: { select: { name: true } } } },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patient.user.name,
    patientAge: r.patient.dateOfBirth
      ? Math.floor((Date.now() - r.patient.dateOfBirth.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      : 0,
    orderedBy: r.orderedBy ? `Dr. ${r.orderedBy.user.name}` : 'Unknown',
    orderedAt: r.createdAt.toISOString(),
    tests: [r.testName],
    priority: 'routine' as 'routine' | 'urgent',
    sampleType: r.sampleType ?? '',
    notes: r.notes ?? '',
    status: r.status as 'pending' | 'processing',
  }))
}

export async function getAllLabReports(userId: string) {
  const rows = await prisma.labReport.findMany({
    where: { processedById: userId, status: 'completed' },
    orderBy: { completedAt: 'desc' },
    include: {
      patient: { include: { user: { select: { name: true } } } },
      orderedBy: { include: { user: { select: { name: true } } } },
      processedBy: { select: { name: true } },
    },
  })

  return rows.map((r) => ({
    id: r.id,
    patientId: r.patientId,
    patientName: r.patient.user.name,
    testName: r.testName,
    category: r.category ?? '',
    uploadedAt: r.completedAt?.toISOString() ?? r.createdAt.toISOString(),
    technician: r.processedBy?.name ?? '',
    sentToDoctor: !!r.orderedById,
    doctorName: r.orderedBy ? r.orderedBy.user.name : '',
    hasAbnormal: r.isAbnormal,
    abnormalCount: r.isAbnormal ? 1 : 0,
    fileUrl: r.reportUrl ?? null,
    results: [] as { parameter: string; value: string | number; unit: string; referenceRange: string; isAbnormal: boolean }[],
  }))
}
