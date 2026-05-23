'use server'

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { writeAuditLog } from '@/lib/audit'

export async function savePrivacySettings(
  settings: Record<string, boolean>
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession()
  if (!session) return { success: false, error: 'Unauthorized' }

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.sub },
      select: { id: true, emergencyInfo: { select: { id: true } } },
    })

    if (!patient) return { success: false, error: 'Patient profile not found' }

    // Store privacy settings in the emergencyInfo record as part of advanceDirective JSON
    const privacyJson = JSON.stringify(settings)

    if (patient.emergencyInfo) {
      await prisma.emergencyInfo.update({
        where: { patientId: patient.id },
        data: { advanceDirective: privacyJson },
      })
    } else {
      await prisma.emergencyInfo.create({
        data: {
          patientId: patient.id,
          emergencyContacts: [],
          criticalConditions: [],
          currentMedications: [],
          advanceDirective: privacyJson,
        },
      })
    }

    writeAuditLog({
      userId: session.sub,
      userEmail: session.email,
      userRole: session.role,
      action: 'privacy.update',
      success: true,
    })

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to save settings' }
  }
}
