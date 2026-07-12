import type { ReactNode } from 'react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  Layers,
  Sparkles,
  TerminalSquare,
} from 'lucide-react'
import {
  COMMAND_BRAND_SUMMARIES,
  TOTAL_FLAG_COUNT,
  TOTAL_SUBCOMMAND_COUNT,
} from '@/lib/commands'
import { editorLabel } from '@/lib/editors'
import { itemEditorKey } from './SkillsView'
import { displayDescription, kindLabel } from '@/lib/i18n'
import type { SkillItem, Stats } from '@/types'

interface DashboardViewProps {
  /**
   * 服务端聚合的 skill 统计（包含 total / byEditor / byKind 等）。
   * 多数情况下 stats 已就绪，UI 直接展示 stats.total。
   */
  stats: Stats | null
  /**
   * 技能条目列表。仅在 `stats === null`（fetchStats 失败但 fetchSkills 成功）时
   * 作为兜底，用 `items.filter(!parseError).length` 估计条目数。
   */
  items: SkillItem[]
  onOpenSkills: () => void
  onOpenCommands: () => void
  onOpenOtherSkills: () => void
}

interface MetricTileProps {
  label: string
  value: string
  icon: ReactNode
  tone?: 'primary' | 'success' | 'warning'
}

function MetricTile({ label, value, icon, tone = 'primary' }: MetricTileProps) {
  const toneClass =
    tone === 'success'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
      : tone === 'warning'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
        : 'bg-primary-soft text-primary'

  return (
    <div className="rounded-md border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${toneClass}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <div className="font-mono text-h4 font-semibold text-foreground">{value}</div>
          <div className="truncate text-caption text-muted-foreground">{label}</div>
        </div>
      </div>
    </div>
  )
}

interface WorkActionProps {
  title: string
  description: string
  icon: ReactNode
  onOpen: () => void
}

function WorkAction({ title, description, icon, onOpen }: WorkActionProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-3 rounded-md border border-border bg-card px-4 py-3 text-left transition-colors hover:border-primary hover:bg-primary-soft/40"
      aria-label={title}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-muted text-primary">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-body-sm font-semibold text-foreground">{title}</span>
        <span className="mt-0.5 block truncate text-caption text-muted-foreground">
          {description}
        </span>
      </span>
      <ArrowRight size={16} className="text-muted-foreground transition-transform group-hover:translate-x-1" />
    </button>
  )
}

