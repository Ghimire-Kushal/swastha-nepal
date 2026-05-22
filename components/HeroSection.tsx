'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react'
import type { HeroTranslations } from '@/types'

interface HeroSectionProps {
  t: HeroTranslations
}

function fadeUpProps(delay: number) {
  return {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, delay, ease: 'easeOut' as const },
  }
}

export default function HeroSection({ t }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 pt-16">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(16,185,129,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        {/* Badge */}
        <motion.div
          {...fadeUpProps(0)}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium mb-8"
        >
          <Zap className="w-3.5 h-3.5" />
          {t.badge}
        </motion.div>

        {/* Headline */}
        <div className="mb-6">
          {t.headline.map((line, i) => (
            <motion.h1
              key={i}
              {...fadeUpProps(0.12 + i * 0.12)}
              className={`block text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight ${
                i === 1 ? 'text-emerald-400' : 'text-white'
              }`}
            >
              {line}
            </motion.h1>
          ))}
        </div>

        {/* Subheadline */}
        <motion.p
          {...fadeUpProps(0.48)}
          className="text-lg sm:text-xl text-slate-400 font-medium mb-4 max-w-2xl mx-auto"
        >
          {t.subheadline}
        </motion.p>

        {/* Description */}
        <motion.p
          {...fadeUpProps(0.6)}
          className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed"
        >
          {t.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          {...fadeUpProps(0.72)}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <a
            href="/register"
            className="group flex items-center gap-2 px-7 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl text-base shadow-lg shadow-emerald-500/25 transition-all hover:-translate-y-0.5 hover:shadow-emerald-500/40"
          >
            {t.ctaRegister}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>

          <a
            href="/login"
            className="px-7 py-3.5 border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white font-semibold rounded-xl text-base transition-all hover:-translate-y-0.5"
          >
            {t.ctaLogin}
          </a>

          <a
            href="#emergency"
            className="flex items-center gap-2 px-7 py-3.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 hover:border-red-500/70 text-red-400 hover:text-red-300 font-semibold rounded-xl text-base transition-all hover:-translate-y-0.5"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {t.ctaEmergency}
          </a>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          {...fadeUpProps(0.84)}
          className="mt-16 flex flex-wrap justify-center gap-6 text-slate-500 text-sm"
        >
          {[
            { icon: <Shield className="w-4 h-4" />, text: 'HIPAA Compliant' },
            { icon: <Globe className="w-4 h-4" />, text: 'Available in 77 Districts' },
            { icon: <Zap className="w-4 h-4" />, text: 'Instant AI Analysis' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <span className="text-emerald-500">{icon}</span>
              {text}
            </div>
          ))}
        </motion.div>

        {/* Floating cards */}
        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute left-8 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-left w-48"
          >
            <div className="text-2xl font-black text-emerald-400">98%</div>
            <div className="text-slate-400 text-xs mt-1">Diagnostic Accuracy</div>
            <div className="mt-2 h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full w-[98%] bg-emerald-500 rounded-full" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 text-left w-48"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-400 text-xs">Live Consultations</span>
            </div>
            <div className="text-2xl font-black text-white">50K+</div>
            <div className="text-slate-400 text-xs">Daily across Nepal</div>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
