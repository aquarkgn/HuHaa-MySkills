// IndexedDB 轻量封装 —— 用于持久化翻译缓存（translatedRawCache）。
// 页面刷新（重新加载 JS）后内存缓存丢失，IndexedDB 持久化让已翻译过的
// 技能正文仍能离线/毫秒级展示，省去网络往返。
//
// 测试环境（jsdom）可能无 IndexedDB，所有操作用 try/catch 保护，失败时
// 静默降级（调用方回退到内存缓存 + 网络请求）。

const DB_NAME = 'skillshelper-translate-cache';
const STORE = 'raw';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return dbPromise;
}

/** 读取持久化缓存，不存在或 IndexedDB 不可用时返回 undefined */
export async function idbGet<T>(key: string): Promise<T | undefined> {
  try {
    const db = await openDB();
    if (!db) return undefined;
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => resolve(undefined);
    });
  } catch {
    return undefined;
  }
}

/** 写入持久化缓存，IndexedDB 不可用时静默 */
export async function idbSet(key: string, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    if (!db) return;
    await new Promise((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(value, key);
      tx.oncomplete = () => resolve(undefined);
      tx.onerror = () => resolve(undefined);
    });
  } catch {
    // 静默
  }
}
