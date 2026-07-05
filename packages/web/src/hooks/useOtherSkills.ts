import { useEffect, useState, useMemo } from 'react'
import {
  OtherSkill,
  OtherSkillGroup,
  OtherSkillsOptions,
  GroupBy,
  SortBy,
  SortOrder,
} from '@/types/other-skill'

// API 基础 URL
const API_BASE = '/api'

/**
 * 品牌到 icon 的映射
 */
const BRAND_ICONS: Record<string, string> = {
  hermes: '⚡',
  'claude-code': '🤖',
  cursor: '🖱️',
  codex: '📋',
  'vs-code': '📝',
  vscode: '📝',
  obsidian: '🧠',
  docker: '🐳',
  mcp: '🔌',
  default: '⚙️',
}

/**
 * 分类到 icon 的映射
 */
const CATEGORY_ICONS: Record<string, string> = {
  command: '⌨️',
  editor: '📝',
  tool: '🔧',
  cloud: '☁️',
  ai: '🤖',
  automation: '🤖',
  development: '👨‍💻',
  devops: '🚀',
  default: '📌',
}

/**
 * 源到 icon 的映射
 */
const SOURCE_ICONS: Record<string, string> = {
  hermes: '⚡',
  'claude-code': '🤖',
  cursor: '🖱️',
  codex: '📋',
  obsidian: '🧠',
  'project-runbook': '📚',
  'directory-skill': '📁',
  'mcp-config': '🔌',
  default: '📌',
}

/**
 * 获取 icon - 优先级: custom > brand > category > source
 */
function getIcon(skill: OtherSkill, groupBy?: GroupBy): string {
  if (skill.icon) return skill.icon

  switch (groupBy) {
    case GroupBy.BRAND:
      return BRAND_ICONS[skill.brand || 'default'] || BRAND_ICONS.default
    case GroupBy.SOURCE:
      return SOURCE_ICONS[skill.source || 'default'] || SOURCE_ICONS.default
    case GroupBy.CATEGORY:
    default: {
      const category = Array.isArray(skill.category)
        ? skill.category[0]
        : skill.category
      return (
        CATEGORY_ICONS[category?.toLowerCase() || 'default'] ||
        CATEGORY_ICONS.default
      )
    }
  }
}

/**
 * 单个技能的 emoji 兜底（真实图标 iconUrl 加载失败时使用）
 * 优先级: iconFallback > brand > category > source > 默认
 */
export function getSkillEmoji(skill: OtherSkill): string {
  if (skill.iconFallback) return skill.iconFallback
  if (skill.icon && !skill.icon.includes(':')) return skill.icon
  if (skill.brand && BRAND_ICONS[skill.brand]) return BRAND_ICONS[skill.brand]
  const category = Array.isArray(skill.category) ? skill.category[0] : skill.category
  if (category && CATEGORY_ICONS[category.toLowerCase()]) {
    return CATEGORY_ICONS[category.toLowerCase()]
  }
  if (skill.source && SOURCE_ICONS[skill.source]) return SOURCE_ICONS[skill.source]
  return BRAND_ICONS.default
}

/**
 * 搜索过滤逻辑
 */
function matchesQuery(skill: OtherSkill, query: string): boolean {
  if (!query) return true

  const q = query.toLowerCase()
  return (
    skill.name.toLowerCase().includes(q) ||
    (skill.title?.toLowerCase().includes(q) ?? false) ||
    (skill.description?.toLowerCase().includes(q) ?? false) ||
    (skill.tags?.some((tag) => tag.toLowerCase().includes(q)) ?? false) ||
    (skill.brand?.toLowerCase().includes(q) ?? false) ||
    (skill.source?.toLowerCase().includes(q) ?? false)
  )
}

/**
 * 按多个条件排序
 */
function sortSkills(items: OtherSkill[], sortBy?: SortBy, sortOrder?: SortOrder): OtherSkill[] {
  const order = sortOrder === SortOrder.DESC ? -1 : 1
  const field = sortBy || SortBy.NAME

  return [...items].sort((a, b) => {
    let aVal: any
    let bVal: any

    switch (field) {
      case SortBy.NAME:
        aVal = (a.title || a.name).toLowerCase()
        bVal = (b.title || b.name).toLowerCase()
        break
      case SortBy.UPDATED:
        aVal = a.updatedAt || ''
        bVal = b.updatedAt || ''
        break
      case SortBy.CATEGORY: {
        const aCats = Array.isArray(a.category) ? a.category : a.category ? [a.category] : []
        const bCats = Array.isArray(b.category) ? b.category : b.category ? [b.category] : []
        aVal = aCats[0]
        bVal = bCats[0]
        break
      }
      default:
        aVal = a.name
        bVal = b.name
    }

    if (aVal < bVal) return -1 * order
    if (aVal > bVal) return 1 * order
    return 0
  })
}

/**
 * 核心分组逻辑
 */
