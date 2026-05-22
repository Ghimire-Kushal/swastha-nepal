'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DoctorActionState =
  | { errors?: Record<string, string[]>; message?: string; success?: boolean }
  | undefined

// ─── Add Diagnosis ────────────────────────────────────────────────────────────

const DiagnosisSchema = z.object({
  patientId: z.string().min(1, { error: 'Patient is required' }),
  recordType: z.enum(['diagnosis', 'visit_note', 'procedure'], { error: 'Select a record type' }),
  title: z.string().min(3, { error: 'Title must be at least 3 characters' }).max(255),
  diagnosis: z.string().min(3, { error: 'Diagnosis is required' }),
  icdCode: z.string().optional(),
  symptoms: z.string().optional(),
  notes: z.string().optional(),
  followUpDate: z.string().optional(),
})

export async function addDiagnosis(
  _prevState: DoctorActionState,
  formData: FormData
): Promise<DoctorActionState> {
  const session = await getSession()
  if (!session || session.role !== 'doctor') return { message: 'Unauthorized' }

  const parsed = DiagnosisSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.sub }, select: { id: true } })
  if (!doctor) return { message: 'Doctor record not found' }

  const { symptoms, followUpDate, ...recordData } = parsed.data
  const symptomList = symptoms ? symptoms.split(',').map((s) => s.trim()).filter(Boolean) : []

  await prisma.medicalRecord.create({
    data: {
      patientId: recordData.patientId,
      doctorId: doctor.id,
      recordType: recordData.recordType,
      title: recordData.title,
      diagnosis: recordData.diagnosis,
      icdCode: recordData.icdCode ?? null,
      symptoms: symptomList,
      notes: recordData.notes ?? null,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
  })

  return { success: true, message: 'Diagnosis recorded successfully' }
}

// ─── Add Prescription ─────────────────────────────────────────────────────────

const PrescriptionSchema = z.object({
  patientId: z.string().min(1, { error: 'Patient is required' }),
  validUntil: z.string().min(1, { error: 'Valid until date is required' }),
  pharmacyNotes: z.string().optional(),
  items: z.string().min(2, { error: 'Add at least one medicine' }),
})

interface RxItem {
  medicine: string
  dose: string
  frequency: string
  duration?: string
  instructions?: string
  quantity?: number
}

export async function addPrescription(
  _prevState: DoctorActionState,
  formData: FormData
): Promise<DoctorActionState> {
  const session = await getSession()
  if (!session || session.role !== 'doctor') return { message: 'Unauthorized' }

  const parsed = PrescriptionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  let items: RxItem[]
  try {
    items = JSON.parse(parsed.data.items)
    if (!Array.isArray(items) || items.length === 0) throw new Error()
  } catch {
    return { errors: { items: ['Invalid medicine data — add at least one medicine'] } }
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.sub }, select: { id: true } })
  if (!doctor) return { message: 'Doctor record not found' }

  await prisma.prescription.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: doctor.id,
      validUntil: new Date(parsed.data.validUntil),
      pharmacyNotes: parsed.data.pharmacyNotes ?? null,
      items: {
        createMany: {
          data: items.map((i) => ({
            medicineName: i.medicine,
            dosage: i.dose,
            frequency: i.frequency,
            duration: i.duration ?? null,
            instructions: i.instructions ?? null,
            quantity: i.quantity ?? null,
          })),
        },
      },
    },
  })

  return { success: true, message: 'Prescription created successfully' }
}

// ─── Generate Certificate ─────────────────────────────────────────────────────

const CertificateSchema = z.object({
  patientId: z.string().min(1),
  certType: z.enum(['fitness', 'sick_leave', 'referral', 'custom'], { error: 'Select certificate type' }),
  diagnosis: z.string().min(3, { error: 'Diagnosis is required' }),
  recommendation: z.string().min(5, { error: 'Recommendation is required' }),
  sickLeaveDays: z.string().optional(),
  referralHospital: z.string().optional(),
  notes: z.string().optional(),
})

export async function generateCertificate(
  _prevState: DoctorActionState,
  formData: FormData
): Promise<DoctorActionState> {
  const session = await getSession()
  if (!session || session.role !== 'doctor') return { message: 'Unauthorized' }

  const parsed = CertificateSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.sub }, select: { id: true } })
  if (!doctor) return { message: 'Doctor record not found' }

  const notes = [
    parsed.data.recommendation,
    parsed.data.sickLeaveDays ? `Sick leave: ${parsed.data.sickLeaveDays} days` : null,
    parsed.data.referralHospital ? `Referral: ${parsed.data.referralHospital}` : null,
    parsed.data.notes ?? null,
  ]
    .filter(Boolean)
    .join('\n')

  await prisma.medicalRecord.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: doctor.id,
      recordType: 'certificate',
      title: `${parsed.data.certType.replace('_', ' ')} Certificate`,
      diagnosis: parsed.data.diagnosis,
      notes,
      symptoms: [],
    },
  })

  return { success: true, message: 'Certificate generated successfully' }
}

// ─── Upload Medical Document ──────────────────────────────────────────────────

const ReportUploadSchema = z.object({
  patientId: z.string().min(1, { error: 'Patient is required' }),
  reportTitle: z.string().min(3, { error: 'Title is required' }),
  reportType: z.enum(['xray', 'mri', 'ct', 'ultrasound', 'ecg', 'other'], { error: 'Select report type' }),
  notes: z.string().optional(),
  fileUrl: z.string().optional(),
})

export async function uploadMedicalDocument(
  _prevState: DoctorActionState,
  formData: FormData
): Promise<DoctorActionState> {
  const session = await getSession()
  if (!session || session.role !== 'doctor') return { message: 'Unauthorized' }

  const parsed = ReportUploadSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors as Record<string, string[]> }
  }

  const fileUrl = parsed.data.fileUrl
  if (!fileUrl) return { errors: { file: ['Please upload a file first'] } }

  const doctor = await prisma.doctor.findUnique({ where: { userId: session.sub }, select: { id: true } })
  if (!doctor) return { message: 'Doctor record not found' }

  await prisma.medicalRecord.create({
    data: {
      patientId: parsed.data.patientId,
      doctorId: doctor.id,
      recordType: parsed.data.reportType,
      title: parsed.data.reportTitle,
      notes: parsed.data.notes ?? null,
      attachments: [fileUrl],
      symptoms: [],
    },
  })

  return { success: true, message: `${parsed.data.reportTitle} uploaded successfully` }
}
