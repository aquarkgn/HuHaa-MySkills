# 工程规范 — HuHaa-MySkills 项目

> 本文档定义了项目的技术标准、最佳实践和质量要求。

## 📐 代码质量标准

### TypeScript 配置
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

**要求**：所有 TS 文件必须严格模式通过。禁止 `any` 和 `@ts-ignore`。

### 代码风格
- **缩进**：2 空格（不使用 Tab）
- **行长**：不超过 100 字符（长行分割）
- **分号**：必须使用
- **引号**：单引号（除非 JSON/类型字符串）
- **逗号**：末尾逗号（对象/数组）

### ESLint 规则
- `eslint:recommended` 基础规则集
- `@typescript-eslint/recommended` TypeScript 规则
- `react-hooks/rules-of-hooks` React Hooks 检查
- 禁止 `console.log` 上线（dev 环境可使用）

### Prettier 格式化
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

---

## 🧪 测试规范

### 测试覆盖率目标
- **总体**：>= 80%
- **关键路径**：>= 95%
- **工具函数**：>= 90%

### 测试分类

#### 单元测试
- 工具函数、工厂函数、验证函数
- 每个函数的所有分支都应被覆盖
- 使用 Jest + React Testing Library

#### 集成测试
- 多个模块协作场景
- 组件与状态管理互动
- API 调用与数据绑定

#### E2E 测试
- 完整用户流程
- 关键功能验证
- 使用 Playwright 或 Cypress

### 测试命名规范
```typescript
// ✅ 清晰的测试描述
describe('UserProfile 组件', () => {
  it('用户初次加载时显示骨架屏', () => { ... })
  it('用户加载完成后隐藏骨架屏并显示数据', () => { ... })
  it('网络错误时显示重试按钮', () => { ... })
})

// ❌ 不清晰
describe('Tests', () => {
  it('should work', () => { ... })
})
```

---

## 🔄 Git 工作流

### 分支策略
- **main**：稳定生产代码，所有 commit 来自 PR
- **feat/xxx**：功能分支（从 main 拉取）
- **fix/xxx**：修复分支（从 main 拉取）
- **docs/xxx**：文档分支

### 提交规范（Conventional Commits）

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**：
- `feat`：新功能
- `fix`：修复 bug
- `refactor`：代码重构
- `perf`：性能优化
- `test`：测试相关
- `docs`：文档
- `style`：代码格式
- `chore`：依赖、构建、配置

**Scope**：
- `editor`：编辑器同步
- `api`：API 服务
- `ui`：界面组件
- `config`：配置系统
- `types`：类型定义

**Subject**：
- 命令式（"添加"，不是"添加了"）
- 首字母小写
- 无句号结尾
- 简洁明了（< 50 字）

**Body**（可选）：
- 说明 What 和 Why，不说 How
- 每行 < 72 字
- 说明改动的动机和对比

**Footer**（可选）：
- 关闭 issue：`Closes #42`
- Breaking Change：`BREAKING CHANGE: description`

### 示例提交

```
feat(editor): 支持多编辑器 .cursorrules 自动同步

- 检测系统中已安装的编辑器
- 自动更新编辑器配置目录中的 .cursorrules
- 添加错误处理和权限检查

Closes #123
```

### Pull Request 流程

1. **PR 标题**：与提交信息一致格式
2. **描述**：
   - What：改动是什么
   - Why：为什么这样做
   - How：如何验证
3. **Review**：至少 1 人审核通过
4. **CI 检查**：所有检查必须通过
5. **Squash & Merge**：合并前清理历史

---

## 📦 依赖管理

### 版本策略
- **主版本（major）**：可能有破坏性改动，需要 Review
- **次版本（minor）**：新增功能，无破坏性，可直接更新
- **修订版（patch）**：bug 修复，应该定期更新

### 依赖审查清单

更新依赖前检查：
- [ ] 官方发布说明（Changelog）
- [ ] 是否有破坏性改动（Breaking Changes）
- [ ] 安全公告（npm audit）
- [ ] 社区反馈（GitHub Issues）

