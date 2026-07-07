import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clipboard,
  Command,
  Info,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  COMMANDS,
  getFlagCount,
  getSubcommandCount,
  getTotalFlagCount,
  getTotalSubcommandCount,
} from '@/lib/commands'
import { getSubcommandHelp, getSubcommandHelpSearchText } from '@/lib/commandHelp'
import type { CliCommand, CliCommandGroup, CliCommandSubcommand, CliSubcommandHelp } from '@/types'
import { CommandIcon } from './CommandIcon'
import { SubcommandRelatedItemsPanel } from './cli/SubcommandRelatedItemsPanel'

type CommandDetailTab = 'flags' | 'subcommands' | 'raw'

interface CliCommandViewProps {
  /**
   * 侧栏选中的命令品牌；`null` 表示「全部命令」。
   * UI 上 brand 始终非空字符串，但接口允许 null 以表达"未选中"。
   */
  selectedBrand: string | null
  query?: string
  onQuery?: (query: string) => void
  onSelectBrand?: (brand: string) => void
}

/** 是否在"已选中某品牌"的范围内。空字符串视作未选中（兜底） */
function isBrandSelected(brand: string | null | undefined): brand is string {
  return typeof brand === 'string' && brand.length > 0
}

function normalizeSelectedBrand(brand: string | null): string | null {
  if (!isBrandSelected(brand)) return null
  // 历史数据曾误写为 gstach；旧入口统一落到真实命令 gstack。
  return brand === 'gstach' ? 'gstack' : brand
}

