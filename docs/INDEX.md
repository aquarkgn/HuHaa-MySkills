# 🚀 HuHaa-MySkills 文档导航

> 完整项目规范与架构文档

---

## 📚 核心文档

### 工程规范

- **[Frontend-Engineering.md](./Frontend-Engineering.md)** — 全项目通用前端工程规范
  - 技术栈标准 | 版本管理 | 目录结构 | 代码质量 | Git 工作流 | 测试规范 | CI/CD | 代码审查

- **[Frontend-Theme-Design.md](./Frontend-Theme-Design.md)** — 完整设计系统与主题文档
  - 色彩系统 | 字体排版 | 间距系统 | 圆角系统 | 阴影系统 | 组件规范 | 响应式设计 | 动画系统 | 无障碍性

- **[Frontend-Framework-Setup.md](./Frontend-Framework-Setup.md)** — Vite + React 前端框架说明
  - 技术栈定型 | 服务与构建模型 | 项目结构 | 核心配置 | 快速启动

- **[Frontend-Refactor-Plan.md](./Frontend-Refactor-Plan.md)** — 前端重构计划（路线决策 + 执行清单 + 分阶段路线）

### 业务需求

- **[hermes_docs_project_plan.md](./hermes_docs_project_plan.md)** — 项目需求与功能规划

---

## 🎯 快速入手

### 1. 环境设置

```bash
# 本机 NODE_ENV=production，需显式带 dev 依赖安装构建工具链
NODE_ENV=development npm install --include=dev
npm run build:web        # 构建前端 → packages/web/dist
npm start                # 启动后端托管 → http://localhost:11520
```

### 2. 代码检查

```bash
npm run verify                                  # 构建 + 单测 + HTTP/API/静态冒烟
cd packages/web && ../../node_modules/.bin/tsc --noEmit   # TypeScript strict 类型检查
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
├── packages/
│   ├── web/                          # Vite + React 前端 SPA
│   │   ├── index.html                # 入口（#app 挂载点）
│   │   ├── vite.config.ts            # 构建/dev 配置
│   │   ├── tailwind.config.ts        # 主题 token
│   │   └── src/
│   │       ├── main.tsx              # 入口
│   │       ├── index.css            # 主题变量 + 三栏布局
│   │       ├── types.ts             # SkillItem / Stats
│   │       ├── lib/{cn,api}.ts       # 工具 / API 客户端
│   │       ├── hooks/useTheme.ts     # 主题切换
│   │       └── components/{ui,layout}/
│   ├── server/                       # Fastify 后端（:11520，托管 dist + /api/*）
│   └── scanner/                      # 技能扫描 → IR
│
├── docs/                             # 项目文档
│   ├── INDEX.md                      # 本文件（文档导航）
│   ├── Frontend-Engineering.md       # 工程规范
│   ├── Frontend-Theme-Design.md      # 设计系统
│   ├── Frontend-Framework-Setup.md   # 框架说明（Vite + React）
│   ├── Frontend-Refactor-Plan.md     # 前端重构计划
│   └── hermes_docs_project_plan.md   # 项目需求
│
├── bin/ build/ config/ scripts/      # CLI / 构建 / 配置
├── README.md                         # 项目主文档
├── CLAUDE.md                         # AI 助手协作规则
└── package.json
```

---

## ✅ 当前进度

| 环节 | 状态 | 备注 |
|------|------|------|
| **旧前端清理** | ✅ 完成 | 删除 Next.js 骨架 + 清空旧 Vue 源码 |
| **Vite + React 脚手架** | ✅ 完成 | Vite 6 + React 18 + TS strict |
| **Tailwind 主题系统** | ✅ 完成 | CSS 变量 + 亮/暗模式 |
| **三栏外壳布局** | ✅ 完成 | Sidebar + Topbar + 列表/详情 |
| **API 客户端 + 类型** | ✅ 完成 | 镜像后端 SkillItem |
| **客户端搜索** | ✅ 完成 | Fuse.js 模糊搜索 |
| **主题切换 Hook** | ✅ 完成 | useTheme + 持久化 |
| **构建链接线** | ✅ 完成 | build:web 不变，服务器零改动 |
| **verify 校验** | ✅ 通过 | 构建 + 单测 + 冒烟全绿 |
| **11520 访问** | ✅ 正常 | 托管 React SPA，返回真实数据 |

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

- **[Vite 官方文档](https://vite.dev)**
- **[Tailwind CSS 文档](https://tailwindcss.com/docs)**
- **[React 官方文档](https://react.dev)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs)**
- **[shadcn/ui 组件库](https://ui.shadcn.com)**

---

## 🛠️ 常见命令

```bash
# 安装（本机 NODE_ENV=production，需带 dev 依赖）
NODE_ENV=development npm install --include=dev

# 构建与运行
npm run build:web        # 构建前端 → packages/web/dist
npm start                # 启动后端托管 → http://localhost:11520
npm stop                 # 停止服务

# 前端开发（前后端分离）
cd packages/web && npm run dev    # 前端 dev(11521)，/api 代理到 11520

# 检查
npm run verify                                  # 构建 + 单测 + HTTP/API/静态冒烟
npm test                                        # scanner + server 单测
cd packages/web && ../../node_modules/.bin/tsc --noEmit   # 前端 TS strict 检查
```

---

## 📞 需要帮助？

- 查看 `Frontend-Engineering.md` 了解工程规范
- 查看 `Frontend-Theme-Design.md` 了解设计系统
- 查看 `Frontend-Framework-Setup.md` 了解框架配置
- 查看 `CLAUDE.md` 了解 AI 协作规则

---

**最后更新** — 2026-06-30  
**版本** — v2.0 (Vite + React 重构)  
**状态** — ✅ 基础重构已落地，可迭代业务功能

