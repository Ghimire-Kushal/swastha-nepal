import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPharmacistProfile } from '@/services/pharmacy'
import PharmacySidebar from '@/components/pharmacy/PharmacySidebar'

export default async function PharmacyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'pharmacist') redirect('/dashboard')

  const pharmacist = await getPharmacistProfile(session.sub)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <PharmacySidebar pharmacistName={pharmacist.name} />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
