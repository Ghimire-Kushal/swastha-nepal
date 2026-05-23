import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  getAdminSummary,
  getDiseaseStats,
  getMonthlyTrends,
  getHighRiskPatients,
} from '@/services/admin'
import { writeAuditLog } from '@/lib/audit'
import {
  Users, Stethoscope, FlaskConical, Pill,
  QrCode, ShieldAlert, TrendingUp, AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'
import TrendChart from '@/components/admin/TrendChart'
import DiseaseChart from '@/components/admin/DiseaseChart'

export default async function AdminOverviewPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  writeAuditLog({
    userId: session.sub,
    userEmail: session.email,
    userRole: session.role,
    action: 'admin.view',
    resourceId: 'overview',
    success: true,
  })

  const [summary, diseases, trends, highRisk] = await Promise.all([
    getAdminSummary(session.sub),
    getDiseaseStats(session.sub),
    getMonthlyTrends(session.sub),
    getHighRiskPatients(session.sub),
  ])

  const summaryCards = [
    { label: 'Total Patients',      value: summary.totalPatients.toLocaleString(),   icon: Users,       color: 'text-indigo-600',  bg: 'bg-indigo-50' },
    { label: 'Doctors',             value: summary.totalDoctors.toLocaleString(),     icon: Stethoscope, color: 'text-blue-600',    bg: 'bg-blue-50' },
    { label: 'Lab Technicians',     value: summary.totalLabTechs.toLocaleString(),    icon: FlaskConical,color: 'text-purple-600',  bg: 'bg-purple-50' },
    { label: 'Pharmacists',         value: summary.totalPharmacists.toLocaleString(), icon: Pill,        color: 'text-teal-600',    bg: 'bg-teal-50' },
    { label: 'Active Prescriptions',value: summary.activePrescriptions.toLocaleString(), icon: Pill,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Lab Orders',  value: summary.pendingLabOrders.toLocaleString(), icon: FlaskConical,color: 'text-amber-600',   bg: 'bg-amber-50' },
    { label: 'Emergency QR Scans',  value: summary.emergencyQRScans.toLocaleString(), icon: QrCode,     color: 'text-rose-600',    bg: 'bg-rose-50' },
    { label: 'Disease Alerts',      value: summary.diseaseAlerts.toString(),           icon: ShieldAlert, color: 'text-red-600',   bg: 'bg-red-50' },
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          National Health Analytics
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Swastha Nepal — Real-time health data overview
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summaryCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4">
            <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900">{value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Trend + Disease charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm">6-Month Activity Trends</h2>
          <TrendChart data={trends} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4 text-sm">
            Top 10 Diseases
            <Link href="/admin/diseases" className="ml-2 text-xs text-indigo-600 hover:underline font-normal">View all →</Link>
          </h2>
          <DiseaseChart data={diseases} />
        </div>
      </div>

      {/* High risk patients */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            High-Risk Patients
          </h2>
          <Link href="/admin/patients" className="text-xs text-indigo-600 hover:underline">View all →</Link>
        </div>
        <div className="space-y-2">
          {highRisk.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
              <div>
                <div className="font-semibold text-slate-900 text-sm">{p.name}</div>
                <div className="text-xs text-slate-500">{p.age} yrs · {p.district} · {p.assignedDoctor}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.conditions.map((c, i) => (
                    <span key={i} className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">{c}</span>
                  ))}
                </div>
              </div>
              <div className="text-right shrink-0 ml-3">
                <div className="text-2xl font-black text-red-600">{p.riskScore}</div>
                <div className="text-xs text-slate-400">Risk Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
