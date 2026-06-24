# 📚 文档导航

> 项目文档、规范和资源的中央索引

## 🚀 快速入门
- **[README.md](../README.md)** — 项目总览、一键启动、核心功能
- **[快速开始指南](guides/QUICK_START.md)** — 5 分钟上手

## 📋 协作规范（必读）
- **[CLAUDE.md](../CLAUDE.md)** — AI 助手协作规则、工程纪律、提交规范（项目级）
- **[AGENT.md](../AGENT.md)** — Claude Code 代理行为准则、权限边界（项目级）
- **[GitHub 前端标准](GITHUB_FRONTEND_STANDARDS.md)** — 通用前端项目管理规范（详细版）
- **[工程规范](ENGINEERING_STANDARDS.md)** — 代码质量、测试覆盖、性能基准（可选阅读）

## 🔧 开发指南
- **[NPM 同步修复](guides/SYNC-FIX-GUIDE.md)** — 解决编辑器同步问题
- **[项目架构](ARCHITECTURE.md)**（如果存在） — 代码结构、模块划分
- **[API 文档](API.md)**（如果存在） — 公开接口说明

## 📊 历史报告和决策记录
- **[完成报告](reports/FINAL_COMPLETION_REPORT.md)** — 项目完成总结
- **[实现总结](reports/IMPLEMENTATION_SUMMARY.md)** — 功能实现详情
- **[改进报告](reports/IMPROVEMENTS_SUMMARY.md)** — 优化和增强记录
- **[布局重构](reports/LAYOUT_REFACTOR.md)** — 界面重构决策记录
- **[变更日志](archive/CHANGELOG.md)** — 所有版本更新历史

## 🎯 选择你的下一步

### 作为开发者
1. 阅读 [CLAUDE.md](../CLAUDE.md) 了解协作方式
2. 查看 [工程规范](ENGINEERING_STANDARDS.md) 理解代码要求
3. 参考 [快速开始](guides/QUICK_START.md) 配置开发环境

### 作为贡献者
1. 遵循 [CLAUDE.md](../CLAUDE.md) 中的提交规范
2. 所有代码推送前运行 `/code-review`
3. PR 描述参考工程规范的 PR 模板

### 作为项目维护者
1. 检查 [AGENT.md](../AGENT.md) 理解自主决策权
2. 参考 [工程规范](ENGINEERING_STANDARDS.md) 进行代码审查
3. 定期更新本索引（docs/INDEX.md）

---

## 📁 文档结构

```
docs/
├── INDEX.md                    ← 你在这里
├── ENGINEERING_STANDARDS.md    ← 项目工程规范
├── ARCHITECTURE.md             ← 架构设计（待建立）
├── API.md                      ← API 文档（待建立）
├── guides/                     ← 操作指南
│   ├── QUICK_START.md
│   └── SYNC-FIX-GUIDE.md
├── reports/                    ← 完成报告和总结
│   ├── FINAL_COMPLETION_REPORT.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── IMPROVEMENTS_SUMMARY.md
│   └── LAYOUT_REFACTOR.md
└── archive/                    ← 历史记录
    └── CHANGELOG.md
```

---

## 📞 常见问题

**Q: 我该遵循 CLAUDE.md 还是项目中的其他规范？**
A: CLAUDE.md 优先，这是 Claude Code 代理的协作规范。工程规范补充技术细节。

**Q: 新功能开发前需要做什么？**
A: 
1. 检查是否需要 Plan 模式（见 CLAUDE.md 工作流）
2. 创建 feat/ 分支
3. 开发 + 测试
4. 运行 `/code-review` 和 `/verify`
5. 提交 PR

**Q: 如何处理版本更新和发布？**
A: 参考工程规范中的「依赖管理」和「发布前检查清单」。

**Q: 文档过期了怎么办？**
A: 优先相信代码和 git 历史。如发现文档错误，立即更新，并在 CHANGELOG 中记录。

---

**最后更新**：2026-06-24  
**维护者**：Nolan
