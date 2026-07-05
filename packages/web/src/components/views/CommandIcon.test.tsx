import { describe, it, expect } from 'vitest'
import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/react'
import { CommandIcon } from './CommandIcon'

describe('CommandIcon 品牌 logo', () => {
  it('有 logo 的 brand 渲染 <img src=/api/icons/{apiBrand}?size=64>', () => {
    const { container } = render(<CommandIcon brand="claude" />)
    const img = container.querySelector('img')
    expect(img).toBeTruthy()
    expect(img?.getAttribute('src')).toBe('/api/icons/claude?size=64')
    expect(img?.getAttribute('alt')).toBe('')
  })

  it("'code' brand 映射到 vscode", () => {
    const { container } = render(<CommandIcon brand="code" />)
    const img = container.querySelector('img')
    expect(img?.getAttribute('src')).toBe('/api/icons/vscode?size=64')
  })

  it('FALLBACK_ICON_BRANDS 内的 brand 直接渲染 TerminalSquare（svg），无 img', () => {
    const { container } = render(<CommandIcon brand="gstach" />)
    expect(container.querySelector('img')).toBeNull()
    // lucide-react 渲染为 svg.lucide-*，具体 className 取决于 lucide 版本；
    // 这里断言存在 svg 即可（TerminalSquare 是 svg）
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('size prop 控制容器尺寸', () => {
    const { container } = render(<CommandIcon brand="claude" size={20} />)
    const wrapper = container.firstElementChild as HTMLElement | null
    expect(wrapper?.style.height).toBe('20px')
    expect(wrapper?.style.width).toBe('20px')
  })
})