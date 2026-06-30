# 🔧 HuHaa-MySkills 前端重构计划 v2

> 路线决策记录 + 执行清单 + 分阶段路线
> 状态：**P0 基础脚手架已落地**；本计划经 `/plan-eng-review` 评审锁定，推进「新布局蓝图」与「v2 视觉系统」的完整重构
> 设计基准：[Frontend-Theme-Design.md](./Frontend-Theme-Design.md)（v2.0）
> 最后更新：2026-06-30（评审锁定版）

---

## 0. 评审锁定决策（/plan-eng-review，2026-06-30）

本节为最终执行依据，凡与下文旧描述冲突，以本节为准。Claude 评审与 Codex 外部评审**结论一致**。

| # | 决策 | 结论 | 依据 |
|---|------|------|------|
| **D2** | 侧栏/筛选的规范轴 | **用 `editor`**（`Stats.byEditor` 已预算），`kind` 降为列表内 chip 次筛选 | `brand` 是内容推断主题词（OpenAI/Cloudflare，`utils.mjs:149`）；`editor`="owning editor/tool surface, e.g. Hermes Agent, Claude Code, Cursor"（`types.d.ts`）才对应线框图 Claude/Hermes/Codex |
| **D3** | 仪表盘语义 | **技能聚合指标**（`total / byKind / byEditor / bySource / byCategory / parseError`），复用卡片视觉、**不照搬账号管理器** | 参考图 Cockpit Tools 是账号/中转站管理器；HuHaa 无「账号数」概念 |
| **D4** | 阶段顺序 + 测试 | **P2 与 P4 合并**（换外壳同时重建技能三段，零回退窗口）；**P1 接入 vitest + 把 `tsc --noEmit` 纳入 `verify`/CI**，每阶段随手写单测 | 搜索现居 `Topbar`（`App.tsx:73`），P2 单独换壳会让技能视图坏到 P4；`verify` 当前不跑 tsc，strict 错误漏网 |
| **D5** | dist 发布 | **P0 阻塞项**：本次加 `prepare`/`prepublishOnly` 构建钩子（或将 dist 纳入发布产物），保证 npm 用户装后即见新 UI；用户明确要求「彻底重构，现页面布局不符合基本目标」 | 服务器仅在 `dist/index.html` 存在时托管 SPA（`index.mjs:164`），dist 被 gitignore，无构建钩子 → 装后只见占位页 |

**评审同时纠正的事实（已并入下文）：**
- **C1** `verify.mjs:103` 只要求 CSS 含 `topbar`/`sidebar`/`detail` 三者**任一**（OR，非 AND），且只是子串冒烟，不校验布局正确性。
- **C2** `npm run verify` **不跑 `tsc`**（只 `build:web` + 后端单测，`verify.mjs:38`）→ D4 已把 tsc 纳入门禁。
- **C3** 「P7/P8」后端**已存在**：`/api/skills/:id`(raw)、`/api/copy`、`/api/open`、`/api/events`(SSE)、`/api/translate`（`index.mjs:182/200/215/236/257`）→ 这两阶段是**纯前端消费 + UX 状态**，非后端开发。
- **C4** 类型漂移：scanner 发 `kind:'mcp-tool'`（`index.mjs:81`）但 web `SkillKind` 无此值（`types.ts:4`）→ P1 修。
- **C5** `api.ts` `copy()` 类型 `'path'|'content'` 比后端窄，**`'content'` 后端无此 case → 400**（`index.mjs:352`）→ P8 修契约。
- **C6** `byEditor`/`byBrand` 有显式 `(none)` 桶（`index.mjs:451-456`）→ 侧栏/仪表盘须过滤或标注为「未分类」。

---

## I. 背景与现状

### 已落地（P0，见 git `8f6f882`）

仓库已从「两套并存空壳前端」收敛为单一 **Vite + React + Tailwind + shadcn 风格** 前端，落地于 `packages/web`：

