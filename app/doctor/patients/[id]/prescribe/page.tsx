'use client'

import { useActionState, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { addPrescription, type DoctorActionState } from '@/app/actions/doctor'
import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, CheckCircle } from 'lucide-react'

interface MedItem {
  id: number
  medicineName: string
  genericName: string
  dosage: string
  frequency: string
  duration: string
  route: string
  instructions: string
}

let _nextId = 1

export default function PrescribePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const [state, action, pending] = useActionState<DoctorActionState, FormData>(addPrescription, undefined)
  const [items, setItems] = useState<MedItem[]>([
    { id: _nextId++, medicineName: '', genericName: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' },
  ])

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => router.push(`/doctor/patients/${params.id}`), 1200)
    }
  }, [state?.success, router, params.id])

  function addRow() {
    setItems((prev) => [
      ...prev,
      { id: _nextId++, medicineName: '', genericName: '', dosage: '', frequency: '', duration: '', route: 'Oral', instructions: '' },
    ])
  }

  function removeRow(id: number) {
    setItems((prev) => prev.filter((r) => r.id !== id))
  }

  function updateRow(id: number, field: keyof MedItem, value: string) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)))
  }

  function handleSubmit(formData: FormData) {
    formData.set('items', JSON.stringify(items.map(({ id: _id, ...rest }) => rest)))
    return action(formData)
  }

  function err(field: string) {
    return state?.errors?.[field]?.[0]
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/doctor/patients/${params.id}`} className="text-slate-400 hover:text-slate-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Write Prescription</h1>
          <p className="text-slate-500 text-sm">Add medicines for this patient</p>
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

      <form action={handleSubmit} className="space-y-5">
        <input type="hidden" name="patientId" value={params.id} />

        {/* Valid until + notes */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="validUntil" className="block text-sm font-medium text-slate-700 mb-1">
              Valid Until <span className="text-red-500">*</span>
            </label>
            <input
              id="validUntil"
              name="validUntil"
              type="date"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {err('validUntil') && <p className="text-red-500 text-xs mt-1">{err('validUntil')}</p>}
          </div>
          <div>
            <label htmlFor="pharmacyNotes" className="block text-sm font-medium text-slate-700 mb-1">
              Pharmacy Notes
            </label>
            <input
              id="pharmacyNotes"
              name="pharmacyNotes"
              type="text"
              placeholder="e.g. Dispense 30-day supply"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Medicine rows */}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-700">Medicine {idx + 1}</span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeRow(item.id)}
                    className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Medicine Name *</label>
                  <input
                    type="text"
                    value={item.medicineName}
                    onChange={(e) => updateRow(item.id, 'medicineName', e.target.value)}
                    placeholder="e.g. Amlodipine"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Generic Name</label>
                  <input
                    type="text"
                    value={item.genericName}
                    onChange={(e) => updateRow(item.id, 'genericName', e.target.value)}
                    placeholder="e.g. Amlodipine Besylate"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Dosage *</label>
                  <input
                    type="text"
                    value={item.dosage}
                    onChange={(e) => updateRow(item.id, 'dosage', e.target.value)}
                    placeholder="e.g. 5mg"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Frequency *</label>
                  <input
                    type="text"
                    value={item.frequency}
                    onChange={(e) => updateRow(item.id, 'frequency', e.target.value)}
                    placeholder="e.g. Once daily (morning)"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Duration</label>
                  <input
                    type="text"
                    value={item.duration}
                    onChange={(e) => updateRow(item.id, 'duration', e.target.value)}
                    placeholder="e.g. 3 months"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Route</label>
                  <select
                    value={item.route}
                    onChange={(e) => updateRow(item.id, 'route', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {['Oral', 'IV', 'IM', 'Sublingual', 'Topical', 'Inhaled', 'Rectal'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-3">
                <label className="block text-xs font-medium text-slate-600 mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={item.instructions}
                  onChange={(e) => updateRow(item.id, 'instructions', e.target.value)}
                  placeholder="e.g. Take with food. Monitor BP weekly."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          ))}

          {err('items') && <p className="text-red-500 text-xs">{err('items')}</p>}

          <button
            type="button"
            onClick={addRow}
            className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-sm font-medium text-slate-500 hover:border-emerald-400 hover:text-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Another Medicine
          </button>
        </div>

        <button
          type="submit"
          disabled={pending || state?.success}
          className="w-full py-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pending ? 'Saving…' : 'Issue Prescription'}
        </button>
      </form>
    </div>
  )
}
