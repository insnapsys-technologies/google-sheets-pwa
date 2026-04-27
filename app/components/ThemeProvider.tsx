'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'glass'

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'glass',
  toggle: () => {},
})

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>('glass')

  useEffect(() => {
    // Theme selection is disabled — always use black glass
    document.documentElement.setAttribute('data-theme', 'glass')
  }, [])

  // const toggle = () => {
  //   const next = theme === 'brutalist' ? 'glass' : 'brutalist'
  //   setTheme(next)
  //   localStorage.setItem('theme', next)
  //   document.documentElement.setAttribute('data-theme', next)
  // }

  return (
    <ThemeContext.Provider value={{ theme, toggle: () => {} }}>
      {children}
    </ThemeContext.Provider>
  )
}
