import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Loader2,
  Moon,
  RefreshCw,
  Search,
  Sun,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'

export type ModuleKey = 'home' | 'skills' | 'commands' | 'editor'
export type ScanStatus = 'loading' | 'syncing' | 'ready' | 'error'

const MODULES: { key: ModuleKey; label: string; soon?: boolean }[] = [
  { key: 'home', label: '首页' },
  { key: 'skills', label: '技能库' },
  { key: 'commands', label: '命令手册' },
  { key: 'editor', label: '编辑器', soon: true },
]

interface TopbarProps {
  module: ModuleKey
  onModule: (m: ModuleKey) => void
  onReload: () => void
  reloading: boolean
  searchValue: string
  onSearch: (value: string) => void
  scanStatus: ScanStatus
  skillCount: number
}

function StatusPill({ status, skillCount }: { status: ScanStatus; skillCount: number }) {
  const isBusy = status === 'loading' || status === 'syncing'
  const statusText =
    status === 'loading'
      ? '加载中'
      : status === 'syncing'
        ? '扫描中'
        : status === 'error'
          ? '需检查'
          : '已同步'

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption md:inline-flex',
        status === 'error'
          ? 'border-destructive/30 bg-destructive/10 text-destructive'
          : status === 'ready'
            ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
            : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
      )}
      aria-label={`扫描状态：${statusText}`}
    >
      {status === 'error' ? (
        <AlertCircle size={14} />
      ) : isBusy ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <CheckCircle2 size={14} />
      )}
      <span>{statusText}</span>
      <span className="font-mono text-[11px] opacity-75">{skillCount}</span>
    </span>
  )
}

export function Topbar({
  module,
  onModule,
  onReload,
  reloading,
  searchValue,
  onSearch,
  scanStatus,
  skillCount,
}: TopbarProps) {
  const { theme, toggle } = useTheme()

  return (
    <header className="topbar">
      <button
        type="button"
        onClick={() => onModule('home')}
        className="flex shrink-0 items-center gap-2 rounded-md px-2 py-1 transition-colors hover:bg-muted"
        aria-label="返回 HuHaa AI 助手首页"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
          <Boxes size={19} />
        </span>
        <span className="hidden w-[8.25rem] flex-col text-left sm:flex xl:w-[9rem]">
          <span className="whitespace-nowrap text-body-sm font-bold text-foreground">HuHaa AI 助手</span>
          <span className="hidden whitespace-nowrap text-[11px] leading-none text-muted-foreground xl:block">
            本地技能工作台
          </span>
        </span>
      </button>

      <nav className="hidden shrink-0 items-center gap-1 lg:flex" aria-label="主模块">
        {MODULES.map((m) => {
          const active = module === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => onModule(m.key)}
              className={cn(
                'whitespace-nowrap rounded-md px-3 py-1.5 text-body-sm transition-colors',
                active
                  ? 'bg-primary-soft text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {m.label}
              {m.soon && <span className="ml-1 text-caption opacity-70">即将推出</span>}
            </button>
          )
        })}
      </nav>

      <div className="relative ml-auto hidden min-w-[12rem] flex-1 md:block xl:max-w-xl">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          value={searchValue}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="搜索技能、命令、来源…"
          className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <StatusPill status={scanStatus} skillCount={skillCount} />

      <div className="flex items-center gap-1">
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
