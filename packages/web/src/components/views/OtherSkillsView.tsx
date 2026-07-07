import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  Code,
  Copy,
  ExternalLink,
  FileText,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'
import { useOtherSkills, getSkillEmoji } from '@/hooks/useOtherSkills'
import { translateText } from '@/lib/api'
import { isTranslateDisplayEnabled } from '@/lib/i18n'
import { isIconBlacklisted, markIconMissing } from '@/lib/iconBlacklist'
import { cn } from '@/lib/cn'
import type { OtherSkill } from '@/types/other-skill'

/**
 * 技能图标：优先展示真实应用图标，加载失败回退 emoji。
 * 黑名单会跳过已知缺失图标的 brand，避免列表滚动时重复 404。
 */
function SkillIcon({ skill, size = 20 }: { skill: OtherSkill; size?: number }) {
  const [failed, setFailed] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const emoji = getSkillEmoji(skill)

  useEffect(() => {
    setFailed(false)
    setLoaded(false)
  }, [skill.brand])

  const blacklisted = skill.brand ? isIconBlacklisted(skill.brand) : false
  const showImg = skill.iconUrl && !failed && !blacklisted

  if (showImg) {
    return (
      <span
        className="relative inline-flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        {!loaded && (
          <span
            className="absolute inset-0 flex animate-pulse items-center justify-center opacity-50"
            style={{ fontSize: size * 0.85 }}
          >
            {emoji}
          </span>
        )}
        <img
          src={skill.iconUrl}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => {
            if (skill.brand) markIconMissing(skill.brand)
            setFailed(true)
          }}
          className="shrink-0 rounded-[4px] object-contain"
          style={{ width: size, height: size }}
        />
      </span>
    )
  }

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.85 }}
    >
      {emoji}
    </span>
  )
}

interface OtherSkillsViewProps {
  query?: string
  onQuery?: (query: string) => void
  selectedId?: string | null
  onSelect?: (id: string) => void
}

function titleOf(skill: OtherSkill): string {
  return skill.title || skill.name
}

function categoriesOf(skill: OtherSkill): string[] {
  if (Array.isArray(skill.category)) return skill.category.filter(Boolean)
  return skill.category ? [skill.category] : []
}

function primaryCategory(skill: OtherSkill): string {
  return categoriesOf(skill)[0] ?? '未分类'
}

function formatUpdatedAt(value?: string): string {
  if (!value) return '未记录'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未记录'
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}