```
packages/web/
├── index.html              # <div id="app"> + 防暗色闪烁内联脚本
├── vite.config.ts          # React 插件 / @ 别名 / dist 输出 / dev 代理 /api→11520
├── tailwind.config.ts      # 主题 token
└── src/
    ├── index.css           # CSS 变量(亮/暗) + 布局类(sidebar/topbar/detail/main-pane)
    ├── types.ts            # SkillItem / Stats（镜像后端 IR）
    ├── lib/{cn,api}.ts      # 类名合并 / 类型化 API 客户端
    ├── hooks/useTheme.ts    # 亮/暗主题切换 + 持久化
    ├── components/ui/       # button / card
    ├── components/layout/   # Sidebar（按 kind 过滤）/ Topbar（搜索 + 主题切换 + reload）
    └── App.tsx             # 两栏外壳：列表(Fuse.js 搜索) + 详情
```

### 与新蓝图的差距

| 维度 | 现状（P0） | 新蓝图目标 |
|------|-----------|-----------|
| **顶部** | Topbar 只放搜索 + 主题/刷新按钮 | **模块标签栏**：Logo + 技能 / 命令(待开发) / 编辑器(待开发) |
| **左侧栏** | 按 `kind`（skill/plugin/mcp/instruction）过滤的按钮 | **图标导航**：仪表盘 + 按 **`editor`**（Claude Code/Hermes Agent/Cursor/Codex…）+ 底部固定「设置」 |
| **内容区** | 固定为「列表 + 详情」两栏 | **三态**：仪表盘卡片网格 / 技能三段主从(搜索+列表+详情) / 设置分页 |
| **新页面** | 无 | **仪表盘**（技能聚合统计卡网格）、**设置**（分段标签页 + 设置项） |
| **视觉** | 蓝/琥珀、白底 | 柔和浅色、点阵画布、品牌色图标、`primary-soft` 选中胶囊 |

---

## II. 路线决策

### 技术栈（不变）

**Vite + React + Tailwind + shadcn 风格组件** — 沿用 P0 决策。理由：直接落地主题文档的设计体系；`vite build → dist → Fastify 静态托管` 链路不变，**服务器零改动**（API 已齐全，见 C3）；包体最小，最契合 CLI 工具。

### 架构约束（务必遵守）

1. **挂载节点 id 必须为 `app`** — `verify.mjs:91` 断言 `index.html` 含 `<div id="app"></div>`。
2. **保留 `topbar`/`sidebar`/`detail` 三个类名中至少其一** — `verify.mjs:103` 仅做子串冒烟（OR）。**本计划保留全部三者**（topbar=模块标签栏、sidebar=图标导航、detail=详情面板），并**升级 verify**断言新结构（见 P1/测试）。
3. **资源走 `/assets/*`，`base='/'`** — 与服务器 `/assets/*` 路由（`index.mjs:293`）一致，勿改 `assetsDir`。
4. **TypeScript strict、禁 `any`/`@ts-ignore`** — 见 CLAUDE.md；P1 起 `tsc --noEmit` 进 `verify` 门禁。
5. **前端 `types.ts` 与 `packages/scanner/src/types.d.ts` 同步** — 现有漂移（C4：缺 `mcp-tool`）P1 一并修。

### 状态与路由

- 模块切换（技能/命令/编辑器）+ 侧栏选择（仪表盘 / `editor` / 设置）用**轻量状态**（`useReducer`：`{ module, view, editorFilter, kindFilter, query, selectedId }`），不引入路由库。
- 选中 module/editor 持久化到 URL hash（服务器 `/*` 已回退 `index.html`，`index.mjs:320`，刷新/深链可用）。**可选增强**，非阻塞。
- 侧栏项由 `Stats.byEditor` **数据驱动**生成；**过滤 `(none)` 桶**或标注「未分类」（C6）。

---

## III. 信息架构落地

