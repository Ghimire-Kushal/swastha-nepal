'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export type PharmacyActionState =
  | { success: true; message: string }
  | { success: false; error: string }
  | undefined

const VerifySchema = z.object({
  prescriptionId: z.string().min(1),
  notes: z.string().optional(),
})

export async function verifyPrescription(
  _prev: PharmacyActionState,
  formData: FormData
): Promise<PharmacyActionState> {
  const session = await getSession()
  if (!session || session.role !== 'pharmacist') {
    return { success: false, error: 'Unauthorized' }
  }

  const result = VerifySchema.safeParse(Object.fromEntries(formData))
  if (!result.success) return { success: false, error: 'Invalid data' }

  const rx = await prisma.prescription.findUnique({
    where: { id: result.data.prescriptionId },
    select: { id: true, status: true },
  })
  if (!rx) return { success: false, error: 'Prescription not found' }

  if (result.data.notes) {
    await prisma.prescription.update({
      where: { id: rx.id },
      data: { pharmacyNotes: result.data.notes },
    })
  }

  return { success: true, message: `Prescription ${rx.id} verified` }
}

export async function dispensePrescription(
  _prev: PharmacyActionState,
  formData: FormData
): Promise<PharmacyActionState> {
  const session = await getSession()
  if (!session || session.role !== 'pharmacist') {
    return { success: false, error: 'Unauthorized' }
  }

  const prescriptionId = formData.get('prescriptionId') as string
  if (!prescriptionId) return { success: false, error: 'Missing prescription ID' }

  const rx = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: { patient: { include: { user: { select: { name: true } } } } },
  })
  if (!rx) return { success: false, error: 'Prescription not found' }
  if (rx.status === 'dispensed') return { success: false, error: 'Already dispensed' }

  await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status: 'dispensed',
      dispensedAt: new Date(),
      dispensedById: session.sub,
    },
  })

  return { success: true, message: `Medicines dispensed for ${rx.patient.user.name}` }
}

export async function rejectPrescription(
  _prev: PharmacyActionState,
  formData: FormData
): Promise<PharmacyActionState> {
  const session = await getSession()
  if (!session || session.role !== 'pharmacist') {
    return { success: false, error: 'Unauthorized' }
  }

  const prescriptionId = formData.get('prescriptionId') as string
  if (!prescriptionId) return { success: false, error: 'Missing prescription ID' }

  const rx = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    select: { id: true },
  })
  if (!rx) return { success: false, error: 'Prescription not found' }

  await prisma.prescription.update({
    where: { id: prescriptionId },
    data: { status: 'cancelled' },
  })

  return { success: true, message: `Prescription ${rx.id} rejected` }
}
