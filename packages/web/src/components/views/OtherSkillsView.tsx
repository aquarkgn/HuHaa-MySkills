import { useState } from 'react'
import { Search, ExternalLink } from 'lucide-react'
import { useOtherSkills } from '@/hooks/useOtherSkills'
import { cn } from '@/lib/cn'

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
  const groups = useOtherSkills(query)
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(groups.map((g) => g.category))
  )

  const toggleExpand = (category: string) => {
    const next = new Set(expanded)
    if (next.has(category)) {
      next.delete(category)
    } else {
      next.add(category)
    }
    setExpanded(next)
  }

  const selectedSkill = selectedId
    ? groups
        .flatMap((g) => g.items)
        .find((skill) => skill.id === selectedId)
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
          {groups.length === 0 ? (
            <p className="text-center text-body-sm text-muted-foreground">无结果</p>
          ) : (
            groups.map((group) => (
              <div key={group.category}>
                <button
                  onClick={() => toggleExpand(group.category)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-body-sm font-medium transition-colors',
                    'hover:bg-muted'
                  )}
                >
                  <span>{group.icon}</span>
                  <span className="flex-1 text-left">{group.label}</span>
                  <span className="text-caption text-muted-foreground">
                    {group.items.length}
                  </span>
                </button>

                {expanded.has(group.category) && (
                  <div className="space-y-1 pl-6">
                    {group.items.map((skill) => (
                      <button
                        key={skill.id}
                        onClick={() => onSelect?.(skill.id)}
                        className={cn(
                          'w-full text-left rounded-md px-3 py-2 text-body-sm transition-colors',
                          selectedId === skill.id
                            ? 'bg-primary-soft text-primary'
                            : 'text-foreground hover:bg-muted'
                        )}
                      >
                        {skill.name}
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
          <div>
            <h2 className="text-heading-md">{selectedSkill.name}</h2>
            <p className="mt-2 text-body-sm text-muted-foreground">{selectedSkill.description}</p>
          </div>

          {selectedSkill.tags.length > 0 && (
            <div>
              <p className="text-caption font-medium mb-2">标签</p>
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

          {selectedSkill.docs && (
            <div>
              <a
                href={selectedSkill.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-body-sm text-primary hover:underline"
              >
                文档 <ExternalLink size={14} />
              </a>
            </div>
          )}

          {selectedSkill.examples && selectedSkill.examples.length > 0 && (
            <div>
              <p className="text-caption font-medium mb-2">示例</p>
              <ul className="space-y-1">
                {selectedSkill.examples.map((example, i) => (
                  <li key={i} className="text-body-sm font-mono text-muted-foreground">
                    $ {example}
                  </li>
                ))}
              </ul>
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
