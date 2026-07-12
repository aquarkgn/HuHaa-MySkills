import type { SkillItem } from '@/types'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandRelatedItem } from './types'

function isCodexMcp(item: SkillItem): boolean {
  return item.kind === 'mcp' && item.editorBrand === 'codex'
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

export function skillToCodexMcpRelatedItem(item: SkillItem): CliSubcommandRelatedItem {
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

export function buildCodexMcpEnrichment(skills: SkillItem[]): CliSubcommandEnrichment {
  const seen = new Set<string>()
  const items = skills
    .filter(isCodexMcp)
    .map(skillToCodexMcpRelatedItem)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    brand: 'codex',
    subcommand: 'mcp',
    title_zh: 'Codex MCP 服务器',
    title_raw: 'Codex MCP servers available',
    kind: 'mcp-list',
    items,
  }
}

export async function loadCodexMcpEnrichment(context: CliEnrichmentContext): Promise<CliSubcommandEnrichment> {
  const skills = await context.fetchSkills()
  return buildCodexMcpEnrichment(skills)
}

export const codexMcpProvider = Object.freeze({
  brand: 'codex',
  subcommand: 'mcp',
  load: loadCodexMcpEnrichment,
})