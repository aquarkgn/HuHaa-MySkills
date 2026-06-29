# 前端页面完整重构 — 详细设计简报

## 🎯 问题描述

当前页面布局存在以下问题:
1. **搜索和筛选条件展示不全** — 过滤栏空间不足，多个筛选选项无法同时显示
2. **布局比例不合理** — 左侧列表区域过小，右侧详情面板占用过多空间
3. **响应式设计缺失** — 不能适应不同屏幕尺寸
4. **样式不统一** — 没有清晰的设计系统，组件风格杂乱
5. **可访问性不足** — 缺少 ARIA 标签和键盘导航

## ✨ 设计目标

### 1. 新的布局架构

```
┌─────────────────────────────────────────────┐
│  Header (导航 + 统计信息 + 快速操作)        │  40px
├──────────────────────────────────────────────┤
│ Search Bar (搜索 + 快速过滤)                │  50px
├──────────────────┬──────────────────────────┤
│                  │                          │
│ Sidebar          │  Main Content Area      │
│ (过滤条件:       │                          │
│  • Source        │  • 左: 列表视图 (60%)   │
│  • Editor        │  • 右: 详情面板 (40%) │
│  • Kind          │                          │
│  • Brand)        │                          │
│                  │                          │
│ 200px            │ 1000px+                 │
└──────────────────┴──────────────────────────┘
```

### 2. 核心改进点

#### A. Header 重设计
- 移到顶部，包含：
  - 左: Logo + 项目名
  - 中: 统计信息 (总数、过滤状态)
  - 右: 视图切换、设置、导出

#### B. 搜索栏优化
- 全宽搜索框 (支持快速输入)
- 下方显示活跃过滤 (chip 形式，可点击清除)
- 快速过滤按钮 (常用组合)

#### C. 左侧 Sidebar 完全重构
- 展开/折叠按钮
- 每个过滤维度占一个 section：
  ```
  📂 Source (6/7)
  [x] Hermes (146)
  [x] Skills (22)
  [ ] Cursor (3)
  ... (with search)
  
  📋 Kind (6/8)
  [x] skill (180)
  [x] plugin (40)
  ...
  
  🎨 Brand (17/48)
  [x] Docker (12)
  [x] GitHub (8)
  ...
  
  ✏️ Editor (5/6)
  [x] Hermes Agent (100)
  ...
  ```

#### D. 主内容区重构
- **左侧列表** (60% 宽度):
  - 网格/列表/树形视图切换
  - 虚拟滚动 (性能优化)
  - 搜索高亮
  - 品牌 icon 显示
  - 快速操作菜单 (右键)
  
- **右侧详情面板** (40% 宽度):
  - Sticky header (标题 + 操作按钮)
  - 品牌横幅 (大图)
  - 详细信息分段显示
  - 可复制代码块
  - Markdown 渲染优化

#### E. 响应式设计
- Desktop (>1400px): 3 栏 (sidebar + list + detail)
- Laptop (1024-1400px): 2 栏 (sidebar + combined)
- Tablet (768-1024px): 2 栏 (collapsed sidebar + main)
- Mobile (<768px): 1 栏 (full screen)

### 3. 技术栈优化

#### 依赖增加
```json
{
  "vue": "^3.4.0",
  "vue-virtual-scroller": "^2.0.0",  // 虚拟滚动
  "lucide-vue-next": "^0.263.0",     // 图标库
  "headlessui-vue": "^1.7.0",        // 可访问性组件
  "tailwindcss": "^3.3.0"            // CSS 工具类 (可选)
}
```

#### 文件结构重组
```
src/
  components/
    Layout/
      Header.vue            (新)
      Sidebar.vue           (新)
      MainContent.vue       (新)
      SearchBar.vue         (新)
    List/
      SkillList.vue         (改)
      SkillCard.vue         (新)
      VirtualList.vue       (新)
    Detail/
      DetailPanel.vue       (改)
      DetailHeader.vue      (新)
      DetailMeta.vue        (新)
      DetailBranding.vue    (新)
    Filters/
      FilterSection.vue     (新)
      FilterChip.vue        (新)
      QuickFilter.vue       (新)
  lib/
    layouts.css            (新)
    responsive.css         (新)
    branding.css           (新)
    animations.css         (新)
```

