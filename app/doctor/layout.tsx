import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getDoctorProfile } from '@/services/doctor'
import DoctorSidebar from '@/components/doctor/DoctorSidebar'

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'doctor') redirect('/dashboard')

  const doctor = await getDoctorProfile(session.sub)
  if (!doctor) redirect('/login')

  return (
    <div className="flex min-h-screen bg-slate-50">
      <DoctorSidebar doctorName={doctor.name} />
      <div className="flex-1 min-w-0 pt-14 lg:pt-0">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
