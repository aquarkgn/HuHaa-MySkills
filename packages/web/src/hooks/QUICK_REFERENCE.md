# useOtherSkills - Quick Reference Card

## 最常用的 3 个用法

### 1️⃣ 基础：获取和分组

```typescript
import { useOtherSkills, GroupBy } from '@/hooks/useOtherSkills'

const { groups } = useOtherSkills({ groupBy: GroupBy.CATEGORY })

groups.map(g => `${g.icon} ${g.label} (${g.count})`)
// => "🤖 Ai (5) | 📝 Editor (3) | ..."
```

### 2️⃣ 搜索

```typescript
const [query, setQuery] = useState('')
const { items } = useOtherSkills({ query })

// 自动搜索：名字、描述、标签、品牌、来源
```

### 3️⃣ 排序和过滤

```typescript
const { items } = useOtherSkills({
  sortBy: SortBy.UPDATED,
  sortOrder: SortOrder.DESC,
  filterBrand: 'hermes',
})
```

## 完整 API

```typescript
// 导入
import { useOtherSkills, GroupBy, SortBy, SortOrder } from '@/hooks/useOtherSkills'

// 调用
const result = useOtherSkills(options)

// options
{
  query?: string                    // 搜索词
  sortBy?: SortBy                   // NAME | UPDATED | CATEGORY
  sortOrder?: SortOrder             // ASC | DESC
  groupBy?: GroupBy                 // CATEGORY | BRAND | SOURCE | NONE
  filterBrand?: string              // 过滤品牌
  filterCategory?: string           // 过滤分类
  filterSource?: string             // 过滤来源
  limit?: number                    // 分页大小
  offset?: number                   // 分页偏移
}

// 返回值
{
  items: OtherSkill[],              // 技能列表
  groups: OtherSkillGroup[],        // 分组结果
  isLoading: boolean,               // 加载中
  error: OtherSkillsError | null,   // 错误
  total: number,                    // 总数
  filtered: number,                 // 过滤后数
  refetch: () => Promise<void>,     // 刷新
}
```

## 分组结果结构

```typescript
groups[0] = {
  groupKey: 'ai',          // 分组键
  label: 'Ai',             // 显示标签
  icon: '🤖',              // icon
  items: [...],            // 该组内的技能
  count: 5,                // 该组内的数量
}
```

## 技能项结构

```typescript
OtherSkill {
  id: string              // 唯一 id
  name: string            // 技能名
  title?: string          // 显示标题
  description?: string    // 描述
  category?: string | string[]  // 分类
  brand?: string          // 品牌
  source?: string         // 来源
  tags?: string[]         // 标签
  icon?: string           // 自定义 icon
  docs?: string           // 文档链接
  links?: { label, url }[]
  examples?: string[]
  updatedAt?: string      // ISO 时间戳
  parseError?: string     // 错误
}
```

## 常见错误和解决方案

| 错误 | 原因 | 解决 |
|------|------|------|
| `Cannot read properties of undefined` | options 不存在 | 提供默认值或检查 |
| `isLoading 一直为 true` | API 未响应 | 检查 `/api/other-skills` 端点 |
| `error.code === 'INVALID_FORMAT'` | 返回格式不对 | 确保返回 `OtherSkill[]` |
| 搜索无结果 | 搜索词未匹配 | 检查搜索词大小写（不敏感） |
| 分组为空 | 都被过滤掉了 | 检查 filter 条件 |

## 性能提示

```typescript
// ❌ 不好：每次都创建新对象
const { items } = useOtherSkills({
  sortBy: SortBy.NAME,
  groupBy: GroupBy.CATEGORY,
})

// ✅ 好：使用 useMemo
const options = useMemo(() => ({
  sortBy: SortBy.NAME,
  groupBy: GroupBy.CATEGORY,
}), [])

const { items } = useOtherSkills(options)
```

## 测试示例

```typescript
import { renderHook } from '@testing-library/react'

// 纯函数测试（推荐）
const skills = [{ id: '1', name: 'Docker', ... }]
const filtered = skills.filter(s => 
  s.name.toLowerCase().includes('docker')
)
expect(filtered).toHaveLength(1)

// Hook 测试
const { result } = renderHook(() => 
  useOtherSkills({ query: 'docker' })
)
```

## 核心特性对比

| 功能 | 实现 |
|------|------|
| 搜索 | 6 个字段（OR 逻辑） |
| 排序 | 3 个字段 × 升降序 |
| 分组 | 4 种分组方式 |
| 过滤 | 3 个条件（可组合） |
| 分页 | limit + offset |
| 缓存 | useMemo 自动优化 |
| 错误 | 自定义错误类 |

## 快速导航

- 📖 完整文档: `packages/web/src/hooks/README.md`
- 🧪 测试文件: `packages/web/src/hooks/__tests__/useOtherSkills.test.ts`
- 📝 实现代码: `packages/web/src/hooks/useOtherSkills.ts`
- 🔷 类型定义: `packages/web/src/types/other-skill.ts`