function linkHost(url: string): string {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

async function copyText(value: string): Promise<void> {
  if (!navigator.clipboard) return
  await navigator.clipboard.writeText(value)
}

function OtherSkillContextPanel({ skill }: { skill: OtherSkill }) {
  const categories = categoriesOf(skill)

  return (
    <aside className="detail sticky top-0 flex max-h-full flex-col gap-5 overflow-y-auto">
      <div>
        <p className="text-caption font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          技能上下文
        </p>
        <div className="mt-3 flex items-start gap-3">
          <SkillIcon skill={skill} size={32} />
          <div className="min-w-0">
            <h3 className="truncate text-body font-semibold text-foreground">{titleOf(skill)}</h3>
            <p className="mt-1 truncate text-caption text-muted-foreground">{skill.brand || skill.source || '其它技能'}</p>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-body-sm">
        <dt className="text-muted-foreground">名称</dt>
        <dd className="min-w-0 break-words font-mono text-caption">{skill.name}</dd>
        <dt className="text-muted-foreground">来源</dt>
        <dd className="min-w-0 truncate">{skill.source || '未记录'}</dd>
        <dt className="text-muted-foreground">品牌</dt>
        <dd className="min-w-0 truncate">{skill.brand || '未记录'}</dd>
        <dt className="text-muted-foreground">分类</dt>
        <dd className="min-w-0 break-words">{categories.length > 0 ? categories.join(', ') : '未分类'}</dd>
        <dt className="text-muted-foreground">更新</dt>
        <dd className="font-mono text-caption">{formatUpdatedAt(skill.updatedAt)}</dd>
      </dl>

      <div>
        <p className="mb-2 text-caption font-semibold text-muted-foreground">快捷动作</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void copyText(skill.name)}
            className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Copy size={15} />
            复制名称
          </button>
          {skill.docs && (
            <a
              href={skill.docs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink size={15} />
              打开文档
            </a>
          )}
        </div>
      </div>

      {(categories.length > 0 || (skill.tags?.length ?? 0) > 0) && (
        <div>
          <p className="mb-2 text-caption font-semibold text-muted-foreground">标签</p>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <span key={`category:${category}`} className="rounded-sm bg-primary-soft px-2 py-1 text-caption text-primary">
                {category}
              </span>
            ))}
            {skill.tags?.map((tag) => (
              <span key={`tag:${tag}`} className="rounded-sm bg-muted px-2 py-1 text-caption text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

export function OtherSkillsView({
  query = '',
  onQuery,
  selectedId = null,
  onSelect,
}: OtherSkillsViewProps) {
  const { isLoading, error, items, total } = useOtherSkills({ query })
  const [translateEnabled] = useState(() => isTranslateDisplayEnabled())
  const [tabMode, setTabMode] = useState<'zh' | 'raw'>(translateEnabled ? 'zh' : 'raw')
  const [descZh, setDescZh] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)

  const categoryOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const skill of items) {
      const categories = categoriesOf(skill)
      if (categories.length === 0) {
        counts.set('未分类', (counts.get('未分类') ?? 0) + 1)
        continue
      }
      for (const category of categories) {
        counts.set(category, (counts.get(category) ?? 0) + 1)
      }
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])
  }, [items])

  useEffect(() => {
    if (categoryFilter && !categoryOptions.some(([category]) => category === categoryFilter)) {
      setCategoryFilter(null)
    }
  }, [categoryFilter, categoryOptions])

  const visibleItems = useMemo(() => {
    if (!categoryFilter) return items
    return items.filter((skill) => {
      const categories = categoriesOf(skill)
      if (categoryFilter === '未分类') return categories.length === 0
      return categories.includes(categoryFilter)
    })
  }, [categoryFilter, items])

  const selectedSkill = useMemo(
    () => visibleItems.find((skill) => skill.id === selectedId) ?? visibleItems[0] ?? null,
    [selectedId, visibleItems],
  )

  useEffect(() => {
    setDescZh('')
    setTabMode(translateEnabled ? 'zh' : 'raw')
    if (!selectedSkill?.description || !translateEnabled) return

    let alive = true
    translateText(selectedSkill.description)
      .then((res) => {
        if (alive && res.ok && res.result && res.result !== selectedSkill.description) {
          setDescZh(res.result)
        }
      })
      .catch(() => {
        // 翻译失败时继续展示原文。
      })

    return () => {
      alive = false
    }
  }, [selectedSkill?.id, selectedSkill?.description, translateEnabled])

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-md border border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h1 className="text-h4 font-semibold text-foreground">其它技能</h1>
            <p className="mt-1 text-body-sm text-muted-foreground">
              共 {visibleItems.length} 项，来自外部技能目录、项目 runbook 与 MCP 配置。
            </p>
          </div>
          <div className="relative w-full xl:w-[420px]">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="search"
              placeholder="搜索其它技能、品牌或标签…"
              value={query}
              onChange={(event) => onQuery?.(event.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-body-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="mr-1 inline-flex items-center gap-1 text-caption text-muted-foreground">
            <SlidersHorizontal size={13} />
            分类
          </span>
          <button
            type="button"
            onClick={() => setCategoryFilter(null)}
            className={cn(
              'rounded-full px-2.5 py-1 text-caption transition-colors',
              categoryFilter === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground',
            )}
          >
            全部
          </button>
          {categoryOptions.map(([category, count]) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategoryFilter(category)}
              className={cn(
                'rounded-full px-2.5 py-1 text-caption transition-colors',
                categoryFilter === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {category} {count}
            </button>
          ))}
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[340px_minmax(0,1fr)_300px]">
        <section className="min-h-0 overflow-y-auto rounded-md border border-border bg-card">
          {isLoading ? (
            <div className="flex min-h-48 items-center justify-center text-body-sm text-muted-foreground">
              加载中…
            </div>
          ) : error ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center text-body-sm text-destructive">
              <AlertCircle size={22} />
              <p>加载失败：{error.message}</p>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center gap-2 px-4 text-center text-body-sm text-muted-foreground">
              <FileText size={22} />
              <p>{total === 0 ? '暂无其它技能' : '没有匹配的其它技能'}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {visibleItems.map((skill) => {
                const selected = selectedSkill?.id === skill.id
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => onSelect?.(skill.id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex w-full items-start gap-3 px-3 py-3 text-left transition-colors',
                      selected
                        ? 'bg-primary-soft text-primary'
                        : 'bg-card text-foreground hover:bg-muted/70',
                    )}
                  >
                    <SkillIcon skill={skill} size={24} />
                    <span className="min-w-0 flex-1">
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate text-body-sm font-semibold">{titleOf(skill)}</span>
                        {skill.brand && (
                          <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground">
                            {skill.brand}
                          </span>
                        )}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-caption text-muted-foreground">
                        {skill.description || '无描述'}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        <span className="rounded-sm bg-primary-soft px-1.5 py-0.5 text-caption text-primary">
                          {primaryCategory(skill)}
                        </span>
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground">
                          {skill.source || '未知来源'}
                        </span>
                        <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground">
                          {formatUpdatedAt(skill.updatedAt)}
                        </span>
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </section>

        <section className="min-h-0 overflow-y-auto">
          {selectedSkill ? (
            <article className="detail flex min-h-full flex-col gap-5">
              <header className="border-b border-border pb-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <SkillIcon skill={selectedSkill} size={40} />
                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h2 className="truncate text-h3 font-semibold text-foreground">{titleOf(selectedSkill)}</h2>
                        <span className="rounded-sm bg-primary-soft px-2 py-1 text-caption text-primary">
                          {primaryCategory(selectedSkill)}
                        </span>
                      </div>
                      <p className="mt-1 break-words font-mono text-caption text-muted-foreground">
                        {selectedSkill.name}
                      </p>
                    </div>
                  </div>
                  {selectedSkill.docs && (
                    <a
                      href={selectedSkill.docs}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ExternalLink size={15} />
                      文档
                    </a>
                  )}
                </div>
              </header>

              <section>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-body font-semibold text-foreground">说明</h3>
                  {translateEnabled && selectedSkill.description && (
                    <div className="inline-flex rounded-md bg-muted p-1 text-caption">
                      <button
                        type="button"
                        onClick={() => setTabMode('zh')}
                        className={cn(
                          'rounded-sm px-3 py-1 transition-colors',
                          tabMode === 'zh' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
                        )}
                      >
                        中文
                      </button>
                      <button
                        type="button"
                        onClick={() => setTabMode('raw')}
                        className={cn(
                          'rounded-sm px-3 py-1 transition-colors',
                          tabMode === 'raw' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
                        )}
                      >
                        原文
                      </button>
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-body-sm leading-relaxed text-muted-foreground">
                  {selectedSkill.description
                    ? tabMode === 'zh' && descZh
                      ? descZh
                      : selectedSkill.description
                    : '该技能暂未提供说明。'}
                </p>
              </section>

              {selectedSkill.examples && selectedSkill.examples.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2 text-body font-semibold text-foreground">
                    <Code size={16} />
                    示例
                  </div>
                  <div className="space-y-2">
                    {selectedSkill.examples.map((example) => (
                      <pre
                        key={example}
                        className="overflow-x-auto rounded-md border border-border bg-background px-3 py-2 font-mono text-caption text-foreground"
                      >
                        $ {example}
                      </pre>
                    ))}
                  </div>
                </section>
              )}

              {selectedSkill.links && selectedSkill.links.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2 text-body font-semibold text-foreground">
                    <ExternalLink size={16} />
                    相关链接
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {selectedSkill.links.map((link) => (
                      <a
                        key={`${link.label}:${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 rounded-md border border-border bg-background px-3 py-2 transition-colors hover:border-primary"
                      >
                        <span className="block truncate text-body-sm font-medium text-foreground">{link.label}</span>
                        <span className="mt-0.5 block truncate text-caption text-muted-foreground">{linkHost(link.url)}</span>
                      </a>
                    ))}
                  </div>
                </section>
              )}

              {selectedSkill.tags && selectedSkill.tags.length > 0 && (
                <section>
                  <div className="mb-3 flex items-center gap-2 text-body font-semibold text-foreground">
                    <Tag size={16} />
                    标签
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedSkill.tags.map((tag) => (
                      <span key={tag} className="rounded-sm bg-muted px-2 py-1 text-caption text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {selectedSkill.parseError && (
                <section className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-3 text-body-sm text-destructive">
                  <p className="font-medium">解析错误</p>
                  <p className="mt-1 break-words text-caption">{selectedSkill.parseError}</p>
                </section>
              )}
            </article>
          ) : (
            <div className="detail flex min-h-48 items-center justify-center text-muted-foreground">
              <p className="text-body-sm">选择一项其它技能查看详情</p>
            </div>
          )}
        </section>

        <section className="hidden min-h-0 2xl:block">
          {selectedSkill ? <OtherSkillContextPanel skill={selectedSkill} /> : null}
        </section>
      </div>
    </div>
  )
}
