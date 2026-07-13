#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'skillhelper-pack-smoke-'));
const packDir = path.join(tempRoot, 'pack');
const installRoot = path.join(tempRoot, 'install');
const home = path.join(tempRoot, 'home');
const childOutput = [];
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));

fs.mkdirSync(packDir, { recursive: true });
fs.mkdirSync(installRoot, { recursive: true });
fs.mkdirSync(home, { recursive: true });

function run(name, args, options = {}) {
  console.log(`\n[pack-smoke] $ ${name} ${args.join(' ')}`);
  const res = spawnSync(name, args, {
    cwd: repoRoot,
    stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
    env: options.env || process.env,
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    if (options.capture) {
      process.stdout.write(res.stdout || '');
      process.stderr.write(res.stderr || '');
    }
    throw new Error(`${name} ${args.join(' ')} failed with exit ${res.status}`);
  }
  return res;
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

async function getFreePort() {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => resolve(address.port));
    });
  });
}

async function waitForHealth(base, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = '';
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${base}/api/health`);
      const text = await res.text();
      if (res.ok) {
        const body = JSON.parse(text);
        if (body.ok === true) return body;
      }
      lastError = `${res.status}: ${text}`;
    } catch (err) {
      lastError = err.message;
    }
    await new Promise(resolve => setTimeout(resolve, 250));
  }
  throw new Error(`health check timed out: ${lastError}`);
}

async function waitForChildClose(child) {
  if (child.exitCode != null || child.signalCode != null) return;
  await new Promise(resolve => {
    const timer = setTimeout(resolve, 2000);
    child.once('close', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function assertTarballEntries(tarball) {
  const res = run('tar', ['-tf', tarball], { capture: true });
  const entries = res.stdout.trim().split(/\r?\n/).filter(Boolean);
  assert.ok(entries.length > 0, 'tarball should not be empty');

  const forbidden = entries.filter(entry =>
    entry.includes('/node_modules/') ||
    entry.includes('/.vite/') ||
    entry.endsWith('/node_modules') ||
    entry.endsWith('/.vite')
  );
  assert.deepEqual(forbidden, [], 'tarball must not contain node_modules or .vite cache');

  for (const required of [
    'package/packages/web/dist/index.html',
    'package/packages/web/dist/favicon.ico',
    'package/packages/web/dist/site.webmanifest',
    'package/packages/web/public/favicon.ico',
    'package/packages/server/src/index.mjs',
    'package/packages/scanner/src/index.mjs',
  ]) {
    assert.ok(entries.includes(required), `tarball missing ${required}`);
  }
}

async function assertInstalledCli(tarball) {
  run('npm', ['install', '--prefix', installRoot, '--silent', '--omit=dev', tarball]);

  const bin = path.join(installRoot, 'node_modules', '.bin', 'skillhelper');
  const version = run(bin, ['--version'], { capture: true });
  assert.match(version.stdout, new RegExp(`^skillhelper v${escapeRegExp(pkg.version)}`, 'm'));

  write(path.join(home, '.hermes', 'skills', 'pack-smoke', 'SKILL.md'), `---
name: pack-smoke
description: Pack smoke skill
---
# Pack smoke skill
`);
  write(path.join(home, 'sources.yaml'), `limits:
  maxFiles: 100
  maxFileBytes: 1048576
`);

  const port = await getFreePort();
  const base = `http://127.0.0.1:${port}`;
  const env = {
    ...process.env,
    HOME: home,
    SKILLHELPER_HOME: home,
    SKILLHELPER_NO_OPEN: '1',
    LOG_LEVEL: 'error',
    PORT: String(port),
  };
  const child = spawn(bin, ['start', '--foreground'], {
    cwd: installRoot,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout.on('data', data => childOutput.push(data.toString()));
  child.stderr.on('data', data => childOutput.push(data.toString()));

  try {
    const health = await waitForHealth(base, 15000);
    assert.equal(health.ok, true);
    assert.equal(health.version, pkg.version);

    const icon = await fetch(`${base}/favicon.ico`);
    const bytes = Buffer.from(await icon.arrayBuffer());
    assert.equal(icon.ok, true);
    assert.equal((icon.headers.get('content-type') || '').split(';')[0], 'image/x-icon');
    assert.deepEqual([...bytes.subarray(0, 4)], [0x00, 0x00, 0x01, 0x00]);
  } catch (err) {
    const tail = childOutput.join('').trim().split(/\r?\n/).slice(-60).join('\n');
    throw new Error(`${err.message}\n\nCLI output:\n${tail}`);
  } finally {
    if (child.exitCode == null && child.signalCode == null) {
      child.kill('SIGTERM');
    }
    await waitForChildClose(child);
  }
}

async function main() {
  try {
    run('npm', ['pack', '--pack-destination', packDir]);
    const tarballs = fs.readdirSync(packDir)
      .filter(name => name.endsWith('.tgz'))
      .map(name => path.join(packDir, name));
    assert.equal(tarballs.length, 1, 'npm pack should create exactly one tarball');
    const tarball = tarballs[0];

    assertTarballEntries(tarball);
    await assertInstalledCli(tarball);
    console.log('\n[pack-smoke] PASS tarball contents + installed CLI smoke');
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

main().catch(err => {
  console.error('\n[pack-smoke] FAIL');
  console.error(err && err.stack || err);
  process.exit(1);
});
