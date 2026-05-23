'use client'

import { useActionState, useEffect, useRef } from 'react'
import { registerBirth } from '@/app/actions/records'
import { Baby, Printer } from 'lucide-react'

export default function BirthRecordPage() {
  const [state, action] = useActionState(registerBirth, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) formRef.current?.reset()
  }, [state])

  if (state?.success) {
    const d = state.data
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-500" />
            Birth Certificate Issued
          </h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        {/* Printable certificate */}
        <div className="bg-white rounded-2xl border-2 border-blue-200 overflow-hidden shadow-sm" id="birth-cert">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-center">
            <div className="text-white font-bold text-lg">Government of Nepal</div>
            <div className="text-blue-200 text-sm">Swastha Nepal — Digital Records System</div>
            <div className="text-white font-black text-2xl mt-2">BIRTH CERTIFICATE</div>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center text-xs text-slate-500 border-b border-dashed border-slate-200 pb-3">
              Certificate No: <span className="font-bold text-slate-900 font-mono">{d.certNumber}</span>
              &nbsp;·&nbsp; Issued: {d.issuedDate}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Full Name of Child', d.childName],
                ['Date of Birth', d.dateOfBirth],
                ['Time of Birth', d.timeOfBirth ?? '—'],
                ['Gender', d.gender],
                ['Birth Weight', d.birthWeight ? `${d.birthWeight} kg` : '—'],
                ['Place of Birth', d.birthPlace],
                ["Mother's Name", d.motherName],
                ["Father's Name", d.fatherName],
                ['Permanent Address', d.address],
                ['Delivery Type', d.deliveryType],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="text-xs text-slate-400 uppercase tracking-wide">{label}</div>
                  <div className="font-semibold text-slate-900 text-sm mt-0.5">{value}</div>
                </div>
              ))}
            </div>

            {d.notes && (
              <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-600">
                <span className="font-medium text-slate-700">Notes: </span>{d.notes}
              </div>
            )}

            <div className="border-t border-dashed border-slate-200 pt-4 flex justify-between items-end">
              <div className="text-xs text-slate-400">
                This certificate is issued under the authority of<br />
                Swastha Nepal Health Information System
              </div>
              <div className="text-right">
                <div className="border-t-2 border-slate-400 pt-1 text-xs text-slate-600 font-medium w-32">
                  Doctor&apos;s Signature
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="text-sm text-blue-600 hover:underline print:hidden"
        >
          Register another birth →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Baby className="w-6 h-6 text-blue-500" />
          Birth Registration
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Register a new birth and issue digital birth certificate</p>
      </div>

      {state && !state.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form ref={formRef} action={action} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name of Child *</label>
            <input name="childName" required placeholder="e.g. Aarav Sharma" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
            <input name="dateOfBirth" type="date" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Time of Birth</label>
            <input name="timeOfBirth" type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
            <select name="gender" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Birth Weight (kg)</label>
            <input name="birthWeight" type="number" step="0.01" placeholder="e.g. 3.2" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Place of Birth *</label>
            <input name="birthPlace" required placeholder="e.g. Grande International Hospital, Kathmandu" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mother&apos;s Full Name *</label>
            <input name="motherName" required placeholder="e.g. Sita Kumari Sharma" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Father&apos;s Full Name *</label>
            <input name="fatherName" required placeholder="e.g. Ram Bahadur Sharma" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Address *</label>
            <input name="address" required placeholder="e.g. Baneshwor, Ward No. 10, Kathmandu" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Type *</label>
            <select name="deliveryType" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
              <option value="">Select type</option>
              <option value="normal">Normal Vaginal</option>
              <option value="cesarean">Cesarean (C-Section)</option>
              <option value="assisted">Assisted (Forceps/Vacuum)</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
            <textarea name="notes" rows={2} placeholder="Any complications, health status at birth, etc." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <Baby className="w-5 h-5" />
          Register Birth &amp; Issue Certificate
        </button>
      </form>
    </div>
  )
}
