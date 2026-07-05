import type { ReactNode } from 'react'
import { Boxes, AlertTriangle, Layers, Plug } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { getEditorMeta, isNoneEditor } from '@/lib/editors'
import { kindLabel } from '@/lib/i18n'
import type { SkillItem, Stats } from '@/types'

interface DashboardViewProps {
  stats: Stats | null
  items: SkillItem[]
}

function StatCard({
  icon,
  color,
  label,
  value,
}: {
  icon: ReactNode
  color: string
  label: string
  value: number
}) {
  return (
    <Card className="flex items-center gap-3 p-5 shadow-sm">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
        style={{ backgroundColor: color + '1A', color }}
      >
        {icon}
      </span>
      <div className="min-w-0">
        <p className="truncate text-body-sm text-muted-foreground">{label}</p>
        <p className="text-h3 font-bold tabular-nums">{value}</p>
      </div>
    </Card>
  )
}

export function DashboardView({ stats, items }: DashboardViewProps) {
  if (!stats) {
    return <p className="text-body-sm text-muted-foreground">暂无统计数据</p>
  }
  const parseErrors = items.filter((it) => it.parseError).length
  const byKind = Object.entries(stats.byKind).sort((a, b) => b[1] - a[1])
  const byEditor = Object.entries(stats.byEditor)
    .filter(([k]) => !isNoneEditor(k))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  return (
    <div className="canvas-dotted -m-6 min-h-full p-6">
      <h1 className="mb-1 text-h3 font-bold text-foreground">仪表盘</h1>
      <p className="mb-5 text-body-sm text-muted-foreground">
        本地聚合的技能 / 插件 / MCP 概览（数据来自磁盘扫描）
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={<Boxes size={20} />} color="#2563EB" label="条目总数" value={stats.total} />
        <StatCard
          icon={<Layers size={20} />}
          color="#10A37F"
          label="技能来源数"
          value={byEditor.length}
        />
        <StatCard
          icon={<Plug size={20} />}
          color="#8B5CF6"
          label="类型数"
          value={Object.keys(stats.byKind).length}
        />
        <StatCard
          icon={<AlertTriangle size={20} />}
          color={parseErrors > 0 ? '#EF4444' : '#6B7280'}
          label="解析错误"
          value={parseErrors}
        />
      </div>

      <h2 className="mb-3 mt-8 text-h4 text-foreground">按类型</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {byKind.map(([kind, count]) => (
          <StatCard
            key={kind}
            icon={<Plug size={20} />}
            color="#2563EB"
            label={kindLabel(kind)}
            value={count}
          />
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-h4 text-foreground">按来源（editor）</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {byEditor.map(([key, count]) => {
          const meta = getEditorMeta(key)
          const Icon = meta.icon
          return (
            <StatCard
              key={key}
              icon={<Icon size={20} />}
              color={meta.color}
              label={meta.label}
              value={count}
            />
          )
        })}
      </div>
    </div>
  )
}
