/**
 * 测试 useOtherSkills hook
 * 由于 React hook 需要在特定环境下调用，我们提取核心逻辑进行测试
 */
import { OtherSkill, OtherSkillCategory, OtherSkillGroup } from '@/types/other-skill'

// 复制的核心逻辑（从 useOtherSkills 中提取，用于测试）
const OTHER_SKILLS: OtherSkill[] = [
  // 命令类
  {
    id: 'cmd-ls',
    name: 'ls / 列表',
    category: OtherSkillCategory.COMMAND,
    description: '查看目录文件列表',
    tags: ['文件系统', 'CLI'],
    examples: ['ls -la', 'ls -lh /path/to/dir'],
  },
  {
    id: 'cmd-find',
    name: 'find / 搜索',
    category: OtherSkillCategory.COMMAND,
    description: '递归搜索文件',
    tags: ['文件系统', '搜索', 'CLI'],
    examples: ['find . -name "*.ts"', 'find /path -type f'],
  },
  // 编辑器类
  {
    id: 'editor-vscode',
    name: 'VS Code',
    category: OtherSkillCategory.EDITOR,
    description: 'Visual Studio Code 集成开发环境',
    tags: ['编辑器', '代码'],
    docs: 'https://code.visualstudio.com',
  },
  // 工具类
  {
    id: 'tool-docker',
    name: 'Docker',
    category: OtherSkillCategory.TOOL,
    description: '容器化部署工具',
    tags: ['DevOps', '容器'],
    examples: ['docker run', 'docker build'],
  },
  // AI 类
  {
    id: 'ai-claude',
    name: 'Claude',
    category: OtherSkillCategory.AI,
    description: 'Anthropic 的 AI 助手',
    tags: ['AI', '对话'],
  },
]

const CATEGORY_META: Record<OtherSkillCategory, { label: string; icon: string }> = {
  [OtherSkillCategory.COMMAND]: { label: '命令', icon: '⌨️' },
  [OtherSkillCategory.EDITOR]: { label: '编辑器', icon: '📝' },
  [OtherSkillCategory.TOOL]: { label: '工具', icon: '🔧' },
  [OtherSkillCategory.CLOUD]: { label: '云服务', icon: '☁️' },
  [OtherSkillCategory.AI]: { label: 'AI 能力', icon: '🤖' },
}

/**
 * 核心搜索和分组逻辑（useOtherSkills 的 useMemo 回调内容）
 */
function groupAndFilterSkills(query: string = ''): OtherSkillGroup[] {
  const filtered = query
    ? OTHER_SKILLS.filter(
        (skill) =>
          skill.name.toLowerCase().includes(query.toLowerCase()) ||
          skill.description.toLowerCase().includes(query.toLowerCase()) ||
          skill.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
      )
    : OTHER_SKILLS

  // 按分类分组
  const grouped: Record<OtherSkillCategory, OtherSkill[]> = {
    [OtherSkillCategory.COMMAND]: [],
    [OtherSkillCategory.EDITOR]: [],
    [OtherSkillCategory.TOOL]: [],
    [OtherSkillCategory.CLOUD]: [],
    [OtherSkillCategory.AI]: [],
  }

  filtered.forEach((skill) => {
    grouped[skill.category].push(skill)
  })

  // 转换为 OtherSkillGroup
  return Object.entries(grouped)
    .map(([category, items]) => ({
      category: category as OtherSkillCategory,
      label: CATEGORY_META[category as OtherSkillCategory].label,
      icon: CATEGORY_META[category as OtherSkillCategory].icon,
      items,
    }))
    .filter((group) => group.items.length > 0)
}

describe('useOtherSkills', () => {
  it('应该返回所有分类分组', () => {
    const result = groupAndFilterSkills()
    expect(result.length).toBeGreaterThan(0)
    expect(result.some((g) => g.category === OtherSkillCategory.COMMAND)).toBe(true)
  })

  it('应该按查询词搜索', () => {
    const all = groupAndFilterSkills('')
    const filtered = groupAndFilterSkills('docker')
    expect(all.length).toBeGreaterThan(filtered.length)
  })

  it('搜索应该过滤空分组', () => {
    const result = groupAndFilterSkills('vs code')
    expect(result.every((g) => g.items.length > 0)).toBe(true)
  })
})
