import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { logout } from '@/app/actions/auth'
import { ROLE_LABELS, ROLE_META } from '@/types/auth'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const meta = ROLE_META[session.role]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-white" fill="white" />
          </div>
          <span className="font-bold text-slate-900">
            Swastha Nepal <span className="text-emerald-600">AI</span>
          </span>
        </Link>

        <form action={logout}>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Sign out
          </button>
        </form>
      </nav>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center">
          <span className="text-5xl mb-4 block">{meta.icon}</span>
          <h1 className="text-3xl font-black text-slate-900 mb-2">
            Welcome back, {session.name}!
          </h1>
          <p className="text-slate-500 mb-1">
            Logged in as{' '}
            <span className="font-semibold text-emerald-600">
              {ROLE_LABELS[session.role]}
            </span>
          </p>
          <p className="text-slate-400 text-sm mb-8">{session.email}</p>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Dashboard coming in the next step
          </div>
        </div>
      </main>
    </div>
  )
}
