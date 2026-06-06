'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { LayoutDashboard, Users, ClipboardList, Heart, LogOut, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/nurse', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/nurse/patients', label: 'Patients', icon: Users },
  { href: '/nurse/vitals', label: 'Vitals', icon: Heart },
  { href: '/nurse/tasks', label: 'Tasks', icon: ClipboardList },
]

export default function NurseSidebar({ nurseName }: { nurseName: string }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  const sidebarContent = (
    <>
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-slate-900 text-sm leading-tight">Swastha Nepal</div>
            <div className="text-xs text-pink-600 font-medium">Nurse Portal</div>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors lg:hidden"
        >
          <X className="w-4 h-4 text-slate-600" />
        </button>
      </div>

      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-xs text-slate-500 font-medium">Logged in as</p>
        <p className="text-sm font-semibold text-slate-900 truncate">{nurseName}</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              isActive(href, exact)
                ? 'bg-pink-50 text-pink-700'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <form action={logout}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Sign out
          </button>
        </form>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-40 p-2 bg-white rounded-xl shadow border border-slate-200 lg:hidden"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transform transition-transform lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-slate-200 flex-col shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>
    </>
  )
}
