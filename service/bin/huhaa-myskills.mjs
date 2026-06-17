#!/usr/bin/env node
// huhaa-myskills CLI
//
// Subcommands:
//   start   — scan + start server + open browser
//   scan    — scan only, dump IR JSON to stdout
//   init    — write default sources.yaml to ~/.config/huhaa-myskills/
//   purge   — delete ~/.config/huhaa-myskills/ (zero-residue uninstall helper)
//   dev     — dev mode (P3+ wires Vite + nodemon)
//
// All user-side state lives under HUHAA_HOME (defaults to ~/.config/huhaa-myskills).

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

import {
  homeDir,
  configFile,
  cacheFile,
  stateFile,
  ensureHomeDir,
  writeJson,
} from './lib/paths.mjs';
import { pickPort } from './lib/port.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// bin/ -> service/ -> repo root
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SERVICE_ROOT = path.resolve(__dirname, '..');

const cmd = process.argv[2] || 'start';

const handlers = {
  start: cmdStart,
  scan: cmdScan,
  stats: cmdStats,
  duplicates: cmdDuplicates,
  init: cmdInit,
  purge: cmdPurge,
  dev: cmdDev,
  help: cmdHelp,
  '--help': cmdHelp,
  '-h': cmdHelp,
};

const fn = handlers[cmd] || cmdHelp;
fn().catch(err => {
  console.error('[huhaa-myskills] error:', err && err.stack || err);
  process.exit(1);
});

// ---------------- handlers ----------------

async function cmdHelp() {
  console.log(`huhaa-myskills — local skill / plugin / MCP aggregation hub

Usage:
  huhaa-myskills <command>

Commands:
  start     Scan + start server + open browser (default)
  scan      Scan only, dump IR JSON to stdout
  stats     Scan + print human-readable summary (counts / brands / errors / samples)
  duplicates Scan + print duplicate diagnostics by name/content/path
  init      Write default sources.yaml to ~/.config/huhaa-myskills/
  purge     Remove all user data under ~/.config/huhaa-myskills/
  dev       Dev mode (Vite + nodemon)
  help      Show this message

Env:
  HUHAA_HOME      override user data dir (default: ~/.config/huhaa-myskills)
  PORT            override preferred port (default: 11520, falls back +10)

Paths:
  config   ${configFile()}
  cache    ${cacheFile()}
  state    ${stateFile()}
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
  const tpl = path.join(SERVICE_ROOT, 'config', 'sources.example.yaml');
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

async function cmdScan() {
  // P0 placeholder. P1 wires real adapters.
  const { scan } = await import('@huhaa/scanner');
  await ensureConfigOrInit();
  const items = await scan();
  process.stdout.write(JSON.stringify(items, null, 2) + '\n');
  console.error(`[scan] ${items.length} item(s)`);
}

async function cmdStats() {
  const { scan } = await import('@huhaa/scanner');
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

  // deterministic-ish sample: every Nth item so coverage spans both sources
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
  const { scan } = await import('@huhaa/scanner');
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
  const preferred = parseInt(process.env.PORT || '11520', 10);
  const port = await pickPort(preferred, 10);
  if (!port) {
    console.error(`[start] no free port in ${preferred}..${preferred + 10}, abort.`);
    process.exit(1);
  }
  if (port !== preferred) {
    console.error(`[start] port ${preferred} busy, using ${port} instead.`);
  }

  // Persist actual port for any tooling that wants to know.
  writeJson(stateFile(), { port, pid: process.pid, startedAt: new Date().toISOString() });

  const { startServer } = await import('@huhaa/server');
  await startServer({ port });

  console.log(`\n  HuHaa-MySkills running:  http://localhost:${port}\n`);
  console.log(`  data dir: ${homeDir()}`);
  console.log(`  Ctrl+C to stop.\n`);

  // Auto-open browser on macOS / linux / win
  openBrowser(`http://localhost:${port}`);

  // Cleanup state file on exit so a stale port number doesn't linger.
  const cleanup = () => {
    try { fs.unlinkSync(stateFile()); } catch {}
    process.exit(0);
  };
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
}

async function cmdDev() {
  // P3+ wires Vite + nodemon. For now alias to start.
  console.log('[dev] dev mode comes in P3. running start for now.');
  await cmdStart();
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
