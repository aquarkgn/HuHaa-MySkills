import { Moon, Sun, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'

interface TopbarProps {
  query: string
  onQueryChange: (q: string) => void
  onReload: () => void
  reloading: boolean
}

export function Topbar({ query, onQueryChange, onReload, reloading }: TopbarProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="topbar">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="搜索技能、插件、MCP…"
        className="h-9 w-80 max-w-[50vw] rounded-md border border-border bg-input px-3 text-body-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      <div className="flex items-center gap-2">
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
