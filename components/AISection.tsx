'use client'

import { motion } from 'framer-motion'
import { Sparkles, Lock, Brain } from 'lucide-react'
import type { AITranslations } from '@/types'

interface AISectionProps {
  t: AITranslations
}

const stepIcons = [Brain, Sparkles, Lock]

export default function AISection({ t }: AISectionProps) {
  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-6"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {t.badge}
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
              className="text-slate-500 text-lg mb-4"
            >
              {t.subheading}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-slate-500 text-base leading-relaxed mb-10"
            >
              {t.description}
            </motion.p>

            {/* Steps */}
            <div className="space-y-6">
              {t.steps.map((step, i) => {
                const Icon = stepIcons[i]
                return (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.25 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Right: Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gradient-to-br from-indigo-950 to-slate-900 rounded-3xl p-8 overflow-hidden">
              {/* Decorative circles */}
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-2xl" />
              <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl" />

              {/* Mock AI chat UI */}
              <div className="relative space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">AI Health Assistant</div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs">Active</span>
                    </div>
                  </div>
                </div>

                {/* User message */}
                <div className="flex justify-end">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                    <p className="text-white text-sm">
                      I have a headache and mild fever for 2 days.
                    </p>
                  </div>
                </div>

                {/* AI response */}
                <div className="bg-white/10 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[90%] backdrop-blur-sm">
                  <p className="text-white text-sm leading-relaxed">
                    Based on your symptoms, this may indicate a viral infection. I recommend:
                  </p>
                  <ul className="mt-2 space-y-1">
                    {['Rest and hydration', 'Paracetamol 500mg if needed', 'See a doctor if fever exceeds 39°C'].map((r) => (
                      <li key={r} className="flex items-start gap-2 text-slate-300 text-xs">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Confidence bar */}
                <div className="bg-white/5 rounded-xl px-4 py-3 border border-white/10">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-400">AI Confidence</span>
                    <span className="text-emerald-400 font-semibold">94%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: '94%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy badge */}
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-md">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-700">End-to-end encrypted</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
