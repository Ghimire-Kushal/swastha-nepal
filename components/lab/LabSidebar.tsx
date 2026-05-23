'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { LayoutDashboard, ClipboardList, Upload, FileText, LogOut, FlaskConical, Menu, X } from 'lucide-react'
import LanguageToggle from '@/components/LanguageToggle'
import { useLanguage } from '@/hooks/useLanguage'
import { td } from '@/lib/translations'

const NAV_ITEMS = [
  { href: '/lab', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/lab/orders', label: 'Pending Orders', icon: ClipboardList },
  { href: '/lab/upload', label: 'Upload Report', icon: Upload },
  { href: '/lab/reports', label: 'All Reports', icon: FileText },
]

export default function LabSidebar({ techName }: { techName: string }) {
  const pathname = usePathname()
  const { lang } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">Swastha Nepal</div>
            <div className="text-xs text-purple-600 font-medium">Lab Portal</div>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageToggle />
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors lg:hidden">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-100 bg-purple-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <FlaskConical className="w-4 h-4 text-purple-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-800">{techName}</div>
            <div className="text-xs text-slate-500">Lab Technician</div>
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
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-purple-50 text-purple-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-purple-600' : 'text-slate-400'}`} />
              {td(label, lang)}
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
            {td('Sign out', lang)}
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <div className="fixed top-0 inset-x-0 h-14 bg-white border-b border-slate-200 z-30 flex items-center px-4 gap-3 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center">
            <FlaskConical className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Lab Portal</span>
        </div>
      </div>

      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 lg:z-auto h-screen w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col transform transition-transform duration-300 lg:transform-none ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