```
顶部模块标签栏 (topbar)
  ├─ 技能 (Skills)          ← 默认激活
  ├─ 命令 (待开发)          ← 占位禁用
  └─ 编辑器 (待开发)        ← 占位禁用

左侧图标导航栏 (sidebar)            轴 = editor（byEditor，过滤 (none)）
  ├─ 仪表盘                 → 内容区: 技能聚合统计卡网格
  ├─ Claude Code / Hermes Agent / Cursor / Codex …（数据驱动）→ 该 editor 的技能三段主从
  └─ 设置 (底部固定)        → 内容区: 设置分页

内容区 (main)
  ├─ DashboardView   技能聚合统计卡（total / byKind / byEditor / bySource / byCategory / parseError）
  ├─ SkillsView      搜索栏 + kind chip 次筛选 + SkillList + SkillDetail(detail)
  └─ SettingsView    分段标签页(通用/网络服务/数据管理/关于) + SettingRow
```

数据流（ASCII）：
```
Fastify /api/{skills,stats}  ──►  App useReducer state
                                   │  module × view × {editorFilter, kindFilter, query}
        ┌──────────────────────────┼───────────────────────────┐
   DashboardView               SkillsView                  SettingsView
   (Stats 聚合)        (Fuse(query) → editor=∧ → kind chip)   (本地配置)
                                   └─► 选中 id → /api/skills/:id (raw) → SkillDetail
```

---

## IV. 分阶段路线

| 阶段 | 内容 | 关键产出 | 状态 |
|------|------|---------|------|
| **P0 基础脚手架** | 清理旧栈 + Vite/React + 主题 token + 两栏外壳 + 列表/详情 + 搜索 | 见 §I | ✅ 已完成 |
| **P1 视觉系统 + 测试门禁** | v2.0 token（柔和浅色、`--color-sidebar`、`--color-primary-soft`、点阵画布、圆角/阴影/字号）；**接入 vitest**；**`tsc --noEmit` 纳入 `verify`**；**修 `types.ts` 漂移(C4)** | `index.css`/`tailwind.config.ts`/`vitest.config.ts`/`verify.mjs` 更新 | ⏳ 待办 |
| **P2+P4 三区外壳 + 技能三段（合并，D4）** | topbar→模块标签栏；sidebar→`editor` 图标导航(过滤 `(none)`)+底部设置；`App` 状态机；**同步重建** SkillsView(搜索+kind chip+列表+详情)，**不留回退窗口**；升级 verify 断言新结构 | 新 `Topbar`/`Sidebar`/`App`/`SkillsView`/`SkillListItem`/`SkillDetail` + 单测 | ⏳ 待办 |
| **P3 仪表盘** | `DashboardView` + `StatCard` + `lib/editors.ts`（`editor → {label,color,icon}`，**unknown 有兜底**）；消费 `Stats` **技能聚合指标**（非账号数） | 统计卡网格 + 单测 | ⏳ 待办 |
| **P5 设置页** | `SettingsView`：分段标签页 + `SettingRow` + **原生 `<select>`**（不做重抽象）；**先定持久化模型**（localStorage / 后续 `sources.yaml`）再做 UI；当前仅主题有真实状态 | 设置分页 + 单测 | ⏳ 待办 |
| **P6 待开发占位** | 命令 / 编辑器模块占位 + 禁用态 | `ComingSoon` 组件 | ⏳ 待办 |
| **P7 详情增强（纯前端）** | 消费**已存在**的 `/api/skills/:id` raw，markdown-it（已在 devDeps）渲染 + 代码高亮 | 富文本详情 | ⏳ 待办 |
| **P8 交互动作（纯前端 + 修契约）** | 接**已存在**的 `/api/copy`、`/api/open`、`/api/events`(SSE) 实时 reload；**修 `api.ts` copy 契约(C5)** 为 `path|dir|rel|name|raw|prompt` | 实时刷新 + 复制/打开 | ⏳ 待办 |
| **P0-pub 发布钩子（D5，阻塞）** | `package.json` 加 `prepare`/`prepublishOnly` 跑 `build:web`（或将 `packages/web/dist` 纳入 `files` 并预构建提交） | npm 用户装后即见新 UI | ⏳ 待办 |
| **P9 质量收尾** | 覆盖率 ≥ 80% 补齐、A11y(WCAG AA)、**响应式**（`md` 详情抽屉 + 移动侧栏，设计已述但需补状态）、构建分包 | 测试 + 优化 | ⏳ 待办 |

