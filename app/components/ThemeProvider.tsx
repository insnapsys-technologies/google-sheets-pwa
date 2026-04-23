'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'brutalist' | 'glass'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'brutalist',
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('brutalist')

  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null
    if (saved === 'brutalist' || saved === 'glass') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    } else {
      document.documentElement.setAttribute('data-theme', 'brutalist')
    }
  }, [])

  const toggle = () => {
    const next = theme === 'brutalist' ? 'glass' : 'brutalist'
    setTheme(next)
    localStorage.setItem('theme', next)
    document.documentElement.setAttribute('data-theme', next)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
