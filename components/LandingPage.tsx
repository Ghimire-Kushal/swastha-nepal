'use client'

import { useState } from 'react'
import { translations } from '@/lib/translations'
import type { Language } from '@/types'
import Navbar from '@/components/Navbar'
import HeroSection from '@/components/HeroSection'
import StatsSection from '@/components/StatsSection'
import FeaturesSection from '@/components/FeaturesSection'
import AISection from '@/components/AISection'
import EmergencyQRSection from '@/components/EmergencyQRSection'
import Footer from '@/components/Footer'

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('en')
  const t = translations[lang]

  return (
    <div className="min-h-screen">
      <Navbar lang={lang} setLang={setLang} t={t.nav} />
      <HeroSection t={t.hero} />
      <StatsSection t={t.stats} />
      <FeaturesSection t={t.features} />
      <AISection t={t.ai} />
      <EmergencyQRSection t={t.qr} />
      <Footer t={t.footer} lang={lang} />
    </div>
  )
}
