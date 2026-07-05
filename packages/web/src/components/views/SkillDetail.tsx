import { useEffect, useRef, useState } from 'react'
import { ActionButton } from '@/components/ui/ActionButton'
import {
  copy,
  open,
  fetchSkillDetail,
  fetchTranslatedRaw,
  translateText,
  type TranslateSegment,
  type TranslateProgress,
} from '@/lib/api'
import { renderMarkdown } from '@/lib/markdown'
import { itemEditorKey } from '@/lib/editors'
import { kindLabel, isTranslateDisplayEnabled } from '@/lib/i18n'
import { cn } from '@/lib/cn'
import type { SkillItem } from '@/types'

interface SkillDetailProps {
  item: SkillItem
}

type RawStatus = 'loading' | 'ready' | 'error'
type TranslateStatus = 'idle' | 'loading' | 'ready' | 'error'
type TabMode = 'zh' | 'raw'

export function SkillDetail({ item }: SkillDetailProps) {
  const [raw, setRaw] = useState<string>('')
  const [status, setStatus] = useState<RawStatus>('loading')
  const [translateEnabled] = useState(() => isTranslateDisplayEnabled())
  const [tabMode, setTabMode] = useState<TabMode>(translateEnabled ? 'zh' : 'raw')
  const [segments, setSegments] = useState<TranslateSegment[] | null>(null)
  const [translateStatus, setTranslateStatus] = useState<TranslateStatus>('idle')
  const [translateProgress, setTranslateProgress] = useState<TranslateProgress | null>(null)
  const [descZh, setDescZh] = useState<string>('')
  const [nameZh, setNameZh] = useState<string>('')
  // 标记每个 item 的正文译文是否已发起请求，避免 setTranslateStatus 触发重渲染时重复请求
  const fetchedRawFor = useRef<string | null>(null)
  // 切换技能时取消未完成的翻译请求，避免旧译文覆盖新技能状态、旧请求占用连接池
  const translateAbortRef = useRef<AbortController | null>(null)

  // 拉取原文 raw + 按需翻译 description / name
  useEffect(() => {
    let alive = true
    setStatus('loading')
    setRaw('')
    setDescZh('')
    setNameZh('')
    fetchSkillDetail(item.id)
      .then(async (detail) => {
        if (!alive) return
        setRaw(detail.raw ?? '')
        setStatus('ready')

        if (!translateEnabled) return

        // 名称译名（标题后括号展示）
        const nameSrc = detail.title || detail.name
        if (nameSrc) {
          translateText(nameSrc)
            .then((res) => {
              if (alive && res.ok && res.result && res.result !== nameSrc) {
                setNameZh(res.result)
              }
            })
            .catch(() => {
              // 译名失败不影响展示
            })
        }

        // 描述译文（后端已填充则跳过）
        if (detail.description && !detail.i18n?.zh?.description) {
          try {
            const res = await translateText(detail.description)
            if (alive && res.ok && res.result && res.result !== detail.description) {
              setDescZh(res.result)
            }
          } catch {
            // 描述翻译失败回退原文
          }
        }
      })
      .catch(() => {
        if (alive) setStatus('error')
      })
    return () => {
      alive = false
    }
  }, [item.id, translateEnabled])

  // 切换 item 时重置翻译状态并取消未完成翻译
  useEffect(() => {
    if (translateAbortRef.current) {
      translateAbortRef.current.abort()
      translateAbortRef.current = null
    }
    setSegments(null)
    setTranslateStatus('idle')
    setTranslateProgress(null)
    setTabMode(translateEnabled ? 'zh' : 'raw')
  }, [item.id, translateEnabled])

  // tab='zh' 且原文就绪时拉取段落译文（每个 item 仅一次）。
  // 用 ref 跟踪请求，不依赖 translateStatus/segments，避免 setTranslateStatus
  // 触发重渲染时清理函数把 alive 设为 false 导致 .then 丢失结果。
  // AbortController：切换技能 / 切换 tab 时取消未完成请求，避免连接占用。
  //
  // 注意：fetchedRawFor.current 必须在 .then 成功回调里设置，不能在调用
  // fetchTranslatedRaw 之前设置。切换技能时本 effect 会因旧 status/raw
  // （仍为上一个技能的 'ready' / 旧 raw）先跑一次，发起的请求随即被
  // cleanup 的 ac.abort() 取消。若提前标记 fetchedRawFor.current=item.id，
  // 等 fetchSkillDetail 完成、status/raw 更新为新技能后，本 effect 会因
  // fetchedRawFor.current===item.id 而 early return，翻译永远不发起，
  // 界面卡在"翻译中"。移到 .then 后，被取消的请求不会写标记，新技能的
  // 翻译请求能正常发起。
  useEffect(() => {
    if (tabMode !== 'zh') return
    if (status !== 'ready' || !raw.trim()) return
    if (fetchedRawFor.current === item.id) return
    const ac = new AbortController()
    translateAbortRef.current = ac
    let alive = true
    setTranslateStatus('loading')
    setTranslateProgress(null)
    fetchTranslatedRaw(item.id, {
      signal: ac.signal,
      onProgress: (p) => {
        if (alive) setTranslateProgress(p)
      },
    })
      .then((res) => {
        if (!alive) return
        setSegments(res.segments || [])
        setTranslateStatus('ready')
        setTranslateProgress(null)
        fetchedRawFor.current = item.id
      })
      .catch((e: unknown) => {
        if (!alive) return
        // AbortError 是切换技能时的正常取消，不显示错误
        if (e instanceof Error && e.name === 'AbortError') return
        setTranslateStatus('error')
      })
    return () => {
      alive = false
      ac.abort()
    }
  }, [tabMode, status, raw, item.id])

  const translatedText = segments?.map((s) => s.translated).join('\n\n') ?? ''
  const showTab = translateEnabled && status === 'ready' && raw.trim().length > 0
  const descZhFinal = item.i18n?.zh?.description || descZh || ''
  const nameSrc = item.title || item.name
  const nameZhFinal = item.i18n?.zh?.name || nameZh || ''
  const showNameZh = nameZhFinal && nameZhFinal !== nameSrc

  // 正文渲染：翻译 loading / error / 空译文时兜底显示原文，就绪后替换为译文
  const renderBody = () => {
    if (tabMode === 'raw') {
      return (
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(raw) }}
        />
      )
    }
    // tabMode === 'zh'
    const useTranslated =
      translateStatus === 'ready' && translatedText.trim().length > 0
    return (
      <>
        {translateStatus === 'loading' && (
          <p className="mb-2 text-caption text-muted-foreground">
            {translateProgress
              ? `翻译中（${translateProgress.done}/${translateProgress.total} 段）…`
              : '翻译中，先显示原文…'}
          </p>
        )}
        {translateStatus === 'error' && (
          <p className="mb-2 text-caption text-destructive">翻译失败，显示原文</p>
        )}
        <div
          className="markdown-body"
          dangerouslySetInnerHTML={{
            __html: renderMarkdown(useTranslated ? translatedText : raw),
          }}
        />
      </>
    )
  }

  return (
    <div className="detail">
      <h2 className="text-h3 text-foreground">
        {nameSrc}
        {showNameZh && (
          <span className="ml-2 text-body-sm font-normal text-muted-foreground">
            （{nameZhFinal}）
          </span>
        )}
      </h2>
      <p className="mt-2 text-body-sm text-muted-foreground">
        {tabMode === 'zh' && descZhFinal ? descZhFinal : item.description || '（无描述）'}
      </p>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body-sm">
        <dt className="text-muted-foreground">类型</dt>
        <dd>{kindLabel(item.kind)}</dd>
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

      {/* 正文（markdown 渲染）+ 中文/原文 tab 切换 */}
      <div className="mt-6 border-t border-border pt-5">
        {status === 'loading' && (
          <p className="text-body-sm text-muted-foreground">加载正文…</p>
        )}
        {status === 'error' && (
          <p className="text-body-sm text-destructive">正文加载失败</p>
        )}
        {status === 'ready' && !raw.trim() && (
          <p className="text-body-sm text-muted-foreground">（无正文内容）</p>
        )}
        {status === 'ready' && raw.trim() && (
          <>
            {showTab && (
              <div className="mb-3 inline-flex rounded-md bg-muted p-1 text-body-sm">
                <button
                  onClick={() => setTabMode('zh')}
                  className={cn(
                    'rounded-sm px-3 py-1 transition-colors',
                    tabMode === 'zh' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  中文
                </button>
                <button
                  onClick={() => setTabMode('raw')}
                  className={cn(
                    'rounded-sm px-3 py-1 transition-colors',
                    tabMode === 'raw' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground',
                  )}
                >
                  原文
                </button>
              </div>
            )}
            {renderBody()}
          </>
        )}
      </div>
    </div>
  )
}
