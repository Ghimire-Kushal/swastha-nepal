'use client'

import { useActionState, useState, useEffect } from 'react'
import { uploadLabReport, type LabActionState } from '@/app/actions/lab'
import { Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react'
import FileUpload, { type UploadedFile } from '@/components/FileUpload'

interface PatientOption {
  id: string
  name: string
  citizenshipNumber: string
}

interface ResultRow {
  id: number
  parameter: string
  value: string
  unit: string
  referenceRange: string
  isAbnormal: boolean
}

const CATEGORIES = [
  { value: 'hematology', label: 'Hematology' },
  { value: 'biochemistry', label: 'Biochemistry' },
  { value: 'microbiology', label: 'Microbiology' },
  { value: 'imaging', label: 'Imaging / Radiology' },
  { value: 'pathology', label: 'Pathology' },
  { value: 'other', label: 'Other' },
]

let _nextId = 1

export default function LabUploadPage() {
  const [state, action, pending] = useActionState<LabActionState, FormData>(uploadLabReport, undefined)
  const [rows, setRows] = useState<ResultRow[]>([
    { id: _nextId++, parameter: '', value: '', unit: '', referenceRange: '', isAbnormal: false },
  ])
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [patients, setPatients] = useState<PatientOption[]>([])

  useEffect(() => {
    fetch('/api/patients/list')
      .then((r) => r.json())
      .then((data) => setPatients(data.patients ?? []))
      .catch(() => {})
  }, [])

  function addRow() {
    setRows((prev) => [
      ...prev,
      { id: _nextId++, parameter: '', value: '', unit: '', referenceRange: '', isAbnormal: false },
    ])
  }

  function removeRow(id: number) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRow(id: number, field: keyof ResultRow, value: string | boolean) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function handleSubmit(formData: FormData) {
    formData.set('results', JSON.stringify(rows.map(({ id: _id, ...rest }) => rest)))
    return action(formData)
  }

  function err(field: string) {
    return state?.errors?.[field]?.[0]
  }

  const hasAbnormal = rows.some((r) => r.isAbnormal)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Upload Lab Report</h1>
        <p className="text-slate-500 text-sm mt-0.5">Enter test results and optionally attach a file</p>
      </div>

      {state?.success && (
        <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
          <CheckCircle className="w-4 h-4" />
          {state.message}
        </div>
      )}

      <form action={handleSubmit} className="space-y-5">
        {/* Patient + order */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium text-slate-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              <select
                id="patientId"
                name="patientId"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}{p.citizenshipNumber ? ` — ${p.citizenshipNumber}` : ''}
                  </option>
                ))}
              </select>
              {err('patientId') && <p className="text-red-500 text-xs mt-1">{err('patientId')}</p>}
            </div>
            <div>
              <label htmlFor="orderId" className="block text-sm font-medium text-slate-700 mb-1">
                Linked Order (optional)
              </label>
              <select
                id="orderId"
                name="orderId"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">None</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="testName" className="block text-sm font-medium text-slate-700 mb-1">
                Test Name <span className="text-red-500">*</span>
              </label>
              <input
                id="testName"
                name="testName"
                type="text"
                placeholder="e.g. Complete Blood Count"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              {err('testName') && <p className="text-red-500 text-xs mt-1">{err('testName')}</p>}
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="category"
                name="category"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {err('category') && <p className="text-red-500 text-xs mt-1">{err('category')}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="sampleType" className="block text-sm font-medium text-slate-700 mb-1">
              Sample Type
            </label>
            <input
              id="sampleType"
              name="sampleType"
              type="text"
              placeholder="e.g. Whole Blood, Serum, Urine, Tissue"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Result rows */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 text-sm">Test Results</h2>
            {hasAbnormal && (
              <span className="flex items-center gap-1 text-xs text-red-600 font-medium">
                <AlertTriangle className="w-3.5 h-3.5" />
                {rows.filter((r) => r.isAbnormal).length} abnormal value{rows.filter((r) => r.isAbnormal).length !== 1 ? 's' : ''} marked
              </span>
            )}
          </div>

          <div className="space-y-3">
            {rows.map((row, idx) => (
              <div
                key={row.id}
                className={`grid grid-cols-12 gap-2 p-3 rounded-lg border ${row.isAbnormal ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}
              >
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs text-slate-500 mb-1">Parameter</label>}
                  <input
                    type="text"
                    value={row.parameter}
                    onChange={(e) => updateRow(row.id, 'parameter', e.target.value)}
                    placeholder="e.g. Haemoglobin"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <label className="block text-xs text-slate-500 mb-1">Value</label>}
                  <input
                    type="text"
                    value={row.value}
                    onChange={(e) => updateRow(row.id, 'value', e.target.value)}
                    placeholder="14.2"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-2">
                  {idx === 0 && <label className="block text-xs text-slate-500 mb-1">Unit</label>}
                  <input
                    type="text"
                    value={row.unit}
                    onChange={(e) => updateRow(row.id, 'unit', e.target.value)}
                    placeholder="g/dL"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-3">
                  {idx === 0 && <label className="block text-xs text-slate-500 mb-1">Reference Range</label>}
                  <input
                    type="text"
                    value={row.referenceRange}
                    onChange={(e) => updateRow(row.id, 'referenceRange', e.target.value)}
                    placeholder="13.5–17.5"
                    className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  {idx === 0 && <label className="block text-xs text-slate-500 mb-1">⚠️</label>}
                  <button
                    type="button"
                    onClick={() => updateRow(row.id, 'isAbnormal', !row.isAbnormal)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-colors ${
                      row.isAbnormal
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-slate-300 text-slate-300 hover:border-red-400 hover:text-red-400'
                    }`}
                    title="Mark as abnormal"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="col-span-1 flex flex-col items-center">
                  {idx === 0 && <div className="h-4 mb-1" />}
                  {rows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeRow(row.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {err('results') && <p className="text-red-500 text-xs mt-2">{err('results')}</p>}

          <button
            type="button"
            onClick={addRow}
            className="mt-3 w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-xs font-medium text-slate-500 hover:border-purple-400 hover:text-purple-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Parameter
          </button>
        </div>

        {/* File + options */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
          {/* Hidden Cloudinary URL fields */}
          <input type="hidden" name="fileUrl" value={uploadedFile?.url ?? ''} />
          <input type="hidden" name="filePublicId" value={uploadedFile?.publicId ?? ''} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Attach Report File <span className="text-slate-400 font-normal">(optional — PDF, JPEG)</span>
            </label>
            <FileUpload
              fileType="lab_report"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxSizeMB={20}
              label="Upload lab report or scan"
              onUpload={setUploadedFile}
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Technician Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Sample quality, processing notes, remarks…"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" name="sendToDoctor" value="1" className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500" defaultChecked />
            <span className="text-sm text-slate-700">Auto-send report to ordering doctor</span>
          </label>
        </div>

        {state?.message && !state.success && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {state.message}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full py-3 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {pending ? 'Uploading…' : (
            <>
              <CheckCircle className="w-4 h-4" />
              Submit Report
            </>
          )}
        </button>
      </form>
    </div>
  )
}
