# Add `restart` Command & Separate `dev` from `start`

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add `npm run restart` command to quickly restart the background service, and separate `npm run dev` (frontend-only hot reload) from `npm run start` (full production service).

**Architecture:**
1. Add `cmdRestart()` to `bin/huhaa-myskills.mjs` — reads `state.json`, kills old PID, starts new server
2. Modify `package.json` scripts to separate concerns:
   - `npm run start` → full service (backend + frontend build)
   - `npm run dev` → Vite dev server only (frontend hot reload, port 11521)
   - `npm run restart` → quick service restart
3. Update help text in CLI

**Tech Stack:** Node.js / bash / npm scripts

---

## Task 1: Add `restart` handler to CLI

**Objective:** Register `restart` command in handlers map and add to help text.

**Files:**
- Modify: `bin/huhaa-myskills.mjs:39-56` (handlers object)
- Modify: `bin/huhaa-myskills.mjs:70-104` (help text)

**Step 1: Read current handlers object to confirm structure**

```bash
grep -A 20 "const handlers = {" bin/huhaa-myskills.mjs
```

**Step 2: Add `restart: cmdRestart` to handlers**

Find this:
```javascript
const handlers = {
  start: cmdStart,
  stop: cmdStop,
  // ... other handlers ...
  dev: cmdDev,
  sync: cmdSync,
  help: cmdHelp,
  // ...
};
```

Replace with:
```javascript
const handlers = {
  start: cmdStart,
  stop: cmdStop,
  scan: cmdScan,
  stats: cmdStats,
  duplicates: cmdDuplicates,
  init: cmdInit,
  purge: cmdPurge,
  uninstall: cmdUninstall,
  restart: cmdRestart,
  dev: cmdDev,
  sync: cmdSync,
  help: cmdHelp,
  '--help': cmdHelp,
  '-h': cmdHelp,
  '--version': cmdVersion,
  '-v': cmdVersion,
  version: cmdVersion,
};
```

**Step 3: Add `restart` to help text**

Find this in `cmdHelp()`:
```
Commands:
  start     Scan + start server + open browser (runs in background by default)
  stop      Stop the background server
```

Add after `stop`:
```
  restart   Restart the background server (kill + restart)
```

**Step 4: Verify changes**

```bash
node bin/huhaa-myskills.mjs --help | grep -A 12 "Commands:"
```

Expected: Shows `restart` command in list.

**Step 5: Commit**

```bash
git add bin/huhaa-myskills.mjs
git commit -m "feat(cli): register restart command in handlers"
```

---

## Task 2: Implement `cmdRestart()` function

**Objective:** Create restart logic that stops old process and starts new one.

**Files:**
- Modify: `bin/huhaa-myskills.mjs` — add `cmdRestart()` function after `cmdStop()`

**Step 1: Understand `cmdStop()` structure**

Current `cmdStop()` (lines 131-151):
- Reads `state.json`
- Checks if PID is running
- Kills with SIGTERM
- Deletes `state.json`

**Step 2: Write `cmdRestart()` function**

Add this after `cmdStop()` function (around line 152):

```javascript
async function cmdRestart() {
  const isForeground = process.argv.includes('--foreground') || process.argv.includes('-f');
  const state = readJson(stateFile());
  
  if (!state || !state.pid) {
    console.log('[restart] 未发现运行中的实例，启动新服务...');
    await cmdStart();
    return;
  }
  
  if (!isProcessRunning(state.pid)) {
    console.log('[restart] 旧实例未运行，清理状态并启动新服务...');
    try { fs.unlinkSync(stateFile()); } catch {}
    await cmdStart();
    return;
  }
  
  // Kill old process
  try {
    process.kill(state.pid, 'SIGTERM');
    console.log(`[restart] 已停止旧实例 (PID ${state.pid})`);
  } catch (err) {
    console.error(`[restart] 停止失败: ${err.message}`);
  }
  
  try { fs.unlinkSync(stateFile()); } catch {}
  
  // Wait and restart
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('[restart] 启动新实例...');
  await cmdStart();
}
```

**Step 3: Test restart when no service is running**

```bash
npm run restart
```

Expected: "未发现运行中的实例，启动新服务..."

**Step 4: Test restart when service is running**

