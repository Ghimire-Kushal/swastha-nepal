import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Activity } from 'lucide-react'

export default async function NurseVitalsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-pink-600" /> Record Vitals
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">Log patient vital signs</p>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <Activity className="w-12 h-12 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-500 text-sm">Vital signs recording — coming soon</p>
      </div>
    </div>
  )
}
