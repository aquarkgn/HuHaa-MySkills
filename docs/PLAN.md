# HuHaa-MySkills — 本地 Skill / Plugin / MCP 聚合中枢

按 gstack/plan-eng-review 评审骨架编写（架构 / 代码质量 / 测试 / 性能 / NOT-in-scope / 必填输出），用于实施前锁定方案。

---

## 0. 项目定位（一句话）

一个本地纯 Node.js 项目，`npm install && npm start` 起 `http://localhost:11520`，把散落在 Hermes / Claude Code / Codex / Cursor / Obsidian / 各项目根目录的「skill / plugin / MCP / 部署 RUNBOOK」**聚合成一个浏览器目录**，按 工具 → 项目 → 目录 → 产品/品牌 四级浏览，详情页提供描述、参数、用法示例、**一键复制路径 / 复制原文 / 在编辑器中打开**，让"想用某技能 → 切回 Cursor 粘贴上下文"这条路从「翻 5 个目录 + grep」收敛成「11520 搜一下点复制」。

---

## 1. 架构评审（Architecture）

### 1.1 顶层组件

```
HuHaa-MySkills/
├── packages/
│   ├── scanner/        # 扫描器：多源 → 统一 IR
│   ├── server/         # Fastify HTTP + SSE 热更新
│   └── web/            # Vite + Vue3 SPA
├── config/
│   └── sources.yaml    # 用户声明的扫描源
├── data/
│   └── cache.json      # IR 缓存（gitignore）
└── package.json        # workspaces 单仓
```

不拆 monorepo 的多包发布，只拿 npm workspaces 做内部代码隔离 —— 用户口径"最简能跑"，单仓单 `npm start`。

### 1.2 数据流

```
sources.yaml ──┐
               ├─→ Scanner ──→ Adapters ──→ 统一 IR (JSON) ──┐
fs walkers ────┘   (per-type)    │                          ├─→ cache.json
                                 ▼                          │
                             chokidar watch ────── SSE ────→ Browser SPA
                                                            └─→ /api/skills
                                                                /api/copy
                                                                /api/open
```

关键设计：**所有源都被适配器规范化成同一份 IR**，前端只认 IR，不关心源是 Hermes 还是 Cursor。

### 1.3 统一 IR（Intermediate Representation）

```ts
type SkillItem = {
  id: string;              // sha1(absPath)，稳定
  kind: 'skill' | 'plugin' | 'mcp' | 'runbook' | 'agent-rule';
  source: 'hermes' | 'claude-code' | 'codex' | 'cursor' | 'obsidian' | 'project' | 'mcp-config';
  name: string;            // frontmatter.name 或 文件名
  title?: string;          // 人类可读
  description?: string;
  category?: string;       // 例：devops, mlops/inference
  brand?: string;          // 例：OpenAI, Anthropic, Google, Cloudflare（从 description / 路径推断）
  product?: string;        // 例：new-api, frp, vLLM
  triggers?: string[];     // when_to_use / triggers / aliases
  params?: ParamSpec[];    // MCP tools 才有；skill 一般为空
  tags?: string[];
  paths: {
    abs: string;           // 绝对路径（复制按钮用）
    rel?: string;          // 相对项目根
    rootKind: 'home' | 'project' | 'icloud';
  };
  preview: string;         // 截前 N 行 markdown body
  raw: string;             // 完整文件原文（详情页 lazy load）
  links?: { label: string; url: string }[];
  updatedAt: string;       // ISO
};
```

### 1.4 适配器矩阵（决定能聚合到什么）

| Adapter        | 扫描路径                                                                 | 解析                                          | kind                |
|----------------|--------------------------------------------------------------------------|-----------------------------------------------|---------------------|
| hermes         | `~/.hermes/skills/**/SKILL.md`，`~/.hermes/profiles/*/skills/**`         | YAML frontmatter + body                       | skill               |
| claude-code    | `~/.claude/skills/**/SKILL.md`                                           | YAML frontmatter + body                       | skill               |
| codex-agents   | 工程根 `AGENTS.md`，`~/.codex/AGENTS.md`                                 | 纯 markdown，h1/h2 切段                       | agent-rule          |
| cursor-rules   | 工程根 `.cursorrules`，`.cursor/rules/*.mdc`                             | mdc frontmatter + body                        | agent-rule          |
| claude-md      | 工程根 `CLAUDE.md`                                                       | 纯 markdown                                   | agent-rule          |
| mcp-config     | `~/.cursor/mcp.json`，`~/.codex/config.toml [mcp_servers]`，`~/Library/Application Support/Claude/claude_desktop_config.json`，`~/.hermes/config.yaml mcp:` | JSON / TOML / YAML 解析出 servers + tools | mcp                 |
| hermes-plugin  | `~/.hermes/plugins/**/manifest.*`                                        | manifest.json/yaml                            | plugin              |
| project-runbook| `**/docs/RUNBOOK-*.md`（按 sources.yaml 声明的项目根）                  | 纯 markdown                                   | runbook             |
| obsidian       | 用户声明 vault 路径下打了 `#skill` 标签的 note                           | frontmatter + tags                            | skill               |

