/**
 * 客户端翻译服务
 * 使用 localStorage 缓存翻译结果，减少 API 调用
 */

const CACHE_PREFIX = 'huhaa-translate-';
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * 生成缓存键
 * @param {string} text - 文本
 * @param {string} targetLang - 目标语言
 * @returns {string} 缓存键
 */
function getCacheKey(text, targetLang = 'zh-CN') {
  const hash = btoa(text).slice(0, 20); // 简单哈希
  return `${CACHE_PREFIX}${targetLang}_${hash}`;
}

/**
 * 从缓存读取翻译
 * @param {string} text - 文本
 * @param {string} targetLang - 目标语言
 * @returns {string|null} 缓存的翻译，过期或不存在返回 null
 */
function getFromCache(text, targetLang = 'zh-CN') {
  try {
    const key = getCacheKey(text, targetLang);
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { text: cachedText, timestamp } = JSON.parse(cached);
    const age = Date.now() - timestamp;

    // 检查缓存是否过期
    if (age > CACHE_TTL) {
      localStorage.removeItem(key);
      return null;
    }

    return cachedText;
  } catch (e) {
    console.error('[translator] cache read error:', e);
    return null;
  }
}

/**
 * 写入缓存
 * @param {string} text - 原文本
 * @param {string} translated - 翻译文本
 * @param {string} targetLang - 目标语言
 */
function saveToCache(text, translated, targetLang = 'zh-CN') {
  try {
    const key = getCacheKey(text, targetLang);
    const data = {
      text: translated,
      timestamp: Date.now(),
      source: text.slice(0, 50),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('[translator] cache write error:', e);
  }
}

/**
 * 使用后端 API 翻译
 * @param {string} text - 要翻译的文本
 * @param {string} targetLang - 目标语言 (默认: 'zh-CN')
 * @returns {Promise<string>} 翻译结果
 */
export async function translateText(text, targetLang = 'zh-CN') {
  if (!text || !text.trim()) return '';
  if (targetLang !== 'zh-CN' && targetLang !== 'zh') return text;

  // 尝试从缓存读取
  const cached = getFromCache(text, targetLang);
  if (cached) {
    console.debug('[translator] cache hit for text:', text.slice(0, 30));
    return cached;
  }

  try {
    console.debug('[translator] calling backend API for:', text.slice(0, 30));
    
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, targetLang }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const translated = data.result || text;

    // 缓存翻译结果
    saveToCache(text, translated, targetLang);

    return translated;
  } catch (e) {
    console.error('[translator] error:', e.message);
    return text; // 降级：返回原文本
  }
}

/**
 * 批量翻译对象的多个字段
 * @param {Object} item - 技能对象
 * @param {string[]} fields - 要翻译的字段列表
 * @param {string} targetLang - 目标语言
 * @returns {Promise<Object>} 包含翻译结果的对象
 */
export async function translateSkillFields(item, fields = ['name', 'description'], targetLang = 'zh-CN') {
  if (!item) return {};

  const results = {};
  const promises = fields.map(async (field) => {
    const text = item[field];
    if (text) {
      results[`${field}_${targetLang}`] = await translateText(text, targetLang);
    }
  });

  await Promise.all(promises);
  return results;
}

/**
 * 获取本地化文本（优先返回翻译版本）
 * @param {Object} item - 技能对象
 * @param {string} field - 字段名
 * @param {string} locale - 语言 (默认: 'zh-CN')
 * @returns {string} 本地化文本
 */
export function getLocalizedText(item, field, locale = 'zh-CN') {
  if (!item) return '';

  // 优先返回已翻译的字段
  if (locale === 'zh-CN' || locale === 'zh') {
    const zhField = `${field}_zh-CN`;
    if (item[zhField]) return item[zhField];
    const zhCnField = `${field}_zh`;
    if (item[zhCnField]) return item[zhCnField];
  }

  // 降级到原字段
  return item[field] || '';
}

/**
 * 清除过期缓存
 */
export function clearExpiredCache() {
  try {
    const now = Date.now();
    const keys = Object.keys(localStorage);

    let cleared = 0;
    keys.forEach((key) => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const cached = JSON.parse(localStorage.getItem(key));
          const age = now - cached.timestamp;
          if (age > CACHE_TTL) {
            localStorage.removeItem(key);
            cleared++;
          }
        } catch (e) {
          localStorage.removeItem(key);
          cleared++;
        }
      }
    });

    if (cleared > 0) {
      console.debug(`[translator] cleared ${cleared} expired cache entries`);
    }
  } catch (e) {
    console.error('[translator] cache cleanup error:', e);
  }
}

/**
 * 获取缓存统计信息
 * @returns {Object} { total: number, size: number (bytes) }
 */
export function getCacheStats() {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(CACHE_PREFIX));
    let size = 0;

    keys.forEach((key) => {
      const value = localStorage.getItem(key);
      size += value?.length || 0;
    });

    return {
      total: keys.length,
      size: Math.round(size / 1024), // KB
    };
  } catch (e) {
    return { total: 0, size: 0 };
  }
}
