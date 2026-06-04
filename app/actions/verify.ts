'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'

export type VerifyState =
  | { success: true; message: string; status?: string }
  | { success: false; error?: string; errors?: Record<string, string[]> }
  | undefined

export async function submitVerification(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const session = await getSession()
  if (!session || session.role !== 'patient') {
    return { success: false, error: 'Only patients can verify identity.' }
  }

  const docType = formData.get('documentType') as string
  const docNumber = (formData.get('documentNumber') as string)?.trim()
  const docUrl = formData.get('documentUrl') as string

  if (!docType || !['citizenship', 'birth_certificate', 'national_id'].includes(docType)) {
    return { success: false, errors: { documentType: ['Select a document type.'] } }
  }
  if (!docNumber || docNumber.length < 3) {
    return { success: false, errors: { documentNumber: ['Document number is required.'] } }
  }
  if (!docUrl) {
    return { success: false, errors: { documentUrl: ['Please upload a photo of your document.'] } }
  }

  const patient = await prisma.patient.findUnique({
    where: { userId: session.sub },
    select: { id: true, verificationStatus: true },
  })
  if (!patient) return { success: false, error: 'Patient profile not found.' }

  if (patient.verificationStatus === 'verified') {
    return { success: true, message: 'Your identity is already verified.', status: 'verified' }
  }

  await prisma.patient.update({
    where: { id: patient.id },
    data: {
      verificationStatus: 'pending',
      verificationDocType: docType,
      verificationDocNumber: docNumber,
      verificationDocUrl: docUrl,
      verificationNote: null,
    },
  })

  writeAuditLog({
    userId: session.sub,
    userEmail: session.email,
    userRole: session.role,
    action: 'patient.identity_verified',
    details: `submitted ${docType} for review`,
    success: true,
  })

  return {
    success: true,
    message: 'Document submitted. An admin will review and verify your identity shortly.',
    status: 'pending',
  }
}

export async function adminVerifyPatient(
  _prev: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const session = await getSession()
  if (!session || (session.role !== 'hospital_admin' && session.role !== 'government_admin')) {
    return { success: false, error: 'Unauthorized.' }
  }

  const patientId = formData.get('patientId') as string
  const action = formData.get('action') as 'approve' | 'reject'
  const note = (formData.get('note') as string)?.trim() ?? ''

  if (!patientId || !['approve', 'reject'].includes(action)) {
    return { success: false, error: 'Invalid request.' }
  }

  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { id: true, verificationDocNumber: true, verificationDocType: true, citizenshipNumber: true },
  })
  if (!patient) return { success: false, error: 'Patient not found.' }

  if (action === 'approve') {
    // Save the doc number as the citizenship number if not already set
    const citizenshipValue = patient.verificationDocNumber
      ? patient.verificationDocType === 'birth_certificate'
        ? `BC-${patient.verificationDocNumber}`
        : patient.verificationDocNumber
      : patient.citizenshipNumber

    await prisma.patient.update({
      where: { id: patientId },
      data: {
        verificationStatus: 'verified',
        citizenshipNumber: citizenshipValue ?? undefined,
        verifiedAt: new Date(),
        verificationNote: note || null,
      },
    })
  } else {
    await prisma.patient.update({
      where: { id: patientId },
      data: {
        verificationStatus: 'rejected',
        verificationNote: note || 'Document could not be verified. Please resubmit.',
      },
    })
  }

  writeAuditLog({
    userId: session.sub,
    userEmail: session.email,
    userRole: session.role,
    action: 'patient.identity_verified',
    resourceId: patientId,
    details: `admin ${action}ed identity verification`,
    success: true,
  })

  return {
    success: true,
    message: action === 'approve' ? 'Patient identity approved.' : 'Verification rejected.',
  }
}
