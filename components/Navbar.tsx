'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Heart } from 'lucide-react'
import type { Language, NavTranslations } from '@/types'

interface NavbarProps {
  lang: Language
  setLang: (l: Language) => void
  t: NavTranslations
}

export default function Navbar({ lang, setLang, t }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: t.home, href: '#' },
    { label: t.features, href: '#features' },
    { label: t.about, href: '#about' },
    { label: t.emergency, href: '#emergency', highlight: true },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-bold text-slate-900 text-lg leading-tight">
              {lang === 'np' ? 'स्वस्थ नेपाल' : 'Swastha Nepal'}
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`text-sm font-medium transition-colors ${
                  link.highlight
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-slate-600 hover:text-emerald-600'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-300 text-xs font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-600 transition-all"
            >
              <span>{lang === 'en' ? '🇳🇵' : '🇬🇧'}</span>
              <span>{lang === 'en' ? 'नेपाली' : 'English'}</span>
            </button>

            <a
              href="/login"
              className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-emerald-600 transition-colors"
            >
              {t.login}
            </a>
            <a
              href="/register"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              {t.register}
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-slate-600 hover:text-slate-900"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block text-sm font-medium py-2 ${
                    link.highlight ? 'text-red-600' : 'text-slate-700'
                  }`}
                >
                  {link.label}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <button
                  onClick={() => setLang(lang === 'en' ? 'np' : 'en')}
                  className="w-full text-left text-sm font-medium text-slate-600 py-2"
                >
                  {lang === 'en' ? '🇳🇵 नेपाली' : '🇬🇧 English'}
                </button>
                <a
                  href="/login"
                  className="block w-full text-center py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700"
                >
                  {t.login}
                </a>
                <a
                  href="/register"
                  className="block w-full text-center py-2.5 bg-emerald-600 rounded-lg text-sm font-semibold text-white"
                >
                  {t.register}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
