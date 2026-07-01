# SKILL 扫描适配器与 /api/other-skills 端点 — 实现文档

## 概述

实现了一个通用的 SKILL.md 文件扫描适配器和对应的 HTTP 端点，用于扫描任意源中的 SKILL.md 文件并返回标准化格式的技能数据。

## 实现内容

### 1. 后端扫描适配器 (`packages/scanner/src/adapters/skill-adapter.mjs`)

**功能**：
- 通过 `scanSkills()` 函数扫描任意位置的 SKILL.md 文件
- 完全支持 YAML frontmatter 解析（包括 i18n 字段）
- 使用项目现有的解析工具（`utils.mjs` 中的函数）
- 提供标准化的技能项对象

**主要导出**：
```javascript
export async function scanSkills(opts) {
  const {
    source = 'other-skills',           // 源标识符
    roots = [],                         // 扫描根目录数组
    fileGlob = '**/SKILL.md',          // 文件 glob 模式
    limits = { maxFiles, maxFileBytes } // 限制
  }
  return { items, stats };
}
```

**返回格式**：
```javascript
{
  items: [
    {
      id,              // SHA1 哈希 ID
      kind: 'skill',   // 总是 'skill'
      source,          // 源标识
      editor,          // 编辑器类型
      name,            // 技能名称
      title,           // 可选的标题
      description,     // 一行描述
      category,        // 从目录结构提取的分类
      brand,           // 推断的品牌
      product,         // 推断的产品
      tags,            // 标签数组
      triggers,        // 触发条件数组
      links,           // 链接数组 [{label, url}]
      paths: {
        abs,           // 绝对路径
        rel,           // 相对路径
        rootKind       // 根分类 ('home', 'project', 'icloud')
      },
      preview,         // 内容预览（前 600 字）
      raw,             // 完整文件内容
      updatedAt,       // 更新时间（ISO 格式）
      i18n,            // 可选的国际化字段
      parseError       // 可选的解析错误
    },
    // ... 更多技能
  ],
  stats: {
    source,      // 源标识
    available,   // 是否可用
    files,       // 找到的文件数
    roots        // 展开的根目录列表
  }
}
```

**关键特性**：
- 完整的 frontmatter 解析（YAML）
- 支持 i18n 国际化字段（如 `name_zh`, `description_zh`, `category_zh`）
- 支持多种标签格式（数组或逗号分隔字符串）
- 支持多种触发条件格式
- 支持链接提取
- 错误处理和文件大小限制
- 目录结构中的自动分类提取

### 2. HTTP 端点 (`/api/other-skills`)

**位置**：`packages/server/src/index.mjs` 第 193 行

**方法**：GET

**查询参数**：
- `roots`（必需）：逗号分隔的扫描根目录列表（支持 ~ 和 glob）
- `fileGlob`（可选）：SKILL.md 文件的 glob 模式，默认为 `**/SKILL.md`
- `source`（可选）：源标识符，默认为 `other-skills`
- `maxFiles`（可选）：最大扫描文件数，默认 100，最大 5000
- `maxFileBytes`（可选）：单个文件最大字节数，默认 1MB，最大 10MB

**请求示例**：
```bash
# 基础请求
GET /api/other-skills?roots=/path/to/skills

# 多个根目录
GET /api/other-skills?roots=/path/one,/path/two,~/custom-skills

# 自定义参数
GET /api/other-skills?roots=/path&source=my-skills&maxFiles=200&fileGlob=**/SKILL.md
```

**响应格式**：
```javascript
{
  ok: true,
  skills: [
    {
      id,              // 技能唯一标识
      name,            // 技能名称
      description,     // 描述
      category,        // 分类
      kind,            // 总是 'skill'
      brand,           // 推断的品牌
      tags,            // 标签数组
      path,            // 文件绝对路径
      frontmatter: {   // frontmatter 数据
        title,
        triggers,
        links,
        product,
        editor,
        source,
        updatedAt,
        parseError
      }
    },
    // ... 更多技能
  ],
  stats: {
    source,      // 源标识
    available,   // 是否成功
    files,       // 扫描到的文件数
    scanned,     // 返回的技能数
    roots,       // 展开的根目录
    fileGlob     // 使用的 glob 模式
  }
}
```

**错误响应**：
```javascript
// 缺少必需参数
{
  ok: false,
  error: "missing query parameter: roots (comma-separated paths)"
}

// 服务器错误
{
  ok: false,
  error: "error message"
}
```

## 使用示例

### JavaScript/Node.js