function groupSkills(
  items: OtherSkill[],
  groupBy: GroupBy = GroupBy.CATEGORY
): OtherSkillGroup[] {
  if (groupBy === GroupBy.NONE) {
    return [
      {
        groupKey: 'all',
        label: '全部技能',
        icon: '📌',
        items,
        count: items.length,
      },
    ]
  }

  const groups: Map<string, OtherSkill[]> = new Map()

  items.forEach((skill) => {
    let key: string

    switch (groupBy) {
      case GroupBy.BRAND:
        key = skill.brand || 'unknown'
        break
      case GroupBy.SOURCE:
        key = skill.source || 'unknown'
        break
      case GroupBy.CATEGORY:
      default: {
        // 支持多分类，使用第一个
        const cats = Array.isArray(skill.category)
          ? skill.category
          : skill.category
          ? [skill.category]
          : ['unclassified']
        key = cats[0] || 'unclassified'
      }
    }

    if (!groups.has(key)) {
      groups.set(key, [])
    }
    groups.get(key)!.push(skill)
  })

  return Array.from(groups.entries())
    .map(([key, items]: [string, OtherSkill[]]) => {
      const firstSkill = items[0]
      return {
        groupKey: key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
        icon: getIcon(firstSkill, groupBy),
        items,
        count: items.length,
      }
    })
    .filter((g) => g.count > 0)
}

/**
 * API 错误类型
 */
export class OtherSkillsError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'OtherSkillsError'
  }
}

/**
 * useOtherSkills Hook - 获取、搜索、排序、分组其它技能
 *
 * 特性：
 * - 从 /api/other-skills 获取真实数据
 * - 支持搜索、排序、分组
 * - 加载状态和错误处理
 * - 自动 memoization
 *
 * @param options 搜索和过滤选项
 * @returns { items, groups, isLoading, error, refetch }
 */
export function useOtherSkills(options: OtherSkillsOptions = {}) {
  const [skills, setSkills] = useState<OtherSkill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<OtherSkillsError | null>(null)

  // 两阶段加载 (R7.1)：先取轻量 mini 列表快速渲染，再后台取 full 升级。
  const loadSkills = async (opts?: { noStore?: boolean }) => {
    const defaultRoots = '~/.hermes/skills'
    const buildUrl = (stage: 'mini' | 'full') => {
      const url = new URL(`${window.location.origin}${API_BASE}/other-skills`)
      url.searchParams.set('roots', defaultRoots)
      url.searchParams.set('fileGlob', '**/SKILL.md')
      url.searchParams.set('stage', stage)
      return url.toString()
    }
    const fetchStage = async (stage: 'mini' | 'full'): Promise<OtherSkill[]> => {
      const response = await fetch(buildUrl(stage), opts?.noStore ? { cache: 'no-store' } : undefined)
      if (!response.ok) {
        throw new OtherSkillsError(
          'FETCH_FAILED',
          `Failed to fetch skills: ${response.statusText}`,
          response.status
        )
      }
      const data = await response.json()
      if (data.skills && Array.isArray(data.skills)) return data.skills
      if (Array.isArray(data)) return data
      throw new OtherSkillsError('INVALID_FORMAT', 'Expected skills array or {ok, skills} response')
    }

    try {
      setIsLoading(true)
      setError(null)

      // 阶段 1：mini —— 立即渲染列表
      const mini = await fetchStage('mini')
      setSkills(mini)
      setIsLoading(false)

      // 阶段 2：full —— 后台补全 tags/links 等详情字段
      try {
        const full = await fetchStage('full')
        setSkills(full)
      } catch {
        // full 失败不影响已渲染的 mini 列表
      }
    } catch (err) {
      const e =
        err instanceof OtherSkillsError
          ? err
          : new OtherSkillsError('UNKNOWN_ERROR', err instanceof Error ? err.message : 'Unknown error')
      setError(e)
      setSkills([])
      setIsLoading(false)
    }
  }

  // 获取数据
  useEffect(() => {
    loadSkills()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理搜索、排序、过滤、分组
  const { items, groups } = useMemo(() => {
    let filtered = skills

    // 1. 按查询词搜索
    if (options.query) {
      filtered = filtered.filter((skill) => matchesQuery(skill, options.query!))
    }

    // 2. 按品牌过滤
    if (options.filterBrand) {
      filtered = filtered.filter((skill) => skill.brand === options.filterBrand)
    }

    // 3. 按分类过滤
    if (options.filterCategory) {
      filtered = filtered.filter((skill) => {
        const cats = Array.isArray(skill.category)
          ? skill.category
          : skill.category
          ? [skill.category]
          : []
        return cats.includes(options.filterCategory!)
      })
    }

    // 4. 按来源过滤
    if (options.filterSource) {
      filtered = filtered.filter((skill) => skill.source === options.filterSource)
    }

    // 5. 排序
    filtered = sortSkills(filtered, options.sortBy, options.sortOrder)

    // 6. 分页
    if (options.limit || options.offset) {
      const start = options.offset || 0
      const end = options.limit ? start + options.limit : undefined
      filtered = filtered.slice(start, end)
    }

    // 7. 分组
    const groupedSkills = groupSkills(filtered, options.groupBy)

    return {
      items: filtered,
      groups: groupedSkills,
    }
  }, [
    skills,
    options.query,
    options.sortBy,
    options.sortOrder,
    options.groupBy,
    options.filterBrand,
    options.filterCategory,
    options.filterSource,
    options.limit,
    options.offset,
  ])

  // 手动刷新
  const refetch = async () => {
    await loadSkills({ noStore: true })
  }

  return {
    items,
    groups,
    isLoading,
    error,
    refetch,
    /** 总数 */
    total: skills.length,
    /** 过滤后数 */
    filtered: items.length,
  }
}

export type { OtherSkillsOptions }
export { GroupBy, SortBy, SortOrder }
