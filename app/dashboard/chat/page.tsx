import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPatientProfile, getAIHealthSummary } from '@/services/patient'
import MedicalChatWidget from '@/components/MedicalChatWidget'
import { Brain, Shield } from 'lucide-react'

export default async function ChatPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [patient, summary] = await Promise.all([
    getPatientProfile(session.sub),
    getAIHealthSummary(session.sub),
  ])

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI Health Chat
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Ask health questions — personalized to your medical history
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          Conversation is not stored
        </div>
      </div>

      <MedicalChatWidget
        patientName={patient.name}
        conditions={summary.conditions}
        medications={summary.medications}
      />
    </div>
  )
}
