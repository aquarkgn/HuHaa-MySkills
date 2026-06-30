import { describe, it, expect } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('渲染标题与段落', () => {
    expect(renderMarkdown('# Hi')).toContain('<h1>Hi</h1>')
    expect(renderMarkdown('hello')).toContain('<p>hello</p>')
  })

  it('围栏代码块带 language- 前缀', () => {
    const html = renderMarkdown('```js\nconst a = 1\n```')
    expect(html).toContain('<pre>')
    expect(html).toContain('language-js')
  })

  it('转义内联 HTML（防 XSS，html:false）', () => {
    const html = renderMarkdown('<script>alert(1)</script>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })

  it('空/undefined 输入返回空串', () => {
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown(undefined)).toBe('')
    expect(renderMarkdown(null)).toBe('')
  })
})
