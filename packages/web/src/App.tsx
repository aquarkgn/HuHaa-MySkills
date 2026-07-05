import { useCallback, useEffect, useReducer, useState } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar, type ModuleKey } from '@/components/layout/Topbar'
import { DashboardView } from '@/components/views/DashboardView'
import { SkillsView } from '@/components/views/SkillsView'
import { SettingsView } from '@/components/views/SettingsView'
import { OtherSkillsView } from '@/components/views/OtherSkillsView'
import { CliCommandView } from '@/components/views/CliCommandView'
import { ComingSoon } from '@/components/ComingSoon'
import { useLiveReload } from '@/hooks/useLiveReload'
import { fetchSkills, fetchStats, reload } from '@/lib/api'
import type { SkillItem, Stats } from '@/types'

export type View = 'dashboard' | 'skills' | 'otherSkills' | 'settings' | 'cli'

export interface UIState {
  module: ModuleKey
  view: View
  editorFilter: string | null
  kindFilter: string | null
  query: string
  selectedId: string | null
  otherSkillsQuery: string
}

export type Action =
  | { type: 'module'; module: ModuleKey }
  | { type: 'dashboard' }
  | { type: 'settings' }
  | { type: 'otherSkills' }
  | { type: 'cli' }
  | { type: 'otherSkillsQuery'; query: string }
  | { type: 'editor'; key: string | null }
  | { type: 'query'; query: string }
  | { type: 'kind'; kind: string | null }
  | { type: 'select'; id: string }

export const initialState: UIState = {
  module: 'skills',
  view: 'skills',
  editorFilter: null,
  kindFilter: null,
  query: '',
  selectedId: null,
  otherSkillsQuery: '',
}

export function reducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case 'module':
      if (action.module === 'commands') return { ...state, module: 'commands', view: 'cli' }
      if (action.module === 'skills' && state.view === 'cli') return { ...state, module: 'skills', view: 'skills' }
      return { ...state, module: action.module }
    case 'dashboard':
      return { ...state, module: 'skills', view: 'dashboard' }
    case 'settings':
      return { ...state, module: 'skills', view: 'settings' }
    case 'otherSkills':
      return { ...state, module: 'skills', view: 'otherSkills' }
    case 'cli':
      return { ...state, module: 'commands', view: 'cli' }
    case 'otherSkillsQuery':
      return { ...state, otherSkillsQuery: action.query }
    case 'editor':
      // 切换来源：进入技能视图，重置 kind/选中
      return { ...state, view: 'skills', editorFilter: action.key, kindFilter: null, selectedId: null }
    case 'query':
      return { ...state, query: action.query }
    case 'kind':
      return { ...state, kindFilter: action.kind }
    case 'select':
      return { ...state, selectedId: action.id }
    default:
      return state
  }
}

export default function App() {
  const [items, setItems] = useState<SkillItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloading, setReloading] = useState(false)
  const [ui, dispatch] = useReducer(reducer, initialState)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [skills, s] = await Promise.all([fetchSkills(), fetchStats()])
      setItems(skills)
      setStats(s)
      // 默认选中第一个技能，进入即可看到详情
      if (skills.length > 0) {
        console.log('[App] load: select first, id=', skills[0].id)
        dispatch({ type: 'select', id: skills[0].id })
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '加载失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // SSE 静默刷新：文件变更时不闪「加载中」，只更新数据
  const refresh = useCallback(async () => {
    try {
      const [skills, s] = await Promise.all([fetchSkills(), fetchStats()])
      setItems(skills)
      setStats(s)
    } catch {
      // 静默：实时刷新失败不打断当前界面
    }
  }, [])
  useLiveReload(refresh)

  async function handleReload() {
    setReloading(true)
    try {
      await reload()
      await load()
    } finally {
      setReloading(false)
    }
  }

  function renderMain() {
    console.log('[App] renderMain view=', ui.view, 'selectedId=', ui.selectedId, 'items=', items.length, 'loading=', loading)
    if (ui.view === 'cli') return <CliCommandView />
    if (ui.module !== 'skills') {
      return <ComingSoon title={ui.module === 'commands' ? '命令' : '编辑器'} />
    }
    if (loading) return <p className="text-body-sm text-muted-foreground">加载中…</p>
    if (error) {
      return (
        <div className="detail border-destructive">
          <p className="text-body-sm text-destructive">加载失败：{error}</p>
        </div>
      )
    }
    if (ui.view === 'dashboard') return <DashboardView stats={stats} items={items} />
    if (ui.view === 'otherSkills')
      return (
        <OtherSkillsView
          query={ui.otherSkillsQuery}
          onQuery={(q) => dispatch({ type: 'otherSkillsQuery', query: q })}
          selectedId={ui.selectedId}
          onSelect={(id) => dispatch({ type: 'select', id })}
        />
      )
    if (ui.view === 'settings') return <SettingsView />
    return (
      <SkillsView
        items={items}
        editorFilter={ui.editorFilter}
        query={ui.query}
        onQuery={(q) => dispatch({ type: 'query', query: q })}
        kindFilter={ui.kindFilter}
        onKind={(k) => dispatch({ type: 'kind', kind: k })}
        selectedId={ui.selectedId}
        onSelect={(id) => dispatch({ type: 'select', id })}
      />
    )
  }

  return (
    <div className="app-shell">
      <Topbar
        module={ui.module}
        onModule={(m) => dispatch({ type: 'module', module: m })}
        onReload={handleReload}
        reloading={reloading}
      />
      <Sidebar
        view={ui.view}
        editorFilter={ui.editorFilter}
        stats={stats}
        onDashboard={() => dispatch({ type: 'dashboard' })}
        onSettings={() => dispatch({ type: 'settings' })}
        onOtherSkills={() => dispatch({ type: 'otherSkills' })}
        onCli={() => dispatch({ type: 'cli' })}
        onEditor={(key) => dispatch({ type: 'editor', key })}
      />
      <main className="main-pane">{renderMain()}</main>
    </div>
  )
}
