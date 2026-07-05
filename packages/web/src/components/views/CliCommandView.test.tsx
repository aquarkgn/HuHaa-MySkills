import { afterEach, describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'
import { CliCommandView } from './CliCommandView'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CliCommandView', () => {
  it('selectedBrand=null 时渲染全部 5 个 CLI 命令与搜索框', () => {
    render(<CliCommandView selectedBrand={null} />)

    expect(screen.getByRole('heading', { name: 'CLI 命令' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/搜索 flag/)).toBeInTheDocument()
    for (const brand of ['claude', 'code', 'codex', 'gstack', 'hermes']) {
      expect(screen.getByRole('heading', { name: brand })).toBeInTheDocument()
    }
  })

  it('selectedBrand=空字符串 兜底为"全部命令"（防止空串污染过滤）', () => {
    render(<CliCommandView selectedBrand={''} />)
    for (const brand of ['claude', 'code', 'codex', 'gstack', 'hermes']) {
      expect(screen.getByRole('heading', { name: brand })).toBeInTheDocument()
    }
  })

  it('selectedBrand=claude 时只渲染 claude 命令详情', () => {
    render(<CliCommandView selectedBrand="claude" />)
    // 标题显示「claude 命令」形式
    expect(screen.getByText('claude', { selector: 'span' })).toBeInTheDocument()
    // 只有 claude 命令卡片的 h2
    expect(screen.getByRole('heading', { name: 'claude' })).toBeInTheDocument()
    // 其它品牌不应出现
    expect(screen.queryByRole('heading', { name: 'code' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'hermes' })).toBeNull()
  })

  it('selectedBrand=null 时渲染全部命令', () => {
    render(<CliCommandView selectedBrand={null} />)
    for (const brand of ['claude', 'code', 'codex', 'gstack', 'hermes']) {
      expect(screen.getByRole('heading', { name: brand })).toBeInTheDocument()
    }
  })

  it('selectedBrand=claude 时搜索仍按 flag / 中文说明过滤（作用范围 = 当前品牌）', () => {
    render(<CliCommandView selectedBrand="claude" />)
    const search = screen.getByPlaceholderText(/搜索当前命令/)
    // 在 claude 范围内搜索一个真实存在的 flag（--add-dir）
    fireEvent.change(search, { target: { value: '--add-dir' } })
    expect(screen.getByRole('heading', { name: 'claude' })).toBeInTheDocument()
    expect(screen.getByText('--add-dir')).toBeInTheDocument()
    // 不应出现其它品牌的命令卡
    expect(screen.queryByRole('heading', { name: 'code' })).toBeNull()
    // 在 claude 范围内搜索一个不存在的关键词
    fireEvent.change(search, { target: { value: 'zzzzzzz' } })
    expect(screen.queryByRole('heading', { name: 'claude' })).toBeNull()
  })

  it('按 flag 名和中文说明搜索过滤结果（默认全量）', () => {
    render(<CliCommandView selectedBrand={null} />)

    const search = screen.getByPlaceholderText(/搜索 flag/)
    fireEvent.change(search, { target: { value: '--add-mcp' } })

    expect(screen.getByRole('heading', { name: 'code' })).toBeInTheDocument()
    expect(screen.getByText('--add-mcp')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'claude' })).not.toBeInTheDocument()

    fireEvent.change(search, { target: { value: '供应链审计' } })
    expect(screen.getByRole('heading', { name: 'hermes' })).toBeInTheDocument()
    expect(screen.getByText('security')).toBeInTheDocument()
  })

  it('支持折叠和展开分组', () => {
    render(<CliCommandView selectedBrand={null} />)

    const section = screen.getByRole('heading', { name: 'code' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    expect(within(section).getByText('--install-extension')).toBeInTheDocument()
    const button = within(section).getByRole('button', { name: /扩展管理/ })
    fireEvent.click(button)
    expect(within(section).queryByText('--install-extension')).not.toBeInTheDocument()
    fireEvent.click(button)
    expect(within(section).getByText('--install-extension')).toBeInTheDocument()
  })

  it('子命令以 tab 显示在命令卡片头部，点击后展示帮助详情', () => {
    render(<CliCommandView selectedBrand="codex" />)

    const section = screen.getByRole('heading', { name: 'codex' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    const contentTabs = within(section).getByRole('tablist', { name: /codex 内容切换/ })
    expect(contentTabs).toBeInTheDocument()
    const firstFlagGroupButton = within(section).getByRole('button', { name: /配置与特性开关/ })
    expect(
      Boolean(contentTabs.compareDocumentPosition(firstFlagGroupButton) & Node.DOCUMENT_POSITION_FOLLOWING),
    ).toBe(true)

    fireEvent.click(within(contentTabs).getByRole('tab', { name: /子命令/ }))
    expect(within(section).getByRole('tablist', { name: /codex 子命令/ })).toBeInTheDocument()
    expect(within(section).getByText(/选择一个子命令查看帮助详情/)).toBeInTheDocument()

    fireEvent.click(within(section).getAllByRole('tab').find((tab) => tab.textContent?.trim().startsWith('exec') && !tab.textContent.includes('exec-server'))!)

    expect(within(section).getByRole('heading', { name: 'codex exec' })).toBeInTheDocument()
    expect(within(section).getAllByText(/Usage: codex exec/).length).toBeGreaterThan(0)
    expect(within(section).getAllByText(/--sandbox/).length).toBeGreaterThan(0)
  })

  it('未采集详情的子命令显示 fallback，不阻塞查看摘要', () => {
    render(<CliCommandView selectedBrand="codex" />)

    const section = screen.getByRole('heading', { name: 'codex' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    fireEvent.click(within(section).getByRole('tab', { name: /子命令/ }))
    fireEvent.click(within(section).getByRole('tab', { name: /logout/ }))

    expect(within(section).getByText('logout', { selector: 'div' })).toBeInTheDocument()
    expect(within(section).getByText(/暂未采集详细帮助/)).toBeInTheDocument()
  })

  it('gstack list 子命令可通过 tab 查看帮助详情', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: async () => [] } as Response)))
    render(<CliCommandView selectedBrand="gstack" />)

    const section = screen.getByRole('heading', { name: 'gstack' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    fireEvent.click(within(section).getByRole('tab', { name: /子命令/ }))
    expect(within(section).getByRole('tablist', { name: /gstack 子命令/ })).toBeInTheDocument()
    fireEvent.click(within(section).getByRole('tab', { name: /^list/ }))

    expect(within(section).getByRole('heading', { name: 'gstack list' })).toBeInTheDocument()
    expect(within(section).getAllByText(/npx @garrytan\/gstack list/).length).toBeGreaterThan(0)
    expect(within(section).getAllByText('--host').length).toBeGreaterThan(0)
    await waitFor(() => expect(within(section).getByText('gstack 工具列表')).toBeInTheDocument())
  })


  it('原始 help tab 展示顶层命令 help 原文', () => {
    render(<CliCommandView selectedBrand="claude" />)

    const section = screen.getByRole('heading', { name: 'claude' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    const contentTabs = within(section).getByRole('tablist', { name: /claude 内容切换/ })
    fireEvent.click(within(contentTabs).getByRole('tab', { name: /原始 help/ }))

    expect(within(section).getByText('source/claude.cmd')).toBeInTheDocument()
    expect(within(section).getByText(/Usage: claude \[options\]/)).toBeInTheDocument()
  })

  it('兼容历史误拼 selectedBrand=gstach，并落到 gstack 命令页', () => {
    render(<CliCommandView selectedBrand="gstach" />)

    expect(screen.getByText('gstack', { selector: 'span' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'gstack' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'codex' })).not.toBeInTheDocument()
  })

  it('全局搜索能命中已采集的子命令帮助内容', () => {
    render(<CliCommandView selectedBrand={null} />)

    const search = screen.getByPlaceholderText(/搜索 flag/)
    fireEvent.change(search, { target: { value: 'CONNECTION_TOKEN_FILE' } })

    expect(screen.getByRole('heading', { name: 'code' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /^serve-web/ })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'claude' })).not.toBeInTheDocument()
  })


  it('非 gstack list 子命令不展示关联对象区域，也不请求技能接口', () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    render(<CliCommandView selectedBrand="gstack" />)
    const section = screen.getByRole('heading', { name: 'gstack' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    fireEvent.click(within(section).getByRole('tab', { name: /子命令/ }))
    fireEvent.click(within(section).getByRole('tab', { name: /^install/ }))

    expect(within(section).queryByText('gstack 工具列表')).not.toBeInTheDocument()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('gstack list 展示关联工具列表并支持中文和英文搜索', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url === '/api/skills') {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            {
              id: 'skill-qa',
              kind: 'skill',
              source: 'claude-code',
              name: 'qa',
              description: 'Systematically QA test a web application.',
              i18n: { zh: { description: '自动化 QA 测试 Web 应用。' } },
              paths: {
                abs: '/Users/mac/.claude/skills/gstack/qa/SKILL.md',
                rootKind: 'home',
              },
            },
          ]),
        } as Response)
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'not found' }) } as Response)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<CliCommandView selectedBrand="gstack" />)
    const section = screen.getByRole('heading', { name: 'gstack' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    fireEvent.click(within(section).getByRole('tab', { name: /子命令/ }))
    fireEvent.click(within(section).getByRole('tab', { name: /^list/ }))

    await waitFor(() => expect(within(section).getByText('gstack 工具列表')).toBeInTheDocument())
    expect(within(section).getByText('/qa')).toBeInTheDocument()
    expect(within(section).getByText('自动化 QA 测试 Web 应用。')).toBeInTheDocument()
    expect(within(section).getByText(/Systematically QA test/)).toBeInTheDocument()

    fireEvent.change(within(section).getByPlaceholderText(/搜索工具/), { target: { value: '自动化' } })
    expect(within(section).getByText('/qa')).toBeInTheDocument()

    fireEvent.change(within(section).getByPlaceholderText(/搜索工具/), { target: { value: 'Systematically' } })
    expect(within(section).getByText('/qa')).toBeInTheDocument()
  })

  it('展开 gstack 工具卡片后按需加载并展示 SKILL.md 关键字段', async () => {
    const fetchMock = vi.fn((url: string) => {
      if (url === '/api/skills') {
        return Promise.resolve({
          ok: true,
          json: async () => ([
            {
              id: 'skill-ceo',
              kind: 'skill',
              source: 'claude-code',
              name: 'plan-ceo-review',
              description: 'CEO/founder-mode plan review.',
              paths: {
                abs: '/Users/mac/.claude/skills/gstack/plan-ceo-review/SKILL.md',
                rootKind: 'home',
              },
            },
          ]),
        } as Response)
      }
      if (url === '/api/skills/skill-ceo') {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            id: 'skill-ceo',
            kind: 'skill',
            source: 'claude-code',
            name: 'plan-ceo-review',
            description: 'CEO/founder-mode plan review.',
            raw: `---
name: plan-ceo-review
allowed-tools:
  - Read
  - WebSearch
triggers:
  - think bigger
benefits-from: [office-hours]
---

## When to invoke this skill
Rethink the problem.
`,
          }),
        } as Response)
      }
      return Promise.resolve({ ok: false, json: async () => ({ error: 'not found' }) } as Response)
    })
    vi.stubGlobal('fetch', fetchMock)

    render(<CliCommandView selectedBrand="gstack" />)
    const section = screen.getByRole('heading', { name: 'gstack' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    fireEvent.click(within(section).getByRole('tab', { name: /子命令/ }))
    fireEvent.click(within(section).getByRole('tab', { name: /^list/ }))

    await waitFor(() => expect(within(section).getByText('/plan-ceo-review')).toBeInTheDocument())
    fireEvent.click(within(section).getByRole('button', { name: /\/plan-ceo-review/ }))

    await waitFor(() => expect(within(section).getByText('Rethink the problem.')).toBeInTheDocument())
    expect(within(section).getByText('think bigger')).toBeInTheDocument()
    expect(within(section).getByText('Read')).toBeInTheDocument()
    expect(within(section).getByText('WebSearch')).toBeInTheDocument()
    expect(within(section).getByText('office-hours')).toBeInTheDocument()
    expect(within(section).getByText('查看原始 SKILL.md')).toBeInTheDocument()
  })

  it('gstack list 关联对象加载失败时显示降级文案', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: false, json: async () => ({}) } as Response)))

    render(<CliCommandView selectedBrand="gstack" />)
    const section = screen.getByRole('heading', { name: 'gstack' }).closest('section')
    expect(section).toBeInTheDocument()
    if (!section) return

    fireEvent.click(within(section).getByRole('tab', { name: /子命令/ }))
    fireEvent.click(within(section).getByRole('tab', { name: /^list/ }))

    await waitFor(() => {
      expect(within(section).getByText(/关联对象加载失败/)).toBeInTheDocument()
      expect(within(section).getByText(/子命令 help 仍可正常查看/)).toBeInTheDocument()
    })
  })

})
