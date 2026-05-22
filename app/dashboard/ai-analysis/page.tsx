import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getPatientProfile,
  getEmergencyInfo,
  getAllergies,
  getMedicalRecords,
  getPrescriptions,
  getLabReports,
} from '@/services/patient'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import AIAnalysisWidget from '@/components/AIAnalysisWidget'
import type { AIAnalysisRequest } from '@/types/ai'

export default async function PatientAIAnalysisPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const patient = await getPatientProfile(session.sub)
  if (!patient) redirect('/dashboard/profile')

  const [emergency, allergies, records, prescriptions, labReports] = await Promise.all([
    getEmergencyInfo(session.sub),
    getAllergies(session.sub),
    getMedicalRecords(session.sub),
    getPrescriptions(session.sub),
    getLabReports(session.sub),
  ])

  const dob = new Date(patient.dateOfBirth)
  const age = new Date().getFullYear() - dob.getFullYear()

  const patientData: AIAnalysisRequest = {
    patientInfo: {
      name: patient.name,
      age,
      gender: patient.gender,
      bloodType: BLOOD_TYPE_DISPLAY[patient.bloodType] ?? patient.bloodType,
    },
    currentMedications: emergency.currentMedications,
    allergies: allergies.map((a) => ({
      allergen: a.allergenName,
      severity: a.severity,
      reaction: a.reaction,
    })),
    labResults: labReports.map((r) => ({
      testName: r.testName,
      date: r.date,
      results: r.results.map((res) => ({
        parameter: res.parameter,
        value: res.value,
        unit: res.unit,
        referenceRange: res.referenceRange,
        isAbnormal: res.isAbnormal,
      })),
    })),
    medicalHistory: records.map((r) => ({
      date: r.date,
      title: r.title,
      type: r.type,
      diagnosis: r.diagnosis,
    })),
    recentDiagnoses: emergency.criticalConditions,
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Health Analysis</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Powered by Claude AI · Analyzed using your complete health record
        </p>
      </div>

      {/* Patient data being analyzed */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Data Included in Analysis</h2>
        <div className="flex flex-wrap gap-2">
          {[
            `${labReports.length} lab reports`,
            `${records.length} medical records`,
            `${allergies.length} allergies`,
            `${prescriptions.length} prescriptions`,
            `${emergency.currentMedications.length} current medications`,
            `Blood type: ${BLOOD_TYPE_DISPLAY[patient.bloodType]}`,
          ].map((item) => (
            <span key={item} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>

      <AIAnalysisWidget patientData={patientData} title="Analyze My Complete Health Profile" />
    </div>
  )
}