---

## V. 执行清单（近期）

### P1 视觉系统 + 测试门禁
- [ ] `index.css`：新增 `--color-sidebar`、`--color-primary-soft`（亮/暗），背景 `220 20% 98%`，border `220 16% 94%`
- [ ] `tailwind.config.ts`：补 `sidebar` / `primary-soft` 颜色映射
- [ ] 新增 `.canvas-dotted` 点阵纹理类（仅 main 画布）；卡片阴影 `shadow-sm`
- [ ] **安装并配置 vitest + @testing-library/react**；`package.json` `test` 脚本纳入前端
- [ ] **`verify.mjs` 增加 `tsc --noEmit`**（前端 strict 类型门禁）
- [ ] **修 `types.ts`**：`SkillKind` 补 `mcp-tool`，与 `scanner/types.d.ts` 对齐

### P2+P4 三区外壳 + 技能三段（合并）
- [ ] `index.css`：保留 `topbar/sidebar/detail` 类名（verify），sidebar 底 `--color-sidebar`
- [ ] `Topbar` → 模块标签栏（技能激活 / 命令·编辑器 待开发禁用）+ 右侧主题/刷新
- [ ] `Sidebar` → **editor 图标导航**（`byEditor` 数据驱动，**过滤/标注 `(none)`**）+ `mt-auto` 底部「设置」；选中态 `bg-primary-soft text-primary`
- [ ] `App` `useReducer` 状态机：`module × view × {editorFilter, kindFilter, query, selectedId}`
- [ ] `SkillsView`：搜索栏 + **kind chip 次筛选** + `SkillListItem` 列表 + `SkillDetail`（`detail` 类）
- [ ] **同一 PR 内技能视图保持可用**（不留回退窗口）；**升级 verify** 断言新结构存在
- [ ] 单测：editor 过滤含 `(none)`、kind chip × Fuse query、状态机切换

### P3 仪表盘
- [ ] `lib/editors.ts`：`editor → {label,color,icon}`，**unknown/缺失兜底**
- [ ] `StatCard`（图标 + 标签 + 大号数字 + 可选角标）
- [ ] `DashboardView`：响应式网格消费 `Stats` 的 **byKind/byEditor/bySource/parseError**；单测兜底/(none)

### P5 设置页
- [ ] **先定持久化模型**（localStorage，后续可桥接 `sources.yaml`）
- [ ] 分段标签页 + `SettingRow` + **原生 `<select>`**
- [ ] 通用项 UI：显示语言、应用主题（接 `useTheme`）、界面缩放、侧边栏布局

### P6 待开发占位
- [ ] `ComingSoon` 组件 + 模块标签禁用态

### P0-pub 发布钩子
- [ ] `package.json` 加 `prepare`/`prepublishOnly` → `npm run build:web`；本地 `npm pack --dry-run` 确认 `packages/web/dist` 在产物内

---

## VI. 验证方式

```bash
NODE_ENV=development npm install --include=dev   # 本机需显式带 dev 依赖

npm run build:web         # vite build → packages/web/dist
npm run verify            # P1 起：构建 + tsc --noEmit + 前端 vitest + 后端单测 + HTTP/API/静态冒烟
npm start                 # 启动 → http://localhost:11520
npm pack --dry-run        # P0-pub：确认 dist 在发布产物内
```

