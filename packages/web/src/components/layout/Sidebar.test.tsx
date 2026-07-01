import { describe, it, expect, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Sidebar } from './Sidebar'
import type { Stats } from '@/types'

function statsWith(byEditor: Record<string, number>): Stats {
  const total = Object.values(byEditor).reduce((a, b) => a + b, 0)
  return {
    total,
    bySource: {},
    byEditor,
    byKind: {},
    byCategory: {},
    byBrand: {},
  }
}

const noop = () => {}

describe('Sidebar editor 导航（D2 + C6 临界缺口）', () => {
  it('渲染真实 editor 项，(none) 不作首项且标注「未分类」', () => {
    render(
      <Sidebar
        view="skills"
        editorFilter={null}
        stats={statsWith({ 'Claude Code': 3, Cursor: 1, '(none)': 2 })}
        onDashboard={noop}
        onSettings={noop}
        onOtherSkills={noop}
        onEditor={noop}
      />
    )
    // 真实 editor 出现
    expect(screen.getByText('Claude Code')).toBeInTheDocument()
    expect(screen.getByText('Cursor')).toBeInTheDocument()
    // (none) 桶渲染为「未分类」，绝不出现字面 "(none)"
    expect(screen.getByText('未分类')).toBeInTheDocument()
    expect(screen.queryByText('(none)')).toBeNull()
  })

  it('byEditor 全为 (none) 时不产出垃圾首项，只显示「未分类」', () => {
    render(
      <Sidebar
        view="skills"
        editorFilter={null}
        stats={statsWith({ '(none)': 5 })}
        onDashboard={noop}
        onSettings={noop}
        onOtherSkills={noop}
        onEditor={noop}
      />
    )
    expect(screen.queryByText('(none)')).toBeNull()
    expect(screen.getByText('未分类')).toBeInTheDocument()
  })

  it('点击 editor 项回传其 key', () => {
    const onEditor = vi.fn()
    render(
      <Sidebar
        view="skills"
        editorFilter={null}
        stats={statsWith({ 'Claude Code': 3 })}
        onDashboard={noop}
        onSettings={noop}
        onOtherSkills={noop}
        onEditor={onEditor}
      />
    )
    fireEvent.click(screen.getByText('Claude Code'))
    expect(onEditor).toHaveBeenCalledWith('Claude Code')
  })
})
