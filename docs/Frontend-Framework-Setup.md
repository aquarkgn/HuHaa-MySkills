# 🚀 HuHaa-MySkills 前端框架说明

> **Vite + React 18 + TypeScript(strict) + Tailwind + shadcn 风格组件**
> 位置：`packages/web`　|　产物：`packages/web/dist`（由 Fastify 静态托管）

---

## 📋 技术栈定型

| 维度 | 选型 | 说明 |
|------|------|------|
| 构建工具 | **Vite 6** | 输出纯静态 SPA，由后端 Fastify 托管 |
| 运行时 | **React 18.3** | 函数组件 + Hooks |
| 语言 | **TypeScript 5.x (strict)** | 禁 `any` / `@ts-ignore` |
| 样式 | **Tailwind CSS 3.4** | CSS 变量驱动主题 |
| 组件 | **shadcn 风格**（`cva + cn` 手写） | 不跑官方 CLI，按需手写 |
| 图标 | **lucide-react** | |
| 搜索 | **Fuse.js** | 客户端模糊搜索 |
| 取数 | **fetch** → Fastify `/api/*` | 同源，dev 由 vite 代理 |

> 路线决策与否决理由见 **[Frontend-Refactor-Plan.md](./Frontend-Refactor-Plan.md)**。

---

## 🏗️ 服务与构建模型

```
huhaa-myskills start
  └─ Fastify(packages/server) :11520
       ├─ /api/*               # skills/stats/events/copy/open/translate/reload
       ├─ /            → packages/web/dist/index.html
       └─ /assets/*    → packages/web/dist/assets/*

npm run build:web → build/build-web.mjs → (packages/web) vite build → dist/
```

- 前端 `base='/'`、`assetsDir='assets'`，与服务器静态路由约定一致。
- 服务器侧（`packages/server/src/index.mjs`）无需为前端改动。

---

## 📁 目录结构

```
packages/web/
├── index.html              # <div id="app"> + 防暗色首屏闪烁脚本
├── vite.config.ts          # React 插件 / @ 别名 / dev 代理 /api→11520
├── tsconfig.json           # strict
├── tailwind.config.ts      # 主题 token（见 Frontend-Theme-Design.md）
├── postcss.config.js
├── public/                 # favicon / manifest 等静态资源
└── src/
    ├── main.tsx            # 入口，挂载到 #app
    ├── index.css          # 主题 CSS 变量(亮/暗) + 三栏布局类
    ├── types.ts           # SkillItem / Stats（镜像后端 IR）
    ├── lib/
    │   ├── cn.ts          # clsx + tailwind-merge 类名合并
    │   └── api.ts         # 类型化 API 客户端
    ├── hooks/
    │   └── useTheme.ts    # 亮/暗主题切换 + 持久化
    └── components/
        ├── ui/            # button / card（shadcn 风格）
        └── layout/        # Sidebar / Topbar
```

---

## 🎨 设计系统对接

色板、字体、间距、圆角、阴影、动画、无障碍规范见 **[Frontend-Theme-Design.md](./Frontend-Theme-Design.md)**。

落地方式：
- 颜色以 HSL 通道值存于 `src/index.css` 的 CSS 变量（`:root` 亮色 / `.dark` 暗色）。
- `tailwind.config.ts` 通过 `hsl(var(--color-x) / <alpha-value>)` 暴露为 Tailwind 颜色 token。
- 主题切换通过 `<html>` 上的 `.dark` 类（`useTheme` Hook 控制，`index.html` 内联脚本防首屏闪烁）。

---

## 🔧 核心配置

### TypeScript Strict
`tsconfig.json` 开启 `strict`、`noUnusedLocals`、`noUnusedParameters`；路径别名 `@/* → src/*`。

### Tailwind 主题 token
颜色全部走 CSS 变量；`darkMode: 'class'`；扩展了 `fontSize`(h1~caption)、`borderRadius`、`fontFamily`。

### 三栏布局类（重要约束）
`src/index.css` 的 `.sidebar` / `.topbar` / `.detail` 同时被 `build/verify.mjs` 的 CSS 冒烟断言引用，**重命名需同步改 verify**。

---

## 🏃 快速启动

```bash
# 本机 NODE_ENV=production，需显式带 dev 依赖安装构建工具链
NODE_ENV=development npm install --include=dev

# 生产方式：构建 + 启动后端托管
npm run build:web
npm start                     # → http://localhost:11520

# 开发方式：前后端分离
npm start                     # 终端 A：后端 API(11520)
cd packages/web && npm run dev # 终端 B：前端 dev(11521)，/api 代理到 11520
```

### 质量检查
```bash
npm run verify                                  # 构建 + 单测 + HTTP/API/静态冒烟
cd packages/web && ../../node_modules/.bin/tsc --noEmit   # TS strict 类型检查
```

---

## 🎯 下一步

分阶段路线（P1 组件库补全 → P2 详情 markdown 渲染 → P3 copy/open/SSE → P4 翻译/多维筛选 → P5 测试与无障碍）见 **[Frontend-Refactor-Plan.md](./Frontend-Refactor-Plan.md)**。

---

## 🔗 相关资源

- [Vite 官方文档](https://vite.dev)
- [React 官方文档](https://react.dev)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [shadcn/ui 组件参考](https://ui.shadcn.com)

---

## ✍️ 提交规范

遵循 Conventional Commits（见 `CLAUDE.md` / `Frontend-Engineering.md`）：

```
# 格式：<type>(<scope>): <subject>
feat(web): 添加技能详情 markdown 渲染
fix(theme): 修复暗色模式对比度
refactor(web): 抽取列表卡片组件
```
