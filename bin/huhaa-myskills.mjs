#!/usr/bin/env node
// huhaa-myskills CLI

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const PKGS_ROOT = path.join(REPO_ROOT, 'packages');

const require = createRequire(import.meta.url);

// Load paths helper
const pathsLib = require('./lib/paths.mjs');
const { homeDir, configFile, cacheFile, stateFile, ensureHomeDir, writeJson, readJson } = pathsLib;

// Load port helper
const { pickPort } = require('./lib/port.mjs');

// Load version from package.json
function getVersion() {
  try {
    const pkgPath = path.join(REPO_ROOT, 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

const VERSION = getVersion();
const cmd = process.argv[2] || 'start';

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

const fn = handlers[cmd] || cmdHelp;
fn().catch(err => {
  console.error('[huhaa-myskills] error:', err && err.stack || err);
  process.exit(1);
});

// ---------------- commands ----------------

async function cmdVersion() {
  console.log(`huhaa-myskills v${VERSION}`);
}

async function cmdHelp() {
  console.log(`huhaa-myskills v${VERSION} — local skill / plugin / MCP aggregation hub

Usage:
  huhaa-myskills <command> [options]

Commands:
  start     Scan + start server + open browser (runs in background by default)
  stop      Stop the background server
  restart   Restart the background server (kill + restart)
  scan      Scan only, dump IR JSON to stdout
  stats     Scan + print human-readable summary (counts / brands / errors / samples)
  duplicates Scan + print duplicate diagnostics by name/content/path
  init      Write default sources.yaml to ~/.config/huhaa-myskills/
  purge     Remove all user data under ~/.config/huhaa-myskills/
  uninstall Stop service + uninstall global npm package (prompts before deleting user data)
  sync      Sync current skills to selected editors
  dev       Dev mode: Vite frontend hot reload (connect to backend separately)

Options:
  -v, --version       Show version
  -h, --help          Show this message
  -f, --foreground    Keep running in foreground (for debugging)

Env:
  HUHAA_HOME      override user data dir (default: ~/.config/huhaa-myskills)
  PORT            override preferred port (default: 11520, falls back +10)
  HUHAA_SYNC      comma-separated list of editors to sync (e.g. "cursor,vscode")

Paths:
  config   ${configFile()}
  cache    ${cacheFile()}
  state    ${stateFile()}
  logs     ${path.join(homeDir(), 'huhaa.log')}
`);
}

async function cmdInit() {
  ensureHomeDir();
  const dst = configFile();
  if (fs.existsSync(dst)) {
    console.log(`[init] sources.yaml already exists: ${dst}`);
    console.log('[init] not overwriting. delete it first if you want to reset.');
    return;
  }
  const tpl = path.join(REPO_ROOT, 'config', 'sources.example.yaml');
  fs.copyFileSync(tpl, dst);
  console.log(`[init] wrote ${dst}`);
  console.log('[init] edit it to add / remove sources, then run: huhaa-myskills start');
}

async function cmdPurge() {
  const dir = homeDir();
  if (!fs.existsSync(dir)) {
    console.log(`[purge] nothing to remove — ${dir} does not exist`);
    return;
  }
  fs.rmSync(dir, { recursive: true, force: true });
  console.log(`[purge] removed ${dir}`);
  console.log('[purge] code dir is untouched. delete the repo manually if needed.');
}

async function cmdStop() {
  const state = readJson(stateFile());
  if (!state || !state.pid) {
    console.log('[stop] 未发现运行中的实例（无 state.json 记录）');
    return false;
  }
  if (!isProcessRunning(state.pid)) {
    console.log('[stop] 实例未运行，清理残留状态文件');
    try { fs.unlinkSync(stateFile()); } catch {}
    return false;
  }
  try {
    process.kill(state.pid, 'SIGTERM');
    console.log(`✓ 已停止 HuHaa-MySkills (pid ${state.pid}, port ${state.port ?? '未知'})`);
  } catch (err) {
    console.error(`[stop] 停止失败: ${err.message}`);
    return false;
  }
  try { fs.unlinkSync(stateFile()); } catch {}
  return true;
}

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

async function cmdUninstall() {
  const readline = await import('node:readline');
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const question = (q) => new Promise(resolve => rl.question(q, resolve));

  const dir = homeDir();
  console.log('\n[uninstall] 即将卸载 HuHaa-MySkills，将执行以下操作：');
  console.log('  1. 停止运行中的后台服务');
  console.log(`  2. 删除用户数据目录: ${dir}`);
  console.log('  3. 卸载全局 npm 包: huhaa-myskills');
  console.log('\n⚠️  此操作不可恢复，代码仓库本身不会被删除。');

  const ans = await question('\n是否全部卸载？输入 y 确认，其它键取消: ');
  rl.close();

  if (ans.trim().toLowerCase() !== 'y') {
    console.log('[uninstall] 已取消，未做任何更改。');
    return;
  }

  // 1. 停止后台服务
  console.log('\n[1/3] 停止后台服务...');
  await cmdStop();

  // 2. 删除用户数据目录
  console.log('\n[2/3] 删除用户数据目录...');
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`✓ 已删除 ${dir}`);
  } else {
    console.log(`[uninstall] 目录不存在，跳过: ${dir}`);
  }

  // 3. 卸载全局 npm 包
  console.log('\n[3/3] 卸载全局 npm 包...');
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  await new Promise((resolve) => {
    const child = spawn(npmCmd, ['uninstall', '-g', 'huhaa-myskills'], { stdio: 'inherit' });
    child.on('close', (code) => {
      if (code === 0) console.log('✓ 已卸载全局 npm 包 huhaa-myskills');
      else console.warn(`[uninstall] npm 退出码 ${code}（若未全局安装可忽略）`);
      resolve();
    });
    child.on('error', () => {
      console.warn('[uninstall] 未找到 npm 命令，跳过全局包卸载');
      resolve();
    });
  });

  console.log('\n[uninstall] 完成 ✓');
}

async function cmdScan() {
  const { scan } = await import(path.join(PKGS_ROOT, 'scanner/src/index.mjs'));
  await ensureConfigOrInit();
  const items = await scan();
  process.stdout.write(JSON.stringify(items, null, 2) + '\n');
  console.error(`[scan] ${items.length} item(s)`);
}

async function cmdStats() {
  const { scan } = await import(path.join(PKGS_ROOT, 'scanner/src/index.mjs'));
  await ensureConfigOrInit();
  const items = await scan();

  const bySource = {};
  const byEditor = {};
  const byCategory = {};
  const byBrand = {};
  const byKind = {};
  const errors = [];
  const noDescription = [];
  const noTriggers = [];

  for (const it of items) {
    bySource[it.source] = (bySource[it.source] || 0) + 1;
    const editor = it.editor || it.source || '(none)';
    byEditor[editor] = (byEditor[editor] || 0) + 1;
    byKind[it.kind] = (byKind[it.kind] || 0) + 1;
    const cat = it.category || '(none)';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    const brand = it.brand || '(none)';
    byBrand[brand] = (byBrand[brand] || 0) + 1;
    if (it.parseError) errors.push(it);
    if (!it.description) noDescription.push(it);
    if (!it.triggers || !it.triggers.length) noTriggers.push(it);
  }

  const sortDesc = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

  console.log(`\nHuHaa-MySkills scan stats`);
  console.log(`==========================`);
  console.log(`total items:        ${items.length}`);
  console.log(`parse errors:       ${errors.length}`);
  console.log(`missing description: ${noDescription.length}`);
  console.log(`missing triggers:   ${noTriggers.length}`);

  console.log(`\nby source:`);
  for (const [k, v] of sortDesc(bySource)) console.log(`  ${k.padEnd(20)} ${v}`);

  console.log(`\nby editor:`);
  for (const [k, v] of sortDesc(byEditor)) console.log(`  ${k.padEnd(20)} ${v}`);

  console.log(`\nby kind:`);
  for (const [k, v] of sortDesc(byKind)) console.log(`  ${k.padEnd(20)} ${v}`);

  console.log(`\nby category (top 15):`);
  for (const [k, v] of sortDesc(byCategory).slice(0, 15)) {
    console.log(`  ${k.padEnd(30)} ${v}`);
  }

  console.log(`\nby brand (top 15):`);
  for (const [k, v] of sortDesc(byBrand).slice(0, 15)) {
    console.log(`  ${k.padEnd(20)} ${v}`);
  }

  if (errors.length) {
    console.log(`\nparse errors (first 5):`);
    for (const e of errors.slice(0, 5)) {
      console.log(`  - [${e.source}] ${e.name}: ${e.parseError}`);
      console.log(`      ${e.paths.abs}`);
    }
  }

  const sampleN = Math.min(8, items.length);
  if (sampleN > 0) {
    const step = Math.max(1, Math.floor(items.length / sampleN));
    console.log(`\nsample (every ${step}-th item, ${sampleN} shown):`);
    for (let i = 0; i < sampleN; i++) {
      const it = items[i * step];
      if (!it) break;
      const desc = (it.description || '(no description)').slice(0, 70);
      const trigCount = (it.triggers || []).length;
      console.log(
        `  [${it.source.padEnd(11)}] ${(it.category || '-').padEnd(20)} ` +
        `${it.name.padEnd(38)} brand=${(it.brand || '-').padEnd(14)} t=${trigCount}`
      );
      console.log(`      ${desc}`);
    }
  }

  console.log('');
}

async function cmdDuplicates() {
  const { scan } = await import(path.join(PKGS_ROOT, 'scanner/src/index.mjs'));
  await ensureConfigOrInit();
  const items = await scan();
  const byName = groupBy(items, it => `${it.source}:${it.name}`);
  const byContent = groupBy(items, it => `${it.source}:${hashShort(it.raw || it.preview || '')}`);
  const byAbs = groupBy(items, it => it.paths?.abs || '');

  const nameDups = [...byName.entries()].filter(([, arr]) => arr.length > 1);
  const contentDups = [...byContent.entries()].filter(([k, arr]) => !k.endsWith(':00000000') && arr.length > 1);
  const pathDups = [...byAbs.entries()].filter(([k, arr]) => k && arr.length > 1);

  console.log('\nHuHaa-MySkills duplicate diagnostics');
  console.log('====================================');
  console.log(`total items:          ${items.length}`);
  console.log(`duplicate names:      ${nameDups.length} groups`);
  console.log(`duplicate contents:   ${contentDups.length} groups`);
  console.log(`duplicate abs paths:  ${pathDups.length} groups`);

  printDupGroup('duplicate names (first 20)', nameDups, 20);
  printDupGroup('duplicate contents (first 20)', contentDups, 20);
  printDupGroup('duplicate paths (first 20)', pathDups, 20);
  console.log('');
}

function groupBy(items, keyFn) {
  const m = new Map();
  for (const it of items) {
    const k = keyFn(it);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(it);
  }
  return m;
}

function hashShort(text) {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  return (h >>> 0).toString(16).padStart(8, '0');
}

function printDupGroup(title, groups, limit) {
  if (!groups.length) return;
  console.log(`\n${title}:`);
  for (const [key, arr] of groups.slice(0, limit)) {
    console.log(`- ${key} (${arr.length})`);
    for (const it of arr.slice(0, 6)) {
      console.log(`    [${it.source}] ${it.name} :: ${it.paths?.abs}`);
    }
  }
}

async function cmdStart() {
  await ensureConfigOrInit();
  const isForeground = process.argv.includes('--foreground') || process.argv.includes('-f');
  const preferred = parseInt(process.env.PORT || '11520', 10);

  // 后台模式下先做幂等检查：已有实例在运行则直接返回，
  // 避免 pickPort 误判端口被占用而打印"改用其它端口"的误导信息。
  if (!isForeground) {
    try {
      const stateData = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
      if (stateData.pid && isProcessRunning(stateData.pid)) {
        const logFile = path.join(homeDir(), 'huhaa.log');
        console.log(`✓ HuHaa-MySkills 已在运行: http://localhost:${stateData.port}`);
        console.log(`📝 日志: ${logFile}`);
        return;
      }
    } catch {
      // 状态文件不存在或无效，继续正常启动流程
    }
  }

  const port = await pickPort(preferred, 10);
  if (!port) {
    console.error(`[start] ${preferred}..${preferred + 10} 范围内无空闲端口，已中止。`);
    process.exit(1);
  }
  if (port !== preferred) {
    console.warn(`[start] 端口 ${preferred} 被占用，改用 ${port}。`);
  }

  const homeDirectory = homeDir();
  const logFile = path.join(homeDirectory, 'huhaa.log');

  // 后台模式：fork 子进程
  if (!isForeground) {
    return startBackgroundServer(port, logFile, homeDirectory);
  }

  // 前台模式：直接启动
  await runServer(port, logFile, homeDirectory);
}

async function startBackgroundServer(port, logFile, homeDirectory) {
  // 检查是否已有运行的实例
  try {
    const stateData = JSON.parse(fs.readFileSync(stateFile(), 'utf8'));
    if (stateData.pid && isProcessRunning(stateData.pid)) {
      console.log(`✓ HuHaa-MySkills 已在运行: http://localhost:${stateData.port}`);
      console.log(`📝 日志: ${logFile}`);
      return;
    }
  } catch {
    // 状态文件不存在或无效，继续启动
  }

  // 打开日志文件用于输出重定向
  const logFd = fs.openSync(logFile, 'a');

  // Spawn 子进程
  const child = spawn(process.execPath, [process.argv[1], 'start', '--foreground'], {
    detached: true,
    stdio: ['ignore', logFd, logFd],
    env: {
      ...process.env,
      PORT: port.toString()
    }
  });

  child.unref();

  // 等待子进程启动，检查端口是否开放
  await new Promise(resolve => setTimeout(resolve, 1000));

  // 关闭日志文件描述符（子进程已继承）
  fs.closeSync(logFd);

  console.log(`✓ HuHaa-MySkills 已在后台运行: http://localhost:${port}`);
  console.log(`📝 日志: ${logFile}`);
  console.log(`💡 查看日志: tail -f ${logFile}`);
  console.log(`💡 停止服务: huhaa-myskills stop`);
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function runServer(port, logFile, homeDirectory) {
  writeJson(stateFile(), { port, pid: process.pid, startedAt: new Date().toISOString() });

  const { startServer } = await import(path.join(PKGS_ROOT, 'server/src/index.mjs'));
  await startServer({ port });

  console.log(`\n  HuHaa-MySkills 运行中:  http://localhost:${port}\n`);
  console.log(`  数据目录: ${homeDirectory}`);
  console.log(`  日志: ${logFile}`);
  console.log(`  按 Ctrl+C 停止。\n`);

  openBrowser(`http://localhost:${port}`);

  const cleanup = () => {
    try { fs.unlinkSync(stateFile()); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

async function cmdDev() {
  console.log('[dev] Frontend dev mode delegated to packages/web.');
  console.log('[dev] Run: npm run dev (frontend on 11521)');
  console.log('[dev] In another terminal: npm run start (backend on 11520)');
  console.log('[dev] Or: npm run restart (if backend already running)');
  process.exit(0);
}

async function cmdSync() {
  const syncEnv = process.env.HUHAA_SYNC;
  const editors = syncEnv
    ? syncEnv.split(',').map(e => e.trim().toLowerCase())
    : null;

  const { scan } = await import(path.join(PKGS_ROOT, 'scanner/src/index.mjs'));
  await ensureConfigOrInit();
  const items = await scan();

  const skills = items.filter(it => it.raw && it.raw.trim());

  console.log(`[sync] found ${skills.length} skills to sync`);

  if (editors) {
    console.log(`[sync] syncing to editors: ${editors.join(', ')}`);
    await syncToEditors(skills, editors);
  } else {
    await interactiveSync(skills);
  }
}

async function syncToEditors(skills, editors) {
  const supported = [
    'cursor', 'vscode', 'vscode-insiders', 'windsurf', 'zed', 'helix',
    'neovim', 'vim', 'emacs', 'sublime', 'sublime4', 'textmate',
    'bbedit', 'atom', 'kate', 'gedit', 'jetbrains', 'openclaw',
    'herems', 'trae', 'trae-cn', 'codex', 'claude'
  ];
  const validEditors = editors.filter(e => supported.includes(e));

  if (validEditors.length === 0) {
    console.error(`[sync] no valid editors. Supported: ${supported.join(', ')}`);
    return;
  }

  for (const editor of validEditors) {
    await syncToEditor(skills, editor);
  }
}

async function syncToEditor(skills, editor) {
  console.log(`[sync] syncing ${skills.length} skills to ${editor}...`);

  const syncScript = path.join(REPO_ROOT, 'scripts', 'sync-skills.sh');

  return new Promise((resolve) => {
    const child = spawn('bash', [syncScript, '--editor', editor], {
      stdio: ['pipe', 'inherit', 'inherit']
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log(`[sync] ${editor}: done`);
      } else {
        console.error(`[sync] ${editor}: failed (exit ${code})`);
      }
      resolve();
    });
  });
}

async function interactiveSync(skills) {
  const readline = await import('node:readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

  const allEditors = [
    'cursor', 'vscode', 'vscode-insiders', 'windsurf', 'zed', 'helix',
    'neovim', 'vim', 'emacs', 'sublime', 'sublime4', 'textmate',
    'bbedit', 'atom', 'kate', 'gedit', 'jetbrains', 'openclaw',
    'herems', 'trae', 'trae-cn', 'codex', 'claude'
  ];

  console.log(`\n[sync] found ${skills.length} skills`);
  console.log('\nSupported editors:');

  // Display editors in 3 columns
  for (let i = 0; i < allEditors.length; i += 3) {
    const line = [];
    for (let j = 0; j < 3; j++) {
      const idx = i + j + 1;
      const editor = allEditors[i + j];
      if (editor) {
        line.push(`[${idx.toString().padEnd(2)}] ${editor.padEnd(16)}`);
      }
    }
    console.log('  ' + line.join('  '));
  }

  console.log('  [0] all editors   [q] quit\n');

  const editorMap = {};
  allEditors.forEach((editor, i) => {
    editorMap[(i + 1).toString()] = editor;
  });

  const input = await question('Select editors (0/1/2/... or q): ');
  rl.close();

  if (input === 'q' || input === 'Q') {
    console.log('[sync] cancelled');
    return;
  }

  let editors = [];
  if (input === '0') {
    editors = allEditors;
  } else {
    const selected = input.split(/[,\s]+/).filter(s => s);
    editors = selected.map(s => editorMap[s]).filter(Boolean);
  }

  if (editors.length === 0) {
    console.error('[sync] no valid editors selected');
    return;
  }

  await syncToEditors(skills, editors);
}

// ---------------- helpers ----------------

async function ensureConfigOrInit() {
  if (!fs.existsSync(configFile())) {
    console.error(`[boot] no config yet, writing defaults to ${configFile()}`);
    await cmdInit();
  }
}

function openBrowser(url) {
  const platform = process.platform;
  let cmd, args;
  if (platform === 'darwin') { cmd = 'open'; args = [url]; }
  else if (platform === 'win32') { cmd = 'cmd'; args = ['/c', 'start', '', url]; }
  else { cmd = 'xdg-open'; args = [url]; }
  try {
    spawn(cmd, args, { stdio: 'ignore', detached: true }).unref();
  } catch {
    // best-effort; user can copy-paste the URL
  }
}
