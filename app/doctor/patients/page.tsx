import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { searchPatients } from '@/services/doctor'
import { BLOOD_TYPE_DISPLAY } from '@/lib/mock-data'
import { Search, User, MapPin } from 'lucide-react'
import Link from 'next/link'

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { q = '' } = await searchParams
  const patients = await searchPatients(session.sub, q)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Patient Search</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Search by name, citizenship number, or phone
        </p>
      </div>

      {/* Search form — GET submission updates URL */}
      <form method="GET" className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Enter name, citizenship number, or phone…"
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Results */}
      <div>
        {q && (
          <p className="text-sm text-slate-500 mb-3">
            {patients.length === 0
              ? `No patients found for "${q}"`
              : `${patients.length} patient${patients.length !== 1 ? 's' : ''} found`}
          </p>
        )}

        <div className="space-y-3">
          {patients.map((p) => {
            const age =
              new Date().getFullYear() - new Date(p.dateOfBirth).getFullYear()
            return (
              <Link
                key={p.id}
                href={`/doctor/patients/${p.id}`}
                className="block bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900">{p.name}</div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                        <span>{p.gender === 'male' ? 'Male' : 'Female'} · {age} yrs</span>
                        <span className="font-mono">{p.citizenshipNumber}</span>
                        <span>{p.phone}</span>
                      </div>
                      {p.conditions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {p.conditions.map((c, i) => (
                            <span
                              key={i}
                              className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-black text-red-500">
                      {BLOOD_TYPE_DISPLAY[p.bloodType] ?? p.bloodType}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-400 justify-end mt-0.5">
                      <MapPin className="w-3 h-3" />
                      {p.district}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Last: {p.lastVisit}</div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
