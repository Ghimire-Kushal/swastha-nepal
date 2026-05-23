import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPharmacistProfile, getPharmacyStats } from '@/services/pharmacy'
import { Pill, Clock, CheckCircle, PackageCheck } from 'lucide-react'
import Link from 'next/link'

export default async function PharmacyOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const pharmacist = await getPharmacistProfile(session.sub)
  if (!pharmacist) redirect('/login')

  const stats = await getPharmacyStats(session.sub)

  const statCards = [
    { label: 'Pending Verification', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Expired', value: stats.expired, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Dispensed Today', value: stats.dispensedToday, icon: PackageCheck, color: 'text-teal-600', bg: 'bg-teal-50' },
    { label: 'Total Dispensed', value: stats.totalDispensed, icon: Pill, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome, {pharmacist.name}
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {pharmacist.pharmacyName} · License: {pharmacist.licenseNumber}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/pharmacy/prescriptions"
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Pill className="w-4 h-4" />
            View All Prescriptions
          </Link>
          <Link
            href="/pharmacy/prescriptions?filter=pending"
            className="flex items-center gap-2 px-4 py-2 border border-amber-200 bg-amber-50 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-100 transition-colors"
          >
            <Clock className="w-4 h-4" />
            Pending Verification ({stats.pending})
          </Link>
        </div>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Pharmacy Portal · {pharmacist.pharmacyName} · {pharmacist.address}
      </p>
    </div>
  )
}
