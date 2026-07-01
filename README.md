# 📚 HuHaa-MySkills 文档

## 前端相关

- **[docs/Frontend-Spec.md](./docs/Frontend-Spec.md)** — 🎨 完整前端规范（工程 + 设计 + 框架 + 重构计划 + 实现）

## 业务需求

- **[docs/hermes_docs_project_plan.md](./docs/hermes_docs_project_plan.md)** — 📋 项目需求与功能规划

## 资源

- `docs/assets/layout-wireframe.png` — 布局蓝图
- `docs/assets/theme-reference.png` — 视觉参考

---

**快速开始**：见 docs/Frontend-Spec.md §VI 「快速启动指南」

## 🔑 关键技术决策

### 后端设计
- **API 端点**: `/api/other-skills`（列表）、`/api/icons/:brand`（真实图标）
- **扫描器**: 通用 `skill-adapter.mjs`，支持任意 SKILL.md 位置
- **文件匹配**: `**/SKILL.md` glob 递归扫描，目录名大小写不敏感、文件名大小写敏感
- **图标**: macOS 内置命令（`mdfind`/`plutil`/`sips`）提取，无 Swift 依赖；非 macOS 自动降级 emoji

### 前端设计
- **数据获取**: Hook 模式（`useOtherSkills`），支持搜索/排序/分组
- **图标展示**: `SkillIcon` 组件，真实图标优先、emoji 兜底
- **UI 布局**: 响应式双列（list + detail）
- **错误处理**: 自定义 `OtherSkillsError` 类

### 数据流
```
SKILL.md 文件 (160+)
    ↓
skill-adapter.mjs (扫描 + frontmatter 解析 + icon 字段)
    ↓
/api/other-skills (注入 iconUrl/iconFallback)  ──►  /api/icons/:brand (按需提取真实图标 PNG + 缓存)
    ↓
useOtherSkills Hook (搜索、过滤、排序、分组)
    ↓
OtherSkillsView + SkillIcon (真实图标 / emoji 降级)
```

---

## 🚀 快速开始

### 开发模式
```bash
cd /Users/mac/Project/HuHaa-MySkills

# 启动后端服务（默认 11520，占用则自动切换）
npm start

# 前端开发（Vite）
npm run dev

# 点击菜单：其它技能 → 查看真实技能 + 真实工具图标
```

### 验证
```bash
# 列表数据（含 iconUrl 字段）
curl -s "http://127.0.0.1:11520/api/other-skills?roots=~/.hermes/skills&fileGlob=**/SKILL.md" | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).skills.length))"

# 真实图标（Cursor / VS Code）
curl -s -o /tmp/i.png "http://127.0.0.1:11520/api/icons/cursor?size=64" && file /tmp/i.png

# 后端测试
npm test          # 12/12
npm run typecheck:web
```

---

## 📊 版本历史

| 版本 | 日期 | 主要功能 | 状态 |
|------|------|--------|------|
| v0.3.2 | - | 基础架构 | ✅ |
| v0.3.3 | 2026-06-30 | Dashboard + Skills Sources | ✅ |
| v0.3.4 | 2026-07-01 | Other Skills（真实数据） | ✅ |
| v0.3.5 | 2026-07-01 | 真实图标(R6) + 扫描性能(R7) · 规则 v3.0 | ✅ 已实现，待发布 |
| 待定 | - | 桌面模式 / 功能扩展 | 📋 规划中 |

---

## 🔍 项目规范

所有开发须遵循：
- **CLAUDE.md** — AI 协作规则（全中文、strict mode）
- **docs/Frontend-Engineering.md** — 技术栈和编码规范
- **根目录整洁** — 仅保留 README.md、CLAUDE.md、package.json 等核心文件
- **计划文档** — 统一放 `.hermes/plans/`
