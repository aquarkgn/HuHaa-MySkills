import { useState } from 'react'
import { cn } from '@/lib/cn'
import { useTheme } from '@/hooks/useTheme'

const TABS = ['通用', '网络服务', '数据管理', '关于'] as const
type Tab = (typeof TABS)[number]

function Row({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <div>
        <p className="text-body-sm text-foreground">{title}</p>
        <p className="text-caption text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  )
}

const selectCls =
  'h-9 rounded-md border border-border bg-input px-2 text-body-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60'

export function SettingsView() {
  const [tab, setTab] = useState<Tab>('通用')
  const { theme, toggle } = useTheme()

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-h3 font-bold text-foreground">应用设置</h1>
        <div className="inline-flex rounded-md bg-muted p-1 text-body-sm">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'rounded-sm px-3 py-1 transition-colors',
                tab === t ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card px-5">
        {tab === '通用' && (
          <>
            <Row title="显示语言" subtitle="选择界面的显示语言">
              <select className={selectCls} defaultValue="zh-CN" disabled>
                <option value="zh-CN">简体中文</option>
              </select>
            </Row>
            <Row title="应用主题" subtitle="切换深色或浅色模式">
              <select
                className={selectCls}
                value={theme}
                onChange={(e) => {
                  if (e.target.value !== theme) toggle()
                }}
              >
                <option value="light">浅色</option>
                <option value="dark">深色</option>
              </select>
            </Row>
            <Row title="界面缩放" subtitle="调整界面缩放比例（待接入）">
              <select className={selectCls} defaultValue="100" disabled>
                <option value="100">100%</option>
              </select>
            </Row>
            <Row title="侧边栏布局" subtitle="切换图标导航或经典布局（待接入）">
              <select className={selectCls} defaultValue="icon" disabled>
                <option value="icon">图标导航</option>
              </select>
            </Row>
          </>
        )}
        {tab !== '通用' && (
          <p className="py-10 text-center text-body-sm text-muted-foreground">
            「{tab}」待开发，敬请期待
          </p>
        )}
      </div>
    </div>
  )
}
