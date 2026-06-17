# RUNBOOK: HuHaa-MySkills

This runbook is the production/operator note for the local HuHaa-MySkills service.

## Service identity

- Name: HuHaa-MySkills
- Purpose: local browser catalog for AI-agent skills, plugins, MCP configs, and runbooks
- Default URL: `http://127.0.0.1:11520`
- Default data dir: `~/.config/huhaa-myskills/`
- Override data dir: `HUHAA_HOME=/path/to/dir`
- Default preferred port: `11520`
- Override port: `PORT=11530`
- Bind address: `127.0.0.1` only

## Main commands

```bash
npm install
npm run init
npm start
npm test
npm run verify
npm run purge
```

## Files and directories

Runtime/user data:

```text
~/.config/huhaa-myskills/sources.yaml
~/.config/huhaa-myskills/cache.json
~/.config/huhaa-myskills/state.json
```

Repository layout:

```text
service/bin/huhaa-myskills.mjs
service/config/sources.example.yaml
service/packages/scanner/src/index.mjs
service/packages/server/src/index.mjs
service/packages/web/src/App.vue
service/scripts/verify.mjs
```

## Healthy state

```bash
curl -s http://127.0.0.1:11520/api/health
```

Expected shape:

```json
{"ok":true,"port":11520,"items":188,"version":"0.1.0","phase":"P6"}
```

The exact `items` count depends on local sources.

## Full verification

```bash
npm run verify
```

Expected final line:

```text
[verify] PASS build + tests + HTTP/API/static smoke checks
```

The verify script proves:

1. Vue SPA builds.
2. Scanner/server tests pass.
3. A real Fastify server starts on loopback.
4. `/api/health`, `/api/skills`, `/api/skills/:id`, `/api/stats`, and `/api/reload` work.
5. Built JS/CSS assets are served with correct content types.
6. Temporary runtime data is removed.

## Troubleshooting

### Page does not open

Check service:

```bash
curl -s http://127.0.0.1:11520/api/health
```

If it fails, start manually:

```bash
npm start
```

If port is busy:

```bash
PORT=11530 npm start
```

The CLI will also try fallback ports when the preferred port is unavailable.

### Page opens but is blank

Build assets:

```bash
npm run build:web
npm start
```

Check static assets from `index.html`:

```bash
curl -I http://127.0.0.1:11520/
curl -I http://127.0.0.1:11520/assets/<asset>.js
curl -I http://127.0.0.1:11520/assets/<asset>.css
```

Expected content types:

```text
text/html; charset=utf-8
text/javascript; charset=utf-8
text/css; charset=utf-8
```

### No skills or too few skills

Check config:

```bash
sed -n '1,220p' ~/.config/huhaa-myskills/sources.yaml
```

Run scan debug:

```bash
HUHAA_DEBUG=1 npm run scan >/tmp/huhaa-skills.json
```

Common causes:

- source root path does not exist
- source is disabled
- file is larger than `limits.maxFileBytes`
- glob does not match the target file
- project runbooks are outside configured roots

### MCP secrets appear in UI

They should not. Verify using tests:

```bash
npm test
```

Specific redaction behavior lives in:

```text
service/packages/scanner/src/adapters/mcp-config.mjs
```

The adapter redacts keys matching token/key/secret/password/auth/cookie-style names and common inline secret patterns before writing `raw` or `preview`.

### Reload does not update page

Manual reload:

```bash
curl -s -X POST http://127.0.0.1:11520/api/reload
curl -s http://127.0.0.1:11520/api/reload-state
```

Watch events endpoint:

```bash
curl -N http://127.0.0.1:11520/api/events
```

If watcher is unreliable on a synced/cloud directory, use manual reload. The server never clears the old snapshot on reload failure; it keeps the last good data.

### Copy buttons do not work

On macOS, copy uses `pbcopy` on the server side.

Check:

```bash
command -v pbcopy
```

The tests use a fake temporary `pbcopy` and do not touch the real clipboard.

### Open in Cursor does not work

Check Cursor CLI:

```bash
command -v cursor
```

If missing, install Cursor shell command from Cursor itself, or use the path copy/reveal buttons instead.

### Finder reveal does not work

Finder reveal uses:

```bash
open -R <path>
```

This is macOS-only.

## Public release checklist

Before pushing a public repository:

```bash
npm run verify
```

Then check ignored/generated files:

```bash
git status --short
git check-ignore -v node_modules service/packages/web/dist 2>/dev/null || true
```

Check for obvious secrets outside ignored directories:

```bash
git grep -n -E '(ghp_|sk-[A-Za-z0-9_-]{12,}|Bearer [A-Za-z0-9._~+/=-]{12,}|API[_-]?KEY|SECRET|PASSWORD|TOKEN)' -- . ':!service/packages/scanner/test/scanner.test.mjs'
```

Expected matches should be code patterns/documentation only, not real credential values.

## Recovery

Reset runtime config:

```bash
npm run purge
npm run init
npm start
```

Remove code checkout:

```bash
rm -rf /path/to/HuHaa-MySkills
```

`purge` intentionally touches only the runtime data dir, never the repository.
