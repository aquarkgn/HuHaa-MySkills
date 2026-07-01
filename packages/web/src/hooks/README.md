# Hooks 文档

## useOtherSkills

前端 Hook 改造后的全新 `useOtherSkills`，支持从 `/api/other-skills` 获取真实数据。

### 功能特性

✅ 从 API 获取真实技能数据  
✅ 全文搜索（名字、描述、标签、品牌、来源）  
✅ 多种排序方式（名字、更新时间、分类）  
✅ 灵活分组方式（按分类、品牌、来源或不分组）  
✅ 多条件过滤（品牌、分类、来源）  
✅ 分页支持（limit + offset）  
✅ 自动错误处理和加载状态  
✅ 完整单元测试覆盖  

### 基础用法

```typescript
import { useOtherSkills, GroupBy, SortBy, SortOrder } from '@/hooks/useOtherSkills'

function MyComponent() {
  const {
    items,        // 当前过滤后的所有技能项
    groups,       // 分组结果
    isLoading,    // 加载状态
    error,        // 错误对象
    total,        // 总技能数
    filtered,     // 过滤后的技能数
    refetch,      // 手动刷新函数
  } = useOtherSkills()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {groups.map((group) => (
        <div key={group.groupKey}>
          <h3>{group.icon} {group.label} ({group.count})</h3>
          {group.items.map((skill) => (
            <div key={skill.id}>{skill.name}</div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

### 高级用法

#### 1. 搜索和过滤

```typescript
// 搜索 "Docker"
const { items } = useOtherSkills({ query: 'Docker' })

// 按品牌过滤
const { items } = useOtherSkills({ filterBrand: 'hermes' })

// 按分类过滤
const { items } = useOtherSkills({ filterCategory: 'ai' })

// 按来源过滤
const { items } = useOtherSkills({ filterSource: 'project-runbook' })

// 组合多个条件
const { items } = useOtherSkills({
  query: 'API',
  filterBrand: 'claude-code',
  filterCategory: 'development',
})
```

#### 2. 排序

```typescript
import { SortBy, SortOrder } from '@/hooks/useOtherSkills'

// 按名字升序排序（默认）
const { items } = useOtherSkills({
  sortBy: SortBy.NAME,
  sortOrder: SortOrder.ASC,
})

// 按更新时间降序排序
const { items } = useOtherSkills({
  sortBy: SortBy.UPDATED,
  sortOrder: SortOrder.DESC,
})

// 按分类排序
const { items } = useOtherSkills({
  sortBy: SortBy.CATEGORY,
  sortOrder: SortOrder.ASC,
})
```

#### 3. 分组

```typescript
import { GroupBy } from '@/hooks/useOtherSkills'

// 按分类分组（默认）
const { groups } = useOtherSkills({ groupBy: GroupBy.CATEGORY })
// Result:
// [
//   { groupKey: 'ai', label: 'AI', icon: '🤖', items: [...], count: 3 },
//   { groupKey: 'development', label: 'Development', icon: '👨‍💻', items: [...], count: 5 },
//   ...
// ]

// 按品牌分组
const { groups } = useOtherSkills({ groupBy: GroupBy.BRAND })
// Result:
// [
//   { groupKey: 'hermes', label: 'Hermes', icon: '⚡', items: [...], count: 2 },
//   { groupKey: 'claude-code', label: 'Claude Code', icon: '🤖', items: [...], count: 1 },
//   ...
// ]

// 按来源分组
const { groups } = useOtherSkills({ groupBy: GroupBy.SOURCE })

// 不分组
const { groups } = useOtherSkills({ groupBy: GroupBy.NONE })
// Result:
// [
//   { groupKey: 'all', label: 'All Skills', icon: '📌', items: [...], count: N },
// ]
```

#### 4. 分页

```typescript
// 获取前 10 条
const { items } = useOtherSkills({ limit: 10 })

// 获取第 11-20 条
const { items } = useOtherSkills({ offset: 10, limit: 10 })
```

#### 5. 手动刷新

```typescript
const { refetch, isLoading } = useOtherSkills()

async function handleRefresh() {
  await refetch()
  // 数据已刷新
}

<button onClick={handleRefresh} disabled={isLoading}>
  {isLoading ? '刷新中...' : '刷新'}
</button>
```

#### 6. 复杂场景组合

```typescript
const { items, groups, total, filtered } = useOtherSkills({
  // 搜索
  query: 'deploy',
  
  // 过滤
  filterCategory: 'devops',
  filterSource: 'project-runbook',
  
  // 排序
  sortBy: SortBy.UPDATED,
  sortOrder: SortOrder.DESC,
  
  // 分组
  groupBy: GroupBy.BRAND,
  
  // 分页
  limit: 20,
  offset: 0,
})

