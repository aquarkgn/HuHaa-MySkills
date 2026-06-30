# 🎨 HuHaa-MySkills 前端主题设计系统 v1.0

> 完整的视觉设计系统、配色方案、组件库规范

---

## I. 设计理念

### 核心价值
- **现代感** — 清爽、高效、专业的 UI 风格
- **易用性** — 直观交互、清晰信息层级
- **可访问性** — WCAG AA 标准、深浅主题支持
- **一致性** — 统一的设计语言、组件规范
- **扩展性** — CSS 变量主题系统、易于定制

### 设计参考
- **现代 SaaS 应用** — Vercel, Linear, Stripe 的清爽风格
- **中文设计方向** — 简洁有度、留白适当、信息密度合理

---

## II. 配色系统

### 色板定义

#### **亮色模式（Light Mode - 默认）**

| 颜色类型 | 16进制 | HSL | CSS变量 | 用途 |
|---------|--------|-----|---------|------|
| **Background** | `#FFFFFF` | 0 0% 100% | `--color-background` | 页面背景 |
| **Foreground** | `#1F2937` | 220 9% 12% | `--color-foreground` | 正文文本 |
| **Border** | `#E5E7EB` | 220 13% 91% | `--color-border` | 分割线、边框 |
| **Input** | `#F3F4F6` | 220 13% 91% | `--color-input` | 输入框背景 |
| **Ring** | `#3B82F6` | 215 100% 46% | `--color-ring` | Focus 环 |
| **Primary** | `#3B82F6` | 215 100% 46% | `--color-primary` | 主按钮、链接 |
| **Primary-FG** | `#1F2937` | 220 9% 12% | `--color-primary-foreground` | 主按钮文本 |
| **Secondary** | `#1F2937` | 217 33% 17% | `--color-secondary` | 次级操作 |
| **Secondary-FG** | `#F3F4F6` | 210 40% 96% | `--color-secondary-foreground` | 次级按钮文本 |
| **Destructive** | `#EF4444` | 0 84% 60% | `--color-destructive` | 删除、危险操作 |
| **Destructive-FG** | `#FFFFFF` | 210 40% 96% | `--color-destructive-foreground` | 删除按钮文本 |
| **Muted** | `#E5E7EB` | 220 13% 91% | `--color-muted` | 禁用、二级 |
| **Muted-FG** | `#6B7280` | 217 33% 40% | `--color-muted-foreground` | 禁用文本 |
| **Accent** | `#F59E0B` | 38 92% 50% | `--color-accent` | 高亮、提示 |
| **Accent-FG** | `#1F2937` | 220 9% 12% | `--color-accent-foreground` | 高亮文本 |

#### **暗色模式（Dark Mode）**

| 颜色类型 | 16进制 | HSL | CSS变量 | 用途 |
|---------|--------|-----|---------|------|
| **Background** | `#0F172A` | 220 9% 8% | `--color-background` | 页面背景 |
| **Foreground** | `#F8FAFC` | 210 40% 96% | `--color-foreground` | 正文文本 |
| **Border** | `#1E293B` | 217 33% 17% | `--color-border` | 分割线、边框 |
| **Input** | `#1E293B` | 217 33% 17% | `--color-input` | 输入框背景 |
| **Ring** | `#3B82F6` | 215 100% 46% | `--color-ring` | Focus 环 |
| **Primary** | `#3B82F6` | 215 100% 46% | `--color-primary` | 主按钮、链接 |
| **Primary-FG** | `#1F2937` | 220 9% 12% | `--color-primary-foreground` | 主按钮文本 |
| **Secondary** | `#F3F4F6` | 210 40% 96% | `--color-secondary` | 次级操作 |
| **Secondary-FG** | `#1E293B` | 217 33% 17% | `--color-secondary-foreground` | 次级按钮文本 |
| **Destructive** | `#EF4444` | 0 84% 60% | `--color-destructive` | 删除、危险操作 |
| **Destructive-FG** | `#FFFFFF` | 0 0% 100% | `--color-destructive-foreground` | 删除按钮文本 |
| **Muted** | `#1E293B` | 217 33% 17% | `--color-muted` | 禁用、二级 |
| **Muted-FG** | `#94A3B8` | 215 14% 55% | `--color-muted-foreground` | 禁用文本 |
| **Accent** | `#F59E0B` | 38 92% 50% | `--color-accent` | 高亮、提示 |
| **Accent-FG** | `#1F2937` | 220 9% 12% | `--color-accent-foreground` | 高亮文本 |

