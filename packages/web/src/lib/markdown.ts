import MarkdownIt from 'markdown-it'

// html:false → 源文本里的内联 HTML 被转义（防 XSS）；只输出 markdown-it 生成的安全标签。
// 代码块输出 <pre><code class="language-xxx">，由 index.css 的 .markdown-body 着色。
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: false,
  langPrefix: 'language-',
})

export function renderMarkdown(src: string | undefined | null): string {
  return md.render(src ?? '')
}
