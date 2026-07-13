import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OtherSkillsView } from './OtherSkillsView'
import type { OtherSkill } from '@/types/other-skill'

const sampleSkills: OtherSkill[] = [
  {
    id: 'docker-skill',
    name: 'docker-helper',
    title: 'Docker Helper',
    category: ['tool'],
    brand: 'docker',
    source: 'directory-skill',
    description: 'Manage local containers.',
    tags: ['container', 'devops'],
    docs: 'https://docs.docker.com/',
    examples: ['docker ps'],
    updatedAt: '2026-07-05T10:00:00.000Z',
  },
  {
    id: 'ai-skill',
    name: 'prompt-review',
    title: 'Prompt Review',
    category: ['ai'],
    brand: 'codex',
    source: 'project-runbook',
    description: 'Review prompts before shipping.',
    links: [{ label: 'Runbook', url: 'https://example.com/runbook' }],
    updatedAt: '2026-07-04T10:00:00.000Z',
  },
]

function mockOtherSkills(skills: OtherSkill[]) {
  vi.stubGlobal(
    'fetch',
    vi.fn((url: string | URL) => {
      const href = String(url)
      if (href.includes('/api/other-skills')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, skills }),
        } as Response)
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({ ok: true, result: '', targetLang: 'zh-CN' }),
      } as Response)
    }),
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  const storage = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => storage.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storage.set(key, value)
    }),
    removeItem: vi.fn((key: string) => {
      storage.delete(key)
    }),
    clear: vi.fn(() => {
      storage.clear()
    }),
    key: vi.fn((index: number) => Array.from(storage.keys())[index] ?? null),
    get length() {
      return storage.size
    },
  })
  localStorage.setItem('skillhelper_translate_display', '0')
  mockOtherSkills([])
})

afterEach(() => {
  localStorage.clear()
  vi.unstubAllGlobals()
})

describe('OtherSkillsView', () => {
  it('渲染发布级工作台外壳和搜索框', async () => {
    const { container } = render(<OtherSkillsView />)

    expect(screen.getByRole('heading', { name: '其它技能' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/搜索其它技能/)).toBeInTheDocument()
    expect(container.querySelector('.grid.min-h-0.flex-1')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('暂无其它技能')).toBeInTheDocument())
  })

  it('支持受控搜索输入', async () => {
    const onQuery = vi.fn()
    render(<OtherSkillsView query="docker" onQuery={onQuery} />)

    const searchInput = screen.getByPlaceholderText(/搜索其它技能/) as HTMLInputElement
    expect(searchInput.value).toBe('docker')

    fireEvent.change(searchInput, { target: { value: 'codex' } })
    expect(onQuery).toHaveBeenCalledWith('codex')
    await waitFor(() => expect(screen.getByText('暂无其它技能')).toBeInTheDocument())
  })

  it('加载完成后展示紧凑列表、首项详情和右侧元数据', async () => {
    mockOtherSkills(sampleSkills)
    render(<OtherSkillsView />)

    await waitFor(() => expect(screen.getAllByText('Docker Helper').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Manage local containers.').length).toBeGreaterThan(0)
    expect(screen.getByText('技能上下文')).toBeInTheDocument()
    expect(screen.getAllByText('directory-skill').length).toBeGreaterThan(0)
    expect(screen.getByText('$ docker ps')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '文档' })).toHaveAttribute('href', 'https://docs.docker.com/')
  })

  it('selectedId 指向指定技能时展示对应详情', async () => {
    mockOtherSkills(sampleSkills)
    render(<OtherSkillsView selectedId="ai-skill" />)

    await waitFor(() => expect(screen.getAllByText('Prompt Review').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Review prompts before shipping.').length).toBeGreaterThan(0)
    expect(screen.getByText('Runbook')).toBeInTheDocument()
    expect(screen.queryByText('$ docker ps')).toBeNull()
  })

  it('点击列表项回传选中 id', async () => {
    const onSelect = vi.fn()
    mockOtherSkills(sampleSkills)
    render(<OtherSkillsView onSelect={onSelect} />)

    await waitFor(() => expect(screen.getAllByText('Prompt Review').length).toBeGreaterThan(0))
    fireEvent.click(screen.getAllByText('Prompt Review')[0])
    expect(onSelect).toHaveBeenCalledWith('ai-skill')
  })

  it('分类筛选会收窄列表', async () => {
    mockOtherSkills(sampleSkills)
    render(<OtherSkillsView />)

    await waitFor(() => expect(screen.getAllByText('Docker Helper').length).toBeGreaterThan(0))
    fireEvent.click(screen.getByRole('button', { name: 'ai 1' }))

    expect(screen.getAllByText('Prompt Review').length).toBeGreaterThan(0)
    expect(screen.queryByText('Docker Helper')).toBeNull()
  })

  it('加载中显示加载状态', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise(() => {
            /* 保持 pending */
          }),
      ),
    )

    render(<OtherSkillsView />)
    expect(screen.getByText(/加载中/)).toBeInTheDocument()
  })

  it('获取数据失败时显示错误', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))))

    render(<OtherSkillsView />)
    await waitFor(() => expect(screen.getByText(/加载失败/)).toBeInTheDocument())
  })

  it('空数据时显示稳定空状态', async () => {
    mockOtherSkills([])
    render(<OtherSkillsView />)

    await waitFor(() => expect(screen.getByText('暂无其它技能')).toBeInTheDocument())
    expect(screen.getByText('选择一项其它技能查看详情')).toBeInTheDocument()
  })
})
