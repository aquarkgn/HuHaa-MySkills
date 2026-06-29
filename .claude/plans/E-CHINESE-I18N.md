# 📝 追加需求 — 全中文信息显示 (E-i18n)

**发起时间**: 2026-06-29  
**需求**: 所有用户界面、数据标签、API 返回信息必须支持完整的中文显示  
**优先级**: 与 E2 并行 (或 E2 后)  
**时间估计**: 2-2.5 小时

---

## 🎯 需求范围

### 1. 前端 UI 完整中文化 ✅ (已有基础)

**现状**:
- i18n 存储已存在 (`packages/web/src/stores/i18n.js`)
- 包含 60+ 个中英文翻译对
- 默认语言: zh (中文)
- 语言切换功能已实现

**需要补充**:
```
□ 补充缺失的标签翻译 (title, placeholder, tooltip)
□ 增强 source/editor/category/brand 等标签的中文名称映射表
□ 检查所有 toast/notice/error 消息是否已翻译
```

**涉及文件**:
- `packages/web/src/stores/i18n.js` — 翻译字典
- `packages/web/src/components/DetailPanel.vue` — 需补充 title
- `packages/web/src/App.vue` — 主界面标签
- `packages/web/src/stores/skills.js` — error/notice 消息

---

### 2. 服务端 API 中文化 🚨 (缺失)

**现状**:
- 统计接口 `/api/stats` 返回英文键名 (bySource, byEditor, byKind...)
- 样本输出页面有中文，但 API 返回没有

**需要新增**:
```json
{
  "total": 180,
  "bySource": {"hermes": 143, ...},
  "bySourceLabel": {"hermes": "Hermes", "skills": "技能中心", ...},  // ✨ NEW
  "byEditor": {"Hermes Agent": 143, ...},
  "byEditorLabel": {"Hermes Agent": "Hermes 代理", ...},  // ✨ NEW
  "byCategory": {...},
  "byCategoryLabel": {...},  // ✨ NEW
  "byBrand": {...},
  "byBrandLabel": {...}  // ✨ NEW
}
```

**或者** (更简洁):
```
返回元数据映射表 /api/labels
{
  "sources": {"hermes": "Hermes", "skills": "技能中心", ...},
  "editors": {"Hermes Agent": "Hermes 代理", ...},
  "categories": {"devops": "云原生运维", ...},
  "brands": {"GitHub": "GitHub", "OpenAI": "OpenAI", ...}
}
```

---

### 3. 数据源标签映射表 📋 (新增)

**创建** `packages/server/src/labels.json` 或 `labels.mjs`:

```javascript
export const LABELS = {
  sources: {
    'hermes': 'Hermes 技能库',
    'skills': '技能中心',
    'project-runbook': '项目文档',
    'mcp-config': 'MCP 配置',
    'mcp': 'MCP 工具',
    'claude-code': 'Claude Code',
    'cursor': 'Cursor 规则',
    'codex': 'Codex 代理',
    'hermes-plugin': 'Hermes 插件',
    'obsidian': 'Obsidian 笔记',
    'local-files': '本地文件',
  },
  editors: {
    'Hermes Agent': 'Hermes 代理',
    'Skills Hub': '技能中心',
    'Project Docs': '项目文档',
    'MCP': 'MCP',
    'MCP Hub': 'MCP 中心',
    'Claude Code': 'Claude Code',
    'Cursor': 'Cursor',
    'Codex': 'Codex',
    'Obsidian': 'Obsidian',
  },
  kinds: {
    'skill': '技能',
    'runbook': '手册',
    'config': '配置',
    'mcp-tool': 'MCP 工具',
    'mcp': 'MCP',
    'plugin': '插件',
  },
  categories: {
    'devops': '云原生运维',
    'mlops': '机器学习运维',
    'software-development': '软件开发',
    'creative': '创意工具',
    'productivity': '生产力工具',
    'research': '研究',
    'apple': 'Apple 生态',
    'media': '媒体处理',
    'gaming': '游戏',
    'red-teaming': '红队测试',
    'github': 'GitHub 工作流',
    'email': '邮件',
    'leisure': '休闲娱乐',
    'smart-home': '智能家居',
    'social-media': '社交媒体',
    'mcp': 'MCP 协议',
    'note-taking': '笔记',
    'huhaa-myskills': 'HuHaa-MySkills',
    'autonomous-ai-agents': '自主 AI 代理',
    // ... 其他
  },
};
```

---

## 📋 修改清单

### Step 1: 补充 i18n.js 翻译 (30 min)

```javascript
// packages/web/src/stores/i18n.js
const messages = {
  zh: {
    // 现有翻译...
    
    // 新增: 源标签
    'source.hermes': 'Hermes 技能库',
    'source.skills': '技能中心',
    'source.project-runbook': '项目文档',
    'source.mcp-config': 'MCP 配置',
    'source.mcp': 'MCP 工具',
    
    // 新增: 类型标签
    'kind.skill': '技能',
    'kind.runbook': '手册',
    'kind.config': '配置',
    'kind.mcp-tool': 'MCP 工具',
    'kind.mcp': 'MCP',
    
    // 新增: 分类标签 (Top 10)
    'category.devops': '云原生运维',
    'category.mlops': '机器学习运维',
    'category.software-development': '软件开发',
    'category.creative': '创意工具',
    'category.productivity': '生产力工具',
    'category.research': '研究',
    'category.apple': 'Apple 生态',
    'category.media': '媒体处理',
  },
  en: {
    // 现有翻译...
    'source.hermes': 'Hermes Skills',
    'source.skills': 'Skills Hub',
    // ...
  }
};
```

