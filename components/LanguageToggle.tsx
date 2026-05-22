'use client'

import { useLanguage } from '@/hooks/useLanguage'

export default function LanguageToggle() {
  const { lang, toggle } = useLanguage()

  return (
    <button
      onClick={toggle}
      title="Switch language / भाषा बदल्नुहोस्"
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-slate-200 hover:bg-slate-50 transition-colors text-slate-600"
    >
      <span className={lang === 'en' ? 'text-slate-900' : 'text-slate-400'}>EN</span>
      <span className="text-slate-300">|</span>
      <span className={lang === 'np' ? 'text-slate-900' : 'text-slate-400'}>ने</span>
    </button>
  )
}