```javascript
// 直接使用适配器
import { scanSkills } from './packages/scanner/src/adapters/skill-adapter.mjs';

const result = await scanSkills({
  source: 'my-custom-source',
  roots: ['~/my-skills', '/projects/shared-skills'],
  fileGlob: '**/SKILL.md',
  limits: { maxFiles: 100, maxFileBytes: 1024 * 1024 }
});

result.items.forEach(skill => {
  console.log(`${skill.name}: ${skill.description}`);
  console.log(`  Tags: ${skill.tags?.join(', ')}`);
  console.log(`  Category: ${skill.category}`);
});
```

### cURL

```bash
# 基础查询
curl "http://localhost:11520/api/other-skills?roots=/tmp/test-skills"

# 带自定义参数
curl "http://localhost:11520/api/other-skills?roots=/path/one,/path/two&source=my-skills&maxFiles=50&fileGlob=**/SKILL.md"

# 格式化输出
curl -s "http://localhost:11520/api/other-skills?roots=/tmp/test-skills" | jq '.skills[] | {name, category, tags}'
```

### Python

```python
import requests
import json

params = {
    'roots': '/tmp/test-skills',
    'source': 'python-test',
    'maxFiles': 100
}

response = requests.get('http://localhost:11520/api/other-skills', params=params)
data = response.json()

if data['ok']:
    for skill in data['skills']:
        print(f"- {skill['name']}")
        print(f"  Description: {skill['description']}")
        print(f"  Category: {skill['category']}")
        print()
else:
    print(f"Error: {data['error']}")
```

## SKILL.md 文件格式

标准的 SKILL.md 文件包含 YAML frontmatter 和 Markdown 内容：

```markdown
---
name: 技能名称
title: 可选的更详细标题
description: 一行描述
category_zh: 技能分类（中文）
tags:
  - 标签1
  - 标签2
triggers:
  - 使用场景1
  - 使用场景2
links:
  - label: 文档
    url: https://example.com/docs
url: https://example.com
---

# 技能名称

## 描述

这是技能的 Markdown 内容...

## 使用方法

- 方法 1
- 方法 2
```

## 整合点

### 现有工具重用

该实现完全基于项目现有的解析工具：

| 工具函数 | 来源 | 用途 |
|---------|------|------|
| `expandRoots()` | `utils.mjs` | 展开 ~ 和 glob 路径 |
| `parseFrontmatter()` | `utils.mjs` | YAML 解析 |
| `inferBrand()` | `utils.mjs` | 品牌推断 |
| `inferProduct()` | `utils.mjs` | 产品推断 |
| `deriveDescription()` | `utils.mjs` | 提取描述 |
| `sha1Id()` | `utils.mjs` | ID 生成 |
| `readFileSafe()` | `utils.mjs` | 安全的文件读取 |
| `classifyRoot()` | `utils.mjs` | 根目录分类 |
| `makePreview()` | `utils.mjs` | 生成预览 |

### 路由集成

新端点通过直接在 `packages/server/src/index.mjs` 中添加来集成，与其他 `/api/*` 端点保持一致的设计模式。

## 测试

项目包含两个完整的测试：

1. **`test-skill-adapter.mjs`** - 测试适配器的核心功能
   - 扫描多个 SKILL.md 文件
   - 验证 frontmatter 解析
   - 验证标签和触发条件的多种格式支持
   - 验证 i18n 字段
   - 验证 API 响应格式

2. **`test-api-endpoint.mjs`** - 测试 HTTP 端点
   - 测试缺少参数的错误处理
   - 测试有效的扫描请求
   - 测试多根目录支持
   - 测试自定义源标识符

**运行测试**：
```bash
node test-skill-adapter.mjs      # 测试适配器
node test-api-endpoint.mjs       # 测试 API 端点
```

## 文件变更总结

| 文件 | 操作 | 说明 |
|------|------|------|
| `packages/scanner/src/adapters/skill-adapter.mjs` | 创建 | 新的 SKILL.md 扫描适配器 |
| `packages/server/src/routes/skills.mjs` | 创建 | 技能路由模块（可选） |
| `packages/server/src/index.mjs` | 修改 | 添加 `/api/other-skills` 端点（第 193 行） |
| `test-skill-adapter.mjs` | 创建 | 适配器测试脚本 |
| `test-api-endpoint.mjs` | 创建 | 端点测试脚本 |

## 性能特性

- **流式处理**：使用 fast-glob 高效扫描大型目录树
- **文件限制**：默认最多扫描 100 个文件，可配置最大 5000
- **大小限制**：默认每个文件最大 1MB，可配置最大 10MB
- **忽略列表**：自动忽略常见的不必要目录（node_modules, .git, dist）
- **符号链接支持**：可跟踪符号链接
- **隐藏文件支持**：包含点文件和隐藏目录

## 扩展选项

该实现可以轻松扩展以支持：
- 不同的文件格式（JSON、TOML 等）
- 额外的元数据字段
- 自定义品牌推断规则
- 缓存和增量更新
- 实时文件监视和热重载

