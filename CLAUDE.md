# CLAUDE.md — 项目 AI 助手协作规则

> 本项目的 Claude Code 协作规范。详细规范查看 **[docs/**](docs/)** 目录下的文件。

- /Users/mac/Project/HuHaa-MySkills/docs/Frontend-Spec.md — 前端规范文档
- /Users/mac/Project/HuHaa-MySkills/docs/scan_skills_rules.md — 扫描技能规则

---

## 🎯 核心原则

1. **全中文沟通** — 对话、提交信息、注释都用中文
2. **一致性优先** — 遵循 `docs/Frontend-Spec.md`
3. **质量第一** — TypeScript strict、测试覆盖 >= 80%、代码审查通过
4. **工程纪律** — 单一职责、最小改动、推送前 `/code-review`
5. **文档优先** — 所有决策写入代码、文档或提交信息


---

## 🔄 标准流程

### 功能开发
```
1. 创建 feature/xxx 分支
2. 实现 + 测试
3. npm run lint && build && test
4. /code-review
5. 提交 + PR
```

### Bug 修复
```
1. 创建 fix/xxx 分支
2. 写失败的测试
3. 修复代码（测试转 pass）
4. /code-review + /verify
5. 提交 + PR
```

### 提交信息（Conventional Commits）
```
feat(dashboard): 添加数据更新
fix(settings): 修复表单提交错误
refactor(types): 统一 API 类型定义
```

---

## ⚠️ 必须遵守

- ✅ TypeScript strict 模式
- ✅ 禁止 `any` 和 `@ts-ignore`
- ✅ 推送前必须 `/code-review`
- ✅ 核心功能必须有测试
- ✅ 提交信息清晰表达意图

---

## 🏠 项目根目录整洁规则

**核心原则**: 主目录保持干净整齐，禁止生成不相关文档和临时文件。

### ✅ 仅允许的根目录文件

```
HuHaa-MySkills/
├── README.md                    ✅ 项目导航文档（仅此）
├── CLAUDE.md                    ✅ AI 协作规则（仅此）
├── package.json                 ✅ 项目依赖配置
├── package-lock.json            ✅ 依赖锁定
├── .gitignore                   ✅ Git 配置
├── .env.example                 ✅ 环境变量示例
│
├── docs/                        ✅ 规范文档目录（仅规范，无计划/执行文档）
│   ├── Frontend-Engineering.md  规范
│   ├── hermes_docs_project_plan.md  需求规划
│   └── assets/
│
├── .hermes/plans/               ✅ 项目开发计划和执行文档
│   ├── PROGRESS.md              当前进度追踪
│   ├── SKILL_SCANNING_RULE_v2.md 新规划
│   └── ...（待审查的计划）
│
├── packages/                    ✅ 工程代码
├── .git/                        ✅ Git 历史
└── node_modules/                ✅ 依赖包
```

### ❌ 禁止生成的文件

```
禁止生成以下类型的文件到根目录:

❌ 临时报告          ACCEPTANCE_*, REPORT_*, SUMMARY_*.md
❌ 执行记录          EXECUTION_*, VERIFICATION_*, COMPLETION_*
❌ 阶段文档          E1_*, E2_*, E3_*, E4_*, PHASE_*
❌ 计划文档          PLAN_*, PLAN_SUMMARY_*, DESIGN_*
❌ 验证文档          QA_*, TEST_*, TESTING_*
❌ 交付物文档        DELIVERY_*, FINAL_*, RELEASE_NOTES_*
❌ 品牌相关          BRANDING_*, BRAND_*
❌ 布局相关          LAYOUT_*, REDESIGN_*
❌ 按钮修复          BUTTON_*
❌ 激活相关          ACTIVATION_*, DATA_SOURCE_*
❌ 诊断报告          DIAGNOSTIC_*
❌ 所有 .txt 总结     *.txt (除非是必要的配置)
```

### 📝 规则详解

1. **根目录仅允许两个文档文件**
   - ✅ `README.md` — 项目导航（指向 docs/）
   - ✅ `CLAUDE.md` — AI 协作规则
   - ❌ 其他所有文档禁止在根目录

2. **docs/ 目录仅放规范文档**
   - ✅ Frontend-Engineering.md（技术规范）
   - ✅ hermes_docs_project_plan.md（需求规划）
   - ❌ 禁止放项目开发计划（如 SKILL_SCANNING_RULE_*.md）
   - ❌ 禁止放执行总结、验证报告、阶段完成文档
   
3. **.hermes/plans/ 目录放项目计划和执行文档**
   - ✅ 项目开发计划（规则设计文档）
   - ✅ 进度追踪文档（PROGRESS.md）
   - ✅ 执行总结、审查指南（待审查的计划）
   - ❌ 禁止放规范文档、需求文档

2. **禁止生成临时或中间文档**
   - 执行报告、验证总结、阶段文档 → 应在 `.hermes/plans/` 目录
   - 开发计划、规则设计文档 → 应在 `.hermes/plans/` 目录
   - 规范文档（前端/工程规范）→ 只能在 `docs/` 目录
   - 需求文档（项目规划） → 只能在 `docs/` 目录
   
   **核心原则**: 文档放在对应的专属目录，不允许跨越边界

3. **构建和输出目录自动忽略**
   - `dist/` `build/` `coverage/` 等在 `.gitignore` 中
   - 不应手动出现在根目录

4. **提交前检查清单**
   ```bash
   # 提交前必须检查根目录仅有这两个 .md 文件
   ls -1 *.md 2>/dev/null | sort
   # 输出必须是:
   #   CLAUDE.md
   #   README.md
   # 共 2 个。不能更多、不能更少
   
   # 如有其他 .md 或 .txt，必须:
   # - 移入 docs/ 目录, 或
   # - 删除, 或
   # - 用 git rm 移除追踪
   ```

### 🛡️ 执行强制

- 每个 PR 必须包含整洁的根目录
- CI/CD 应检查根目录文件数不超过预期
- Code Review 时检查是否遵守此规则
- 不遵守此规则的提交拒绝合并

### 📌 例外情况

仅以下情况允许临时文件在根目录:
- **开发调试**: 本地开发可以有临时文件，但**提交前必须删除**
- **CI/CD 构建**: 自动生成的产物会通过 `.gitignore` 排除
- **紧急修复**: 临时补丁文件需在提交信息中说明，PR 后删除

**原则**: 根目录只反映项目的核心协作规则和配置，代码和文档都在各自的子目录中。

---

## 📖 完整规范

所有规范细节查看：**[docs/Frontend-Engineering.md](docs/Frontend-Engineering.md)**

包括：
- 技术栈、版本管理、目录结构
- 编码规范、测试规范、Git 工作流
- CI/CD、安全、性能基准、发布流程

---

**详见**：[docs/INDEX.md](docs/INDEX.md)
