'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import {
  Heart,
  LayoutDashboard,
  Search,
  Bell,
  Upload,
  LogOut,
  Stethoscope,
} from 'lucide-react'

const NAV_ITEMS = [
  { href: '/doctor', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/doctor/patients', label: 'Patients', icon: Search },
  { href: '/doctor/reports', label: 'Upload Report', icon: Upload },
  { href: '/doctor/alerts', label: 'Disease Alerts', icon: Bell },
]

export default function DoctorSidebar({ doctorName }: { doctorName: string }) {
  const pathname = usePathname()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">Swastha Nepal AI</div>
            <div className="text-xs text-blue-600 font-medium">Doctor Portal</div>
          </div>
        </Link>
      </div>

      {/* Doctor info */}
      <div className="px-4 py-3 border-b border-slate-100 bg-blue-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Heart className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800">{doctorName}</div>
            <div className="text-xs text-slate-500">General Medicine</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  )
}
