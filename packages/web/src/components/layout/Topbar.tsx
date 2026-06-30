import { Moon, Sun, RefreshCw, Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

export type ModuleKey = 'skills' | 'commands' | 'editor'

const MODULES: { key: ModuleKey; label: string; soon?: boolean }[] = [
  { key: 'skills', label: '技能 Skills' },
  { key: 'commands', label: '命令', soon: true },
  { key: 'editor', label: '编辑器', soon: true },
]

interface TopbarProps {
  module: ModuleKey
  onModule: (m: ModuleKey) => void
  onReload: () => void
  reloading: boolean
}

export function Topbar({ module, onModule, onReload, reloading }: TopbarProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="topbar">
      {/* 品牌 */}
      <div className="flex items-center gap-2 pr-2">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <Boxes size={18} />
        </span>
        <span className="text-body-sm font-bold text-foreground">HuHaa</span>
      </div>

      {/* 模块标签 */}
      <nav className="flex items-center gap-1">
        {MODULES.map((m) => {
          const active = module === m.key
          return (
            <button
              key={m.key}
              disabled={m.soon}
              onClick={() => !m.soon && onModule(m.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-body-sm transition-colors',
                active
                  ? 'bg-primary-soft text-primary'
                  : m.soon
                    ? 'cursor-not-allowed text-muted-foreground/60'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {m.label}
              {m.soon && <span className="ml-1 text-caption opacity-70">待开发</span>}
            </button>
          )
        })}
      </nav>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" onClick={onReload} aria-label="重新扫描">
          <RefreshCw size={18} className={reloading ? 'animate-spin' : undefined} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label={theme === 'dark' ? '切换到亮色' : '切换到暗色'}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </Button>
      </div>
    </header>
  )
}
