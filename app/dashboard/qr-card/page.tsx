import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPatientProfile, getEmergencyInfo, getAllergies } from '@/services/patient'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import QRCard from '@/components/dashboard/QRCard'

export default async function QRCardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [patient, emergency, allergies] = await Promise.all([
    getPatientProfile(session.sub),
    getEmergencyInfo(session.sub),
    getAllergies(session.sub),
  ])

  const cardData = {
    name: patient.name,
    dob: patient.dateOfBirth.toString().slice(0, 10),
    bloodType: BLOOD_TYPE_DISPLAY[patient.bloodType] ?? patient.bloodType,
    organDonor: emergency.organDonor,
    criticalConditions: emergency.criticalConditions,
    currentMedications: emergency.currentMedications,
    allergies: allergies.map((a) => `${a.allergenName} (${SEVERITY_META[a.severity] ?? a.severity})`),
    emergencyContact: emergency.emergencyContacts.find((c) => c.isPrimary) ?? emergency.emergencyContacts[0],
    insuranceProvider: emergency.insuranceProvider,
    insurancePolicyNum: emergency.insurancePolicyNum,
    qrHash: emergency.qrHash,
  }

  return <QRCard data={cardData} />
}

const SEVERITY_META: Record<string, string> = {
  life_threatening: 'LIFE-THREATENING',
  severe: 'Severe',
  moderate: 'Moderate',
  mild: 'Mild',
}
