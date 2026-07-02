// @huhaa/server — Fastify HTTP API + placeholder UI.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import Fastify from 'fastify';
import chokidar from 'chokidar';
import { translate } from 'google-translate-api-x';
import { LABELS } from './labels.mjs';

const PHASE = 'P6';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKGS_ROOT = path.resolve(__dirname, '..', '..');
const PACKAGE_JSON = path.resolve(PKGS_ROOT, '..', 'package.json');
const VERSION = readPackageVersion();
const WEB_DIST = path.join(PKGS_ROOT, 'web', 'dist');

async function importScanner() {
  const { scan, getWatchTargets } = await import(path.join(PKGS_ROOT, 'scanner/src/index.mjs'));
  return { scan, getWatchTargets };
}

function readPackageVersion() {
  try {
    return JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8')).version || '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * 翻译文本
 * @param {string} text - 要翻译的文本
 * @param {string} targetLang - 目标语言 (默认: 'zh-CN')
 * @returns {Promise<string>} 翻译结果
 */
async function translateText(text, targetLang = 'zh-CN') {
  if (!text || !text.trim()) return '';

  try {
    const result = await translate(text, {
      to: targetLang === 'zh-CN' ? 'zh' : targetLang,
    });
    return result.text || text;
  } catch (e) {
    console.warn(`[translate] error: ${e.message}`);
    return text; // 降级返回原文本
  }
}

export async function startServer({ port = 11520 } = {}) {
  const app = Fastify({
    logger: { level: process.env.LOG_LEVEL || 'warn' },
  });

  const { scan, getWatchTargets } = await importScanner();

  // In-memory IR. HTTP handlers only read this snapshot; reload/watch swaps it atomically.
  let irCache = await scan();
  let irById = new Map(irCache.map(it => [it.id, it]));
  let reloadState = {
    scanning: false,
    pending: false,
    lastReloadAt: new Date().toISOString(),
    lastError: '',
    items: irCache.length,
    reason: 'boot',
  };
  const sseClients = new Set();
  let reloadTimer = null;
  let watcher = null;

  async function runReload(reason = 'manual') {
    if (reloadState.scanning) {
      reloadState.pending = true;
      return { ok: true, queued: true, ...reloadState };
    }

    reloadState = { ...reloadState, scanning: true, pending: false, reason, lastError: '' };
    broadcastSse('reload-start', reloadState);
    try {
      const next = await scan();
      const shouldRunAgain = reloadState.pending;
      irCache = next;
      irById = new Map(irCache.map(it => [it.id, it]));
      reloadState = {
        scanning: false,
        pending: shouldRunAgain,
        lastReloadAt: new Date().toISOString(),
        lastError: '',
        items: irCache.length,
        reason,
      };
      broadcastSse('reload-done', reloadState);
    } catch (e) {
      const shouldRunAgain = reloadState.pending;
      reloadState = {
        ...reloadState,
        scanning: false,
        pending: shouldRunAgain,
        lastReloadAt: new Date().toISOString(),
        lastError: e.message,
        items: irCache.length,
        reason,
      };
      broadcastSse('reload-error', reloadState);
    }

    if (reloadState.pending) setTimeout(() => runReload('pending'), 0);
    return { ok: !reloadState.lastError, ...reloadState };
  }

  function scheduleReload(reason) {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      runReload(reason).catch(e => app.log.warn({ err: e }, 'reload failed'));
    }, 800);
  }

  function broadcastSse(event, payload) {
    const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
    for (const reply of sseClients) {
      reply.raw.write(data);
    }
  }

  async function setupWatcher() {
    const targets = await getWatchTargets();
    if (!targets.length) return;
    watcher = chokidar.watch(targets, {
      ignoreInitial: true,
      persistent: true,
      depth: 8,
      usePolling: true,
      interval: 1500,
      binaryInterval: 3000,
      awaitWriteFinish: {
        stabilityThreshold: 250,
        pollInterval: 100,
      },
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.DS_Store',
      ],
    });
    watcher.on('all', (event, changedPath) => {
      scheduleReload(`${event}:${changedPath}`);
    });
    watcher.on('error', err => {
      reloadState = { ...reloadState, lastError: `watch: ${err.message}`, items: irCache.length };
      broadcastSse('reload-error', reloadState);
      app.log.warn({ err }, 'watcher error');
    });
    app.addHook('onClose', async () => {
      clearTimeout(reloadTimer);
      for (const reply of sseClients) reply.raw.end();
      sseClients.clear();
      if (watcher) await watcher.close();
    });
  }

  const hasSpa = fs.existsSync(path.join(WEB_DIST, 'index.html'));
  const assetsDir = path.join(WEB_DIST, 'assets');

  // ─────────────────────────── routes ─────────────────────────────────────

  app.get('/api/health', async () => ({
    ok: true,
    port,
    items: irCache.length,
    version: VERSION,
    phase: PHASE,
  }));

  app.get('/api/skills', async () => {
    // strip `raw` — detail view fetches it separately
    // v4.0: 补上 tier 和 editorBrand（如果不存在）

    return irCache.map(item => {
      const base = stripRaw(item);
      
      // 确保有 tier 字段
      if (!base.tier || base.tier === 'tool') {
        base.tier = 'tier-1'; // 默认 tier-1
      } else if (base.tier === 'directory') {
        base.tier = 'tier-2';
      } else if (base.tier === 'other') {
        base.tier = 'tier-3';
      }
      
      // 确保有 editorBrand 字段
      if (!base.editorBrand && base.source) {
        base.editorBrand = base.source;
        if (base.editorBrand === 'claude-code') base.editorBrand = 'claude';
        if (base.editorBrand === 'hermes-plugin') base.editorBrand = 'hermes';
      }
      
      // 确保有 pathHash 字段
      if (!base.pathHash && base.paths?.abs) {
        const normalized = path.resolve(base.paths.abs);
        base.pathHash = crypto.createHash('md5').update(normalized).digest('hex');
      } else if (!base.pathHash && base.id) {
        base.pathHash = base.id;
      }
      
      return base;
    });
  });

  app.get('/api/skills/:id', async (req, reply) => {
    const item = irById.get(req.params.id);
    if (!item) {
      reply.code(404);
      return { error: 'not found' };
    }
    return item;
  });

  app.get('/api/stats', async () => buildStats(irCache));

  app.get('/api/other-skills', async (req, reply) => {
    try {
      const { scanSkills } = await import('../../../packages/scanner/src/adapters/skill-adapter.mjs');
      const { resolveIconRef } = await import('../../../packages/scanner/src/icon/icon-extractor.mjs');

      // Parse query parameters
      const roots = req.query.roots
        ? req.query.roots.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const fileGlob = req.query.fileGlob || '**/SKILL.md';
      const source = req.query.source || 'other-skills';
      const stage = req.query.stage === 'mini' ? 'mini' : 'full';
      const useSpotlight = req.query.useSpotlight === '1' || req.query.useSpotlight === 'true';
      const maxFiles = Math.min(parseInt(req.query.maxFiles || '100', 10), 5000);
      const maxFileBytes = Math.min(parseInt(req.query.maxFileBytes || '1048576', 10), 10 * 1024 * 1024);

      // Validate roots
      if (!roots.length) {
        reply.code(400);
        return {
          ok: false,
          error: 'missing query parameter: roots (comma-separated paths)',
        };
      }

      // Scan skills
      const { items, stats } = await scanSkills({
        source,
        roots,
        fileGlob,
        stage,
        useSpotlight,
        limits: { maxFiles, maxFileBytes },
      });

      // Transform items to the required format. 'mini' stage returns lightweight
      // rows (fast first paint, R7.1); 'full' includes the frontmatter block.
      const skills = items.map(item => {
        const { iconUrl, iconFallback } = resolveIconRef(
          { icon: item.icon, brand: item.brand, source: item.source },
          64,
        );
        const base = {
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          kind: item.kind,
          brand: item.brand,
          path: item.paths?.abs,
          iconUrl,
          iconFallback,
        };
        if (stage === 'mini') return base;
        return {
          ...base,
          tags: item.tags,
          frontmatter: {
            title: item.title,
            triggers: item.triggers,
            links: item.links,
            product: item.product,
            editor: item.editor,
            source: item.source,
            updatedAt: item.updatedAt,
            parseError: item.parseError,
          },
        };
      });

      return {
        ok: true,
        skills,
        stats: {
          ...stats,
          scanned: items.length,
          source,
          fileGlob,
        },
      };
    } catch (e) {
      reply.code(500);
      return {
        ok: false,
        error: e.message,
      };
    }
  });

  // Real application icon for a skill's brand/source (R6). Serves a cached PNG
  // extracted from the matching .app bundle; 404 JSON when no app is found so
  // the frontend can fall back to an emoji.
  app.get('/api/icons/:brand', async (req, reply) => {
    try {
      const { getIconForBrand } = await import('../../../packages/scanner/src/icon/icon-extractor.mjs');
      const brand = decodeURIComponent(req.params.brand || '');
      const size = Math.min(Math.max(parseInt(req.query.size || '64', 10) || 64, 32), 128);
      const pngPath = await getIconForBrand(brand, size);
      if (!pngPath || !fs.existsSync(pngPath)) {
        reply.code(404);
        return { ok: false, fallback: true, brand };
      }
      reply.type('image/png');
      reply.header('cache-control', 'public, max-age=86400');
      return fs.createReadStream(pngPath);
    } catch (e) {
      reply.code(500);
      return { ok: false, error: e.message };
    }
  });

  app.get('/api/reload-state', async () => ({
    ok: !reloadState.lastError,
    ...reloadState,
  }));

  app.post('/api/reload', async () => runReload('manual'));

  app.get('/api/events', async (req, reply) => {
    reply.hijack();
    reply.raw.writeHead(200, {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache, no-transform',
      connection: 'keep-alive',
      'x-accel-buffering': 'no',
    });
    sseClients.add(reply);
    reply.raw.write(`event: hello\ndata: ${JSON.stringify({ ok: true, ...reloadState })}\n\n`);
    req.raw.on('close', () => {
      sseClients.delete(reply);
    });
  });

  app.post('/api/copy', async (req, reply) => {
    const { id, what } = req.body || {};
    const item = irById.get(id);
    if (!item) {
      reply.code(404);
      return { ok: false, error: 'not found' };
    }
    const text = pickCopyText(item, what);
    if (text == null) {
      reply.code(400);
      return { ok: false, error: `invalid 'what': ${what}` };
    }
    try {
      await pbcopy(text);
      return { ok: true, bytes: Buffer.byteLength(text), what };
    } catch (e) {
      reply.code(500);
      return { ok: false, error: e.message };
    }
  });

  app.post('/api/open', async (req, reply) => {
    const { id, with: openWith = 'default' } = req.body || {};
    const item = irById.get(id);
    if (!item) {
      reply.code(404);
      return { ok: false, error: 'not found' };
    }
    const abs = item.paths?.abs;
    if (!abs) {
      reply.code(400);
      return { ok: false, error: 'item has no path' };
    }
    try {
      await openPath(abs, openWith);
      return { ok: true, opened: abs, with: openWith };
    } catch (e) {
      reply.code(500);
      return { ok: false, error: e.message };
    }
  });

  app.post('/api/translate', async (req, reply) => {
    const { text, targetLang = 'zh-CN', id } = req.body || {};

    // 新模式：直接翻译文本（前端使用）
    if (text) {
      try {
        const translated = await translateText(text, targetLang);
        return { ok: true, result: translated, targetLang };
      } catch (e) {
        reply.code(500);
        return { ok: false, error: e.message };
      }
    }

    // 旧模式：翻译技能对象（保持向后兼容）
    if (id) {
      const item = irById.get(id);
      if (!item) {
        reply.code(404);
        return { error: 'not found' };
      }

      const { translateSkill } = await import('./translator.mjs');
      try {
        const translated = await translateSkill(item, 'zh');
        return translated;
      } catch (e) {
        reply.code(500);
        return { error: e.message };
      }
    }

    reply.code(400);
    return { ok: false, error: 'missing text or id parameter' };
  });

  app.get('/assets/*', async (req, reply) => {
    if (!hasSpa) {
      reply.code(404);
      return { error: 'web assets not built' };
    }
    const rel = decodeURIComponent(req.params['*'] || '');
    const abs = path.resolve(assetsDir, rel);
    if (!abs.startsWith(assetsDir + path.sep) || !fs.existsSync(abs) || !fs.statSync(abs).isFile()) {
      reply.code(404);
      return { error: 'asset not found' };
    }
    reply.type(contentTypeFor(abs));
    return fs.createReadStream(abs);
  });

  // Serve built Vue SPA if present; fallback to P2 placeholder when the user
  // has not run `npm run build:web` yet.
  app.get('/', async (req, reply) => {
    if (hasSpa) {
      reply.type('text/html; charset=utf-8');
      return fs.readFileSync(path.join(WEB_DIST, 'index.html'), 'utf8');
    }
    reply.type('text/html; charset=utf-8');
    return placeholderHtml({ port, items: irCache });
  });

  // SPA fallback for deep links (P3+). Keep /api/* above this route.
  app.get('/*', async (req, reply) => {
    if (hasSpa) {
      reply.type('text/html; charset=utf-8');
      return fs.readFileSync(path.join(WEB_DIST, 'index.html'), 'utf8');
    }
    reply.code(404);
    return { error: 'not found' };
  });

  await setupWatcher();

  await app.listen({ port, host: '127.0.0.1' });
  return { app, port };
}

