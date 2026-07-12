import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildHermesSkillsEnrichment, skillToHermesRelatedItem } from './hermesSkills'

function skill(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'skill',
    source: 'hermes',
    editorBrand: 'hermes',
    name: 'release-checklist',
    description: 'Hermes pre-release checklist.',
    paths: {
      abs: '/Users/mac/.hermes/skills/release-checklist/SKILL.md',
      rootKind: 'home',
    },
    ...overrides,
  }
}

describe('hermesSkills enrichment', () => {
  it('从扫描结果中过滤具体 Hermes skills，排除根 SKILL.md 与其他品牌', () => {
    const enrichment = buildHermesSkillsEnrichment([
      skill({ id: 'release', name: 'release-checklist' }),
      skill({ id: 'root', name: 'hermes', paths: { abs: '/Users/mac/.hermes/skills/SKILL.md', rootKind: 'home' } }),
      skill({ id: 'other-brand', name: 'cursor-thing', editorBrand: 'cursor', paths: { abs: '/Users/mac/.cursor/skills/cursor-thing/SKILL.md', rootKind: 'home' } }),
      skill({ id: 'doc', kind: 'doc', name: 'doc', paths: { abs: '/Users/mac/.hermes/skills/docs/SKILL.md', rootKind: 'home' } }),
    ])

    expect(enrichment.brand).toBe('hermes')
    expect(enrichment.subcommand).toBe('skills')
    expect(enrichment.title_zh).toBe('Hermes 技能列表')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/release-checklist'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildHermesSkillsEnrichment([
      skill({ id: 'ship', name: 'ship' }),
      skill({ id: 'rel-1', name: 'release-checklist' }),
      skill({ id: 'rel-2', name: 'release-checklist', paths: { abs: '/Users/mac/.hermes/skills/release-checklist-v2/SKILL.md', rootKind: 'home' } }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/release-checklist', '/ship'])
  })

  it('生成中文摘要、原文摘要、触发词和 allowed-tools', () => {
    const raw = `---
name: release-checklist
allowed-tools: [Read, Bash]
triggers:
  - release prep
  - ship day
benefits-from: [office-hours, spec]
---

## When to invoke this skill
Run before tagging a release.
`
    const item = skillToHermesRelatedItem(skill({
      id: 'release',
      name: 'release-checklist',
      description: 'Hermes pre-release checklist.',
      i18n: { zh: { description: 'Hermes 发布前自检清单。' } },
      raw,
    }))

    expect(item.displayName).toBe('/release-checklist')
    expect(item.summary_zh).toBe('Hermes 发布前自检清单。')
    expect(item.summary_raw).toBe('Hermes pre-release checklist.')
    expect(item.triggers).toEqual(['release prep', 'ship day'])
    expect(item.allowedTools).toEqual(['Read', 'Bash'])
    expect(item.benefitsFrom).toEqual(['office-hours', 'spec'])
    expect(item.whenToUse_raw).toBe('Run before tagging a release.')
  })

  it('raw 缺失时仅靠列表摘要展示，不抛错', () => {
    const item = skillToHermesRelatedItem(skill({
      id: 'no-raw',
      name: 'no-raw',
      raw: undefined,
    }))

    expect(item.displayName).toBe('/no-raw')
    expect(item.summary_raw).toBe('Hermes pre-release checklist.')
    expect(item.triggers).toBeUndefined()
    expect(item.allowedTools).toBeUndefined()
    expect(item.whenToUse_raw).toBeUndefined()
  })
})