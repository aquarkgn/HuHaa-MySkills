import type { SkillItem } from '@/types'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandRelatedItem } from './types'

function isCodexPlugin(item: SkillItem): boolean {
  return item.kind === 'plugin' && item.editorBrand === 'codex'
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

function summaryZh(item: SkillItem): string | undefined {
  return item.i18n?.zh?.description || undefined
}

export function skillToCodexPluginRelatedItem(item: SkillItem): CliSubcommandRelatedItem {
  const name = item.name || item.dirName || 'unknown'
  return {
    id: item.id,
    name,
    displayName: name.startsWith('/') ? name : `/${name}`,
    summary_zh: summaryZh(item),
    summary_raw: item.description || item.preview || undefined,
    tags: uniqueValues(item.tags ?? []),
    sourcePath: item.paths?.abs,
    detailId: item.id,
    raw: item.raw,
    status: item.parseError ? 'failed' : 'ready',
  }
}

export function buildCodexPluginEnrichment(skills: SkillItem[]): CliSubcommandEnrichment {
  const seen = new Set<string>()
  const items = skills
    .filter(isCodexPlugin)
    .map(skillToCodexPluginRelatedItem)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    brand: 'codex',
    subcommand: 'plugin',
    title_zh: 'Codex 插件列表',
    title_raw: 'Codex plugins available',
    kind: 'plugin-list',
    items,
  }
}

export async function loadCodexPluginEnrichment(context: CliEnrichmentContext): Promise<CliSubcommandEnrichment> {
  const skills = await context.fetchSkills()
  return buildCodexPluginEnrichment(skills)
}

export const codexPluginProvider = Object.freeze({
  brand: 'codex',
  subcommand: 'plugin',
  load: loadCodexPluginEnrichment,
})