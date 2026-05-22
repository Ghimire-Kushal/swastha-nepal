'use client'

import { useState, useEffect, useCallback } from 'react'

export type AppLang = 'en' | 'np'

const STORAGE_KEY = 'swastha-lang'

export function useLanguage() {
  const [lang, setLangState] = useState<AppLang>('en')

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as AppLang | null
    if (saved === 'en' || saved === 'np') setLangState(saved)
  }, [])

  const setLang = useCallback((l: AppLang) => {
    localStorage.setItem(STORAGE_KEY, l)
    setLangState(l)
  }, [])

  const toggle = useCallback(() => {
    setLang(lang === 'en' ? 'np' : 'en')
  }, [lang, setLang])

  return { lang, setLang, toggle }
}
