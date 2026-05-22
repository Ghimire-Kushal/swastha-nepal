import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getVaccinationStats } from '@/services/admin'
import { Syringe, CheckCircle, AlertTriangle } from 'lucide-react'
import VaccinationChart from '@/components/admin/VaccinationChart'

export default async function VaccinationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const vaccines = await getVaccinationStats(session.sub)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Syringe className="w-6 h-6 text-indigo-600" />
          Vaccination Statistics
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">National immunization coverage across all programs</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 text-sm">Coverage by Vaccine</h2>
        <VaccinationChart data={vaccines} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaccines.map((v) => {
          const pct = v.covered
          const isOnTarget = pct >= v.target * 0.9
          return (
            <div
              key={v.vaccine}
              className={`bg-white rounded-xl border p-4 ${isOnTarget ? 'border-emerald-200' : 'border-amber-200'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-slate-900 text-sm">{v.vaccine}</span>
                {isOnTarget
                  ? <CheckCircle className="w-4 h-4 text-emerald-500" />
                  : <AlertTriangle className="w-4 h-4 text-amber-500" />
                }
              </div>
              <div className="flex items-end justify-between mb-1">
                <span className={`text-2xl font-black ${isOnTarget ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {pct}%
                </span>
                <span className="text-xs text-slate-400">Target: {v.target}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isOnTarget ? 'bg-emerald-500' : 'bg-amber-400'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="text-xs text-slate-400 mt-1.5">
                {v.beneficiaries.toLocaleString()} beneficiaries
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
