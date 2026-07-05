import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildGstackListEnrichment, skillToGstackRelatedItem } from './gstackList'

function skill(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'skill',
    source: 'claude-code',
    name: 'qa',
    description: 'Systematically QA test a web application.',
    paths: {
      abs: '/Users/mac/.claude/skills/gstack/qa/SKILL.md',
      rootKind: 'home',
    },
    ...overrides,
  }
}

describe('gstackList enrichment', () => {
  it('从扫描结果中过滤具体 gstack skills，排除根 SKILL.md 与其他来源', () => {
    const enrichment = buildGstackListEnrichment([
      skill({ id: 'qa', name: 'qa' }),
      skill({ id: 'root', name: 'gstack', paths: { abs: '/Users/mac/.claude/skills/gstack/SKILL.md', rootKind: 'home' } }),
      skill({ id: 'claude', name: 'agents', paths: { abs: '/Users/mac/.claude/skills/agents/SKILL.md', rootKind: 'home' } }),
      skill({ id: 'doc', kind: 'doc', name: 'doc', paths: { abs: '/Users/mac/.claude/skills/gstack/docs/SKILL.md', rootKind: 'home' } }),
    ])

    expect(enrichment.brand).toBe('gstack')
    expect(enrichment.subcommand).toBe('list')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/qa'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildGstackListEnrichment([
      skill({ id: 'ship', name: 'ship', paths: { abs: '/Users/mac/.claude/skills/gstack/ship/SKILL.md', rootKind: 'home' } }),
      skill({ id: 'qa-1', name: 'qa' }),
      skill({ id: 'qa-2', name: 'qa', paths: { abs: '/Users/mac/.claude/skills/gstack/qa-copy/SKILL.md', rootKind: 'home' } }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/qa', '/ship'])
  })

  it('生成中文摘要、原文摘要、触发词和 allowed-tools', () => {
    const raw = `---
name: plan-ceo-review
allowed-tools: [Read, Bash]
triggers:
  - think bigger
---

## When to invoke this skill
Rethink the problem.
`
    const item = skillToGstackRelatedItem(skill({
      id: 'ceo',
      name: 'plan-ceo-review',
      description: 'CEO/founder-mode plan review.',
      i18n: { zh: { description: 'CEO/创始人视角的计划审查。' } },
      raw,
      paths: { abs: '/Users/mac/.claude/skills/gstack/plan-ceo-review/SKILL.md', rootKind: 'home' },
    }))

    expect(item.displayName).toBe('/plan-ceo-review')
    expect(item.summary_zh).toBe('CEO/创始人视角的计划审查。')
    expect(item.summary_raw).toBe('CEO/founder-mode plan review.')
    expect(item.triggers).toEqual(['think bigger'])
    expect(item.allowedTools).toEqual(['Read', 'Bash'])
    expect(item.whenToUse_raw).toBe('Rethink the problem.')
  })
})
