import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { scan, getWatchTargets, scanLegacy, loadConfig } from '../src/index.mjs';

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

function groupBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {});
}

test('scan aggregates enabled sources and strips duplicate semantic skill exports', async (t) => {
  const { root, home } = makeTempHome();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const sources = path.join(home, 'sources.yaml');
  const hermesRoot = path.join(root, 'hermes-skills');
  const codexRoot = path.join(root, 'project-a');
  const cursorRoot = path.join(root, 'project-b');
  const directorySkillsRoot = path.join(root, 'custom-skills');

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
  write(path.join(codexRoot, 'AGENTS.md'), '# Codex Instructions\\n\\nUse Node 20 and run tests.');
  write(path.join(cursorRoot, '.cursorrules'), 'Always keep UI concise.');
  write(path.join(directorySkillsRoot, 'auth-flow', 'SKILL.md'), `---
name: auth-flow
description: Custom auth flow implementation
---
# Auth Flow
`);

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
  directory-skill:
    enabled: true
    paths:
      - ${JSON.stringify(directorySkillsRoot)}
limits:
  maxFiles: 100
  maxFileBytes: 1048576
`);

  const items = await scanLegacy(loadConfig(), { maxFiles: 100, maxFileBytes: 1048576 });
  const bySource = groupBy(items, it => it.source);

  assert.equal(bySource.hermes?.length, 1, 'semantic duplicate hermes skill should collapse to one item');
  assert.equal(bySource.codex?.length, 1);
  assert.equal(bySource.cursor?.length, 1);
  assert.equal(bySource.directory?.length, 1, 'directory-skill should return one item');

  // Verify Tier 1 tool skills have tier='tier-1' (scanLegacy 把 'tool' 转成 'tier-1') and brand
  const hermesSkill = bySource.hermes[0];
  assert.equal(hermesSkill.tier, 'tier-1', 'hermes skill should have tier="tier-1"');
  assert.equal(hermesSkill.brand, 'hermes', 'hermes skill should have brand="hermes"');
  assert.equal(hermesSkill.name, 'deploy-helper');
  assert.equal(hermesSkill.editor, 'Hermes Agent');
  assert.equal(hermesSkill.category, 'devops');
  assert.deepEqual(hermesSkill.triggers, ['deploy service']);
  assert.ok(!hermesSkill.paths.abs.includes('/.hidden-export/'), 'visible export should outrank hidden duplicate');

  // Verify Tier 2 directory skills have tier='tier-2' (scanLegacy 把 'directory' 转成 'tier-2') and dirName
  const dirSkill = bySource.directory[0];
  assert.equal(dirSkill.tier, 'tier-2', 'directory-skill should have tier="tier-2"');
  assert.equal(dirSkill.dirName, 'auth-flow', 'directory-skill should have dirName="auth-flow"');
  assert.equal(dirSkill.source, 'directory', 'directory-skill should have source="directory"');
  assert.equal(dirSkill.name, 'auth-flow');
});

test('getWatchTargets includes config file plus configured source files and globs', async (t) => {
  const { root, home } = makeTempHome();
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const hermesRoot = path.join(root, 'skills');
  const directorySkillsRoot = path.join(root, 'custom-skills');
  fs.mkdirSync(hermesRoot, { recursive: true });
  fs.mkdirSync(directorySkillsRoot, { recursive: true });

  write(path.join(home, 'sources.yaml'), `sources:
  hermes:
    enabled: true
    roots:
      - ${JSON.stringify(hermesRoot)}
  directory-skill:
    enabled: true
    paths:
      - ${JSON.stringify(directorySkillsRoot)}
`);

  const targets = await getWatchTargets();
  assert.ok(targets.includes(path.join(home, 'sources.yaml')));
  assert.ok(targets.some(t => t.endsWith('/skills/**/SKILL.md')));
  assert.ok(targets.some(t => t.endsWith('/custom-skills/**/SKILL.md')));
});
