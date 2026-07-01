// icon-extractor.mjs — extract real macOS application icons for skills.
//
// Node.js equivalent of Pearcleaner's NSWorkspace.icon(forFile:) using only
// macOS built-in CLIs (mdfind / plutil / sips). No native bindings.
//
//   1. locateApp()      — find the .app bundle for a brand (mdfind + /Applications)
//   2. extractIconPng() — read CFBundleIconFile from Info.plist, sips → PNG
//   3. getIconForBrand()— combine + disk cache (mtime-invalidated)
//   4. resolveIconRef() — sync: decide iconUrl / emoji fallback for a skill
//
// All extraction is lazy (on /api/icons request) and cached, so scanning stays
// fast and non-macOS platforms degrade gracefully to emoji.

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolveBrandSpec, emojiForBrand } from './brand-map.mjs';

const execFileP = promisify(execFile);
const IS_MACOS = process.platform === 'darwin';
const APP_DIRS = [
  '/Applications',
  path.join(os.homedir(), 'Applications'),
  '/System/Applications',
];
const VALID_SIZES = new Set([32, 64, 128]);

// In-memory caches (per process). locateApp is stable within a session.
const appPathCache = new Map(); // brand -> appPath|null
const iconPathCache = new Map(); // `${brand}:${size}` -> pngPath|null

function cacheDir() {
  const base =
    process.env.HUHAA_HOME?.trim() ||
    path.join(process.env.XDG_CONFIG_HOME?.trim() || path.join(os.homedir(), '.config'), 'huhaa-myskills');
  return path.join(expandTilde(base), 'icon-cache');
}

