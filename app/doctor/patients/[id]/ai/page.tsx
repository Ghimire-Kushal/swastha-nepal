import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPatientForDoctor } from '@/services/doctor'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import AIAnalysisWidget from '@/components/AIAnalysisWidget'
import type { AIAnalysisRequest } from '@/types/ai'
import Link from 'next/link'
import { ArrowLeft, Brain } from 'lucide-react'

export default async function DoctorPatientAIPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const patient = await getPatientForDoctor(session.sub, id)

  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()

  const patientData: AIAnalysisRequest = {
    patientInfo: {
      name: patient.name,
      age,
      gender: patient.gender,
      bloodType: BLOOD_TYPE_DISPLAY[patient.bloodType] ?? patient.bloodType,
    },
    vitalSigns: patient.vitalSigns,
    currentMedications: patient.currentMedications,
    allergies: patient.allergies.map((a) => ({
      allergen: a.allergenName,
      severity: a.severity,
      reaction: a.reaction,
    })),
    labResults: patient.labHighlights.map((l) => ({
      testName: l.test,
      date: l.date,
      results: [
        {
          parameter: l.test,
          value: l.result,
          unit: '',
          referenceRange: '',
          isAbnormal: l.isAbnormal,
        },
      ],
    })),
    medicalHistory: patient.medicalHistory.map((h) => ({
      date: h.date,
      title: h.title,
      type: h.type,
    })),
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/doctor/patients/${id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Analysis — {patient.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {age} yrs · {patient.gender} · {BLOOD_TYPE_DISPLAY[patient.bloodType]}
          </p>
        </div>
      </div>

      {/* Summary of data going into analysis */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Clinical Data Included</h2>
        <div className="flex flex-wrap gap-2">
          {[
            `${patient.allergies.length} known allergies`,
            `${patient.medicalHistory.length} history records`,
            `${patient.labHighlights.length} recent lab highlights`,
            `${patient.currentMedications.length} current medications`,
            `Vitals: BP ${patient.vitalSigns.bp}, HR ${patient.vitalSigns.hr}, BMI ${patient.vitalSigns.bmi}`,
          ].map((item) => (
            <span key={item} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-full">
              {item}
            </span>
          ))}
        </div>
      </div>

      <AIAnalysisWidget patientData={patientData} title={`Analyze ${patient.name.split(' ')[0]}'s Health`} />
    </div>
  )
}
