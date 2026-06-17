import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { scan, getWatchTargets } from '../src/index.mjs';

function makeTempHome() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'huhaa-scanner-test-'));
  const home = path.join(root, 'home');
  fs.mkdirSync(home, { recursive: true });
  process.env.HUHAA_HOME = home;
  return { root, home };
}

function write(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text);
}

test('scan aggregates enabled sources, strips duplicate semantic skill exports, and redacts MCP secrets', async (t) => {
  const { root, home } = makeTempHome();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const sources = path.join(home, 'sources.yaml');
  const hermesRoot = path.join(root, 'hermes-skills');
  const codexRoot = path.join(root, 'project-a');
  const cursorRoot = path.join(root, 'project-b');
  const mcpFile = path.join(root, 'mcp.json');

  write(path.join(hermesRoot, 'devops', 'deploy-helper', 'SKILL.md'), `---
name: deploy-helper
description: Deploy helper for Docker services
triggers:
  - deploy service
---
# Deploy helper
Use this when deploying Docker services.
`);
  write(path.join(hermesRoot, '.hidden-export', 'deploy-helper', 'SKILL.md'), `---
name: deploy-helper
description: Duplicate hidden export
---
# Duplicate hidden export
`);
  write(path.join(codexRoot, 'AGENTS.md'), '# Codex Instructions\n\nUse Node 20 and run tests.');
  write(path.join(cursorRoot, '.cursorrules'), 'Always keep UI concise.');
  write(mcpFile, JSON.stringify({
    mcpServers: {
      dangerous: {
        command: 'node',
        args: ['server.js'],
        env: {
          API_TOKEN: 'fake-token-value-for-redaction-test',
          normal: 'visible',
        },
        url: 'https://example.com/mcp?token=secret-value',
      },
    },
  }, null, 2));

  write(sources, `sources:
  hermes:
    enabled: true
    roots:
      - ${JSON.stringify(hermesRoot)}
  codex:
    enabled: true
    roots:
      - ${JSON.stringify(codexRoot)}
  cursor:
    enabled: true
    roots:
      - ${JSON.stringify(cursorRoot)}
  mcp-config:
    enabled: true
    files:
      - ${JSON.stringify(mcpFile)}
limits:
  maxFiles: 100
  maxFileBytes: 1048576
`);

  const items = await scan();
  const bySource = Object.groupBy(items, it => it.source);

  assert.equal(bySource.hermes?.length, 1, 'semantic duplicate hermes skill should collapse to one item');
  assert.equal(bySource.codex?.length, 1);
  assert.equal(bySource.cursor?.length, 1);
  assert.equal(bySource['mcp-config']?.length, 1);

  const skill = bySource.hermes[0];
  assert.equal(skill.name, 'deploy-helper');
  assert.equal(skill.editor, 'Hermes Agent');
  assert.equal(skill.category, 'devops');
  assert.deepEqual(skill.triggers, ['deploy service']);
  assert.ok(!skill.paths.abs.includes('/.hidden-export/'), 'visible export should outrank hidden duplicate');

  const mcp = bySource['mcp-config'][0];
  assert.equal(mcp.kind, 'mcp');
  assert.equal(mcp.name, 'dangerous');
  assert.match(mcp.raw, /\[REDACTED\]/);
  assert.doesNotMatch(mcp.raw, /fake-token-value-for-redaction-test/);
  assert.doesNotMatch(mcp.raw, /secret-value/);
  assert.match(mcp.raw, /visible/);
});

test('getWatchTargets includes config file plus configured source files and globs', async (t) => {
  const { root, home } = makeTempHome();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const hermesRoot = path.join(root, 'skills');
  const mcpFile = path.join(root, 'mcp.json');
  fs.mkdirSync(hermesRoot, { recursive: true });
  write(mcpFile, '{}');
  write(path.join(home, 'sources.yaml'), `sources:
  hermes:
    enabled: true
    roots:
      - ${JSON.stringify(hermesRoot)}
  mcp-config:
    enabled: true
    files:
      - ${JSON.stringify(mcpFile)}
`);

  const targets = await getWatchTargets();
  assert.ok(targets.includes(path.join(home, 'sources.yaml')));
  assert.ok(targets.includes(mcpFile));
  assert.ok(targets.some(t => t.endsWith('/skills/**/SKILL.md')));
});