console.log(`总数: ${total}, 过滤后: ${filtered}`)
```

### 类型定义

```typescript
// 搜索和过滤选项
interface OtherSkillsOptions {
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

// 技能项
interface OtherSkill {
  id: string
  name: string
  title?: string                    // 人类可读标题
  category?: string | string[]      // 语义分类标签（可多个）
  brand?: string                    // 品牌标识（用于 icon）
  source?: string                   // 来源（hermes、claude-code、cursor 等）
  description?: string              // 简短描述
  icon?: string                     // 自定义 icon
  tags?: string[]                   // 搜索标签
  docs?: string                     // 文档链接
  links?: Array<{ label: string; url: string }>  // 相关链接
  examples?: string[]               // 使用示例
  updatedAt?: string                // ISO 8601 时间戳
  parseError?: string               // 解析错误（如有）
}

// 分组结果
interface OtherSkillGroup {
  groupKey: string                  // 分组键（category、brand 等）
  label: string                     // 显示标签
  icon: string                      // 分组 icon
  items: OtherSkill[]              // 该分组中的技能项
  count: number                     // 项数统计
}

// 返回值
interface UseOtherSkillsReturn {
  items: OtherSkill[]              // 过滤后的所有技能项
  groups: OtherSkillGroup[]        // 分组结果
  isLoading: boolean               // 是否加载中
  error: OtherSkillsError | null   // 错误对象
  total: number                    // 总技能数
  filtered: number                 // 过滤后的技能数
  refetch: () => Promise<void>     // 手动刷新
}
```

### 枚举值

```typescript
enum SortBy {
  NAME = 'name',           // 按名字排序
  UPDATED = 'updatedAt',   // 按更新时间排序
  CATEGORY = 'category',   // 按分类排序
}

enum SortOrder {
  ASC = 'asc',             // 升序
  DESC = 'desc',           // 降序
}

enum GroupBy {
  CATEGORY = 'category',   // 按分类分组
  BRAND = 'brand',         // 按品牌分组
  SOURCE = 'source',       // 按来源分组
  NONE = 'none',           // 不分组
}
```

### 错误处理

```typescript
import { OtherSkillsError } from '@/hooks/useOtherSkills'

const { error } = useOtherSkills()

if (error instanceof OtherSkillsError) {
  console.log(error.code)       // 错误代码 (FETCH_FAILED, INVALID_FORMAT, etc)
  console.log(error.message)    // 错误信息
  console.log(error.statusCode) // HTTP 状态码（如有）
}
```

### 单元测试

超过 34 个单元测试覆盖：

✅ 搜索功能（名字、描述、标签、品牌、来源）  
✅ 排序功能（升序/降序，多个排序字段）  
✅ 过滤功能（单条件、多条件组合）  
✅ 分组功能（分类、品牌、来源、无分组）  
✅ 分页功能（limit、offset）  
✅ 复合操作（搜索 + 排序 + 分组 + 分页）  
✅ 多分类支持（字符串和数组）  
✅ 错误处理  

运行测试：

```bash
npm run test:web -- src/hooks/__tests__/useOtherSkills.test.ts
```

### API 说明

Hook 从 `/api/other-skills` 获取数据，格式为：

```typescript
// GET /api/other-skills
// Response: OtherSkill[]
[
  {
    id: "skill-1",
    name: "Docker Setup",
    title: "Docker Container Management",
    category: "devops",
    brand: "docker",
    source: "project-runbook",
    description: "Learn Docker basics",
    tags: ["container", "devops"],
    updatedAt: "2026-01-15T10:00:00Z",
  },
  ...
]
```

### 最佳实践

1. **缓存搜索词** - 在输入框的 change 事件中使用防抖来避免频繁重新计算

```typescript
const [query, setQuery] = useState('')

const handleSearchChange = useCallback(
  (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
  },
  []
)

const { items } = useOtherSkills({ query })
```

2. **记忆化选项** - 使用 useMemo 避免不必要的重新渲染

```typescript
const options = useMemo(
  () => ({
    query,
    sortBy: SortBy.UPDATED,
    groupBy: GroupBy.CATEGORY,
  }),
  [query]
)

const { groups } = useOtherSkills(options)
```

3. **错误恢复** - 提供手动刷新按钮

```typescript
<div>
  {error && (
    <div className="error">
      {error.message}
      <button onClick={() => refetch()}>重试</button>
    </div>
  )}
</div>
```

### 常见问题

**Q: 如何搜索多个关键词？**  
A: 目前搜索是 OR 逻辑，可以在应用层面实现客户端 AND 逻辑。

**Q: 分组结果的顺序是什么？**  
A: 按分组键的字典序排序（除非另有实现）。

**Q: 能否支持自定义 icon？**  
A: 可以，API 返回的 `icon` 字段会优先使用。

**Q: 性能如何？**  
A: Hook 使用 useMemo 确保搜索、排序、分组操作只在依赖项变化时重新计算。