function formatUpdatedAt(value?: string): string {
  if (!value) return '未知'
  const time = new Date(value)
  if (Number.isNaN(time.getTime())) return '未知'
  return time.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

export function DashboardView({
  stats,
  items,
  onOpenSkills,
  onOpenCommands,
  onOpenOtherSkills,
}: DashboardViewProps) {
  const validItems = items.filter((it) => !it.parseError)
  const statsTotal = stats?.total ?? validItems.length
  const commandBrandCount = COMMAND_BRAND_SUMMARIES.length
  const recentItems = [...validItems]
    .filter((item) => item.updatedAt)
    .sort((a, b) => Date.parse(b.updatedAt ?? '') - Date.parse(a.updatedAt ?? ''))
    .slice(0, 5)
  const sourceRows = Object.entries(stats?.byEditor ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const kindRows = Object.entries(stats?.byKind ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5">
      <section className="rounded-md border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-caption font-medium text-primary">
              <CheckCircle2 size={14} />
              本地工作台已就绪
            </div>
            <h1 className="mt-1 text-h3 font-bold text-foreground">呼哈哈-技能助手</h1>
            <p className="mt-1 max-w-3xl text-body-sm text-muted-foreground">
              集中浏览本机技能、插件与常用 CLI 帮助，快速找到可复用的 AI 辅助能力。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:min-w-[620px]">
            <MetricTile label="技能条目" value={String(statsTotal)} icon={<BookOpen size={18} />} />
            <MetricTile
              label="命令品牌"
              value={String(commandBrandCount)}
              icon={<TerminalSquare size={18} />}
              tone="success"
            />
            <MetricTile label="Flags" value={String(TOTAL_FLAG_COUNT)} icon={<Layers size={18} />} />
            <MetricTile
              label="子命令"
              value={String(TOTAL_SUBCOMMAND_COUNT)}
              icon={<Sparkles size={18} />}
              tone="warning"
            />
          </div>
        </div>
      </section>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
        <section className="detail">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-h4 font-semibold text-foreground">继续工作</h2>
              <p className="mt-1 text-body-sm text-muted-foreground">从最常用的入口继续，不需要先判断模块。</p>
            </div>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            <WorkAction
              title="打开技能库"
              description={`${statsTotal} 个本地技能与插件`}
              icon={<BookOpen size={18} />}
              onOpen={onOpenSkills}
            />
            <WorkAction
              title="查看命令手册"
              description={`${TOTAL_FLAG_COUNT} 个 flag / ${TOTAL_SUBCOMMAND_COUNT} 个子命令`}
              icon={<TerminalSquare size={18} />}
              onOpen={onOpenCommands}
            />
            <WorkAction
              title="查看其它技能"
              description="在技能库中筛选其它技能"
              icon={<Sparkles size={18} />}
              onOpen={onOpenOtherSkills}
            />
          </div>
        </section>

        <section className="detail">
          <div className="mb-4 flex items-center gap-2">
            <Clock3 size={16} className="text-primary" />
            <h2 className="text-h4 font-semibold text-foreground">来源健康</h2>
          </div>
          {sourceRows.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">暂无来源统计，等待下一次扫描。</p>
          ) : (
            <div className="space-y-3">
              {sourceRows.map(([source, count]) => (
                <div key={source} className="flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 text-body-sm">
                      <span className="truncate font-medium text-foreground">{editorLabel(source)}</span>
                      <span className="font-mono text-caption text-muted-foreground">{count}</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${Math.max(6, Math.min(100, (count / Math.max(statsTotal, 1)) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="grid min-h-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="detail">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-h4 font-semibold text-foreground">最近更新</h2>
              <p className="mt-1 text-body-sm text-muted-foreground">最近扫描到变化的技能条目。</p>
            </div>
          </div>
          {recentItems.length === 0 ? (
            <p className="text-body-sm text-muted-foreground">暂无最近更新记录。</p>
          ) : (
            <div className="divide-y divide-border overflow-hidden rounded-md border border-border">
              {recentItems.map((item) => (
                <div key={item.id} className="grid gap-2 bg-background px-3 py-3 md:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <span className="truncate text-body-sm font-medium text-foreground">
                        {item.title || item.name}
                      </span>
                      <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground">
                        {kindLabel(item.kind)}
                      </span>
                      <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 text-caption text-primary">
                        {editorLabel(itemEditorKey(item))}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-caption text-muted-foreground">
                      {displayDescription(item) || item.preview || '无描述'}
                    </p>
                  </div>
                  <span className="font-mono text-caption text-muted-foreground">
                    {formatUpdatedAt(item.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="detail">
          <h2 className="text-h4 font-semibold text-foreground">推荐下一步</h2>
          <div className="mt-4 space-y-3">
            {kindRows.length > 0 ? (
              kindRows.map(([kind, count]) => (
                <div key={kind} className="rounded-md border border-border bg-background px-3 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-body-sm font-medium text-foreground">{kindLabel(kind)}</span>
                    <span className="font-mono text-caption text-muted-foreground">{count}</span>
                  </div>
                  <p className="mt-1 text-caption text-muted-foreground">
                    可在技能库中继续按类型筛选和复制调用提示。
                  </p>
                </div>
              ))
            ) : (
              <p className="text-body-sm text-muted-foreground">扫描完成后会展示可优先整理的类型。</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
