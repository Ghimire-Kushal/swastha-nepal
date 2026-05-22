import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getVaccinations } from '@/services/patient'
import { Syringe, Calendar, MapPin, AlertCircle } from 'lucide-react'

export default async function VaccinationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const vaccinations = await getVaccinations(session.sub)
  const today = new Date()

  function isOverdue(nextDue: string | null) {
    if (!nextDue) return false
    return new Date(nextDue) < today
  }

  function isDueSoon(nextDue: string | null) {
    if (!nextDue) return false
    const d = new Date(nextDue)
    const diff = (d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    return diff >= 0 && diff <= 90
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Vaccination History</h1>
        <p className="text-slate-500 text-sm mt-0.5">{vaccinations.length} vaccines recorded</p>
      </div>

      {/* Due soon banner */}
      {vaccinations.some((v) => isDueSoon(v.nextDoseDue)) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <span className="font-semibold text-amber-800">Upcoming vaccines due: </span>
            <span className="text-amber-700">
              {vaccinations
                .filter((v) => isDueSoon(v.nextDoseDue))
                .map((v) => v.vaccineName)
                .join(', ')}
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vaccinations.map((v) => {
          const overdue = isOverdue(v.nextDoseDue)
          const dueSoon = isDueSoon(v.nextDoseDue)
          const isComplete = v.doseNumber === v.totalDoses

          return (
            <div
              key={v.id}
              className={`bg-white rounded-xl border overflow-hidden ${
                overdue ? 'border-red-300' : dueSoon ? 'border-amber-300' : 'border-slate-200'
              }`}
            >
              <div className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Syringe className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span className="font-semibold text-slate-900 text-sm">{v.vaccineName}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{v.brand}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      isComplete
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {isComplete ? 'Complete' : `Dose ${v.doseNumber}/${v.totalDoses}`}
                  </span>
                </div>

                {/* Dose progress */}
                <div className="mb-3">
                  <div className="flex gap-1">
                    {Array.from({ length: v.totalDoses }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${
                          i < v.doseNumber ? 'bg-emerald-500' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {v.doseNumber} of {v.totalDoses} dose{v.totalDoses !== 1 ? 's' : ''} completed
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-1.5 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    Administered: <span className="text-slate-700">{v.administeredAt}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {v.facility}
                  </div>
                  <div>
                    <span className="font-medium text-slate-600">Site:</span> {v.site} · <span className="font-medium text-slate-600">Route:</span> {v.route}
                  </div>
                  {v.adverseReactions && (
                    <div className="text-amber-600 bg-amber-50 border border-amber-100 rounded px-2 py-1 mt-1">
                      Reaction: {v.adverseReactions}
                    </div>
                  )}
                </div>
              </div>

              {v.nextDoseDue && (
                <div
                  className={`px-5 py-2.5 border-t text-xs font-medium flex items-center gap-2 ${
                    overdue
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : dueSoon
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-slate-50 border-slate-100 text-slate-500'
                  }`}
                >
                  {overdue && <AlertCircle className="w-3.5 h-3.5" />}
                  Next dose due: {v.nextDoseDue}
                  {overdue && ' — Overdue'}
                  {dueSoon && !overdue && ' — Due soon'}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
