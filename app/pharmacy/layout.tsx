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
      <PharmacySidebar pharmacistName={pharmacist?.name ?? session.name} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-y-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
