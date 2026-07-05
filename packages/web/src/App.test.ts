import { describe, it, expect } from 'vitest'
import { reducer, initialState, type UIState } from './App'

describe('App reducer 状态机（module × view）', () => {
  it('editor 动作进入技能视图并重置 kind/选中（避免脏筛选）', () => {
    const dirty: UIState = {
      ...initialState,
      view: 'dashboard',
      kindFilter: 'skill',
      selectedId: 'abc',
    }
    const next = reducer(dirty, { type: 'editor', key: 'Cursor' })
    expect(next.view).toBe('skills')
    expect(next.editorFilter).toBe('Cursor')
    expect(next.kindFilter).toBeNull()
    expect(next.selectedId).toBeNull()
  })

  it('editor=null 表示全部技能', () => {
    expect(reducer(initialState, { type: 'editor', key: null }).editorFilter).toBeNull()
  })

  it('dashboard / settings 切换视图', () => {
    expect(reducer(initialState, { type: 'settings' }).view).toBe('settings')
    const back = reducer(reducer(initialState, { type: 'settings' }), { type: 'dashboard' })
    expect(back.view).toBe('dashboard')
  })

  it('query / kind / select 只改对应字段', () => {
    expect(reducer(initialState, { type: 'query', query: 'mcp' }).query).toBe('mcp')
    expect(reducer(initialState, { type: 'kind', kind: 'skill' }).kindFilter).toBe('skill')
    expect(reducer(initialState, { type: 'select', id: 'x1' }).selectedId).toBe('x1')
  })

  it('module 切换不丢其它状态', () => {
    const s = reducer({ ...initialState, query: 'q' }, { type: 'module', module: 'commands' })
    expect(s.module).toBe('commands')
    expect(s.view).toBe('cli')
    expect(s.query).toBe('q')
  })

  it('cli 动作进入命令模块，切回 skills 时回到技能视图', () => {
    const cli = reducer(initialState, { type: 'cli' })
    expect(cli.module).toBe('commands')
    expect(cli.view).toBe('cli')
    const skills = reducer(cli, { type: 'module', module: 'skills' })
    expect(skills.module).toBe('skills')
    expect(skills.view).toBe('skills')
  })
})
