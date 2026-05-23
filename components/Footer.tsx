'use client'

import { Heart, Mail, Phone } from 'lucide-react'
import type { FooterTranslations, Language } from '@/types'

interface FooterProps {
  t: FooterTranslations
  lang: Language
}

export default function Footer({ t, lang }: FooterProps) {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-bold text-white text-lg">
                {lang === 'np' ? 'स्वस्थ नेपाल' : 'Swastha Nepal'}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">{t.tagline}</p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {lang === 'np' ? 'द्रुत लिङ्कहरू' : 'Quick Links'}
            </h4>
            <ul className="space-y-3">
              {t.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-500 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">
              {lang === 'np' ? 'सम्पर्क' : 'Contact'}
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-500">
                <Mail className="w-4 h-4 text-emerald-500" />
                {t.contact.email}
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-500">
                <Phone className="w-4 h-4 text-emerald-500" />
                {t.contact.phone}
              </li>
              <li className="flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <a
                  href="#emergency"
                  className="text-red-400 font-semibold hover:text-red-300 transition-colors"
                >
                  {lang === 'np' ? 'आपातकालीन पहुँच' : 'Emergency Access'}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">{t.copyright}</p>
          <div className="flex items-center gap-1 text-xs text-slate-600">
            <span>{lang === 'np' ? 'नेपालमा बनाइएको' : 'Made with'}</span>
            <Heart className="w-3 h-3 text-red-500" fill="currentColor" />
            <span>{lang === 'np' ? '' : 'in Nepal'}</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
