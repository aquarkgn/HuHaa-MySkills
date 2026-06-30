# 🔧 HuHaa-MySkills 前端重构计划

> 路线决策记录 + 执行清单 + 分阶段路线
> 状态：**基础重构已落地（脚手架可构建、可访问）**，业务功能按阶段推进
> 最后更新：2026-06-30

---

## I. 背景与问题

重构前仓库存在 **两套并存且均为空壳** 的前端：

| 目录 | 技术栈 | 实际状态 |
|------|--------|---------|
| `web/` | Next.js 15 + React 18 | 仅 `Hello World`，未接入服务模型 |
| `packages/web/` | Vue 3 + Vite | `App.vue` 仅剩 "redesign in progress" 注释 |

同时 `docs/` 下的设计文档（主题、框架）面向 Next.js 编写，与真正运行的产品脱节。
`http://localhost:11520` 白屏的根因：服务器读取 `packages/web/dist`，而该产物从未构建。

---

## II. 路线决策

### 产品架构约束

HuHaa-MySkills 是 **npm 发布的本地 CLI 工具**：

```
huhaa-myskills start
  └─ Fastify(packages/server) 监听 11520
       ├─ 扫描磁盘技能/插件/MCP → IR
       ├─ 暴露 /api/*（skills/stats/events(SSE)/copy/open/translate/reload）
       └─ 静态托管前端构建产物：dist/index.html + dist/assets/*
```

前端必须产出 **可被 Fastify 静态托管的纯静态资源**，并通过 `/api/*` 取数。

### 决策：Vite + React + Tailwind + shadcn 风格组件

| 候选 | 结论 | 理由 |
|------|------|------|
| **Vite + React + shadcn** ✅ **采用** | 保留 `packages/web` 服务模型，删除 `web/` | 直接落地主题文档的 Tailwind/shadcn 设计体系；`vite build → dist → Fastify` 链路不变，服务器零改动；包体最小，最契合 CLI 工具 |
| Next.js（静态导出） | 否决 | SSR/服务端组件/Next API 在「Fastify 托管纯静态」模型下全部闲置；需改服务器静态路径(`_next/` vs `/assets/`)、构建链、发布流程，徒增复杂度 |
| 保留 Vue + 适配主题 | 否决 | 与已写的 React/shadcn 设计文档冲突，shadcn 组件层无法复用 |

> 决策依据：CLI 工具的前端价值在「轻量静态 SPA + 清晰取数」，Next.js 属于过度工程。

---

## III. 已执行的清理与重建

### 清理
- `git rm -r web/`（删除 Next.js 空骨架，含 `.next/`）
- 清空 `packages/web/src/`（移除 Vue 的 `App.vue`/`main.js`/`stores/`/`lib/`/`styles.css`）
- 删除旧 `vite.config.js`（Vue）、重写 `packages/web/package.json` 为 React 工具链

### 重建（`packages/web`）
```
packages/web/
├── index.html              # <div id="app"> + 防暗色闪烁内联脚本
├── vite.config.ts          # React 插件 / @ 别名 / dist 输出 / dev 代理 /api→11520
├── tsconfig.json           # strict，禁 any
├── tailwind.config.ts      # 主题 token（取自 Frontend-Theme-Design.md）
├── postcss.config.js
└── src/
    ├── main.tsx            # 挂载到 #app
    ├── index.css          # CSS 变量(亮/暗) + 三栏布局类(sidebar/topbar/detail)
    ├── types.ts           # SkillItem / Stats（镜像后端 IR）
    ├── lib/{cn,api}.ts     # 类名合并 / 类型化 API 客户端
    ├── hooks/useTheme.ts   # 亮/暗主题切换 + 持久化
    ├── components/ui/      # shadcn 风格 button / card（cva + cn 手写）
    ├── components/layout/  # Sidebar（按 kind 过滤）/ Topbar（搜索 + 主题切换 + reload）
    └── App.tsx            # 三栏外壳：列表(Fuse.js 搜索) + 详情
```

### 构建链接线
- 根 `package.json` devDeps：`vue/pinia/@vitejs/plugin-vue` → React/Vite/Tailwind 工具链
- `build:web`（`build/build-web.mjs` 调 vite build）**保持不变**
- 服务器 `packages/server/src/index.mjs` **零改动**

---

## IV. 关键约束（改动时务必遵守）

1. **挂载节点 id 必须为 `app`** —— `build/verify.mjs` 断言 `index.html` 含 `<div id="app"></div>`。
2. **CSS 必须为独立文件且含 `sidebar`/`topbar`/`detail` 类名** —— verify 的静态冒烟断言引用；重命名三栏类需同步改 verify。
3. **资源走 `/assets/*`，`base='/'`** —— 与服务器 `/` 与 `/assets/*` 路由约定一致，勿改 `assetsDir`。
4. **TypeScript strict、禁 `any`/`@ts-ignore`** —— 见 CLAUDE.md。
5. **前端 `types.ts` 与后端 `packages/scanner/src/types.d.ts` 的 `SkillItem` 保持同步**。

---

## V. 分阶段路线

| 阶段 | 内容 | 状态 |
|------|------|------|
| **P0 基础重构** | 清理旧栈 + Vite/React 脚手架 + 主题 token + 三栏外壳 + 列表/详情 + 搜索 | ✅ 已完成 |
| **P1 组件库补全** | input / dialog / badge / tabs / tooltip 等 shadcn 风格组件 | ⏳ 待办 |
| **P2 详情增强** | `/api/skills/:id` 拉取 raw，markdown-it 渲染正文 + 代码高亮 | ⏳ 待办 |
| **P3 交互动作** | 接 `/api/copy`、`/api/open`；`/api/events`(SSE) 文件变更实时 reload | ⏳ 待办 |
| **P4 翻译/多源** | 接 `/api/translate`；按 source/editor/brand 多维筛选 | ⏳ 待办 |
| **P5 质量** | 组件测试（覆盖率 ≥ 80%）、无障碍(WCAG AA)、构建分包优化 | ⏳ 待办 |

---

## VI. 验证方式

```bash
# 安装（本机 NODE_ENV=production，需显式带 dev 依赖）
NODE_ENV=development npm install --include=dev

npm run build:web         # vite build → packages/web/dist
npm run verify            # 构建 + 单测 + HTTP/API/静态冒烟（含 #app/assets/布局类断言）
cd packages/web && ../../node_modules/.bin/tsc --noEmit   # TS strict 类型检查
npm start                 # 启动 → http://localhost:11520
```

P0 验收基线（已通过）：`verify` 全绿、`tsc --noEmit` 0 错误、11520 实际托管 React SPA 并返回真实技能数据。

---

## VII. 已知遗留（非本次范围）

- **发布产物未含预构建 dist**：`package.json` 无 `prepare` 钩子，`files` 未含 `packages/web/dist`。npm 消费者安装后若未构建，仍看服务器内置占位页。后续应在 `prepare`/`prepublishOnly` 接入 `build:web`，或将 dist 纳入发布产物。
- **本机环境 `NODE_ENV=production` + npm `omit=dev`**：导致默认 `npm install` 跳过构建工具链，需带 `--include=dev`。
