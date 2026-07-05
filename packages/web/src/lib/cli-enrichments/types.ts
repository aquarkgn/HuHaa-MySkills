import type { SkillItem } from '@/types'

export type CliSubcommandEnrichmentKind =
  | 'skill-list'
  | 'plugin-list'
  | 'mcp-list'
  | 'agent-list'
  | 'doc-list'
  | 'generic-list'

export type CliSubcommandRelatedItemStatus = 'ready' | 'missing' | 'failed'

export interface CliSubcommandRelatedItem {
  id: string
  name: string
  displayName: string
  summary_zh?: string
  summary_raw?: string
  usage_zh?: string
  usage_raw?: string
  whenToUse_zh?: string
  whenToUse_raw?: string
  triggers?: string[]
  allowedTools?: string[]
  benefitsFrom?: string[]
  tags?: string[]
  sourcePath?: string
  detailId?: string
  raw?: string
  status: CliSubcommandRelatedItemStatus
}

export interface CliSubcommandEnrichment {
  brand: string
  subcommand: string
  title_zh: string
  title_raw?: string
  kind: CliSubcommandEnrichmentKind
  items: CliSubcommandRelatedItem[]
  capturedAt?: string
}

export interface CliEnrichmentContext {
  fetchSkills: () => Promise<SkillItem[]>
  fetchSkillDetail: (id: string) => Promise<SkillItem>
}

export interface CliSubcommandEnrichmentProvider {
  readonly brand: string
  readonly subcommand: string
  load: (context: CliEnrichmentContext) => Promise<CliSubcommandEnrichment>
}
