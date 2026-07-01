import { useState } from 'react'
import { Search, ExternalLink, Tag, Code } from 'lucide-react'
import { useOtherSkills, getSkillEmoji, type OtherSkillsOptions } from '@/hooks/useOtherSkills'
import { cn } from '@/lib/cn'
import type { OtherSkill } from '@/types/other-skill'

/**
 * 技能图标 —— 优先展示真实应用图标 (iconUrl)，加载失败回退 emoji。
 * 对标 Pearcleaner 的真实应用图标展示。
 */
function SkillIcon({ skill, size = 20 }: { skill: OtherSkill; size?: number }) {
  const [failed, setFailed] = useState(false)
  const emoji = getSkillEmoji(skill)

  if (skill.iconUrl && !failed) {
    return (
      <img
        src={skill.iconUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFailed(true)}
        className="rounded-[4px] object-contain shrink-0"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="inline-flex items-center justify-center shrink-0"
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

export function OtherSkillsView({
  query = '',
  onQuery,
  selectedId = null,
  onSelect,
}: OtherSkillsViewProps) {
  const options: OtherSkillsOptions = {
    query,
  }

  const { groups, isLoading, error, items } = useOtherSkills(options)
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(groups.map((g) => g.groupKey))
  )

  const toggleExpand = (groupKey: string) => {
    const next = new Set(expanded)
    if (next.has(groupKey)) {
      next.delete(groupKey)
    } else {
      next.add(groupKey)
    }
    setExpanded(next)
  }

  const selectedSkill: OtherSkill | null = selectedId
    ? items.find((skill) => skill.id === selectedId) ?? null
    : null

  return (
    <div className="flex h-full gap-4 p-4">
      {/* 左侧：列表 */}
      <div className="flex w-full flex-col gap-4 sm:w-1/3">
        {/* 搜索框 */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="搜索其它技能…"
            value={query}
            onChange={(e) => onQuery?.(e.target.value)}
            className="w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* 分类列表 */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {isLoading ? (
            <p className="text-center text-body-sm text-muted-foreground">加载中…</p>
          ) : error ? (
            <p className="text-center text-body-sm text-destructive">加载失败</p>
          ) : groups.length === 0 ? (
            <p className="text-center text-body-sm text-muted-foreground">无结果</p>
          ) : (
            groups.map((group) => (
              <div key={group.groupKey}>
                <button
                  onClick={() => toggleExpand(group.groupKey)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-body-sm font-medium transition-colors',
                    'hover:bg-muted'
                  )}
                >
                  <span>{group.icon}</span>
                  <span className="flex-1 text-left">{group.label}</span>
                  <span className="text-caption text-muted-foreground">
                    {group.count}
                  </span>
                </button>

                {expanded.has(group.groupKey) && (
                  <div className="space-y-1 pl-6">
                    {group.items.map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => onSelect?.(skill.id)}
                        className={cn(
                          'flex w-full items-start gap-2 text-left rounded-md px-3 py-2 text-body-sm transition-colors',
                          selectedId === skill.id
                            ? 'bg-primary-soft text-primary'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        <SkillIcon skill={skill} size={20} />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">{skill.title || skill.name}</div>
                          {skill.description && (
                            <div className="text-caption text-muted-foreground truncate">
                              {skill.description}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* 右侧：详情 */}
      {selectedSkill ? (
        <div className="hidden w-2/3 flex-col gap-4 overflow-y-auto rounded-md border border-input bg-muted/30 p-4 sm:flex">
          {/* 标题和描述 */}
          <div>
            <div className="flex items-center gap-3">
              <SkillIcon skill={selectedSkill} size={32} />
              <h2 className="text-heading-md">{selectedSkill.title || selectedSkill.name}</h2>
            </div>
            {selectedSkill.description && (
              <p className="mt-2 text-body-sm text-muted-foreground">
                {selectedSkill.description}
              </p>
            )}
          </div>

          {/* Frontmatter 元数据 */}
          <div className="border-t border-border pt-4">
            <h3 className="text-caption font-semibold mb-3">元数据</h3>
            <dl className="space-y-2 text-body-sm">
              {/* 名称 */}
              <div className="flex gap-4">
                <dt className="text-muted-foreground font-medium min-w-24">名称</dt>
                <dd className="font-mono">{selectedSkill.name}</dd>
              </div>

              {/* 品牌 */}
              {selectedSkill.brand && (
                <div className="flex gap-4">
                  <dt className="text-muted-foreground font-medium min-w-24">品牌</dt>
                  <dd className="font-mono">{selectedSkill.brand}</dd>
                </div>
              )}

              {/* 来源 */}
              {selectedSkill.source && (
                <div className="flex gap-4">
                  <dt className="text-muted-foreground font-medium min-w-24">来源</dt>
                  <dd className="font-mono">{selectedSkill.source}</dd>
                </div>
              )}

              {/* 分类 */}
              {selectedSkill.category && (
                <div className="flex gap-4">
                  <dt className="text-muted-foreground font-medium min-w-24">分类</dt>
                  <dd>
                    {Array.isArray(selectedSkill.category)
                      ? selectedSkill.category.join(', ')
                      : selectedSkill.category}
                  </dd>
                </div>
              )}

              {/* 更新时间 */}
              {selectedSkill.updatedAt && (
                <div className="flex gap-4">
                  <dt className="text-muted-foreground font-medium min-w-24">更新于</dt>
                  <dd className="font-mono text-caption">
                    {new Date(selectedSkill.updatedAt).toLocaleString('zh-CN')}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* 标签 */}
          {selectedSkill.tags && selectedSkill.tags.length > 0 && (
            <div>
              <p className="text-caption font-medium mb-2 flex items-center gap-2">
                <Tag size={14} />
                标签
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedSkill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block rounded-full bg-primary/10 px-2.5 py-1 text-caption text-primary"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 文档链接 */}
          {selectedSkill.docs && (
            <div>
              <a
                href={selectedSkill.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-body-sm text-primary hover:underline"
              >
                <ExternalLink size={14} />
                文档
              </a>
            </div>
          )}

          {/* 相关链接 */}
          {selectedSkill.links && selectedSkill.links.length > 0 && (
            <div>
              <p className="text-caption font-medium mb-2">相关链接</p>
              <ul className="space-y-1">
                {selectedSkill.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-body-sm text-primary hover:underline"
                    >
                      <ExternalLink size={14} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 使用示例 */}
          {selectedSkill.examples && selectedSkill.examples.length > 0 && (
            <div>
              <p className="text-caption font-medium mb-2 flex items-center gap-2">
                <Code size={14} />
                示例
              </p>
              <ul className="space-y-1">
                {selectedSkill.examples.map((example, i) => (
                  <li key={i} className="text-body-sm font-mono text-muted-foreground bg-background rounded px-2 py-1">
                    $ {example}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 解析错误提示 */}
          {selectedSkill.parseError && (
            <div className="text-body-sm text-destructive bg-destructive/10 rounded px-3 py-2">
              <p className="font-medium">⚠️ 解析错误</p>
              <p className="text-caption mt-1">{selectedSkill.parseError}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="hidden w-2/3 items-center justify-center rounded-md border border-input bg-muted/30 sm:flex">
          <p className="text-body-sm text-muted-foreground">选择一个技能查看详情</p>
        </div>
      )}
    </div>
  )
}
