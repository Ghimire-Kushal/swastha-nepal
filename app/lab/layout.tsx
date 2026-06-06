import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getLabTechProfile } from '@/services/lab'
import LabSidebar from '@/components/lab/LabSidebar'

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'lab_technician') redirect('/dashboard')

  const tech = await getLabTechProfile(session.sub)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <LabSidebar techName={tech?.name ?? session.name} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
