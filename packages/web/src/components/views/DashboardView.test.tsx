import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DashboardView } from './DashboardView'
import type { SkillItem, Stats } from '@/types'

function statsWith(total: number): Stats {
  return {
    total,
    bySource: {},
    byEditor: { 'Claude Code': total - 2, Cursor: 2 },
    byKind: { skill: total - 1, mcp: 1 },
    byCategory: {},
    byBrand: {},
  }
}

const sampleItems: SkillItem[] = [
  {
    id: 'skill-a',
    kind: 'skill',
    source: 'Claude Code',
    name: 'plan-devex-review',
    title: '开发体验评审',
    description: 'Review developer experience plans.',
    updatedAt: '2026-07-05T10:00:00.000Z',
  },
  {
    id: 'skill-b',
    kind: 'mcp',
    source: 'Cursor',
    name: 'browser-tools',
    description: 'Browser automation tools.',
    updatedAt: '2026-07-04T10:00:00.000Z',
  },
]

const noop = () => {}

describe('DashboardView 发布级首页', () => {
  it('渲染品牌、状态区和关键指标', () => {
    render(
      <DashboardView
        stats={statsWith(7)}
        items={sampleItems}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenOtherSkills={noop}
      />,
    )

    expect(screen.getByText('呼哈哈-技能助手')).toBeInTheDocument()
    expect(screen.getByText('本地工作台已就绪')).toBeInTheDocument()
    expect(screen.getByText('技能条目')).toBeInTheDocument()
    expect(screen.getByText('命令品牌')).toBeInTheDocument()
    expect(screen.getByText('Flags')).toBeInTheDocument()
    expect(screen.getByText('子命令')).toBeInTheDocument()
  })

  it('继续工作区提供三个真实入口', () => {
    render(
      <DashboardView
        stats={statsWith(7)}
        items={sampleItems}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenOtherSkills={noop}
      />,
    )

    expect(screen.getByText('继续工作')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '打开技能库' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查看命令手册' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '查看其它技能' })).toBeInTheDocument()
  })

  it('点击入口触发对应回调', () => {
    const onOpenSkills = vi.fn()
    const onOpenCommands = vi.fn()
    const onOpenOtherSkills = vi.fn()

    render(
      <DashboardView
        stats={statsWith(3)}
        items={sampleItems}
        onOpenSkills={onOpenSkills}
        onOpenCommands={onOpenCommands}
        onOpenOtherSkills={onOpenOtherSkills}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: '打开技能库' }))
    fireEvent.click(screen.getByRole('button', { name: '查看命令手册' }))
    fireEvent.click(screen.getByRole('button', { name: '查看其它技能' }))

    expect(onOpenSkills).toHaveBeenCalledTimes(1)
    expect(onOpenCommands).toHaveBeenCalledTimes(1)
    expect(onOpenOtherSkills).toHaveBeenCalledTimes(1)
  })

  it('展示来源健康、最近更新和推荐下一步', () => {
    render(
      <DashboardView
        stats={statsWith(7)}
        items={sampleItems}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenOtherSkills={noop}
      />,
    )

    expect(screen.getByText('来源健康')).toBeInTheDocument()
    expect(screen.getAllByText('Claude Code').length).toBeGreaterThan(0)
    expect(screen.getByText('最近更新')).toBeInTheDocument()
    expect(screen.getByText('开发体验评审')).toBeInTheDocument()
    expect(screen.getByText('推荐下一步')).toBeInTheDocument()
    expect(screen.getAllByText('技能').length).toBeGreaterThan(0)
  })

  it('stats 缺失时不崩溃，使用 items 兜底统计', () => {
    render(
      <DashboardView
        stats={null}
        items={sampleItems}
        onOpenSkills={noop}
        onOpenCommands={noop}
        onOpenOtherSkills={noop}
      />,
    )

    expect(screen.getByText('呼哈哈-技能助手')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('暂无来源统计，等待下一次扫描。')).toBeInTheDocument()
  })
})
