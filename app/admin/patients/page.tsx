import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getHighRiskPatients } from '@/services/admin'
import { AlertTriangle } from 'lucide-react'

export default async function HighRiskPatientsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const patients = await getHighRiskPatients(session.sub)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" />
          High-Risk Patients
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Patients flagged by AI risk scoring — require priority follow-up
        </p>
      </div>

      <div className="space-y-3">
        {patients.map((p) => {
          const riskColor =
            p.riskScore >= 90 ? 'bg-red-100 border-red-300 text-red-700' :
            p.riskScore >= 80 ? 'bg-orange-100 border-orange-300 text-orange-700' :
            'bg-amber-100 border-amber-300 text-amber-700'

          return (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900">{p.name}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-bold ${riskColor}`}>
                      Risk: {p.riskScore}/100
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {p.age} yrs · {p.district} · {p.assignedDoctor}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">Last visit: {p.lastVisit}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {p.conditions.map((c, i) => (
                      <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Risk gauge */}
                <div className="text-center shrink-0">
                  <div className="relative w-16 h-16">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke={p.riskScore >= 90 ? '#ef4444' : p.riskScore >= 80 ? '#f97316' : '#f59e0b'}
                        strokeWidth="3"
                        strokeDasharray={`${p.riskScore} 100`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-black text-slate-900">{p.riskScore}</span>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Risk Score</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
