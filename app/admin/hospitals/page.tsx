import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getHospitalActivity } from '@/services/admin'
import { Building2, BedDouble, Users, FlaskConical, Pill } from 'lucide-react'

const TYPE_COLOR: Record<string, string> = {
  Private:    'bg-blue-100 text-blue-700',
  Government: 'bg-emerald-100 text-emerald-700',
  Teaching:   'bg-purple-100 text-purple-700',
}

export default async function HospitalsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const hospitals = await getHospitalActivity(session.sub)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-indigo-600" />
          Hospital Activity
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Activity and utilization across partner hospitals</p>
      </div>

      <div className="space-y-4">
        {hospitals.map((h, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-bold text-slate-900">{h.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLOR[h.type] ?? 'bg-slate-100 text-slate-600'}`}>
                    {h.type}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5">{h.district}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {[
                { icon: BedDouble,    label: 'Beds',              value: h.beds.toLocaleString(),                color: 'text-slate-600' },
                { icon: Users,        label: 'Patients Served',   value: h.patients.toLocaleString(),            color: 'text-indigo-600' },
                { icon: Pill,         label: 'Prescriptions',     value: h.prescriptionsIssued.toLocaleString(), color: 'text-teal-600' },
                { icon: FlaskConical, label: 'Lab Tests Done',    value: h.labTestsDone.toLocaleString(),        color: 'text-purple-600' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="text-center p-3 bg-slate-50 rounded-lg">
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
                  <div className="font-bold text-slate-900 text-sm">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              ))}
            </div>

            {/* Utilization bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Bed utilization</span>
                <span className="font-semibold">{Math.min(100, Math.round((h.patients / (h.beds * 3)) * 100))}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-400 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((h.patients / (h.beds * 3)) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
