import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/react'
import { OtherSkillsView } from './OtherSkillsView'

describe('OtherSkillsView', () => {
  it('应该渲染搜索框', () => {
    render(<OtherSkillsView />)
    expect(screen.getByPlaceholderText(/搜索其它技能/)).toBeInTheDocument()
  })

  it('应该显示分类标题', () => {
    render(<OtherSkillsView />)
    // 使用 getAllByText 获取所有匹配的元素
    expect(screen.getAllByText(/命令|编辑器|工具|AI 能力/)).toHaveLength(4)
  })

  it('应该支持搜索', () => {
    const { rerender } = render(<OtherSkillsView query="" />)
    rerender(<OtherSkillsView query="docker" />)
    expect(screen.queryByText(/docker/i)).toBeInTheDocument()
  })
})
