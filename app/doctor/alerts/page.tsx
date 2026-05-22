import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getDiseaseAlerts } from '@/services/doctor'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

const ALERT_STYLE = {
  high: {
    card: 'border-red-300 bg-red-50',
    badge: 'bg-red-100 text-red-700 border-red-200',
    icon: <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />,
    title: 'text-red-900',
  },
  medium: {
    card: 'border-amber-300 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />,
    title: 'text-amber-900',
  },
  low: {
    card: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />,
    title: 'text-blue-900',
  },
}

export default async function DiseaseAlertsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const alerts = await getDiseaseAlerts()
  const highAlerts = alerts.filter((a) => a.severity === 'high')
  const otherAlerts = alerts.filter((a) => a.severity !== 'high')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Disease Alerts</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Real-time surveillance data from DoHS, WHO Nepal, and NPHL
        </p>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'High Severity', count: alerts.filter((a) => a.severity === 'high').length, color: 'text-red-600', bg: 'bg-red-50 border-red-200' },
          { label: 'Medium Severity', count: alerts.filter((a) => a.severity === 'medium').length, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
          { label: 'Advisories', count: alerts.filter((a) => a.severity === 'low').length, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <div className={`text-3xl font-black ${s.color}`}>{s.count}</div>
            <div className="text-xs text-slate-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* High severity first */}
      {highAlerts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Urgent — Action Required
          </h2>
          {highAlerts.map((alert) => {
            const style = ALERT_STYLE[alert.severity]
            return (
              <div key={alert.id} className={`rounded-xl border-2 p-5 ${style.card}`}>
                <div className="flex items-start gap-3">
                  {style.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h3 className={`font-bold text-base ${style.title}`}>{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${style.badge}`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 mb-3">{alert.description}</p>
                    <div className="bg-white/60 rounded-lg p-3 mb-3">
                      <div className="text-xs font-semibold text-slate-600 mb-1">Recommended Action:</div>
                      <div className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-slate-800">{alert.action}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
                      <span><span className="font-medium">Affected:</span> {alert.affected}</span>
                      <span><span className="font-medium">Date:</span> {alert.date}</span>
                      <span><span className="font-medium">Source:</span> {alert.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}

      {/* Other alerts */}
      {otherAlerts.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Other Alerts &amp; Advisories
          </h2>
          {otherAlerts.map((alert) => {
            const style = ALERT_STYLE[alert.severity]
            return (
              <div key={alert.id} className={`rounded-xl border p-5 ${style.card}`}>
                <div className="flex items-start gap-3">
                  {style.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className={`font-semibold text-sm ${style.title}`}>{alert.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${style.badge}`}>
                        {alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{alert.description}</p>
                    <div className="flex items-start gap-1.5 text-xs text-slate-700 mb-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      {alert.action}
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-xs text-slate-400">
                      <span>Affected: {alert.affected}</span>
                      <span>{alert.date}</span>
                      <span>{alert.source}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </section>
      )}
    </div>
  )
}