`sources.yaml` 默认开 hermes / claude-code / mcp-config，其他要用户白名单具体项目根（避免误扫整个磁盘）。

### 1.5 单一职责边界

- **Scanner** 只产 IR，不碰 HTTP。
- **Server** 只读 IR + 提供 API + 静态文件 + SSE，不解析任何源文件。
- **Web** 只渲染 IR + 调三个 endpoint：`/api/skills`、`/api/copy`、`/api/open`。
- 复制路径走 `/api/copy?path=...` → 后端 `pbcopy`（macOS）/ `clip`（win）/ `xclip`（linux），**不**靠浏览器 `navigator.clipboard`（HTTP 在非 localhost 域会卡权限，且复制原文时绕过 N KB 上限更稳）。
- "在编辑器中打开"走 `/api/open?path=...&editor=cursor` → 后端 `open -a 'Cursor' <path>` 或 `cursor <path>` / `code <path>`。

### 1.6 关键失败场景与对策

| 场景                                            | 后果              | 对策                                                              |
|-------------------------------------------------|-------------------|-------------------------------------------------------------------|
| 用户声明的项目根不存在（机器搬迁）              | 扫描器抛错        | 单源 try/catch，UI 上单源标 `unavailable`，其他源照常             |
| YAML frontmatter 损坏（手改坏的）               | 整文件丢失        | parse 失败时降级：name=文件名、preview=前 30 行、`parseError` 字段 |
| 11520 端口被占                                  | 起不来            | 启动检测，`PORT` env 覆盖；CLI 输出 fallback 端口                  |
| 文件数量爆炸（vault 含 10k notes）              | 扫描卡 CPU        | sources.yaml 强制 `include`/`exclude` glob，`maxFiles: 5000` 硬限 |
| 浏览器在远端（SSH 转发）打开页面，复制按钮失效  | 复制不动          | `/api/copy` 在远端跑 pbcopy 也无意义 —— UI 同时给"原文+点击全选" |
| chokidar 在 macOS 全盘监听耗 fd                 | 系统卡            | 只 watch sources.yaml 列出的具体子树，`usePolling: false`         |

### 1.7 安全 / 数据边界

- 全程 **localhost only**：server bind `127.0.0.1`，**不**支持 `0.0.0.0`。
- `/api/open` 路径白名单：必须在 sources.yaml 已声明的根之下，否则 403 —— 防 `?path=/etc/passwd` 这类。
- `/api/copy` 同样白名单 —— 防当文件读取代理。
- 不上传不联网，不写 telemetry。
- `data/cache.json` 进 `.gitignore`，但 `.env` / `sources.yaml` 用户决定（按你的 git 习惯：`.env` 入库）。

### 1.8 分发架构

- **不发 npm**。私仓 git clone + `npm install && npm start`。
- `package.json` 暴露三条 script：
  - `npm start` — 一键：扫一次 → 起 server → 自动 `open http://localhost:11520`
  - `npm run scan` — 只扫描，dump IR 到 stdout（debug 用）
  - `npm run dev` — Vite dev server + nodemon server，前后端热重载
- 后续要给别的机器用，直接 `git clone + npm i + npm start`。

---

## 2. 代码质量评审（Code Quality）

### 2.1 技术选型（决策已锁）

