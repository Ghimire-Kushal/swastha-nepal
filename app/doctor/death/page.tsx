'use client'

import { useActionState, useEffect, useRef } from 'react'
import { registerDeath } from '@/app/actions/records'
import { Skull, Printer } from 'lucide-react'

export default function DeathRecordPage() {
  const [state, action] = useActionState(registerDeath, undefined)
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
            <Skull className="w-5 h-5 text-slate-600" />
            Death Certificate Issued
          </h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-lg hover:bg-slate-50"
          >
            <Printer className="w-4 h-4" />
            Print
          </button>
        </div>

        <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-sm" id="death-cert">
          <div className="bg-slate-800 px-6 py-5 text-center">
            <div className="text-white font-bold text-lg">Government of Nepal</div>
            <div className="text-slate-400 text-sm">Swastha Nepal — Digital Records System</div>
            <div className="text-white font-black text-2xl mt-2">DEATH CERTIFICATE</div>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center text-xs text-slate-500 border-b border-dashed border-slate-200 pb-3">
              Certificate No: <span className="font-bold text-slate-900 font-mono">{d.certNumber}</span>
              &nbsp;·&nbsp; Issued: {d.issuedDate}
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {[
                ['Full Name of Deceased', d.deceasedName],
                ['Date of Death', d.dateOfDeath],
                ['Time of Death', d.timeOfDeath ?? '—'],
                ['Age', d.age + ' years'],
                ['Gender', d.gender],
                ['Place of Death', d.placeOfDeath],
                ['Permanent Address', d.address],
                ['Cause of Death', d.causeOfDeath],
                ['Manner of Death', d.mannerOfDeath],
                ['Attending Doctor', d.attendingDoctor ?? '—'],
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
                Certified by Swastha Nepal Health Information System<br />
                This document has legal validity under Nepal Health Act 2075
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
          className="text-sm text-slate-600 hover:underline print:hidden"
        >
          Register another death record →
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Skull className="w-6 h-6 text-slate-600" />
          Death Registration
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Register a death and issue digital death certificate</p>
      </div>

      {state && !state.success && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 text-red-700 text-sm">
          {state.error}
        </div>
      )}

      <form ref={formRef} action={action} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name of Deceased *</label>
            <input name="deceasedName" required placeholder="e.g. Hari Bahadur Thapa" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Death *</label>
            <input name="dateOfDeath" type="date" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Time of Death</label>
            <input name="timeOfDeath" type="time" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Age at Death *</label>
            <input name="age" required type="number" placeholder="e.g. 72" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Gender *</label>
            <select name="gender" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Permanent Address *</label>
            <input name="address" required placeholder="e.g. Patan, Ward No. 3, Lalitpur" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Cause of Death *</label>
            <input name="causeOfDeath" required placeholder="e.g. Acute Myocardial Infarction" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Manner of Death *</label>
            <select name="mannerOfDeath" required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200">
              <option value="">Select manner</option>
              <option value="natural">Natural</option>
              <option value="accident">Accident</option>
              <option value="homicide">Homicide</option>
              <option value="suicide">Suicide</option>
              <option value="unknown">Unknown / Undetermined</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Place of Death *</label>
            <input name="placeOfDeath" required placeholder="e.g. Bir Hospital, Kathmandu" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Attending Doctor (if applicable)</label>
            <input name="attendingDoctor" placeholder="e.g. Dr. Anita Sharma" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Additional Notes</label>
            <textarea name="notes" rows={2} placeholder="Any relevant clinical observations..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 resize-none" />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-slate-800 text-white font-semibold rounded-xl hover:bg-slate-900 transition-colors flex items-center justify-center gap-2"
        >
          <Skull className="w-5 h-5" />
          Register Death &amp; Issue Certificate
        </button>
      </form>
    </div>
  )
}
