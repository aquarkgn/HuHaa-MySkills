# 「其它技能」功能改造计划

## 目标
将「其它技能」从硬编码样本数据改为**真实扫描 SKILL.md 技能文件**

## 当前状态（错误）
- ❌ OtherSkillsView 使用硬编码的示例数据
- ❌ 类别固定为 COMMAND / EDITOR / TOOL / CLOUD / AI
- ❌ 与扫描器输出无关

## 改造后预期
- ✅ 从扫描器 API 获取 SKILL.md 列表
- ✅ 按照技能的真实 frontmatter 元数据展示（name, description, category, kind, etc.)
- ✅ 支持搜索、分组、分类筛选
- ✅ 显示 SKILL.md 的完整内容

## 技术方案

### Phase 1: 后端改动（扫描器/API）
**目标：** API 提供 SKILL.md 列表端点

**文件：**
- `packages/scanner/src/adapters/skill-adapter.mjs` — 新增 SKILL.md 扫描适配器
- `packages/server/src/routes/skills.mjs` — 新增 `/api/other-skills` 端点

**API 响应格式：**
```json
{
  "skills": [
    {
      "id": "hermes-agent",
      "name": "Hermes Agent 配置",
      "description": "配置、扩展或贡献 Hermes Agent...",
      "category": "autonomous-ai-agents",
      "kind": "skill",
      "brand": "hermes",
      "tags": ["config", "hermes", "cli"],
      "path": "/Users/mac/.hermes/skills/autonomous-ai-agents/hermes-agent/SKILL.md",
      "frontmatter": { ... }
    },
    ...
  ]
}
```

### Phase 2: 前端改动（Hook + 组件）
**文件改动：**
- `packages/web/src/hooks/useOtherSkills.ts` — 改为从 `/api/other-skills` 获取数据
- `packages/web/src/components/views/OtherSkillsView.tsx` — 更新以显示真实技能元数据
- `packages/web/src/types/other-skill.ts` — 更新类型定义以匹配真实数据结构

### Phase 3: 验证
- 构建成功
- 测试通过
- UI 展示真实技能列表

## 任务分解（预估 ~60-90 分钟）

| 任务 | 步骤 | 预估 |
|------|------|------|
| **Task 1** | 新增 SKILL 扫描适配器（`skill-adapter.mjs`） | 15 min |
| **Task 2** | 新增后端 API 端点 `/api/other-skills` | 15 min |
| **Task 3** | 更新前端类型定义 `OtherSkill` | 10 min |
| **Task 4** | 修改 Hook 从 API 获取真实数据 | 15 min |
| **Task 5** | 更新 OtherSkillsView 组件展示 | 20 min |
| **Task 6** | 集成测试 + 构建验证 | 10 min |

**总耗时：** ~85 分钟

## 不在此次范围
- 🚫 编辑/删除技能功能
- 🚫 技能的真实执行
- 🚫 多语言支持（保持中文）
- 🚫 性能优化（首版可接受）

## 验证清单
- [ ] API `/api/other-skills` 返回真实技能列表
- [ ] 前端 UI 展示技能名称、描述、分类
- [ ] 搜索功能对真实数据有效
- [ ] 构建通过（0 TypeScript 错误）
- [ ] 单元测试通过
- [ ] 菜单项「其它技能」可点击且显示列表
