/**
 * 全局类型定义
 * 按功能模块组织，避免类型定义分散
 */

// ============ 通用类型 ============

export interface BaseResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, unknown>
}

// ============ 用户相关 ============

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user'
  status: 'active' | 'inactive' | 'suspended'
  createdAt: string
  updatedAt: string
}

// ============ 技能相关 ============

export interface Skill {
  id: string
  name: string
  description: string
  category: string
  level: 1 | 2 | 3 | 4 | 5
  tags: string[]
  verified: boolean
  createdAt: string
  updatedAt: string
}

export interface SkillCategory {
  id: string
  name: string
  description: string
  icon?: string
  count: number
}

// ============ 组件Props类型 ============

export interface ReactNodeProps {
  children?: React.ReactNode
}

export interface ClassNameProps {
  className?: string
}

export interface CommonProps extends ReactNodeProps, ClassNameProps {}
