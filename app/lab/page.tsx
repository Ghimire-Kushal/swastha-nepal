import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getLabStats, getPendingOrders, getAllLabReports } from '@/services/lab'
import { ClipboardList, AlertTriangle, CheckCircle, Upload } from 'lucide-react'
import Link from 'next/link'

export default async function LabOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [stats, orders, reports] = await Promise.all([
    getLabStats(session.sub),
    getPendingOrders(session.sub),
    getAllLabReports(session.sub),
  ])

  const urgentOrders = orders.filter((o) => o.priority === 'urgent')

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lab Overview</h1>
        <p className="text-slate-500 text-sm mt-0.5">Today&apos;s workload and recent activity</p>
      </div>

      {/* Urgent banner */}
      {urgentOrders.length > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-red-800">{urgentOrders.length} urgent order{urgentOrders.length !== 1 ? 's' : ''} waiting: </span>
            <span className="text-red-700">{urgentOrders.map((o) => o.patientName).join(', ')}</span>
          </div>
          <Link href="/lab/orders" className="ml-auto text-xs font-semibold text-red-700 hover:text-red-800 shrink-0">
            View →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending Orders', value: stats.pendingOrders, color: 'text-amber-500' },
          { label: 'Processing', value: stats.processingOrders, color: 'text-blue-600' },
          { label: 'Completed Today', value: stats.completedToday, color: 'text-emerald-600' },
          { label: 'Abnormal Reports', value: stats.abnormalReports, color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending orders preview */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-amber-500" />
              Pending Orders
            </h2>
            <Link href="/lab/orders" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="flex items-start justify-between gap-3 py-2 border-b border-slate-50 last:border-0">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{order.patientName}</div>
                  <div className="text-xs text-slate-500">{order.tests.slice(0, 2).join(', ')}{order.tests.length > 2 ? ` +${order.tests.length - 2}` : ''}</div>
                  <div className="text-xs text-slate-400 mt-0.5">Dr. {order.orderedBy.replace('Dr. ', '')}</div>
                </div>
                <div className="text-right shrink-0">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      order.priority === 'urgent'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {order.priority}
                  </span>
                  <div className={`text-xs mt-1 font-medium ${order.status === 'processing' ? 'text-blue-600' : 'text-amber-600'}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/lab/upload"
            className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload New Report
          </Link>
        </div>

        {/* Recent completed reports */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Recent Reports
            </h2>
            <Link href="/lab/reports" className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className={`p-3 rounded-lg border ${rep.hasAbnormal ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-slate-50'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{rep.testName}</div>
                    <div className="text-xs text-slate-500">{rep.patientName}</div>
                  </div>
                  <div className="text-right shrink-0">
                    {rep.hasAbnormal && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {rep.abnormalCount} abnormal
                      </span>
                    )}
                    {rep.sentToDoctor && (
                      <div className="text-xs text-emerald-600 mt-1 flex items-center gap-1 justify-end">
                        <CheckCircle className="w-3 h-3" />
                        Sent
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {new Date(rep.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
