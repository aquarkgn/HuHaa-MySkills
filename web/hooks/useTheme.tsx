'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'system'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: 'light' | 'dark'
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system')
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  // 初始化主题
  useEffect(() => {
    setMounted(true)

    // 从 localStorage 读取保存的主题
    const saved = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(saved)

    // 应用主题
    applyTheme(saved)
  }, [])

  // 应用主题到 DOM
  const applyTheme = (newTheme: Theme) => {
    let actual: 'light' | 'dark' = 'light'

    if (newTheme === 'system') {
      actual = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
    } else {
      actual = newTheme
    }

    setResolvedTheme(actual)

    // 更新 HTML class
    const html = document.documentElement
    if (actual === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }

    // 保存到 localStorage
    localStorage.setItem('theme', newTheme)
  }

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const toggleTheme = () => {
    const newTheme = resolvedTheme === 'light' ? 'dark' : 'light'
    handleSetTheme(newTheme)
  }

  // 防止 hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme: handleSetTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
