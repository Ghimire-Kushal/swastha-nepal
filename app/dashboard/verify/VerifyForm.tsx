'use client'

import { useActionState, useState, useRef } from 'react'
import {
  ShieldCheck, ShieldAlert, ShieldX, Clock,
  CreditCard, FileText, IdCard,
  Upload, Loader2, CheckCircle2, X, ImageIcon,
} from 'lucide-react'
import { submitVerification } from '@/app/actions/verify'
import type { VerifyState } from '@/app/actions/verify'

interface Props {
  status: string
  docType: string | null
  docNumber: string | null
  note: string | null
  verifiedAt: string | null
  citizenshipNumber: string | null
}

const DOC_TYPES = [
  { value: 'citizenship', label: 'Citizenship Card', nepali: 'नागरिकता', icon: CreditCard, placeholder: 'e.g. 05-01-76-12345' },
  { value: 'birth_certificate', label: 'Birth Certificate', nepali: 'जन्म दर्ता', icon: FileText, placeholder: 'e.g. BC-2024-1001' },
  { value: 'national_id', label: 'National ID (NID)', nepali: 'राष्ट्रिय परिचय', icon: IdCard, placeholder: 'e.g. NID-XXXXXXXXXX' },
] as const

export default function VerifyForm({ status, docType, docNumber, note, verifiedAt, citizenshipNumber }: Props) {
  const [state, formAction, isPending] = useActionState<VerifyState, FormData>(submitVerification, undefined)
  const [selectedDocType, setSelectedDocType] = useState<string>('citizenship')
  const [uploading, setUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState('')
  const [uploadedName, setUploadedName] = useState('')
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const currentStatus = (state?.success && state.status) ? state.status : status

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'document')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = await res.json()
      setUploadedUrl(data.url)
      setUploadedName(file.name)
    } catch {
      setUploadError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  // Already verified
  if (currentStatus === 'verified') {
    return (
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Identity Verified</h2>
        {verifiedAt && (
          <p className="text-xs text-slate-400 mb-3">
            Verified on {new Date(verifiedAt).toLocaleDateString('en-NP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        {citizenshipNumber && (
          <span className="inline-block font-mono text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-lg">
            {citizenshipNumber}
          </span>
        )}
        <div className="mt-6">
          <a href="/dashboard/profile" className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors inline-block">
            Go to Profile
          </a>
        </div>
      </div>
    )
  }

  // Pending review
  if (currentStatus === 'pending' && !state) {
    return (
      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Verification Pending</h2>
        <p className="text-slate-500 text-sm mt-1 mb-4">
          Your document has been submitted and is waiting for admin review. This usually takes 1–2 business days.
        </p>
        {docNumber && (
          <div className="text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-2 inline-block">
            Submitted: <span className="font-mono font-semibold text-slate-700">{docNumber}</span>
            {docType && <span className="ml-2 text-slate-400">({docType.replace('_', ' ')})</span>}
          </div>
        )}
      </div>
    )
  }

  // Rejected — allow resubmit
  const isRejected = currentStatus === 'rejected'

  return (
    <div className="space-y-4">
      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">How it works</p>
          <ol className="space-y-0.5 text-blue-700 list-decimal list-inside">
            <li>Select your document type</li>
            <li>Enter the document number</li>
            <li>Upload a clear photo of the document</li>
            <li>Admin reviews and approves within 1–2 days</li>
          </ol>
        </div>
      </div>

      {/* Rejected notice */}
      {isRejected && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex gap-3">
          <ShieldX className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">Previous submission rejected</p>
            {note && <p className="text-xs text-red-700 mt-0.5">{note}</p>}
            <p className="text-xs text-red-600 mt-1">Please resubmit with a clearer photo.</p>
          </div>
        </div>
      )}

      {/* Success state after submission */}
      {state?.success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-800 font-medium">{state.message}</p>
        </div>
      )}

      {/* Error */}
      {state && !state.success && state.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800">{state.error}</p>
        </div>
      )}

      <form action={formAction} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">

        {/* Document type */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-3">Document Type</label>
          <div className="grid grid-cols-3 gap-2">
            {DOC_TYPES.map(({ value, label, nepali, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedDocType(value)}
                className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border-2 transition-all ${
                  selectedDocType === value
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >
                <Icon className={`w-5 h-5 ${selectedDocType === value ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`text-xs font-semibold leading-tight text-center ${selectedDocType === value ? 'text-emerald-700' : 'text-slate-600'}`}>
                  {label}
                </span>
                <span className="text-[10px] text-slate-400">{nepali}</span>
              </button>
            ))}
          </div>
          <input type="hidden" name="documentType" value={selectedDocType} />
          {state && !state.success && state.errors?.documentType && (
            <p className="mt-1 text-xs text-red-600">{state.errors.documentType[0]}</p>
          )}
        </div>

        {/* Document number */}
        <div>
          <label htmlFor="documentNumber" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Document Number
          </label>
          <input
            id="documentNumber"
            name="documentNumber"
            type="text"
            placeholder={DOC_TYPES.find(d => d.value === selectedDocType)?.placeholder ?? ''}
            className={`w-full px-4 py-3 rounded-xl border text-slate-900 placeholder-slate-400 text-sm outline-none transition-all focus:ring-2 focus:ring-emerald-500 focus:border-transparent ${
              state && !state.success && state.errors?.documentNumber ? 'border-red-400 bg-red-50' : 'border-slate-300'
            }`}
          />
          {state && !state.success && state.errors?.documentNumber && (
            <p className="mt-1 text-xs text-red-600">{state.errors.documentNumber[0]}</p>
          )}
        </div>

        {/* Document photo upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Upload Document Photo
          </label>

          {!uploadedUrl ? (
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
                state && !state.success && state.errors?.documentUrl
                  ? 'border-red-400 bg-red-50'
                  : 'border-slate-300 hover:border-emerald-400 hover:bg-emerald-50'
              }`}
            >
              {uploading ? (
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
              ) : (
                <Upload className="w-8 h-8 text-slate-400" />
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  {uploading ? 'Uploading...' : 'Click to upload'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">JPG, PNG or PDF · Max 20 MB</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </div>
          ) : (
            <div className="flex items-center gap-3 border border-emerald-300 bg-emerald-50 rounded-xl px-4 py-3">
              <ImageIcon className="w-5 h-5 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-emerald-800 truncate">{uploadedName}</p>
                <p className="text-xs text-emerald-600">Uploaded successfully</p>
              </div>
              <button
                type="button"
                onClick={() => { setUploadedUrl(''); setUploadedName('') }}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <input type="hidden" name="documentUrl" value={uploadedUrl} />

          {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
          {state && !state.success && state.errors?.documentUrl && (
            <p className="mt-1 text-xs text-red-600">{state.errors.documentUrl[0]}</p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            Tip: Take a clear, well-lit photo. Make sure all text is readable. Cover your address if you prefer.
          </p>
        </div>

        {/* Amber privacy note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
          <strong>Privacy:</strong> Your document photo is stored securely and only viewed by authorized admins for verification purposes. It is never shared.
        </div>

        <button
          type="submit"
          disabled={isPending || uploading || !uploadedUrl}
          className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              Submit for Verification
            </>
          )}
        </button>
      </form>
    </div>
  )
}
