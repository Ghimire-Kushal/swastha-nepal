import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getDoctorStats,
  getDoctorAppointments,
  getDiseaseAlerts,
  getRecentPatients,
} from '@/services/doctor'
import { Users, Calendar, CheckCircle, AlertTriangle, AlertCircle, Info, Video, MapPin } from 'lucide-react'
import Link from 'next/link'

const ALERT_STYLE = {
  high: {
    border: 'border-red-300 bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
    dot: 'bg-red-500',
  },
  medium: {
    border: 'border-amber-300 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />,
    dot: 'bg-amber-500',
  },
  low: {
    border: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
    dot: 'bg-blue-400',
  },
}

const APT_STATUS_COLOR: Record<string, string> = {
  scheduled: 'bg-slate-100 text-slate-600',
  confirmed: 'bg-emerald-100 text-emerald-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-slate-100 text-slate-400',
}

export default async function DoctorOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [stats, appointments, alerts, recentPatients] = await Promise.all([
    getDoctorStats(session.sub),
    getDoctorAppointments(session.sub),
    getDiseaseAlerts(),
    getRecentPatients(session.sub),
  ])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good day, {session.name} 👋</h1>
        <p className="text-slate-500 text-sm mt-0.5">Here is your clinical overview for today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Patients", value: stats.todayPatients, color: 'text-blue-600' },
          { label: 'Pending', value: stats.pendingAppointments, color: 'text-amber-500' },
          { label: 'Completed', value: stats.completedToday, color: 'text-emerald-600' },
          { label: 'Total Patients', value: stats.totalPatients, color: 'text-slate-700' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-500" />
              Today&apos;s Appointments
            </h2>
            <span className="text-xs text-slate-400">{appointments.length} scheduled</span>
          </div>
          <div className="divide-y divide-slate-50">
            {appointments.map((apt) => (
              <div key={apt.id} className="py-3 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/doctor/patients/${apt.patientId}`}
                      className="font-semibold text-slate-900 text-sm hover:text-blue-600 transition-colors"
                    >
                      {apt.patientName}
                    </Link>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${APT_STATUS_COLOR[apt.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {apt.status}
                    </span>
                    {apt.type === 'telemedicine' ? (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <Video className="w-3 h-3" />
                        Online
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="w-3 h-3" />
                        In-person
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{apt.reason}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold text-slate-700">
                    {new Date(apt.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="text-xs text-slate-400">{apt.durationMinutes} min</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent patients */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Recent Patients
          </h2>
          <div className="space-y-3">
            {recentPatients.map((p) => (
              <Link
                key={p.id}
                href={`/doctor/patients/${p.id}`}
                className="block p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
              >
                <div className="font-medium text-slate-900 text-sm">{p.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{p.district} · Last: {p.lastVisit}</div>
                {p.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.conditions.map((c, i) => (
                      <span key={i} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
          <Link
            href="/doctor/patients"
            className="mt-3 block text-center text-xs font-medium text-blue-600 hover:text-blue-700"
          >
            Search all patients →
          </Link>
        </div>
      </div>

      {/* AI Disease Alerts */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          AI Disease Alerts
          <span className="ml-auto text-xs text-slate-400 font-normal">Nepal Surveillance Data</span>
        </h2>
        <div className="space-y-3">
          {alerts.map((alert) => {
            const style = ALERT_STYLE[alert.severity]
            return (
              <div key={alert.id} className={`rounded-xl border p-4 ${style.border}`}>
                <div className="flex items-start gap-3">
                  {style.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-slate-900 text-sm">{alert.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${style.badge}`}>
                        {alert.severity} — {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-1">{alert.description}</p>
                    <p className="text-xs text-slate-500 mb-2">
                      <span className="font-medium">Affected:</span> {alert.affected}
                    </p>
                    <div className="flex items-start gap-1.5 text-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-slate-700">{alert.action}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Source: {alert.source} · {alert.date}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
