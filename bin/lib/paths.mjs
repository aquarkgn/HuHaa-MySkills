// XDG-style paths for huhaa-myskills.
// All user-side state lives under HUHAA_HOME (default: ~/.config/huhaa-myskills).
// Nothing is written outside this dir, so `purge` cleans everything.

import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

export function homeDir() {
  if (process.env.HUHAA_HOME && process.env.HUHAA_HOME.trim()) {
    return path.resolve(expandTilde(process.env.HUHAA_HOME));
  }
  // XDG_CONFIG_HOME respected if set, else ~/.config
  const xdg = process.env.XDG_CONFIG_HOME && process.env.XDG_CONFIG_HOME.trim()
    ? path.resolve(expandTilde(process.env.XDG_CONFIG_HOME))
    : path.join(os.homedir(), '.config');
  return path.join(xdg, 'huhaa-myskills');
}

export function configFile() {
  return path.join(homeDir(), 'sources.yaml');
}

export function cacheFile() {
  return path.join(homeDir(), 'cache.json');
}

// 翻译结果持久化缓存（md5 key → 译文）。purge 删除整个 homeDir 时随之清理。
export function translateCacheFile() {
  return path.join(homeDir(), 'translate-cache.json');
}

export function stateFile() {
  return path.join(homeDir(), 'state.json');
}

export function ensureHomeDir() {
  const dir = homeDir();
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function expandTilde(p) {
  if (!p) return p;
  if (p === '~' || p.startsWith('~/')) {
    return path.join(os.homedir(), p.slice(2));
  }
  return p;
}

export function writeJson(file, obj) {
  ensureHomeDir();
  fs.writeFileSync(file, JSON.stringify(obj, null, 2));
}

export function readJson(file, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}
