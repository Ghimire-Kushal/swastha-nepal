import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Heart, Users, ClipboardList, Activity } from 'lucide-react'
import Link from 'next/link'

export default async function NurseOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [patientCount, appointmentCount] = await Promise.all([
    prisma.patient.count(),
    prisma.appointment.count({ where: { status: { in: ['scheduled', 'confirmed'] } } }),
  ])

  const recentPatients = await prisma.patient.findMany({
    take: 8,
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      bloodType: true,
      district: true,
      verificationStatus: true,
      updatedAt: true,
      user: { select: { name: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good day, {session.name} 👋</h1>
        <p className="text-slate-500 text-sm mt-0.5">Nurse overview — patient care at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: patientCount, color: 'text-pink-600', icon: Users },
          { label: 'Active Appointments', value: appointmentCount, color: 'text-blue-600', icon: ClipboardList },
          { label: 'Vitals Due', value: 0, color: 'text-amber-500', icon: Activity },
          { label: 'Tasks Today', value: 0, color: 'text-emerald-600', icon: Heart },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
            </div>
            <p className={`text-3xl font-black ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400" />
            Recent Patients
          </h2>
          <Link href="/nurse/patients" className="text-xs text-pink-600 hover:text-pink-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {recentPatients.map((p) => (
            <div key={p.id} className="py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.user.name}</p>
                <p className="text-xs text-slate-500">{p.district ?? 'Unknown district'} · {p.bloodType ?? 'Blood type unknown'}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                p.verificationStatus === 'verified'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {p.verificationStatus}
              </span>
            </div>
          ))}
          {recentPatients.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No patients yet</p>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/nurse/vitals" className="bg-white rounded-xl border border-slate-200 p-5 hover:border-pink-300 hover:shadow-sm transition-all">
          <Activity className="w-6 h-6 text-pink-600 mb-2" />
          <p className="font-semibold text-slate-900">Record Vitals</p>
          <p className="text-xs text-slate-500 mt-0.5">Log patient vital signs</p>
        </Link>
        <Link href="/nurse/tasks" className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
          <ClipboardList className="w-6 h-6 text-blue-600 mb-2" />
          <p className="font-semibold text-slate-900">Care Tasks</p>
          <p className="text-xs text-slate-500 mt-0.5">View and manage assigned tasks</p>
        </Link>
      </div>
    </div>
  )
}
