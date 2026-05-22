import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getMedicalRecords, getAllergies } from '@/services/patient'
import { ClipboardList, AlertTriangle, Stethoscope, Scissors, FileText } from 'lucide-react'

const TYPE_META: Record<string, { label: string; color: string; dot: string }> = {
  diagnosis: { label: 'Diagnosis', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  visit_note: { label: 'Visit Note', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  procedure: { label: 'Procedure', color: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
}

const SEVERITY_META: Record<string, { label: string; color: string }> = {
  life_threatening: { label: 'Life Threatening', color: 'bg-red-100 text-red-700 border border-red-200' },
  severe: { label: 'Severe', color: 'bg-orange-100 text-orange-700 border border-orange-200' },
  moderate: { label: 'Moderate', color: 'bg-amber-100 text-amber-700 border border-amber-200' },
  mild: { label: 'Mild', color: 'bg-yellow-100 text-yellow-700 border border-yellow-200' },
}

export default async function MedicalHistoryPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [records, allergies] = await Promise.all([
    getMedicalRecords(session.sub),
    getAllergies(session.sub),
  ])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Medical History</h1>
        <p className="text-slate-500 text-sm mt-0.5">{records.length} records on file</p>
      </div>

      {/* Allergies */}
      {allergies.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5">
          <h2 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Allergies &amp; Adverse Reactions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allergies.map((a) => (
              <div key={a.id} className="bg-white rounded-lg border border-red-100 p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="font-semibold text-slate-900 text-sm">{a.allergenName}</span>
                    <span className="ml-2 text-xs text-slate-500 capitalize">{a.allergenType}</span>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${
                      SEVERITY_META[a.severity]?.color ?? 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {SEVERITY_META[a.severity]?.label ?? a.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{a.reaction}</p>
                <p className="text-xs text-slate-400 mt-1">Onset: {a.onsetDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-6 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-slate-400" />
          Visit Timeline
        </h2>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-[18px] top-0 bottom-0 w-px bg-slate-100" />

          <div className="space-y-8">
            {records.map((record) => {
              const meta = TYPE_META[record.type] ?? { label: record.type, color: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-400' }
              return (
                <div key={record.id} className="relative flex gap-4 pl-10">
                  {/* dot */}
                  <div className={`absolute left-[13px] w-2.5 h-2.5 rounded-full mt-1.5 ${meta.dot} ring-2 ring-white`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-sm text-slate-400 font-medium">{record.date}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-base mb-0.5">{record.title}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500 mb-3">
                      <span>{record.doctor}</span>
                      <span>·</span>
                      <span>{record.hospital}</span>
                      {record.icdCode && <span className="font-mono">ICD: {record.icdCode}</span>}
                    </div>

                    {record.diagnosis && (
                      <div className="flex items-start gap-2 mb-2">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-sm text-slate-700">{record.diagnosis}</p>
                      </div>
                    )}

                    {record.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {record.symptoms.map((s, i) => (
                          <span key={i} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {record.notes && (
                      <div className="flex items-start gap-2">
                        <FileText className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-slate-500 leading-relaxed">{record.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
