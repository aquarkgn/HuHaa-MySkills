# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/) 规范。

版本号遵循 [Semantic Versioning](https://semver.org/)。

完整的版本发布说明详见 [docs/releases/](./docs/releases/)

---

## [Unreleased]

### Planned
- **v0.1.5** (TBD): 分组与筛选增强 → [计划](./docs/todo/v0.1.5.md)
- **v0.1.6** (TBD): 导出与分享 → [计划](./docs/todo/v0.1.6.md)
- **v0.1.7** (TBD): 增量扫描与缓存 → [计划](./docs/todo/v0.1.7.md)
- **v0.1.8** (TBD): 跨平台完整支持 → [计划](./docs/todo/v0.1.8.md)
- **v0.1.9** (TBD): 开发者工具 → [计划](./docs/todo/v0.1.9.md)

详见 [版本计划总汇](./docs/releases/)

---

## [0.3.0] - 2026-06-23

布局大改造：三栏固定式 + 侧边栏折叠 + 详情面板内联

### Changed (Breaking)
- 🔄 **右侧详情面板**：从浮层式（`position:fixed`）改为 CSS Grid 第三列（固定布局）
  - 移除半透明遮罩层
  - 移除滑入/淡入动画
  - 详情与列表始终同步显示（不被遮挡）

### Added
- ✨ 侧边栏**折叠/展开按钮**（◀/▶）
  - 展开：180px（显示所有筛选项）
  - 折叠：50px（仅显示切换按钮）
- ✨ localStorage **状态保存**（宽度 + 折叠状态）
- ✨ DetailPanel 组件**内联到 App.vue**（减少层级）

### Improved
- 📐 侧边栏初始宽度：100px → **180px**（更合理）
- 🎨 菜单精简：移除冗余菜单选项卡、无视图切换按钮
- 🖱️ 拖拽调整范围：80-300px（保留原有功能）
- ⚡ 性能：减少组件嵌套，共享同一作用域

### Fixed
- 修复：右侧详情被浮层遮罩覆盖的问题
- 修复：侧边栏宽度过窄的可用性问题

### Technical
- Vue 3: 新增 `sidebarCollapsed` ref 状态
- CSS Grid: 动态 grid-template-columns（响应式宽度）
- localStorage: 自动恢复用户偏好设置
- 样式迁移：DetailPanel scoped CSS → 全局 styles.css

---

## [0.2.13] - 2026-06-17

完整的编辑器同步支持 | 新增 trae/trae-cn 等新兴编辑器

### Added
- ✅ 扩展编辑器支持列表：从 9 个增至 23 个
  - 新增：trae, trae-cn, vscode-insiders, sublime4, textmate, bbedit, atom, kate, gedit, jetbrains, openclaw, herems, codex, claude
  - 所有编辑器现在在交互菜单中可见

- ✅ 改进交互式菜单：3 列网格布局显示所有编辑器选项

### Fixed
- ✅ 修复脚本根目录检测问题（find_huhaa_root 函数）
  - 解决了从不同目录运行 sync 命令时找不到项目的 bug
  
- ✅ 修改 npm run sync 以使用 JavaScript 命令而非直接调用 bash 脚本
  - 现在交互式菜单正确显示所有编辑器选项

### Changed
- npm run sync 现在调用 `node bin/huhaa-myskills.mjs sync` 而非 `bash scripts/sync-skills.sh`
- 编辑器菜单显示更清晰，支持多列布局

---

## [0.2.5] - 2026-06-22

编辑器技能同步完整功能 | 3 项核心修复

### Fixed
- ✅ 修复 npm run sync 无法推送技能到编辑器的问题
  - 增强所有编辑器的同步函数，实现实际文件复制
  - 为不同编辑器采用适配的文件名（.cursorrules, huhaa_rules.md 等）
  
- ✅ 修复 huhaa-myskills sync 命令未实现的问题
  - 完全实现 interactiveSync() 函数，支持交互式编辑器选择
  - 增强 sync-skills.sh 参数处理，支持 --editor 参数
  - 支持环境变量 HUHAA_SYNC 和 HUHAA_EDITOR

### Added
- ✅ 创建项目规则文件 (.cursorrules)
- ✅ 完整的同步功能使用指南 (SYNC-FIX-GUIDE.md)
- ✅ 支持命令行直接指定编辑器：bash sync-skills.sh --editor cursor

### Changes
- 编辑器同步脚本支持多种调用方式（交互、命令行参数、环境变量）
- 改进错误处理和日志输出

---

## [v0.1.4] - 2026-06-18

多源扫描增强 | [详细说明](./docs/releases/v0.1.4.md)

### Added
- ✅ 添加 `~/skills` 目录扫描支持
- ✅ 添加 `~/mcp` 目录扫描支持
- ✅ 添加 `~/skill` 目录扫描支持
- ✅ 支持 Markdown、JSON、YAML 配置文件
- ✅ 自动识别和解析技能文件结构

### Changed
- 更新 sources.example.yaml，新增三个扫描源
- 扩展扫描器适配器，支持通用目录格式

---

## [v0.1.3] - 2026-06-18

全球 20+ 编辑器支持 | [详细说明](./docs/releases/v0.1.3.md)

### Added
- ✅ 扩展编辑器支持：从 6 个增至 22 个
- ✅ 新增编辑器支持：VS Code Insiders、Zed、Vim、Emacs、Sublime 4、TextMate、BBEdit、Atom、Kate、Gedit、JetBrains IDEs、Openclaw、Herems、Trae、Trae CN
- ✅ 优化编辑器检测逻辑，支持多个版本
- ✅ 改进交互界面，支持 1-based 编号和更好的格式化
- ✅ 完整的 macOS 和 Linux 平台支持

### Changed
- 更新版本号从 0.1.2 → 0.1.3
- 改进 `sync-skills.sh` 脚本的易读性和可维护性
- 优化编辑器检测流程

---

## [v0.1.2] - 2026-06-18

编辑器技能自动同步 | [详细说明](./docs/releases/v0.1.2.md)

### Added
- ✅ 编辑器技能自动同步脚本 (`service/scripts/sync-skills.sh`)
- ✅ 支持 6 种编辑器 (Cursor、VS Code、Helix、Neovim、Sublime、Windsurf)
- ✅ 交互式多选界面（全选、部分选择）
- ✅ curl 远程安装入口脚本 (`install-and-sync.sh`)
- ✅ 跨平台支持 (macOS, Linux, WSL)
- ✅ bash 3.2+ 兼容性
- ✅ 完整的使用文档 (`docs/SYNC-SKILLS.md`)
- ✅ npm 命令支持 (`npm run sync`, `npm run sync:remote`)

### Changed
- 更新版本计划，v0.1.2-v0.1.9 标记为 TBD

---

## [v0.1.1] - 2026-06-18

npm 全局安装支持 | [详细说明](./docs/releases/v0.1.1.md)

### Added
- ✅ npm 全局安装支持 (`npm install -g github:aquarkgn/HuHaa-MySkills`)
- ✅ 完整的验证流程 (`npm run verify`)
- ✅ 稳定的二进制生成和跨平台支持

### Fixed
- 规范化 npm bin 路径，支持跨平台安装
- 修复 Git install 的 web 资产分发
- 优化 npm 依赖安装流程

### Changed
- 改进了启动流程的鲁棒性

---

## [v0.1.0] - 2026-06-17

首个可用版本 | [详细说明](./docs/releases/v0.1.0.md)

### Added
- 🎉 多源技能聚合（Hermes、Claude Code、Cursor、MCP）
- 本地 SPA 浏览器（localhost:11520）
- 搜索、分组、筛选、一键复制
- 热更新（chokidar watch）
- 完整的验证和测试套件

---

## 📖 版本导航

### 快速查看
- **简明版本历史** ← 当前文档
- **详细版本说明** → [docs/releases/](./docs/releases/)
- **开发计划** → [docs/todo/](./docs/todo/)

### 每个版本的完整说明包含
- 版本目标和主题
- 新增功能列表
- Bug 修复详情
- 性能对比数据
- 测试覆盖情况
- 安装升级指南
- Breaking Changes 说明

---

[Unreleased]: https://github.com/aquarkgn/HuHaa-MySkills/compare/v0.1.4...HEAD
[v0.1.4]: https://github.com/aquarkgn/HuHaa-MySkills/compare/v0.1.3...v0.1.4
[v0.1.3]: https://github.com/aquarkgn/HuHaa-MySkills/compare/v0.1.2...v0.1.3
[v0.1.2]: https://github.com/aquarkgn/HuHaa-MySkills/compare/v0.1.1...v0.1.2
[v0.1.1]: https://github.com/aquarkgn/HuHaa-MySkills/compare/v0.1.0...v0.1.1
[v0.1.0]: https://github.com/aquarkgn/HuHaa-MySkills/releases/tag/v0.1.0
