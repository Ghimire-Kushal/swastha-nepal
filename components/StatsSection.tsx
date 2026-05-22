'use client'

import { motion } from 'framer-motion'
import type { StatsTranslations } from '@/types'

interface StatsSectionProps {
  t: StatsTranslations
}

export default function StatsSection({ t }: StatsSectionProps) {
  return (
    <section className="py-16 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center text-sm font-semibold text-slate-500 uppercase tracking-widest mb-10"
        >
          {t.heading}
        </motion.p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {t.items.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="text-4xl sm:text-5xl font-black text-emerald-600 mb-2 group-hover:scale-105 transition-transform">
                {stat.value}
              </div>
              <div className="text-slate-500 text-sm font-medium">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
