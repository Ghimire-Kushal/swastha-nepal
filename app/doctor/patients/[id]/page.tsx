import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPatientForDoctor } from '@/services/doctor'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import {
  AlertTriangle,
  Pill,
  ClipboardList,
  FlaskConical,
  Award,
  Brain,
  Plus,
  Upload,
} from 'lucide-react'
import Link from 'next/link'

const SEVERITY_COLOR: Record<string, string> = {
  life_threatening: 'bg-red-100 text-red-700 border-red-200',
  severe: 'bg-orange-100 text-orange-700 border-orange-200',
  moderate: 'bg-amber-100 text-amber-700 border-amber-200',
  mild: 'bg-yellow-100 text-yellow-700 border-yellow-200',
}

const HISTORY_TYPE_COLOR: Record<string, string> = {
  diagnosis: 'bg-blue-100 text-blue-700',
  visit_note: 'bg-emerald-100 text-emerald-700',
  procedure: 'bg-purple-100 text-purple-700',
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { id } = await params
  const patient = await getPatientForDoctor(session.sub, id)
  if (!patient) redirect('/doctor/patients')

  const age =
    new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{patient.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-sm text-slate-500 mt-1">
              <span>{patient.gender === 'male' ? 'Male' : 'Female'} · {age} yrs</span>
              <span className="font-mono">{patient.citizenshipNumber}</span>
              <span>{patient.phone}</span>
              <span>{patient.email}</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{patient.address}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-4xl font-black text-red-500">
              {BLOOD_TYPE_DISPLAY[patient.bloodType] ?? patient.bloodType}
            </div>
            {/* Action buttons */}
            <div className="flex gap-2 flex-wrap justify-end">
              <Link
                href={`/doctor/patients/${id}/diagnose`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Diagnosis
              </Link>
              <Link
                href={`/doctor/patients/${id}/prescribe`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Pill className="w-3.5 h-3.5" />
                Prescribe
              </Link>
              <Link
                href={`/doctor/patients/${id}/certificate`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Award className="w-3.5 h-3.5" />
                Certificate
              </Link>
              <Link
                href="/doctor/reports"
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Report
              </Link>
              <Link
                href={`/doctor/patients/${id}/ai`}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors"
              >
                <Brain className="w-3.5 h-3.5" />
                AI Analysis
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Vital signs */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wide text-slate-500">
          Last Recorded Vitals
        </h2>
        <div className="grid grid-cols-3 md:grid-cols-7 gap-3">
          {Object.entries(patient.vitalSigns).map(([key, val]) => (
            <div key={key} className="text-center p-2 rounded-lg bg-slate-50">
              <div className="text-sm font-bold text-slate-900">{val}</div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mt-0.5">
                {key === 'bp' ? 'BP' : key === 'hr' ? 'HR' : key === 'temp' ? 'Temp' : key === 'spo2' ? 'SpO₂' : key.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Allergies */}
        {patient.allergies.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <h2 className="font-semibold text-red-800 mb-3 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4" />
              Allergies
            </h2>
            <div className="space-y-2">
              {patient.allergies.map((a, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{a.allergenName}</span>
                    <p className="text-xs text-slate-600">{a.reaction}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${SEVERITY_COLOR[a.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                    {a.severity.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Current medications */}
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <h2 className="font-semibold text-slate-900 mb-3 flex items-center gap-2 text-sm">
            <Pill className="w-4 h-4 text-slate-400" />
            Current Medications
          </h2>
          <ul className="space-y-1.5">
            {patient.currentMedications.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Medical history */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-400" />
          Medical History
        </h2>
        <div className="space-y-3">
          {patient.medicalHistory.map((rec, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-400 font-medium w-24 shrink-0">{rec.date}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize w-20 text-center ${HISTORY_TYPE_COLOR[rec.type] ?? 'bg-slate-100 text-slate-600'}`}>
                {rec.type.replace('_', ' ')}
              </span>
              <span className="flex-1 text-sm text-slate-800 font-medium">{rec.title}</span>
              <span className="text-xs text-slate-400 shrink-0">{rec.doctor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lab highlights */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FlaskConical className="w-4 h-4 text-slate-400" />
          Recent Lab Highlights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {patient.labHighlights.map((lab, i) => (
            <div
              key={i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                lab.isAbnormal ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <FlaskConical
                className={`w-4 h-4 shrink-0 mt-0.5 ${lab.isAbnormal ? 'text-red-500' : 'text-slate-400'}`}
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">{lab.test}</div>
                <div className={`text-xs mt-0.5 ${lab.isAbnormal ? 'text-red-700' : 'text-slate-600'}`}>
                  {lab.result}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{lab.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
