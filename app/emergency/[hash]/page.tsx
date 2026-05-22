import { MOCK_EMERGENCY_INFO, MOCK_ALLERGIES, MOCK_PATIENT, BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import { AlertTriangle, Heart, Phone, Pill, Activity, Clock } from 'lucide-react'

const SEVERITY_COLOR: Record<string, string> = {
  life_threatening: 'bg-red-100 text-red-800 border-red-300',
  severe: 'bg-orange-100 text-orange-800 border-orange-200',
  moderate: 'bg-amber-100 text-amber-800 border-amber-200',
  mild: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

export default async function EmergencyPage({
  params,
}: {
  params: Promise<{ hash: string }>
}) {
  const { hash } = await params

  // TODO: look up real patient by hash from DB
  if (hash !== MOCK_EMERGENCY_INFO.qrHash) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border-2 border-red-200 p-8 max-w-sm text-center shadow-lg">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-900">Record Not Found</h1>
          <p className="text-slate-500 text-sm mt-2">
            This QR code is invalid or has expired. Contact the patient directly.
          </p>
        </div>
      </div>
    )
  }

  const info = MOCK_EMERGENCY_INFO
  const allergies = MOCK_ALLERGIES
  const patient = MOCK_PATIENT
  const bloodDisplay = BLOOD_TYPE_DISPLAY[info.bloodType] ?? info.bloodType
  const age = new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
  const primaryContact = info.emergencyContacts.find((c) => c.isPrimary) ?? info.emergencyContacts[0]

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-700 flex items-start justify-center p-4 py-8">
      <div className="w-full max-w-md space-y-4">
        {/* Header */}
        <div className="text-center text-white">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Heart className="w-5 h-5" fill="white" />
            <span className="font-bold text-lg">Swastha Nepal AI</span>
          </div>
          <p className="text-red-200 text-sm">Emergency Health Record — Read Only</p>
        </div>

        {/* Patient identity + blood type */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-white font-bold text-xl">{patient.name}</h1>
              <p className="text-slate-400 text-sm">
                {patient.gender === 'male' ? 'Male' : 'Female'} · {age} yrs · {patient.district}
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-black text-red-400">{bloodDisplay}</div>
              <div className="text-xs text-slate-500">Blood Type</div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            {/* Allergies — most critical */}
            {allergies.length > 0 && (
              <div className="bg-red-50 border-2 border-red-300 rounded-xl p-4">
                <div className="flex items-center gap-2 text-red-700 font-bold text-sm mb-3">
                  <AlertTriangle className="w-4 h-4" />
                  ALLERGIES — CRITICAL
                </div>
                <div className="space-y-2">
                  {allergies.map((a, i) => (
                    <div key={i} className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{a.allergenName}</div>
                        <div className="text-xs text-slate-600">{a.reaction}</div>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold shrink-0 ${SEVERITY_COLOR[a.severity] ?? 'bg-slate-100 text-slate-600'}`}>
                        {a.severity.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical conditions */}
            {info.criticalConditions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wide mb-2">
                  <Activity className="w-3.5 h-3.5" />
                  Chronic Conditions
                </div>
                <ul className="space-y-1">
                  {info.criticalConditions.map((c, i) => (
                    <li key={i} className="text-sm text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Medications */}
            {info.currentMedications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wide mb-2">
                  <Pill className="w-3.5 h-3.5" />
                  Current Medications
                </div>
                <ul className="space-y-1">
                  {info.currentMedications.map((m, i) => (
                    <li key={i} className="text-sm text-slate-800 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency contacts */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-700 font-semibold text-xs uppercase tracking-wide mb-3">
                <Phone className="w-3.5 h-3.5" />
                Emergency Contacts
              </div>
              {info.emergencyContacts.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-1">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{c.name}</span>
                    <span className="text-xs text-slate-500 ml-1">({c.relationship})</span>
                    {c.isPrimary && (
                      <span className="ml-1 text-xs bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Primary</span>
                    )}
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="font-mono text-sm font-bold text-emerald-700 hover:underline"
                  >
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>

            {/* Insurance */}
            {info.insuranceProvider && (
              <div className="flex items-center gap-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Insurance: <span className="font-medium text-slate-700">{info.insuranceProvider}</span>
                  {info.insurancePolicyNum && ` · ${info.insurancePolicyNum}`}
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-center text-red-200 text-xs pb-4">
          This page is publicly accessible via QR scan · Swastha Nepal AI
          {primaryContact && ` · Primary contact: ${primaryContact.phone}`}
        </p>
      </div>
    </div>
  )
}
