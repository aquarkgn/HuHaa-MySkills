'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { resolvedTheme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <span className="font-bold">H</span>
          </div>
          <h1 className="text-lg font-bold">HuHaa MySkills</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            首页
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            技能库
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            社区
          </a>
          <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
            文档
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md p-2 hover:bg-muted transition-colors"
            aria-label="切换主题"
          >
            {resolvedTheme === 'light' ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
