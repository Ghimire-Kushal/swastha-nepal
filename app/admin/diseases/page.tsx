import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDiseaseStats } from '@/services/admin'
import { Activity, TrendingUp, TrendingDown } from 'lucide-react'
import DiseaseChart from '@/components/admin/DiseaseChart'

export default async function DiseasesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const diseases = await getDiseaseStats(session.sub)
  const maxCount = Math.max(...diseases.map((d) => d.count))

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Disease Statistics
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Nepal-wide disease burden — top conditions by patient count
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 text-sm">Disease Distribution</h2>
        <DiseaseChart data={diseases} />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Disease</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Patients</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Share</th>
              <th className="text-right px-5 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Trend (MoM)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {diseases.map((d, i) => {
              const share = ((d.count / maxCount) * 100).toFixed(0)
              return (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-4 text-right">{i + 1}</span>
                      <span className="font-medium text-slate-900">{d.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-mono font-bold text-slate-900">
                    {d.count.toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 rounded-full"
                          style={{ width: `${share}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-8 text-right">{share}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${d.trend > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {d.trend > 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {d.trend > 0 ? '+' : ''}{d.trend}%
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