### CSS 变量实现

```css
:root {
  /* Light Mode (Default) */
  --color-background: 0 0% 100%;
  --color-foreground: 220 9% 12%;
  --color-border: 220 13% 91%;
  --color-primary: 215 100% 46%;
  --color-secondary: 217 33% 17%;
  --color-accent: 38 92% 50%;
  /* ... 其他颜色 */
}

.dark {
  /* Dark Mode */
  --color-background: 220 9% 8%;
  --color-foreground: 210 40% 96%;
  --color-border: 217 33% 17%;
  --color-primary: 215 100% 46%;
  --color-secondary: 210 40% 96%;
  --color-accent: 38 92% 50%;
  /* ... 其他颜色 */
}
```

---

## III. 字体系统

### 字体栈

```typescript
// src/styles/globals.css
@layer base {
  :root {
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
      'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
      'Helvetica Neue', sans-serif;
  }
}
```

### 文字排版规范

| 级别 | 字号 | 行高 | 字重 | 用途 |
|------|------|------|------|------|
| **H1** | 32px | 40px (1.25) | 700 | 页面标题 |
| **H2** | 28px | 36px (1.29) | 700 | 板块标题 |
| **H3** | 24px | 32px (1.33) | 600 | 小节标题 |
| **H4** | 20px | 28px (1.4) | 600 | 卡片标题 |
| **Body** | 16px | 24px (1.5) | 400 | 正文段落 |
| **Body-sm** | 14px | 20px (1.43) | 400 | 辅助文本 |
| **Caption** | 12px | 18px (1.5) | 400 | 说明文字 |
| **Code** | 14px | 20px (1.43) | 500 | 代码块 |

### Tailwind 文本工具类

```typescript
// tailwind.config.ts 扩展
extend: {
  fontSize: {
    h1: ['32px', { lineHeight: '40px', fontWeight: '700' }],
    h2: ['28px', { lineHeight: '36px', fontWeight: '700' }],
    h3: ['24px', { lineHeight: '32px', fontWeight: '600' }],
    h4: ['20px', { lineHeight: '28px', fontWeight: '600' }],
    body: ['16px', { lineHeight: '24px', fontWeight: '400' }],
    'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
    caption: ['12px', { lineHeight: '18px', fontWeight: '400' }],
  },
}
```

---

## IV. 间距系统

### Tailwind Spacing 定义

基于 **4px 网格系统**（已内置 Tailwind，无需配置）

```
0    = 0px
1    = 4px
2    = 8px
3    = 12px
4    = 16px
5    = 20px
6    = 24px
8    = 32px
10   = 40px
12   = 48px
16   = 64px
20   = 80px
24   = 96px
```

### 推荐使用场景

| 值 | 用途 |
|-----|------|
| **px-4 py-2** | 按钮内间距 |
| **gap-4** | Grid/Flex 间距 |
| **my-4** | 卡片间距 |
| **mt-6 mb-4** | 标题段落间距 |
| **p-6** | 卡片内容区 |

---

## V. 圆角系统

### 半径定义

```typescript
// tailwind.config.ts
extend: {
  borderRadius: {
    lg: 'var(--radius-lg)',    // 0.5rem (8px)
    md: 'var(--radius-md)',    // 0.375rem (6px)
    sm: 'var(--radius-sm)',    // 0.25rem (4px)
  },
}
```

### 使用规范

| 半径 | 用途 |
|------|------|
| **rounded-lg** | 卡片、模态框、大型容器 |
| **rounded-md** | 按钮、输入框、小卡片 |
| **rounded-sm** | 标签、徽章、小组件 |

---

## VI. 阴影系统

### Tailwind 预设阴影（无需自定义）

```typescript
// 使用 Tailwind 内置阴影
shadow-sm   // 浮窗、下拉菜单
shadow-md   // 卡片、浮层
shadow-lg   // 模态框背景
```

### 高度分层

```
0   = 无阴影（扁平设计）
1   = shadow-sm → 轻微提升
2   = shadow-md → 中等提升
3   = shadow-lg → 强烈提升（顶层）
```

---

## VII. 组件设计规范

### 按钮（Button）

```typescript
interface ButtonProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: ReactNode
}

// 尺寸定义
sm: 'px-3 py-1.5 text-sm'      // 24px 高
md: 'px-4 py-2 text-base'      // 32px 高
lg: 'px-6 py-3 text-base'      // 40px 高
```

