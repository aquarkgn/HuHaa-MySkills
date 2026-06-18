# HuHaa-MySkills 编辑器技能同步 (v0.1.2)

本文档说明如何使用编辑器技能自动同步功能。

## 快速开始

### 方式 1：本地安装后同步

```bash
# 克隆项目
git clone https://github.com/aquarkgn/HuHaa-MySkills.git
cd HuHaa-MySkills

# 执行同步脚本（交互模式）
npm run sync
# 或直接运行
bash service/scripts/sync-skills.sh
```

### 方式 2：远程一键安装 + 同步

```bash
# 通过 curl 直接执行（推荐）
curl -fsSL https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills/main/install-and-sync.sh | bash
```

### 方式 3：仅同步（已安装项目后）

```bash
npm run sync
# 或
npm run sync:remote
```

---

## 功能说明

### 自动编辑器检测

脚本会自动扫描以下编辑器，并列出已安装的编辑器：

| 编辑器       | macOS 配置位置                                    | Linux 配置位置               |
|------------|----------------------------------------------------|-----------------------------|
| **Cursor** | `~/Library/Application Support/Cursor`            | `~/.config/Cursor`          |
| **VS Code** | `~/Library/Application Support/Code`             | `~/.config/Code`            |
| **Helix**  | `~/Library/Application Support/helix`            | `~/.config/helix`           |
| **Neovim** | `~/.config/nvim`                                  | `~/.config/nvim`            |
| **Sublime** | `~/Library/Application Support/Sublime Text`     | `~/.config/sublime-text-3`  |
| **Windsurf** | `~/Library/Application Support/Windsurf`        | `~/.config/Windsurf`        |

### 交互式选择

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  请选择要同步技能的编辑器（多选）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  [1] cursor
     Path: /Users/mac/Library/Application Support/Cursor

  [2] vscode
     Path: /Users/mac/Library/Application Support/Code

  [3] helix
     Path: /Users/mac/Library/Application Support/helix

  0 - 全选
  q - 退出

请输入选择 (使用逗号分隔多个): 1,2
```

**支持的输入方式：**
- `1` - 选择第一个编辑器
- `1,2,3` - 选择多个编辑器
- `0` - 全选所有编辑器
- `q` - 取消操作

### 同步功能

脚本会将项目的技能和配置同步到选中的编辑器：

#### Cursor
- 同步 `.cursorrules` 文件到编辑器配置目录
- 自动备份原有的 `.cursorrules`

#### VS Code
- 复制代码片段和脚本到编辑器的 snippets 目录
- 支持自定义代码补全

#### Helix
- 同步 `config.toml` 配置文件
- 集成 HuHaa 自定义命令

#### Neovim
- 生成 `init.lua` 基础配置
- 加载 HuHaa 自定义配置

#### Sublime Text
- 同步用户设置和代码片段

#### Windsurf
- 同步编辑器配置

---

## 使用示例

### 示例 1：在本地项目中同步所有编辑器

```bash
cd /path/to/HuHaa-MySkills
npm run sync

# 选择: 0（全选）
```

### 示例 2：只同步 Cursor

```bash
npm run sync

# 选择: 1（假设 Cursor 是第一个）
```

### 示例 3：从远程直接运行（新机器）

```bash
# 自动安装 + 同步一体化
curl -fsSL https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills/main/install-and-sync.sh | bash

# 或者只执行同步
curl -fsSL https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills/main/install-and-sync.sh | bash -s -- --sync-only
```

### 示例 4：本地项目路径

```bash
# 如果脚本在其他位置，指定本地项目路径
bash /path/to/sync-skills.sh --local /path/to/HuHaa-MySkills
```

---

## 环境变量

脚本支持以下环境变量来自定义行为：

```bash
# 指定本地项目路径
export HUHAA_LOCAL_PATH="/path/to/HuHaa-MySkills"

# 指定远程仓库 URL（默认：https://github.com/aquarkgn/HuHaa-MySkills.git）
export HUHAA_REPO_URL="https://github.com/your-fork/HuHaa-MySkills.git"

# 指定原始内容 URL（默认：https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills）
export HUHAA_REPO_RAW="https://raw.githubusercontent.com/your-fork/HuHaa-MySkills"

# 执行脚本
bash service/scripts/sync-skills.sh
```

---

## 常见问题

### Q: 脚本找不到我的编辑器配置？

**A:** 某些编辑器在非标准位置安装。你可以：
1. 检查编辑器是否在支持列表中
2. 确认编辑器配置目录是否存在
3. 手动指定项目路径：`HUHAA_LOCAL_PATH=/path/to/project bash service/scripts/sync-skills.sh`

### Q: 同步会覆盖我的现有配置吗？

**A:** 脚本会：
- 为 Cursor 的 `.cursorrules` 创建备份（`.cursorrules.backup`）
- 对于其他编辑器，如果配置文件已存在，会跳过覆盖并显示警告
- 不会无故删除任何文件

### Q: 可以部分同步吗？

**A:** 可以！选择需要同步的编辑器即可：
```bash
npm run sync
# 选择: 1,3（只同步第 1 和第 3 个编辑器）
```

### Q: 如何撤销同步？

**A:** 如果有备份，恢复备份文件：
```bash
# 恢复 Cursor 备份
cp ~/.cursor/.cursorrules.backup ~/.cursor/.cursorrules
```

### Q: 脚本支持 Windows 吗？

**A:** 支持 Windows WSL（Windows Subsystem for Linux）。在 PowerShell 中：
```powershell
wsl bash -c "curl -fsSL https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills/main/install-and-sync.sh | bash"
```

---

## 故障排查

### 脚本执行权限错误

```bash
# 添加执行权限
chmod +x service/scripts/sync-skills.sh
bash service/scripts/sync-skills.sh
```

### 网络连接问题

如果 curl 下载失败，可尝试：
1. 检查网络连接
2. 使用代理：`curl -x [proxy-url] ...`
3. 使用本地项目：`npm run sync`

### 编辑器不被识别

检查编辑器配置目录是否存在：
```bash
# macOS
ls ~/Library/Application\ Support/Cursor
ls ~/Library/Application\ Support/Code
ls ~/.config/nvim  # Linux

# Linux
ls ~/.config/Cursor
ls ~/.config/Code
ls ~/.config/helix
```

---

## 后续更新

脚本会在新版本中增加：
- [ ] 更多编辑器支持（Emacs, Vim, etc）
- [ ] 配置文件版本管理
- [ ] 回滚功能
- [ ] 增量同步（只同步改变的部分）

---

## 相关文档

- [快速启动指南](./GUIDE.md)
- [项目规划](./PLAN.md)
- [发布规范](./RULES.md)

---

**v0.1.2 首发功能** | [GitHub](https://github.com/aquarkgn/HuHaa-MySkills)
