# CLAUDE.md — 项目 AI 助手协作规则

> 本文档规范了 Claude Code 在本项目中的工作方式和原则。基于「通用 GitHub 项目前端管理规范」。

---

## 🎯 核心原则（五大基础）

### 1. 全中文沟通
- **对话、提示、提交信息、文档** 统一使用简体中文
- 外来词汇保留英文（React、Node.js、TypeScript），解释和上下文中文
- 代码（变量、函数、类）保持英文，注释用中文

### 2. 一致性第一
- 遵循 `docs/GITHUB_FRONTEND_STANDARDS.md` 的规范
- 所有前端项目使用相同的技术栈、目录结构、命名约定
- 代码风格通过 ESLint + Prettier 自动化强制
- 主题系统（颜色、圆角、阴影）集中管理，禁止硬编码

### 3. 质量第一
- **类型安全**：TypeScript strict 模式，禁止 `any` 和 `@ts-ignore`
- **测试覆盖**：核心功能 >= 95%，总体 >= 80%
- **代码审查**：推送前必须 `/code-review`，应用建议
- **性能达标**：LCP <= 2.5s，Initial Bundle <= 200KB（gzip）

### 4. 工程纪律
- **单一职责**：每个 commit 一个明确的目标，提交信息用中文说明 WHY
- **最小改动**：修复 Bug 不顺手优化，新功能不包含重构
- **文档优先**：规范文档是基础，所有决策可追溯，代码补充规范而非替代
- **自动化优先**：能通过 CI/CD、lint、format 自动化的事不手动做

### 5. 工作流
- **Plan 先行**：设计决策使用 Plan 模式对齐，代码审查用 `/code-review` 工具
- **增量交付**：优先完成可用最小版本，在 review 反馈基础上打磨
- **仓库优先**：所有决策、知识都写入代码、commit message、文档，不依赖口头传达

---

## 📋 编码规范

### 目录结构（参考标准规范）
```
src/
  ├── app/            # 路由和页面
  ├── components/
  │   ├── ui/        # shadcn/ui 基础组件
  │   └── common/    # 通用业务组件
  ├── features/      # 功能模块
  ├── hooks/         # React Hooks
  ├── lib/           # 工具函数
  ├── types/         # 全局类型定义
  ├── config/        # 项目配置
  ├── constants/     # 常量
  └── styles/        # 全局样式
```

### 命名约定
- **React 组件**：PascalCase（`UserCard.tsx`）
- **函数/变量**：camelCase（`fetchUserData`）
- **常量**：UPPER_SNAKE_CASE（`MAX_RETRY_COUNT`）
- **类型/接口**：PascalCase（`UserProfile`）
- **样式类**：kebab-case（`admin-card`）

### TypeScript 严格要求
- `"strict": true` 强制
- 禁止 `any`、`@ts-ignore`、`@ts-nocheck`
- 共享类型放在 `src/types/` 中央
- 接口明确定义，不用 `React.FC`

### React 组件规范
- **函数式组件** + Hooks，禁止 Class
- **Props 必须明确类型**：
  ```tsx
  interface UserCardProps {
    name: string
    onSelect?: (id: string) => void
  }
  ```
- **ESLint react-hooks** 规则强制遵守
- **所有异步** 在 useEffect 中管理

### 代码行数限制
```
页面文件（page.tsx）     → < 120 行
组件文件              → < 200 行
复杂业务组件          → < 300 行
工具函数文件          → < 200 行
单函数               → < 40 行
```

---

## 🔄 提交规范

### 提交信息格式（Conventional Commits）
```
<type>(<scope>): <简短描述>

<详细说明（可选）>

<页脚（可选）>
```

### Type 类型
- `feat`：新功能
- `fix`：修复 bug
- `refactor`：重构（不改功能）
- `perf`：性能优化
- `test`：添加/修改测试
- `docs`：文档更新
- `style`：代码格式（不改逻辑）
- `chore`：构建、依赖、配置