| 维度          | 选型                          | 理由                                                                |
|---------------|-------------------------------|---------------------------------------------------------------------|
| Runtime       | Node 20+                      | LTS、Fastify v5 要求、原生 `fs.glob`                                |
| 包管理        | npm workspaces                | 你机器装的是 npm，pnpm 不强制                                       |
| HTTP 框架     | **Fastify 5**                 | Express 已死气；Fastify 内置 schema validation + 更快                |
| YAML          | `yaml` (eemeli/yaml)          | 比 js-yaml 更宽容损坏 frontmatter                                   |
| TOML          | `@iarna/toml`                 | Codex config.toml 必须                                              |
| 文件 watch    | `chokidar` v3                 | 跨平台、稳定                                                        |
| Frontend      | **Vite 5 + Vue 3 + TS**       | 单 SPA、轻、官方 Devtools、UI 用 [Vuetify](https://vuetifyjs.com)   |
| 状态          | Pinia                         | Vue 官方，简单                                                      |
| 搜索          | Fuse.js                       | 全在前端，无需后端 ES                                               |
| 编辑器跳转    | `child_process.spawn`         | 直接 `cursor` / `code` / `open -a`                                  |
| 剪贴板        | `clipboardy` 或自写 pbcopy     | clipboardy 4.x ESM-only 注意                                        |

> 不要 React —— 单人小工具用 Vue 心智更轻；不要 Next/Nuxt —— 没 SSR 需求，纯 SPA 够。
> 不要 TypeScript on backend 也无所谓，但**前端必须 TS**（IR 类型定义会救命）。

### 2.2 模块边界（强约束 — 防滑坡）

- 适配器 **不允许**互相 import，全部产同一份 `SkillItem[]`。新增源 = 新文件 + 注册表登记一行。
- Server 的 route handler **不允许**做扫描，启动期 + watch 事件触发 scanner，handler 只读内存 IR。
- 前端 **不允许**直接读文件 fetch，全部走 `/api/*`。
- DRY：所有适配器共享 `parseFrontmatter(text)` / `inferBrand(item)` / `normalizePath(p)` 三个 util，禁止各自实现。

### 2.3 配置文件 schema（sources.yaml 草案）

```yaml
sources:
  hermes:
    enabled: true
    roots:
      - ~/.hermes/skills
      - ~/.hermes/profiles/*/skills
  claude-code:
    enabled: true
    roots:
      - ~/.claude/skills
  mcp-config:
    enabled: true
    files:
      - ~/.cursor/mcp.json
      - ~/.codex/config.toml
      - ~/Library/Application Support/Claude/claude_desktop_config.json
      - ~/.hermes/config.yaml
  project-runbook:
    enabled: true
    roots:
      - ~/Project/HuHaa-AI-Platform
      - ~/Project/HuHaa-Open-Guide
      - ~/Project/HuHaa-Quark-Bridge
      - ~/Library/Mobile Documents/com~apple~CloudDocs/notes
    glob: 'docs/RUNBOOK-*.md'
ui:
  port: 11520
  autoOpen: true
  defaultEditor: cursor   # cursor | code | open
  groupBy: [source, category, brand]
```

### 2.4 你已经踩过坑、要预先避免的反模式

- **不**新建 `xxxProxy.ts` / `xxxAdapter` 层去包装 Fastify —— 直接路由 + handler。
- **不**在 server 里做"先看 cache 再决定扫"的乐观快路径 —— 启动一定全扫一次，避免缓存陈旧（首扫 < 1s，没必要省）。
- **不**做 SSR、登录、用户系统、多租户。这是单机工具。
- **不**把扫描和 HTTP 混进同一个文件 —— 两件事。

### 2.5 错误处理

- 适配器解析失败 → IR 里 `parseError: string` 字段，UI 红角标显示。
- HTTP handler 全部用 Fastify schema 校验入参。
- `/api/open` 失败（编辑器没装）→ 200 返回 `{ ok:false, hint:"未检测到 cursor，请安装 Cursor 命令行" }`，UI 弹 toast。

---

## 3. 测试评审（Test）

### 3.1 测试栈

- **Vitest**（前后端通吃）+ `supertest` 打 Fastify。
- E2E 不做（单人工具，过度工程）。

### 3.2 必测覆盖（按代码路径 + 用户路径）

```
适配器层（每个 adapter 独立 fixture 目录）
├─ hermes.adapter.test.ts
│   ├── ★★★ 正常 SKILL.md → 完整 IR
│   ├── ★★★ frontmatter 损坏 → 降级 + parseError
│   ├── ★★  目录不存在 → 单源 unavailable，不 throw
│   └── ★★  description 含 brand 关键字 → brand 推断正确
├─ mcp-config.adapter.test.ts
│   ├── ★★★ 解析 cursor mcp.json
│   ├── ★★★ 解析 codex config.toml [mcp_servers]
│   └── ★★  字段缺失（command 没写）→ parseError
├─ cursor-rules.adapter.test.ts ── ★★ mdc frontmatter
└─ project-runbook.adapter.test.ts ── ★★ glob 命中

Server 层
├─ GET /api/skills                  ★★★ 返回全量 IR
├─ GET /api/skills/:id              ★★★ 返回 raw + 详情
├─ POST /api/copy { path }          ★★★ 白名单内 → pbcopy；白名单外 → 403
├─ POST /api/open  { path, editor } ★★★ 白名单内 → spawn；编辑器没装 → 友好失败
├─ GET /sse                         ★★  watch 触发 → 推 'reload' 事件
└─ Port 11520 已占                  ★★  fallback 提示

前端
└─ 不写单测；靠手测 + Pinia DevTools 即可（单人小工具，不值得）
```

覆盖率目标：**适配器与 server 90% 行覆盖**，前端 0%。

### 3.3 关键回归用例（必须打住的退化）

- 任何对 frontmatter 解析的修改 → 回归一遍"损坏 YAML 不 crash 整次扫描"。
- 任何对路径白名单的修改 → 回归"路径穿越 `../../etc/passwd` 必 403"。

---

## 4. 性能评审（Performance）

### 4.1 扫描期

- 你机器上初步统计：Hermes 116 + gstack 545 + 项目 RUNBOOK 数十 ≈ **800 文件量级**。读 + parse YAML ≈ 100-300 ms（M 系列），完全不需要 worker pool。
- 上限保护：`maxFiles: 5000` + `maxFileBytes: 1MB`，超过跳过 + warn。

### 4.2 运行期

- IR 全量内存（800 条 × 平均 2KB raw ≈ 2MB），单进程吃得下。
- `/api/skills` 只返回 IR 元信息（不带 raw），约 200KB gzip 后 < 30KB。
- raw 走 `/api/skills/:id`，懒加载，详情页打开才取。
- 前端 Fuse.js 索引在加载后构建一次，800 条搜索延迟 < 5ms。

### 4.3 watch 风暴

- chokidar 在 SKILL.md 改动 → debounce 500ms → 单源重扫（不全量）→ SSE broadcast `{type:'reload', source:'hermes'}`。
- 前端收到后只重拉对应 source 的 IR，不全量刷新。

### 4.4 不优化的事

- 不做 lazy 适配器（首扫 < 1s 没必要）。
- 不做 IndexedDB 前端缓存（每次刷新重拉 200KB 没影响）。
- 不做 SSR / 预渲染。

---

## 5. NOT in scope（已考虑但显式不做，每条带理由）

- **写 / 编辑技能**：本工具是只读浏览器，编辑请回到 Cursor / Hermes CLI。原因：避免变成第二个编辑器，scope 爆炸。
- **跨机同步**：每台机器自己跑，sources.yaml 自己写。原因：你已有 iCloud / git 同步习惯，重复造轮子。
- **AI 推荐 / 智能调用**：不在页面里调 LLM 帮你选技能。原因：你有 Hermes / Claude Code，那是它们的事。
- **打包成 Electron 桌面 app**：只是浏览器 SPA。原因：单人工具，浏览器够用，省 200MB。
- **多用户 / 鉴权**：localhost only。原因：单机工具。
- **写入 MCP 服务器配置**：只读展示。原因：写配置是一次性的事，不值得做 UI。
- **远程 SSH skill 聚合**：只扫本机。原因：你机器之间通常 git 同步项目，跨机扫盘没必要。
- **Windows / Linux 一等公民**：开发以 macOS 为准；其他平台尽量兼容但不专门测。原因：你是 Mac 用户。
- **OAuth / 私有 Git 拉技能**：源限文件系统。原因：scope。

---

## 6. 必填输出

### 6.1 验收标准（Done definition）

- [ ] `git clone && npm install && npm start` → 浏览器自动打开 `localhost:11520`，主页可见至少 hermes / claude-code / mcp-config 三个 source 的合计技能数。
- [ ] 左侧树支持四种分组切换：source / category / brand / product。
- [ ] 详情页有：description、triggers、参数表（仅 MCP）、preview、原文、**复制路径按钮**、**复制原文按钮**、**在 Cursor 中打开按钮**。
- [ ] 修改 `~/.hermes/skills/devops/new-api-deployment/SKILL.md` 后，浏览器在 1s 内自动刷新该条目。
- [ ] 关掉 Cursor，点"在 Cursor 中打开" → toast "未检测到 cursor 命令"，不崩。
- [ ] `curl 'http://localhost:11520/api/copy?path=/etc/passwd'` → 403。
- [ ] 任何一个源的根目录不存在 → 该源标 `unavailable`，其他源照常列出。

### 6.2 实施阶段（按你 30s 协议，每阶段一个可验产物）

| 阶段 | 交付                                                     | 验证                                            | 估时   |
|------|----------------------------------------------------------|-------------------------------------------------|--------|
| P0   | 仓骨架 + workspaces + sources.yaml + IR 类型             | `npm install` 通过                              | 30 min |
| P1   | hermes + claude-code 适配器 + `npm run scan` 出全量 IR  | stdout 看到 660+ 条                             | 60 min |
| P2   | Fastify server + `/api/skills` + `/api/skills/:id`       | curl 返回 JSON                                  | 45 min |
| P3   | Vue SPA 主页 + 列表 + 详情 + 复制路径                    | 浏览器能浏览 + 复制                             | 90 min |
| P4   | mcp-config + cursor-rules + project-runbook 适配器       | 主页见到 MCP servers + RUNBOOK                  | 60 min |
| P5   | chokidar + SSE 热更新                                    | 改 SKILL.md → 页面 1s 内刷新                    | 45 min |
| P6   | brand/product 推断 + 四种分组                            | 切分组下拉 → UI 重排                            | 30 min |
| P7   | `/api/open` + Vitest 测试                                | 点按钮跳 Cursor + `npm test` 全绿               | 45 min |

合计约 7-8 小时净工作量，分两到三天。

### 6.3 风险登记（Risks）

| ID | 风险                                       | 影响     | 缓解                                                  |
|----|--------------------------------------------|----------|-------------------------------------------------------|
| R1 | 适配器对每种格式假设错误（实际 frontmatter 字段名不一致） | 数据错乱 | P1 出 IR 后人工抽 20 条对照原文                       |
| R2 | macOS pbcopy 在 Cursor terminal session 复制不到系统剪贴板 | 复制按钮无效 | 提供"双轨"：后端 pbcopy + 前端 navigator.clipboard fallback |
| R3 | 11520 已被你某个服务占                    | 起不来   | 启动期 try-listen，占用就 +1 试到 11530，最终值打到日志 |
| R4 | iCloud 路径含空格 + `~/Library/Mobile Documents/com~apple~CloudDocs` 这种波浪号 | 路径解析炸 | 统一用 `os.homedir() + path.join`，不字符串拼          |

### 6.4 Cross-model tension（自我反诘）

- **是否该用 Tauri 而非纯 Web SPA？** 我倾向**否**。Tauri 给本地剪贴板/打开文件更原生，但带来 Rust 工具链 + 打包复杂度，单人工具划不来；浏览器 + `/api/copy` `/api/open` 已覆盖核心诉求。
- **是否该把 Hermes 自己做的 skill 浏览器（如果有）直接借用？** Hermes 的 `hermes skills` 是 CLI、且只看 Hermes 自己的目录。本项目核心价值是**跨工具聚合**，不可替代。

---

## 7. Open questions（开干前需要你确认）

仅 4 条 —— 其他默认按上面写法。

Q1. **sources.yaml 默认要不要包含 `~/.codex/`、Cursor 项目 `.cursorrules`？**
    A) 默认全开（hermes + claude-code + cursor + codex + mcp-config + 你列的 4 个项目根的 RUNBOOK）
    B) 只默认开 hermes + claude-code + mcp-config，剩余手动加（更保守）
    我建议 A，理由：你机器上这些路径都真实存在，默认聚合才有"中枢"感。

Q2. **前端 UI 风格？**
    A) Vuetify Material Design（最快，组件全）
    B) 自己写 Tailwind + 极简（你 HuHaa 系产品的 brand 一致）
    我建议 A 第一版上，P7 之后看心情换 B。

Q3. **"复制原文"按钮要不要带 frontmatter？**
    A) 带（粘到 Cursor 里 LLM 能看到 triggers / when_to_use，更聪明）
    B) 只复制 body
    我建议 A。

Q4. **要不要顺便加一个 `/api/exec-skill?id=...` —— 直接调起对应的 Hermes / Claude Code 命令？**
    A) 加（一键执行）
    B) **本期不加**，只复制路径 → 你回 Cursor 自己说 "用这个 skill"
    我建议 B —— 原始诉求是"复制按钮回到编辑器使用"，多搞执行通道 = scope 爆炸 + 安全面变大。

回我 `Q1=A Q2=A Q3=A Q4=B`（或任意改动）我就进入 P0。
