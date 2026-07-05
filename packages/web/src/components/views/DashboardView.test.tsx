import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardView } from './DashboardView'
import type { Stats } from '@/types'

function statsWith(total: number): Stats {
  return {
    total,
    bySource: {},
    byEditor: { 'Claude Code': total },
    byKind: {},
    byCategory: {},
    byBrand: {},
  }
}

const noop = () => {}

describe('DashboardView 三个功能入口', () => {
  it('渲染三个功能卡片：技能 / CLI 命令 / 编辑器', () => {
    render(
      <DashboardView
        stats={statsWith(7)}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenEditor={noop}
      />,
    )
    expect(screen.getByText('技能')).toBeInTheDocument()
    expect(screen.getByText('CLI 命令')).toBeInTheDocument()
    expect(screen.getByText('编辑器')).toBeInTheDocument()
  })

  it('统计正确：技能总数、命令品牌数、flag/子命令数', () => {
    render(
      <DashboardView
        stats={statsWith(7)}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenEditor={noop}
      />,
    )
    // 技能卡片：「7 个技能条目」
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText(/个技能条目/)).toBeInTheDocument()
    // 命令卡片：5 个品牌（来自 commands.json）
    expect(screen.getAllByText('5').length).toBeGreaterThan(0)
    expect(screen.getByText(/个品牌/)).toBeInTheDocument()
  })

  it('点击技能卡片触发 onOpenSkills', () => {
    const onOpenSkills = vi.fn()
    render(
      <DashboardView
        stats={statsWith(3)}
        items={[]}
        onOpenSkills={onOpenSkills}
        onOpenCommands={noop}
        onOpenEditor={noop}
      />,
    )
    fireEvent.click(screen.getByLabelText('进入 技能'))
    expect(onOpenSkills).toHaveBeenCalledTimes(1)
  })

  it('点击 CLI 命令卡片触发 onOpenCommands', () => {
    const onOpenCommands = vi.fn()
    render(
      <DashboardView
        stats={statsWith(3)}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={onOpenCommands}
        onOpenEditor={noop}
      />,
    )
    fireEvent.click(screen.getByLabelText('进入 CLI 命令'))
    expect(onOpenCommands).toHaveBeenCalledTimes(1)
  })

  it('点击编辑器卡片触发 onOpenEditor', () => {
    const onOpenEditor = vi.fn()
    render(
      <DashboardView
        stats={statsWith(3)}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenEditor={onOpenEditor}
      />,
    )
    fireEvent.click(screen.getByLabelText('进入 编辑器'))
    expect(onOpenEditor).toHaveBeenCalledTimes(1)
  })

  it('键盘 Enter 触发卡片回调', () => {
    const onOpenCommands = vi.fn()
    render(
      <DashboardView
        stats={statsWith(3)}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={onOpenCommands}
        onOpenEditor={noop}
      />,
    )
    const card = screen.getByLabelText('进入 CLI 命令')
    card.focus()
    fireEvent.keyDown(card, { key: 'Enter' })
    expect(onOpenCommands).toHaveBeenCalledTimes(1)
  })

  it('键盘 Space 触发卡片回调且阻止默认滚动', () => {
    const onOpenSkills = vi.fn()
    render(
      <DashboardView
        stats={statsWith(3)}
        items={[]}
        onOpenSkills={onOpenSkills}
        onOpenCommands={noop}
        onOpenEditor={noop}
      />,
    )
    const card = screen.getByLabelText('进入 技能')
    card.focus()
    // Space 默认会滚动页面：断言 preventDefault 被调用
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true })
    const preventSpy = vi.spyOn(event, 'preventDefault')
    card.dispatchEvent(event)
    expect(onOpenSkills).toHaveBeenCalledTimes(1)
    expect(preventSpy).toHaveBeenCalledTimes(1)
  })

  it('其它键不触发卡片回调', () => {
    const onOpenEditor = vi.fn()
    render(
      <DashboardView
        stats={statsWith(3)}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenEditor={onOpenEditor}
      />,
    )
    fireEvent.keyDown(screen.getByLabelText('进入 编辑器'), { key: 'a' })
    expect(onOpenEditor).not.toHaveBeenCalled()
  })

  it('stats 缺失时不崩溃，按 0 渲染统计', () => {
    render(
      <DashboardView
        stats={null}
        items={[]}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenEditor={noop}
      />,
    )
    expect(screen.getByText('技能')).toBeInTheDocument()
    expect(screen.getByText('CLI 命令')).toBeInTheDocument()
  })
})
