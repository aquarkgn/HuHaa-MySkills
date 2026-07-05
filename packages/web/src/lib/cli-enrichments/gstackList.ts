import type { SkillItem } from '@/types'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandRelatedItem } from './types'
import { extractMarkdownSection, parseSkillFrontmatter } from './skillDocParser'

const GSTACK_PATH_SEGMENT = '/.claude/skills/gstack/'

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

function isConcreteGstackSkill(item: SkillItem): boolean {
  if (item.kind !== 'skill') return false
  const abs = item.paths?.abs ? normalizePath(item.paths.abs) : ''
  if (!abs.includes(GSTACK_PATH_SEGMENT)) return false
  if (!abs.endsWith('/SKILL.md') && !abs.endsWith('/skill.md')) return false
  const relative = abs.slice(abs.indexOf(GSTACK_PATH_SEGMENT) + GSTACK_PATH_SEGMENT.length)
  const parts = relative.split('/').filter(Boolean)
  // 只收集 ~/.claude/skills/gstack/<skill-name>/SKILL.md，排除根 SKILL.md 和更深层内部文档。
  return parts.length === 2 && parts[1].toLowerCase() === 'skill.md' && parts[0] !== 'gstack'
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

export function skillToGstackRelatedItem(item: SkillItem): CliSubcommandRelatedItem {
  const parsed = parseSkillFrontmatter(item.raw)
  const whenToUse = extractMarkdownSection(item.raw, 'When to invoke this skill')
  const name = item.name || item.dirName || 'unknown'
  const summaryRaw = item.description || item.preview || undefined
  const summaryZh = item.i18n?.zh?.description || undefined

  return {
    id: item.id,
    name,
    displayName: name.startsWith('/') ? name : `/${name}`,
    summary_zh: summaryZh,
    summary_raw: summaryRaw,
    whenToUse_raw: whenToUse,
    triggers: uniqueValues([...(item.triggers ?? []), ...(parsed.triggers ?? [])]),
    allowedTools: parsed.allowedTools,
    benefitsFrom: parsed.benefitsFrom,
    tags: uniqueValues(item.tags ?? []),
    sourcePath: item.paths?.abs,
    detailId: item.id,
    raw: item.raw,
    status: item.parseError ? 'failed' : 'ready',
  }
}

export function buildGstackListEnrichment(skills: SkillItem[]): CliSubcommandEnrichment {
  const seen = new Set<string>()
  const items = skills
    .filter(isConcreteGstackSkill)
    .map(skillToGstackRelatedItem)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    brand: 'gstack',
    subcommand: 'list',
    title_zh: 'gstack 工具列表',
    title_raw: 'gstack skills available',
    kind: 'skill-list',
    items,
  }
}

export async function loadGstackListEnrichment(context: CliEnrichmentContext): Promise<CliSubcommandEnrichment> {
  const skills = await context.fetchSkills()
  return buildGstackListEnrichment(skills)
}

export const gstackListProvider = Object.freeze({
  brand: 'gstack',
  subcommand: 'list',
  load: loadGstackListEnrichment,
})
