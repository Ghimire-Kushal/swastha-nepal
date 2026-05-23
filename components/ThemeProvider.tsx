'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { type Theme, DEFAULT_THEME } from '@/lib/theme'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: Partial<Theme>) => void
  reset: () => void
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  reset: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}

function applyTheme(theme: Theme) {
  const html = document.documentElement

  // Accent
  html.setAttribute('data-accent', theme.accent)

  // Appearance
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = theme.appearance === 'dark' || (theme.appearance === 'system' && prefersDark)
  html.classList.toggle('dark', isDark)

  // Shape
  html.setAttribute('data-shape', theme.shape)

  // Density
  html.setAttribute('data-density', theme.density)

  // Animations
  html.setAttribute('data-animations', theme.animations ? 'on' : 'off')
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('sn-theme')
    const initial = saved ? { ...DEFAULT_THEME, ...JSON.parse(saved) } : DEFAULT_THEME
    setThemeState(initial)
    applyTheme(initial)
    setMounted(true)
  }, [])

  function setTheme(partial: Partial<Theme>) {
    const next = { ...theme, ...partial }
    setThemeState(next)
    localStorage.setItem('sn-theme', JSON.stringify(next))
    applyTheme(next)
  }

  function reset() {
    setThemeState(DEFAULT_THEME)
    localStorage.removeItem('sn-theme')
    applyTheme(DEFAULT_THEME)
  }

  // Suppress hydration flash — render children only after mount
  return (
    <ThemeContext.Provider value={{ theme, setTheme, reset }}>
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>{children}</div>
    </ThemeContext.Provider>
  )
}
