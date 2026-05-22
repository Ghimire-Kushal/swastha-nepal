import { prisma } from '@/lib/prisma'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'

// ── helpers ───────────────────────────────────────────────────────────────────

async function getPatientIdByUserId(userId: string): Promise<string | null> {
  const p = await prisma.patient.findUnique({ where: { userId }, select: { id: true } })
  return p?.id ?? null
}

// ── public service functions ──────────────────────────────────────────────────

export async function getPatientProfile(userId: string) {
  const result = await prisma.patient.findUnique({
    where: { userId },
    include: { user: { select: { name: true, email: true, phone: true } } },
  })
  if (!result) throw new Error('Patient profile not found')
  return {
    id: result.id,
    userId: result.userId,
    name: result.user.name,
    email: result.user.email,
    phone: result.user.phone ?? '',
    dateOfBirth: result.dateOfBirth ?? new Date('2000-01-01'),
    gender: result.gender ?? 'male',
    bloodType: (result.bloodType ?? 'O_POS') as string,
    address: result.address ?? '',
    district: result.district ?? '',
    province: result.province ?? '',
    citizenshipNumber: result.citizenshipNumber ?? '',
    guardianName: result.guardianName ?? '',
    guardianPhone: result.guardianPhone ?? '',
    profilePhotoUrl: result.profilePhotoUrl ?? null,
  }
}

export async function getEmergencyInfo(userId: string) {
  const patient = await prisma.patient.findUnique({ where: { userId }, select: { id: true } })
  if (!patient) throw new Error('Patient not found')

  const info = await prisma.emergencyInfo.findUnique({ where: { patientId: patient.id } })
  if (!info) {
    return {
      bloodType: 'O_POS' as const,
      organDonor: false,
      criticalConditions: [] as string[],
      currentMedications: [] as string[],
      emergencyContacts: [] as { name: string; relationship: string; phone: string; isPrimary: boolean }[],
      insuranceProvider: null as string | null,
      insurancePolicyNum: null as string | null,
      advanceDirective: null as string | null,
      qrHash: patient.id,
    }
  }

  return {
    bloodType: (info.bloodType ?? 'O_POS') as string,
    organDonor: info.organDonor,
    criticalConditions: info.criticalConditions,
    currentMedications: info.currentMedications,
    emergencyContacts: info.emergencyContacts as { name: string; relationship: string; phone: string; isPrimary: boolean }[],
    insuranceProvider: info.insuranceProvider,
    insurancePolicyNum: info.insurancePolicyNum,
    advanceDirective: info.advanceDirective,
    qrHash: info.qrHash ?? patient.id,
  }
}

export async function getAllergies(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.allergy.findMany({
    where: { patientId, isActive: true },
    orderBy: { severity: 'asc' },
  })
  return rows.map((a) => ({
    id: a.id,
    allergenName: a.allergenName,
    allergenType: a.allergenType as string,
    reaction: a.reaction,
    severity: a.severity as string,
    onsetDate: a.onsetDate?.toISOString().slice(0, 10) ?? null,
    isActive: a.isActive,
  }))
}

export async function getMedicalRecords(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.medicalRecord.findMany({
    where: { patientId },
    orderBy: { visitDate: 'desc' },
    include: { doctor: { include: { user: { select: { name: true } } } } },
  })
  return rows.map((r) => ({
    id: r.id,
    date: r.visitDate.toISOString().slice(0, 10),
    type: r.recordType,
    title: r.title,
    diagnosis: r.diagnosis ?? '',
    icdCode: r.icdCode ?? '',
    doctor: r.doctor?.user.name ?? 'Unknown',
    hospital: '',
    symptoms: r.symptoms,
    notes: r.notes ?? '',
  }))
}

export async function getPrescriptions(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.prescription.findMany({
    where: { patientId },
    orderBy: { prescribedAt: 'desc' },
    include: {
      items: true,
      doctor: { include: { user: { select: { name: true } } } },
    },
  })
  return rows.map((p) => ({
    id: p.id,
    date: p.prescribedAt.toISOString().slice(0, 10),
    doctor: p.doctor.user.name,
    hospital: '',
    status: p.status as string,
    items: p.items.map((i) => ({
      medicine: i.medicineName,
      dose: i.dosage,
      frequency: i.frequency,
      duration: i.duration ?? '',
      instructions: i.instructions ?? '',
    })),
    notes: p.pharmacyNotes ?? '',
  }))
}

export async function getLabReports(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.labReport.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })
  return rows.map((r) => ({
    id: r.id,
    test: r.testName,
    date: r.createdAt.toISOString().slice(0, 10),
    result: r.result ?? '',
    referenceRange: r.referenceRange ?? '',
    unit: r.unit ?? '',
    isAbnormal: r.isAbnormal,
    status: r.status as string,
    category: r.category ?? '',
    reportUrl: r.reportUrl ?? null,
    notes: r.notes ?? '',
  }))
}

export async function getVaccinations(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.vaccination.findMany({
    where: { patientId },
    orderBy: { administeredAt: 'desc' },
  })
  return rows.map((v) => ({
    id: v.id,
    vaccine: v.vaccineName,
    brand: v.vaccineBrand ?? '',
    lotNumber: v.lotNumber ?? '',
    doseNumber: v.doseNumber,
    totalDoses: v.totalDoses,
    date: v.administeredAt.toISOString().slice(0, 10),
    nextDue: v.nextDoseDue?.toISOString().slice(0, 10) ?? null,
    site: v.site ?? '',
    facility: v.facility ?? '',
    certificateUrl: v.certificateUrl ?? null,
    notes: v.notes ?? '',
  }))
}

export async function getUpcomingAppointments(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.appointment.findMany({
    where: {
      patientId,
      status: { in: ['scheduled', 'confirmed'] },
      scheduledAt: { gte: new Date() },
    },
    orderBy: { scheduledAt: 'asc' },
    take: 5,
    include: { doctor: { include: { user: { select: { name: true } } } } },
  })
  return rows.map((a) => ({
    id: a.id,
    doctor: a.doctor.user.name,
    specialization: a.doctor.specialization,
    date: a.scheduledAt.toISOString().slice(0, 10),
    time: a.scheduledAt.toTimeString().slice(0, 5),
    type: a.type as string,
    status: a.status as string,
    location: a.location ?? '',
    videoLink: a.videoLink ?? null,
  }))
}

export async function getAIHealthSummary(userId: string) {
  // Aggregate real patient data to build a summary for the AI widget
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return { conditions: [], medications: [], lastUpdated: new Date().toISOString().slice(0, 10) }
  const info = await prisma.emergencyInfo.findUnique({ where: { patientId }, select: { criticalConditions: true, currentMedications: true } })
  return {
    conditions: info?.criticalConditions ?? [],
    medications: info?.currentMedications ?? [],
    lastUpdated: new Date().toISOString().slice(0, 10),
  }
}
