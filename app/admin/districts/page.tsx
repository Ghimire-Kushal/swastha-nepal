import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDistrictStats } from '@/services/admin'
import { MapPin } from 'lucide-react'

export default async function DistrictsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const districts = await getDistrictStats(session.sub)
  const maxPatients = Math.max(...districts.map((d) => d.patients))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-6 h-6 text-indigo-600" />
          District-wise Health Data
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Patient distribution and risk across districts</p>
      </div>

      {/* Visual bars */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 text-sm">Patient Load by District</h2>
        <div className="space-y-3">
          {districts.map((d) => {
            const pct = Math.round((d.patients / maxPatients) * 100)
            const riskPct = Math.round((d.highRisk / d.patients) * 100)
            return (
              <div key={d.district}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-800">{d.district}</span>
                  <span className="text-slate-500">{d.patients.toLocaleString()} patients</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-0.5">
                  <span>{d.province}</span>
                  <span className="text-red-500 font-medium">{riskPct}% high-risk</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">District</th>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Province</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Patients</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">High Risk</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Hospitals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {districts.map((d) => (
              <tr key={d.district} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-semibold text-slate-900">{d.district}</td>
                <td className="px-5 py-3 text-slate-500">{d.province}</td>
                <td className="px-5 py-3 text-right font-mono text-slate-900">{d.patients.toLocaleString()}</td>
                <td className="px-5 py-3 text-right">
                  <span className="text-red-600 font-semibold">{d.highRisk}</span>
                </td>
                <td className="px-5 py-3 text-right text-slate-600">{d.hospitals}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
