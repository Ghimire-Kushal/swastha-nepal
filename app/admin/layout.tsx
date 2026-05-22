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
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  )
}
