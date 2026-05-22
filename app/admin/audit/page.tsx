import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAdminAuditLogs } from '@/services/admin'
import { ScrollText, CheckCircle, XCircle } from 'lucide-react'

const ACTION_COLOR: Record<string, string> = {
  'auth.login':           'bg-emerald-100 text-emerald-700',
  'auth.logout':          'bg-slate-100 text-slate-600',
  'auth.login_failed':    'bg-red-100 text-red-700',
  'patient.view':         'bg-blue-100 text-blue-700',
  'patient.update':       'bg-indigo-100 text-indigo-700',
  'diagnosis.create':     'bg-purple-100 text-purple-700',
  'prescription.create':  'bg-teal-100 text-teal-700',
  'prescription.dispense':'bg-teal-100 text-teal-700',
  'lab.upload':           'bg-amber-100 text-amber-700',
  'lab.mark_abnormal':    'bg-orange-100 text-orange-700',
  'birth.register':       'bg-blue-100 text-blue-700',
  'death.register':       'bg-slate-100 text-slate-600',
  'ai.analysis':          'bg-violet-100 text-violet-700',
  'admin.view':           'bg-indigo-100 text-indigo-700',
  'privacy.update':       'bg-pink-100 text-pink-700',
}

export default async function AuditLogsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const logs = await getAdminAuditLogs(session.sub, 100)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-indigo-600" />
          Audit Logs
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          System activity trail — last {logs.length} entries
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No audit entries yet. Actions will appear here as users interact with the system.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">User</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Action</th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Resource</th>
                <th className="text-center px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2.5 font-mono text-xs text-slate-400">
                    {log.timestamp.replace('T', ' ').slice(0, 19)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-900 text-xs">{log.userEmail}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-slate-500 capitalize">{log.userRole.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLOR[log.action] ?? 'bg-slate-100 text-slate-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-slate-400 font-mono">
                    {log.resourceId ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    {log.success
                      ? <CheckCircle className="w-4 h-4 text-emerald-500 mx-auto" />
                      : <XCircle className="w-4 h-4 text-red-500 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center">
        Audit logs are stored in-memory during development · Connect Prisma for persistent storage
      </p>
    </div>
  )
}
