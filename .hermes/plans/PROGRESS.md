# HuHaa-MySkills 项目进度

**更新日期**: 2026-07-01
**分支**: `feat/v0.3.4-complete-redesign`

---

## ✅ 已完成功能

### Phase 1: Dashboard & Skills Sources (v0.3.3)
- ✅ 仪表盘展示技能统计（按类型、按来源分类）
- ✅ 技能来源菜单（Hermes Agent、Claude Code、Codex 等）
- ✅ Code Review Sidebar 集成

### Phase 2: Other Skills (v0.3.4)
- ✅ 「其它技能」页面实现
- ✅ 真实 SKILL.md 文件扫描（160+ 技能）
- ✅ 分类分组展示（21 个分类）
- ✅ 搜索、过滤、排序功能
- ✅ 双列布局（列表 + 详情面板）
- ✅ 完整 frontmatter 元数据显示

### Phase 3: 真实工具/编辑器图标 (v0.3.5 · 技能扫描规则 v3.0 R6)
> 参考开源项目 Pearcleaner 的图标获取展示能力。扫描规则详见 `docs/scan_rules.md`
- ✅ 品牌/来源 → 应用映射（`packages/scanner/src/icon/brand-map.mjs`）
- ✅ 图标提取器：`mdfind` 定位 `.app` + `plutil` 读 `CFBundleIconFile` + `sips` 转 PNG（`icon-extractor.mjs`）
- ✅ 磁盘缓存（`~/.config/huhaa-myskills/icon-cache/`，按 app mtime 失效）
- ✅ 新增 `GET /api/icons/:brand` 端点；`/api/other-skills` 注入 `iconUrl`/`iconFallback`
- ✅ 前端 `SkillIcon` 组件：真实 `<img>` 展示，加载失败 `onError` 回退 emoji
- ✅ 图标优先级链：显式 frontmatter `icon` > 真实应用图标 > emoji 兜底

### Phase 4: 扫描性能优化 (v0.3.5 · 技能扫描规则 v3.0 R7)
> 参考 Pearcleaner 并发扫描 + 两阶段加载 + Spotlight 元数据
- ✅ R7.2 分块并发读取：异步 I/O + `mapWithConcurrency` 并发池（CPU 核数，上限 16），结果按路径稳定排序
- ✅ R7.1 两阶段加载：后端 `stage=mini/full`，前端先 mini 快速渲染再后台 full 升级；图标 `<img loading="lazy">`
- ✅ R7.3 可选 Spotlight：`useSpotlight=1` 批量 `mdls` 取时间戳，默认关闭，失败静默回退 mtime

---

## 📋 待办事项

### 验收
- [ ] 人工启动验证（`npm start` 起后端 → `npm run dev` 或访问 11520）

### 功能扩展（可选）
- [ ] 搜索支持正则表达式
- [ ] 技能收藏/标星功能
- [ ] 快速导航热键
- [ ] 示例代码一键复制
- [ ] 导出功能（JSON/CSV）

### 桌面模式（框架方案，暂不实现）
> 详见 `.hermes/plans/DESKTOP_MODE_PLAN.md`（原生 Swift/SwiftUI 方案）

---

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
