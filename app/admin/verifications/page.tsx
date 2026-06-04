import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import VerificationQueue from './VerificationQueue'

export default async function VerificationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'hospital_admin' && session.role !== 'government_admin') redirect('/dashboard')

  const pending = await prisma.patient.findMany({
    where: { verificationStatus: { in: ['pending', 'rejected'] } },
    include: { user: { select: { name: true, email: true, phone: true, createdAt: true } } },
    orderBy: { updatedAt: 'asc' },
  })

  const recentVerified = await prisma.patient.findMany({
    where: { verificationStatus: 'verified' },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { verifiedAt: 'desc' },
    take: 10,
  })

  const counts = await prisma.patient.groupBy({
    by: ['verificationStatus'],
    _count: true,
  })

  const countMap = Object.fromEntries(counts.map(c => [c.verificationStatus, c._count]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Identity Verifications</h1>
        <p className="text-slate-500 text-sm mt-0.5">Review patient document submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', count: countMap['pending'] ?? 0, color: 'amber' },
          { label: 'Verified', count: countMap['verified'] ?? 0, color: 'emerald' },
          { label: 'Rejected', count: countMap['rejected'] ?? 0, color: 'red' },
          { label: 'Unverified', count: countMap['unverified'] ?? 0, color: 'slate' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className={`text-2xl font-black text-${color}-600`}>{count}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <VerificationQueue
        pending={pending.map(p => ({
          id: p.id,
          name: p.user.name,
          email: p.user.email,
          phone: p.user.phone ?? '',
          registeredAt: p.user.createdAt.toISOString(),
          verificationStatus: p.verificationStatus,
          verificationDocType: p.verificationDocType ?? '',
          verificationDocNumber: p.verificationDocNumber ?? '',
          verificationDocUrl: p.verificationDocUrl ?? '',
          verificationNote: p.verificationNote ?? '',
        }))}
        recentVerified={recentVerified.map(p => ({
          id: p.id,
          name: p.user.name,
          email: p.user.email,
          citizenshipNumber: p.citizenshipNumber ?? '',
          verifiedAt: p.verifiedAt?.toISOString() ?? '',
        }))}
      />
    </div>
  )
}
