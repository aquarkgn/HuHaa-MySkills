# 🚀 HuHaa-MySkills 文档导航

> 完整项目规范与架构文档

---

## 📚 核心文档

### 工程规范

- **[Frontend-Engineering.md](./Frontend-Engineering.md)** — 全项目通用前端工程规范
  - 技术栈标准 | 版本管理 | 目录结构 | 代码质量 | Git 工作流 | 测试规范 | CI/CD | 代码审查

- **[Frontend-Theme-Design.md](./Frontend-Theme-Design.md)** — 完整设计系统与主题文档
  - 色彩系统 | 字体排版 | 间距系统 | 圆角系统 | 阴影系统 | 组件规范 | 响应式设计 | 动画系统 | 无障碍性

- **[Frontend-Framework-Setup.md](./Frontend-Framework-Setup.md)** — Next.js 前端框架初始化文档
  - 技术栈定型 | 项目结构 | 核心配置 | 最佳实践 | 快速启动 | 下一步计划

### 业务需求

- **[hermes_docs_project_plan.md](./hermes_docs_project_plan.md)** — 项目需求与功能规划

---

## 🎯 快速入手

### 1. 环境设置

```bash
cd /Users/mac/Project/HuHaa-MySkills/web
npm install
npm run dev
# 访问 http://localhost:3000
```

### 2. 代码检查

```bash
npm run type-check    # TypeScript 类型检查
npm run lint          # ESLint 检查
npm run format        # Prettier 格式化
npm run build         # 生产构建
```

### 3. 提交规范

遵循 `Frontend-Engineering.md` 中的 **Conventional Commits** 规范：

```bash
git commit -m "feat(header): 添加主题切换按钮"
git commit -m "fix(theme): 修复暗色模式样式"
git commit -m "refactor(types): 统一 API 类型定义"
```

---

## 🏗️ 项目结构

```
HuHaa-MySkills/
├── web/                              # Next.js 前端项目
│   ├── app/
│   │   ├── layout.tsx                # 根布局
│   │   ├── page.tsx                  # 首页
│   │   └── globals.css               # 全局样式 + 主题变量
│   ├── components/
│   │   ├── layout/                   # 布局组件
│   │   ├── ui/                       # shadcn/ui 组件
│   │   └── common/                   # 业务组件
│   ├── hooks/
│   │   └── useTheme.tsx              # 主题管理
│   ├── lib/
│   │   ├── cn.ts                     # 工具函数
│   │   └── api.ts                    # API 请求
│   ├── types/
│   │   └── index.ts                  # 全局类型定义
│   ├── tsconfig.json                 # TS 配置 (strict)
│   ├── tailwind.config.ts            # Tailwind 配置
│   ├── next.config.ts                # Next.js 配置
│   └── package.json
│
├── docs/                             # 项目文档
│   ├── INDEX.md                      # 本文件（文档导航）
│   ├── Frontend-Engineering.md       # 工程规范
│   ├── Frontend-Theme-Design.md      # 设计系统
│   ├── Frontend-Framework-Setup.md   # 框架初始化
│   └── hermes_docs_project_plan.md   # 项目需求
│
├── README.md                         # 项目主文档
├── CLAUDE.md                         # AI 助手协作规则
└── package.json
```

---

## ✅ 当前进度

| 环节 | 状态 | 备注 |
|------|------|------|
| **Next.js 项目初始化** | ✅ 完成 | v15 + React 18 + TypeScript |
| **TypeScript Strict 配置** | ✅ 完成 | 严格模式，禁用 any |
| **Tailwind CSS 主题系统** | ✅ 完成 | CSS 变量 + 亮/暗模式 |
| **项目目录结构** | ✅ 完成 | 按规范创建各层目录 |
| **全局类型定义** | ✅ 完成 | User, Skill, API Response |
| **工具函数库** | ✅ 完成 | cn() 类名合并工具 |
| **主题 Hook** | ✅ 完成 | useTheme() 主题切换 |
| **Header 组件** | ✅ 完成 | 导航 + 主题切换按钮 |
| **首页示例** | ✅ 完成 | Hero + Feature Grid |
| **生产构建** | ✅ 成功 | npm run build 可正常构建 |

---

## 🎨 主题设计一瞥

### 色彩系统

#### 亮色模式
```
Primary (蓝色):     #3B82F6
Secondary (深灰):   #1F2937
Accent (琥珀):      #F59E0B
Background (白):    #FFFFFF
```

#### 暗色模式
```
Primary (蓝色):     #3B82F6
Secondary (浅灰):   #F3F4F6
Accent (琥珀):      #F59E0B
Background (深):    #0F172A
```

### 响应式断点

```
sm: 640px    | md: 768px    | lg: 1024px    | xl: 1280px    | 2xl: 1536px
```

---

## 📋 开发工作流

### 功能开发流程

```
1. 创建 feature/xxx 分支
2. 实现功能 + 编写测试
3. npm run lint && npm run build && npm run test
4. 创建 PR 并等待 CI 通过
5. 代码审查 + 优化
6. Squash & Merge 到 main
```

### 代码审查清单

- ✅ 功能正确性 — 逻辑无误、满足需求
- ✅ 代码质量 — 易读、无冗余、遵循规范
- ✅ 类型安全 — 无 any、类型完整
- ✅ 性能 — 无明显瓶颈、无不必要重渲染
- ✅ 测试覆盖 — 关键路径有测试
- ✅ 文档 — 复杂逻辑有注释

---

## 🔗 外部资源

- **[Next.js 官方文档](https://nextjs.org/docs)**
- **[Tailwind CSS 文档](https://tailwindcss.com/docs)**
- **[React 官方文档](https://react.dev)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs)**
- **[shadcn/ui 组件库](https://ui.shadcn.com)**

---

## 🛠️ 常见命令

```bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 生产构建
npm run start            # 启动生产服务器

# 检查
npm run type-check       # TypeScript 类型检查
npm run lint             # ESLint 代码检查
npm run format           # Prettier 格式化
npm run format:check     # 检查格式是否符合

# 测试（待配置）
npm test                 # 运行测试
npm run test:watch       # 监听模式运行测试
npm run test:coverage    # 生成覆盖率报告
```

---

## 📞 需要帮助？

- 查看 `Frontend-Engineering.md` 了解工程规范
- 查看 `Frontend-Theme-Design.md` 了解设计系统
- 查看 `Frontend-Framework-Setup.md` 了解框架配置
- 查看 `CLAUDE.md` 了解 AI 协作规则

---

**最后更新** — 2026-06-29  
**版本** — v1.0 (Framework Init)  
**状态** — ✅ 可立即开始迭代开发

