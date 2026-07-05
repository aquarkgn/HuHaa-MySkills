import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { CliCommandView } from './CliCommandView'

describe('CliCommandView', () => {
  it('渲染 5 个 CLI 命令和搜索框', () => {
    render(<CliCommandView />)

    expect(screen.getByRole('heading', { name: 'CLI 命令' })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/搜索 flag/)).toBeInTheDocument()
    for (const brand of ['claude', 'code', 'codex', 'gstach', 'hermes']) {
      expect(screen.getByRole('heading', { name: brand })).toBeInTheDocument()
    }
  })

  it('按 flag 名和中文说明搜索过滤结果', () => {
    render(<CliCommandView />)

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
    render(<CliCommandView />)

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
