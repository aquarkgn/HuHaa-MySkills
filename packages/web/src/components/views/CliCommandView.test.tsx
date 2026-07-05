import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { CliCommandView } from './CliCommandView'

describe('CliCommandView', () => {
  it('selectedBrand=null 时渲染全部 5 个 CLI 命令与搜索框', () => {
    render(<CliCommandView selectedBrand={null} />)

    expect(screen.getByRole('heading', { name: 'CLI 命令' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/搜索 flag/)).toBeInTheDocument()
    for (const brand of ['claude', 'code', 'codex', 'gstach', 'hermes']) {
      expect(screen.getByRole('heading', { name: brand })).toBeInTheDocument()
    }
  })

  it('selectedBrand=空字符串 兜底为"全部命令"（防止空串污染过滤）', () => {
    render(<CliCommandView selectedBrand={''} />)
    for (const brand of ['claude', 'code', 'codex', 'gstach', 'hermes']) {
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
    for (const brand of ['claude', 'code', 'codex', 'gstach', 'hermes']) {
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
})
