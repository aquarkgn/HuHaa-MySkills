import type { SkillItem } from '@/types'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandRelatedItem } from './types'
import { extractMarkdownSection, parseSkillFrontmatter } from './skillDocParser'

const HERMES_PATH_SEGMENT = '/.hermes/skills/'

function normalizePath(value: string): string {
  return value.replace(/\\/g, '/')
}

function isConcreteHermesSkill(item: SkillItem): boolean {
  if (item.kind !== 'skill') return false
  if (item.editorBrand !== 'hermes') return false
  const abs = item.paths?.abs ? normalizePath(item.paths.abs) : ''
  if (!abs.includes(HERMES_PATH_SEGMENT)) return false
  if (!abs.endsWith('/SKILL.md') && !abs.endsWith('/skill.md')) return false
  // 只收集 ~/.hermes/skills/<skill-name>/SKILL.md，排除根 SKILL.md 与更深层文档。
  const relative = abs.slice(abs.indexOf(HERMES_PATH_SEGMENT) + HERMES_PATH_SEGMENT.length)
  const parts = relative.split('/').filter(Boolean)
  return parts.length === 2 && parts[1].toLowerCase() === 'skill.md'
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

export function skillToHermesRelatedItem(item: SkillItem): CliSubcommandRelatedItem {
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

export function buildHermesSkillsEnrichment(skills: SkillItem[]): CliSubcommandEnrichment {
  const seen = new Set<string>()
  const items = skills
    .filter(isConcreteHermesSkill)
    .map(skillToHermesRelatedItem)
    .filter((item) => {
      const key = item.name.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => a.displayName.localeCompare(b.displayName))

  return {
    brand: 'hermes',
    subcommand: 'skills',
    title_zh: 'Hermes 技能列表',
    title_raw: 'Hermes skills available',
    kind: 'skill-list',
    items,
  }
}

export async function loadHermesSkillsEnrichment(context: CliEnrichmentContext): Promise<CliSubcommandEnrichment> {
  const skills = await context.fetchSkills()
  return buildHermesSkillsEnrichment(skills)
}

export const hermesSkillsProvider = Object.freeze({
  brand: 'hermes',
  subcommand: 'skills',
  load: loadHermesSkillsEnrichment,
})