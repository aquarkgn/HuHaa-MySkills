interface Feature {
  tag: string
  title: string
  desc: string
}

const FEATURES: Feature[] = [
  {
    tag: '核心',
    title: '扫描多个本地来源，先看清你的能力版图',
    desc: '发现编辑器技能、个人技能库、插件、MCP 配置与项目运行手册；扫描结果经过去重后进入同一份本地索引。',
  },
  {
    tag: '核心',
    title: '按层级、来源和品牌整理，一秒定位',
    desc: '以编辑器工具技能、个人技能库、其它来源构成三级结构，配合搜索、排序、分组和筛选，让查找不再依赖路径记忆。',
  },
  {
    tag: '整理',
    title: '保留原文语境，需要时用中文理解',
    desc: '支持中英对照与本地缓存；中文内容不会重复翻译，代码块与命令保留原样。MCP 配置在展示前会脱敏。',
  },
]

/** 功能区：核心价值点--英文翻译中英对照、识别本机技能、统一搜索筛选 */
export function Features() {
  return (
    <section id="features" className="border-b border-border bg-muted/30">
      <div className="section">
        <div className="mb-10 text-center">
          <h2 className="text-h2 font-bold">从发现到维护，一处完成</h2>
          <p className="mt-2 text-body text-muted-foreground">
            不做又一个聊天壳，只把 AI 工作流中的能力资产管理清楚。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-elevated">
              <span
                className={
                  f.tag === '核心'
                    ? 'inline-block rounded-sm bg-primary px-2 py-0.5 text-caption text-primary-foreground'
                    : 'inline-block rounded-sm bg-muted px-2 py-0.5 text-caption text-muted-foreground'
                }
              >
                {f.tag}
              </span>
              <h3 className="mt-3 text-h4 font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-body-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
