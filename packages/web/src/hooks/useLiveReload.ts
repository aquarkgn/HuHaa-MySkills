import { useEffect } from 'react'

/**
 * 订阅后端 /api/events(SSE)，在文件变更触发 reload-done 时静默刷新数据。
 * EventSource 默认自动重连；组件卸载时关闭连接。
 *
 * onReload 必须稳定（用 useCallback 包裹），否则每次渲染都会重订阅。
 */
export function useLiveReload(onReload: () => void) {
  useEffect(() => {
    if (typeof EventSource === 'undefined') return
    const es = new EventSource('/api/events')
    const handler = () => onReload()
    es.addEventListener('reload-done', handler)
    return () => {
      es.removeEventListener('reload-done', handler)
      es.close()
    }
  }, [onReload])
}
