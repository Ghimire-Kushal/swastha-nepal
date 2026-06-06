import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'

export default async function NursePatientsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const patients = await prisma.patient.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { user: { select: { name: true, phone: true } } },
    select: {
      id: true,
      bloodType: true,
      district: true,
      province: true,
      gender: true,
      verificationStatus: true,
      user: { select: { name: true, phone: true } },
    },
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-pink-600" /> All Patients
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">{patients.length} patients registered</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="divide-y divide-slate-100">
          {patients.map((p) => (
            <div key={p.id} className="px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-slate-900 text-sm">{p.user.name}</p>
                <p className="text-xs text-slate-500">{p.gender ?? '—'} · {p.bloodType ?? '—'} · {p.district ?? 'Unknown'}, {p.province ?? ''}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {p.user.phone && <span className="text-xs text-slate-500">{p.user.phone}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  p.verificationStatus === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                }`}>
                  {p.verificationStatus}
                </span>
              </div>
            </div>
          ))}
          {patients.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-10">No patients found</p>
          )}
        </div>
      </div>
    </div>
  )
}
