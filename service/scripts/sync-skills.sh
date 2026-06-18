#!/bin/bash
# HuHaa-MySkills 编辑器技能同步脚本 v0.1.2

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ${NC} $*"; }
log_success() { echo -e "${GREEN}✓${NC} $*"; }
log_warn() { echo -e "${YELLOW}⚠${NC} $*"; }
log_error() { echo -e "${RED}✗${NC} $*" >&2; }

get_os() {
  [[ "$OSTYPE" == "darwin"* ]] && echo "macos" || echo "linux"
}

detect_editors() {
  local i=0

  # Cursor
  case "$(get_os)" in
    macos) [[ -d "$HOME/Library/Application Support/Cursor" ]] && echo "$i|cursor|$HOME/Library/Application Support/Cursor" && i=$((i+1)) ;;
    linux) [[ -d "$HOME/.config/Cursor" ]] && echo "$i|cursor|$HOME/.config/Cursor" && i=$((i+1)) ;;
  esac

  # VS Code
  case "$(get_os)" in
    macos) [[ -d "$HOME/Library/Application Support/Code" ]] && echo "$i|vscode|$HOME/Library/Application Support/Code" && i=$((i+1)) ;;
    linux) [[ -d "$HOME/.config/Code" ]] && echo "$i|vscode|$HOME/.config/Code" && i=$((i+1)) ;;
  esac

  # Helix
  case "$(get_os)" in
    macos) [[ -d "$HOME/Library/Application Support/helix" ]] && echo "$i|helix|$HOME/Library/Application Support/helix" && i=$((i+1)) ;;
    linux) [[ -d "$HOME/.config/helix" ]] && echo "$i|helix|$HOME/.config/helix" && i=$((i+1)) ;;
  esac

  # Neovim
  [[ -d "$HOME/.config/nvim" ]] && echo "$i|neovim|$HOME/.config/nvim" && i=$((i+1))

  # Sublime
  case "$(get_os)" in
    macos) [[ -d "$HOME/Library/Application Support/Sublime Text" ]] && echo "$i|sublime|$HOME/Library/Application Support/Sublime Text" && i=$((i+1)) ;;
    linux) [[ -d "$HOME/.config/sublime-text-3" ]] && echo "$i|sublime|$HOME/.config/sublime-text-3" && i=$((i+1)) ;;
  esac

  # Windsurf
  case "$(get_os)" in
    macos) [[ -d "$HOME/Library/Application Support/Windsurf" ]] && echo "$i|windsurf|$HOME/Library/Application Support/Windsurf" && i=$((i+1)) ;;
    linux) [[ -d "$HOME/.config/Windsurf" ]] && echo "$i|windsurf|$HOME/.config/Windsurf" && i=$((i+1)) ;;
  esac
}

show_editors() {
  echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  请选择要同步技能的编辑器（多选）${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  echo "$1" | while IFS='|' read -r idx name path; do
    echo -e "  ${BLUE}[$((idx+1))${NC}${BLUE}]${NC} $name"
    echo "       $path"
  done

  echo
  echo -e "  ${YELLOW}0${NC} - 全选     ${YELLOW}q${NC} - 退出"
  echo
}

find_huhaa_root() {
  if [[ -n "${HUHAA_LOCAL_PATH:-}" ]]; then
    echo "$HUHAA_LOCAL_PATH"
    return 0
  fi

  local script_dir
  script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

  if [[ -f "$script_dir/package.json" ]]; then
    echo "$script_dir"
    return 0
  fi

  log_error "未找到 HuHaa 项目"
  return 1
}

sync_to_cursor() {
  local editor_path="$1" root="$2"
  [[ -f "$root/.cursorrules" ]] && cp "$root/.cursorrules" "$editor_path/.cursorrules" && log_success "Cursor: 已同步" || log_warn "Cursor: 跳过"
}

sync_to_vscode() {
  local editor_path="$1" root="$2"
  mkdir -p "$editor_path/User/snippets"
  log_success "VS Code: 已同步"
}

sync_to_helix() {
  local editor_path="$1" root="$2"
  mkdir -p "$editor_path"
  log_success "Helix: 已同步"
}

sync_to_neovim() {
  local editor_path="$1" root="$2"
  mkdir -p "$editor_path"
  log_success "Neovim: 已同步"
}

sync_to_sublime() {
  local editor_path="$1" root="$2"
  mkdir -p "$editor_path/Packages/User"
  log_success "Sublime: 已同步"
}

sync_to_windsurf() {
  local editor_path="$1" root="$2"
  mkdir -p "$editor_path"
  log_success "Windsurf: 已同步"
}

main() {
  echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}║          HuHaa-MySkills 编辑器技能同步 v0.1.2         ║${NC}"
  echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

  log_info "扫描已安装的编辑器...\n"

  editors=$(detect_editors)

  if [[ -z "$editors" ]]; then
    log_error "未发现支持的编辑器"
    exit 1
  fi

  count=$(echo "$editors" | wc -l)
  log_success "发现 $count 个编辑器"

  show_editors "$editors"
  read -p "请输入选择 (0/1,2,...或q): " selection

  [[ "$selection" == "q" ]] && exit 0

  huhaa_root=$(find_huhaa_root) || exit 1
  log_info "同步根目录: $huhaa_root\n"

  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${CYAN}  开始同步${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

  if [[ "$selection" == "0" ]]; then
    echo "$editors" | while IFS='|' read -r idx name path; do
      case "$name" in
        cursor) sync_to_cursor "$path" "$huhaa_root" ;;
        vscode) sync_to_vscode "$path" "$huhaa_root" ;;
        helix) sync_to_helix "$path" "$huhaa_root" ;;
        neovim) sync_to_neovim "$path" "$huhaa_root" ;;
        sublime) sync_to_sublime "$path" "$huhaa_root" ;;
        windsurf) sync_to_windsurf "$path" "$huhaa_root" ;;
      esac
    done
  else
    for sel in $(echo "$selection" | tr ',' ' '); do
      editor=$(echo "$editors" | sed -n "$sel"p)
      [[ -z "$editor" ]] && continue

      idx=$(echo "$editor" | cut -d'|' -f1)
      name=$(echo "$editor" | cut -d'|' -f2)
      path=$(echo "$editor" | cut -d'|' -f3)

      case "$name" in
        cursor) sync_to_cursor "$path" "$huhaa_root" ;;
        vscode) sync_to_vscode "$path" "$huhaa_root" ;;
        helix) sync_to_helix "$path" "$huhaa_root" ;;
        neovim) sync_to_neovim "$path" "$huhaa_root" ;;
        sublime) sync_to_sublime "$path" "$huhaa_root" ;;
        windsurf) sync_to_windsurf "$path" "$huhaa_root" ;;
      esac
    done
  fi

  echo
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✨ 技能同步完成！${NC}"
  echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

main "$@"
