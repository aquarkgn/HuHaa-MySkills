import { useMemo } from 'react'
import Fuse from 'fuse.js'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SkillDetail } from './SkillDetail'
import { cn } from '@/lib/cn'
import { isNoneEditor, itemEditorKey } from '@/lib/editors'
import type { SkillItem } from '@/types'

interface SkillsViewProps {
  items: SkillItem[]
  editorFilter: string | null
  query: string
  onQuery: (q: string) => void
  kindFilter: string | null
  onKind: (k: string | null) => void
  selectedId: string | null
  onSelect: (id: string) => void
}

/** 单条目的 editor 归属 key，与 server buildStats 口径一致。 */
export { itemEditorKey }

export function SkillsView({
  items,
  editorFilter,
  query,
  onQuery,
  kindFilter,
  onKind,
  selectedId,
  onSelect,
}: SkillsViewProps) {
  // 1) editor 过滤
  const byEditor = useMemo(() => {
    if (editorFilter === null) return items
    if (isNoneEditor(editorFilter)) return items.filter((it) => isNoneEditor(itemEditorKey(it)))
    return items.filter((it) => itemEditorKey(it) === editorFilter)
  }, [items, editorFilter])

  // 2) kind chips 选项（来自当前 editor 子集）
  const kinds = useMemo(() => {
    const m = new Map<string, number>()
    for (const it of byEditor) m.set(it.kind, (m.get(it.kind) ?? 0) + 1)
    return [...m.entries()].sort((a, b) => b[1] - a[1])
  }, [byEditor])

  // 3) Fuse 搜索（在 editor 子集上）
  const fuse = useMemo(
    () =>
      new Fuse(byEditor, {
        keys: ['name', 'title', 'description', 'category', 'brand', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [byEditor]
  )

  const filtered = useMemo(() => {
    let list = query.trim() ? fuse.search(query).map((r) => r.item) : byEditor
    if (kindFilter) list = list.filter((it) => it.kind === kindFilter)
    return list
  }, [byEditor, fuse, query, kindFilter])

  const selected = useMemo(
    () => filtered.find((it) => it.id === selectedId) ?? null,
    [filtered, selectedId]
  )

  return (
    <div className="flex h-full flex-col gap-4">
      {/* 搜索栏 */}
      <input
        type="search"
        value={query}
        onChange={(e) => onQuery(e.target.value)}
        placeholder="搜索技能、插件、MCP…"
        className="h-10 w-full rounded-md border border-border bg-input px-3 text-body-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />

      {/* kind 次筛选 chips */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onKind(null)}
          className={cn(
            'rounded-full px-2.5 py-0.5 text-caption transition-colors',
            kindFilter === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          全部
        </button>
        {kinds.map(([k, c]) => (
          <button
            key={k}
            onClick={() => onKind(k)}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-caption transition-colors',
              kindFilter === k
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {k} {c}
          </button>
        ))}
      </div>

      {/* 列表 + 详情 */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <section className="flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
          <p className="text-caption text-muted-foreground">共 {filtered.length} 项</p>
          {filtered.length === 0 && (
            <p className="text-body-sm text-muted-foreground">没有匹配的条目</p>
          )}
          {filtered.map((it) => (
            <button key={it.id} onClick={() => onSelect(it.id)} className="text-left">
              <Card
                className={cn(
                  'cursor-pointer transition-colors hover:border-primary',
                  it.id === selectedId ? 'border-primary bg-primary-soft' : ''
                )}
              >
                <CardHeader>
                  <CardTitle>{it.title || it.name}</CardTitle>
                  <CardDescription>
                    {it.description || it.preview || '（无描述）'}
                  </CardDescription>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground">
                      {it.kind}
                    </span>
                    <span className="rounded-sm bg-muted px-1.5 py-0.5 text-caption text-muted-foreground">
                      {itemEditorKey(it)}
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </button>
          ))}
        </section>

        <section className="min-h-0 overflow-y-auto">
          {selected ? (
            <SkillDetail item={selected} />
          ) : (
            <div className="detail text-muted-foreground">
              <p className="text-body-sm">从左侧选择一项查看详情</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
