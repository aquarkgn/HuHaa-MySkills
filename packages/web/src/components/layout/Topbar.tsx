import { Moon, Sun, RefreshCw, Boxes } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

export type ModuleKey = 'home' | 'skills' | 'commands' | 'editor'

const MODULES: { key: ModuleKey; label: string; soon?: boolean }[] = [
  { key: 'skills', label: '技能' },
  { key: 'commands', label: '命令' },
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
      {/* 品牌：点击回到首页（dashboard 入口） */}
      <button
        type="button"
        onClick={() => onModule('home')}
        className="flex items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
        aria-label="返回首页"
      >
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
          <Boxes size={18} />
        </span>
        <span className="text-body-sm font-bold text-foreground">HuHaa</span>
      </button>

      {/* 模块标签（编辑器以可点击占位形式呈现，但继续标注「待开发」） */}
      <nav className="flex items-center gap-1">
        {MODULES.map((m) => {
          const active = module === m.key
          return (
            <button
              key={m.key}
              onClick={() => onModule(m.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-body-sm transition-colors',
                active
                  ? 'bg-primary-soft text-primary'
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
