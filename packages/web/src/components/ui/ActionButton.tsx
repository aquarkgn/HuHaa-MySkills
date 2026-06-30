import { useState } from 'react'
import { cn } from '@/lib/cn'

interface ActionButtonProps {
  label: string
  /** 返回 {ok} 的异步动作（copy/open）；ok=false 或抛错都显示失败 */
  onAction: () => Promise<{ ok: boolean; error?: string }>
}

type Status = 'idle' | 'ok' | 'err'

/** 执行一次性动作并短暂反馈结果（用于复制/打开）。 */
export function ActionButton({ label, onAction }: ActionButtonProps) {
  const [status, setStatus] = useState<Status>('idle')
  const [busy, setBusy] = useState(false)

  async function run() {
    setBusy(true)
    try {
      const r = await onAction()
      setStatus(r.ok ? 'ok' : 'err')
    } catch {
      setStatus('err')
    } finally {
      setBusy(false)
      setTimeout(() => setStatus('idle'), 1400)
    }
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={busy}
      className={cn(
        'rounded-md border px-2.5 py-1 text-caption transition-colors disabled:opacity-60',
        status === 'ok'
          ? 'border-primary bg-primary-soft text-primary'
          : status === 'err'
            ? 'border-destructive text-destructive'
            : 'border-border bg-card text-muted-foreground hover:text-foreground'
      )}
    >
      {status === 'ok' ? '✓ ' : status === 'err' ? '✗ ' : ''}
      {label}
    </button>
  )
}