### 卡片（Card）

```tsx
<Card className="p-6 rounded-lg border border-border shadow-md">
  <CardHeader className="mb-4">
    <CardTitle>标题</CardTitle>
  </CardHeader>
  <CardContent>
    {/* 内容 */}
  </CardContent>
</Card>
```

### 输入框（Input）

```tsx
<Input
  className="px-3 py-2 rounded-md border border-border bg-input"
  placeholder="输入框"
/>
```

### 表单验证反馈

```tsx
<div className="space-y-2">
  <Input />
  {errors.field && (
    <p className="text-sm text-destructive">
      {errors.field.message}
    </p>
  )}
</div>
```

---

## VIII. 响应式设计

### Breakpoints（Tailwind 标准）

| 前缀 | 宽度 |
|------|------|
| **sm** | 640px |
| **md** | 768px |
| **lg** | 1024px |
| **xl** | 1280px |
| **2xl** | 1536px |

### 布局断点使用

```tsx
// 移动端优先（Mobile First）
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* 响应式网格 */}
</div>

// 条件显示
<div className="hidden md:block">
  {/* 仅在 md 以上显示 */}
</div>
```

---

## IX. 动画系统

### 过渡（Transitions）

```typescript
// tailwind.config.ts
extend: {
  animation: {
    'fade-in': 'fadeIn 200ms ease-in',
    'slide-up': 'slideUp 300ms ease-out',
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' },
    },
    slideUp: {
      '0%': { transform: 'translateY(10px)', opacity: '0' },
      '100%': { transform: 'translateY(0)', opacity: '1' },
    },
  },
}
```

### 推荐时长

| 类型 | 时长 |
|------|------|
| **Micro Interaction** | 150-200ms |
| **Page Transition** | 300-400ms |
| **Toast/Alert** | 300ms |
| **Modal Open** | 200ms |

---

## X. 深浅主题切换

### 暗黑模式实现

```typescript
// src/hooks/useTheme.ts
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }

  return { theme, toggleTheme }
}
```

### HTML 应用

```html
<!-- 亮色模式 -->
<html class="">
  <!-- Light Mode CSS Variables 应用 -->
</html>

<!-- 暗色模式 -->
<html class="dark">
  <!-- Dark Mode CSS Variables 应用 -->
</html>
```

---

## XI. 无障碍性（A11y）

### WCAG AA 标准

- **色彩对比度** ≥ 4.5:1（正文）、≥ 3:1（大文本）
- **焦点指示** — `:focus-visible` 必须可见
- **键盘导航** — 所有交互元素可键盘访问
- **语义 HTML** — 使用 `<button>`、`<input>`、`<label>` 等

### 实现示例

```tsx
<button
  className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
  aria-label="关闭"
>
  <X size={20} />
</button>
```

---

## XII. 快速参考

### 常用 Tailwind 类名

```tsx
// 布局
flex, grid, absolute, relative, fixed

// 间距
p-4, m-4, gap-4, mx-auto

// 颜色
bg-background, text-foreground, border-border

// 排版
text-h1, font-semibold, leading-tight

// 响应式
md:, lg:, hidden md:block

// 交互
hover:, focus:, disabled:, aria-*
```

### 主题切换快捷命令

```bash
# 检查当前主题配置
grep -r "dark:" src/styles/

# 全局替换主题变量
sed -i 's/--color-primary:/--color-primary-custom:/g' src/styles/globals.css
```

---

## XIII. 组件库集成（shadcn/ui）

### 预装组件

```bash
npx shadcn-ui@latest init -d
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
```

### 组件使用示例

```tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function Example() {
  return (
    <Card>
      <CardHeader>
        <h2>示例卡片</h2>
      </CardHeader>
      <CardContent>
        <Input placeholder="输入框" />
        <Button>提交</Button>
      </CardContent>
    </Card>
  )
}
```

---

## XIV. 版本管理

- **版本** — v1.0（初始版本）
- **更新日期** — 2026-06-29
- **维护者** — HuHaa-MySkills 前端团队
- **审核规则** — 主题变更需 PR 审查通过后方可合并

---

**下一步**: 
1. ✅ 主题配置已完成 → `src/styles/globals.css`
2. ⏳ 集成 shadcn/ui 组件库
3. ⏳ 创建布局组件（Header、Sidebar、Footer）
4. ⏳ 实现暗黑模式切换逻辑

