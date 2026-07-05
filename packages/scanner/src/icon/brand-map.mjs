// brand-map.mjs — maps a skill's brand/source to candidate macOS applications.
//
// Used by icon-extractor.mjs to locate the real .app bundle for a skill so its
// genuine editor/tool icon can be shown (mirrors Pearcleaner's app-icon logic).
//
// Bundle IDs are the fast/accurate path (mdfind); appNames are the fallback
// (scan /Applications). Entries with neither map to nothing → emoji fallback.

/**
 * @typedef {object} BrandAppSpec
 * @property {string[]} bundleIds  — candidate CFBundleIdentifier values
 * @property {string[]} appNames   — candidate .app display names (no extension)
 * @property {string}  [emoji]     — emoji fallback when no app is found
 */

/** @type {Record<string, BrandAppSpec>} */
export const BRAND_APP_MAP = {
  cursor: {
    bundleIds: ['com.todesktop.230313mzl4w4u92'],
    appNames: ['Cursor'],
    emoji: '🖱️',
  },
  'vs-code': {
    bundleIds: ['com.microsoft.VSCode', 'com.microsoft.VSCodeInsiders'],
    appNames: ['Visual Studio Code', 'Code', 'Visual Studio Code - Insiders'],
    emoji: '📝',
  },
  vscode: {
    bundleIds: ['com.microsoft.VSCode'],
    appNames: ['Visual Studio Code', 'Code'],
    emoji: '📝',
  },
  'claude-code': {
    bundleIds: ['com.anthropic.claude', 'com.anthropic.claudefordesktop'],
    appNames: ['Claude'],
    emoji: '🤖',
  },
  claude: {
    bundleIds: ['com.anthropic.claude', 'com.anthropic.claudefordesktop'],
    appNames: ['Claude'],
    emoji: '🤖',
  },
  obsidian: {
    bundleIds: ['md.obsidian'],
    appNames: ['Obsidian'],
    emoji: '🧠',
  },
  docker: {
    bundleIds: ['com.docker.docker'],
    appNames: ['Docker', 'Docker Desktop'],
    emoji: '🐳',
  },
  // Tools that usually have no GUI .app on macOS → emoji fallback only.
  codex: { bundleIds: [], appNames: ['Codex'], emoji: '📋' },
  hermes: { bundleIds: [], appNames: ['Hermes'], emoji: '⚡' },
  mcp: { bundleIds: [], appNames: [], emoji: '🔌' },
  // 补充常见品牌（基于实际技能 brand 分布统计）：
  // 有 .app 的 → 真实图标；无 .app 的 → 仅 emoji fallback
  google: {
    bundleIds: ['com.google.chrome'],
    appNames: ['Google Chrome', 'Chrome'],
    emoji: '🌐',
  },
  github: {
    bundleIds: ['com.github.github', 'com.github.GitHubClient'],
    appNames: ['GitHub', 'GitHub Desktop'],
    emoji: '🐙',
  },
  notion: {
    bundleIds: ['notion.id'],
    appNames: ['Notion'],
    emoji: '📓',
  },
  anthropic: {
    bundleIds: ['com.anthropic.claude', 'com.anthropic.claudefordesktop'],
    appNames: ['Claude'],
    emoji: '🤖',
  },
  // 仅 emoji fallback（无单一对应 .app）
  apple: { bundleIds: [], appNames: [], emoji: '🍎' },
  rust: { bundleIds: [], appNames: [], emoji: '🦀' },
  python: { bundleIds: [], appNames: [], emoji: '🐍' },
  suno: { bundleIds: [], appNames: [], emoji: '🎵' },
};

/**
 * Resolve a brand/source key (or a raw bundle id) into a lookup spec.
 * A value containing a dot is treated as an explicit bundle id.
 * @param {string} key
 * @returns {BrandAppSpec | null}
 */
export function resolveBrandSpec(key) {
  if (!key) return null;
  const normalized = String(key).toLowerCase().trim();
  if (BRAND_APP_MAP[normalized]) return BRAND_APP_MAP[normalized];
  // Looks like a bundle identifier (e.g. "com.microsoft.VSCode")
  if (/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(key)) {
    return { bundleIds: [key], appNames: [], emoji: undefined };
  }
  return null;
}

/**
 * Emoji fallback for a brand/source key (used when no app is found).
 * @param {string} key
 * @returns {string | undefined}
 */
export function emojiForBrand(key) {
  const spec = BRAND_APP_MAP[String(key || '').toLowerCase().trim()];
  return spec?.emoji;
}
