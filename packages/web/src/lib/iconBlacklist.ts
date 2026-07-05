// 图标黑名单 —— 记录已知无图标的 brand，避免反复请求 /api/icons 404。
// 学习式：img onError 时记录 brand 到 localStorage，后续渲染直接用 emoji。
// 进程内缓存读取结果，避免每次渲染都 parse localStorage。

const STORAGE_KEY = 'huhaa_no_icon_brands'
let cache: Set<string> | null = null

function load(): Set<string> {
  if (cache) return cache
  try {
    cache = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'))
  } catch {
    cache = new Set()
  }
  return cache
}

/** brand 是否在黑名单（无图标，应直接用 emoji） */
export function isIconBlacklisted(brand: string): boolean {
  if (!brand) return false
  return load().has(brand.toLowerCase())
}

/** 记录 brand 无图标（img 加载失败时调用） */
export function markIconMissing(brand: string): void {
  if (!brand) return
  const set = load()
  const key = brand.toLowerCase()
  if (set.has(key)) return
  set.add(key)
  cache = set
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // localStorage 不可用时静默，内存黑名单仍生效
  }
}
