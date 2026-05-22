'use client'

import { useEffect, useState } from 'react'
import { useActionState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { verifyPrescription, dispensePrescription } from '@/app/actions/pharmacy'
import type { PharmacyRx } from '@/lib/mock-pharmacy-data'
import { MOCK_PRESCRIPTIONS } from '@/lib/mock-pharmacy-data'
import { Pill, CheckCircle, PackageCheck, ArrowLeft, Printer } from 'lucide-react'

export default function RxDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [rx, setRx] = useState<PharmacyRx | null>(null)
  const [verifyState, verifyAction] = useActionState(verifyPrescription, undefined)
  const [dispenseState, dispenseAction] = useActionState(dispensePrescription, undefined)

  useEffect(() => {
    const found = MOCK_PRESCRIPTIONS.find((r) => r.id === id)
    setRx(found ?? null)
  }, [id, verifyState, dispenseState])

  if (!rx) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center text-slate-400">
        <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
        <p>Prescription not found.</p>
        <Link href="/pharmacy/prescriptions" className="text-teal-600 text-sm mt-2 inline-block hover:underline">
          Back to list
        </Link>
      </div>
    )
  }

  const age = new Date().getFullYear() - new Date(rx.patientDob).getFullYear()
  const isVerified = rx.status === 'verified'
  const isDispensed = rx.status === 'dispensed'
  const isPending = rx.status === 'pending'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back + print */}
      <div className="flex items-center justify-between print:hidden">
        <Link href="/pharmacy/prescriptions" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Prescriptions
        </Link>
        {isDispensed && (
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        )}
      </div>

      {/* Status messages */}
      {verifyState?.success && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 text-blue-700 text-sm font-medium print:hidden">
          {verifyState.message}
        </div>
      )}
      {verifyState && !verifyState.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm print:hidden">
          {verifyState.error}
        </div>
      )}
      {dispenseState?.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 text-emerald-700 text-sm font-medium print:hidden">
          {dispenseState.message}
        </div>
      )}

      {/* Prescription card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden" id="rx-print">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-white font-bold">Swastha Nepal AI</div>
              <div className="text-slate-400 text-xs mt-0.5">Digital Prescription</div>
            </div>
            <div className="text-right">
              <div className="text-slate-300 text-xs">Rx ID</div>
              <div className="text-white font-mono text-sm font-bold">{rx.id.toUpperCase()}</div>
              <div className="text-slate-400 text-xs mt-0.5">{rx.prescriptionDate}</div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Patient info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Patient</div>
              <div className="font-bold text-slate-900">{rx.patientName}</div>
              <div className="text-sm text-slate-500">{age} yrs · {rx.patientPhone}</div>
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Prescribing Doctor</div>
              <div className="font-semibold text-slate-900">{rx.doctorName}</div>
              <div className="text-sm text-slate-500">{rx.hospital}</div>
              <div className="text-xs text-slate-400">License: {rx.doctorLicense}</div>
            </div>
          </div>

          {/* Medicines */}
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wide mb-3">Prescribed Medicines</div>
            <div className="space-y-2">
              {rx.items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-teal-700">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900 text-sm">{item.medicine}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {item.frequency} · {item.duration} · {item.quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          {rx.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="text-xs text-amber-700 font-semibold mb-1">Doctor&apos;s Notes</div>
              <p className="text-sm text-amber-800">{rx.notes}</p>
            </div>
          )}

          {/* Dispensed badge */}
          {isDispensed && (
            <div className="flex items-center justify-center gap-2 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <PackageCheck className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-bold">DISPENSED on {rx.dispensedAt}</span>
            </div>
          )}
        </div>

        {/* Pharmacy footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between">
          <span>Generated by Swastha Nepal AI</span>
          <span className="font-mono">{new Date().toISOString().slice(0, 10)}</span>
        </div>
      </div>

      {/* Action buttons */}
      {isPending && (
        <div className="flex gap-3 print:hidden">
          <form action={verifyAction} className="flex-1">
            <input type="hidden" name="prescriptionId" value={rx.id} />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Verify Prescription
            </button>
          </form>
        </div>
      )}

      {isVerified && (
        <div className="flex gap-3 print:hidden">
          <form action={dispenseAction} className="flex-1">
            <input type="hidden" name="prescriptionId" value={rx.id} />
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              <PackageCheck className="w-5 h-5" />
              Mark as Dispensed
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
