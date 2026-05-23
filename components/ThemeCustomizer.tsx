'use client'

import { useState } from 'react'
import { Palette, X, RotateCcw, Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { ACCENT_META, type AccentColor, type Appearance, type Shape, type Density } from '@/lib/theme'

const ACCENTS = Object.entries(ACCENT_META) as [AccentColor, { label: string; color: string }][]

export default function ThemeCustomizer() {
  const [open, setOpen] = useState(false)
  const { theme, setTheme, reset } = useTheme()

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-slate-800 text-white shadow-2xl flex items-center justify-center hover:bg-slate-700 transition-colors"
        title="Customize theme"
      >
        <Palette className="w-5 h-5" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        className={`fixed right-0 top-0 h-full z-50 w-80 overflow-y-auto transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(20px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-5 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-white font-bold text-lg">Theme Customizer</h2>
            <p className="text-slate-400 text-sm mt-0.5">Personalize your panel</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors mt-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Accent Color */}
          <section>
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Accent Color</p>
            <div className="grid grid-cols-4 gap-3">
              {ACCENTS.map(([key, meta]) => (
                <button
                  key={key}
                  onClick={() => setTheme({ accent: key })}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: key === 'glass'
                        ? 'linear-gradient(135deg, #22d3ee 0%, #6366f1 100%)'
                        : key === 'minimal'
                        ? 'linear-gradient(135deg, #94a3b8, #475569)'
                        : meta.color,
                      outline: theme.accent === key ? '2.5px solid rgba(255,255,255,0.95)' : '2px solid rgba(255,255,255,0.1)',
                      outlineOffset: '2px',
                      boxShadow: theme.accent === key
                        ? `0 0 12px ${meta.color}66`
                        : '0 2px 8px rgba(0,0,0,0.3)',
                      transition: 'all 0.2s',
                    }}
                  >
                    {theme.accent === key && (
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'white' }} />
                    )}
                  </div>
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">
                    {meta.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* Appearance */}
          <section>
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Appearance</p>
            <div className="grid grid-cols-3 gap-2">
              {([
                { value: 'light', label: 'Light', Icon: Sun },
                { value: 'dark',  label: 'Dark',  Icon: Moon },
                { value: 'system',label: 'System', Icon: Monitor },
              ] as { value: Appearance; label: string; Icon: React.ElementType }[]).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme({ appearance: value })}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all ${
                    theme.appearance === value
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Component Shape */}
          <section>
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Component Shape</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'rounded', label: 'Rounded' },
                { value: 'square',  label: 'Square' },
              ] as { value: Shape; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme({ shape: value })}
                  className={`py-2.5 text-sm font-medium transition-all border ${
                    value === 'rounded' ? 'rounded-xl' : 'rounded-none'
                  } ${
                    theme.shape === value
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Layout Density */}
          <section>
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Layout Density</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { value: 'normal',  label: 'Normal' },
                { value: 'compact', label: 'Compact' },
              ] as { value: Density; label: string }[]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setTheme({ density: value })}
                  className={`py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    theme.density === value
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Sidebar */}
          <section>
            <p className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-3">Sidebar</p>
            <div className="grid grid-cols-2 gap-2">
              {(['expanded', 'collapsed'] as const).map((value) => (
                <button
                  key={value}
                  onClick={() => setTheme({ sidebar: value })}
                  className={`py-2.5 rounded-xl text-sm font-medium border capitalize transition-all ${
                    theme.sidebar === value
                      ? 'border-cyan-400 text-cyan-400 bg-cyan-400/10'
                      : 'border-white/10 text-slate-400 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </section>

          {/* Animations */}
          <section>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">Animations</p>
              <button
                onClick={() => setTheme({ animations: !theme.animations })}
                style={{
                  position: 'relative',
                  width: 48,
                  height: 24,
                  borderRadius: 9999,
                  flexShrink: 0,
                  background: theme.animations ? '#22d3ee' : '#475569',
                  transition: 'background 0.2s',
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: 2,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: 'white',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    transform: theme.animations ? 'translateX(24px)' : 'translateX(0)',
                    transition: 'transform 0.2s',
                  }}
                />
              </button>
            </div>
          </section>

          {/* Reset */}
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 text-slate-400 hover:border-white/30 hover:text-white text-sm font-medium transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  )
}
