/**
 * 其它技能分类枚举 - 支持按分类、品牌、来源分组
 */
export enum OtherSkillCategory {
  COMMAND = 'command',      // CLI 命令
  EDITOR = 'editor',        // 编辑器集成
  TOOL = 'tool',            // 工具/插件
  CLOUD = 'cloud',          // 云服务
  AI = 'ai',                // AI 能力
}

/**
 * 排序顺序
 */
export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * 排序字段
 */
export enum SortBy {
  NAME = 'name',
  UPDATED = 'updatedAt',
  CATEGORY = 'category',
}

/**
 * 分组方式
 */
export enum GroupBy {
  CATEGORY = 'category',
  BRAND = 'brand',
  SOURCE = 'source',
  NONE = 'none',
}

/**
 * 其它技能项 - 匹配真实 SKILL.md 数据结构
 */
export interface OtherSkill {
  id: string
  name: string
  title?: string                    // 人类可读标题
  category?: string | string[]      // 语义分类标签（可多个）
  brand?: string                    // 品牌标识（用于 icon）
  source?: string                   // 来源（hermes、claude-code、cursor 等）
  description?: string              // 简短描述
  icon?: string                     // 自定义 icon（emoji 或字符）
  iconUrl?: string                  // 真实应用图标 URL（如 /api/icons/cursor?size=64）
  iconFallback?: string             // 图标加载失败时的 emoji 兜底
  tags?: string[]                   // 搜索标签
  docs?: string                     // 文档链接
  links?: Array<{                   // 相关链接
    label: string
    url: string
  }>
  examples?: string[]               // 使用示例
  updatedAt?: string                // ISO 8601 时间戳
  parseError?: string               // 解析错误（如有）
}

/**
 * 其它技能分组（支持多种分组方式）
 */
export interface OtherSkillGroup {
  groupKey: string                  // 分组键（category、brand 等）
  label: string                     // 显示标签
  icon: string                      // 分组 icon
  items: OtherSkill[]              // 该分组中的技能项
  count: number                     // 项数统计
}

/**
 * 搜索和过滤选项
 */
export interface OtherSkillsOptions {
  query?: string                    // 搜索词
  sortBy?: SortBy                   // 排序字段
  sortOrder?: SortOrder             // 排序方向
  groupBy?: GroupBy                 // 分组方式
  filterBrand?: string              // 按品牌过滤
  filterCategory?: string           // 按分类过滤
  filterSource?: string             // 按来源过滤
  limit?: number                    // 限制结果数
  offset?: number                   // 分页偏移
}
