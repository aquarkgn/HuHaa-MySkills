// 前端镜像后端 IR（packages/scanner/src/types.d.ts 的 SkillItem）。
// 二者需保持同步：后端字段变更时同步此文件。

export type SkillKind =
  | 'skill'
  | 'plugin'
  | 'mcp'
  | 'runbook'
  | 'doc'

export interface SkillItem {
  id: string
  kind: SkillKind
  source: string
  name: string
  title?: string
  description?: string
  category?: string[]
  tier?: string
  brand?: string
  dirName?: string
  editor?: string
  product?: string
  triggers?: string[]
  tags?: string[]
  paths?: {
    abs: string
    rel?: string
    rootKind: 'home' | 'project' | 'icloud'
  }
  preview?: string
  /** /api/skills 列表接口会剥离 raw，仅 /api/skills/:id 返回 */
  raw?: string
  links?: { label: string; url: string }[]
  updatedAt?: string
  parseError?: string

  // v4.0 Priority Scan & Menu Layering
  /** MD5(normalizedAbsPath) — 用于去重和菜单分层 */
  pathHash?: string
  /** v4.0 tier 分层：tier-1（编辑器）| tier-2（用户）| tier-3（其他） */
  tierId?: 'tier-1' | 'tier-2' | 'tier-3'
  /** v4.0 editor brand within Tier 1 (cursor, claude, hermes, etc.) */
  editorBrand?: string
  /** 真实应用图标 URL（从 /api/icons/:brand） */
  iconUrl?: string
  /** emoji 兜底值 */
  iconFallback?: string
}

export interface Stats {
  total: number
  bySource: Record<string, number>
  byEditor: Record<string, number>
  byKind: Record<string, number>
  byCategory: Record<string, number>
  byBrand: Record<string, number>
  labels?: Record<string, unknown>
}
