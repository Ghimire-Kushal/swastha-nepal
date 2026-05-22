import { MOCK_PHARMACIST, MOCK_PRESCRIPTIONS, type PharmacyRx } from '@/lib/mock-pharmacy-data'

export async function getPharmacistProfile(_userId: string) {
  return MOCK_PHARMACIST
}

export async function getPharmacyStats(_userId: string) {
  return {
    pending: MOCK_PRESCRIPTIONS.filter((r) => r.status === 'pending').length,
    verified: MOCK_PRESCRIPTIONS.filter((r) => r.status === 'verified').length,
    dispensedToday: MOCK_PRESCRIPTIONS.filter(
      (r) => r.status === 'dispensed' && r.dispensedAt === new Date().toISOString().slice(0, 10)
    ).length,
    totalDispensed: MOCK_PRESCRIPTIONS.filter((r) => r.status === 'dispensed').length,
  }
}

export async function getAllPrescriptions(_userId: string): Promise<PharmacyRx[]> {
  return MOCK_PRESCRIPTIONS
}

export async function getPrescriptionById(_userId: string, id: string): Promise<PharmacyRx> {
  const rx = MOCK_PRESCRIPTIONS.find((r) => r.id === id)
  if (!rx) throw new Error('Prescription not found')
  return rx
}
