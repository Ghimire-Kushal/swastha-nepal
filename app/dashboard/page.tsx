import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getPatientProfile,
  getUpcomingAppointments,
  getPrescriptions,
  getAIHealthSummary,
  getEmergencyInfo,
} from '@/services/patient'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import { Calendar, FileText, Heart, AlertTriangle, CheckCircle, AlertCircle, Clock, ShieldAlert, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

function calcAge(dob: Date) {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  // Non-patient roles don't have a patient profile — send them to their dashboard
  if (session.role === 'doctor') redirect('/doctor')
  if (session.role === 'nurse') redirect('/nurse')
  if (session.role === 'lab_technician') redirect('/lab')
  if (session.role === 'pharmacist') redirect('/pharmacy')
  if (session.role === 'hospital_admin' || session.role === 'government_admin') redirect('/admin')

  const patient = await getPatientProfile(session.sub)
  if (!patient) redirect('/dashboard/verify')

  const [appointments, prescriptions, aiSummary, emergencyInfo] = await Promise.all([
    getUpcomingAppointments(session.sub),
    getPrescriptions(session.sub),
    getAIHealthSummary(session.sub),
    getEmergencyInfo(session.sub),
  ])

  const activePrescriptions = prescriptions.filter((p) => p.status === 'active')
  const age = calcAge(patient.dateOfBirth)

  const findingIcon = (type: string) => {
    if (type === 'critical') return <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
    if (type === 'warning') return <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
    return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Good day, {patient.name.split(' ')[0]} 👋
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Here is your health overview</p>
      </div>

      {/* Identity verification banner */}
      {patient.verificationStatus === 'verified' ? (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm font-semibold text-emerald-800">Identity verified</p>
          {patient.citizenshipNumber && (
            <span className="text-xs text-emerald-600 font-mono bg-emerald-100 px-2 py-0.5 rounded">
              {patient.citizenshipNumber}
            </span>
          )}
        </div>
      ) : patient.verificationStatus === 'pending' ? (
        <div className="flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
          <Clock className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-blue-900">Verification pending review</p>
            <p className="text-xs text-blue-700 mt-0.5">Your document has been submitted. An admin will review it shortly.</p>
          </div>
        </div>
      ) : patient.verificationStatus === 'rejected' ? (
        <div className="flex items-center gap-4 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-900">Verification rejected — please resubmit</p>
            <p className="text-xs text-red-700 mt-0.5">Your document could not be verified. Upload a clearer photo.</p>
          </div>
          <Link
            href="/dashboard/verify"
            className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Resubmit
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Identity not verified</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Upload your citizenship card or birth certificate to verify your identity.
            </p>
          </div>
          <Link
            href="/dashboard/verify"
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Verify Now
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Blood Type</p>
          <p className="text-3xl font-black text-red-500">
            {BLOOD_TYPE_DISPLAY[patient.bloodType] ?? patient.bloodType}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Age</p>
          <p className="text-3xl font-black text-slate-900">{age}</p>
          <p className="text-xs text-slate-400">years</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Active Rx</p>
          <p className="text-3xl font-black text-emerald-600">{activePrescriptions.length}</p>
          <p className="text-xs text-slate-400">prescriptions</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Health Score</p>
          <p className="text-3xl font-black text-blue-600">{aiSummary.healthScore}</p>
          <p className="text-xs text-slate-400">out of 100</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Health Summary */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-emerald-600" />
              AI Health Summary
            </h2>
            <span className="text-xs text-slate-400">Updated {aiSummary.lastUpdated}</span>
          </div>

          {/* Risk scores */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {aiSummary.riskScores.map((r) => (
              <div key={r.name} className="text-center">
                <div
                  className="text-2xl font-black"
                  style={{ color: r.color }}
                >
                  {r.score}%
                </div>
                <div className="text-xs text-slate-500">{r.name} Risk</div>
              </div>
            ))}
          </div>

          {/* Findings */}
          <div className="space-y-2">
            {aiSummary.findings.map((f, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                {findingIcon(f.type)}
                <span className="text-slate-700">{f.text}</span>
              </div>
            ))}
          </div>

          <Link
            href="/dashboard/medical-history"
            className="mt-4 inline-flex items-center text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            View full medical history →
          </Link>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Emergency quick info */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Emergency Info
            </h3>
            <div className="space-y-1.5 text-xs text-red-800">
              <div>
                <span className="font-medium">Blood Type:</span>{' '}
                {BLOOD_TYPE_DISPLAY[emergencyInfo.bloodType]}
              </div>
              <div>
                <span className="font-medium">Allergies:</span>{' '}
                {emergencyInfo.criticalConditions.length
                  ? emergencyInfo.criticalConditions.join(', ')
                  : 'None recorded'}
              </div>
              {emergencyInfo.emergencyContacts[0] && (
                <div>
                  <span className="font-medium">Emergency:</span>{' '}
                  {emergencyInfo.emergencyContacts[0].name} —{' '}
                  {emergencyInfo.emergencyContacts[0].phone}
                </div>
              )}
            </div>
            <Link
              href="/dashboard/qr-card"
              className="mt-3 block text-center text-xs font-medium text-red-600 hover:text-red-700 border border-red-200 rounded-lg py-1.5 hover:bg-red-100 transition-colors"
            >
              View QR Health Card
            </Link>
          </div>

          {/* Upcoming appointments */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Upcoming Appointments
            </h3>
            {appointments.length === 0 ? (
              <p className="text-xs text-slate-400">No upcoming appointments</p>
            ) : (
              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div key={apt.id} className="text-xs">
                    <div className="font-medium text-slate-800">{apt.doctor}</div>
                    <div className="text-slate-500">{apt.specialty}</div>
                    <div className="flex items-center gap-1 text-slate-400 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(apt.scheduledAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}{' '}
                      ·{' '}
                      {new Date(apt.scheduledAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active prescriptions */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />
              Active Prescriptions
            </h3>
            {activePrescriptions.length === 0 ? (
              <p className="text-xs text-slate-400">No active prescriptions</p>
            ) : (
              <div className="space-y-2">
                {activePrescriptions.flatMap((rx) =>
                  rx.items.map((item, i) => (
                    <div key={`${rx.id}-${i}`} className="text-xs">
                      <span className="font-medium text-slate-800">{item.medicineName}</span>{' '}
                      <span className="text-slate-500">{item.dosage}</span>
                      <div className="text-slate-400">{item.frequency}</div>
                    </div>
                  ))
                )}
              </div>
            )}
            <Link
              href="/dashboard/prescriptions"
              className="mt-3 block text-center text-xs font-medium text-purple-600 hover:text-purple-700"
            >
              View all prescriptions →
            </Link>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">AI Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {aiSummary.recommendations.map((rec, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </span>
              {rec}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
