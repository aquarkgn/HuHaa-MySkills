import type { SkillItem } from '@/types'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandRelatedItem } from './types'

function isClaudePlugin(item: SkillItem): boolean {
  return item.kind === 'plugin' && item.source === 'claude-plugin'
}

function uniqueValues(values: Array<string | undefined>): string[] | undefined {
  const seen = new Set<string>()
  const result: string[] = []
  for (const value of values) {
    const normalized = value?.trim()
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    result.push(normalized)
  }
  return result.length > 0 ? result : undefined
}

export function skillToClaudePluginRelatedItem(item: SkillItem): CliSubcommandRelatedItem {
  const name = item.name || item.dirName || 'unknown'
  return {
    id: item.id,
    name,
    displayName: name.startsWith('/') ? name : `/${name}`,
    summary_zh: item.i18n?.zh?.description || undefined,
    summary_raw: item.description || item.preview || undefined,
    tags: uniqueValues(item.tags ?? []),
    sourcePath: item.paths?.abs,
    detailId: item.id,
    raw: item.raw,
    status: item.parseError ? 'failed' : 'ready',
  }
}

export function buildClaudePluginEnrichment(skills: SkillItem[]): CliSubcommandEnrichment {
  const seen = new Set<string>()
  const items = skills
    .filter(isClaudePlugin)
    .map(skillToClaudePluginRelatedItem)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    brand: 'claude',
    subcommand: 'plugin',
    title_zh: 'Claude 插件列表',
    title_raw: 'Claude plugins available',
    kind: 'plugin-list',
    items,
  }
}

export async function loadClaudePluginEnrichment(context: CliEnrichmentContext): Promise<CliSubcommandEnrichment> {
  const skills = await context.fetchSkills()
  return buildClaudePluginEnrichment(skills)
}

export const claudePluginProvider = Object.freeze({
  brand: 'claude',
  subcommand: 'plugin',
  load: loadClaudePluginEnrichment,
})