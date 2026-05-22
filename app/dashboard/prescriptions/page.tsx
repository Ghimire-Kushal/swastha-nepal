import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPrescriptions } from '@/services/patient'
import { FileText, Pill, CalendarX } from 'lucide-react'

const STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  dispensed: { label: 'Dispensed', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  expired: { label: 'Expired', color: 'bg-slate-100 text-slate-500 border-slate-200' },
}

export default async function PrescriptionsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const prescriptions = await getPrescriptions(session.sub)
  const active = prescriptions.filter((p) => p.status === 'active')
  const others = prescriptions.filter((p) => p.status !== 'active')

  function RxCard({ rx }: { rx: (typeof prescriptions)[number] }) {
    const meta = STATUS_META[rx.status] ?? { label: rx.status, color: 'bg-slate-100 text-slate-600 border-slate-200' }
    const isExpired = rx.status === 'expired'
    return (
      <div className={`bg-white rounded-xl border ${isExpired ? 'border-slate-200 opacity-70' : 'border-slate-200'} overflow-hidden`}>
        <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-4 h-4 text-purple-500" />
              <span className="font-semibold text-slate-900 text-sm">Prescription #{rx.id.slice(-3)}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-xs text-slate-500">{rx.doctor} · {rx.hospital}</p>
          </div>
          <div className="text-right text-xs text-slate-400 shrink-0">
            <div>Prescribed: {rx.prescribedDate}</div>
            <div className="flex items-center gap-1 justify-end mt-0.5">
              <CalendarX className="w-3 h-3" />
              Valid until: {rx.validUntil}
            </div>
          </div>
        </div>
        <div className="divide-y divide-slate-50">
          {rx.items.map((item, i) => (
            <div key={i} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Pill className="w-4 h-4 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm">{item.medicineName}</span>
                    <span className="text-xs text-slate-500">{item.genericName}</span>
                    <span className="text-xs font-medium text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.dosage}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                    <span><span className="font-medium text-slate-600">Frequency:</span> {item.frequency}</span>
                    <span><span className="font-medium text-slate-600">Duration:</span> {item.duration}</span>
                    <span><span className="font-medium text-slate-600">Route:</span> {item.route}</span>
                  </div>
                  {item.instructions && (
                    <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-2 py-1">
                      {item.instructions}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Prescriptions</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {active.length} active · {prescriptions.length} total
        </p>
      </div>

      {active.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active</h2>
          {active.map((rx) => <RxCard key={rx.id} rx={rx} />)}
        </section>
      )}

      {others.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Past</h2>
          {others.map((rx) => <RxCard key={rx.id} rx={rx} />)}
        </section>
      )}
    </div>
  )
}
