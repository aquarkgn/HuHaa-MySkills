import { useState } from 'react'
import { TerminalSquare } from 'lucide-react'

/**
 * 已知没有品牌 logo 的 brand：服务端 /api/icons 会返回 404。
 * 前端直接走 TerminalSquare fallback，避免无效请求。
 *
 * 注意：实际可用 brand 集合由服务端 icon-extractor 决定（通过 mdfind / plutil
 * 探测本机已安装应用），可能与这里列出的不同。运行时探测失败时由 onError 兜底。
 */
export const FALLBACK_ICON_BRANDS = new Set(['gstach', 'hermes'])

/** 'code' 在 commands.json 中代表 vscode，但 brand 名 'code' 也可能没有 logo */
function iconBrandForApi(brand: string): string {
  if (brand === 'code') return 'vscode'
  return brand
}

interface CommandIconProps {
  brand: string
  /** 容器像素尺寸（正方形）。默认 36（CliCommandView 主内容）。 */
  size?: number
}

/**
 * 命令品牌的 logo 组件：先尝试加载真实品牌图（/api/icons），失败则 fallback 到通用 TerminalSquare。
 * 提取为共享组件供 Sidebar（侧栏菜单）与 CliCommandView（主内容卡片）共用，保证两处视觉一致。
 */
export function CommandIcon({ brand, size = 36 }: CommandIconProps) {
  const [failed, setFailed] = useState(false)
  // 按比例缩放 img 与 fallback 图标
  const inner = Math.round(size * 0.78) // 28/36 ≈ 0.78
  if (failed || FALLBACK_ICON_BRANDS.has(brand)) {
    return (
      <span
        className="grid shrink-0 place-items-center rounded-md bg-muted text-muted-foreground"
        style={{ height: size, width: size }}
      >
        <TerminalSquare size={Math.round(size * 0.5)} />
      </span>
    )
  }
  return (
    <span
      className="grid shrink-0 place-items-center rounded-md bg-muted"
      style={{ height: size, width: size }}
    >
      <img
        src={`/api/icons/${encodeURIComponent(iconBrandForApi(brand))}?size=64`}
        alt=""
        width={inner}
        height={inner}
        loading="lazy"
        onError={() => setFailed(true)}
        className="rounded-[4px] object-contain"
        style={{ height: inner, width: inner }}
      />
    </span>
  )
}