每阶段验收基线：`verify` 全绿（含 tsc + vitest）、11520 实际托管新 UI 并返回真实数据。

---

## VII. 已知遗留

- **本机 `NODE_ENV=production` + npm `omit=dev`**：默认 `npm install` 跳过构建工具链，需带 `--include=dev`。
- ~~发布产物未含 dist~~ → 已升级为 **P0-pub 阻塞项**（见 §0 D5）。
- 服务器 `index.mjs` 注释陈旧（"Vue SPA"）、`PHASE='P6'` 常量与 0.3.x 版本不符 — 顺手修，非阻塞。

---

## VIII. 评审必备产出

### NOT in scope（本次明确不做）
- **路由库**（react-router 等）—— 单用户本地工具，`useReducer` + URL hash 足够。
- **列表虚拟化** —— 数据量数十~数百，Fuse + 全量渲染无瓶颈；>1k 项再议。
- **`sources.yaml` 写回 / 网络服务设置真实生效** —— P5 仅做 UI + localStorage，配置落盘是后续独立工作。
- **i18n 框架** —— 现全中文，语言切换 UI 先占位。
- **scanner/server 重构** —— 后端 API 已满足前端，零改动。

### What already exists（复用，勿重建）
- **全部交互 API**：`/api/skills`、`/api/skills/:id`(raw)、`/api/stats`、`/api/reload`、`/api/events`(SSE)、`/api/copy`、`/api/open`、`/api/translate`（`index.mjs`）。
- **聚合统计**：`buildStats` 已产出 `byKind/byEditor/bySource/byCategory/byBrand`（`index.mjs:442`）→ 仪表盘直接消费。
- **主题切换**：`useTheme` + `index.html` 防闪烁脚本。
- **搜索**：Fuse.js 索引（`App.tsx:49`）→ 迁入 SkillsView，勿重写。
- **依赖已就位**：markdown-it、lucide-react、cva、tailwind-merge 均在 devDeps（`package.json`）。

### 失败模式（新代码路径）
| 代码路径 | 失败场景 | 有测试? | 有错误处理? | 用户可见? |
|---------|---------|--------|-----------|----------|
| `byEditor` 侧栏 | `(none)` 桶成为首项 → 垃圾导航 | P2 补 | 需过滤 | 否（静默错乱）→ **critical，必须 P2 处理** |
| `editor → icon/color` 映射 | unknown editor 无图标/色 | P3 补 | 需兜底 | 是（空白图标） |
| `/api/skills/:id` 拉 raw | 404 / 网络失败 | P7 补 | 需 try/catch + 占位 | 应显式报错 |
| `/api/copy` `what='content'` | 后端 400（C5） | P8 补 | 修契约 | 是（复制失败） |
| SSE `/api/events` | 断连不重连 | P8 补 | 需 onerror 重连 | 是（不再实时） |

**Critical gap：`(none)` 桶**——无测试 + 无过滤 + 静默错乱三者同时成立，列为 P2 必修。

### 并行化策略（git worktree）
| Lane | 步骤 | 触及模块 | 依赖 |
|------|------|---------|------|
| A | P1 视觉+测试门禁 | `index.css`/`tailwind`/`verify`/`types.ts` | — |
| B | P2+P4 外壳+技能三段 | `components/layout`、`App`、`SkillsView` | A（token/类型）|
| C | P3 仪表盘 | `DashboardView`/`lib/editors.ts` | A，软依赖 B 的状态机 |
| D | P5 设置 / P6 占位 | `SettingsView`/`ComingSoon` | B（外壳）|

执行：**A 先行** → B、C 可并行（都依赖 A；C 软依赖 B 的 `App` 状态机，建议 B 先落 `App` 骨架再分叉）→ D 最后。P0-pub 与 A 无冲突，可任意时点并入。**冲突点**：B 与 C 都可能动 `App.tsx`，建议 B 先定状态机契约。

