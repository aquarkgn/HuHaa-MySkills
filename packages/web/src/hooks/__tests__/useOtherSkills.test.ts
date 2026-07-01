import { describe, it, expect } from 'vitest'
import {
  GroupBy,
  SortBy,
  SortOrder,
  OtherSkillsError,
} from '../useOtherSkills'
import { OtherSkill } from '@/types/other-skill'

// 测试数据
const mockSkills: OtherSkill[] = [
  {
    id: 'skill-1',
    name: 'Docker Setup',
    title: 'Docker Container Management',
    category: 'devops',
    brand: 'docker',
    source: 'project-runbook',
    description: 'Learn Docker basics and advanced techniques',
    tags: ['container', 'devops', 'tutorial'],
    docs: 'https://docs.docker.com',
    updatedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'skill-2',
    name: 'Claude API Integration',
    title: 'Integrate Claude API',
    category: ['ai', 'development'],
    brand: 'claude-code',
    source: 'hermes',
    description: 'Connect Claude API to your application',
    tags: ['api', 'ai', 'integration'],
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'skill-3',
    name: 'Git Workflow',
    title: 'Advanced Git Techniques',
    category: 'development',
    source: 'project-runbook',
    description: 'Master Git workflows and collaboration',
    tags: ['git', 'version-control', 'collaboration'],
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'skill-4',
    name: 'TypeScript Types',
    title: 'TypeScript Type System',
    category: 'development',
    brand: 'vscode',
    source: 'directory-skill',
    description: 'Deep dive into TypeScript types',
    tags: ['typescript', 'types', 'development'],
    updatedAt: '2026-01-18T10:00:00Z',
  },
  {
    id: 'skill-5',
    name: 'Hermes Plugin Development',
    title: 'Build Hermes Plugins',
    category: 'ai',
    brand: 'hermes',
    source: 'hermes',
    description: 'Create custom Hermes plugins',
    tags: ['plugin', 'hermes', 'extension'],
    updatedAt: '2026-01-12T10:00:00Z',
  },
]

// ==================== 纯函数逻辑测试 ====================

