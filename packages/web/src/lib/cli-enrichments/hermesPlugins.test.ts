import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildHermesPluginsEnrichment, skillToHermesPluginRelatedItem } from './hermesPlugins'

function plugin(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'plugin',
    source: 'hermes-plugin',
    editorBrand: 'hermes',
    name: 'plan-ceo',
    description: 'CEO/founder-mode plan review plugin.',
    paths: {
      abs: '/Users/mac/.hermes/plugins/plan-ceo',
      rootKind: 'home',
    },
    tags: ['planning', 'review'],
    ...overrides,
  }
}

describe('hermesPlugins enrichment', () => {
  it('从扫描结果中过滤 Hermes 插件，排除其他品牌', () => {
    const enrichment = buildHermesPluginsEnrichment([
      plugin({ id: 'plan', name: 'plan-ceo' }),
      plugin({ id: 'codex-plugin', name: 'sites', editorBrand: 'codex' }),
    ])

    expect(enrichment.brand).toBe('hermes')
    expect(enrichment.subcommand).toBe('plugins')
    expect(enrichment.title_zh).toBe('Hermes 插件列表')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/plan-ceo'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildHermesPluginsEnrichment([
      plugin({ id: 'p1', name: 'plan-ceo' }),
      plugin({ id: 'p2', name: 'plan-cto', paths: { abs: '/Users/mac/.hermes/plugins/plan-cto', rootKind: 'home' } }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/plan-ceo', '/plan-cto'])
  })

  it('保留 description、tags 和源路径', () => {
    const item = skillToHermesPluginRelatedItem(plugin({
      id: 'plan',
      name: 'plan-ceo',
      description: 'CEO/founder-mode plan review plugin.',
      i18n: { zh: { description: 'CEO/创始人视角的计划审查插件。' } },
      tags: ['planning', 'review'],
    }))

    expect(item.displayName).toBe('/plan-ceo')
    expect(item.summary_zh).toBe('CEO/创始人视角的计划审查插件。')
    expect(item.summary_raw).toBe('CEO/founder-mode plan review plugin.')
    expect(item.tags).toEqual(['planning', 'review'])
    expect(item.sourcePath).toBe('/Users/mac/.hermes/plugins/plan-ceo')
  })

  it('解析失败的插件标记为 failed 但仍保留', () => {
    const item = skillToHermesPluginRelatedItem(plugin({
      id: 'broken',
      name: 'broken',
      parseError: 'invalid yaml',
    }))

    expect(item.status).toBe('failed')
  })
})