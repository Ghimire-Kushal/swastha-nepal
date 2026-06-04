'use client'

import { useActionState, useState } from 'react'
import { CheckCircle2, XCircle, Clock, Eye, ShieldCheck, Loader2, ChevronDown, ChevronUp } from 'lucide-react'
import { adminVerifyPatient } from '@/app/actions/verify'
import type { VerifyState } from '@/app/actions/verify'

interface PendingItem {
  id: string
  name: string
  email: string
  phone: string
  registeredAt: string
  verificationStatus: string
  verificationDocType: string
  verificationDocNumber: string
  verificationDocUrl: string
  verificationNote: string
}

interface VerifiedItem {
  id: string
  name: string
  email: string
  citizenshipNumber: string
  verifiedAt: string
}

const DOC_TYPE_LABEL: Record<string, string> = {
  citizenship: 'Citizenship Card',
  birth_certificate: 'Birth Certificate',
  national_id: 'National ID (NID)',
}

function PatientCard({ patient, onDone }: { patient: PendingItem; onDone: () => void }) {
  const [state, formAction, isPending] = useActionState<VerifyState, FormData>(adminVerifyPatient, undefined)
  const [showImage, setShowImage] = useState(false)
  const [note, setNote] = useState('')

  if (state?.success) {
    return (
      <div className="bg-white rounded-xl border border-emerald-200 p-4 flex items-center gap-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
        <p className="text-sm text-emerald-800 font-medium">{state.message} — <span className="text-slate-500">{patient.name}</span></p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl border shadow-sm overflow-hidden ${patient.verificationStatus === 'rejected' ? 'border-red-200' : 'border-slate-200'}`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900 text-sm">{patient.name}</p>
              {patient.verificationStatus === 'rejected' && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-red-100 text-red-700 rounded">RESUBMITTED</span>
              )}
            </div>
            <p className="text-xs text-slate-500">{patient.email} · {patient.phone}</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Registered {new Date(patient.registeredAt).toLocaleDateString('en-NP')}
            </p>
          </div>
          <span className="shrink-0 flex items-center gap-1 text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-lg">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        </div>

        {/* Document info */}
        <div className="mt-3 bg-slate-50 rounded-lg px-3 py-2 flex items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400">Type: </span>
            <span className="font-medium text-slate-700">{DOC_TYPE_LABEL[patient.verificationDocType] ?? patient.verificationDocType}</span>
          </div>
          <div>
            <span className="text-slate-400">Number: </span>
            <span className="font-mono font-semibold text-slate-900">{patient.verificationDocNumber || '—'}</span>
          </div>
        </div>

        {/* Document image toggle */}
        {patient.verificationDocUrl && (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowImage(v => !v)}
              className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 hover:text-emerald-800"
            >
              <Eye className="w-3.5 h-3.5" />
              {showImage ? 'Hide' : 'View'} Document
              {showImage ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showImage && (
              <div className="mt-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                {patient.verificationDocUrl.includes('placehold') ? (
                  <div className="h-40 flex items-center justify-center text-xs text-slate-400">
                    [Dev mode — Cloudinary not configured, placeholder shown]
                  </div>
                ) : (
                  <img
                    src={patient.verificationDocUrl}
                    alt="Verification document"
                    className="w-full max-h-64 object-contain"
                  />
                )}
              </div>
            )}
          </div>
        )}

        {/* Admin note */}
        <div className="mt-3">
          <input
            type="text"
            placeholder="Optional note to patient (reason for rejection, etc.)"
            value={note}
            onChange={e => setNote(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <form action={formAction} className="flex-1">
            <input type="hidden" name="patientId" value={patient.id} />
            <input type="hidden" name="action" value="approve" />
            <input type="hidden" name="note" value={note} />
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              Approve
            </button>
          </form>
          <form action={formAction} className="flex-1">
            <input type="hidden" name="patientId" value={patient.id} />
            <input type="hidden" name="action" value="reject" />
            <input type="hidden" name="note" value={note} />
            <button
              type="submit"
              disabled={isPending}
              className="w-full flex items-center justify-center gap-1.5 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </form>
        </div>

        {state && !state.success && state.error && (
          <p className="mt-2 text-xs text-red-600">{state.error}</p>
        )}
      </div>
    </div>
  )
}

export default function VerificationQueue({ pending, recentVerified }: {
  pending: PendingItem[]
  recentVerified: VerifiedItem[]
}) {
  return (
    <div className="space-y-6">
      {/* Pending queue */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          Pending Review ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400 text-sm">
            No pending verifications 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map(p => (
              <PatientCard key={p.id} patient={p} onDone={() => {}} />
            ))}
          </div>
        )}
      </div>

      {/* Recently verified */}
      {recentVerified.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Recently Verified
          </h2>
          <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
            {recentVerified.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{p.name}</p>
                  <p className="text-xs text-slate-400">{p.email}</p>
                </div>
                {p.citizenshipNumber && (
                  <span className="font-mono text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded shrink-0">
                    {p.citizenshipNumber}
                  </span>
                )}
                {p.verifiedAt && (
                  <span className="text-xs text-slate-400 shrink-0">
                    {new Date(p.verifiedAt).toLocaleDateString('en-NP')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
