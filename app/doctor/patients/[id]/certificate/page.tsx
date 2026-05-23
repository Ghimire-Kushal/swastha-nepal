'use client'

import { useActionState, useState } from 'react'
import { useParams } from 'next/navigation'
import { generateCertificate, type DoctorActionState } from '@/app/actions/doctor'
import Link from 'next/link'
import { ArrowLeft, Award, Printer, CheckCircle } from 'lucide-react'

const CERT_TYPES = [
  { value: 'fitness', label: 'Medical Fitness Certificate', desc: 'Certifies patient is fit for duty/activity' },
  { value: 'sick_leave', label: 'Sick Leave Certificate', desc: 'Recommends medical leave' },
  { value: 'referral', label: 'Referral Letter', desc: 'Refers patient to specialist/hospital' },
  { value: 'custom', label: 'Custom Certificate', desc: 'Free-form medical certificate' },
]

export default function CertificatePage() {
  const params = useParams<{ id: string }>()
  const [certType, setCertType] = useState('fitness')
  const [state, action, pending] = useActionState<DoctorActionState, FormData>(generateCertificate, undefined)

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
          <h1 className="text-2xl font-bold text-slate-900">Generate Certificate</h1>
          <p className="text-slate-500 text-sm">Create a medical certificate for this patient</p>
        </div>
      </div>

      {state?.success ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-medium">
            <CheckCircle className="w-4 h-4" />
            {state.message}
          </div>

          {/* Certificate preview */}
          <div className="bg-white rounded-xl border-2 border-slate-200 p-8 print:shadow-none" id="certificate">
            <div className="text-center border-b-2 border-slate-200 pb-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-6 h-6 text-blue-600" />
                <span className="text-xl font-black text-slate-900">Swastha Nepal</span>
              </div>
              <div className="text-slate-500 text-sm">Grande International Hospital, Kathmandu, Nepal</div>
              <div className="text-slate-400 text-xs mt-0.5">License No: NMC-2019-003421</div>
            </div>

            <h2 className="text-center text-lg font-bold text-slate-900 uppercase tracking-wide mb-6">
              {CERT_TYPES.find((t) => t.value === certType)?.label}
            </h2>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                <span className="font-semibold">Date:</span> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              <p>
                This is to certify that the patient bearing ID <span className="font-semibold">{params.id}</span> has been examined by the undersigned and the clinical findings are as noted below.
              </p>
              <p className="text-slate-400 italic">[Certificate content recorded in the system]</p>
            </div>

            <div className="mt-10 flex justify-end">
              <div className="text-center">
                <div className="border-t-2 border-slate-300 w-48 mb-2" />
                <div className="text-sm font-semibold text-slate-900">Dr. Anita Sharma</div>
                <div className="text-xs text-slate-500">MBBS, MD — General Medicine</div>
                <div className="text-xs text-slate-400">NMC Reg. No: 003421</div>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors print:hidden"
          >
            <Printer className="w-4 h-4" />
            Print Certificate
          </button>
        </div>
      ) : (
        <form action={action} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <input type="hidden" name="patientId" value={params.id} />

          {/* Certificate type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Certificate Type <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {CERT_TYPES.map((ct) => (
                <label key={ct.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="certType"
                    value={ct.value}
                    checked={certType === ct.value}
                    onChange={() => setCertType(ct.value)}
                    className="sr-only"
                  />
                  <div
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      certType === ct.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-semibold text-slate-800">{ct.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{ct.desc}</div>
                  </div>
                </label>
              ))}
            </div>
            {err('certType') && <p className="text-red-500 text-xs mt-1">{err('certType')}</p>}
          </div>

          {/* Diagnosis */}
          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-slate-700 mb-1">
              Diagnosis / Clinical Findings <span className="text-red-500">*</span>
            </label>
            <textarea
              id="diagnosis"
              name="diagnosis"
              rows={2}
              placeholder="e.g. Acute Viral Upper Respiratory Tract Infection"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            {err('diagnosis') && <p className="text-red-500 text-xs mt-1">{err('diagnosis')}</p>}
          </div>

          {/* Recommendation */}
          <div>
            <label htmlFor="recommendation" className="block text-sm font-medium text-slate-700 mb-1">
              Recommendation <span className="text-red-500">*</span>
            </label>
            <textarea
              id="recommendation"
              name="recommendation"
              rows={2}
              placeholder={
                certType === 'sick_leave'
                  ? 'e.g. Patient requires 7 days of complete bed rest'
                  : certType === 'referral'
                  ? 'e.g. Referred to Cardiology for further evaluation'
                  : 'e.g. Patient is medically fit to resume normal duties'
              }
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
            {err('recommendation') && <p className="text-red-500 text-xs mt-1">{err('recommendation')}</p>}
          </div>

          {certType === 'sick_leave' && (
            <div>
              <label htmlFor="sickLeaveDays" className="block text-sm font-medium text-slate-700 mb-1">
                Leave Duration (days)
              </label>
              <input
                id="sickLeaveDays"
                name="sickLeaveDays"
                type="number"
                min={1}
                max={365}
                placeholder="7"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {certType === 'referral' && (
            <div>
              <label htmlFor="referralHospital" className="block text-sm font-medium text-slate-700 mb-1">
                Referral Hospital / Specialist
              </label>
              <input
                id="referralHospital"
                name="referralHospital"
                type="text"
                placeholder="e.g. Norvic International Hospital — Cardiology"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

          {/* Additional notes */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={2}
              placeholder="Any additional remarks…"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
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
            className="w-full py-3 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {pending ? 'Generating…' : 'Generate Certificate'}
          </button>
        </form>
      )}
    </div>
  )
}