### Implementation Tasks
源自本次评审发现，逐条可执行：

- [ ] **T1 (P1, human: ~1h / CC: ~10min)** — verify — `tsc --noEmit` 纳入 `npm run verify`
  - Surfaced by: 测试评审 / C2 — `verify.mjs:38` 只跑 build+后端单测
  - Files: `build/verify.mjs`、`package.json`
  - Verify: 故意写一处 TS 错误，`npm run verify` 应失败
- [ ] **T2 (P1, human: ~30min / CC: ~5min)** — types — `SkillKind` 补 `mcp-tool`
  - Surfaced by: 代码质量 / C4 — `scanner/index.mjs:81` vs `web/types.ts:4`
  - Files: `packages/web/src/types.ts`
  - Verify: `tsc --noEmit` 0 错误，列表渲染 mcp-tool 项不报类型问题
- [ ] **T3 (P2, human: ~2h / CC: ~20min)** — sidebar — `editor` 轴导航 + 过滤 `(none)`
  - Surfaced by: 架构 / D2、A3、C6 — `index.mjs:451`
  - Files: `components/layout/Sidebar.tsx`、`App.tsx`、`lib/editors.ts`
  - Verify: vitest——byEditor 含 `(none)` 时不渲染为首项
- [ ] **T4 (P1/P2, human: ~3h / CC: ~25min)** — test infra — vitest + 状态机/筛选单测
  - Surfaced by: 测试评审 / D4 — 前端 0 测试
  - Files: `vitest.config.ts`、`*.test.tsx`、`package.json`
  - Verify: `npm test` 跑前端用例
- [ ] **T5 (P3, human: ~2h / CC: ~20min)** — dashboard — 技能聚合 StatCard（非账号数）
  - Surfaced by: 架构 / D3、A4
  - Files: `DashboardView.tsx`、`StatCard.tsx`、`lib/editors.ts`
  - Verify: 卡片数据来自 `Stats.byKind/byEditor`，unknown editor 有兜底图标
- [ ] **T6 (P2, human: ~1.5h / CC: ~15min)** — verify — 断言新外壳结构
  - Surfaced by: 测试评审 / C1 — `verify.mjs:103` 弱子串 OR
  - Files: `build/verify.mjs`
  - Verify: 删除模块标签栏/sidebar 标记后 verify 失败
- [ ] **T7 (P8, human: ~30min / CC: ~5min)** — api — 修 `copy()` 契约
  - Surfaced by: 代码质量 / C5 — `api.ts:43` vs `index.mjs:352`
  - Files: `packages/web/src/lib/api.ts`
  - Verify: 复制各 `what` 值不再 400
- [ ] **T8 (P0-pub, human: ~1h / CC: ~10min)** — build — `prepare`/`prepublishOnly` 钩子
  - Surfaced by: 架构 / D5 — `index.mjs:164`、`.gitignore:3`
  - Files: `package.json`
  - Verify: `npm pack --dry-run` 含 `packages/web/dist/index.html`

---

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 | clean(absorbed) | outside voice, 12 findings, 0 tension |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 1 | issues_open→folded | 8 issues, 1 critical gap, all folded into D2–D5 + C1–C6 |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

- **CODEX:** outside voice (gpt-5.5, read-only) independently confirmed IA `brand`→`editor`, dashboard cargo-cult, P2/P4 sequencing, backend-already-done, verify overstated/no-tsc, `(none)` bucket, type drift, copy contract, publication blocker. Full 138KB output on disk.
- **CROSS-MODEL:** Claude review and Codex agree on all load-bearing findings — zero tension. Strongest signal the corrections are real.
- **VERDICT:** ENG CLEARED — plan locked. D2–D5 decided by user; C1–C6 folded. Critical gap (`(none)` bucket) assigned to P2 (T3) with test (T4).

NO UNRESOLVED DECISIONS
