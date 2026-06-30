import type { SkillItem, Stats } from '@/types'

// 生产环境前端与 Fastify 同源（11520）；dev 模式由 vite proxy 转发 /api。
const API_BASE = '/api'

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`GET ${path} 失败: ${res.status}`)
  return res.json() as Promise<T>
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`POST ${path} 失败: ${res.status}`)
  return res.json() as Promise<T>
}

/** 容忍非 2xx 的 POST：copy/open 在非法输入时返回 {ok:false,error}（4xx/5xx），需读取该 body */
async function postTolerant<T>(path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  return res.json() as Promise<T>
}

/** 列表：返回不含 raw 的 SkillItem[] */
export function fetchSkills(): Promise<SkillItem[]> {
  return get<SkillItem[]>('/skills')
}

/** 详情：返回含完整 raw 的 SkillItem */
export function fetchSkillDetail(id: string): Promise<SkillItem> {
  return get<SkillItem>(`/skills/${encodeURIComponent(id)}`)
}

/** 统计聚合 */
export function fetchStats(): Promise<Stats> {
  return get<Stats>('/stats')
}

/** 手动触发重新扫描 */
export function reload(): Promise<{ ok: boolean; items: number }> {
  return post('/reload')
}

/** 后端 pickCopyText 支持的 what 取值（packages/server/src/index.mjs:352） */
export type CopyWhat = 'path' | 'dir' | 'rel' | 'name' | 'raw' | 'prompt'
export type OpenWith = 'default' | 'cursor' | 'finder'

export interface CopyResult {
  ok: boolean
  bytes?: number
  what?: string
  error?: string
}
export interface OpenResult {
  ok: boolean
  opened?: string
  with?: string
  error?: string
}

/** 复制技能内容 / 路径到剪贴板（由后端执行） */
export function copy(id: string, what: CopyWhat = 'path'): Promise<CopyResult> {
  return postTolerant<CopyResult>('/copy', { id, what })
}

/** 用指定编辑器 / 访达打开技能文件 */
export function open(id: string, withApp: OpenWith = 'default'): Promise<OpenResult> {
  return postTolerant<OpenResult>('/open', { id, with: withApp })
}
