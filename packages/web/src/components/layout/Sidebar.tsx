import { LayoutDashboard, Settings, Layers, Wrench, Folder, Gear } from 'lucide-react'
import { cn } from '@/lib/cn'
import { getEditorMeta, isNoneEditor } from '@/lib/editors'
import type { Stats } from '@/types'

interface SidebarProps {
  view: 'dashboard' | 'skills' | 'settings'
  editorFilter: string | null
  tierFilter: 'tool' | 'directory' | 'other' | null  // NEW: Tier filter
  stats: Stats | null
  onDashboard: () => void
  onSettings: () => void
  /** key=null 表示「全部技能」 */
  onEditor: (key: string | null) => void
  /** NEW: Tier filter handler */
  onTier: (tier: 'tool' | 'directory' | 'other' | null) => void
}

export function Sidebar({
  view,
  editorFilter,
  tierFilter,
  stats,
  onDashboard,
  onSettings,
  onEditor,
  onTier,
}: SidebarProps) {
  const byEditor = stats?.byEditor ?? {}
  const byTier = stats?.byTier ?? {}  // NEW: Tier statistics

  // 真实 editor 项（过滤 (none)），按数量降序
  const editors = Object.entries(byEditor)
    .filter(([k]) => !isNoneEditor(k))
    .sort((a, b) => b[1] - a[1])
  const noneCount = Object.entries(byEditor).find(([k]) => isNoneEditor(k))?.[1] ?? 0
  const total = stats?.total ?? 0

  const rowCls = (active: boolean) =>
    cn(
      'flex items-center justify-between gap-2 rounded-md px-3 py-2 text-body-sm transition-colors',
      active
        ? 'bg-primary-soft text-primary'
        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
    )

  const tierIcons = [
    { tier: 'tool' as const, icon: '🔧', label: 'Official Tools' },
    { tier: 'directory' as const, icon: '📁', label: 'Custom Skills' },
    { tier: 'other' as const, icon: '⚙️', label: 'Other Sources' },
  ]

  return (
    <aside className="sidebar">
      <button onClick={onDashboard} className={rowCls(view === 'dashboard')}>
        <span className="flex items-center gap-2">
          <LayoutDashboard size={16} />
          仪表盘
        </span>
      </button>

      {/* 技能分类 (Tier) */}
      <p className="mt-3 px-3 text-caption text-muted-foreground/70">技能分类</p>

      <button
        onClick={() => onTier(null)}
        className={rowCls(view === 'skills' && tierFilter === null)}
      >
        <span className="flex items-center gap-2">
          <Layers size={16} />
          全部分类
        </span>
        <span className="text-caption opacity-80">{total}</span>
      </button>

      {tierIcons.map(({ tier, icon, label }) => {
        const count = byTier[tier] ?? 0
        const active = view === 'skills' && tierFilter === tier
        return (
          <button key={tier} onClick={() => onTier(tier)} className={rowCls(active)}>
            <span className="flex items-center gap-2">
              <span className="text-base">{icon}</span>
              <span>{label}</span>
            </span>
            <span className="text-caption opacity-80">{count}</span>
          </button>
        )
      })}

      {/* 技能来源 (Editor) */}
      <p className="mt-3 px-3 text-caption text-muted-foreground/70">技能来源</p>

      <button
        onClick={() => onEditor(null)}
        className={rowCls(view === 'skills' && editorFilter === null && tierFilter === null)}
      >
        <span className="flex items-center gap-2">
          <Layers size={16} />
          全部来源
        </span>
        <span className="text-caption opacity-80">{total}</span>
      </button>

      {editors.map(([key, count]) => {
        const meta = getEditorMeta(key)
        const Icon = meta.icon
        const active = view === 'skills' && editorFilter === key
        return (
          <button key={key} onClick={() => onEditor(key)} className={rowCls(active)}>
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="grid h-5 w-5 shrink-0 place-items-center rounded"
                style={{ backgroundColor: meta.color + '1A', color: meta.color }}
              >
                <Icon size={13} />
              </span>
              <span className="truncate">{meta.label}</span>
            </span>
            <span className="text-caption opacity-80">{count}</span>
          </button>
        )
      })}

      {noneCount > 0 && (
        <button
          onClick={() => onEditor('(none)')}
          className={rowCls(view === 'skills' && editorFilter === '(none)')}
        >
          <span className="flex items-center gap-2 text-muted-foreground">
            <Layers size={16} />
            未分类
          </span>
          <span className="text-caption opacity-80">{noneCount}</span>
        </button>
      )}

      <button onClick={onSettings} className={cn(rowCls(view === 'settings'), 'mt-auto')}>
        <span className="flex items-center gap-2">
          <Settings size={16} />
          设置
        </span>
      </button>
    </aside>
  )
}
