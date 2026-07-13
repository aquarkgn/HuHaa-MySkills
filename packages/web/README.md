# @skillhelper/web

SkillHelper 的前端 SPA：**Vite + React 18 + TypeScript(strict) + Tailwind + shadcn 风格组件**。

## 构建与托管

- 产物输出到 `dist/`，由 `packages/server`（Fastify）静态托管：
  - `dist/index.html` → `GET /`
  - `dist/assets/*` → `GET /assets/*`
- 仓库根目录 `npm run build:web` 会调用本包的 `vite build`。
- 生产访问入口：`http://localhost:11520`（由 `npm start` 启动 Fastify）。

## 本地开发

```bash
# 终端 A：启动后端 API（11520）
npm start            # 仓库根目录

# 终端 B：启动前端 dev server（11521，/api 代理到 11520）
cd packages/web && npm run dev
```

## 目录

```
src/
├── main.tsx              # 入口，挂载到 #app
├── index.css            # 主题 token + 三栏布局类
├── types.ts             # SkillItem / Stats（镜像后端 IR）
├── lib/{cn,api}.ts      # 类名合并 / 后端 API 客户端
├── hooks/useTheme.ts    # 亮/暗主题切换
├── components/ui/        # shadcn 风格基础组件
└── components/layout/    # Sidebar / Topbar
```

设计规范见 `docs/Frontend-Theme-Design.md`，框架说明见 `docs/Frontend-Framework-Setup.md`。
