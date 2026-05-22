import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Brain, User } from 'lucide-react'
import { getRecentPatients } from '@/services/doctor'

export default async function DoctorAIPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const patients = await getRecentPatients(session.sub)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-6 h-6 text-blue-600" />
          AI Patient Analysis
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Select a patient to generate an AI-powered health risk assessment
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {patients.map((p) => {
          const age = new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
          return (
            <Link
              key={p.id}
              href={`/doctor/patients/${p.id}/ai`}
              className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">
                    {p.gender === 'male' ? 'Male' : 'Female'} · {age} yrs · {p.district}
                  </div>
                  {p.conditions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.conditions.map((c, i) => (
                        <span key={i} className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-blue-600 group-hover:translate-x-1 transition-transform">
                <Brain className="w-4 h-4" />
                <span className="text-sm font-medium">Analyze</span>
              </div>
            </Link>
          )
        })}
      </div>

      <p className="text-xs text-slate-400 text-center">
        AI analysis uses Claude claude-opus-4-7 with Nepal-specific medical context ·
        Results are informational and supplement clinical judgment
      </p>
    </div>
  )
}
