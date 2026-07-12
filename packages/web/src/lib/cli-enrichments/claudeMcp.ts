import type { SkillItem } from '@/types'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandRelatedItem } from './types'

function isClaudeMcp(item: SkillItem): boolean {
  return item.kind === 'mcp' && item.editorBrand === 'claude'
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

export function skillToClaudeMcpRelatedItem(item: SkillItem): CliSubcommandRelatedItem {
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

export function buildClaudeMcpEnrichment(skills: SkillItem[]): CliSubcommandEnrichment {
  const seen = new Set<string>()
  const items = skills
    .filter(isClaudeMcp)
    .map(skillToClaudeMcpRelatedItem)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    brand: 'claude',
    subcommand: 'mcp',
    title_zh: 'Claude MCP 服务器',
    title_raw: 'Claude MCP servers available',
    kind: 'mcp-list',
    items,
  }
}

export async function loadClaudeMcpEnrichment(context: CliEnrichmentContext): Promise<CliSubcommandEnrichment> {
  const skills = await context.fetchSkills()
  return buildClaudeMcpEnrichment(skills)
}

export const claudeMcpProvider = Object.freeze({
  brand: 'claude',
  subcommand: 'mcp',
  load: loadClaudeMcpEnrichment,
})