// ─────────────────────────────── helpers ─────────────────────────────────

function stripRaw({ raw, ...rest }) {
  return rest;
}

function contentTypeFor(abs) {
  if (abs.endsWith('.js')) return 'text/javascript; charset=utf-8';
  if (abs.endsWith('.css')) return 'text/css; charset=utf-8';
  if (abs.endsWith('.json')) return 'application/json; charset=utf-8';
  if (abs.endsWith('.svg')) return 'image/svg+xml';
  if (abs.endsWith('.png')) return 'image/png';
  if (abs.endsWith('.jpg') || abs.endsWith('.jpeg')) return 'image/jpeg';
  if (abs.endsWith('.woff2')) return 'font/woff2';
  return 'application/octet-stream';
}

function pickCopyText(item, what) {
  switch (what) {
    case 'path': return item.paths?.abs ?? null;
    case 'dir':  return item.paths?.abs ? path.dirname(item.paths.abs) : null;
    case 'rel':  return item.paths?.rel ?? item.paths?.abs ?? null;
    case 'name': return item.name ?? null;
    case 'raw':  return item.raw ?? '';
    case 'prompt': return buildInvocationPrompt(item);
    default:     return null;
  }
}

function buildInvocationPrompt(item) {
  const name = item.name || item.title || 'unknown';
  const abs = item.paths?.abs || '';
  // v4.0 tier 扫描器把来源标签放在 item.brand（source 现在是内部扫描来源如 'tier1-editor'），
  // 因此优先按 brand 判断，回退到 source 以兼容旧 IR。
  const brand = item.brand || '';
  const source = item.source || '';
  if (brand === 'hermes' || source === 'hermes') {
    return `Use Hermes skill ${name}: skill_view(name='${escapeSingle(name)}')`;
  }
  if (brand === 'claude' || source === 'claude-code') {
    return `Use Claude Code skill ${name}. Local path: ${abs}`;
  }
  if (brand === 'codex' || source === 'codex') {
    return `Use Codex instructions from ${abs}`;
  }
  if (brand === 'cursor' || source === 'cursor') {
    return `Use Cursor rule ${name}. Local path: ${abs}`;
  }
  if (item.kind === 'mcp') {
    return `Use MCP server/tool ${name}. Config source: ${abs}`;
  }
  if (item.kind === 'runbook') {
    return `Use runbook ${name}. Local path: ${abs}`;
  }
  return `Use ${item.kind || 'skill'} ${name}. Local path: ${abs}`;
}

