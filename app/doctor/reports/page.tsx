'use client'

import { useActionState } from 'react'
import { uploadMedicalDocument, type DoctorActionState } from '@/app/actions/doctor'
import { Upload, CheckCircle, FileText } from 'lucide-react'
import { MOCK_DOCTOR_PATIENTS } from '@/lib/mock-doctor-data'

const REPORT_TYPES = [
  { value: 'xray', label: 'X-Ray' },
  { value: 'mri', label: 'MRI' },
  { value: 'ct', label: 'CT Scan' },
  { value: 'ultrasound', label: 'Ultrasound' },
  { value: 'ecg', label: 'ECG' },
  { value: 'other', label: 'Other' },
]

export default function DoctorUploadReportPage() {
  const [state, action, pending] = useActionState<DoctorActionState, FormData>(
    uploadMedicalDocument,
    undefined
  )

  function err(field: string) {
    return state?.errors?.[field]?.[0]
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Medical Report</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Attach X-rays, MRI, CT scans, ECG files to a patient record
        </p>
      </div>

      {state?.success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {state.message}
        </div>
      )}

      <form action={action} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        {/* Patient */}
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-slate-700 mb-1">
            Patient <span className="text-red-500">*</span>
          </label>
          <select
            id="patientId"
            name="patientId"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select patient…</option>
            {MOCK_DOCTOR_PATIENTS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.citizenshipNumber}
              </option>
            ))}
          </select>
          {err('patientId') && <p className="text-red-500 text-xs mt-1">{err('patientId')}</p>}
        </div>

        {/* Report type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Report Type <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {REPORT_TYPES.map((rt) => (
              <label key={rt.value} className="cursor-pointer">
                <input type="radio" name="reportType" value={rt.value} defaultChecked={rt.value === 'xray'} className="sr-only peer" />
                <span className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-colors">
                  {rt.label}
                </span>
              </label>
            ))}
          </div>
          {err('reportType') && <p className="text-red-500 text-xs mt-1">{err('reportType')}</p>}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="reportTitle" className="block text-sm font-medium text-slate-700 mb-1">
            Report Title <span className="text-red-500">*</span>
          </label>
          <input
            id="reportTitle"
            name="reportTitle"
            type="text"
            placeholder="e.g. Chest X-Ray — Baseline Assessment"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {err('reportTitle') && <p className="text-red-500 text-xs mt-1">{err('reportTitle')}</p>}
        </div>

        {/* File upload */}
        <div>
          <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-1">
            File <span className="text-red-500">*</span>
            <span className="text-slate-400 font-normal ml-1">(JPEG, PNG, PDF, DICOM — max 50 MB)</span>
          </label>
          <label
            htmlFor="file"
            className="flex flex-col items-center justify-center gap-2 w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
          >
            <Upload className="w-6 h-6 text-slate-400" />
            <span className="text-sm text-slate-500">Click to choose file or drag and drop</span>
            <input id="file" name="file" type="file" accept=".jpg,.jpeg,.png,.pdf,.dcm" className="sr-only" />
          </label>
          {err('file') && <p className="text-red-500 text-xs mt-1">{err('file')}</p>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            Clinical Notes / Findings
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="Radiologist findings, clinical context, relevant observations…"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {state?.message && !state.success && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {pending ? (
            'Uploading…'
          ) : (
            <>
              <FileText className="w-4 h-4" />
              Upload Report
            </>
          )}
        </button>
      </form>
    </div>
  )
}