```bash
# In another terminal: start service
npm run start

# In first terminal: wait 2 sec, then restart
npm run restart
```

Expected: "已停止旧实例 → 启动新实例 → Service restarted on port ..."

**Step 5: Verify service is accessible after restart**

```bash
curl -s http://localhost:11520/api/v0/items | head -20
```

Expected: JSON response with items

**Step 6: Commit**

```bash
git add bin/huhaa-myskills.mjs
git commit -m "feat(cli): implement restart command"
```

---

## Task 3: Add `restart` to package.json scripts

**Objective:** Make `npm run restart` available as a top-level npm script.

**Files:**
- Modify: `package.json:32-51` (scripts section)

**Step 1: Read current scripts**

```bash
jq '.scripts' package.json
```

**Step 2: Add restart script**

Find this in `scripts`:
```json
"scripts": {
  "start": "node bin/huhaa-myskills.mjs start",
  "stop": "node bin/huhaa-myskills.mjs stop",
  ...
}
```

Add after `stop`:
```json
"restart": "node bin/huhaa-myskills.mjs restart",
```

**Step 3: Verify it's valid JSON**

```bash
npm run 2>&1 | grep restart
```

Expected: Shows `restart` in available scripts

**Step 4: Test it**

```bash
npm run restart
```

Expected: Command runs without JSON syntax error

**Step 5: Commit**

```bash
git add package.json
git commit -m "feat(npm): add restart script"
```

---

## Task 4: Modify `dev` script to run frontend-only

**Objective:** Change `npm run dev` to start Vite dev server only (not backend service).

**Files:**
- Modify: `package.json:32-51` (scripts section)

**Step 1: Understand current dev behavior**

Current: `npm run dev` → `cmdDev()` → outputs placeholder → calls `cmdStart()` (full service)

Desired: `npm run dev` → start Vite dev server on port 11521

**Step 2: Modify package.json dev script**

Find this:
```json
"dev": "node bin/huhaa-myskills.mjs dev",
```

Replace with:
```json
"dev": "cd packages/web && npm run dev",
```

This delegates to the web package's Vite dev server (already configured on port 11521 in `packages/web/package.json`).

**Step 3: Verify JSON validity**

```bash
npm run 2>&1 | grep -E "(dev|start|restart)"
```

Expected: Shows all three commands

**Step 4: Test frontend dev mode**

Run in one terminal:
```bash
npm run dev
```

Expected output:
```
  VITE v6.0.0  ready in XXX ms

  ➜  Local:   http://127.0.0.1:11521/
  ➜  press h to show help
```

**Step 5: In another terminal, start backend service separately**

```bash
npm run start
```

Expected: Backend runs on port 11520

**Step 6: Verify frontend is connected to backend**

Open browser: http://127.0.0.1:11521

Expected: HuHaa UI loads, can browse skills (frontend talking to backend on 11520)

**Step 7: Test frontend hot reload**

Edit `packages/web/src/main.tsx` (add a comment), save.

Expected: Vite recompiles, browser auto-refreshes without full page reload.

**Step 8: Stop dev and start**

```bash
# Ctrl+C dev server
# Ctrl+C start service
```

**Step 9: Commit**

```bash
git add package.json
git commit -m "feat(dev): separate frontend dev mode from backend start"
```

---

## Task 5: Update CLI help and `cmdDev()` for clarity

**Objective:** Update help text to document new dev mode, and adjust `cmdDev()` placeholder.

**Files:**
- Modify: `bin/huhaa-myskills.mjs:70-104` (help text)
- Modify: `bin/huhaa-myskills.mjs:444-447` (cmdDev function)

**Step 1: Update help text for dev command**

Find this in `cmdHelp()`:
```
Commands:
  ...
  dev       Dev mode (Vite + nodemon)
  ...
```

Replace with:
```
Commands:
  ...
  start     Scan + start server + open browser (runs in background by default)
  stop      Stop the background server
  restart   Restart the background server (kill + restart)
  ...
  dev       Dev mode: Vite frontend hot reload (connect to backend separately)
  ...
```

**Step 2: Update `cmdDev()` function**

Find this (lines 444-447):
```javascript
async function cmdDev() {
  console.log('[dev] 开发模式将在 P3 提供，暂时执行 start。');
  await cmdStart();
}
```

