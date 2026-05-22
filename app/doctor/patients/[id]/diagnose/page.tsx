'use client'

import { useActionState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { addDiagnosis, type DoctorActionState } from '@/app/actions/doctor'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle } from 'lucide-react'

const RECORD_TYPES = [
  { value: 'diagnosis', label: 'Diagnosis' },
  { value: 'visit_note', label: 'Visit Note' },
  { value: 'procedure', label: 'Procedure' },
]

export default function DiagnosePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [state, action, pending] = useActionState<DoctorActionState, FormData>(addDiagnosis, undefined)

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => router.push(`/doctor/patients/${params.id}`), 1200)
    }
  }, [state?.success, router, params.id])

  function err(field: string) {
    return state?.errors?.[field]?.[0]
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/doctor/patients/${params.id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Diagnosis</h1>
          <p className="text-slate-500 text-sm">Record a new diagnosis or visit note</p>
        </div>
      </div>

      {state?.success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {state.message} — redirecting…
        </div>
      )}

      {state?.message && !state.success && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {state.message}
        </div>
      )}

      <form action={action} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <input type="hidden" name="patientId" value={params.id} />

        {/* Record type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Record Type</label>
          <div className="flex gap-2 flex-wrap">
            {RECORD_TYPES.map((rt) => (
              <label key={rt.value} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="recordType" value={rt.value} defaultChecked={rt.value === 'diagnosis'} className="sr-only peer" />
                <span className="px-4 py-2 text-sm border border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-colors">
                  {rt.label}
                </span>
              </label>
            ))}
          </div>
          {err('recordType') && <p className="text-red-500 text-xs mt-1">{err('recordType')}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="e.g. Annual Health Checkup — Hypertension"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {err('title') && <p className="text-red-500 text-xs mt-1">{err('title')}</p>}
        </div>

        {/* Diagnosis */}
        <div>
          <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700 mb-1">
            Diagnosis / Findings <span className="text-red-500">*</span>
          </label>
          <textarea
            id="diagnosis"
            name="diagnosis"
            rows={2}
            placeholder="e.g. Stage 1 Hypertension, Vitamin D Deficiency"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {err('diagnosis') && <p className="text-red-500 text-xs mt-1">{err('diagnosis')}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* ICD Code */}
          <div>
            <label htmlFor="icdCode" className="block text-sm font-medium text-slate-700 mb-1">
              ICD-10 Code
            </label>
            <input
              id="icdCode"
              name="icdCode"
              type="text"
              placeholder="e.g. I10"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Follow-up date */}
          <div>
            <label htmlFor="followUpDate" className="block text-sm font-medium text-slate-700 mb-1">
              Follow-up Date
            </label>
            <input
              id="followUpDate"
              name="followUpDate"
              type="date"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Symptoms */}
        <div>
          <label htmlFor="symptoms" className="block text-sm font-medium text-slate-700 mb-1">
            Symptoms <span className="text-slate-400 font-normal">(comma-separated)</span>
          </label>
          <input
            id="symptoms"
            name="symptoms"
            type="text"
            placeholder="e.g. Mild headache, Fatigue, Dizziness"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            Clinical Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Additional observations, treatment plan, advice given…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={pending || state?.success}
          className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Saving…' : 'Save Diagnosis'}
        </button>
      </form>
    </div>
  )
}
