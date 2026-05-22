'use client'

import QRCode from 'react-qr-code'
import { Heart, Phone, AlertTriangle, Printer } from 'lucide-react'

interface CardData {
  name: string
  dob: string
  bloodType: string
  organDonor: boolean
  criticalConditions: string[]
  currentMedications: string[]
  allergies: string[]
  emergencyContact: { name: string; relationship: string; phone: string } | undefined
  insuranceProvider: string | null
  insurancePolicyNum: string | null
  qrHash: string
}

export default function QRCard({ data }: { data: CardData }) {
  const qrValue = JSON.stringify({
    n: data.name,
    dob: data.dob,
    bt: data.bloodType,
    od: data.organDonor,
    cc: data.criticalConditions,
    al: data.allergies,
    ec: data.emergencyContact
      ? `${data.emergencyContact.name} (${data.emergencyContact.relationship}) ${data.emergencyContact.phone}`
      : '',
    hash: data.qrHash,
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">QR Health Card</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Show this to any healthcare provider in an emergency
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors print:hidden"
        >
          <Printer className="w-4 h-4" />
          Print Card
        </button>
      </div>

      {/* The Card */}
      <div
        id="health-card"
        className="bg-white rounded-2xl border-2 border-emerald-200 overflow-hidden shadow-sm print:shadow-none print:border-2"
      >
        {/* Card header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">Swastha Nepal AI</div>
              <div className="text-emerald-200 text-xs">Emergency Health Card</div>
            </div>
          </div>
          <div className="text-right text-white">
            <div className="text-3xl font-black">{data.bloodType}</div>
            <div className="text-xs text-emerald-200">Blood Type</div>
          </div>
        </div>

        <div className="p-6 flex gap-6">
          {/* QR Code */}
          <div className="shrink-0 flex flex-col items-center gap-2">
            <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
              <QRCode value={qrValue} size={140} level="H" />
            </div>
            <p className="text-xs text-slate-400 text-center max-w-[160px]">
              Scan to access full health record
            </p>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Patient identity */}
            <div>
              <h2 className="text-xl font-bold text-slate-900">{data.name}</h2>
              <p className="text-sm text-slate-500">DOB: {data.dob}</p>
              {data.organDonor && (
                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full font-medium">
                  Organ Donor
                </span>
              )}
            </div>

            {/* Allergies */}
            {data.allergies.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-1.5 mb-1.5 text-red-700 font-semibold text-xs">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  ALLERGIES
                </div>
                <ul className="space-y-0.5">
                  {data.allergies.map((a, i) => (
                    <li key={i} className="text-xs text-red-800 font-medium">{a}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Critical conditions */}
            {data.criticalConditions.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                  Critical Conditions
                </div>
                <ul className="space-y-0.5">
                  {data.criticalConditions.map((c, i) => (
                    <li key={i} className="text-xs text-slate-700">{c}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Current medications */}
            {data.currentMedications.length > 0 && (
              <div>
                <div className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">
                  Current Medications
                </div>
                <ul className="space-y-0.5">
                  {data.currentMedications.map((m, i) => (
                    <li key={i} className="text-xs text-slate-700">{m}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          {data.emergencyContact && (
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-500">Emergency:</span>
              <span className="font-semibold text-slate-800">
                {data.emergencyContact.name} ({data.emergencyContact.relationship})
              </span>
              <span className="font-mono text-slate-700">{data.emergencyContact.phone}</span>
            </div>
          )}
          {data.insuranceProvider && (
            <div className="text-xs text-slate-500">
              <span className="font-medium text-slate-600">{data.insuranceProvider}</span>
              {data.insurancePolicyNum && ` · ${data.insurancePolicyNum}`}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 print:hidden">
        <p className="font-semibold mb-1">How to use this card</p>
        <ul className="list-disc list-inside space-y-0.5 text-xs text-amber-700">
          <li>Print this card and keep a copy in your wallet or phone case.</li>
          <li>Healthcare providers can scan the QR code for your complete health record.</li>
          <li>The QR code links to a verified read-only view — no login required in emergencies.</li>
          <li>Update your profile to keep allergy and medication information current.</li>
        </ul>
      </div>
    </div>
  )
}
