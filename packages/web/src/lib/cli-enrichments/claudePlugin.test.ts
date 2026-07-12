import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildClaudePluginEnrichment, skillToClaudePluginRelatedItem } from './claudePlugin'

function plugin(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'plugin',
    source: 'claude-plugin',
    editorBrand: 'claude',
    name: 'enterprise-devops',
    description: 'Enterprise CI/CD automation.',
    paths: {
      abs: '/Users/mac/.claude/plugins/cache/enterprise-devops',
      rootKind: 'home',
    },
    tags: ['devops', 'ci-cd'],
    ...overrides,
  }
}

describe('claudePlugin enrichment', () => {
  it('从扫描结果中过滤 Claude 插件，排除其他 source', () => {
    const enrichment = buildClaudePluginEnrichment([
      plugin({ id: 'ed', name: 'enterprise-devops' }),
      plugin({ id: 'hx', name: 'hermes-plugin', source: 'hermes-plugin' }),
    ])

    expect(enrichment.brand).toBe('claude')
    expect(enrichment.subcommand).toBe('plugin')
    expect(enrichment.title_zh).toBe('Claude 插件列表')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/enterprise-devops'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildClaudePluginEnrichment([
      plugin({ id: 'a', name: 'alpha' }),
      plugin({ id: 'b', name: 'beta' }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/alpha', '/beta'])
  })

  it('保留 description、tags 和源路径', () => {
    const item = skillToClaudePluginRelatedItem(plugin({
      id: 'ed',
      name: 'enterprise-devops',
      description: 'Enterprise CI/CD automation.',
      i18n: { zh: { description: '企业级 CI/CD 自动化。' } },
      tags: ['devops', 'ci-cd'],
    }))

    expect(item.displayName).toBe('/enterprise-devops')
    expect(item.summary_zh).toBe('企业级 CI/CD 自动化。')
    expect(item.summary_raw).toBe('Enterprise CI/CD automation.')
    expect(item.tags).toEqual(['devops', 'ci-cd'])
    expect(item.sourcePath).toBe('/Users/mac/.claude/plugins/cache/enterprise-devops')
  })
})