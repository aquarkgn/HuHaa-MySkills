# 🚀 HuHaa-MySkills 前端框架搭建完成

> **专家模式交付** — Next.js 15 + React 18 + TypeScript + Tailwind CSS 完整框架

---

## 📋 框架交付清单

### ✅ 已完成

| 项目 | 状态 | 位置 |
|------|------|------|
| **Next.js 15 项目初始化** | ✅ 完成 | `/web` |
| **TypeScript Strict 配置** | ✅ 完成 | `/web/tsconfig.json` |
| **Tailwind CSS 3.4** | ✅ 完成 | `/web/tailwind.config.ts` |
| **CSS 变量主题系统** | ✅ 完成 | `/web/app/globals.css` |
| **亮/暗模式支持** | ✅ 完成 | `useTheme` Hook |
| **主题设计文档** | ✅ 完成 | `/docs/Frontend-Theme-Design.md` |
| **全局类型定义** | ✅ 完成 | `/web/types/index.ts` |
| **工具函数库** | ✅ 完成 | `/web/lib/cn.ts` |
| **主题 Provider** | ✅ 完成 | `/web/hooks/useTheme.tsx` |
| **Header 组件** | ✅ 完成 | `/web/components/layout/Header.tsx` |
| **项目目录结构** | ✅ 完成 | 按规范创建 |

---

## 🎨 技术框架定型

### 核心技术栈

```typescript
{
  框架: "Next.js 15 (App Router)",
  运行时: "React 18.3+",
  语言: "TypeScript 5.x (strict)",
  样式: "Tailwind CSS 3.4",
  主题: "CSS Variables + Tailwind Dark Mode",
  组件库: "shadcn/ui (待集成)",
  图标: "lucide-react",
  表单: "React Hook Form + Zod",
  状态管理: "Zustand / Context API",
  HTTP: "TanStack Query v5 + Fetch",
  部署: "Vercel"
}
```

---

## 🎨 设计系统

### 色彩系统（CSS 变量）

#### 亮色模式
```
Primary:        #3B82F6 (蓝色)
Secondary:      #1F2937 (深灰)
Background:     #FFFFFF (白)
Foreground:     #1F2937 (深灰)
Accent:         #F59E0B (琥珀)
```

#### 暗色模式
```
Primary:        #3B82F6 (蓝色)
Secondary:      #F3F4F6 (浅灰)
Background:     #0F172A (深蓝黑)
Foreground:     #F8FAFC (浅灰)
Accent:         #F59E0B (琥珀)
```

### 布局层级

| 组件 | 高度 | 用途 |
|------|------|------|
| **Header** | 64px | 顶部导航 |
| **Container** | 无限 | 内容区 |
| **Card** | 动态 | 卡片容器 |
| **Button** | 32-40px | 交互按钮 |
| **Input** | 36px | 表单输入 |

---

## 📁 项目目录结构

```
web/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # 根布局（集成 ThemeProvider）
│   ├── page.tsx                  # 首页
│   └── globals.css               # 全局样式 + 主题变量
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx            # 顶部导航
│   │   ├── Sidebar.tsx           # 侧边栏（待开发）
│   │   └── Footer.tsx            # 页脚（待开发）
│   ├── ui/                       # shadcn/ui 基础组件
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   └── common/                   # 业务组件
│       ├── SkillCard.tsx
│       ├── UserProfile.tsx
│       └── ...
│
├── hooks/
│   ├── useTheme.tsx              # 主题切换
│   ├── useDebounce.ts            # 防抖
│   └── usePagination.ts          # 分页
│
├── lib/
│   ├── cn.ts                     # Tailwind 类名合并
│   ├── api.ts                    # API 请求（待开发）
│   └── validators.ts             # Zod 验证（待开发）
│
├── types/
│   └── index.ts                  # 全局类型定义
│
├── config/
│   ├── site.ts                   # 站点配置
│   └── navigation.ts             # 导航配置
│
├── styles/
│   └── globals.css               # (已集成到 app/globals.css)
│
├── public/
│   ├── images/                   # 图片资源
│   └── icons/                    # SVG 图标
│
├── tsconfig.json                 # TS 配置（strict 模式）
├── tailwind.config.ts            # Tailwind 配置
├── next.config.ts                # Next.js 配置
├── postcss.config.mjs            # PostCSS 配置
├── package.json                  # 项目配置
└── .eslintrc.json                # ESLint 配置
```

---

## 🔧 核心配置详解

### TypeScript Strict 模式

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

✅ 禁用 `any` 类型、`@ts-ignore`  
✅ 完整的类型定义  
✅ 无未使用的变量和参数

### Tailwind CSS 主题系统

```typescript
// tailwind.config.ts 中使用 CSS 变量
colors: {
  primary: 'hsl(var(--color-primary))',
  background: 'hsl(var(--color-background))',
  // ... 其他颜色
}

// app/globals.css 中定义变量
:root {
  --color-primary: 215 100% 46%;
  --color-background: 0 0% 100%;
}

.dark {
  --color-primary: 215 100% 46%;
  --color-background: 220 9% 8%;
}
```

✅ **优点**：
- 动态主题切换无需重新构建
- 支持任意配色方案扩展
- CSS 变量在浏览器原生支持