### Step 2: 创建标签映射表 (20 min)

```
新文件: packages/server/src/labels.mjs
├─ 导出 LABELS 对象 (sources, editors, kinds, categories, brands)
└─ 与 /api/stats 集成
```

### Step 3: 修改 /api/stats 返回 (30 min)

```javascript
// packages/server/src/index.mjs - buildStats()
export function buildStats(items, locale = 'zh') {
  const stats = {
    total: items.length,
    bySource: { ... },
    byEditor: { ... },
    byCategory: { ... },
    byBrand: { ... },
    byKind: { ... },
  };
  
  // 新增: 标签映射
  if (locale === 'zh') {
    stats.labels = {
      sources: LABELS.sources,
      editors: LABELS.editors,
      categories: LABELS.categories,
      brands: LABELS.brands,
      kinds: LABELS.kinds,
    };
  }
  
  return stats;
}
```

### Step 4: 前端使用新标签 (40 min)

```javascript
// packages/web/src/stores/skills.js
// 在 loadStats() 后读取标签
this.labels = response.labels || {};

// 显示时使用
const sourceLabel = this.labels.sources?.[source] || source;
const editorLabel = this.labels.editors?.[editor] || editor;
const categoryLabel = this.labels.categories?.[category] || category;
```

### Step 5: 测试所有中文输出 (30 min)

```bash
npm run dev
# 检查:
# □ 列表视图的所有标签都是中文
# □ 详情面板的所有字段都是中文
# □ 筛选栏的 source/editor/category 都是中文
# □ 搜索提示是中文
# □ 所有按钮、tooltip 都是中文

npm run stats
# 验证:
# □ API 返回包含 labels 字段
# □ 所有 label 值都是中文
```

---

## 🔄 与其他阶段的关系

### 与 E2 (过滤器重构) 的关系:
- **依赖**: E2 需要分离 bySource 和 byEditor，这与 i18n 相关
- **协同**: E2 修改了过滤逻辑后，i18n 就能正确显示中文标签
- **建议**: E2 和 E-i18n 可以**并行开发**，最后一起测试

### 与 E3 (UI 优化) 的关系:
- **强相关**: E3 会优化品牌展示、source 图标等
- **集成**: source/editor 的中文标签在 E3 中会用到
- **顺序**: 先完成 E-i18n，再启动 E3

---

## 📊 工作量估计

| 任务 | 时间 | 说明 |
|------|------|------|
| Step 1: 补充 i18n.js | 30 min | 添加 ~50 个标签翻译 |
| Step 2: 创建标签映射表 | 20 min | 新文件 labels.mjs |
| Step 3: 修改 /api/stats | 30 min | 集成返回逻辑 |
| Step 4: 前端集成 | 40 min | 修改 3-4 个组件 |
| Step 5: 测试验证 | 30 min | 手动检查 + API 测试 |
| **总计** | **2.5h** | |

---

## ✅ 验收标准

### 前端界面
- [ ] 所有菜单、按钮、标签都是中文
- [ ] 搜索框 placeholder 是中文
- [ ] 错误提示、toast 都是中文
- [ ] 语言切换到英文后，UI 变成英文

### API 接口
- [ ] `/api/stats` 返回 `labels` 字段
- [ ] labels 中的所有字符串都是中文
- [ ] 不同 locale 参数返回对应语言标签

### 数据显示
- [ ] 列表中每个技能的 source 显示为中文
- [ ] 详情面板的字段标签都是中文
- [ ] 筛选栏的过滤选项都是中文

### 覆盖率
- [ ] 用户看不到任何英文标签（除了品牌名、代码块）
- [ ] 所有可本地化的文本都有对应中文翻译

---

## 🎯 决策

✅ **与 E2 并行开发**  
- E2 负责逻辑重构（过滤器）
- E-i18n 负责标签翻译
- 两者在最后的测试阶段合并验证

✅ **保持 i18n 架构可扩展**  
- 不硬编码标签
- 通过 labels.mjs 集中管理
- API 返回标签，前端即插即用

✅ **默认中文模式（zh）**  
- 当前默认 locale 是 'zh'
- 用户可切换到 en（英文）
- 不改变这个设计

---

## 📝 检查清单

- [ ] 创建 labels.mjs 文件
- [ ] 补充 i18n.js 中的标签翻译
- [ ] 修改 /api/stats 返回 labels
- [ ] 前端集成 labels 数据
- [ ] 测试中文显示
- [ ] 测试语言切换
- [ ] 验收通过
- [ ] 提交 PR (feat(i18n): add full Chinese labels mapping)

