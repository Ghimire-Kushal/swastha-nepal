import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllPrescriptions } from '@/services/pharmacy'
import { Pill, Clock, CheckCircle, PackageCheck, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { RxStatus } from '@/lib/mock-pharmacy-data'

const STATUS_CONFIG: Record<RxStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending:   { label: 'Pending',   color: 'bg-amber-100 text-amber-700 border-amber-200',   icon: Clock },
  verified:  { label: 'Verified',  color: 'bg-blue-100 text-blue-700 border-blue-200',       icon: CheckCircle },
  dispensed: { label: 'Dispensed', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: PackageCheck },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-700 border-red-200',         icon: XCircle },
}

export default async function PharmacyPrescriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { filter } = await searchParams
  const all = await getAllPrescriptions(session.sub)
  const prescriptions = filter ? all.filter((r) => r.status === filter) : all

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" />
            Prescriptions
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {prescriptions.length} prescription{prescriptions.length !== 1 ? 's' : ''}
            {filter ? ` · filtered by ${filter}` : ''}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['pending', 'verified', 'dispensed'].map((f) => (
            <Link
              key={f}
              href={filter === f ? '/pharmacy/prescriptions' : `/pharmacy/prescriptions?filter=${f}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filter === f
                  ? 'bg-teal-600 text-white border-teal-600'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Link>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {prescriptions.map((rx) => {
          const cfg = STATUS_CONFIG[rx.status]
          return (
            <Link
              key={rx.id}
              href={`/pharmacy/prescriptions/${rx.id}`}
              className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold text-slate-900">{rx.patientName}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {rx.doctorName} · {rx.hospital}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {rx.items.length} item{rx.items.length !== 1 ? 's' : ''} · {rx.prescriptionDate}
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold flex items-center gap-1 ${cfg.color}`}>
                  <cfg.icon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
              {rx.dispensedAt && (
                <div className="mt-2 text-xs text-slate-400">Dispensed on {rx.dispensedAt}</div>
              )}
            </Link>
          )
        })}

        {prescriptions.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Pill className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No prescriptions found</p>
          </div>
        )}
      </div>
    </div>
  )
}
