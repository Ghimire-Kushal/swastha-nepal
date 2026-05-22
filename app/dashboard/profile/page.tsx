import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPatientProfile, getEmergencyInfo } from '@/services/patient'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import { User, Phone, MapPin, Shield, HeartPulse, Users } from 'lucide-react'

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 font-medium mb-0.5">{label}</dt>
      <dd className="text-sm text-slate-900">{value ?? '—'}</dd>
    </div>
  )
}

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [patient, emergency] = await Promise.all([
    getPatientProfile(session.sub),
    getEmergencyInfo(session.sub),
  ])

  const dob = new Date(patient.dateOfBirth)
  const dobFormatted = dob.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
        <p className="text-slate-500 text-sm mt-0.5">Personal information and emergency contacts</p>
      </div>

      {/* Personal Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <User className="w-4 h-4 text-slate-400" />
          Personal Information
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
          <Field label="Full Name" value={patient.name} />
          <Field label="Email" value={patient.email} />
          <Field label="Phone" value={patient.phone} />
          <Field label="Date of Birth" value={dobFormatted} />
          <Field label="Gender" value={patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : null} />
          <Field label="Blood Type" value={BLOOD_TYPE_DISPLAY[patient.bloodType] ?? patient.bloodType} />
          <Field label="Citizenship Number" value={patient.citizenshipNumber} />
          <Field label="Guardian Name" value={patient.guardianName} />
          <Field label="Guardian Phone" value={patient.guardianPhone} />
        </dl>
      </div>

      {/* Address */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          Address
        </h2>
        <dl className="grid grid-cols-2 md:grid-cols-3 gap-y-5 gap-x-6">
          <Field label="Address" value={patient.address} />
          <Field label="District" value={patient.district} />
          <Field label="Province" value={patient.province} />
        </dl>
      </div>

      {/* Insurance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <Shield className="w-4 h-4 text-slate-400" />
          Insurance
        </h2>
        <dl className="grid grid-cols-2 gap-y-5 gap-x-6">
          <Field label="Provider" value={emergency.insuranceProvider} />
          <Field label="Policy Number" value={emergency.insurancePolicyNum} />
        </dl>
      </div>

      {/* Emergency contacts */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          Emergency Contacts
        </h2>
        <div className="space-y-4">
          {emergency.emergencyContacts.map((contact, i) => (
            <div
              key={i}
              className={`flex items-start justify-between p-4 rounded-lg border ${
                contact.isPrimary ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'
              }`}
            >
              <div>
                <div className="font-medium text-slate-900 text-sm flex items-center gap-2">
                  {contact.name}
                  {contact.isPrimary && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                      Primary
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{contact.relationship}</div>
              </div>
              <a
                href={`tel:${contact.phone}`}
                className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                <Phone className="w-3.5 h-3.5" />
                {contact.phone}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Medical flags */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-5 flex items-center gap-2">
          <HeartPulse className="w-4 h-4 text-slate-400" />
          Critical Medical Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
              Critical Conditions
            </h3>
            {emergency.criticalConditions.length === 0 ? (
              <p className="text-sm text-slate-400">None recorded</p>
            ) : (
              <ul className="space-y-1">
                {emergency.criticalConditions.map((c, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div>
            <h3 className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-2">
              Current Medications
            </h3>
            {emergency.currentMedications.length === 0 ? (
              <p className="text-sm text-slate-400">None recorded</p>
            ) : (
              <ul className="space-y-1">
                {emergency.currentMedications.map((m, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-4 text-sm">
          <span className="text-slate-500">Organ Donor:</span>
          <span
            className={`font-medium ${emergency.organDonor ? 'text-emerald-600' : 'text-slate-600'}`}
          >
            {emergency.organDonor ? 'Yes — Registered Donor' : 'No'}
          </span>
        </div>
      </div>
    </div>
  )
}
