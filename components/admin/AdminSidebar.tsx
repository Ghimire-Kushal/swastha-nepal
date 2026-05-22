'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import {
  LayoutDashboard,
  Activity,
  MapPin,
  AlertTriangle,
  Syringe,
  Building2,
  LogOut,
  ShieldCheck,
  ScrollText,
} from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import { td } from '@/lib/translations'

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/diseases', label: 'Disease Stats', icon: Activity },
  { href: '/admin/districts', label: 'Districts', icon: MapPin },
  { href: '/admin/patients', label: 'High-Risk Patients', icon: AlertTriangle },
  { href: '/admin/vaccinations', label: 'Vaccinations', icon: Syringe },
  { href: '/admin/hospitals', label: 'Hospitals', icon: Building2 },
  { href: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
]

export default function AdminSidebar({ adminName, role }: { adminName: string; role: string }) {
  const pathname = usePathname()
  const { lang } = useLanguage()

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <aside className="w-64 shrink-0 bg-slate-900 flex flex-col h-screen sticky top-0">
      <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">Swastha Nepal AI</div>
            <div className="text-xs text-indigo-400 font-medium">Admin Portal</div>
          </div>
        </Link>
        <LanguageToggle />
      </div>

      <div className="px-4 py-3 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200">{adminName}</div>
            <div className="text-xs text-slate-500 capitalize">{role.replace('_', ' ')}</div>
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
                  ? 'bg-indigo-500/20 text-indigo-300'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500'}`} />
              {td(label, lang) === label ? label : td(label, lang)}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-500" />
            {td('Sign out', lang)}
          </button>
        </form>
      </div>
    </aside>
  )
}
