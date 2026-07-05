import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Search } from 'lucide-react'
import { fetchSkillDetail } from '@/lib/api'
import { cn } from '@/lib/cn'
import {
  hasSubcommandEnrichment,
  loadSubcommandEnrichment,
  type CliSubcommandEnrichment,
  type CliSubcommandRelatedItem,
} from '@/lib/cli-enrichments'
import { extractMarkdownSection, parseSkillFrontmatter } from '@/lib/cli-enrichments/skillDocParser'

interface SubcommandRelatedItemsPanelProps {
  brand: string
  subcommand: string
}

function getItemSearchText(item: CliSubcommandRelatedItem): string {
  return [
    item.name,
    item.displayName,
    item.summary_zh,
    item.summary_raw,
    item.whenToUse_zh,
    item.whenToUse_raw,
    item.sourcePath,
    ...(item.triggers ?? []),
    ...(item.allowedTools ?? []),
    ...(item.benefitsFrom ?? []),
    ...(item.tags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function mergeDetail(base: CliSubcommandRelatedItem, detailRaw: string | undefined): CliSubcommandRelatedItem {
  if (!detailRaw) return base
  const parsed = parseSkillFrontmatter(detailRaw)
  return {
    ...base,
    raw: detailRaw,
    whenToUse_raw: base.whenToUse_raw ?? extractMarkdownSection(detailRaw, 'When to invoke this skill'),
    triggers: base.triggers ?? parsed.triggers,
    allowedTools: base.allowedTools ?? parsed.allowedTools,
    benefitsFrom: base.benefitsFrom ?? parsed.benefitsFrom,
  }
}

function PillList({ label, values }: { label: string; values?: string[] }) {
  if (!values || values.length === 0) return null
  return (
    <div className="mt-3">
      <div className="mb-1 text-caption font-semibold text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <span
            key={`${label}:${value}`}
            className="rounded-full border border-border bg-muted px-2 py-0.5 font-mono text-caption text-muted-foreground"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  )
}

function BilingualSummary({ item }: { item: CliSubcommandRelatedItem }) {
  const zh = item.summary_zh || item.summary_raw || '暂无中文说明，先显示原文。'
  return (
    <div className="space-y-1">
      <p className="text-body-sm text-foreground">{zh}</p>
      {item.summary_raw && item.summary_raw !== zh && (
        <p className="text-caption text-muted-foreground">原文：{item.summary_raw}</p>
      )}
    </div>
  )
}

function RelatedItemCard({ item }: { item: CliSubcommandRelatedItem }) {
  const [expanded, setExpanded] = useState(false)
  const [detail, setDetail] = useState<CliSubcommandRelatedItem>(item)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)

  useEffect(() => {
    setDetail(item)
    setDetailError(null)
    setLoadingDetail(false)
  }, [item])

  useEffect(() => {
    if (!expanded || detail.raw || !detail.detailId) return
    let cancelled = false
    setLoadingDetail(true)
    setDetailError(null)
    fetchSkillDetail(detail.detailId)
      .then((skill) => {
        if (cancelled) return
        setDetail((current) => mergeDetail(current, skill.raw))
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setDetailError(error instanceof Error ? error.message : '详情加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoadingDetail(false)
      })
    return () => {
      cancelled = true
    }
  }, [expanded, detail.detailId, detail.raw])

  return (
    <article className="rounded-md border border-border bg-background">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        aria-expanded={expanded}
      >
        <span className="mt-1 shrink-0 text-muted-foreground">
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-body-sm font-semibold text-primary">{detail.displayName}</span>
            <span
              className={cn(
                'rounded-sm px-2 py-0.5 text-caption',
                detail.status === 'ready'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-muted text-muted-foreground',
              )}
            >
              {detail.status === 'ready' ? '已解析' : '待完善'}
            </span>
          </span>
          <span className="mt-1 block">
            <BilingualSummary item={detail} />
          </span>
        </span>
      </button>

      {expanded && (
        <div className="border-t border-border px-4 py-3">
          {loadingDetail && <p className="text-caption text-muted-foreground">正在加载原始 SKILL.md…</p>}
          {detailError && <p className="text-caption text-destructive">详情加载失败：{detailError}</p>}

          {detail.whenToUse_raw && (
            <section className="mt-2">
              <h4 className="text-caption font-semibold text-muted-foreground">何时使用 / When to invoke</h4>
              <pre className="mt-1 whitespace-pre-wrap rounded-sm bg-muted px-3 py-2 text-caption text-foreground">
                {detail.whenToUse_zh || detail.whenToUse_raw}
              </pre>
              {detail.whenToUse_zh && detail.whenToUse_raw !== detail.whenToUse_zh && (
                <pre className="mt-2 whitespace-pre-wrap rounded-sm bg-muted/60 px-3 py-2 text-caption text-muted-foreground">
                  原文：{detail.whenToUse_raw}
                </pre>
              )}
            </section>
          )}

          <PillList label="触发词 / triggers" values={detail.triggers} />
          <PillList label="允许工具 / allowed-tools" values={detail.allowedTools} />
          <PillList label="关联技能 / benefits-from" values={detail.benefitsFrom} />

          {detail.sourcePath && (
            <p className="mt-3 break-all text-caption text-muted-foreground">
              原始路径：<span className="font-mono">{detail.sourcePath}</span>
            </p>
          )}

          {detail.raw && (
            <details className="mt-3 text-caption text-muted-foreground">
              <summary className="cursor-pointer select-none font-medium text-foreground">查看原始 SKILL.md</summary>
              <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap rounded-sm bg-muted px-3 py-2 font-mono">
                {detail.raw}
              </pre>
            </details>
          )}
        </div>
      )}
    </article>
  )
}

export function SubcommandRelatedItemsPanel({ brand, subcommand }: SubcommandRelatedItemsPanelProps) {
  const [query, setQuery] = useState('')
  const [enrichment, setEnrichment] = useState<CliSubcommandEnrichment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supported = hasSubcommandEnrichment(brand, subcommand)

  useEffect(() => {
    if (!supported) return
    let cancelled = false
    setLoading(true)
    setError(null)
    setEnrichment(null)
    loadSubcommandEnrichment(brand, subcommand)
      .then((next) => {
        if (!cancelled) setEnrichment(next ?? null)
      })
      .catch((loadError: unknown) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : '关联对象加载失败')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [brand, subcommand, supported])

  const visibleItems = useMemo(() => {
    const items = enrichment?.items ?? []
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items
    return items.filter((item) => getItemSearchText(item).includes(normalized))
  }, [enrichment, query])

  if (!supported) return null

  return (
    <section className="mt-4 rounded-md border border-border bg-card/60 px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-body-sm font-semibold text-foreground">
              {enrichment?.title_zh ?? '关联对象'}
            </h3>
            <span className="rounded-sm bg-muted px-2 py-0.5 text-caption text-muted-foreground">
              {loading ? '加载中' : `${enrichment?.items.length ?? 0} 项`}
            </span>
          </div>
          <p className="mt-1 text-caption text-muted-foreground">
            {enrichment?.title_raw ?? '展示该子命令列出或管理的对象详情，保留中文说明与原文。'}
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="搜索工具、中文说明、原文或触发词…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2 text-caption placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {loading && (
        <div className="mt-3 rounded-md border border-dashed border-border px-4 py-4 text-caption text-muted-foreground">
          正在加载关联对象…
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md border border-dashed border-border px-4 py-4 text-caption text-destructive">
          关联对象加载失败：{error}。子命令 help 仍可正常查看。
        </div>
      )}

      {!loading && !error && enrichment && enrichment.items.length === 0 && (
        <div className="mt-3 rounded-md border border-dashed border-border px-4 py-4 text-caption text-muted-foreground">
          暂未发现关联对象。请确认本地技能扫描结果是否包含该来源。
        </div>
      )}

      {!loading && !error && enrichment && enrichment.items.length > 0 && (
        <div className="mt-3 space-y-2">
          {visibleItems.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-4 text-caption text-muted-foreground">
              没有匹配的关联对象
            </div>
          ) : (
            visibleItems.map((item) => <RelatedItemCard key={item.id} item={item} />)
          )}
        </div>
      )}
    </section>
  )
}
