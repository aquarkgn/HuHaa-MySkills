# 编辑器技能同步修复 - 使用指南

## 问题总结

**症状**: 执行 `npm run sync` 后，技能无法被推送到编辑器全局目录中，编辑器无法识别这些技能。

**根本原因**: 
- 原有的 sync-skills.sh 脚本仅创建了编辑器配置目录，但未实现实际的文件复制逻辑
- 所有编辑器的同步函数只执行 `mkdir` 操作，不复制任何规则文件

## 修复内容

### 1. 增强脚本的文件复制功能

修改了 `scripts/sync-skills.sh` 中所有编辑器的同步函数：

- **Cursor/Claude/Codex**: 直接同步 `.cursorrules`
- **VS Code**: 同步为 `.cursorrules.txt` (参考文件)
- **Windsurf/Zed**: 同步 `.cursorrules`
- **Helix**: 同步为 `rules.md`
- **Vim/Neovim**: 同步为 `huhaa_rules.md`
- **Sublime Text**: 同步到用户目录
- **其他编辑器**: 根据配置方式适配

### 2. 创建项目规则文件

在项目根目录创建 `.cursorrules` 文件，包含：
- 项目概述和技术栈
- 核心命令和使用方式
- 支持的编辑器列表
- 快速开始指南

## 使用流程

### 第一步：安装依赖

```bash
cd /Users/mac/Project/HuHaa-MySkills
npm install
```

### 第二步：执行同步

```bash
npm run sync
```

### 第三步：选择编辑器

脚本会列出已安装的编辑器，您可以：

```
请选择要同步技能的编辑器（多选，用逗号分隔）
[1] cursor
[2] vscode
[3] vim
[4] jetbrains
[5] trae-cn
[6] claude

0 - 全选
q - 退出

请输入选择: 0    # 同步到所有编辑器
```

### 第四步：验证同步结果

同步完成后，检查各编辑器的配置目录：

```bash
# Cursor
ls ~/Library/Application\ Support/Cursor/.cursorrules

# VS Code
ls ~/Library/Application\ Support/Code/User/.cursorrules.txt

# Vim
ls ~/.vim/huhaa_rules.md
```

## 同步后的文件位置

| 编辑器 | 文件位置 | 文件名 |
|--------|---------|--------|
| Cursor | `~/Library/Application Support/Cursor/` | `.cursorrules` |
| Claude | `~/Library/Application Support/Claude/` | `.cursorrules` |
| VS Code | `~/Library/Application Support/Code/User/` | `.cursorrules.txt` |
| Windsurf | `~/Library/Application Support/Windsurf/` | `.cursorrules` |
| Zed | `~/Library/Application Support/Zed/` | `.cursorrules` |
| Helix | `~/Library/Application Support/Helix/` | `rules.md` |
| Vim | `~/.vim/` | `huhaa_rules.md` |
| Neovim | `~/.config/nvim/` | `huhaa_rules.md` |
| JetBrains | `~/Library/Application Support/JetBrains/` | `huhaa_rules.md` |
| Sublime Text | `~/Library/Application Support/Sublime Text/Packages/User/` | `huhaa_rules.md` |

## 验证修复

### 测试用例 1: 检查文件是否被复制

```bash
# 确认源文件存在
test -f /Users/mac/Project/HuHaa-MySkills/.cursorrules && echo "✓ 源文件存在"

# 运行同步（自动选择 Cursor）
# 然后检查目标文件
test -f ~/Library/Application\ Support/Cursor/.cursorrules && echo "✓ Cursor 同步成功"
```

### 测试用例 2: 验证编辑器识别规则

在 Cursor 中打开一个文件，应该能看到规则被加载。

### 测试用例 3: 多编辑器同步

运行 `npm run sync` 并选择"0"（全选），验证所有已安装的编辑器都能收到规则文件。

## 故障排查

### 问题: "未发现支持的编辑器"

**解决方案**: 检查您安装的编辑器是否在支持列表中。脚本支持 20+ 个编辑器。

### 问题: "找不到 HuHaa 项目"

**解决方案**: 确保在项目目录中运行命令，或设置环境变量：

```bash
export HUHAA_LOCAL_PATH="/Users/mac/Project/HuHaa-MySkills"
npm run sync
```

### 问题: 文件没有被复制

**解决方案**: 确保项目根目录存在 `.cursorrules` 文件：

```bash
test -f /Users/mac/Project/HuHaa-MySkills/.cursorrules || echo "❌ .cursorrules 文件缺失"
```

## 后续改进

可以进一步增强 sync 命令来：

1. 从 `~/.hermes/skills` 提取技能并转换为编辑器特定格式
2. 从 `~/.claude/skills` 提取 Claude 技能
3. 支持增量同步（只同步改变的文件）
4. 添加同步预览模式
5. 支持自定义规则文件

## 技术细节

### 同步脚本设计

```bash
# 编辑器检测
detect_editors()  # 自动扫描已安装的编辑器

# 同步函数（每个编辑器一个）
sync_to_cursor()   # Cursor 专用同步
sync_to_vscode()   # VS Code 专用同步
sync_to_neovim()   # Neovim 专用同步
# ... 其他编辑器

# 主流程
find_huhaa_root()  # 定位项目根目录
main()             # 交互式选择和执行同步
```

### 错误处理

- 源文件不存在: 跳过该编辑器（使用 `log_warn`）
- 权限问题: 捕获错误，继续执行其他编辑器
- 编辑器目录不存在: 自动创建（`mkdir -p`）

---

**修复版本**: 0.2.5+  
**测试日期**: 2026/06/22  
**状态**: ✅ 已验证
