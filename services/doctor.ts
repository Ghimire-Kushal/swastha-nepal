import { prisma } from '@/lib/prisma'
import { MOCK_AI_DISEASE_ALERTS } from '@/lib/mock-doctor-data'

async function getDoctorIdByUserId(userId: string): Promise<string | null> {
  const d = await prisma.doctor.findUnique({ where: { userId }, select: { id: true } })
  return d?.id ?? null
}

export async function getDoctorProfile(userId: string) {
  const result = await prisma.doctor.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!result) return null
  return {
    id: result.id,
    userId: result.userId,
    name: result.user.name,
    email: result.user.email,
    licenseNumber: result.licenseNumber,
    specialization: result.specialization,
    subspecialization: result.subspecialization ?? '',
    qualifications: result.qualifications,
    experienceYears: result.experienceYears,
    consultationFee: result.consultationFee ? Number(result.consultationFee) : null,
    availableDays: result.availableDays,
    availableFrom: result.availableFrom ?? '',
    availableTo: result.availableTo ?? '',
    bio: result.bio ?? '',
    isVerified: result.isVerified,
  }
}

export async function getDoctorStats(userId: string) {
  const doctorId = await getDoctorIdByUserId(userId)
  if (!doctorId) return { todayPatients: 0, pendingAppointments: 0, completedToday: 0, totalPatients: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const [todayApts, pendingApts, completedApts, uniquePatients] = await Promise.all([
    prisma.appointment.count({
      where: { doctorId, scheduledAt: { gte: today, lt: tomorrow } },
    }),
    prisma.appointment.count({
      where: { doctorId, status: { in: ['scheduled', 'confirmed'] }, scheduledAt: { gte: today } },
    }),
    prisma.appointment.count({
      where: { doctorId, status: 'completed', scheduledAt: { gte: today, lt: tomorrow } },
    }),
    prisma.appointment.findMany({
      where: { doctorId },
      select: { patientId: true },
      distinct: ['patientId'],
    }).then((r) => r.length),
  ])

  return {
    todayPatients: todayApts,
    pendingAppointments: pendingApts,
    completedToday: completedApts,
    totalPatients: uniquePatients,
  }
}

export async function getDoctorAppointments(userId: string) {
  const doctorId = await getDoctorIdByUserId(userId)
  if (!doctorId) return []

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const rows = await prisma.appointment.findMany({
    where: { doctorId, scheduledAt: { gte: today, lt: tomorrow } },
    orderBy: { scheduledAt: 'asc' },
    include: { patient: { include: { user: { select: { name: true } } } } },
  })

  return rows.map((a) => ({
    id: a.id,
    patientId: a.patientId,
    patientName: a.patient.user.name,
    scheduledAt: a.scheduledAt.toISOString(),
    type: a.type as string,
    status: a.status as string,
    reason: a.reason ?? '',
    durationMinutes: a.durationMinutes,
  }))
}

export async function searchPatients(_userId: string, query: string) {
  const q = query.trim()
  const rows = await prisma.patient.findMany({
    where: q
      ? {
          OR: [
            { user: { name: { contains: q, mode: 'insensitive' } } },
            { citizenshipNumber: { contains: q, mode: 'insensitive' } },
            { user: { phone: { contains: q } } },
          ],
        }
      : {},
    take: 20,
    include: {
      user: { select: { name: true, phone: true } },
      appointments: { orderBy: { scheduledAt: 'desc' }, take: 1, select: { scheduledAt: true } },
      emergencyInfo: { select: { criticalConditions: true } },
    },
  })

  return rows.map((p) => ({
    id: p.id,
    name: p.user.name,
    citizenshipNumber: p.citizenshipNumber ?? '',
    dateOfBirth: p.dateOfBirth?.toISOString().slice(0, 10) ?? '',
    gender: (p.gender ?? 'male') as string,
    bloodType: (p.bloodType ?? 'O_POS') as string,
    phone: p.user.phone ?? '',
    district: p.district ?? '',
    lastVisit: p.appointments[0]?.scheduledAt.toISOString().slice(0, 10) ?? '',
    conditions: p.emergencyInfo?.criticalConditions ?? [],
  }))
}

export async function getPatientForDoctor(_userId: string, patientId: string) {
  const result = await prisma.patient.findUnique({
    where: { id: patientId },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      allergies: { where: { isActive: true }, orderBy: { severity: 'asc' } },
      medicalRecords: {
        orderBy: { visitDate: 'desc' },
        take: 10,
        include: { doctor: { include: { user: { select: { name: true } } } } },
      },
      labReports: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        where: { status: 'completed' },
      },
      emergencyInfo: { select: { criticalConditions: true, currentMedications: true } },
    },
  })
  if (!result) return null

  return {
    id: result.id,
    name: result.user.name,
    citizenshipNumber: result.citizenshipNumber ?? '',
    dateOfBirth: result.dateOfBirth?.toISOString().slice(0, 10) ?? '',
    gender: (result.gender ?? 'male') as string,
    bloodType: (result.bloodType ?? 'O_POS') as string,
    phone: result.user.phone ?? '',
    email: result.user.email,
    address: result.address ?? '',
    guardianName: result.guardianName ?? '',
    guardianPhone: result.guardianPhone ?? '',
    allergies: result.allergies.map((a) => ({
      allergenName: a.allergenName,
      severity: a.severity as string,
      reaction: a.reaction,
    })),
    medicalHistory: result.medicalRecords.map((r) => ({
      date: r.visitDate.toISOString().slice(0, 10),
      title: r.title,
      doctor: r.doctor?.user.name ?? 'Unknown',
      type: r.recordType,
    })),
    currentMedications: result.emergencyInfo?.currentMedications ?? [],
    vitalSigns: {} as Record<string, string>,
    labHighlights: result.labReports.map((r) => ({
      test: r.testName,
      result: r.result ?? '',
      date: r.createdAt.toISOString().slice(0, 10),
      isAbnormal: r.isAbnormal,
    })),
  }
}

export async function getDiseaseAlerts() {
  return [...MOCK_AI_DISEASE_ALERTS]
}

export async function getRecentPatients(userId: string) {
  const doctorId = await getDoctorIdByUserId(userId)
  if (!doctorId) return []

  const recentApts = await prisma.appointment.findMany({
    where: { doctorId },
    orderBy: { scheduledAt: 'desc' },
    take: 20,
    select: { patientId: true, scheduledAt: true },
    distinct: ['patientId'],
  })
  if (!recentApts.length) return []

  const patientIds = recentApts.slice(0, 4).map((a) => a.patientId)
  const patients = await prisma.patient.findMany({
    where: { id: { in: patientIds } },
    include: {
      user: { select: { name: true, phone: true } },
      emergencyInfo: { select: { criticalConditions: true } },
    },
  })

  return patients.map((p) => {
    const apt = recentApts.find((a) => a.patientId === p.id)
    return {
      id: p.id,
      name: p.user.name,
      citizenshipNumber: p.citizenshipNumber ?? '',
      dateOfBirth: p.dateOfBirth?.toISOString().slice(0, 10) ?? '',
      gender: (p.gender ?? 'male') as string,
      bloodType: (p.bloodType ?? 'O_POS') as string,
      phone: p.user.phone ?? '',
      district: p.district ?? '',
      lastVisit: apt?.scheduledAt.toISOString().slice(0, 10) ?? '',
      conditions: p.emergencyInfo?.criticalConditions ?? [],
    }
  })
}
