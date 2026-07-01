// Tests for the R6 real-icon logic (brand-map + icon-extractor).
// Focus on the pure/sync resolution chain — spawn-based extraction is exercised
// lightly since it depends on which apps are installed on the host.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveBrandSpec, emojiForBrand, BRAND_APP_MAP } from '../src/icon/brand-map.mjs';
import { resolveIconRef, getIconForBrand } from '../src/icon/icon-extractor.mjs';

test('resolveBrandSpec resolves known brands and raw bundle ids', () => {
  assert.ok(resolveBrandSpec('cursor'), 'cursor is a known brand');
  assert.equal(resolveBrandSpec('Cursor')?.appNames.includes('Cursor'), true, 'case-insensitive');
  // A dotted string is treated as an explicit bundle id
  const spec = resolveBrandSpec('com.example.MyApp');
  assert.deepEqual(spec?.bundleIds, ['com.example.MyApp']);
  // Unknown, non-dotted value → null
  assert.equal(resolveBrandSpec('totally-unknown-brand'), null);
  assert.equal(resolveBrandSpec(''), null);
});

test('emojiForBrand returns the mapped emoji', () => {
  assert.equal(emojiForBrand('hermes'), BRAND_APP_MAP.hermes.emoji);
  assert.equal(emojiForBrand('CLAUDE-CODE'), BRAND_APP_MAP['claude-code'].emoji);
  assert.equal(emojiForBrand('nope'), undefined);
});

test('resolveIconRef honors explicit frontmatter icon overrides', () => {
  assert.deepEqual(resolveIconRef({ icon: 'emoji:🎯' }), { iconFallback: '🎯' });
  assert.deepEqual(resolveIconRef({ icon: 'url:https://x/icon.png' }), {
    iconUrl: 'https://x/icon.png',
  });
  assert.deepEqual(resolveIconRef({ icon: 'app:com.microsoft.VSCode' }), {
    iconUrl: '/api/icons/com.microsoft.VSCode?size=64',
  });
  // Bare glyph → fallback emoji
  assert.deepEqual(resolveIconRef({ icon: '🔥' }), { iconFallback: '🔥' });
});

test('resolveIconRef maps brand/source to a real-icon URL with emoji fallback', () => {
  const ref = resolveIconRef({ brand: 'cursor' }, 64);
  assert.equal(ref.iconUrl, '/api/icons/cursor?size=64');
  assert.equal(ref.iconFallback, BRAND_APP_MAP.cursor.emoji);

  // Falls through to source when brand is absent/unmapped
  const bySource = resolveIconRef({ source: 'vs-code' }, 32);
  assert.equal(bySource.iconUrl, '/api/icons/vs-code?size=32');

  // Unknown brand → empty (frontend emoji map handles it)
  assert.deepEqual(resolveIconRef({ brand: 'made-up' }), {});
  assert.deepEqual(resolveIconRef({}), {});
});

test('resolveIconRef clamps invalid sizes to 64', () => {
  const ref = resolveIconRef({ brand: 'cursor' }, 999);
  assert.equal(ref.iconUrl, '/api/icons/cursor?size=64');
});

test('getIconForBrand returns null for an unmapped brand', async () => {
  const result = await getIconForBrand('definitely-not-an-app-xyz', 64);
  assert.equal(result, null);
});
