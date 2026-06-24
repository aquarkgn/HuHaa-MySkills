# CLAUDE.md — 项目 AI 助手协作规则

> 本文档规范了 Claude Code 在本项目中的工作方式和原则。

## 🎯 基本原则

### 1. 全中文沟通
- **所有对话、提示、代码注释、提交信息** 统一使用简体中文
- 外来词汇保留英文（如 React、Node.js、ESM），但解释和上下文必须中文
- 代码变量、函数名保持英文（国际惯例），仅在注释中中文表述

### 2. 工程纪律
- **单一职责**：每个提交只做一件事，提交信息清晰表达「做什么」和「为什么」
- **代码质量**：无死代码、无过度抽象、无无用注释；三行相似代码才考虑抽象
- **类型安全**：TypeScript strict 模式，禁止 any；充分利用类型系统自文档
- **测试覆盖**：新功能必须有测试，bug 修复前先写复现测试
- **审查第一**：代码推送前过一遍代码审查（/code-review），应用建议

### 3. 工作流
- **仓库优先**：所有决策、设计、知识都应该体现在代码、文档或 git 提交里
- **沟通透明**：遇到设计决策时，使用 Plan 模式和用户对齐；不默认推进
- **增量迭代**：优先完成可用版本，再在 review 反馈基础上打磨

---

## 📋 编码规范

### 文件组织
```
src/
  ├── components/      # React 组件（单一职责）
  ├── pages/           # 页面级组件
  ├── hooks/           # 自定义 hooks
  ├── types/           # 共享类型定义
  ├── utils/           # 工具函数
  ├── services/        # 外部服务/API 调用
  └── styles/          # 全局样式
```

### 命名约定
- **React 组件**：PascalCase（`UserCard.tsx`）
- **函数/变量**：camelCase（`fetchUserData`）
- **常量**：UPPER_SNAKE_CASE（`MAX_RETRY_COUNT`）
- **类型/接口**：PascalCase（`IUserProfile`、`UserAction`）

### React 风格指南
- **函数式组件**：使用 hooks，禁止 class 组件
- **Props 类型**：显式定义 interface，不用 React.FC
- **Hooks 规则**：严格遵守 ESLint react-hooks 规则
- **副作用**：所有异步操作必须在 useEffect 中管理

### TypeScript
- `"strict": true` 模式必须
- 禁止 `any`，使用 `unknown` + 类型守卫
- 共享类型放在 `src/types/` 中央
- API 响应必须定义类型

---

## 🔄 提交规范

### 提交信息格式
```
<类型>(<作用域>): <简短描述>

<详细说明（可选）>

<页脚（可选）>
```

### 类型
- `feat`：新功能
- `fix`：修复 bug
- `refactor`：重构（不改功能）
- `perf`：性能优化
- `test`：添加/修改测试
- `docs`：文档更新
- `style`：代码风格（格式化、缺少分号等）
- `chore`：构建、依赖更新等

### 示例
```
feat(editor-sync): 支持多编辑器同步 npm 包

- 添加编辑器类型检测
- 实现 .cursorrules 自动更新
- 修复权限问题

关闭 #42
```

---

## 🛠️ 开发流程

### 1. 功能开发
1. 创建新分支：`git checkout -b feat/feature-name`
2. 编写功能和测试
3. 运行 `/code-review` 审查代码
4. 提交并推送
5. 创建 PR，描述清晰

### 2. Bug 修复
1. 创建分支：`git checkout -b fix/bug-name`
2. **先写复现测试**（确保 fail）
3. 修复 bug（测试应该 pass）
4. 运行 `/code-review` 和 `/verify`
5. 提交 PR

### 3. 代码审查
- 运行 `/code-review` 检查代码质量
- 运行 `/verify` 确认功能正常
- 应用审查建议，重新提交
- 通过后合并到 main

---

## 📚 文档维护

### CLAUDE.md（本文件）
- 项目级 AI 协作规则
- 工程规范和最佳实践
- 开发流程和工作方式

### AGENT.md
- AI 代理的行为约束和目标
- 自主决策权的边界
- 需要人工审批的操作类型

### README.md
- 项目总览、快速开始、核心功能
- 安装、使用、配置说明
- 常见问题解答

### docs/
- 详细的架构设计、RFC、项目报告
- 历史决策记录（为什么这样做）
- 技术深度信息

---

## ⚠️ 禁止项

❌ 不要：
- 在 `main` 分支上直接提交
- 合并带有 `any` 类型的代码
- 删除测试（如果有 bug，修复测试，不删除）
- 提交尚未通过 `/code-review` 的代码
- 使用 `git push --force` 到共享分支
- 添加过度的错误处理（要么让它 crash，要么真正处理）

✅ 要求：
- 功能完成 → 运行 `/code-review` → 应用建议 → 提交
- 新增或修改功能，确保 TypeScript 严格模式通过
- 提交信息用中文，清晰表达意图
- 复杂逻辑通过 git 提交信息解释 WHY，而非代码注释

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

---

**版本**：1.0  
**最后更新**：2026-06-24  
**维护者**：Nolan