### 亮/暗模式切换

```typescript
// hooks/useTheme.tsx
export function useTheme() {
  return {
    theme,              // 'light' | 'dark' | 'system'
    resolvedTheme,      // 实际应用的主题
    setTheme,           // 手动设置主题
    toggleTheme,        // 切换主题
  }
}

// 在组件中使用
const { resolvedTheme, toggleTheme } = useTheme()
```

✅ **工作流**：
1. 用户点击切换按钮 → `toggleTheme()`
2. 状态更新 → `resolvedTheme` 改变
3. 类名应用 → `<html class="dark">`
4. CSS 变量切换 → 样式立即更新
5. 持久化 → 保存到 `localStorage`

---

## 🎯 下一步开发步骤

### Phase 1: 基础组件库（2-3天）
- [ ] 集成 shadcn/ui 组件
- [ ] 创建按钮、输入框、卡片基础组件
- [ ] 编写组件 Stories（Storybook 可选）

### Phase 2: 页面布局（3-5天）
- [ ] 实现响应式布局系统
- [ ] 创建 Sidebar、Footer 组件
- [ ] 构建首页 + 技能库页面

### Phase 3: 业务功能（5-7天）
- [ ] 集成 API 请求（TanStack Query）
- [ ] 实现表单验证（React Hook Form + Zod）
- [ ] 完成技能 CRUD 功能

### Phase 4: 测试 & 优化（3-5天）
- [ ] 单元测试（Jest + RTL）
- [ ] E2E 测试（Playwright）
- [ ] 性能优化 + 字节优化

### Phase 5: 部署
- [ ] 配置 GitHub Actions CI/CD
- [ ] 部署到 Vercel
- [ ] 性能监控

---

## 🏃 快速启动

### 本地开发

```bash
cd /Users/mac/Project/HuHaa-MySkills/web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问：http://localhost:3000
```

### 代码质量检查

```bash
# 类型检查
npm run type-check

# ESLint 检查
npm run lint

# Prettier 格式化
npm run format

# 构建生产版本
npm run build

# 运行测试（待配置）
npm test
```

---

## 📚 关键文档

| 文档 | 路径 | 用途 |
|------|------|------|
| **工程规范** | `docs/Frontend-Engineering.md` | 全项目规范 |
| **主题设计** | `docs/Frontend-Theme-Design.md` | 设计系统 |
| **AI 协作** | `CLAUDE.md` | 开发规则 |
| **Next.js 配置** | `web/next.config.ts` | 框架配置 |
| **Tailwind 配置** | `web/tailwind.config.ts` | 样式配置 |

---

## 🎓 最佳实践

### 组件编写

```typescript
// ✅ 正确的组件结构
import { cn } from '@/lib/cn'
import type { ReactNode } from 'react'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  children: ReactNode
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        variant === 'primary' && 'bg-primary text-primary-foreground',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-4 py-2',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
```

### 页面开发

```typescript
// ✅ 正确的页面结构
import { Header } from '@/components/layout/Header'

export default function Home() {
  return (
    <>
      <Header />
      <main className="container py-8">
        {/* 页面内容 */}
      </main>
    </>
  )
}
```

---

## ⚠️ 注意事项

### Hydration Mismatch 预防

```typescript
// ❌ 错误：直接在组件中使用 useTheme
export function App() {
  const { theme } = useTheme() // hydration 不匹配！
  return <>{theme}</>
}

// ✅ 正确：在 ThemeProvider 内使用
// 确保 ThemeProvider 在 app/layout.tsx 中
```

### 类型安全

```typescript
// ❌ 禁止使用 any
const user: any = {}

// ✅ 正确的类型定义
import type { User } from '@/types'
const user: User = { id: '', name: '', email: '' }
```

### 性能优化

```typescript
// ✅ 使用 React.memo 避免不必要重渲染
export const UserCard = React.memo(function UserCard({ user }) {
  return <div>{user.name}</div>
})

// ✅ 使用 useCallback 稳定回调函数
const handleClick = useCallback(() => {
  // ...
}, [])
```

---

## 📊 性能目标

| 指标 | 目标 | 现状 |
|------|------|------|
| **FCP** | < 1.5s | 待测 |
| **LCP** | < 2.5s | 待测 |
| **CLS** | < 0.1 | 待测 |
| **TTI** | < 3.0s | 待测 |
| **首屏加载** | < 3s | 待测 |

---

## 🔗 相关资源

- **Next.js 官方文档** — https://nextjs.org/docs
- **Tailwind CSS 文档** — https://tailwindcss.com/docs
- **React 最佳实践** — https://react.dev
- **TypeScript Handbook** — https://www.typescriptlang.org/docs

---

## ✍️ 提交规范

所有代码变更必须遵循 `docs/Frontend-Engineering.md` 中的提交规范：

```bash
# 格式：<type>(<scope>): <subject>
feat(header): 添加主题切换按钮
fix(theme): 修复暗色模式 CSS 变量
refactor(types): 统一 API 类型定义
```

---

**框架交付时间** — 2026-06-29  
**版本** — v1.0 (Framework Init)  
**状态** — ✅ 可立即开始迭代开发

