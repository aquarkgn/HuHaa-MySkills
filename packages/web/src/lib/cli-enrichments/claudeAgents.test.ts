import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildClaudeAgentsEnrichment, skillToClaudeAgentRelatedItem } from './claudeAgents'

function agent(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'skill',
    source: 'claude-agents',
    editorBrand: 'claude',
    name: 'code-reviewer',
    description: 'Reviews code for security issues.',
    paths: {
      abs: '/Users/mac/.claude/agents/code-reviewer.md',
      rootKind: 'home',
    },
    tags: ['agent', 'subagent'],
    ...overrides,
  }
}

describe('claudeAgents enrichment', () => {
  it('从扫描结果中过滤 Claude sub-agent，排除非 claude-agents 来源', () => {
    const enrichment = buildClaudeAgentsEnrichment([
      agent({ id: 'rev', name: 'code-reviewer' }),
      agent({ id: 'doc', name: 'documentation', source: 'hermes' }),
    ])

    expect(enrichment.brand).toBe('claude')
    expect(enrichment.subcommand).toBe('agents')
    expect(enrichment.title_zh).toBe('Claude Sub-agent 列表')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/code-reviewer'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildClaudeAgentsEnrichment([
      agent({ id: 'a', name: 'researcher' }),
      agent({ id: 'b', name: 'reviewer' }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/researcher', '/reviewer'])
  })

  it('保留 description、tags 和源路径', () => {
    const item = skillToClaudeAgentRelatedItem(agent({
      id: 'rev',
      name: 'code-reviewer',
      i18n: { zh: { description: '复盘代码安全。' } },
      tags: ['agent', 'subagent'],
    }))

    expect(item.displayName).toBe('/code-reviewer')
    expect(item.summary_zh).toBe('复盘代码安全。')
    expect(item.summary_raw).toBe('Reviews code for security issues.')
    expect(item.tags).toEqual(['agent', 'subagent'])
    expect(item.sourcePath).toBe('/Users/mac/.claude/agents/code-reviewer.md')
  })
})