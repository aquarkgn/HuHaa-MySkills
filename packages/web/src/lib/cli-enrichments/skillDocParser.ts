export interface ParsedSkillFrontmatter {
  triggers?: string[]
  allowedTools?: string[]
  benefitsFrom?: string[]
}

const FRONTMATTER_BOUNDARY = /^---\s*$/m

function normalizeListValue(value: string): string[] {
  const trimmed = value.trim()
  if (!trimmed) return []
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    return trimmed
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean)
  }
  return [trimmed.replace(/^['"]|['"]$/g, '')].filter(Boolean)
}

function readList(lines: string[], startIndex: number): { values: string[]; nextIndex: number } {
  const values: string[] = []
  let index = startIndex + 1
  while (index < lines.length) {
    const line = lines[index]
    if (!/^\s+/.test(line) && /^[A-Za-z0-9_-]+\s*:/.test(line)) break
    const itemMatch = line.match(/^\s*-\s*(.+?)\s*$/)
    if (itemMatch) values.push(itemMatch[1].replace(/^['"]|['"]$/g, ''))
    index += 1
  }
  return { values: values.filter(Boolean), nextIndex: index }
}

function getFrontmatterBlock(raw: string): string | undefined {
  if (!raw.startsWith('---')) return undefined
  const first = raw.search(FRONTMATTER_BOUNDARY)
  if (first !== 0) return undefined
  const rest = raw.slice(3)
  const secondMatch = rest.match(/\n---\s*(?:\n|$)/)
  if (!secondMatch || secondMatch.index === undefined) return undefined
  return rest.slice(0, secondMatch.index).trim()
}

/**
 * 轻量解析 SKILL.md frontmatter 中本功能需要的列表字段。
 * 不追求完整 YAML 覆盖，解析失败时返回空对象，避免详情面板阻塞展示。
 */
export function parseSkillFrontmatter(raw: string | undefined): ParsedSkillFrontmatter {
  if (!raw) return {}
  const block = getFrontmatterBlock(raw)
  if (!block) return {}

  const result: ParsedSkillFrontmatter = {}
  const lines = block.split(/\r?\n/)
  let index = 0
  while (index < lines.length) {
    const line = lines[index]
    const match = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*?)\s*$/)
    if (!match) {
      index += 1
      continue
    }

    const [, key, value] = match
    const assign = (values: string[]) => {
      if (values.length === 0) return
      if (key === 'triggers') result.triggers = values
      if (key === 'allowed-tools') result.allowedTools = values
      if (key === 'benefits-from') result.benefitsFrom = values
    }

    if (key === 'triggers' || key === 'allowed-tools' || key === 'benefits-from') {
      if (value) {
        assign(normalizeListValue(value))
        index += 1
      } else {
        const parsed = readList(lines, index)
        assign(parsed.values)
        index = parsed.nextIndex
      }
      continue
    }

    index += 1
  }

  return result
}

function normalizeHeadingText(text: string): string {
  return text.trim().replace(/#+$/, '').trim().toLowerCase()
}

/** 提取指定 Markdown 标题下直到下一个同级或更高级标题前的正文。 */
export function extractMarkdownSection(raw: string | undefined, heading: string): string | undefined {
  if (!raw) return undefined
  const target = normalizeHeadingText(heading)
  const lines = raw.split(/\r?\n/)
  let startIndex = -1
  let level = 0

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/)
    if (!match) continue
    if (normalizeHeadingText(match[2]) === target) {
      startIndex = index + 1
      level = match[1].length
      break
    }
  }

  if (startIndex === -1) return undefined

  const body: string[] = []
  for (let index = startIndex; index < lines.length; index += 1) {
    const match = lines[index].match(/^(#{1,6})\s+(.+?)\s*$/)
    if (match && match[1].length <= level) break
    body.push(lines[index])
  }

  const section = body.join('\n').trim()
  return section.length > 0 ? section : undefined
}
