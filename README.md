# HuHaa-MySkills

HuHaa-MySkills is a local skill hub for AI-agent workflows. It scans local Hermes skills, Claude Code skills, Codex instructions, Cursor rules, MCP configs, Hermes plugins, and project runbooks, then serves a searchable browser UI on `127.0.0.1:11520`.

It is intentionally local-first:

- no cloud sync
- no remote command execution from the web UI
- no arbitrary path operations from HTTP requests
- MCP/plugin config is redacted before display
- runtime data stays under `~/.config/huhaa-myskills/` or `HUHAA_HOME`

## Features

- Unified local catalog for:
  - Hermes Agent `SKILL.md`
  - Claude Code `SKILL.md`
  - Codex `AGENTS.md`
  - Cursor `.cursorrules` and `.cursor/rules/*`
  - MCP config files
  - Hermes plugins
  - project `docs/RUNBOOK-*.md`
- Fast local web UI at `http://127.0.0.1:11520`
- Search + composable filters:
  - editor
  - kind
  - source
  - product
  - brand
- Structured query tokens, for example:

```text
kind:mcp source:mcp-config product:github docker
```

- Detail panel with:
  - usage prompt
  - path / relative path / directory
  - triggers, tags, links, params
  - redaction warning when raw data contains `[REDACTED]`
- Buttons for:
  - copy path
  - copy directory
  - copy relative path
  - copy name
  - copy raw text
  - copy invocation prompt
  - open in Cursor
  - reveal in Finder
- Chokidar watcher + SSE live reload
- Manual reload button
- Zero-residue purge command
- Node built-in test suite + end-to-end smoke verification

## Requirements

- Node.js 20+
- npm
- macOS is the primary target for `pbcopy`, Finder reveal, and Cursor opening

Linux/Windows can run the scanner/server, but clipboard/open behavior depends on platform tools.

## Install

### Option A: clone and run

```bash
git clone https://github.com/aquarkgn/HuHaa-MySkills.git
cd HuHaa-MySkills
npm install
npm run init
npm start
```

### Option B: install CLI directly from GitHub

```bash
npm install -g github:aquarkgn/HuHaa-MySkills
huhaa-myskills init
huhaa-myskills start
```

Then open:

```text
http://127.0.0.1:11520
```

`npm start` also tries to open the page automatically.

## Commands

| Command | Description |
|---|---|
| `npm start` | Initialize config if missing, scan, start server, auto-open browser |
| `npm run init` | Write default `sources.yaml` under the user data dir |
| `npm run scan` | Scan and print raw IR JSON to stdout |
| `npm run stats` | Print scan counts by source/editor/kind/category/brand |
| `npm run duplicates` | Print duplicate diagnostics |
| `npm run dev` | Dev alias for local start |
| `npm run build:web` | Build Vue SPA into `service/packages/web/dist/` |
| `npm test` | Run scanner + server tests |
| `npm run verify` | Build, test, boot a temporary real server, check API/static assets |
| `npm run purge` | Delete all HuHaa-MySkills user data |

## Configuration

Runtime config lives at:

```text
~/.config/huhaa-myskills/sources.yaml
```

Override the data directory with:

```bash
HUHAA_HOME=/tmp/huhaa-myskills npm start
```

Override the preferred port with:

```bash
PORT=11530 npm start
```

The server binds only to `127.0.0.1`. It does not listen on `0.0.0.0`.

### Example sources

The template is in:

```text
service/config/sources.example.yaml
```

Supported source blocks:

- `hermes`
- `claude-code`
- `codex`
- `cursor`
- `mcp-config`
- `hermes-plugin`
- `project-runbook`
- `obsidian` is reserved and disabled by default

## Security model

The browser UI can only operate on items already present in the in-memory scan snapshot.

Important rules:

- `/api/copy` accepts `{ id, what }`, not arbitrary paths
- `/api/open` accepts `{ id, with }`, not arbitrary paths
- asset serving rejects path traversal
- server handlers do not scan on demand; scanner output is loaded into memory, then swapped atomically on reload
- MCP configs are redacted before `raw` and `preview` are exposed
- web UI does not execute skills or MCP tools

This project is a local catalog/launcher, not an execution gateway.

## Verification

Run the full local quality gate:

```bash
npm run verify
```

Expected final line:

```text
[verify] PASS build + tests + HTTP/API/static smoke checks
```

`verify` creates a temporary `HUHAA_HOME`, starts a real Fastify server on a random loopback port, exercises the API and static assets, then closes the server and removes the temp directory.

## Uninstall / zero residue

```bash
npm run purge
rm -rf HuHaa-MySkills
```

`purge` removes:

```text
~/.config/huhaa-myskills/
```

It does not delete the code checkout.

## Development layout

```text
service/bin/                 CLI entrypoint
service/bin/lib/             path and port helpers
service/config/              sources.yaml template
service/packages/scanner/    source adapters + IR normalizer
service/packages/server/     Fastify API + static SPA serving
service/packages/web/        Vue 3 SPA
service/scripts/             verify script
docs/                        runbooks and planning docs
```

## API

- `GET /api/health`
- `GET /api/skills`
- `GET /api/skills/:id`
- `GET /api/stats`
- `GET /api/reload-state`
- `POST /api/reload`
- `GET /api/events`
- `POST /api/copy`
- `POST /api/open`

## License

MIT
