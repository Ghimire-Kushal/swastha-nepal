import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'hospital_admin' && session.role !== 'government_admin') {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar adminName={session.name} role={session.role} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0 overflow-y-auto">
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
