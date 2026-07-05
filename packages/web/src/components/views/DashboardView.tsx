import type { ReactNode } from 'react'
import { ArrowRight, BookOpen, TerminalSquare, Code2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import {
  COMMAND_BRAND_SUMMARIES,
  TOTAL_FLAG_COUNT,
  TOTAL_SUBCOMMAND_COUNT,
} from '@/lib/commands'
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
   * 在 stats 已加载的常规路径中，此 prop 不影响渲染输出。
   */
  items: SkillItem[]
  onOpenSkills: () => void
  onOpenCommands: () => void
  onOpenEditor: () => void
}

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  accent: string
  metrics: { label: string; value: string }[]
  ctaLabel: string
  onOpen: () => void
  comingSoon?: boolean
}

function FeatureCard({
  title,
  description,
  icon,
  accent,
  metrics,
  ctaLabel,
  onOpen,
  comingSoon,
}: FeatureCardProps) {
  return (
    <Card
      className="group flex h-full cursor-pointer flex-col transition-all hover:border-primary hover:shadow-md"
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onOpen()
        }
      }}
      aria-label={`进入 ${title}`}
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg"
            style={{ backgroundColor: accent + '1A', color: accent }}
          >
            {icon}
          </span>
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2">
              {title}
              {comingSoon && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-caption font-normal text-muted-foreground">
                  待开发
                </span>
              )}
            </CardTitle>
            <CardDescription className="mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="mt-auto">
        <div className="flex flex-wrap gap-2">
          {metrics.map((m) => (
            <span
              key={m.label}
              className="rounded-md bg-muted px-2 py-1 text-caption text-muted-foreground"
            >
              <span className="mr-1 text-foreground">{m.value}</span>
              {m.label}
            </span>
          ))}
        </div>
        <div className="mt-4 inline-flex items-center gap-1 text-body-sm font-medium text-primary">
          {ctaLabel}
          <ArrowRight
            size={14}
            className="transition-transform group-hover:translate-x-1"
          />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * 首页仪表盘：以三个功能卡片呈现入口。
 * - 进入技能模块前若数据未就绪，按 0 渲染（保留视觉一致）。
 * - 命令/编辑器卡片统计从 commands.json 聚合，与侧栏共享 lib/commands 口径。
 */
export function DashboardView({
  stats,
  items,
  onOpenSkills,
  onOpenCommands,
  onOpenEditor,
}: DashboardViewProps) {
  // 入口统计：技能数（仅统计成功解析的条目，错误条目在加载阶段已能被 catch）
  const skillCount = items.filter((it) => !it.parseError).length
  const statsTotal = stats?.total ?? skillCount

  // 命令统计从模块顶层预算常量读取，避免每次渲染重复计算
  const commandBrandCount = COMMAND_BRAND_SUMMARIES.length
  const flagTotal = TOTAL_FLAG_COUNT
  const subcommandTotal = TOTAL_SUBCOMMAND_COUNT

  return (
    <div className="canvas-dotted -m-6 min-h-full p-6">
      <h1 className="mb-1 text-h3 font-bold text-foreground">首页</h1>
      <p className="mb-5 text-body-sm text-muted-foreground">
        本地聚合的技能 / 命令 / 编辑器总览 — 选择一个模块进入。
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <FeatureCard
          title="技能"
          description="按 editor / 来源浏览本地技能、插件与 MCP 配置。"
          icon={<BookOpen size={20} />}
          accent="#2563EB"
          metrics={[
            { label: '个技能条目', value: String(statsTotal) },
          ]}
          ctaLabel="进入技能模块"
          onOpen={onOpenSkills}
        />

        <FeatureCard
          title="CLI 命令"
          description="常见 CLI 工具的 flag 与子命令能力地图。"
          icon={<TerminalSquare size={20} />}
          accent="#8B5CF6"
          metrics={[
            { label: '个品牌', value: String(commandBrandCount) },
            { label: '个 flag', value: String(flagTotal) },
            { label: '个子命令', value: String(subcommandTotal) },
          ]}
          ctaLabel="进入命令模块"
          onOpen={onOpenCommands}
        />

        <FeatureCard
          title="编辑器"
          description="编辑器与 AI 辅助能力聚合（占位模块）。"
          icon={<Code2 size={20} />}
          accent="#F59E0B"
          metrics={[]}
          ctaLabel="查看编辑器占位"
          onOpen={onOpenEditor}
          comingSoon
        />
      </div>
    </div>
  )
}
