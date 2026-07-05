import { fetchSkillDetail, fetchSkills } from '@/lib/api'
import { gstackListProvider } from './gstackList'
import type { CliEnrichmentContext, CliSubcommandEnrichment, CliSubcommandEnrichmentProvider } from './types'

const DEFAULT_CONTEXT: CliEnrichmentContext = {
  fetchSkills,
  fetchSkillDetail,
}

const PROVIDERS: readonly CliSubcommandEnrichmentProvider[] = Object.freeze([
  gstackListProvider,
])

function normalizeBrand(brand: string): string {
  return brand === 'gstach' ? 'gstack' : brand
}

export function getSubcommandEnrichmentProvider(
  brand: string,
  subcommand: string,
): CliSubcommandEnrichmentProvider | undefined {
  const normalizedBrand = normalizeBrand(brand)
  return PROVIDERS.find((provider) => provider.brand === normalizedBrand && provider.subcommand === subcommand)
}

export function hasSubcommandEnrichment(brand: string, subcommand: string): boolean {
  return getSubcommandEnrichmentProvider(brand, subcommand) !== undefined
}

export async function loadSubcommandEnrichment(
  brand: string,
  subcommand: string,
  context: CliEnrichmentContext = DEFAULT_CONTEXT,
): Promise<CliSubcommandEnrichment | undefined> {
  const provider = getSubcommandEnrichmentProvider(brand, subcommand)
  if (!provider) return undefined
  return provider.load(context)
}

export type {
  CliEnrichmentContext,
  CliSubcommandEnrichment,
  CliSubcommandEnrichmentKind,
  CliSubcommandRelatedItem,
} from './types'
