'use client'

import { useActionState, useState } from 'react'
import { ShieldCheck, FileText, CreditCard, CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { verifyIdentity } from '@/app/actions/verify'
import type { VerifyState } from '@/app/actions/verify'

export default function VerifyIdentityPage() {
  const [state, formAction, isPending] = useActionState<VerifyState, FormData>(
    verifyIdentity,
    undefined,
  )
  const [docType, setDocType] = useState<'citizenship' | 'birth_certificate'>('citizenship')

  if (state?.success && !state.alreadyExists) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Identity Verified!</h2>
          <p className="text-slate-600 text-sm">{state.message}</p>
          <a
            href="/dashboard/profile"
            className="mt-6 inline-block px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Go to Profile
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
        <p className="text-slate-500 text-sm mt-1">
          Use your Nepali citizenship number or birth certificate to verify your identity.
        </p>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Why verify?</p>
          <ul className="space-y-1 text-blue-700 list-disc list-inside">
            <li>Doctors can confirm your real identity</li>
            <li>Emergency services can access your records</li>
            <li>Prevents duplicate health records</li>
          </ul>
        </div>
      </div>

      {state?.success && state.alreadyExists && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">{state.message}</p>
        </div>
      )}

      {state && !state.success && state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
        {/* Document type selector */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">
            Select ID Document Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setDocType('citizenship')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                docType === 'citizenship'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <CreditCard className={`w-5 h-5 shrink-0 ${docType === 'citizenship' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${docType === 'citizenship' ? 'text-emerald-700' : 'text-slate-700'}`}>
                  Citizenship
                </p>
                <p className="text-xs text-slate-500">नागरिकता</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDocType('birth_certificate')}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                docType === 'birth_certificate'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300'
              }`}
            >
              <FileText className={`w-5 h-5 shrink-0 ${docType === 'birth_certificate' ? 'text-emerald-600' : 'text-slate-400'}`} />
              <div>
                <p className={`text-sm font-semibold ${docType === 'birth_certificate' ? 'text-emerald-700' : 'text-slate-700'}`}>
                  Birth Certificate
                </p>
                <p className="text-xs text-slate-500">जन्म दर्ता</p>
              </div>
            </button>
          </div>
          <input type="hidden" name="documentType" value={docType} />
          {state && !state.success && state.errors?.documentType && (
            <p className="mt-1 text-xs text-red-600">{state.errors.documentType[0]}</p>
          )}
        </div>

        {/* Document number */}
        <div>
          <label htmlFor="documentNumber" className="block text-sm font-semibold text-slate-700 mb-1.5">
            {docType === 'citizenship' ? 'Citizenship Number (नागरिकता नम्बर)' : 'Birth Certificate Number (जन्म दर्ता नम्बर)'}
          </label>
          <input
            id="documentNumber"
            name="documentNumber"
            type="text"
            placeholder={
              docType === 'citizenship'
                ? 'e.g. 05-01-76-12345'
                : 'e.g. BC-2024-1001'
            }
            className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              state && !state.success && state.errors?.documentNumber
                ? 'border-red-400 bg-red-50'
                : 'border-slate-300'
            }`}
          />
          {state && !state.success && state.errors?.documentNumber && (
            <p className="mt-1 text-xs text-red-600">{state.errors.documentNumber[0]}</p>
          )}
          <p className="mt-1.5 text-xs text-slate-400">
            {docType === 'citizenship'
              ? 'Enter the number exactly as printed on your citizenship certificate.'
              : 'Enter the number from your birth registration certificate issued by your local municipality.'}
          </p>
        </div>

        {/* Nepal-specific note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <strong>Note for minors:</strong> Use birth certificate number if you do not yet have a citizenship card.
          For adults (16+), citizenship number is preferred.
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Verify My Identity
            </>
          )}
        </button>
      </form>
    </div>
  )
}
