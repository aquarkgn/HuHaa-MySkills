import { useEffect, useMemo, useState } from 'react'
import Fuse from 'fuse.js'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { fetchSkills, fetchStats, reload } from '@/lib/api'
import type { SkillItem, Stats } from '@/types'

export default function App() {
  const [items, setItems] = useState<SkillItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloading, setReloading] = useState(false)

  const [query, setQuery] = useState('')
  const [activeKind, setActiveKind] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [skills, s] = await Promise.all([fetchSkills(), fetchStats()])
      setItems(skills)
      setStats(s)
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleReload() {
    setReloading(true)
    try {
      await reload()
      await load()
    } finally {
      setReloading(false)
    }
  }

  // Fuse.js 模糊搜索索引
  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: ['name', 'title', 'description', 'category', 'brand', 'tags'],
        threshold: 0.4,
        ignoreLocation: true,
      }),
    [items]
  )

  const filtered = useMemo(() => {
    let list = query.trim() ? fuse.search(query).map((r) => r.item) : items
    if (activeKind) list = list.filter((it) => it.kind === activeKind)
    return list
  }, [items, fuse, query, activeKind])

  const selected = useMemo(
    () => filtered.find((it) => it.id === selectedId) ?? null,
    [filtered, selectedId]
  )

  return (
    <div className="app-shell">
      <Sidebar stats={stats} activeKind={activeKind} onSelectKind={setActiveKind} />
      <Topbar
        query={query}
        onQueryChange={setQuery}
        onReload={handleReload}
        reloading={reloading}
      />

      <main className="main-pane">
        {loading && <p className="text-body-sm text-muted-foreground">加载中…</p>}
        {error && (
          <div className="detail border-destructive">
            <p className="text-body-sm text-destructive">加载失败：{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-[1fr_1.2fr] gap-6">
            {/* 列表 */}
            <section className="flex flex-col gap-3">
              <p className="text-caption text-muted-foreground">
                共 {filtered.length} 项
              </p>
              {filtered.length === 0 && (
                <p className="text-body-sm text-muted-foreground">没有匹配的条目</p>
              )}
              {filtered.map((it) => (
                <Card
                  key={it.id}
                  onClick={() => setSelectedId(it.id)}
                  className={
                    'cursor-pointer transition-colors hover:border-primary ' +
                    (it.id === selectedId ? 'border-primary' : '')
                  }
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
                      {it.editor && (
                        <span className="rounded-sm bg-accent/15 px-1.5 py-0.5 text-caption text-accent-foreground">
                          {it.editor}
                        </span>
                      )}
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </section>

            {/* 详情 */}
            <section>
              {selected ? (
                <div className="detail">
                  <h2 className="text-h3 text-foreground">
                    {selected.title || selected.name}
                  </h2>
                  <p className="mt-2 text-body-sm text-muted-foreground">
                    {selected.description || '（无描述）'}
                  </p>
                  <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body-sm">
                    <dt className="text-muted-foreground">类型</dt>
                    <dd>{selected.kind}</dd>
                    <dt className="text-muted-foreground">来源</dt>
                    <dd>{selected.source}</dd>
                    <dt className="text-muted-foreground">路径</dt>
                    <dd className="break-all font-mono text-caption">
                      {selected.paths?.abs}
                    </dd>
                  </dl>
                </div>
              ) : (
                <div className="detail text-muted-foreground">
                  <p className="text-body-sm">从左侧选择一项查看详情</p>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
