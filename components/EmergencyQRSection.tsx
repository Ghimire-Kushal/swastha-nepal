'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import type { QRTranslations } from '@/types'

interface EmergencyQRSectionProps {
  t: QRTranslations
}

function QRCodeMock() {
  const pattern = [
    [1,1,1,0,1,0,1,1,1],
    [1,0,1,0,0,0,1,0,1],
    [1,0,1,1,0,1,1,0,1],
    [0,0,0,0,1,0,0,0,0],
    [1,0,1,0,1,0,1,0,1],
    [0,0,0,0,1,0,0,1,0],
    [1,1,1,0,1,0,1,1,1],
    [0,1,0,1,0,1,0,1,0],
    [1,1,0,1,1,0,1,0,1],
  ]

  return (
    <div className="inline-block p-4 bg-white rounded-2xl shadow-xl border-4 border-red-100">
      <div
        className="grid gap-0.5"
        style={{ gridTemplateColumns: `repeat(9, 1fr)` }}
      >
        {pattern.flat().map((cell, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-[2px] ${cell ? 'bg-slate-900' : 'bg-white'}`}
          />
        ))}
      </div>
      <div className="mt-3 text-center">
        <span className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
          Emergency ID
        </span>
      </div>
    </div>
  )
}

export default function EmergencyQRSection({ t }: EmergencyQRSectionProps) {
  return (
    <section id="emergency" className="py-24 bg-gradient-to-br from-red-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: QR Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              {/* Pulsing ring */}
              <div className="absolute inset-0 rounded-3xl bg-red-500/10 animate-pulse scale-110" />
              <div className="relative bg-white rounded-3xl p-8 shadow-2xl border border-red-100">
                <div className="text-center mb-6">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full uppercase tracking-wide">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Emergency QR
                  </span>
                </div>

                <QRCodeMock />

                {/* Mock medical info */}
                <div className="mt-6 space-y-2 text-sm">
                  {[
                    { label: 'Blood Type', value: 'A+', color: 'text-red-600' },
                    { label: 'Allergies', value: 'Penicillin', color: 'text-orange-600' },
                    { label: 'Emergency Contact', value: '+977-98XXXXXXXX', color: 'text-slate-700' },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-center px-3 py-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500 text-xs">{item.label}</span>
                      <span className={`font-bold text-xs ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="mt-6 text-slate-400 text-sm text-center max-w-xs">
              Works offline — no internet required for first responders to access your data
            </p>
          </motion.div>

          {/* Right: Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              Life-Saving Feature
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl font-black text-slate-900 mb-4"
            >
              {t.heading}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-lg font-medium text-slate-600 mb-4"
            >
              {t.subheading}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 text-base leading-relaxed mb-8"
            >
              {t.description}
            </motion.p>

            {/* Steps */}
            <div className="space-y-4 mb-10">
              {t.steps.map((step, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className="flex-shrink-0 w-7 h-7 bg-red-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  </div>
                  <span className="text-slate-700 text-sm font-medium">{step}</span>
                </motion.div>
              ))}
            </div>

            <motion.a
              href="/register"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-base shadow-lg shadow-red-500/25 transition-all hover:-translate-y-0.5 group"
            >
              {t.cta}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  )
}
