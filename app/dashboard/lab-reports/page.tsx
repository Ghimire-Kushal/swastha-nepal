import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getLabReports } from '@/services/patient'
import { FlaskConical, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function LabReportsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const reports = await getLabReports(session.sub)
  const abnormalCount = reports.reduce(
    (n, r) => n + r.results.filter((res) => res.isAbnormal).length,
    0
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Lab Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {reports.length} reports · {abnormalCount} abnormal{abnormalCount !== 1 ? ' values' : ' value'}
        </p>
      </div>

      <div className="space-y-5">
        {reports.map((report) => {
          const reportAbnormals = report.results.filter((r) => r.isAbnormal).length
          return (
            <div key={report.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <FlaskConical className="w-4 h-4 text-blue-500" />
                    <span className="font-semibold text-slate-900">{report.testName}</span>
                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                      {report.category}
                    </span>
                    {reportAbnormals > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {reportAbnormals} abnormal
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Ordered by {report.orderedBy} · {report.date}
                  </p>
                </div>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium capitalize shrink-0">
                  {report.status}
                </span>
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
                      <tr
                        key={i}
                        className={result.isAbnormal ? 'bg-red-50' : ''}
                      >
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
          )
        })}
      </div>
    </div>
  )
}
