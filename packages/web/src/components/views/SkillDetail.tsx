import { useEffect, useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import { copy, open, fetchSkillDetail } from '@/lib/api'
import { renderMarkdown } from '@/lib/markdown'
import { itemEditorKey } from '@/lib/editors'
import type { SkillItem } from '@/types'

interface SkillDetailProps {
  item: SkillItem
}

type RawStatus = 'loading' | 'ready' | 'error'

export function SkillDetail({ item }: SkillDetailProps) {
  const [raw, setRaw] = useState<string>('')
  const [status, setStatus] = useState<RawStatus>('loading')

  useEffect(() => {
    let alive = true
    setStatus('loading')
    setRaw('')
    fetchSkillDetail(item.id)
      .then((detail) => {
        if (!alive) return
        setRaw(detail.raw ?? '')
        setStatus('ready')
      })
      .catch(() => {
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [item.id])

  return (
    <div className="detail">
      <h2 className="text-h3 text-foreground">{item.title || item.name}</h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        {item.description || '（无描述）'}
      </p>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body-sm">
        <dt className="text-muted-foreground">类型</dt>
        <dd>{item.kind}</dd>
        <dt className="text-muted-foreground">来源</dt>
        <dd>{itemEditorKey(item)}</dd>
        <dt className="text-muted-foreground">路径</dt>
        <dd className="break-all font-mono text-caption">{item.paths?.abs}</dd>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        <ActionButton label="复制路径" onAction={() => copy(item.id, 'path')} />
        <ActionButton label="复制名称" onAction={() => copy(item.id, 'name')} />
        <ActionButton label="复制正文" onAction={() => copy(item.id, 'raw')} />
        <ActionButton label="复制调用提示" onAction={() => copy(item.id, 'prompt')} />
        <ActionButton label="打开" onAction={() => open(item.id, 'default')} />
        <ActionButton label="在访达显示" onAction={() => open(item.id, 'finder')} />
      </div>

      {/* 正文（markdown 渲染） */}
      <div className="mt-6 border-t border-border pt-5">
        {status === 'loading' && (
          <p className="text-body-sm text-muted-foreground">加载正文…</p>
        )}
        {status === 'error' && (
          <p className="text-body-sm text-destructive">正文加载失败</p>
        )}
        {status === 'ready' &&
          (raw.trim() ? (
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(raw) }}
            />
          ) : (
            <p className="text-body-sm text-muted-foreground">（无正文内容）</p>
          ))}
      </div>
    </div>
  )
}
