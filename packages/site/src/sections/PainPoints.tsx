interface Pain {
  tag: string
  title: string
  desc: string
}

const PAINS: Pain[] = [
  {
    tag: '痛点一',
    title: '能力散落在不同工具里，找不到也管不住',
    desc: '技能目录、插件、MCP 配置和项目说明各有入口。装了什么、来自哪里、是否重复，全靠记忆与翻目录。',
  },
  {
    tag: '痛点二',
    title: '知道文件存在，却看不懂也无法判断该不该用',
    desc: '说明常是英文且分散在原始文件中。整页机翻又会误伤命令和代码，结果是信息很多、决策很慢。',
  },
]

/** 痛点区：两类核心痛点--散落无整理、英文看不懂 */
export function PainPoints() {
  return (
    <section className="border-b border-border">
      <div className="section">
        <div className="mb-10 text-center">
          <h2 className="text-h2 font-bold">AI 工作流失控，往往从“散”开始</h2>
          <p className="mt-2 text-body text-muted-foreground">
            SkillsHelper 先让能力资产可见，再让它们变得可用。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {PAINS.map((p) => (
            <div key={p.title} className="card-elevated">
              <span className="text-caption font-medium text-primary">{p.tag}</span>
              <h3 className="mt-2 text-h4 font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-body-sm text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