### package.json 规范
```json
{
  "name": "huhaa-myskills",
  "version": "1.0.0",
  "description": "本地 AI 技能聚合中枢",
  "type": "module",
  "engines": {
    "node": ">=20.0.0",
    "npm": ">=10.0.0"
  },
  "scripts": {
    "dev": "...",
    "build": "...",
    "test": "...",
    "lint": "...",
    "format": "..."
  },
  "dependencies": {},
  "devDependencies": {},
  "overrides": {}
}
```

---

## 🎨 前端开发规范

### React 组件结构
```typescript
// src/components/UserCard/UserCard.tsx

import { memo } from 'react'
import { UserCardProps } from './types'
import styles from './UserCard.module.css'

// 类型定义放在 types.ts
export const UserCard = memo<UserCardProps>(({ user, onSelect }) => {
  // 所有 hooks 在顶部
  const [expanded, setExpanded] = useState(false)

  // 事件处理器
  const handleClick = () => {
    setExpanded(!expanded)
    onSelect?.(user.id)
  }

  // 渲染逻辑
  return (
    <div className={styles.card} onClick={handleClick}>
      {/* JSX */}
    </div>
  )
})

UserCard.displayName = 'UserCard'
```

### Hooks 最佳实践
- ✅ 只在函数组件顶层调用
- ✅ 自定义 hooks 使用 useXxx 命名
- ✅ 依赖数组必须准确（ESLint 检查）
- ❌ 不要在循环/条件中调用 hooks
- ❌ 不要在同步代码中直接修改 DOM

### 性能优化
- **React.memo**：props 稳定的组件包装
- **useMemo**：昂贵计算缓存
- **useCallback**：传给子组件的函数缓存
- **代码分割**：`React.lazy()` + Suspense

---

## 🚦 CI/CD 检查

### 本地检查（提交前）
```bash
npm run lint      # ESLint 检查
npm run type-check  # TypeScript 类型检查
npm run test      # 单元测试
npm run build     # 构建验证
```

### GitHub Actions 检查
1. **Lint & Type**：代码质量
2. **Test**：测试覆盖率 >= 80%
3. **Build**：生产构建成功
4. **Security**：npm audit 安全扫描

所有检查必须通过才能合并。

---

## 📊 性能基准

### Web 指标
- **LCP**（最大内容绘制）：<= 2.5s
- **FID**（首次输入延迟）：<= 100ms
- **CLS**（累积布局偏移）：<= 0.1

### 包大小目标
- **初始包**：<= 200KB（gzip）
- **运行时包**：<= 500KB（总计）
- **单个路由**：<= 50KB（路由级代码分割后）

---

## 🔒 安全规范

### 代码安全
- 不硬编码 secrets
- 验证用户输入
- 防止 XSS（框架自动处理）
- 防止 CSRF（token 验证）

### 依赖安全
- `npm audit fix` 定期修复
- 避免已知安全漏洞的版本
- 谨慎使用 `override` 解决冲突

### 环保信息处理
- API Keys 使用环境变量
- 敏感日志不上线
- 用户数据不落本地存储

---

## 📋 检查清单

### 代码完成前
- [ ] 功能完整实现
- [ ] 所有单元测试通过
- [ ] 代码通过 ESLint 和 TypeScript 检查
- [ ] 运行 `/code-review` 并应用建议
- [ ] 没有 `console.log` 遗留
- [ ] 提交信息清晰描述改动

### PR 创建前
- [ ] 分支从最新 main 拉取
- [ ] 本地测试通过
- [ ] CI 检查通过
- [ ] PR 描述说明 What/Why/How
- [ ] 需要 Review 者指定

### 发布前
- [ ] 更新 CHANGELOG
- [ ] 版本号符合语义化版本
- [ ] 所有 CI 检查通过
- [ ] 文档已更新

---

**版本**：1.0  
**维护者**：Nolan  
**最后更新**：2026-06-24
