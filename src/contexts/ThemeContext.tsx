import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type Theme = 'light'

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)
const STORAGE_KEY = 'eg_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme] = useState<Theme>('light')

  useEffect(() => {
    const root = document.documentElement
    root.classList.add('light')
    root.classList.remove('dark')
    try {
      localStorage.setItem(STORAGE_KEY, 'light')
    } catch {
      // ignore
    }
  }, [])

  const setTheme = () => {}
  const toggleTheme = () => {}

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
