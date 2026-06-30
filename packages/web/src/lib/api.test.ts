import { describe, it, expect, vi, afterEach } from 'vitest'
import { copy, open } from './api'

interface FakeRes {
  ok: boolean
  json: () => Promise<unknown>
}
function stubFetch(res: FakeRes) {
  const fn = vi.fn((_url: string, _init?: RequestInit) => Promise.resolve(res as unknown as Response))
  vi.stubGlobal('fetch', fn)
  return fn
}

afterEach(() => vi.unstubAllGlobals())

describe('api copy/open 契约（C5 回归守卫）', () => {
  it('copy 透传 what（含后端支持的 raw/prompt），POST /api/copy', async () => {
    const fn = stubFetch({ ok: true, json: async () => ({ ok: true, what: 'raw', bytes: 12 }) })
    const r = await copy('id-1', 'raw')
    expect(r.ok).toBe(true)
    const [url, init] = fn.mock.calls[0]
    expect(url).toBe('/api/copy')
    expect(JSON.parse(init!.body as string)).toEqual({ id: 'id-1', what: 'raw' })
  })

  it('copy 默认 what=path', async () => {
    const fn = stubFetch({ ok: true, json: async () => ({ ok: true }) })
    await copy('id-2')
    const [, init] = fn.mock.calls[0]
    expect(JSON.parse(init!.body as string).what).toBe('path')
  })

  it('open 透传 with，POST /api/open', async () => {
    const fn = stubFetch({ ok: true, json: async () => ({ ok: true, with: 'finder' }) })
    await open('id-3', 'finder')
    const [url, init] = fn.mock.calls[0]
    expect(url).toBe('/api/open')
    expect(JSON.parse(init!.body as string)).toEqual({ id: 'id-3', with: 'finder' })
  })

  it('非 2xx 时仍读到 {ok:false,error}（不抛错吞掉 body）', async () => {
    stubFetch({ ok: false, json: async () => ({ ok: false, error: "invalid 'what'" }) })
    const r = await copy('id-4', 'path')
    expect(r.ok).toBe(false)
    expect(r.error).toMatch(/invalid/)
  })
})
