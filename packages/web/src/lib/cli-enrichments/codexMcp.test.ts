import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildCodexMcpEnrichment, skillToCodexMcpRelatedItem } from './codexMcp'

function mcp(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'mcp',
    source: 'mcp-config',
    editorBrand: 'codex',
    name: 'github',
    description: 'MCP server · command: github-cli',
    paths: {
      abs: '/Users/mac/.codex/config.toml',
      rootKind: 'home',
    },
    ...overrides,
  }
}

describe('codexMcp enrichment', () => {
  it('从扫描结果中过滤 Codex MCP，排除其他品牌', () => {
    const enrichment = buildCodexMcpEnrichment([
      mcp({ id: 'gh', name: 'github' }),
      mcp({ id: 'claude-mcp', name: 'claude-server', editorBrand: 'claude' }),
    ])

    expect(enrichment.brand).toBe('codex')
    expect(enrichment.subcommand).toBe('mcp')
    expect(enrichment.title_zh).toBe('Codex MCP 服务器')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/github'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildCodexMcpEnrichment([
      mcp({ id: 'a', name: 'alpha' }),
      mcp({ id: 'b', name: 'beta' }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/alpha', '/beta'])
  })

  it('保留 description、tags 和源路径', () => {
    const item = skillToCodexMcpRelatedItem(mcp({
      id: 'gh',
      name: 'github',
      description: 'MCP server · command: github-cli',
      tags: ['vcs'],
    }))

    expect(item.displayName).toBe('/github')
    expect(item.summary_raw).toBe('MCP server · command: github-cli')
    expect(item.tags).toEqual(['vcs'])
    expect(item.sourcePath).toBe('/Users/mac/.codex/config.toml')
  })
})