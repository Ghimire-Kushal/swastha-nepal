import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getAllLabReports } from '@/services/lab'
import { sendReportToDoctor } from '@/app/actions/lab'

async function sendAction(reportId: string) {
  'use server'
  await sendReportToDoctor(reportId)
}
import { FlaskConical, AlertTriangle, CheckCircle, Send } from 'lucide-react'

export default async function AllLabReportsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const reports = await getAllLabReports(session.sub)
  const abnormalCount = reports.reduce((n, r) => n + r.abnormalCount, 0)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {reports.length} reports · {abnormalCount} abnormal values total
        </p>
      </div>

      <div className="space-y-5">
        {reports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <FlaskConical className="w-4 h-4 text-purple-500" />
                  <span className="font-semibold text-slate-900">{report.testName}</span>
                  <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                    {report.category}
                  </span>
                  {report.hasAbnormal && (
                    <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {report.abnormalCount} abnormal
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <span className="font-medium">{report.patientName}</span> ·
                  Technician: {report.technician} ·{' '}
                  {new Date(report.uploadedAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {report.sentToDoctor ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Sent to {report.doctorName}
                  </span>
                ) : (
                  <form action={sendAction.bind(null, report.id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 border border-purple-200 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      Send to Doctor
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Results table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Parameter</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Result</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reference Range</th>
                    <th className="px-5 py-2.5 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.results.map((result, i) => (
                    <tr key={i} className={result.isAbnormal ? 'bg-red-50' : ''}>
                      <td className="px-5 py-3 text-slate-700 font-medium">{result.parameter}</td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${result.isAbnormal ? 'text-red-600' : 'text-slate-900'}`}>
                          {result.value}
                        </span>{' '}
                        <span className="text-slate-400 text-xs">{result.unit}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs font-mono">{result.referenceRange}</td>
                      <td className="px-5 py-3">
                        {result.isAbnormal ? (
                          <span className="inline-flex items-center gap-1 text-xs text-red-600 font-medium">
                            <AlertTriangle className="w-3 h-3" />
                            Abnormal
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle className="w-3 h-3" />
                            Normal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
