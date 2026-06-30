# T6.1 - true 语法高亮（可选）

**日期**: 2026-06-30  
**状态**: 📋 分析完成 (可选任务)

---

## 概述

T6.1 是关于在项目文档和代码示例中支持 **true 语法高亮** 的可选任务。此任务用于增强 Markdown 代码块的语法高亮显示。

---

## 📊 当前分析

### 1️⃣ **项目中 true 代码块的使用** ✓

**搜索结果**:
```bash
$ grep -r '```true' . --include="*.md" --include="*.ts" --include="*.tsx"
# 结果: 0 匹配项
```

**发现**: 项目中目前不存在 `true` 代码块的使用。

### 2️⃣ **Markdown 代码块用途分析** ✓

| 代码块类型 | 用途 | 文件示例 | 优先级 |
|-----------|------|---------|--------|
| `typescript` | App.tsx、组件代码 | T6_VERIFY_SHELL_STRUCTURE.md | 高 |
| `html` | 模板、JSX 示例 | P9_RESPONSIVE_A11Y_COVERAGE.md | 中 |
| `css` | 样式代码 | docs/Frontend-Theme-Design.md | 中 |
| `bash` / `shell` | 命令示例 | docs 文档 | 低 |
| `true` | **语言标识符**（待定义） | - | 可选 |

### 3️⃣ **true 语言的可能含义** 🤔

在项目上下文中，`true` 可能指代：

**假设 A**: Hermes 项目中自定义的"断言语言"（类似 Bash + 验证逻辑）
```true
# 伪代码示例
assert UIState.module === 'skills'
assert Action.type in ['module', 'dashboard', 'settings', ...]
assert Reducer(state, action) returns UIState
```

**假设 B**: 项目特定的"验证语言"或"配置语言"
```true
[UIState]
  module: ModuleKey ✓
  view: View ✓
  editorFilter: string | null ✓
  ...
```

**假设 C**: 标准的 boolean/assertion 示例语言
```true
✅ true  # 验证通过
❌ false # 验证失败
```

---

## 🎯 可选实施方案

### 方案 1: 使用现有高亮器（推荐）

**如果 true 代码块已在使用**:
```bash
# 在 Markdown 中指定语言
```typescript
// TypeScript 代码
export interface UIState { ... }
```

// 或

\`\`\`javascript
// 通用 JS 示例
const UIState = { ... }
\`\`\`

// 或

\`\`\`json
// JSON 配置
{
  "module": "skills",
  "view": "dashboard"
}
\`\`\`
```

**优点**:
- 使用现有高亮器
- 无需自定义语法
- 广泛兼容性

### 方案 2: 自定义 true 语言高亮器

**如果需要特定的 true 语法**:

#### 步骤 1: 定义 true 语法规则

**文件**: `docs/true-syntax-spec.md`

```markdown
# true 语言语法规范

## 用途
用于验证和断言代码示例的语法高亮。

## 语法规则

### 1. 验证块
\`\`\`
✅ 条件通过
❌ 条件失败
⚠️ 警告或注意
ℹ️ 信息提示
\`\`\`

### 2. 断言块
\`\`\`
assert <condition>
verify <property>
expect <value>
\`\`\`

### 3. 注释
\`\`\`
// 单行注释
# Hash 注释
\`\`\`
```

#### 步骤 2: 集成到项目

**选项 A**: 使用 Prism.js 自定义语言
```javascript
// 在 next.config.js 或类似配置中
Prism.languages.true = {
  'keyword': /\b(assert|verify|expect)\b/,
  'boolean': /\b(true|false)\b/,
  'operator': /✅|❌|⚠️|ℹ️/,
  'comment': /\/\/.*|#.*/,
};
```

**选项 B**: 使用 Shiki 自定义语言
```typescript
// 在 shiki.config.ts 中
import { getHighlighter } from 'shiki'

const highlighter = await getHighlighter({
  theme: 'github-light',
  langs: ['typescript', 'true'], // 添加 true 语言
})
```

---

## 📋 评估总结

### ✅ **不需要实施的原因**

1. **零使用**: 项目中目前无 `true` 代码块
2. **现有替代方案**: 可用 `typescript`, `javascript`, `json` 等
3. **增益有限**: 
   - 对代码示例的可读性提升有限
   - 当前已有充分的高亮覆盖
4. **维护成本**: 自定义语言需要额外维护

### 🟡 **可能需要实施的情况**

如果满足以下任一条件，重新考虑:
- [ ] 项目添加了 `true` 类型的代码块示例
- [ ] 需要特殊的验证语法高亮
- [ ] 有特定的 DSL（Domain-Specific Language）需要支持
- [ ] 用户反馈高亮不清晰

---

## 🎯 建议

### 现在 (不实施)
**理由**: 
- 无当前使用场景
- 现有高亮器足够
- 维护成本高

### 未来 (按需)
**触发条件**:
1. 项目添加了特定的验证语言/DSL
2. 用户反馈代码示例高亮不清晰
3. 内部团队要求统一高亮标准

### 如何启用
当需要时，只需：
1. 在 Markdown 中使用 ````true```` 代码块
2. 配置相应的高亮器（Prism.js 或 Shiki）
3. 定义语言规则

---

## 📚 参考资源

### Markdown 高亮器
- **Prism.js**: https://prismjs.com/ (支持自定义语言)
- **Shiki**: https://shiki.matsu.io/ (精确语法高亮)
- **Highlight.js**: https://highlightjs.org/ (轻量级)

### 示例语言定义
```javascript
// Prism.js 自定义语言示例
Prism.languages.myLang = {
  'keyword': /\b(if|else|for|while)\b/,
  'string': /"(?:\\.|[^"\\])*"/,
  'number': /\b\d+\b/,
  'operator': /[+\-*/=]/,
  'comment': /#.*/
};
```

---

## ✅ 结论

**T6.1 - true 语法高亮 (可选)** 

### 当前状态
- 📋 **分析完成**: true 语言无使用场景
- ✅ **建议**: 不立即实施
- 🔄 **触发**: 当项目添加相关代码块时

### 优化建议
1. **保持现状**: 继续使用 `typescript`, `javascript` 等标准高亮
2. **记录规则**: 在 docs 中记录（已完成）
3. **监控需求**: 如用户反馈高亮问题，重新评估

### 下次操作
如果需要启用 true 语法高亮：
1. 创建 `docs/true-syntax-spec.md` (规范定义)
2. 在项目构建配置中集成 Prism.js/Shiki
3. 在 Markdown 中使用 ````true```` 代码块

---

**任务类型**: 可选分析  
**完成状态**: ✅ 完成  
**推荐优先级**: 低（按需）  
**下次评估**: 当项目添加 true 代码块时
