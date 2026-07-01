import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { SkillDetail } from './SkillDetail'
import type { SkillItem } from '@/types'

vi.mock('@/lib/api', () => ({
  fetchSkillDetail: vi.fn(),
  copy: vi.fn(async () => ({ ok: true })),
  open: vi.fn(async () => ({ ok: true })),
}))
import { fetchSkillDetail } from '@/lib/api'

const item: SkillItem = {
  id: 'demo-1',
  kind: 'skill',
  source: 'claude-code',
  editor: 'Claude Code',
  name: 'autoplan',
  title: 'autoplan',
  description: 'Auto-review pipeline',
  paths: { abs: '/Users/x/.claude/skills/autoplan/SKILL.md', rootKind: 'home' },
  preview: '预览内容',
  updatedAt: '2026-01-01',
}

beforeEach(() => vi.clearAllMocks())

describe('SkillDetail（P7 markdown 正文）', () => {
  it('拉取 raw 并渲染 markdown 正文', async () => {
    vi.mocked(fetchSkillDetail).mockResolvedValue({
      ...item,
      raw: '## 正文标题\n\n正文段落内容',
    })
    render(<SkillDetail item={item} />)
    // 元数据
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
    expect(screen.getByText((item.paths as NonNullable<typeof item.paths>).abs)).toBeInTheDocument()
    expect(screen.getByText('复制正文')).toBeInTheDocument()
    // markdown 渲染（异步加载后出现）
    expect(await screen.findByText('正文标题')).toBeInTheDocument()
    expect(screen.getByText('正文段落内容')).toBeInTheDocument()
    expect(fetchSkillDetail).toHaveBeenCalledWith('demo-1')
  })

  it('raw 为空显示占位', async () => {
    vi.mocked(fetchSkillDetail).mockResolvedValue({ ...item, raw: '' })
    render(<SkillDetail item={item} />)
    expect(await screen.findByText('（无正文内容）')).toBeInTheDocument()
  })

  it('拉取失败显示错误', async () => {
    vi.mocked(fetchSkillDetail).mockRejectedValue(new Error('boom'))
    render(<SkillDetail item={item} />)
    expect(await screen.findByText('正文加载失败')).toBeInTheDocument()
  })
})
