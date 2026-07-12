import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildClaudeMcpEnrichment, skillToClaudeMcpRelatedItem } from './claudeMcp'

function mcp(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'mcp',
    source: 'mcp-config',
    editorBrand: 'claude',
    name: 'github',
    description: 'MCP server · command: github-cli',
    paths: {
      abs: '/Users/mac/.claude/mcp.json',
      rootKind: 'home',
    },
    ...overrides,
  }
}

describe('claudeMcp enrichment', () => {
  it('从扫描结果中过滤 Claude MCP，排除其他品牌', () => {
    const enrichment = buildClaudeMcpEnrichment([
      mcp({ id: 'gh', name: 'github' }),
      mcp({ id: 'cd', name: 'codex-server', editorBrand: 'codex' }),
    ])

    expect(enrichment.brand).toBe('claude')
    expect(enrichment.subcommand).toBe('mcp')
    expect(enrichment.title_zh).toBe('Claude MCP 服务器')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/github'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildClaudeMcpEnrichment([
      mcp({ id: 'a', name: 'alpha' }),
      mcp({ id: 'b', name: 'beta' }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/alpha', '/beta'])
  })

  it('保留 description、tags 和源路径', () => {
    const item = skillToClaudeMcpRelatedItem(mcp({
      id: 'gh',
      name: 'github',
      description: 'MCP server · command: github-cli',
      tags: ['vcs', 'github'],
    }))

    expect(item.displayName).toBe('/github')
    expect(item.summary_raw).toBe('MCP server · command: github-cli')
    expect(item.tags).toEqual(['vcs', 'github'])
    expect(item.sourcePath).toBe('/Users/mac/.claude/mcp.json')
  })
})