// skill-adapter.mjs — adapter for scanning generic SKILL.md files from other sources
// Unlike markdown-skill.mjs which targets specific tools (hermes, claude-code),
// this adapter provides a generic way to scan SKILL.md files from any source
// and returns a standardized format with frontmatter parsing.

import path from 'node:path';
import fg from 'fast-glob';
import {
  expandRoots,
  classifyRoot,
  readFileSafe,
  parseFrontmatter,
  inferBrand,
  inferProduct,
  deriveDescription,
  makePreview,
  sha1Id,
} from '../utils.mjs';

/**
 * Scan SKILL.md files from arbitrary locations/sources
 * @param {object} opts
 * @param {string} opts.source              — IR source tag (e.g., 'other-skills', 'custom-skills')
 * @param {string[]} opts.roots              — base dirs to scan (with ~ / globs)
 * @param {string} [opts.fileGlob='SKILL.md'] — relative glob pattern
 * @param {object} [opts.limits]             — { maxFiles, maxFileBytes }
 * @returns {Promise<{items:SkillItem[], stats:object}>}
 */
export async function scanSkills(opts) {
  const {
    source = 'other-skills',
    roots = [],
    fileGlob = '**/SKILL.md',
    limits = { maxFiles: 5000, maxFileBytes: 1024 * 1024 },
  } = opts;

  const expanded = await expandRoots(roots);
  if (!expanded.length) {
    return { items: [], stats: { source, available: false, files: 0 } };
  }

  // Collect file paths
  const files = [];
  for (const root of expanded) {
    const found = await fg(fileGlob, {
      cwd: root,
      absolute: true,
      onlyFiles: true,
      dot: true,
      followSymbolicLinks: true,
      deep: 10,
      ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
    });
    for (const f of found) {
      files.push({ abs: f, root });
      if (files.length >= limits.maxFiles) break;
    }
    if (files.length >= limits.maxFiles) break;
  }

  // Parse each file
  const items = files.map(({ abs, root }) => parseSkillFile({ abs, root, source, limits }));
  return {
    items,
    stats: { source, available: true, files: items.length, roots: expanded },
  };
}

/**
 * Parse a single SKILL.md file
 * @param {object} opts
 * @param {string} opts.abs     — absolute path to the SKILL.md file
 * @param {string} opts.root    — root directory for relative path calculation
 * @param {string} opts.source  — source identifier
 * @param {object} opts.limits  — { maxFileBytes }
 * @returns {SkillItem}
 */
function parseSkillFile({ abs, root, source, limits }) {
  const { text, truncated, mtime, error } = readFileSafe(abs, limits.maxFileBytes);
  const id = sha1Id(abs);
  const rel = path.relative(root, abs);

  // Extract category from directory structure
  const relDir = path.dirname(rel);
  const category = relDir && relDir !== '.' ? relDir.split('/')[0] : undefined;

  // Extract skill name from parent directory
  const dirName = path.basename(path.dirname(abs));

  // Handle file read errors
  if (error) {
    return createBaseItem({
      abs,
      id,
      source,
      dirName,
      category,
      mtime,
      raw: '',
      parseError: error,
    });
  }

  // Handle truncated files
  if (truncated) {
    return createBaseItem({
      abs,
      id,
      source,
      dirName,
      category,
      mtime,
      raw: '',
      parseError: `file > ${limits.maxFileBytes} bytes, skipped`,
    });
  }

  // Parse frontmatter
  const { data: fm, body, i18n, parseError } = parseFrontmatter(text);

  const name = (fm.name || dirName).toString().trim();
  const title = (fm.title || fm.name || dirName).toString().trim();
  const description = deriveDescription(fm, body);

  // Extract fields from frontmatter
  const triggers = collectTriggers(fm);
  const tags = collectTags(fm);
  const links = collectLinks(fm);

  // Infer metadata
  const product = inferProduct({ name, category });

  // Build the skill item with all required fields
  const item = {
    id,
    kind: 'skill',
    source,
    editor: 'Other Skills',
    name,
    title: title !== name ? title : undefined,
    description,
    category,
    triggers: triggers.length ? triggers : undefined,
    tags: tags.length ? tags : undefined,
    paths: {
      abs,
      rel,
      rootKind: classifyRoot(abs),
    },
    preview: makePreview(body),
    raw: text,
    links: links.length ? links : undefined,
    updatedAt: new Date(mtime).toISOString(),
    product,
  };

  // Add i18n translations if present
  if (i18n) {
    item.i18n = {
      ...i18n,
      translatedAt: new Date().toISOString(),
      translationModel: 'frontmatter',
    };
  }

  // Infer brand
  item.brand = inferBrand({
    name: item.name,
    description: item.description,
    category: item.category,
    raw: body,
  });

  if (parseError) item.parseError = parseError;
  return item;
}

/**
 * Create a minimal skill item for error cases
 */
function createBaseItem({ abs, id, source, dirName, category, mtime, raw, parseError }) {
  return {
    id,
    kind: 'skill',
    source,
    editor: 'Other Skills',
    name: dirName,
    description: undefined,
    category,
    paths: { abs, rootKind: classifyRoot(abs) },
    preview: '',
    raw,
    updatedAt: new Date(mtime).toISOString(),
    parseError,
  };
}

/**
 * Collect trigger strings from frontmatter
 */
function collectTriggers(fm) {
  const out = [];
  const candidates = [fm.triggers, fm.aliases, fm.when_to_use];
  for (const c of candidates) {
    if (!c) continue;
    if (Array.isArray(c)) {
      out.push(...c.filter(x => typeof x === 'string').map(x => x.trim()));
    } else if (typeof c === 'string') {
      out.push(c.trim());
    }
  }
  return [...new Set(out)];
}

/**
 * Collect tags from frontmatter
 */
function collectTags(fm) {
  const v = fm.tags;
  if (!v) return [];
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string');
  if (typeof v === 'string') return v.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

/**
 * Collect links from frontmatter
 */
function collectLinks(fm) {
  const out = [];
  if (Array.isArray(fm.links)) {
    for (const l of fm.links) {
      if (l && typeof l === 'object' && l.url) {
        out.push({ label: l.label || l.url, url: l.url });
      }
    }
  }
  if (typeof fm.url === 'string') {
    out.push({ label: 'docs', url: fm.url });
  }
  return out;
}
