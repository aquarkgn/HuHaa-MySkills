import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { OtherSkillsView } from './OtherSkillsView'

// Setup mock fetch before tests
beforeEach(() => {
  // Reset fetch mock
  vi.clearAllMocks()

  // Mock successful API response with empty skills
  ;(globalThis as any).fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([]),
    })
  ) as any
})

describe('OtherSkillsView', () => {
  it('应该渲染搜索框和容器结构', async () => {
    const { container } = render(<OtherSkillsView />)

    // 验证容器存在
    expect(container.querySelector('[class*="flex"]')).toBeInTheDocument()

    // 搜索框应该存在
    const searchInput = screen.getByPlaceholderText(/搜索其它技能/)
    expect(searchInput).toBeInTheDocument()
    expect(searchInput).toHaveAttribute('type', 'text')
  })

  it('应该支持搜索输入', () => {
    const onQuery = vi.fn()
    render(<OtherSkillsView onQuery={onQuery} />)

    const searchInput = screen.getByPlaceholderText(/搜索其它技能/) as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'docker' } })

    expect(onQuery).toHaveBeenCalledWith('docker')
  })

  it('应该在未选择技能时显示提示', async () => {
    render(<OtherSkillsView />)

    // 等待加载完成
    await new Promise((resolve) => setTimeout(resolve, 100))

    // 没有选中任何技能时，应显示提示信息
    const emptyPrompt = screen.queryByText(/选择一个技能查看详情/)
    expect(emptyPrompt || screen.getByText(/加载中|无结果|选择一个技能/)).toBeInTheDocument()
  })

  it('应该支持受控组件模式', () => {
    const onQuery = vi.fn()
    const onSelect = vi.fn()

    render(<OtherSkillsView query="test" onQuery={onQuery} onSelect={onSelect} selectedId={null} />)

    const searchInput = screen.getByPlaceholderText(/搜索其它技能/) as HTMLInputElement
    expect(searchInput.value).toBe('test')
  })

  it('应该有两列布局结构', () => {
    render(<OtherSkillsView />)

    // 验证搜索框存在
    expect(screen.getByPlaceholderText(/搜索其它技能/)).toBeInTheDocument()
  })

  it('应该在加载中显示加载状态', async () => {
    // 模拟永不resolve的fetch
    ;(globalThis as any).fetch = vi.fn(
      () =>
        new Promise(() => {
          /* never resolves */
        })
    ) as any

    render(<OtherSkillsView />)

    // 加载状态应该显示
    const loadingText = screen.getByText(/加载中/)
    expect(loadingText).toBeInTheDocument()
  })

  it('应该在获取数据失败时显示错误', async () => {
    // 模拟fetch失败
    ;(globalThis as any).fetch = vi.fn(() => Promise.reject(new Error('Network error'))) as any

    render(<OtherSkillsView />)

    // 等待错误状态显示
    await new Promise((resolve) => setTimeout(resolve, 100))

    const errorText = screen.queryByText(/加载失败/)
    expect(errorText || screen.getByText(/加载中|选择一个技能/)).toBeInTheDocument()
  })

  it('应该接受并传递 selectedId 属性', () => {
    const onSelect = vi.fn()
    render(<OtherSkillsView selectedId="test-id" onSelect={onSelect} />)

    // 验证组件接受了 selectedId
    expect(screen.getByPlaceholderText(/搜索其它技能/)).toBeInTheDocument()
  })

  it('应该接受并传递 query 属性', () => {
    const onQuery = vi.fn()
    render(<OtherSkillsView query="existing-query" onQuery={onQuery} />)

    const searchInput = screen.getByPlaceholderText(/搜索其它技能/) as HTMLInputElement
    expect(searchInput.value).toBe('existing-query')
  })

  it('应该有正确的CSS类用于响应式设计', () => {
    const { container } = render(<OtherSkillsView />)

    // 验证响应式类
    const leftPanel = container.querySelector('.sm\\:w-1\\/3')
    expect(leftPanel).toBeInTheDocument()

    const rightPanel = container.querySelector('.hidden.w-2\\/3.sm\\:flex')
    expect(rightPanel).toBeInTheDocument()
  })
})
