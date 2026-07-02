/**
 * @file tier2-user-skills.mjs
 * 扫描第2层：用户根目录 ~/skills/
 * 与第1层的 pathHashes 进行去重
 */

import path from 'node:path';
import fg from 'fast-glob';
import { expandTilde, readFileSafe, sha1Id } from '../utils.mjs';
import { USER_TIER_2_CONFIG } from '../config/editor-tiers.mjs';
import { pathHashCache } from '../hash/path-hash.mjs';

/**
 * 扫描第2层：用户根目录 ~/skills/
 * 与第1层的 pathHashes 进行去重
 *
 * @param {Object} options
 * @param {Set<string>} options.tier1PathHashes - 第1层的所有 pathHash 集合
 * @param {Object} [options.limits] - { maxFiles, maxFileBytes }
 * @returns {Promise<{items: SkillItem[], pathHashes: Set<string>}>}
 */
export async function scanTier2UserSkills(options = {}) {
  const { tier1PathHashes = new Set(), limits = {} } = options;
  const mergedLimits = {
    maxFiles: limits.maxFiles ?? 5000,
    maxFileBytes: limits.maxFileBytes ?? 1024 * 1024,
  };

  const items = [];
  const pathHashes = new Set();

  try {
    const basePath = expandTilde(USER_TIER_2_CONFIG.globalPath);

    // 三种模式：兼容大小写
    // 由于 fast-glob 的 case-insensitive 模式支持有限，采用多模式扫描
    const patterns = [
      `${basePath}/**/SKILL.md`,
      `${basePath}/**/skill.md`,
    ];

    const seen = new Set();

    for (const pattern of patterns) {
      if (items.length >= mergedLimits.maxFiles) break;

      try {
        const matches = await fg(pattern, {
          absolute: true,
          onlyFiles: true,
          dot: true,
          followSymbolicLinks: true,
          deep: 10,
          ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
        });

        for (const filePath of matches) {
          if (items.length >= mergedLimits.maxFiles) break;
          if (seen.has(filePath)) continue;
          seen.add(filePath);

          // 路径去重：检查是否已在 Tier 1 中
          const hash = pathHashCache.getOrCompute(filePath);
          if (tier1PathHashes.has(hash)) {
            continue; // 跳过重复项
          }

          try {
            const skill = parseSkillFile({
              abs: filePath,
              source: 'tier2-user',
              limits: mergedLimits,
            });
            if (skill) {
              skill.tierId = 'tier-2';
              skill.pathHash = hash;
              items.push(skill);
              pathHashes.add(hash);
            }
          } catch (e) {
            console.warn(`[scanTier2] parse failed: ${filePath}`, e.message);
          }
        }
      } catch (e) {
        // glob 模式失败，继续下一个
      }
    }
  } catch (e) {
    console.warn(`[scanTier2] scan failed:`, e.message);
  }

  return { items, pathHashes };
}

/**
 * 解析单个技能文件
 * @private
 */
function parseSkillFile({ abs, source, limits }) {
  const { text, error } = readFileSafe(abs, limits.maxFileBytes);
  if (error) return null;

  const id = sha1Id(abs);
  const dirName = path.basename(path.dirname(abs));

  let frontmatter = {};
  let body = text;
  let parseError = null;

  // 简单的 frontmatter 解析
  if (text.startsWith('---\n')) {
    const endIdx = text.indexOf('\n---\n', 4);
    if (endIdx > 0) {
      const fm = text.slice(4, endIdx);
      try {
        frontmatter = parseYAML(fm);
        body = text.slice(endIdx + 5);
      } catch (e) {
        parseError = `Frontmatter parse error: ${e.message}`;
      }
    }
  }

  const name = frontmatter.name || dirName;
  const description = frontmatter.description || '';
  const category = frontmatter.category;

  return {
    id,
    kind: 'skill',
    source,
    name,
    description,
    category,
    paths: {
      abs,
      rootKind: 'home',
    },
    preview: makePreview(body),
    raw: body,
    updatedAt: new Date().toISOString(),
    parseError,
  };
}

/**
 * 极简 YAML 解析
 * @private
 */
function parseYAML(yamlStr) {
  const obj = {};
  const lines = yamlStr.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx <= 0) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    const unquoted = value.startsWith('"')
      ? value.slice(1, -1)
      : value.startsWith("'")
        ? value.slice(1, -1)
        : value;

    obj[key] = unquoted || null;
  }

  return obj;
}

/**
 * 生成预览文本
 * @private
 */
function makePreview(text, maxLen = 200) {
  const lines = text.split('\n').filter(l => l.trim());
  let preview = '';
  for (const line of lines) {
    if ((preview + line).length > maxLen) {
      preview += '...';
      break;
    }
    preview += (preview ? ' ' : '') + line;
  }
  return preview;
}
