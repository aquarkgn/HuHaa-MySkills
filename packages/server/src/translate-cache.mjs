// 翻译缓存 —— 双层结构：进程内 Map（热路径）+ 磁盘 JSON（跨重启）。
// key = md5(text)：不同技能若描述相同则共享缓存条目；文件更新导致
// text 变化时 md5 自然不同，自动重译，无需 mtime 比对。
//
// 风格对齐 icon-extractor.mjs：内存 Map 命中即返回，磁盘异步落盘。
// purge 命令删除整个 SKILLSHELPER_HOME 目录，本缓存文件随之清理。

import crypto from 'node:crypto';
import { translateCacheFile, ensureHomeDir, readJson, writeJson } from '../../../bin/lib/paths.mjs';

const CACHE_VERSION = 1;
const FLUSH_DELAY = 500; // 防抖落盘，避免高频写

let memoryCache = new Map();
let dirty = false;
let flushTimer = null;
let loaded = false;

function md5(text) {
  return crypto.createHash('md5').update(text, 'utf8').digest('hex');
}

// LRU 上限：避免 translate-cache.json 无限膨胀。动态读取环境变量（测试用小值）。
function getMaxEntries() {
  return parseInt(process.env.SKILLSHELPER_TRANSLATE_CACHE_MAX || '5000', 10);
}

function load() {
  if (loaded) return;
  loaded = true;
  const data = readJson(translateCacheFile(), null);
  if (data && data.version === CACHE_VERSION && data.entries) {
    memoryCache = new Map(Object.entries(data.entries));
    // 加载时若超限，按 LRU 淘汰最旧条目
    evictIfNeeded();
  }
}

/** LRU 淘汰：Map 迭代顺序 = 插入顺序，首个即最久未使用 */
function evictIfNeeded() {
  const max = getMaxEntries();
  while (memoryCache.size > max) {
    const oldest = memoryCache.keys().next().value;
    if (oldest === undefined) break;
    memoryCache.delete(oldest);
    dirty = true;
  }
}

/**
 * 查询缓存（LRU 命中时移到末尾，标记最近使用）
 * @param {string} text - 原文
 * @returns {{from:string,to:string,result:string,translatedAt:string}|null} 缓存条目或 null
 */
export function getCached(text) {
  load();
  const key = md5(text);
  const entry = memoryCache.get(key);
  if (entry) {
    // LRU: 命中时移到末尾（最近使用）
    memoryCache.delete(key);
    memoryCache.set(key, entry);
  }
  return entry || null;
}

/**
 * 写入缓存（内存立即生效，磁盘防抖落盘）。LRU 超限时淘汰最旧条目。
 * @param {string} text - 原文
 * @param {string} result - 译文
 * @param {string} from - 源语言代码（如 'en'）
 */
export function setCached(text, result, from) {
  load();
  const key = md5(text);
  // LRU: 命中时先 delete 再 set，移到末尾（最近使用）
  if (memoryCache.has(key)) memoryCache.delete(key);
  memoryCache.set(key, {
    from: from || 'unknown',
    to: 'zh-CN',
    text,
    result,
    translatedAt: new Date().toISOString(),
  });
  evictIfNeeded();
  dirty = true;
  scheduleFlush();
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_DELAY);
}

/**
 * 立即落盘。进程退出前应调用一次（onClose 钩子）。
 */
export function flush() {
  if (!dirty) return;
  ensureHomeDir();
  const data = { version: CACHE_VERSION, entries: Object.fromEntries(memoryCache) };
  try {
    writeJson(translateCacheFile(), data);
    dirty = false;
  } catch (e) {
    console.warn(`[translate-cache] flush failed: ${e.message}`);
  }
}

/**
 * 获取缓存条目数（测试 / 诊断用）
 */
export function size() {
  load();
  return memoryCache.size;
}

/**
 * 重置缓存（仅测试用：清空内存并标记未加载，以便切换 SKILLSHELPER_HOME 后重新加载）
 */
export function _resetForTest() {
  memoryCache = new Map();
  dirty = false;
  if (flushTimer) {
    clearTimeout(flushTimer);
    flushTimer = null;
  }
  loaded = false;
}
