// Patient data service — swap mock functions with Prisma calls when DB is live.
// Each function accepts a userId so the real implementation can filter by user.

import {
  MOCK_PATIENT,
  MOCK_EMERGENCY_INFO,
  MOCK_ALLERGIES,
  MOCK_MEDICAL_RECORDS,
  MOCK_PRESCRIPTIONS,
  MOCK_LAB_REPORTS,
  MOCK_VACCINATIONS,
  MOCK_AI_SUMMARY,
  MOCK_UPCOMING_APPOINTMENTS,
} from '@/lib/mock-data'

export async function getPatientProfile(_userId: string) {
  // TODO: return prisma.patient.findUnique({ where: { userId }, include: { user: true } })
  return { ...MOCK_PATIENT }
}

export async function getEmergencyInfo(_userId: string) {
  // TODO: return prisma.emergencyInfo.findUnique({ where: { patient: { userId } } })
  return { ...MOCK_EMERGENCY_INFO }
}

export async function getAllergies(_userId: string) {
  // TODO: return prisma.allergy.findMany({ where: { patient: { userId } } })
  return [...MOCK_ALLERGIES]
}

export async function getMedicalRecords(_userId: string) {
  // TODO: return prisma.medicalRecord.findMany({ where: { patient: { userId } }, orderBy: { visitDate: 'desc' } })
  return [...MOCK_MEDICAL_RECORDS]
}

export async function getPrescriptions(_userId: string) {
  // TODO: return prisma.prescription.findMany({ where: { patient: { userId } }, include: { items: true }, orderBy: { prescribedAt: 'desc' } })
  return [...MOCK_PRESCRIPTIONS]
}

export async function getLabReports(_userId: string) {
  // TODO: return prisma.labReport.findMany({ where: { patient: { userId } }, orderBy: { createdAt: 'desc' } })
  return [...MOCK_LAB_REPORTS]
}

export async function getVaccinations(_userId: string) {
  // TODO: return prisma.vaccination.findMany({ where: { patient: { userId } }, orderBy: { administeredAt: 'desc' } })
  return [...MOCK_VACCINATIONS]
}

export async function getAIHealthSummary(_userId: string) {
  // TODO: call AI summarisation service with real patient data
  return { ...MOCK_AI_SUMMARY }
}

export async function getUpcomingAppointments(_userId: string) {
  // TODO: return prisma.appointment.findMany({ where: { patient: { userId }, status: { in: ['scheduled','confirmed'] } } })
  return [...MOCK_UPCOMING_APPOINTMENTS]
}