Replace with:
```javascript
async function cmdDev() {
  console.log('[dev] Frontend dev mode delegated to packages/web.');
  console.log('[dev] Run: npm run dev (frontend on 11521)');
  console.log('[dev] In another terminal: npm run start (backend on 11520)');
  console.log('[dev] Or: npm run restart (if backend already running)');
  process.exit(0);
}
```

**Step 3: Test help output**

```bash
node bin/huhaa-myskills.mjs --help
```

Expected: Help shows all commands including `restart` and updated `dev` description

**Step 4: Test cmdDev directly**

```bash
node bin/huhaa-myskills.mjs dev
```

Expected: Shows usage instructions and exits cleanly

**Step 5: Commit**

```bash
git add bin/huhaa-myskills.mjs
git commit -m "docs(cli): update help and cmdDev placeholder"
```

---

## Task 6: Full integration test

**Objective:** Verify all three modes work correctly together.

**Files:**
- No files modified
- Test: functionality only

**Step 1: Start backend service**

```bash
npm run start
```

Wait 3 seconds.

Expected: Shows "✓ HuHaa-MySkills 已在后台运行: http://localhost:11520"

**Step 2: In new terminal, start frontend dev**

```bash
npm run dev
```

Expected: Vite starts on port 11521, shows "Local: http://127.0.0.1:11521/"

**Step 3: Open browser to frontend**

```bash
open http://127.0.0.1:11521
```

Expected: UI loads, can browse skills

**Step 4: Test frontend hot reload**

Edit any file in `packages/web/src/`, save.

Expected: Browser auto-refreshes without stopping

**Step 5: Test restart command**

Back to original terminal (where you ran start):
```bash
npm run restart
```

Expected: "已停止旧实例 → 启动新实例 → Service restarted"

**Step 6: Verify frontend still works after restart**

Browser should auto-refresh and reconnect.

Expected: No broken connection, UI still responsive

**Step 7: Test npm run start when dev is running**

Keep dev running. In third terminal:
```bash
npm run restart
```

Expected: Backend restarts without affecting Vite dev server

**Step 8: Cleanup**

```bash
# Ctrl+C dev server
# npm run stop
```

**Step 9: Commit if all tests pass**

```bash
git status
```

Expected: All changes committed in Tasks 1-5

---

## Files Likely to Change

1. `bin/huhaa-myskills.mjs` — +30 lines (cmdRestart function, help text, cmdDev update)
2. `package.json` — 2 line edits (dev script, add restart script)

No other files modified.

---

## Tests & Validation

**Unit Tests:** None needed (CLI commands, no business logic)

**Integration Tests:**
- ✅ `npm run restart` without running service → starts service
- ✅ `npm run restart` with running service → kills + restarts
- ✅ `npm run dev` → Vite dev server on 11521
- ✅ `npm run start` → backend on 11520
- ✅ `npm run start` + `npm run restart` → service restarts
- ✅ Frontend dev server maintains connection after restart

**Verification Commands:**
```bash
# Check syntax
npm run verify

# Build should succeed
npm run build:web

# Check CLI help
node bin/huhaa-myskills.mjs --help | grep -E "(restart|dev)"
```

---

## Risks & Tradeoffs

### Risk 1: `dev` now requires manual backend management
- **Impact:** Developer must run `npm run start` in separate terminal for backend
- **Mitigation:** Clear console message in `cmdDev()` documents this
- **Tradeoff:** Cleaner separation of concerns vs. one-command dev setup

### Risk 2: Existing developer scripts may break
- **Impact:** If anyone was relying on `npm run dev` starting full service, they must adapt
- **Mitigation:** Git history shows change; team docs clarify new workflow
- **Mitigation:** `npm run start` still works for full service

### Risk 3: Port conflicts during dev
- **Impact:** If frontend dev and start both try to use port 11521/11520, second fails
- **Mitigation:** Kill first before starting second; restart command handles this

---

## Open Questions

1. Should `dev` also watch backend code and restart on changes? (Deferred to P4)
2. Should `restart` accept `--no-browser` to avoid opening browser again? (Deferred to P4)
3. Should there be a `npm run dev-full` that starts both frontend + backend? (Deferred to P4)

---

**Implementation ready. No architectural decisions pending.**