### 提交示例

```
feat(dashboard): 添加实时数据更新

使用 WebSocket 替代轮询，性能提升 60%。
移动端数据量限制为 10 条。

Closes #456
```

```
fix(settings): 修复表单提交后页面刷新

原因：useEffect 依赖数组不完整导致状态不同步。
```

```
refactor(types): 统一 API 响应类型定义

将分散的类型定义合并到 src/types/api.ts。

Breaking Change: API 客户端返回格式已更改
```

---

## 🛠️ 开发流程

### 标准编码流程

```
1. 需求理解 + 设计对齐（Plan 模式）
   ↓
2. 创建分支 + 功能开发
   ↓
3. 本地验证（npm run lint && build && test）
   ↓
4. 代码审查（/code-review）
   ↓
5. 应用审查建议
   ↓
6. 功能验证（/verify 或本地测试）
   ↓
7. 提交 + 推送 PR
   ↓
8. CI 检查通过 + Code Review 批准
   ↓
9. Squash & Merge 到 main
```

### 功能开发
1. 从 main 创建 `feature/feature-name` 分支
2. 实现功能 + 添加/更新测试
3. 本地运行 `npm run lint && npm run build && npm test`
4. 运行 `/code-review` 审查代码
5. 应用所有建议，更新代码
6. 提交并推送到远程
7. 创建 PR，填写 What/Why/How
8. 等待 CI 和 Code Review

### Bug 修复流程
1. 创建 `fix/bug-name` 分支
2. **先写复现测试**（应该 fail）
3. 修复 bug（测试转为 pass）
4. 运行 `/code-review` 和 `/verify`
5. 提交 + PR + 等待审核

### 代码审查工作流
- 运行 `/code-review` 获取自动化审查
- 核心考察点：类型安全、测试覆盖、性能、安全
- 应用所有非显而易见的建议
- 通过审查后 Squash & Merge

---

## 📚 文档结构

### 项目文档
- **CLAUDE.md**（本文件）— AI 协作规范、工程纪律、开发流程
- **AGENT.md** — Claude 代理权限边界和行为约束
- **docs/GITHUB_FRONTEND_STANDARDS.md** — 通用前端管理规范（详细版）
- **docs/ENGINEERING_STANDARDS.md** — 项目级工程标准
- **README.md** — 项目总览和快速开始
- **CHANGELOG.md** — 版本更新日志

### 规范参考优先级
1. **本文件（CLAUDE.md）** — 项目级快速参考
2. **docs/GITHUB_FRONTEND_STANDARDS.md** — 详细标准和完整指南
3. **docs/ENGINEERING_STANDARDS.md** — 补充的专项规范

---

## ⚠️ 禁止项（必须）

❌ **不要做**：
- 硬编码 API 域名、凭证、颜色值
- 混用多个 UI 库或主题风格
- 未经审查引入大型依赖
- page.tsx 或组件超过 300 行
- 忽视移动端和无障碍访问
- 没有 loading / empty / error 状态
- 修 Bug 时大范围重构
- 提交 `.env.local`、`node_modules`、`build/`
- 使用 `@ts-ignore` 和 `any` 逃避类型

✅ **必须做**：
- TypeScript strict 模式通过
- 核心功能测试覆盖 >= 95%
- ESLint 和 Prettier 检查通过
- `/code-review` 审查通过
- 提交信息清晰表达 WHY

---

## 🔗 快速参考

| 任务 | 命令 |
|------|------|
| 代码审查 | `/code-review` |
| 功能验证 | `/verify` |
| 启动开发 | `npm run dev` |
| 运行测试 | `npm test` |
| 构建产物 | `npm run build` |
| 格式化代码 | `npm run format` |
| Lint 检查 | `npm run lint` |
| 类型检查 | `npm run type-check` |

---

**版本**：2.0  
**最后更新**：2026-06-24  
**维护者**：Nolan  
**基于**：GitHub 前端项目通用管理规范 v1.0