function getSubcommandSearchText(command: CliCommand, subcommand: CliCommandSubcommand): string {
  const help = getSubcommandHelp(command.brand, subcommand.name)
  return [
    subcommand.name,
    subcommand.desc_zh,
    subcommand.helpStatus,
    help ? getSubcommandHelpSearchText(help) : undefined,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function getSearchText(command: CliCommand): string {
  return [
    command.brand,
    command.version,
    command.summary_zh,
    ...command.groups.flatMap((group) => [
      group.name_zh,
      group.source,
      ...group.flags.flatMap((flag) => [
        flag.name,
        flag.args,
        flag.desc_zh,
        flag.raw,
      ]),
    ]),
    ...(command.subcommands ?? []).map((subcommand) => getSubcommandSearchText(command, subcommand)),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

function filterCommand(command: CliCommand, query: string): CliCommand | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return command
  if (getSearchText(command).includes(normalized)) {
    const commandHit = [command.brand, command.version, command.summary_zh]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(normalized)
    const groups = command.groups
      .map((group): CliCommandGroup | null => {
        const groupHit = `${group.name_zh} ${group.source}`.toLowerCase().includes(normalized)
        const flags = groupHit || commandHit
          ? group.flags
          : group.flags.filter((flag) =>
            [flag.name, flag.args, flag.desc_zh, flag.raw]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(normalized)
          )
        return flags.length > 0 ? { ...group, flags } : null
      })
      .filter((group): group is CliCommandGroup => group !== null)
    const subcommands = commandHit
      ? command.subcommands
      : command.subcommands?.filter((subcommand) =>
        getSubcommandSearchText(command, subcommand).includes(normalized)
      )
    if (groups.length === 0 && (!subcommands || subcommands.length === 0)) return null
    return { ...command, groups, subcommands }
  }
  return null
}

function getHelpFlagCount(help: CliSubcommandHelp): number {
  return help.groups.reduce((total, group) => total + group.flags.length, 0)
}

function RawHelpPanel({ command }: { command: CliCommand }) {
  if (!command.raw) {
    return (
      <div className="border-b border-border bg-muted/20 px-4 py-4 text-caption text-muted-foreground">
        暂未保存该命令的原始 --help 文本。
      </div>
    )
  }

  return (
    <div className="border-b border-border bg-muted/20 px-4 py-4">
      <div className="mb-2 flex flex-wrap items-center gap-2 text-caption text-muted-foreground">
        <span className="font-semibold text-foreground">原始 help</span>
        {command.sourcePath && <span>{command.sourcePath}</span>}
        {command.capturedAt && <span>采集于 {command.capturedAt}</span>}
      </div>
      <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-md border border-border bg-background px-4 py-3 font-mono text-caption text-foreground">
        {command.raw}
      </pre>
    </div>
  )
}

function getDefaultCommandTab(command: CliCommand): CommandDetailTab {
  // 搜索命中子命令且 flag 分组被过滤为空时，自动落到子命令 Tab，避免卡片出现空内容。
  if (command.groups.length === 0 && (command.subcommands?.length ?? 0) > 0) return 'subcommands'
  if (command.groups.length === 0 && command.raw) return 'raw'
  return 'flags'
}

function CommandHeaderTabs({
  command,
  activeTab,
  onSelect,
}: {
  command: CliCommand
  activeTab: CommandDetailTab
  onSelect: (tab: CommandDetailTab) => void
}) {
  const tabs: Array<{ key: CommandDetailTab; label: string; count?: number }> = [
    { key: 'flags', label: 'Flags', count: getFlagCount(command) },
    { key: 'subcommands', label: '子命令', count: getSubcommandCount(command) },
    { key: 'raw', label: '原始 help' },
  ]

  return (
    <div role="tablist" aria-label={`${command.brand} 内容切换`} className="flex shrink-0 flex-wrap gap-2 text-caption">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key
        return (
          <button
            key={`${command.brand}:${tab.key}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.key)}
            className={cn(
              'rounded-full border px-3 py-1.5 transition-colors',
              isActive
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-muted-foreground hover:bg-muted/70 hover:text-foreground',
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && <span className="ml-1 font-mono">{tab.count}</span>}
          </button>
        )
      })}
    </div>
  )
}

function CommandOverview({
  commands,
  onSelectBrand,
}: {
  commands: CliCommand[]
  onSelectBrand?: (brand: string) => void
}) {
  return (
    <div className="grid gap-3 lg:grid-cols-2 2xl:grid-cols-3">
      {commands.map((command) => {
        const flags = getFlagCount(command)
        const subcommands = getSubcommandCount(command)
        const readySubcommands = command.subcommands?.filter((subcommand) => subcommand.helpStatus === 'ready').length ?? 0
        return (
          <section
            key={command.brand}
            className="rounded-md border border-border bg-card p-4 transition-colors hover:border-primary"
          >
            <div className="flex items-start gap-3">
              <CommandIcon brand={command.brand} iconBrand={command.iconBrand} />
              <div className="min-w-0 flex-1">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="font-mono text-h4 font-semibold text-foreground">{command.brand}</h2>
                  {command.version && (
                    <span className="rounded-sm bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                      v{command.version}
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-body-sm text-muted-foreground">
                  {command.summary_zh}
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-md bg-muted px-2 py-2">
                <div className="font-mono text-body-sm font-semibold text-foreground">{flags}</div>
                <div className="text-caption text-muted-foreground">Flags</div>
              </div>
              <div className="rounded-md bg-muted px-2 py-2">
                <div className="font-mono text-body-sm font-semibold text-foreground">{subcommands}</div>
                <div className="text-caption text-muted-foreground">子命令</div>
              </div>
              <div className="rounded-md bg-emerald-500/10 px-2 py-2">
                <div className="font-mono text-body-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  {readySubcommands}
                </div>
                <div className="text-caption text-muted-foreground">已采集</div>
              </div>
            </div>

            {onSelectBrand && (
              <button
                type="button"
                onClick={() => onSelectBrand(command.brand)}
                className="mt-4 inline-flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-caption font-medium text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary"
              >
                查看详情
                <ChevronRight size={14} />
              </button>
            )}
          </section>
        )
      })}
    </div>
  )
}

function CommandContextPanel({ command }: { command: CliCommand }) {
  const readySubcommands = command.subcommands?.filter((subcommand) => subcommand.helpStatus === 'ready').length ?? 0
  const missingSubcommands = command.subcommands?.filter((subcommand) => subcommand.helpStatus !== 'ready').length ?? 0

  async function copyCommandName(): Promise<void> {
    await navigator.clipboard?.writeText(command.brand)
  }

  return (
    <aside className="detail sticky top-0 flex max-h-full flex-col gap-5 overflow-y-auto">
      <div>
        <p className="text-caption font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          命令上下文
        </p>
        <div className="mt-3 flex items-start gap-3">
          <CommandIcon brand={command.brand} iconBrand={command.iconBrand} />
          <div className="min-w-0">
            <h3 className="font-mono text-body font-semibold text-foreground">{command.brand}</h3>
            <p className="mt-1 text-caption text-muted-foreground">{command.summary_zh}</p>
          </div>
        </div>
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-body-sm">
        <dt className="text-muted-foreground">Flags</dt>
        <dd className="font-mono text-caption">{getFlagCount(command)}</dd>
        <dt className="text-muted-foreground">子命令</dt>
        <dd className="font-mono text-caption">{getSubcommandCount(command)}</dd>
        <dt className="text-muted-foreground">已采集</dt>
        <dd className="font-mono text-caption">{readySubcommands}</dd>
        <dt className="text-muted-foreground">待补充</dt>
        <dd className="font-mono text-caption">{missingSubcommands}</dd>
      </dl>

      <div className="rounded-md border border-border bg-background px-3 py-3">
        <div className="mb-2 flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <Info size={14} />
          快速提示
        </div>
        <p className="text-body-sm text-foreground">先用搜索定位 flag 或子命令，再切换到原始 help 校对上下文。</p>
      </div>

      <button
        type="button"
        onClick={() => void copyCommandName()}
        className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-body-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Clipboard size={15} />
        复制命令名
      </button>
    </aside>
  )
}

function HelpPanel({ brand, subcommand }: { brand: string; subcommand: CliCommandSubcommand }) {
  const help = getSubcommandHelp(brand, subcommand.name)

  if (!help) {
    return (
      <>
        <div className="rounded-md border border-dashed border-border bg-background px-4 py-4">
          <div className="font-mono text-body-sm font-semibold text-foreground">{subcommand.name}</div>
          <p className="mt-1 text-body-sm text-muted-foreground">{subcommand.desc_zh}</p>
          <p className="mt-3 text-caption text-muted-foreground">
            该子命令暂未采集详细帮助。当前可查看摘要，后续补充 --help 详情。
          </p>
        </div>
        <SubcommandRelatedItemsPanel brand={brand} subcommand={subcommand.name} />
      </>
    )
  }

  return (
    <div className="rounded-md border border-border bg-background">
      <div className="border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-mono text-body-sm font-semibold text-foreground">
            {help.brand} {help.subcommand}
          </h3>
          <span className="rounded-sm bg-muted px-2 py-0.5 text-caption text-muted-foreground">
            {getHelpFlagCount(help)} 项
          </span>
        </div>
        <p className="mt-1 text-body-sm text-muted-foreground">{help.summary_zh}</p>
        {help.usage && (
          <pre className="mt-3 overflow-x-auto rounded-sm bg-muted px-3 py-2 font-mono text-caption text-foreground">
            {help.usage}
          </pre>
        )}
      </div>

      <div className="divide-y divide-border">
        {help.groups.map((group) => (
          <div key={`${help.brand}:${help.subcommand}:${group.name_zh}`} className="px-4 py-3">
            <div className="mb-2 flex items-center gap-2 text-caption font-semibold text-muted-foreground">
              <span>{group.name_zh}</span>
              <span className="rounded-sm bg-muted px-2 py-0.5">{group.flags.length}</span>
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              {group.flags.map((flag) => (
                <div
                  key={`${help.brand}:${help.subcommand}:${group.name_zh}:${flag.name}:${flag.args ?? ''}`}
                  className={cn(
                    'grid gap-2 border-b border-border px-3 py-3 last:border-b-0',
                    'lg:grid-cols-[minmax(160px,0.8fr)_minmax(0,1.4fr)]',
                  )}
                >
                  <div className="min-w-0">
                    <code className="break-words rounded-sm bg-muted px-1.5 py-0.5 font-mono text-caption text-primary">
                      {flag.name}
                    </code>
                    {flag.args && (
                      <div className="mt-1 break-words font-mono text-caption text-muted-foreground">
                        {flag.args}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-body-sm text-foreground">{flag.desc_zh}</p>
                    <p className="mt-1 break-words text-caption text-muted-foreground">{flag.raw}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {help.raw && (
        <details className="border-t border-border px-4 py-3 text-caption text-muted-foreground">
          <summary className="cursor-pointer select-none font-medium text-foreground">查看原始 help</summary>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-sm bg-muted px-3 py-2 font-mono">
            {help.raw}
          </pre>
        </details>
      )}

      <SubcommandRelatedItemsPanel brand={brand} subcommand={subcommand.name} />
    </div>
  )
}

function Subcommands({
  brand,
  subcommands,
  selectedName,
  onSelect,
}: {
  brand: string
  subcommands: CliCommandSubcommand[]
  selectedName?: string
  onSelect: (subcommandName: string) => void
}) {
  const [subcommandQuery, setSubcommandQuery] = useState('')
  const normalizedSubcommandQuery = subcommandQuery.trim().toLowerCase()
  const visibleSubcommands = normalizedSubcommandQuery
    ? subcommands.filter((subcommand) =>
      `${subcommand.name} ${subcommand.desc_zh}`.toLowerCase().includes(normalizedSubcommandQuery)
    )
    : subcommands

  if (subcommands.length === 0) return null

  const selectedExists = visibleSubcommands.some((subcommand) => subcommand.name === selectedName)
  const activeName = selectedExists ? selectedName : undefined
  const activeSubcommand = visibleSubcommands.find((subcommand) => subcommand.name === activeName)

  return (
    <div className="border-b border-border bg-muted/20 px-4 py-3">
      <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-caption font-semibold text-muted-foreground">
          <Command size={14} />
          <span>子命令</span>
          <span className="rounded-sm bg-muted px-2 py-0.5">{subcommands.length}</span>
        </div>
        <div className="relative w-full md:w-64">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder="过滤子命令…"
            value={subcommandQuery}
            onChange={(event) => setSubcommandQuery(event.target.value)}
            className="w-full rounded-md border border-input bg-background py-1.5 pl-8 pr-2 text-caption placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {visibleSubcommands.length === 0 ? (
        <div className="rounded-md border border-dashed border-border px-4 py-4 text-caption text-muted-foreground">
          没有匹配的子命令
        </div>
      ) : (
        <>
          <div
            role="tablist"
            aria-label={`${brand} 子命令`}
            className="mb-3 flex gap-2 overflow-x-auto pb-1"
          >
            {visibleSubcommands.map((subcommand) => {
              const help = getSubcommandHelp(brand, subcommand.name)
              const isActive = subcommand.name === activeName
              return (
                <button
                  key={`${brand}:${subcommand.name}`}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${brand}-${subcommand.name}-panel`}
                  onClick={() => onSelect(subcommand.name)}
                  className={cn(
                    'flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 font-mono text-caption transition-colors',
                    isActive
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted/70',
                  )}
                >
                  <span>{subcommand.name}</span>
                  <span
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      help ? 'bg-emerald-500' : 'bg-muted-foreground/50',
                    )}
                    aria-label={help ? '已采集帮助' : '暂无详细帮助'}
                  />
                </button>
              )
            })}
          </div>

          <div role="tabpanel" id={activeName ? `${brand}-${activeName}-panel` : undefined}>
            {activeSubcommand ? (
              <HelpPanel brand={brand} subcommand={activeSubcommand} />
            ) : (
              <div className="rounded-md border border-dashed border-border px-4 py-4 text-caption text-muted-foreground">
                选择一个子命令查看帮助详情。绿色圆点表示已采集 --help 详情。
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * CliCommandView：
 * - selectedBrand=null/undefined/'' → 展示全部命令
 * - selectedBrand='claude' → 只展示该品牌的命令详情
 * - 搜索只在当前展示范围内生效。
 */
export function CliCommandView({
  selectedBrand,
  query: controlledQuery,
  onQuery,
  onSelectBrand,
}: CliCommandViewProps) {
  const [internalQuery, setInternalQuery] = useState('')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [selectedSubcommands, setSelectedSubcommands] = useState<Record<string, string | undefined>>({})
  // 顶层内容 Tab 只控制当前命令卡片展示：Flags / 子命令 / 原始 help 三选一。
  const [selectedCommandTabs, setSelectedCommandTabs] = useState<Record<string, CommandDetailTab | undefined>>({})
  const query = controlledQuery ?? internalQuery

  // 1) 先按品牌过滤：侧栏选中「全部命令」或未选中时返回全量
  const normalizedSelectedBrand = normalizeSelectedBrand(selectedBrand)

  const scopedCommands = useMemo(() => {
    if (!normalizedSelectedBrand) return COMMANDS
    return COMMANDS.filter((command) => command.brand === normalizedSelectedBrand)
  }, [normalizedSelectedBrand])

  // 2) 再叠加搜索：搜索作用于当前可见范围（侧栏已过滤后的子集）
  const visibleCommands = useMemo(
    () => scopedCommands
      .map((command) => filterCommand(command, query))
      .filter((command): command is CliCommand => command !== null),
    [scopedCommands, query],
  )

  const totalFlags = getTotalFlagCount(scopedCommands)
  const totalSubcommands = getTotalSubcommandCount(scopedCommands)
  const isScoped = normalizedSelectedBrand !== null
  const scopedBrand = normalizedSelectedBrand ?? ''

  function toggleGroup(commandBrand: string, groupName: string) {
    const key = `${commandBrand}:${groupName}`
    setCollapsed((current) => {
      const next = new Set(current)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function selectSubcommand(commandBrand: string, subcommandName: string) {
    setSelectedSubcommands((current) => ({
      ...current,
      [commandBrand]: current[commandBrand] === subcommandName ? undefined : subcommandName,
    }))
  }

  function selectCommandTab(commandBrand: string, tab: CommandDetailTab) {
    setSelectedCommandTabs((current) => ({ ...current, [commandBrand]: tab }))
  }

  function updateQuery(nextQuery: string) {
    if (onQuery) {
      onQuery(nextQuery)
      return
    }
    setInternalQuery(nextQuery)
  }

  const showOverview = !isScoped && query.trim().length === 0
  const contextCommand = isScoped ? (visibleCommands[0] ?? scopedCommands[0] ?? null) : null

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <section className="rounded-md border border-border bg-card px-4 py-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-h4 font-semibold text-foreground">
            {isScoped ? (
              <span className="flex items-center gap-2">
                <span className="font-mono text-primary">{scopedBrand}</span>
                <span className="text-muted-foreground">命令手册</span>
              </span>
            ) : (
              'CLI 命令手册'
            )}
          </h1>
          <p className="mt-1 max-w-3xl text-body-sm text-muted-foreground">
            {isScoped ? (
              <>该品牌的 flag 与子命令详情，{totalFlags} 个 flag / {totalSubcommands} 个子命令。</>
            ) : (
              <>5 个常用 CLI 的能力地图，覆盖 {totalFlags} 个 flag 和 {totalSubcommands} 个子命令。</>
            )}
          </p>
        </div>
        <div className="relative w-full lg:w-80">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="search"
            placeholder={isScoped ? '搜索当前命令的 flag/子命令/说明…' : '搜索 flag、子命令、说明或命令…'}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            className="w-full rounded-md border border-input bg-background py-2 pl-9 pr-3 text-body-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        </div>
      </section>

      {visibleCommands.length === 0 ? (
        <div className="detail flex min-h-48 items-center justify-center">
          <p className="text-body-sm text-muted-foreground">没有匹配的命令能力</p>
        </div>
      ) : showOverview ? (
        <CommandOverview commands={visibleCommands} onSelectBrand={onSelectBrand} />
      ) : (
        <div className={cn('grid min-h-0 gap-4', isScoped && 'xl:grid-cols-[minmax(0,1fr)_300px]')}>
          <div className="space-y-4 pb-2">
            {visibleCommands.map((command) => {
              const activeCommandTab = selectedCommandTabs[command.brand] ?? getDefaultCommandTab(command)
              return (
                <section key={command.brand} className="overflow-hidden rounded-md border border-border bg-card">
                  <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <CommandIcon brand={command.brand} iconBrand={command.iconBrand} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-mono text-h4 font-semibold text-foreground">{command.brand}</h2>
                          {command.version && (
                            <span className="rounded-sm bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                              v{command.version}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-body-sm text-muted-foreground">{command.summary_zh}</p>
                      </div>
                    </div>
                    <CommandHeaderTabs
                      command={command}
                      activeTab={activeCommandTab}
                      onSelect={(tab) => selectCommandTab(command.brand, tab)}
                    />
                  </div>

                  {activeCommandTab === 'subcommands' && (
                    <Subcommands
                      brand={command.brand}
                      subcommands={command.subcommands ?? []}
                      selectedName={selectedSubcommands[command.brand]}
                      onSelect={(subcommandName) => selectSubcommand(command.brand, subcommandName)}
                    />
                  )}

                  {activeCommandTab === 'raw' && <RawHelpPanel command={command} />}

                  {activeCommandTab === 'flags' && command.groups.length > 0 && (
                    <div className="divide-y divide-border">
                      {command.groups.map((group) => {
                        const groupKey = `${command.brand}:${group.name_zh}`
                        const isCollapsed = collapsed.has(groupKey)
                        return (
                          <div key={groupKey}>
                            <button
                              type="button"
                              onClick={() => toggleGroup(command.brand, group.name_zh)}
                              className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/60"
                              aria-expanded={!isCollapsed}
                            >
                              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                              <span className="font-medium text-foreground">{group.name_zh}</span>
                              <span className="rounded-sm bg-muted px-2 py-0.5 text-caption text-muted-foreground">
                                {group.flags.length}
                              </span>
                              <span className="ml-auto text-caption text-muted-foreground">
                                {group.source === 'explicit' ? '原始分组' : '智能分组'}
                              </span>
                            </button>
                            {!isCollapsed && (
                              <div className="px-4 pb-4">
                                <div className="overflow-hidden rounded-md border border-border">
                                  {group.flags.map((flag) => (
                                    <div
                                      key={`${groupKey}:${flag.name}:${flag.args ?? ''}`}
                                      className={cn(
                                        'grid gap-2 border-b border-border bg-background px-3 py-3 last:border-b-0',
                                        'lg:grid-cols-[minmax(180px,0.9fr)_minmax(0,1.4fr)]',
                                      )}
                                    >
                                      <div className="min-w-0">
                                        <code className="break-words rounded-sm bg-muted px-1.5 py-0.5 font-mono text-caption text-primary">
                                          {flag.name}
                                        </code>
                                        {flag.args && (
                                          <div className="mt-1 break-words font-mono text-caption text-muted-foreground">
                                            {flag.args}
                                          </div>
                                        )}
                                      </div>
                                      <div className="min-w-0">
                                        <p className="text-body-sm text-foreground">{flag.desc_zh}</p>
                                        <p className="mt-1 break-words text-caption text-muted-foreground">
                                          {flag.raw}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </section>
              )
            })}
          </div>
          {contextCommand && (
            <section className="hidden xl:block">
              <CommandContextPanel command={contextCommand} />
            </section>
          )}
        </div>
      )}
    </div>
  )
}
