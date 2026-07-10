interface Stat {
  value: string
  label: string
}

// 版本号来自 package.json（真实可查）。
const STATS: Stat[] = [
  { value: '多来源', label: '技能、插件与配置统一索引' },
  { value: '三级分类', label: '来源结构一眼可见' },
  { value: '本地缓存', label: '翻译和图标避免重复处理' },
  { value: 'v0.3.9', label: '已发布 npm · MIT' },
]

/** 可信度区：只使用代码与已发布版本可复核的事实。 */
export function Credibility() {
  return (
    <section id="credibility" className="bg-muted/30">
      <div className="section">
        <div className="mb-10 text-center">
          <h2 className="text-h2 font-bold">为了可控，而不是为了更复杂</h2>
          <p className="mt-2 text-body text-muted-foreground">
            文件扫描保持只读，MCP 配置展示前脱敏；每一项价值都能在本地运行中复核。
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-lg border border-border bg-card p-6 text-center"
              style={{ boxShadow: '0 1px 2px hsl(var(--color-foreground) / 0.04)' }}
            >
              <div className="text-h4 font-bold text-primary">{s.value}</div>
              <div className="mt-1 text-caption text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
