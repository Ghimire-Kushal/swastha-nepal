import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import NurseSidebar from '@/components/nurse/NurseSidebar'

export default async function NurseLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'nurse') redirect('/dashboard')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <NurseSidebar nurseName={session.name} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
