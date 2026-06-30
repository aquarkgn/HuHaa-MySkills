import { Layers, Boxes, Plug, FileText } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Stats } from '@/types'

interface SidebarProps {
  stats: Stats | null
  activeKind: string | null
  onSelectKind: (kind: string | null) => void
}

const KIND_META: { key: string; label: string; icon: typeof Layers }[] = [
  { key: 'skill', label: '技能 Skills', icon: Layers },
  { key: 'plugin', label: '插件 Plugins', icon: Boxes },
  { key: 'mcp', label: 'MCP 工具', icon: Plug },
  { key: 'instruction', label: '规则 Rules', icon: FileText },
]

export function Sidebar({ stats, activeKind, onSelectKind }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="px-2 py-1">
        <h1 className="text-h4 font-bold text-foreground">HuHaa</h1>
        <p className="text-caption text-muted-foreground">MySkills 聚合中心</p>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        <button
          onClick={() => onSelectKind(null)}
          className={cn(
            'flex items-center justify-between rounded-md px-3 py-2 text-body-sm transition-colors',
            activeKind === null
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <span>全部</span>
          <span className="text-caption opacity-80">{stats?.total ?? 0}</span>
        </button>

        {KIND_META.map(({ key, label, icon: Icon }) => {
          const count = stats?.byKind?.[key] ?? 0
          const active = activeKind === key
          return (
            <button
              key={key}
              onClick={() => onSelectKind(key)}
              className={cn(
                'flex items-center justify-between rounded-md px-3 py-2 text-body-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span className="flex items-center gap-2">
                <Icon size={16} />
                {label}
              </span>
              <span className="text-caption opacity-80">{count}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