### 4. 样式系统

#### 颜色系统
```
Primary:    #7c3aed (紫色)
Secondary:  #10b981 (绿色)
Success:    #06b6d4 (青色)
Warning:    #f59e0b (黄色)
Error:      #ef4444 (红色)
Neutral:    #6b7280 - #1f2937 (灰色系)
```

#### 排版系统
```
Display:    32px 600 (页面标题)
Headline:   24px 600 (Section 标题)
Title:      16px 600 (组件标题)
Body:       14px 400 (正文)
Caption:    12px 400 (辅助)
```

#### 间距系统 (8px 基数)
```
xs: 4px
sm: 8px
md: 16px
lg: 24px
xl: 32px
2xl: 48px
```

### 5. 交互增强

#### 键盘导航
- `Cmd/Ctrl + K` — 打开搜索
- `↑/↓` — 列表导航
- `→/←` — 展开/折叠
- `Enter` — 选中
- `Esc` — 关闭详情面板

#### 动画
- Sidebar 展开/折叠: 200ms 缓动
- 列表项 Hover: 微妙背景变化
- 详情面板出现: 300ms 淡入 + 向上滑动
- 标签芯片: 点击时缩放反馈

#### 可访问性
- 所有交互元素 `tab-index` 和 ARIA 标签
- 高对比度文本 (WCAG AA)
- Focus 视觉指示器
- 屏幕阅读器支持

## 📋 实现阶段

### Phase 1: 布局基础 (2h)
- [ ] 重构 HTML 结构 (Layout 组件)
- [ ] 实现 CSS Grid/Flexbox 布局
- [ ] 响应式设计（移动优先）
- [ ] 基础样式变量

### Phase 2: 组件分解 (2h)
- [ ] Header 组件
- [ ] Sidebar 过滤组件
- [ ] SearchBar 组件
- [ ] 过滤标签芯片

### Phase 3: 列表优化 (1.5h)
- [ ] 虚拟滚动集成
- [ ] SkillCard 组件优化
- [ ] 品牌 icon 显示
- [ ] 快速操作菜单

### Phase 4: 详情面板 (1.5h)
- [ ] 详情头部 (Sticky)
- [ ] 元数据显示优化
- [ ] 代码块高亮
- [ ] 可复制按钮

### Phase 5: 交互和动画 (1h)
- [ ] 键盘导航
- [ ] 过渡动画
- [ ] 加载状态
- [ ] 错误提示

### Phase 6: 测试和优化 (1h)
- [ ] 性能测试 (Lighthouse)
- [ ] 可访问性审计
- [ ] 浏览器兼容性
- [ ] 响应式测试

**总计**: 9 小时

## 🎨 设计参考

- Figma 组件库风格
- Linear.app 的侧边栏设计
- GitHub 的列表和过滤 UX
- Stripe 的响应式设计

## 🚀 开发指南

### 禁止使用
- ❌ Bootstrap (过重)
- ❌ Inline styles (使用 CSS 变量)
- ❌ Any 类型 (TypeScript strict)
- ❌ 响应式 magic numbers (使用 CSS 变量)

### 必须使用
- ✅ Tailwind (或 BEM + CSS 变量)
- ✅ Vue 3 Composition API
- ✅ TypeScript strict
- ✅ 语义化 HTML (`<aside>`, `<nav>`, `<section>`)
- ✅ ARIA 属性
- ✅ CSS 变量做响应式

### 文档要求
- 每个组件有 PropTypes 定义
- 每个 CSS 模块有注释说明布局逻辑
- README 说明如何添加新的过滤维度

## ✅ 验收标准

- [ ] 所有 4 个过滤维度同时可见 (Sidebar)
- [ ] 列表和详情面板宽度比例 60:40
- [ ] 移动设备上完全可用 (<768px)
- [ ] 所有 4 种视图模式都能工作
- [ ] Lighthouse 性能评分 >= 90
- [ ] 零 TypeScript 错误
- [ ] 零 Eslint 警告
- [ ] 响应式测试通过 (Chrome, Safari, Firefox)
