'use client'

import { Toaster } from 'react-hot-toast'
import ThemeProvider from '@/components/ThemeProvider'
import ThemeCustomizer from '@/components/ThemeCustomizer'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <ThemeCustomizer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: '8px',
            background: '#1e293b',
            color: '#f8fafc',
          },
        }}
      />
    </ThemeProvider>
  )
}
