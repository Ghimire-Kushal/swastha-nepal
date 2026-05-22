// Doctor data service — swap mock functions with Prisma calls when DB is live.

import {
  MOCK_DOCTOR,
  MOCK_DOCTOR_PATIENTS,
  MOCK_DOCTOR_APPOINTMENTS,
  MOCK_AI_DISEASE_ALERTS,
  MOCK_PATIENT_DETAIL,
} from '@/lib/mock-doctor-data'

export async function getDoctorProfile(_userId: string) {
  // TODO: return prisma.doctor.findUnique({ where: { userId }, include: { user: true } })
  return { ...MOCK_DOCTOR }
}

export async function getDoctorStats(_userId: string) {
  // TODO: derive from prisma appointment + medicalRecord counts for today
  return {
    todayPatients: MOCK_DOCTOR_APPOINTMENTS.length,
    pendingAppointments: MOCK_DOCTOR_APPOINTMENTS.filter((a) => a.status === 'scheduled').length,
    completedToday: 0,
    totalPatients: MOCK_DOCTOR_PATIENTS.length,
  }
}

export async function getDoctorAppointments(_userId: string) {
  // TODO: return prisma.appointment.findMany({ where: { doctor: { userId }, scheduledAt: { gte: startOfDay } } })
  return [...MOCK_DOCTOR_APPOINTMENTS]
}

export async function searchPatients(_userId: string, query: string) {
  // TODO: prisma.patient.findMany({ where: { OR: [{ citizenshipNumber: { contains: q } }, { user: { name: { contains: q, mode: 'insensitive' } } }] } })
  if (!query.trim()) return [...MOCK_DOCTOR_PATIENTS]
  const q = query.toLowerCase()
  return MOCK_DOCTOR_PATIENTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.citizenshipNumber.toLowerCase().includes(q) ||
      p.phone.includes(q)
  )
}

export async function getPatientForDoctor(_userId: string, _patientId: string) {
  // TODO: prisma.patient.findUnique({ where: { id: patientId }, include: { user, allergies, medicalRecords, ... } })
  return { ...MOCK_PATIENT_DETAIL }
}

export async function getDiseaseAlerts() {
  // TODO: fetch from external epidemic surveillance API or internal alert table
  return [...MOCK_AI_DISEASE_ALERTS]
}

export async function getRecentPatients(_userId: string) {
  // TODO: return patients with most recent appointment with this doctor
  return MOCK_DOCTOR_PATIENTS.slice(0, 4)
}
