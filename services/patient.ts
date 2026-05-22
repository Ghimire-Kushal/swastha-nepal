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
    prescribedDate: p.prescribedAt.toISOString().slice(0, 10),
    validUntil: p.validUntil?.toISOString().slice(0, 10) ?? null,
    doctor: p.doctor.user.name,
    hospital: '',
    status: p.status as string,
    items: p.items.map((i) => ({
      medicineName: i.medicineName,
      genericName: i.genericName ?? '',
      dosage: i.dosage,
      frequency: i.frequency,
      duration: i.duration ?? '',
      route: i.route ?? '',
      instructions: i.instructions ?? '',
    })),
    notes: p.pharmacyNotes ?? '',
  }))
}

interface LabResultRow {
  parameter: string
  value: string | number
  unit: string
  referenceRange: string
  isAbnormal: boolean
}

function parseResults(raw: string | null): LabResultRow[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed as LabResultRow[]
  } catch {
    // not JSON — return single row with raw string as result
    return [{ parameter: 'Result', value: raw, unit: '', referenceRange: '', isAbnormal: false }]
  }
  return []
}

export async function getLabReports(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) return []
  const rows = await prisma.labReport.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
    include: { orderedBy: { include: { user: { select: { name: true } } } } },
  })
  return rows.map((r) => ({
    id: r.id,
    testName: r.testName,
    date: r.createdAt.toISOString().slice(0, 10),
    results: parseResults(r.result),
    referenceRange: r.referenceRange ?? '',
    unit: r.unit ?? '',
    isAbnormal: r.isAbnormal,
    status: r.status as string,
    category: r.category ?? '',
    reportUrl: r.reportUrl ?? null,
    notes: r.notes ?? '',
    orderedBy: r.orderedBy ? `Dr. ${r.orderedBy.user.name}` : 'Unknown',
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
    vaccineName: v.vaccineName,
    brand: v.vaccineBrand ?? '',
    lotNumber: v.lotNumber ?? '',
    doseNumber: v.doseNumber,
    totalDoses: v.totalDoses,
    administeredAt: v.administeredAt.toISOString().slice(0, 10),
    nextDoseDue: v.nextDoseDue?.toISOString().slice(0, 10) ?? null,
    site: v.site ?? '',
    facility: v.facility ?? '',
    route: v.route ?? '',
    adverseReactions: v.adverseReactions ?? null,
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
    specialty: a.doctor.specialization,
    scheduledAt: a.scheduledAt.toISOString(),
    type: a.type as string,
    status: a.status as string,
    location: a.location ?? '',
    videoLink: a.videoLink ?? null,
  }))
}

const CARDIOVASCULAR_KEYWORDS = ['hypertension', 'cardiac', 'heart', 'af', 'stroke', 'angina']
const METABOLIC_KEYWORDS = ['diabetes', 'thyroid', 'obesity', 'lipid', 'cholesterol', 'metabolic']
const RESPIRATORY_KEYWORDS = ['asthma', 'copd', 'tuberculosis', 'respiratory', 'lung', 'pneumonia']

function computeRiskScore(conditions: string[], keywords: string[]): number {
  const matched = conditions.filter((c) =>
    keywords.some((k) => c.toLowerCase().includes(k))
  ).length
  return Math.min(matched * 25, 85)
}

export async function getAIHealthSummary(userId: string) {
  const patientId = await getPatientIdByUserId(userId)
  if (!patientId) {
    return {
      healthScore: 85,
      riskScores: [
        { name: 'Cardiovascular', score: 0, color: '#22c55e' },
        { name: 'Metabolic', score: 0, color: '#22c55e' },
        { name: 'Respiratory', score: 0, color: '#22c55e' },
      ],
      findings: [{ type: 'info', text: 'No health data recorded yet.' }],
      recommendations: ['Schedule a baseline health checkup', 'Register your emergency medical info'],
      lastUpdated: new Date().toISOString().slice(0, 10),
      conditions: [] as string[],
      medications: [] as string[],
    }
  }

  const info = await prisma.emergencyInfo.findUnique({
    where: { patientId },
    select: { criticalConditions: true, currentMedications: true },
  })

  const conditions = info?.criticalConditions ?? []
  const medications = info?.currentMedications ?? []

  const cvScore = computeRiskScore(conditions, CARDIOVASCULAR_KEYWORDS)
  const metScore = computeRiskScore(conditions, METABOLIC_KEYWORDS)
  const respScore = computeRiskScore(conditions, RESPIRATORY_KEYWORDS)

  const healthScore = Math.max(30, 100 - conditions.length * 8 - medications.length * 2)

  const findings: { type: string; text: string }[] = []
  if (conditions.length > 0) {
    findings.push({ type: 'warning', text: `${conditions.length} chronic condition${conditions.length > 1 ? 's' : ''} on record: ${conditions.slice(0, 2).join(', ')}${conditions.length > 2 ? '…' : ''}` })
  }
  if (medications.length > 0) {
    findings.push({ type: 'info', text: `Currently on ${medications.length} medication${medications.length > 1 ? 's' : ''}` })
  }
  if (findings.length === 0) {
    findings.push({ type: 'success', text: 'No critical conditions recorded' })
  }

  const recommendations: string[] = []
  if (cvScore > 0) recommendations.push('Monitor blood pressure and cardiovascular health regularly')
  if (metScore > 0) recommendations.push('Track blood glucose and metabolic markers')
  if (respScore > 0) recommendations.push('Avoid respiratory irritants; monitor peak flow if asthmatic')
  if (recommendations.length === 0) recommendations.push('Maintain regular health checkups')
  recommendations.push('Keep emergency info and contacts up to date')

  const scoreColor = (s: number) => s === 0 ? '#22c55e' : s <= 25 ? '#eab308' : '#ef4444'

  return {
    healthScore,
    riskScores: [
      { name: 'Cardiovascular', score: cvScore, color: scoreColor(cvScore) },
      { name: 'Metabolic', score: metScore, color: scoreColor(metScore) },
      { name: 'Respiratory', score: respScore, color: scoreColor(respScore) },
    ],
    findings,
    recommendations,
    lastUpdated: new Date().toISOString().slice(0, 10),
    conditions,
    medications,
  }
}
