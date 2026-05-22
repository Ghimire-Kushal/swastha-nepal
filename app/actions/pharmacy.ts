'use server'

import { z } from 'zod'
import { getSession } from '@/lib/auth'
import { MOCK_PRESCRIPTIONS } from '@/lib/mock-pharmacy-data'

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

  const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === result.data.prescriptionId)
  if (!rx) return { success: false, error: 'Prescription not found' }

  // TODO: update status to 'verified' in database
  rx.status = 'verified'
  return { success: true, message: `Prescription ${rx.id} verified successfully` }
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

  const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === prescriptionId)
  if (!rx) return { success: false, error: 'Prescription not found' }
  if (rx.status === 'dispensed') return { success: false, error: 'Already dispensed' }

  // TODO: update status in database
  rx.status = 'dispensed'
  rx.dispensedAt = new Date().toISOString().slice(0, 10)
  return { success: true, message: `Medicines dispensed for ${rx.patientName}` }
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

  const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === prescriptionId)
  if (!rx) return { success: false, error: 'Prescription not found' }

  rx.status = 'rejected'
  return { success: true, message: `Prescription ${rx.id} rejected` }
}
