import { describe, expect, it } from 'vitest'
import { extractMarkdownSection, parseSkillFrontmatter } from './skillDocParser'

describe('skillDocParser', () => {
  it('解析 SKILL.md frontmatter 的列表字段', () => {
    const raw = `---
name: plan-ceo-review
allowed-tools:
  - Read
  - Bash
triggers:
  - think bigger
  - expand scope
benefits-from: [office-hours, spec]
---

## When to invoke this skill
Use it.
`

    expect(parseSkillFrontmatter(raw)).toEqual({
      allowedTools: ['Read', 'Bash'],
      triggers: ['think bigger', 'expand scope'],
      benefitsFrom: ['office-hours', 'spec'],
    })
  })

  it('提取指定 Markdown 标题下的正文，遇到同级标题停止', () => {
    const raw = `# Title

## When to invoke this skill
Line A
Line B

## Preamble
Skip me
`

    expect(extractMarkdownSection(raw, 'When to invoke this skill')).toBe('Line A\nLine B')
  })

  it('raw 缺失或标题不存在时安全返回 undefined', () => {
    expect(parseSkillFrontmatter(undefined)).toEqual({})
    expect(extractMarkdownSection(undefined, 'When to invoke this skill')).toBeUndefined()
    expect(extractMarkdownSection('## Other\nbody', 'When to invoke this skill')).toBeUndefined()
  })
})