function escapeSingle(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function pbcopy(text) {
  return new Promise((resolve, reject) => {
    const platform = process.platform;
    let cmd, args;
    if (platform === 'darwin') {
      cmd = 'pbcopy'; args = [];
    } else if (platform === 'linux') {
      // best-effort; user installs xclip/wl-copy themselves
      cmd = 'xclip'; args = ['-selection', 'clipboard'];
    } else if (platform === 'win32') {
      cmd = 'clip'; args = [];
    } else {
      return reject(new Error(`clipboard not supported on ${platform}`));
    }
    const child = spawn(cmd, args, { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', d => { stderr += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exit ${code}: ${stderr.trim()}`));
    });
    child.stdin.end(text);
  });
}

function openPath(absPath, openWith) {
  return new Promise((resolve, reject) => {
    let cmd, args;
    if (openWith === 'cursor') {
      cmd = 'cursor'; args = [absPath];
    } else if (openWith === 'finder') {
      // macOS only — reveal in Finder
      cmd = 'open'; args = ['-R', absPath];
    } else {
      // 'default' — let OS pick
      const p = process.platform;
      if (p === 'darwin')      { cmd = 'open';     args = [absPath]; }
      else if (p === 'win32')  { cmd = 'cmd';      args = ['/c', 'start', '', absPath]; }
      else                     { cmd = 'xdg-open'; args = [absPath]; }
    }
    const child = spawn(cmd, args, { stdio: 'ignore', detached: true });
    child.on('error', reject);
    // detach + don't wait — opening apps shouldn't block the request
    child.unref();
    // resolve next tick — if the binary doesn't exist, 'error' fires before that
    setTimeout(resolve, 50);
  });
}

function buildStats(items) {
  const bySource = {};
  const byEditor = {};
  const byCategory = {};
  const byBrand = {};
  const byKind = {};
  for (const it of items) {
    bySource[it.source] = (bySource[it.source] || 0) + 1;
    const editor = it.editor || it.source || '(none)';
    byEditor[editor] = (byEditor[editor] || 0) + 1;
    byKind[it.kind] = (byKind[it.kind] || 0) + 1;
    const cat = it.category || '(none)';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    const brand = it.brand || '(none)';
    byBrand[brand] = (byBrand[brand] || 0) + 1;
  }
  return {
    total: items.length,
    bySource,
    byEditor,
    byKind,
    byCategory,
    byBrand,
    labels: LABELS,
  };
}

// ─────────────────────────────── placeholder UI ──────────────────────────
//
// P2 placeholder is more than a sign — it lists the first 50 skills and
// wires the copy / open buttons. Goal: even before P3 (Vue), we want to
// click around and confirm the API actually works against real skills.

function placeholderHtml({ port, items }) {
  const sample = items.slice(0, 50);
  const total = items.length;
  const rows = sample.map(it => {
    const desc = (it.description || '').replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c])).slice(0, 140);
    const brand = it.brand ? `<span class="brand">${escape(it.brand)}</span>` : '';
    const cat = it.category ? `<span class="cat">${escape(it.category)}</span>` : '';
    return `
      <div class="row" data-id="${it.id}">
        <div class="head">
          <span class="src src-${it.source}">${it.source}</span>
          ${cat}
          ${brand}
          <strong>${escape(it.name)}</strong>
        </div>
        <div class="desc">${desc || '<em class="muted">（无描述）</em>'}</div>
        <div class="path"><code>${escape(it.paths?.abs || '')}</code></div>
        <div class="actions">
          <button data-act="copy-path">Copy path</button>
          <button data-act="copy-name">Copy name</button>
          <button data-act="copy-raw">Copy raw</button>
          <button data-act="open-cursor">Open in Cursor</button>
          <button data-act="open-finder">Reveal</button>
        </div>
      </div>`;
  }).join('\n');

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>HuHaa-MySkills · P2</title>
<style>
  :root { color-scheme: light dark; }
  body { font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif;
         max-width: 1080px; margin: 32px auto; padding: 0 24px; color: #222;
         line-height: 1.55; }
  h1 { margin: 0 0 4px; }
  .meta { color: #888; font-size: 13px; margin-bottom: 24px; }
  .meta a { color: #06f; }
  .row { padding: 14px 16px; border: 1px solid #e5e5e5; border-radius: 8px;
         margin-bottom: 10px; background: #fafafa; }
  .head { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 4px; }
  .head strong { font-size: 15px; }
  .src { font-size: 11px; padding: 1px 8px; border-radius: 10px; color: #fff;
         font-weight: 600; letter-spacing: .3px; }
  .src-hermes { background: #4a5fc7; }
  .src-claude-code { background: #c98a3f; }
  .cat { font-size: 11px; padding: 1px 6px; background: #eef0ff; color: #335; border-radius: 4px; }
  .brand { font-size: 11px; padding: 1px 6px; background: #efe; color: #353; border-radius: 4px; }
  .desc { font-size: 13px; color: #444; }
  .path code { font-size: 11px; color: #888; background: transparent; padding: 0; }
  .actions { margin-top: 8px; display: flex; gap: 6px; flex-wrap: wrap; }
  .actions button { font-size: 12px; padding: 4px 10px; border: 1px solid #ddd;
                    background: #fff; border-radius: 5px; cursor: pointer; }
  .actions button:hover { background: #eef; border-color: #99c; }
  .actions button.flash { background: #cfc; border-color: #393; }
  .actions button.err { background: #fcc; border-color: #c33; }
  .muted { color: #aaa; }
</style>
</head>
<body>
  <h1>HuHaa-MySkills <span style="font-size:13px;color:#888">P2</span></h1>
  <div class="meta">
    本地聚合中枢 · ${total} 条 skill 已加载 · 显示前 ${sample.length} 条 ·
    <a href="/api/skills">/api/skills</a> ·
    <a href="/api/stats">/api/stats</a> ·
    <a href="/api/health">/api/health</a><br>
    <span class="muted">P3 接 Vue SPA。当前页是占位 — 但复制/打开按钮已经能用。</span>
  </div>
  <div id="list">${rows}</div>

<script>
async function api(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

document.getElementById('list').addEventListener('click', async ev => {
  const btn = ev.target.closest('button[data-act]');
  if (!btn) return;
  const row = btn.closest('.row');
  const id = row.dataset.id;
  const act = btn.dataset.act;
  const orig = btn.textContent;
  btn.disabled = true;
  try {
    let r;
    if (act.startsWith('copy-')) {
      r = await api('/api/copy', { id, what: act.slice(5) });
    } else if (act === 'open-cursor') {
      r = await api('/api/open', { id, with: 'cursor' });
    } else if (act === 'open-finder') {
      r = await api('/api/open', { id, with: 'finder' });
    }
    btn.classList.add(r && r.ok ? 'flash' : 'err');
    btn.textContent = r && r.ok ? '✓ ' + orig : '✗ ' + (r && r.error || 'fail');
  } catch (e) {
    btn.classList.add('err');
    btn.textContent = '✗ ' + e.message;
  }
  setTimeout(() => {
    btn.classList.remove('flash', 'err');
    btn.textContent = orig;
    btn.disabled = false;
  }, 1200);
});
</script>
</body>
</html>`;
}

function escape(s) {
  return String(s == null ? '' : s).replace(/[<>&"']/g, c => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
  }[c]));
}
