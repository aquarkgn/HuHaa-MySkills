/**
 * useSkillIcons — Mapping skill tier/brand to emoji icons and display labels
 *
 * Maps the backend SkillItem.tier and .brand fields to human-readable
 * icons and categorized groups for the Skills Tab UI.
 *
 * Tier System (from Phase 1 Backend):
 *   - Tier 1: Official tools (hermes, claude-code, cursor, codex, hermes-plugin)
 *   - Tier 2: Custom directory skills (directory-skill source, dirName populated)
 *   - Tier 3: Other sources (project-runbook, etc.)
 *
 * Usage:
 *   const { tierIcon, tierLabel, brandIcon, isTier } = useSkillIcons(skill);
 */

import type { SkillItem } from '@/types';

interface IconMapping {
  /** Emoji icon for display */
  icon: string;
  /** Human-readable label */
  label: string;
  /** CSS color class (optional, for future styling) */
  colorClass?: string;
}

interface SkillIconResult {
  /** Tier-based icon (tool/directory/other) */
  tierIcon: string;
  /** Tier-based label */
  tierLabel: string;
  /** Brand-based icon (if Tier 1 tool) */
  brandIcon: string;
  /** Combined display label (e.g., "🤖 Claude Code" or "📁 auth-flow") */
  displayLabel: string;
  /** Type predicate functions */
  isTier1: boolean;
  isTier2: boolean;
  isTier3: boolean;
  /** Sorting key for tier grouping */
  tierSort: number;
}

/**
 * Brand icon map — Tier 1 official tools
 * Icons chosen to visually match brand identity
 */
const BRAND_ICONS: Record<string, IconMapping> = {
  hermes: {
    icon: '⚡',
    label: 'Hermes',
    colorClass: 'text-purple-500',
  },
  claude: {
    icon: '🤖',
    label: 'Claude',
    colorClass: 'text-blue-500',
  },
  cursor: {
    icon: '📝',
    label: 'Cursor',
    colorClass: 'text-amber-500',
  },
  codex: {
    icon: '💡',
    label: 'Codex',
    colorClass: 'text-yellow-500',
  },
};

/**
 * Tier icon map — Category-based icons
 * Drives filtering and grouping in UI
 */
const TIER_ICONS: Record<string, IconMapping> = {
  tool: {
    icon: '🔧',
    label: 'Official Tools',
    colorClass: 'text-blue-600',
  },
  directory: {
    icon: '📁',
    label: 'Custom Skills',
    colorClass: 'text-emerald-600',
  },
  other: {
    icon: '⚙️',
    label: 'Other Sources',
    colorClass: 'text-slate-500',
  },
};

/**
 * Tier sort order — determines grouping in display
 * Lower numbers appear first in lists
 */
const TIER_SORT_ORDER: Record<string, number> = {
  tool: 1,
  directory: 2,
  other: 3,
};

/**
 * useSkillIcons — Extract icon and label for a skill item
 *
 * @param skill - SkillItem from API (contains tier, brand, dirName)
 * @returns Icon mapping + tier predicates for UI rendering
 *
 * @example
 *   const skill = {
 *     id: 'abc123',
 *     name: 'auth-flow',
 *     tier: 'directory',
 *     dirName: 'auth-flow',
 *     ...
 *   }
 *
 *   const { tierIcon, displayLabel, isTier2 } = useSkillIcons(skill);
 *   // Returns:
 *   // tierIcon: '📁'
 *   // displayLabel: '📁 auth-flow'
 *   // isTier2: true
 */
export function useSkillIcons(skill: SkillItem): SkillIconResult {
  const tier = (skill.tier || 'other') as 'tool' | 'directory' | 'other';
  const brand = skill.brand || 'other';
  const dirName = skill.dirName || skill.name;

  // Get tier icon
  const tierMapping = TIER_ICONS[tier] || TIER_ICONS.other;

  // Get brand icon (for Tier 1 only)
  const brandMapping = tier === 'tool' 
    ? BRAND_ICONS[brand] || { icon: '🔧', label: 'Tool' }
    : null;

  // Construct display label
  let displayLabel: string;
  if (tier === 'tool' && brandMapping) {
    // Tier 1: Use brand icon + tool name
    displayLabel = `${brandMapping.icon} ${skill.name}`;
  } else if (tier === 'directory') {
    // Tier 2: Use directory icon + dir name
    displayLabel = `${tierMapping.icon} ${dirName}`;
  } else {
    // Tier 3: Use other icon + name
    displayLabel = `${tierMapping.icon} ${skill.name}`;
  }

  return {
    tierIcon: tierMapping.icon,
    tierLabel: tierMapping.label,
    brandIcon: brandMapping?.icon || tierMapping.icon,
    displayLabel,
    isTier1: tier === 'tool',
    isTier2: tier === 'directory',
    isTier3: tier === 'other',
    tierSort: TIER_SORT_ORDER[tier] || 99,
  };
}

/**
 * getBrandIconForTier1 — Get brand icon map for Tier 1 filter/legend
 *
 * Used in UI to show available brands:
 *   🤖 Claude Code
 *   ⚡ Hermes
 *   📝 Cursor
 *   💡 Codex
 */
export function getBrandIconForTier1(): Array<{
  brand: string;
  icon: string;
  label: string;
}> {
  return Object.entries(BRAND_ICONS).map(([brand, mapping]) => ({
    brand,
    icon: mapping.icon,
    label: mapping.label,
  }));
}

/**
 * getTierIconMap — Get all tier icons for legend
 *
 * Used to show tier grouping:
 *   🔧 Official Tools
 *   📁 Custom Skills
 *   ⚙️ Other Sources
 */
export function getTierIconMap(): Array<{
  tier: string;
  icon: string;
  label: string;
}> {
  return Object.entries(TIER_ICONS).map(([tier, mapping]) => ({
    tier,
    icon: mapping.icon,
    label: mapping.label,
  }));
}

/**
 * sortByTier — Comparator for sorting skills by tier
 *
 * Usage:
 *   const sorted = skills.sort((a, b) => sortByTier(a, b));
 *   // Results: Tier 1 (tools) → Tier 2 (directories) → Tier 3 (other)
 */
export function sortByTier(a: SkillItem, b: SkillItem): number {
  const aResult = useSkillIcons(a);
  const bResult = useSkillIcons(b);
  return aResult.tierSort - bResult.tierSort;
}

/**
 * groupByTier — Group skills by tier for display
 *
 * Usage:
 *   const grouped = groupByTier(skills);
 *   // Returns:
 *   // {
 *   //   tool: [skill1, skill2, ...],
 *   //   directory: [skill3, ...],
 *   //   other: [skill4, ...]
 *   // }
 */
export function groupByTier(
  skills: SkillItem[],
): Record<'tool' | 'directory' | 'other', SkillItem[]> {
  const groups: Record<'tool' | 'directory' | 'other', SkillItem[]> = {
    tool: [],
    directory: [],
    other: [],
  };

  for (const skill of skills) {
    const tier = (skill.tier || 'other') as 'tool' | 'directory' | 'other';
    groups[tier].push(skill);
  }

  // Sort within each tier by name
  for (const tier of Object.keys(groups) as Array<'tool' | 'directory' | 'other'>) {
    groups[tier].sort((a, b) => a.name.localeCompare(b.name));
  }

  return groups;
}
