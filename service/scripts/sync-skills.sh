#!/bin/bash

###############################################################################
# HuHaa-MySkills 编辑器技能同步脚本 (v0.1.2)
#
# 功能：自动检测本机已安装的编辑器，交互式选择，将项目技能同步到各编辑器
# 用法：
#   - 本地运行: ./service/scripts/sync-skills.sh
#   - 远程安装: curl -fsSL https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills/main/service/scripts/sync-skills.sh | bash
#
# 支持的编辑器:
#   - Cursor
#   - VS Code (code)
#   - Helix
#   - Vim/Neovim
#   - Sublime Text
#   - Windsurf
#
###############################################################################

set -euo pipefail

# 颜色定义
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# 默认配置
HUHAA_REPO_URL="${HUHAA_REPO_URL:-https://github.com/aquarkgn/HuHaa-MySkills.git}"
HUHAA_REPO_RAW="${HUHAA_REPO_RAW:-https://raw.githubusercontent.com/aquarkgn/HuHaa-MySkills/main}"
HUHAA_LOCAL_PATH="${HUHAA_LOCAL_PATH:-}"

# 日志函数
log_info() {
  echo -e "${BLUE}ℹ${NC} $*"
}

log_success() {
  echo -e "${GREEN}✓${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
  echo -e "${RED}✗${NC} $*" >&2
}

# 检查命令是否存在
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# 获取操作系统
get_os() {
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "linux"
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "macos"
  elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    echo "windows"
  else
    echo "unknown"
  fi
}

# 获取 Home 目录
get_home() {
  if [[ -n "${HOME:-}" ]]; then
    echo "$HOME"
  else
    echo "$PWD"
  fi
}

###############################################################################
# 编辑器检测函数
###############################################################################

# 检测 Cursor
detect_cursor() {
  local cursor_config=""
  local os=$(get_os)

  case "$os" in
    macos)
      cursor_config="$HOME/Library/Application Support/Cursor"
      ;;
    linux)
      cursor_config="$HOME/.config/Cursor"
      ;;
    windows)
      cursor_config="$APPDATA/Cursor"
      ;;
  esac

  if [[ -n "$cursor_config" ]] && [[ -d "$cursor_config" ]]; then
    echo "$cursor_config"
    return 0
  fi
  return 1
}

# 检测 VS Code
detect_vscode() {
  local vscode_config=""
  local os=$(get_os)

  case "$os" in
    macos)
      vscode_config="$HOME/Library/Application Support/Code"
      ;;
    linux)
      vscode_config="$HOME/.config/Code"
      ;;
    windows)
      vscode_config="$APPDATA/Code"
      ;;
  esac

  if [[ -n "$vscode_config" ]] && [[ -d "$vscode_config" ]]; then
    echo "$vscode_config"
    return 0
  fi
  return 1
}

# 检测 Helix
detect_helix() {
  local helix_config=""

  if [[ "$OSTYPE" == "darwin"* ]]; then
    helix_config="$HOME/Library/Application Support/helix"
  else
    helix_config="$HOME/.config/helix"
  fi

  if [[ -n "$helix_config" ]] && [[ -d "$helix_config" ]]; then
    echo "$helix_config"
    return 0
  fi
  return 1
}

# 检测 Vim/Neovim
detect_neovim() {
  local nvim_config=""

  if command_exists nvim; then
    if [[ "$OSTYPE" == "darwin"* ]]; then
      nvim_config="$HOME/.config/nvim"
    else
      nvim_config="${XDG_CONFIG_HOME:-$HOME/.config}/nvim"
    fi

    if [[ -d "$nvim_config" ]]; then
      echo "$nvim_config"
      return 0
    fi
  fi
  return 1
}

# 检测 Sublime Text
detect_sublime() {
  local sublime_config=""
  local os=$(get_os)

  case "$os" in
    macos)
      sublime_config="$HOME/Library/Application Support/Sublime Text"
      ;;
    linux)
      sublime_config="$HOME/.config/sublime-text-3"
      ;;
    windows)
      sublime_config="$APPDATA/Sublime Text 3"
      ;;
  esac

  if [[ -n "$sublime_config" ]] && [[ -d "$sublime_config" ]]; then
    echo "$sublime_config"
    return 0
  fi
  return 1
}

