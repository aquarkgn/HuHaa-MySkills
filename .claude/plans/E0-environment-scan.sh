#!/usr/bin/env bash
# HuHaa-MySkills v0.3.3 — E0 环境数据收集脚本

set -e

echo "=== E0: 环境扫描和数据清点 ==="
echo ""

# E0-1: 检查系统目录
echo "📁 E0-1: 系统目录检查"
echo "────────────────────"

check_dir() {
  local dir="$1"
  local expanded="${dir/#\~/$HOME}"
  if [ -d "$expanded" ]; then
    local count=$(find "$expanded" -type f | wc -l)
    printf "✅ %-40s %3d 文件\n" "$dir" "$count"
  else
    printf "❌ %-40s (不存在)\n" "$dir"
  fi
}

check_dir "~/.hermes/skills"
check_dir "~/.claude/skills"
check_dir "~/.cursor"
check_dir "~/.cursor/rules"
check_dir "~/.codex"
check_dir "~/.hermes/plugins"
check_dir "~/skills"
check_dir "~/Skills"
check_dir "~/mcp"
check_dir "~/MCP"

echo ""

# E0-2: 完整的 npm run scan
echo "📊 E0-2: 执行完整扫描"
echo "────────────────────"

cd "$(dirname "$0")/../.."

echo "运行: npm run scan (with debug)"
if HUHAA_DEBUG=1 npm run scan > /tmp/scan-full.json 2> /tmp/scan-debug.log; then
  echo "✅ 扫描成功"
else
  echo "❌ 扫描失败，查看日志: /tmp/scan-debug.log"
  exit 1
fi

echo ""

# 解析扫描结果
echo "📈 E0-3: 扫描结果统计"
echo "────────────────────"

python3 << 'PYTHON'
import json
import sys

try:
  with open('/tmp/scan-full.json', 'r') as f:
    data = json.load(f)
except Exception as e:
  print(f"❌ JSON 解析失败: {e}")
  sys.exit(1)

# 总计
total = len(data)
print(f"总技能数: {total}")
print()

# 按 source 分类
by_source = {}
by_editor = {}
by_kind = {}
by_product = {}
by_brand = {}

for item in data:
  source = item.get('source', '(unknown)')
  editor = item.get('editor', '(unknown)')
  kind = item.get('kind', '(unknown)')
  product = item.get('product', '(unknown)')
  brand = item.get('brand', '(unknown)')
  
  by_source[source] = by_source.get(source, 0) + 1
  by_editor[editor] = by_editor.get(editor, 0) + 1
  by_kind[kind] = by_kind.get(kind, 0) + 1
  by_product[product] = by_product.get(product, 0) + 1
  by_brand[brand] = by_brand.get(brand, 0) + 1

print("按 Source 分类:")
for source in sorted(by_source.keys()):
  count = by_source[source]
  status = "✅" if count > 0 else "⚠️"
  print(f"  {status} {source}: {count}")
print()

print("按 Editor 分类:")
for editor in sorted(by_editor.keys()):
  count = by_editor[editor]
  print(f"  • {editor}: {count}")
print()

print("按 Kind 分类:")
for kind in sorted(by_kind.keys()):
  count = by_kind[kind]
  print(f"  • {kind}: {count}")
print()

print("按 Product 分类 (Top 10):")
for product in sorted(by_product.keys(), key=lambda x: by_product[x], reverse=True)[:10]:
  count = by_product[product]
  print(f"  • {product}: {count}")
print()

print("按 Brand 分类:")
for brand in sorted(by_brand.keys()):
  count = by_brand[brand]
  status = "✅" if count > 0 else "❓"
  print(f"  {status} {brand}: {count}")

PYTHON

echo ""

# E0-4: 检查 Hermes 技能的元数据质量
echo "🏷️ E0-4: Hermes 技能元数据质量审计"
echo "──────────────────────────────────"

python3 << 'PYTHON'
import json
import os

# 从扫描结果中找出 Hermes 技能
with open('/tmp/scan-full.json', 'r') as f:
  data = json.load(f)

hermes_skills = [x for x in data if x.get('source') == 'hermes']

if not hermes_skills:
  print("⚠️ 未找到 Hermes 技能")
  exit(0)

print(f"发现 {len(hermes_skills)} 个 Hermes 技能，抽样检查 5 个:")
print()

# 抽样检查
for item in hermes_skills[:5]:
  name = item.get('name', '(unknown)')
  has_brand = 'brand' in item and item.get('brand')
  has_product = 'product' in item and item.get('product')
  has_category = 'category' in item and item.get('category')
  has_description = 'description' in item and item.get('description')
  
  status = "✅" if all([has_brand, has_product, has_category, has_description]) else "⚠️"
  print(f"{status} {name}")
  print(f"   brand: {'✅' if has_brand else '❌'} product: {'✅' if has_product else '❌'} category: {'✅' if has_category else '❌'} description: {'✅' if has_description else '❌'}")

# 统计元数据完整性
brands_filled = sum(1 for x in hermes_skills if x.get('brand'))
products_filled = sum(1 for x in hermes_skills if x.get('product'))
categories_filled = sum(1 for x in hermes_skills if x.get('category'))

print()
print("元数据填充率:")
print(f"  brand: {brands_filled}/{len(hermes_skills)} ({100*brands_filled//len(hermes_skills)}%)")
print(f"  product: {products_filled}/{len(hermes_skills)} ({100*products_filled//len(hermes_skills)}%)")
print(f"  category: {categories_filled}/{len(hermes_skills)} ({100*categories_filled//len(hermes_skills)}%)")

PYTHON

echo ""
echo "=== E0 完成 ==="
echo ""
echo "📄 完整扫描结果已保存到: /tmp/scan-full.json"
echo "📋 调试日志已保存到: /tmp/scan-debug.log"
echo ""
echo "✅ 继续下一步: 阅读 .claude/plans/v0.3.3-refactor-multiSource.md"
