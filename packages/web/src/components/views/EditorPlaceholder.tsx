import { Code2, Sparkles } from 'lucide-react'

/**
 * 编辑器模块占位页：tab 与侧栏已经走通，真实编辑器尚未实现。
 * 保持「待开发」状态，避免误以为已发布能力。
 */
export function EditorPlaceholder() {
  return (
    <div className="grid h-full place-items-center">
      <div className="detail mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-primary-soft text-primary">
          <Code2 size={22} />
        </div>
        <p className="text-h4 text-foreground">编辑器</p>
        <p className="mt-2 text-body-sm text-muted-foreground">
          此模块将聚合编辑器与 AI 辅助能力，当前版本尚未实现。
        </p>
        <div className="mt-5 inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-caption text-muted-foreground">
          <Sparkles size={12} />
          待开发
        </div>
      </div>
    </div>
  )
}
