interface FooterProps {
  repoUrl: string
}

/** 页脚：仓库入口、许可证、本地优先声明 */
export function Footer({ repoUrl }: FooterProps) {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-8 text-body-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block h-5 w-5 rounded-sm bg-primary" aria-hidden />
          <span>呼哈哈-技能助手 · 本地 AI 工作流能力中枢</span>
        </div>
        <div className="flex items-center gap-4">
          <a href={repoUrl} target="_blank" rel="noreferrer" className="hover:text-foreground">
            GitHub
          </a>
          <a
            href="https://www.npmjs.com/package/skillshelper"
            target="_blank"
            rel="noreferrer"
            className="hover:text-foreground"
          >
            npm
          </a>
          <span>MIT License</span>
        </div>
      </div>
    </footer>
  )
}