function expandTilde(p) {
  if (!p) return p;
  if (p === '~' || p.startsWith('~/')) return path.join(os.homedir(), p.slice(2));
  return p;
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/**
 * Locate the .app bundle for a brand/source key (or raw bundle id).
 * @param {string} brand
 * @returns {Promise<string|null>} absolute path to the .app or null
 */
export async function locateApp(brand) {
  if (!IS_MACOS || !brand) return null;
  const key = String(brand).toLowerCase().trim();
  if (appPathCache.has(key)) return appPathCache.get(key);

  const spec = resolveBrandSpec(brand);
  if (!spec) {
    appPathCache.set(key, null);
    return null;
  }

  let found = null;

  // 1. Bundle ID via Spotlight — fastest and most accurate.
  for (const bundleId of spec.bundleIds) {
    const p = await mdfindBundle(bundleId);
    if (p) {
      found = p;
      break;
    }
  }

  // 2. App-name scan of /Applications (case-insensitive) as fallback.
  if (!found) {
    found = scanAppDirs(spec.appNames);
  }

  appPathCache.set(key, found);
  return found;
}

async function mdfindBundle(bundleId) {
  try {
    const { stdout } = await execFileP('mdfind', [
      `kMDItemCFBundleIdentifier == '${bundleId}'`,
    ]);
    const first = stdout.split('\n').map(s => s.trim()).find(s => s.endsWith('.app') && fs.existsSync(s));
    return first || null;
  } catch {
    return null;
  }
}

function scanAppDirs(appNames) {
  if (!appNames?.length) return null;
  const wanted = new Set(appNames.map(n => `${n.toLowerCase()}.app`));
  for (const dir of APP_DIRS) {
    let entries;
    try {
      entries = fs.readdirSync(dir);
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (wanted.has(entry.toLowerCase())) {
        return path.join(dir, entry);
      }
    }
  }
  return null;
}

/**
 * Extract a PNG icon from an .app bundle at the given size, with disk cache.
 * Cache is invalidated when the .app's mtime is newer than the cached PNG.
 * @param {string} appPath  — absolute path to a .app bundle
 * @param {number} size     — 32 | 64 | 128
 * @returns {Promise<string|null>} path to the cached PNG or null
 */
export async function extractIconPng(appPath, size) {
  if (!IS_MACOS || !appPath) return null;
  const dir = cacheDir();
  fs.mkdirSync(dir, { recursive: true });
  const pngPath = path.join(dir, `${slugify(path.basename(appPath, '.app'))}-${size}.png`);

  // Reuse cache if fresh (app not modified since PNG was written).
  try {
    const appStat = fs.statSync(appPath);
    const pngStat = fs.statSync(pngPath);
    if (pngStat.mtimeMs >= appStat.mtimeMs) return pngPath;
  } catch {
    // png missing → fall through to (re)build
  }

  const icnsPath = await findIcnsPath(appPath);
  if (!icnsPath) return null;

  try {
    await execFileP('sips', ['-s', 'format', 'png', '-Z', String(size), icnsPath, '--out', pngPath]);
    return fs.existsSync(pngPath) ? pngPath : null;
  } catch {
    return null;
  }
}

async function findIcnsPath(appPath) {
  const resourcesDir = path.join(appPath, 'Contents', 'Resources');
  const infoPlist = path.join(appPath, 'Contents', 'Info.plist');

  // Preferred: CFBundleIconFile from Info.plist
  let iconFile = null;
  try {
    const { stdout } = await execFileP('plutil', ['-extract', 'CFBundleIconFile', 'raw', infoPlist]);
    iconFile = stdout.trim();
  } catch {
    // key absent — fall back to directory scan
  }

  if (iconFile) {
    const withExt = iconFile.endsWith('.icns') ? iconFile : `${iconFile}.icns`;
    const candidate = path.join(resourcesDir, withExt);
    if (fs.existsSync(candidate)) return candidate;
  }

  // Fallback: first .icns in Resources (prefer one containing "icon").
  try {
    const icns = fs.readdirSync(resourcesDir).filter(f => f.toLowerCase().endsWith('.icns'));
    if (!icns.length) return null;
    const preferred = icns.find(f => /icon/i.test(f)) || icns[0];
    return path.join(resourcesDir, preferred);
  } catch {
    return null;
  }
}

/**
 * Get a cached PNG icon path for a brand at a given size (locate + extract).
 * @param {string} brand
 * @param {number} [size=64]
 * @returns {Promise<string|null>}
 */
export async function getIconForBrand(brand, size = 64) {
  if (!IS_MACOS) return null;
  const sz = VALID_SIZES.has(size) ? size : 64;
  const key = `${String(brand).toLowerCase().trim()}:${sz}`;
  if (iconPathCache.has(key)) {
    const cached = iconPathCache.get(key);
    if (cached && fs.existsSync(cached)) return cached;
  }
  const appPath = await locateApp(brand);
  if (!appPath) {
    iconPathCache.set(key, null);
    return null;
  }
  const png = await extractIconPng(appPath, sz);
  iconPathCache.set(key, png);
  return png;
}

/**
 * Decide the icon reference for a skill WITHOUT touching the filesystem/spawns.
 * Implements the R6.5 priority chain:
 *   explicit frontmatter.icon > real app icon (brand/source) > emoji fallback
 *
 * @param {object} skill
 * @param {string} [skill.icon]    — explicit frontmatter icon ("emoji:🤖"/"url:.."/"app:bundleId")
 * @param {string} [skill.brand]
 * @param {string} [skill.source]
 * @param {number} [size=64]
 * @returns {{ iconUrl?: string, iconFallback?: string }}
 */
export function resolveIconRef(skill, size = 64) {
  const sz = VALID_SIZES.has(size) ? size : 64;
  const icon = skill?.icon ? String(skill.icon).trim() : '';

  // 1. Explicit frontmatter override
  if (icon) {
    if (icon.startsWith('emoji:')) return { iconFallback: icon.slice(6) };
    if (icon.startsWith('url:')) return { iconUrl: icon.slice(4) };
    if (icon.startsWith('app:')) {
      return { iconUrl: `/api/icons/${encodeURIComponent(icon.slice(4))}?size=${sz}` };
    }
    // A bare emoji / single glyph
    return { iconFallback: icon };
  }

  // 2. Real app icon by brand, then source
  for (const key of [skill?.brand, skill?.source]) {
    if (key && resolveBrandSpec(key)) {
      return {
        iconUrl: `/api/icons/${encodeURIComponent(key)}?size=${sz}`,
        iconFallback: emojiForBrand(key),
      };
    }
  }

  // 3. No mapping — frontend emoji map handles it
  return {};
}

export { IS_MACOS };