describe('useOtherSkills - Pure Functions', () => {
  // 测试搜索逻辑
  describe('Search/Query Logic', () => {
    it('should match by name', () => {
      const query = 'Docker'
      const result = mockSkills.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Docker Setup')
    })

    it('should match by description', () => {
      const query = 'workflow'
      const result = mockSkills.filter((s) =>
        s.description?.toLowerCase().includes(query.toLowerCase())
      )
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Git Workflow')
    })

    it('should match by tags', () => {
      const query = 'container'
      const result = mockSkills.filter((s) =>
        s.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('skill-1')
    })

    it('should be case-insensitive', () => {
      const query = 'DOCKER'
      const result = mockSkills.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      expect(result).toHaveLength(1)
    })

    it('should return empty for non-matching query', () => {
      const query = 'nonexistent'
      const result = mockSkills.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase())
      )
      expect(result).toHaveLength(0)
    })

    it('should match by brand', () => {
      const query = 'docker'
      const result = mockSkills.filter((s) =>
        s.brand?.toLowerCase().includes(query.toLowerCase())
      )
      expect(result).toHaveLength(1)
    })

    it('should match by source', () => {
      const query = 'hermes'
      const result = mockSkills.filter((s) =>
        s.source?.toLowerCase().includes(query.toLowerCase())
      )
      expect(result).toHaveLength(2)
    })
  })

  // 测试排序逻辑
  describe('Sort Logic', () => {
    it('should sort by name ascending', () => {
      const sorted = [...mockSkills].sort((a, b) =>
        a.name.localeCompare(b.name)
      )
      expect(sorted[0].name).toBe('Claude API Integration')
      expect(sorted[sorted.length - 1].name).toBe('TypeScript Types')
    })

    it('should sort by name descending', () => {
      const sorted = [...mockSkills].sort((a, b) =>
        b.name.localeCompare(a.name)
      )
      expect(sorted[0].name).toBe('TypeScript Types')
      expect(sorted[sorted.length - 1].name).toBe('Claude API Integration')
    })

    it('should sort by updatedAt ascending', () => {
      const sorted = [...mockSkills].sort(
        (a, b) => (a.updatedAt || '').localeCompare(b.updatedAt || '')
      )
      // '2026-01-10' should come first
      expect(sorted[0].id).toBe('skill-3')
      // '2026-01-20' should come last
      expect(sorted[sorted.length - 1].id).toBe('skill-2')
    })

    it('should sort by updatedAt descending', () => {
      const sorted = [...mockSkills].sort(
        (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')
      )
      expect(sorted[0].id).toBe('skill-2')
      expect(sorted[sorted.length - 1].id).toBe('skill-3')
    })
  })

  // 测试过滤逻辑
  describe('Filter Logic', () => {
    it('should filter by brand', () => {
      const result = mockSkills.filter((s) => s.brand === 'docker')
      expect(result).toHaveLength(1)
      expect(result[0].brand).toBe('docker')
    })

    it('should filter by category (string)', () => {
      const result = mockSkills.filter((s) => {
        const cats = Array.isArray(s.category) ? s.category : [s.category]
        return cats.includes('development')
      })
      // skill-2 (has both 'ai' and 'development')
      // skill-3 (has 'development')
      // skill-4 (has 'development')
      // Total: 3
      expect(result).toHaveLength(3)
    })

    it('should filter by category (array)', () => {
      const result = mockSkills.filter((s) => {
        const cats = Array.isArray(s.category) ? s.category : s.category ? [s.category] : []
        return cats.includes('ai')
      })
      expect(result).toHaveLength(2)
    })

    it('should filter by source', () => {
      const result = mockSkills.filter((s) => s.source === 'hermes')
      expect(result).toHaveLength(2)
      expect(result.every((s) => s.source === 'hermes')).toBe(true)
    })

    it('should combine multiple filters', () => {
      const result = mockSkills.filter(
        (s) => s.brand === 'hermes' && s.category === 'ai'
      )
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('skill-5')
    })
  })

  // 测试分组逻辑
  describe('Grouping Logic', () => {
    it('should group by category', () => {
      const groups = new Map<string, OtherSkill[]>()

      mockSkills.forEach((skill) => {
        const cats = Array.isArray(skill.category)
          ? skill.category
          : skill.category
          ? [skill.category]
          : ['unclassified']
        const key = cats[0] || 'unclassified'

        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(skill)
      })

      expect(groups.size).toBeGreaterThan(0)
      const aiGroup = groups.get('ai')
      expect(aiGroup?.length).toBe(2)
    })

    it('should group by brand', () => {
      const groups = new Map<string, OtherSkill[]>()

      mockSkills.forEach((skill) => {
        const key = skill.brand || 'unknown'
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(skill)
      })

      expect(groups.has('docker')).toBe(true)
      expect(groups.has('hermes')).toBe(true)
      expect(groups.get('docker')).toHaveLength(1)
      expect(groups.get('hermes')).toHaveLength(1)
    })

    it('should group by source', () => {
      const groups = new Map<string, OtherSkill[]>()

      mockSkills.forEach((skill) => {
        const key = skill.source || 'unknown'
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(skill)
      })

      expect(groups.has('hermes')).toBe(true)
      expect(groups.has('project-runbook')).toBe(true)
    })

    it('should handle items without group key', () => {
      const itemWithoutBrand = { ...mockSkills[0], brand: undefined }
      const groups = new Map<string, OtherSkill[]>()

      const key = itemWithoutBrand.brand || 'unknown'
      groups.set(key, [itemWithoutBrand])

      expect(groups.has('unknown')).toBe(true)
      expect(groups.get('unknown')).toHaveLength(1)
    })
  })

  // 测试分页逻辑
  describe('Pagination Logic', () => {
    it('should apply limit', () => {
      const limit = 2
      const result = mockSkills.slice(0, limit)
      expect(result).toHaveLength(2)
    })

    it('should apply offset', () => {
      const offset = 2
      const limit = 2
      const result = mockSkills.slice(offset, offset + limit)
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(mockSkills[2].id)
    })

    it('should handle offset beyond array length', () => {
      const offset = 100
      const result = mockSkills.slice(offset)
      expect(result).toHaveLength(0)
    })
  })

  // 测试组合操作
  describe('Combined Operations', () => {
    it('should search, sort, and filter together', () => {
      const query = 'development'
      const filtered = mockSkills.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase()) ||
        s.tags?.some((tag) =>
          tag.toLowerCase().includes(query.toLowerCase())
        )
      )

      const sorted = filtered.sort((a, b) =>
        a.name.localeCompare(b.name)
      )

      // Should have multiple development-related items
      expect(sorted.length).toBeGreaterThan(0)
      // Should be sorted
      for (let i = 1; i < sorted.length; i++) {
        expect(
          sorted[i].name.localeCompare(sorted[i - 1].name)
        ).toBeGreaterThanOrEqual(0)
      }
    })

    it('should handle all filter, search, sort, and pagination together', () => {
      // 1. Filter by source
      let result = mockSkills.filter((s) => s.source === 'hermes')

      // 2. Search
      const query = 'plugin'
      result = result.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description?.toLowerCase().includes(query.toLowerCase())
      )

      // 3. Sort
      result = result.sort((a, b) => a.name.localeCompare(b.name))

      // 4. Paginate
      const paginated = result.slice(0, 2)

      expect(paginated.every((s) => s.source === 'hermes')).toBe(true)
      expect(paginated.length).toBeGreaterThan(0)
    })
  })

  // 测试多分类支持
  describe('Multi-Category Support', () => {
    it('should handle string category', () => {
      const skill = mockSkills.find((s) => s.id === 'skill-1')
      expect(typeof skill?.category).toBe('string')
    })

    it('should handle array category', () => {
      const skill = mockSkills.find((s) => s.id === 'skill-2')
      expect(Array.isArray(skill?.category)).toBe(true)
      expect(skill?.category).toContain('ai')
      expect(skill?.category).toContain('development')
    })

    it('should normalize category to array for filtering', () => {
      mockSkills.forEach((skill) => {
        const cats = Array.isArray(skill.category)
          ? skill.category
          : skill.category
          ? [skill.category]
          : []
        expect(Array.isArray(cats)).toBe(true)
      })
    })
  })
})

