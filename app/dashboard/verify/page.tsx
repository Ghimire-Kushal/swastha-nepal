import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import VerifyForm from './VerifyForm'

export default async function VerifyIdentityPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'patient') redirect('/dashboard')

  const patient = await prisma.patient.findUnique({
    where: { userId: session.sub },
    select: {
      verificationStatus: true,
      verificationDocType: true,
      verificationDocNumber: true,
      verificationNote: true,
      verifiedAt: true,
      citizenshipNumber: true,
    },
  })

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Verify Your Identity</h1>
        <p className="text-slate-500 text-sm mt-1">
          Upload a photo of your Nepali citizenship card or birth certificate.
        </p>
      </div>
      <VerifyForm
        status={patient?.verificationStatus ?? 'unverified'}
        docType={patient?.verificationDocType ?? null}
        docNumber={patient?.verificationDocNumber ?? null}
        note={patient?.verificationNote ?? null}
        verifiedAt={patient?.verifiedAt?.toISOString() ?? null}
        citizenshipNumber={patient?.citizenshipNumber ?? null}
      />
    </div>
  )
}