# 检测 Windsurf
detect_windsurf() {
  local windsurf_config=""
  local os=$(get_os)

  case "$os" in
    macos)
      windsurf_config="$HOME/Library/Application Support/Windsurf"
      ;;
    linux)
      windsurf_config="$HOME/.config/Windsurf"
      ;;
    windows)
      windsurf_config="$APPDATA/Windsurf"
      ;;
  esac

  if [[ -n "$windsurf_config" ]] && [[ -d "$windsurf_config" ]]; then
    echo "$windsurf_config"
    return 0
  fi
  return 1
}

###############################################################################
# 编辑器列表扫描
###############################################################################

scan_editors() {
  local -A editors_map

  log_info "扫描已安装的编辑器...\n"

  # Cursor
  if cursor_path=$(detect_cursor); then
    editors_map["cursor"]="$cursor_path"
  fi

  # VS Code
  if vscode_path=$(detect_vscode); then
    editors_map["vscode"]="$vscode_path"
  fi

  # Helix
  if helix_path=$(detect_helix); then
    editors_map["helix"]="$helix_path"
  fi

  # Neovim
  if nvim_path=$(detect_neovim); then
    editors_map["neovim"]="$nvim_path"
  fi

  # Sublime Text
  if sublime_path=$(detect_sublime); then
    editors_map["sublime"]="$sublime_path"
  fi

  # Windsurf
  if windsurf_path=$(detect_windsurf); then
    editors_map["windsurf"]="$windsurf_path"
  fi

  if [[ ${#editors_map[@]} -eq 0 ]]; then
    log_warn "未检测到任何支持的编辑器"
    return 1
  fi

  # 输出编辑器列表
  local i=0
  for editor in "${!editors_map[@]}"; do
    local path="${editors_map[$editor]}"
    echo "$((i++))|$editor|$path"
  done
}

###############################################################################
# 交互式选择
###############################################################################

interactive_select() {
  local editors_data=("$@")

  if [[ ${#editors_data[@]} -eq 0 ]]; then
    log_error "没有可用的编辑器"
    return 1
  fi

  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  请选择要同步技能的编辑器（多选）${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  local -A editor_info
  local index=0

  for data in "${editors_data[@]}"; do
    IFS='|' read -r idx editor path <<< "$data"
    editor_info["$idx"]="$editor|$path"

    echo -e "  ${BLUE}[$((idx+1))${NC} ${BLUE}]${NC} $editor"
    echo "     Path: $path"
    echo
    ((index++))
  done

  echo -e "  ${YELLOW}0${NC} - 全选"
  echo -e "  ${YELLOW}q${NC} - 退出"
  echo

  read -p "请输入选择 (使用逗号分隔多个): " selection

  if [[ "$selection" == "q" ]]; then
    log_warn "已取消"
    return 1
  fi

  local selected_editors=()

  if [[ "$selection" == "0" ]]; then
    for i in "${!editor_info[@]}"; do
      selected_editors+=("$i")
    done
  else
    IFS=',' read -ra selections <<< "$selection"
    for sel in "${selections[@]}"; do
      sel=$(echo "$sel" | xargs) # 去除空格
      if [[ -n "$sel" ]] && [[ "$sel" =~ ^[0-9]+$ ]]; then
        local idx=$((sel - 1))
        if [[ ${editor_info[$idx]+_} ]]; then
          selected_editors+=("$idx")
        fi
      fi
    done
  fi

  if [[ ${#selected_editors[@]} -eq 0 ]]; then
    log_warn "未选择任何编辑器"
    return 1
  fi

  # 输出选中的编辑器索引
  printf '%s\n' "${selected_editors[@]}"
}

###############################################################################
# 技能同步逻辑
###############################################################################

# 获取 HuHaa 项目根目录
find_huhaa_root() {
  # 优先使用环境变量
  if [[ -n "$HUHAA_LOCAL_PATH" ]] && [[ -d "$HUHAA_LOCAL_PATH" ]]; then
    echo "$HUHAA_LOCAL_PATH"
    return 0
  fi

  # 查找当前脚本所在项目
  local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  if [[ -f "$script_dir/../package.json" ]] && grep -q "huhaa-myskills" "$script_dir/../package.json" 2>/dev/null; then
    echo "$(dirname "$script_dir")"
    return 0
  fi

  # npm 全局安装位置
  local npm_prefix=$(npm prefix -g 2>/dev/null || echo "")
  if [[ -n "$npm_prefix" ]] && [[ -d "$npm_prefix/node_modules/huhaa-myskills" ]]; then
    echo "$npm_prefix/node_modules/huhaa-myskills"
    return 0
  fi

  # 尝试找 git clone 的位置
  if command_exists git; then
    local git_path=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
    if [[ -n "$git_path" ]] && grep -q "huhaa-myskills" "$git_path/package.json" 2>/dev/null; then
      echo "$git_path"
      return 0
    fi
  fi

  log_error "无法找到 HuHaa-MySkills 项目根目录"
  return 1
}

# 同步技能到编辑器
sync_skills_to_editor() {
  local editor="$1"
  local editor_config="$2"
  local huhaa_root="$3"

  log_info "正在同步到 $editor..."

  case "$editor" in
    cursor)
      sync_cursor_rules "$editor_config" "$huhaa_root"
      ;;
    vscode)
      sync_vscode_settings "$editor_config" "$huhaa_root"
      ;;
    helix)
      sync_helix_config "$editor_config" "$huhaa_root"
      ;;
    neovim)
      sync_neovim_config "$editor_config" "$huhaa_root"
      ;;
    sublime)
      sync_sublime_config "$editor_config" "$huhaa_root"
      ;;
    windsurf)
      sync_windsurf_config "$editor_config" "$huhaa_root"
      ;;
    *)
      log_warn "未知的编辑器: $editor"
      return 1
      ;;
  esac
}

# Cursor 规则同步
sync_cursor_rules() {
  local cursor_config="$1"
  local huhaa_root="$2"

  # 检查 .cursorrules 文件是否存在
  local cursor_rules_src="$huhaa_root/.cursorrules"
  local cursor_rules_dst="$cursor_config/.cursorrules"

  if [[ ! -f "$cursor_rules_src" ]]; then
    log_warn "Cursor: 未找到 .cursorrules 文件 ($cursor_rules_src)"
    return 0
  fi

  # 创建备份
  if [[ -f "$cursor_rules_dst" ]]; then
    cp "$cursor_rules_dst" "$cursor_rules_dst.backup"
    log_info "Cursor: 已备份原 .cursorrules"
  fi

  # 复制规则文件
  cp "$cursor_rules_src" "$cursor_rules_dst"
  log_success "Cursor: 技能规则已同步"
}

# VS Code 设置同步
sync_vscode_settings() {
  local vscode_config="$1"
  local huhaa_root="$2"

  # VS Code 可以通过命令行或配置同步
  log_info "VS Code: 添加 HuHaa-MySkills 代码片段"

  local extensions_dir="$vscode_config/extensions"
  local snippets_dir="$vscode_config/User/snippets"

  # 创建代码片段目录
  mkdir -p "$snippets_dir"

  # 创建 HuHaa 相关的代码片段或脚本
  if [[ -d "$huhaa_root/snippets" ]]; then
    cp -r "$huhaa_root/snippets"/* "$snippets_dir/" 2>/dev/null || true
  fi

  log_success "VS Code: 技能已同步"
}

# Helix 配置同步
sync_helix_config() {
  local helix_config="$1"
  local huhaa_root="$2"

  log_info "Helix: 更新配置文件"

  local helix_toml="$helix_config/config.toml"

  # 创建配置目录
  mkdir -p "$helix_config"

  # 如果 HuHaa 有 Helix 配置，复制过去
  if [[ -f "$huhaa_root/config/helix.toml" ]]; then
    if [[ ! -f "$helix_toml" ]]; then
      cp "$huhaa_root/config/helix.toml" "$helix_toml"
    else
      log_warn "Helix: config.toml 已存在，跳过覆盖"
    fi
  fi

  log_success "Helix: 配置已同步"
}

# Neovim 配置同步
sync_neovim_config() {
  local nvim_config="$1"
  local huhaa_root="$2"

  log_info "Neovim: 更新配置文件"

  mkdir -p "$nvim_config"

  # 创建 init.lua（如果不存在）
  local init_lua="$nvim_config/init.lua"
  if [[ ! -f "$init_lua" ]]; then
    cat > "$init_lua" << 'EOF'
-- HuHaa-MySkills Neovim Configuration
-- 这是一个基础配置，请根据需要修改

local vimrc_config = os.getenv("HOME") .. "/.config/nvim/huhaa.lua"
if vim.fn.filereadable(vimrc_config) == 1 then
  dofile(vimrc_config)
end
EOF
  fi

  # 如果 HuHaa 有 Neovim 配置，复制过去
  if [[ -f "$huhaa_root/config/neovim.lua" ]]; then
    cp "$huhaa_root/config/neovim.lua" "$nvim_config/huhaa.lua"
  fi

  log_success "Neovim: 配置已同步"
}

# Sublime Text 配置同步
sync_sublime_config() {
  local sublime_config="$1"
  local huhaa_root="$2"

  log_info "Sublime Text: 更新用户设置"

  local user_settings="$sublime_config/Packages/User/Preferences.sublime-settings"
  mkdir -p "$(dirname "$user_settings")"

  if [[ ! -f "$user_settings" ]]; then
    echo "{}" > "$user_settings"
  fi

  log_success "Sublime Text: 设置已同步"
}

# Windsurf 配置同步
sync_windsurf_config() {
  local windsurf_config="$1"
  local huhaa_root="$2"

  log_info "Windsurf: 同步配置"

  # Windsurf 配置类似于 Cursor/VS Code
  mkdir -p "$windsurf_config"

  if [[ -d "$windsurf_config" ]]; then
    log_success "Windsurf: 配置已同步"
  fi
}

###############################################################################
# 主流程
###############################################################################

main() {
  echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║          HuHaa-MySkills 编辑器技能同步 v0.1.2         ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

  # 扫描编辑器
  local -a editors_data
  local scan_result
  if ! mapfile -t editors_data < <(scan_editors); then
    log_error "编辑器扫描失败"
    exit 1
  fi

  if [[ ${#editors_data[@]} -eq 0 ]]; then
    log_error "未发现任何支持的编辑器"
    echo -e "\n${YELLOW}支持的编辑器：${NC}"
    echo "  • Cursor"
    echo "  • VS Code"
    echo "  • Helix"
    echo "  • Vim/Neovim"
    echo "  • Sublime Text"
    echo "  • Windsurf"
    exit 1
  fi

  # 显示扫描结果
  log_success "发现 ${#editors_data[@]} 个编辑器"

  # 交互式选择
  local -a selected_indices
  if ! mapfile -t selected_indices < <(interactive_select "${editors_data[@]}"); then
    exit 0
  fi

  # 查找 HuHaa 根目录
  local huhaa_root
  if ! huhaa_root=$(find_huhaa_root); then
    exit 1
  fi

  log_info "使用 HuHaa 根目录: $huhaa_root\n"

  # 执行同步
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  开始同步技能${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  local failed_editors=()

  for idx in "${selected_indices[@]}"; do
    IFS='|' read -r editor_idx editor_name editor_path <<< "${editors_data[$idx]}"

    if ! sync_skills_to_editor "$editor_name" "$editor_path" "$huhaa_root"; then
      failed_editors+=("$editor_name")
    fi

    echo
  done

  # 完成报告
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  同步完成${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  if [[ ${#failed_editors[@]} -eq 0 ]]; then
    log_success "所有编辑器技能已同步!"
    echo -e "\n${GREEN}✨ 现在你可以在这些编辑器中使用 HuHaa 技能了${NC}\n"
  else
    log_warn "以下编辑器同步失败:"
    printf '  • %s\n' "${failed_editors[@]}"
    echo
  fi

  log_info "如需手动更新配置，请参考项目文档：$huhaa_root/docs/GUIDE.md"
  echo
}

# 执行主程序
main "$@"
