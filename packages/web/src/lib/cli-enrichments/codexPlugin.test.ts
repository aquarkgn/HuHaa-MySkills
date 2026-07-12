import { describe, expect, it } from 'vitest'
import type { SkillItem } from '@/types'
import { buildCodexPluginEnrichment, skillToCodexPluginRelatedItem } from './codexPlugin'

function plugin(overrides: Partial<SkillItem>): SkillItem {
  return {
    id: 'id-default',
    kind: 'plugin',
    source: 'codex-plugin',
    editorBrand: 'codex',
    name: 'sites',
    description: 'Manage Codex sites.',
    paths: {
      abs: '/Users/mac/.codex/plugins/cache/sites',
      rootKind: 'home',
    },
    tags: ['productivity'],
    ...overrides,
  }
}

describe('codexPlugin enrichment', () => {
  it('从扫描结果中过滤 Codex 插件，排除其他品牌', () => {
    const enrichment = buildCodexPluginEnrichment([
      plugin({ id: 'sites', name: 'sites' }),
      plugin({ id: 'hermes-plugin', name: 'plan', editorBrand: 'hermes' }),
    ])

    expect(enrichment.brand).toBe('codex')
    expect(enrichment.subcommand).toBe('plugin')
    expect(enrichment.title_zh).toBe('Codex 插件列表')
    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/sites'])
  })

  it('同名条目去重并按展示名排序', () => {
    const enrichment = buildCodexPluginEnrichment([
      plugin({ id: 'a', name: 'alpha' }),
      plugin({ id: 'b', name: 'beta', paths: { abs: '/Users/mac/.codex/plugins/cache/beta', rootKind: 'home' } }),
    ])

    expect(enrichment.items.map((item) => item.displayName)).toEqual(['/alpha', '/beta'])
  })

  it('保留 description、tags 和源路径', () => {
    const item = skillToCodexPluginRelatedItem(plugin({
      id: 'sites',
      name: 'sites',
      description: 'Manage Codex sites.',
      i18n: { zh: { description: '管理 Codex 站点。' } },
      tags: ['productivity'],
    }))

    expect(item.displayName).toBe('/sites')
    expect(item.summary_zh).toBe('管理 Codex 站点。')
    expect(item.summary_raw).toBe('Manage Codex sites.')
    expect(item.tags).toEqual(['productivity'])
    expect(item.sourcePath).toBe('/Users/mac/.codex/plugins/cache/sites')
  })

  it('解析失败的插件标记为 failed', () => {
    const item = skillToCodexPluginRelatedItem(plugin({
      id: 'broken',
      name: 'broken',
      parseError: 'invalid plugin.json',
    }))

    expect(item.status).toBe('failed')
  })
})