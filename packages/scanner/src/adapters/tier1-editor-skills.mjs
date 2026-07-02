/**
 * @file tier1-editor-skills.mjs
 * 扫描第1层：编辑器工具的全局和项目技能目录
 * 支持 22 个编辑器，大小写不敏感的 skills 目录
 */

import path from 'node:path';
import fg from 'fast-glob';
import { expandTilde, readFileSafe, parseFrontmatter, sha1Id } from '../utils.mjs';
import { EDITOR_TIER_1_CONFIGS } from '../config/editor-tiers.mjs';
import { getPathHash, pathHashCache } from '../hash/path-hash.mjs';

/**
 * 扫描第1层：编辑器工具的全局和项目技能目录
 *
 * @param {Object} options
 * @param {string} [options.projectRoot] - 项目根目录（用于扫描 .hermes/skills 等）
 * @param {Object} [options.limits] - { maxFiles, maxFileBytes }
 * @returns {Promise<{items: SkillItem[], pathHashes: Set<string>}>}
 */
export async function scanTier1EditorSkills(options = {}) {
  const { projectRoot, limits = {} } = options;
  const mergedLimits = {
    maxFiles: limits.maxFiles ?? 5000,
    maxFileBytes: limits.maxFileBytes ?? 1024 * 1024,
  };

  const items = [];
  const pathHashes = new Set();
  let fileCount = 0;

  for (const editor of EDITOR_TIER_1_CONFIGS) {
    if (fileCount >= mergedLimits.maxFiles) break;

    // 尝试全局路径
    const globalPath = expandTilde(editor.globalPath);
    const globalItems = await scanEditorDirectory(
      globalPath,
      editor,
      mergedLimits,
      mergedLimits.maxFiles - fileCount
    );
    items.push(...globalItems);
    fileCount += globalItems.length;
    globalItems.forEach(item => {
      const hash = pathHashCache.getOrCompute(item.paths.abs);
      pathHashes.add(hash);
      item.pathHash = hash;
    });

    if (fileCount >= mergedLimits.maxFiles) break;

    // 尝试项目路径
    if (projectRoot) {
      const projectPath = path.join(projectRoot, editor.projectPath);
      const projectItems = await scanEditorDirectory(
        projectPath,
        editor,
        mergedLimits,
        mergedLimits.maxFiles - fileCount
      );
      items.push(...projectItems);
      fileCount += projectItems.length;
      projectItems.forEach(item => {
        const hash = pathHashCache.getOrCompute(item.paths.abs);
        pathHashes.add(hash);
        item.pathHash = hash;
      });
    }
  }

  return { items, pathHashes };
}

/**
 * 扫描单个编辑器目录
 * 支持大小写不敏感的 skills 目录名和 SKILL.md / skill.md 文件
 *
 * @private
 */
async function scanEditorDirectory(basePath, editor, limits, maxRemaining) {
  const items = [];

  try {
    // 两种通配模式：
    // 1. skills (任意大小写) 目录下的 SKILL.md 或 skill.md
    // 2. 直接查找 **/SKILL.md 或 **/skill.md（递归）
    const patterns = [
      `${basePath}/**/[sS][kK][iI][lL][lL][sS]/**/[sS][kK][iI][lL][lL].[mM][dD]`,
      `${basePath}/**/SKILL.md`,
      `${basePath}/**/skill.md`,
    ];

    for (const pattern of patterns) {
      if (items.length >= maxRemaining) break;

      try {
        const matches = await fg(pattern, {
          absolute: true,
          onlyFiles: true,
          dot: true,
          followSymbolicLinks: true,
          deep: 10,
          ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
        });

        const seen = new Set(items.map(i => i.paths.abs));

        for (const filePath of matches) {
          if (items.length >= maxRemaining || seen.has(filePath)) continue;
          seen.add(filePath);

          try {
            const skill = parseSkillFile({
              abs: filePath,
              source: 'tier1-editor',
              editor,
              limits,
            });
            if (skill) {
              skill.tierId = 'tier-1';
              skill.editorBrand = editor.brand;
              items.push(skill);
            }
          } catch (e) {
            console.warn(`[scanTier1] parse failed: ${filePath}`, e.message);
          }
        }
      } catch (e) {
        // glob 模式失败，继续下一个
      }
    }
  } catch (e) {
    // 目录不存在或其他错误，静默跳过
  }

  return items;
}

/**
 * 解析单个技能文件
 * @private
 */
function parseSkillFile({ abs, source, editor, limits }) {
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
  const brand = frontmatter.brand || editor.brand;

  return {
    id,
    kind: 'skill',
    source,
    name,
    description,
    category,
    brand,
    editor: editor.name,
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
 * 极简 YAML 解析（不依赖外部库）
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

    // 去掉引号
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
