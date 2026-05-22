import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPendingOrders } from '@/services/lab'
import { ClipboardList, AlertTriangle, Clock, User, FlaskConical } from 'lucide-react'
import Link from 'next/link'

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
}

export default async function PendingOrdersPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const orders = await getPendingOrders(session.sub)
  const urgent = orders.filter((o) => o.priority === 'urgent')
  const routine = orders.filter((o) => o.priority !== 'urgent')

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Pending Lab Orders</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {orders.length} orders — {urgent.length} urgent
        </p>
      </div>

      {/* Urgent */}
      {urgent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-red-700 uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Urgent
          </h2>
          {urgent.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      )}

      {/* Routine */}
      {routine.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Routine</h2>
          {routine.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      )}
    </div>
  )
}

function OrderCard({ order }: { order: Awaited<ReturnType<typeof getPendingOrders>>[number] }) {
  const isUrgent = order.priority === 'urgent'
  return (
    <div className={`bg-white rounded-xl border overflow-hidden ${isUrgent ? 'border-red-300' : 'border-slate-200'}`}>
      <div className={`px-5 py-3 border-b flex items-center justify-between gap-3 ${isUrgent ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-100'}`}>
        <div className="flex items-center gap-2 flex-wrap">
          <User className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-900 text-sm">{order.patientName}</span>
          <span className="text-xs text-slate-500">· {order.patientAge} yrs</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${STATUS_STYLE[order.status] ?? 'bg-slate-100 text-slate-600'}`}>
            {order.status}
          </span>
          {isUrgent && (
            <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Urgent
            </span>
          )}
        </div>
        <div className="text-xs text-slate-400 shrink-0 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {new Date(order.orderedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="mb-3">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">Tests Ordered</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {order.tests.map((test, i) => (
              <span key={i} className="text-xs bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                <FlaskConical className="w-3 h-3" />
                {test}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 mb-3">
          <span><span className="font-medium text-slate-600">Ordered by:</span> {order.orderedBy}</span>
          <span><span className="font-medium text-slate-600">Sample:</span> {order.sampleType}</span>
        </div>

        {order.notes && (
          <div className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-3">
            <span className="font-medium">Notes:</span> {order.notes}
          </div>
        )}

        <Link
          href="/lab/upload"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          Enter Results
        </Link>
      </div>
    </div>
  )
}
