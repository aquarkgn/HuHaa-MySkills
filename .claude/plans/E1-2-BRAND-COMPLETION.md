# E1-2: 品牌数据补全 - 完整执行计划

## 📋 任务概述

用户已上传品牌 logo 图片，现在需要：
1. 分析图片中的品牌 logo
2. 为 Hermes 技能补全品牌元数据
3. 提升品牌完整性从 60% → 80%+

---

## 🎯 当前状态

**品牌数据现状** (来自 E1-2 诊断):
```
有 brand 的技能:    1 个 (huhaa-myskills: HuHaa)
缺 brand 的技能:   144 个
完整性:            0.7% ❌ (远低于 60% 基线)
```

**需补全数量**: 116+ 个技能 (达到 80% = 116/145)

**Top 分类** (补全优先级):
1. DevOps (25 个) - 对应品牌: Docker, Kubernetes, GitHub, Linux
2. Development (25 个) - 对应品牌: VS Code, GitHub, Apple
3. ML/AI (24 个) - 对应品牌: OpenAI, Google, Anthropic, Meta
4. Creative (16 个) - 对应品牌: Adobe, Figma, Sketch
5. Productivity (12 个) - 对应品牌: Microsoft, Google, Notion

---

## 🔍 品牌 Logo 图片分析

用户上传: ChatGPT Image 2026年6月29日 10_32_40.png (1254x1254)

**预期包含的品牌** (基于常见技能库):
- [ ] GitHub (Octocat, #24292E 黑色)
- [ ] Docker (鲸鱼, #2496ED 蓝色)
- [ ] Kubernetes (舵轮, #326CE5 蓝色)
- [ ] AWS (橙色箭头)
- [ ] Google (彩色 G)
- [ ] Microsoft (四方块)
- [ ] Apple (苹果)
- [ ] OpenAI (红色旋转)
- [ ] Hermes (紫色齿轮)
- [ ] 其他...

---

## 💼 完整的品牌映射表

基于诊断结果和用户 logo，建议的完整品牌配置:

```javascript
// BRAND_CONFIG.js - 完整的品牌映射表

export const BRANDS = {
  // Infrastructure & DevOps
  'GitHub': {
    icon: '🐙',
    color: '#24292E',
    category: 'DevOps',
    keywords: ['git', 'version-control', 'repository']
  },
  'Docker': {
    icon: '🐋',
    color: '#2496ED',
    category: 'DevOps',
    keywords: ['container', 'docker', 'deployment']
  },
  'Kubernetes': {
    icon: '☸️',
    color: '#326CE5',
    category: 'DevOps',
    keywords: ['k8s', 'orchestration', 'container']
  },
  'AWS': {
    icon: '☁️',
    color: '#FF9900',
    category: 'DevOps',
    keywords: ['cloud', 'aws', 'infrastructure']
  },
  'Linux': {
    icon: '🐧',
    color: '#FCC624',
    category: 'DevOps',
    keywords: ['linux', 'unix', 'shell']
  },

  // AI & ML
  'OpenAI': {
    icon: '🤖',
    color: '#10A37F',
    category: 'AI/ML',
    keywords: ['ai', 'gpt', 'llm', 'chatgpt']
  },
  'Google': {
    icon: '🔍',
    color: '#4285F4',
    category: 'AI/ML',
    keywords: ['google', 'cloud', 'search', 'gemini']
  },
  'Anthropic': {
    icon: '🧠',
    color: '#9ACD32',
    category: 'AI/ML',
    keywords: ['anthropic', 'claude', 'ai']
  },
  'Meta': {
    icon: '👥',
    color: '#0A66C2',
    category: 'AI/ML',
    keywords: ['meta', 'llama', 'ai']
  },

  // Development Tools
  'VS Code': {
    icon: '📝',
    color: '#007ACC',
    category: 'Development',
    keywords: ['vscode', 'editor', 'coding']
  },
  'Apple': {
    icon: '🍎',
    color: '#A1AAAD',
    category: 'Development',
    keywords: ['apple', 'ios', 'macos', 'swift']
  },
  'Microsoft': {
    icon: '📦',
    color: '#0078D4',
    category: 'Development',
    keywords: ['microsoft', 'windows', 'azure']
  },

  // Creative & Design
  'Figma': {
    icon: '✏️',
    color: '#F24E1E',
    category: 'Creative',
    keywords: ['figma', 'design', 'ui']
  },
  'Adobe': {
    icon: '🎨',
    color: '#FF0000',
    category: 'Creative',
    keywords: ['adobe', 'photoshop', 'design']
  },

  // Others
  'Hermes': {
    icon: '⚙️',
    color: '#8B5CF6',
    category: 'Internal',
    keywords: ['hermes', 'skill']
  },
  'Node.js': {
    icon: '📦',
    color: '#68A063',
    category: 'Development',
    keywords: ['node', 'nodejs', 'javascript']
  },
  'Python': {
    icon: '🐍',
    color: '#3776AB',
    category: 'Development',
    keywords: ['python', 'script']
  },
};
```

---

## 📝 执行步骤

### Phase 1: 品牌映射表创建 (15min)
```bash
# 创建 branding-complete.js
# 包含 30+ 个已知品牌的完整配置
# 包含: icon, color, category, keywords, 描述
```

### Phase 2: 技能元数据补全 (60min)
```bash
# 遍历 ~/.hermes/skills/*/SKILL.md
# 基于技能名称/描述/分类自动识别品牌
# 补全 brand 字段

示例:
  - docker-image-cleanup → Docker
  - kubernetes-* → Kubernetes
  - python-* → Python
  - github-* → GitHub
  - openai-* → OpenAI
  - claude-* → Anthropic
  - node-* → Node.js
```

### Phase 3: 数据验证 (20min)
```bash
# 检查补全结果
# 验证品牌完整性提升
# 生成补全报告
```

### Phase 4: 前端集成 (15min)
```bash
# 更新 branding.js
# 集成新的品牌配置
# 测试 UI 显示
```

---

## 🎯 期望成果

### 品牌完整性目标
```
当前: 1/145 (0.7%) 🔴
目标: 116+/145 (80%+) 🟢

提升: +115 个技能
增长: 从 0.7% → 80%+ (114 倍!)
```

### 品牌分布目标
```
前 10 品牌应覆盖 ~80% 的技能

预期分布:
  GitHub:       15-20 个
  Docker:       8-10 个
  Kubernetes:   5-7 个
  OpenAI:       8-10 个
  Google:       5-7 个
  Python:       8-10 个
  Node.js:      5-7 个
  AWS:          5-7 个
  Anthropic:    5-7 个
  Apple:        3-5 个
  其他:         20-30 个
```

---

## 📊 验收标准

- [ ] 品牌完整性达到 80%+ (116+ 个技能)
- [ ] 前 10 品牌清晰可见
- [ ] 每个品牌都有 icon + color
- [ ] UI 中正确显示品牌信息
- [ ] 生成补全报告 (补全前后对比)
- [ ] 所有改动已提交

---

## 🚀 下一步建议

1. **立即**: 根据用户上传的 logo 图片调整品牌配置
2. **然后**: 执行自动补全脚本
3. **最后**: 验证效果并提交

---

**预计工时**: 2 小时  
**优先级**: 🔴 高  
**关键路径**: 是 (v0.3.3 最后一个关键任务)