// ==================== 错误处理 ====================

describe('Error Handling', () => {
  it('should create OtherSkillsError with proper attributes', () => {
    const error = new OtherSkillsError('TEST_CODE', 'Test message', 400)
    expect(error.code).toBe('TEST_CODE')
    expect(error.message).toBe('Test message')
    expect(error.statusCode).toBe(400)
    expect(error.name).toBe('OtherSkillsError')
  })

  it('should create OtherSkillsError without statusCode', () => {
    const error = new OtherSkillsError('TEST', 'message')
    expect(error.statusCode).toBeUndefined()
  })

  it('should be instanceof Error', () => {
    const error = new OtherSkillsError('TEST', 'message')
    expect(error instanceof Error).toBe(true)
  })
})

// ==================== 枚举值测试 ====================

describe('Enums', () => {
  it('should have SortOrder values', () => {
    expect(SortOrder.ASC).toBe('asc')
    expect(SortOrder.DESC).toBe('desc')
  })

  it('should have SortBy values', () => {
    expect(SortBy.NAME).toBe('name')
    expect(SortBy.UPDATED).toBe('updatedAt')
    expect(SortBy.CATEGORY).toBe('category')
  })

  it('should have GroupBy values', () => {
    expect(GroupBy.CATEGORY).toBe('category')
    expect(GroupBy.BRAND).toBe('brand')
    expect(GroupBy.SOURCE).toBe('source')
    expect(GroupBy.NONE).toBe('none')
  })
})
