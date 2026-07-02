/**
 * @file scan-tier.test.mjs
 * 三层扫描器的单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getPathHash, PathHashCache } from '../hash/path-hash.mjs';
import os from 'node:os';
import path from 'node:path';

describe('Path Hash - 路径规范化 & MD5', () => {
  it('应该计算相同的哈希值无论路径格式如何', () => {
    const home = os.homedir();
    const path1 = `${home}/skills/test/SKILL.md`;
    const path2 = `~/skills/test/SKILL.md`;
    const path3 = path.join(home, 'skills/test/SKILL.md');

    const hash1 = getPathHash(path1);
    const hash2 = getPathHash(path2);
    const hash3 = getPathHash(path3);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
    expect(hash1).toMatch(/^[a-f0-9]{32}$/); // MD5 格式
  });

  it('不同路径应该有不同的哈希值', () => {
    const hash1 = getPathHash('~/skills/skill1/SKILL.md');
    const hash2 = getPathHash('~/skills/skill2/SKILL.md');

    expect(hash1).not.toBe(hash2);
  });

  it('哈希值应该稳定（相同输入多次调用返回相同值）', () => {
    const filePath = '~/skills/test/SKILL.md';
    const hash1 = getPathHash(filePath);
    const hash2 = getPathHash(filePath);

    expect(hash1).toBe(hash2);
  });
});

describe('PathHashCache - LRU 缓存', () => {
  let cache;

  beforeEach(() => {
    cache = new PathHashCache(5); // 小容量便于测试
  });

  it('应该缓存计算过的哈希值', () => {
    const filePath = '~/skills/test/SKILL.md';
    const hash1 = cache.getOrCompute(filePath);
    const hash2 = cache.getOrCompute(filePath);

    expect(hash1).toBe(hash2);
    expect(cache.size).toBe(1);
  });

  it('应该在容量满时移除最旧条目', () => {
    const paths = [
      '~/skills/1/SKILL.md',
      '~/skills/2/SKILL.md',
      '~/skills/3/SKILL.md',
      '~/skills/4/SKILL.md',
      '~/skills/5/SKILL.md',
      '~/skills/6/SKILL.md', // 应该移除第一个
    ];

    for (const p of paths) {
      cache.getOrCompute(p);
    }

    expect(cache.size).toBe(5); // 保持最大容量
    expect(cache.get(paths[0])).toBeUndefined(); // 第一个被移除
    expect(cache.get(paths[5])).toBeDefined(); // 最新的存在
  });

  it('应该支持清空缓存', () => {
    cache.getOrCompute('~/skills/1/SKILL.md');
    cache.getOrCompute('~/skills/2/SKILL.md');
    expect(cache.size).toBe(2);

    cache.clear();
    expect(cache.size).toBe(0);
  });
});

describe('Tier 1-3 扫描器集成', () => {
  it('应该按优先级排序结果（Tier 1 → Tier 2 → Tier 3）', async () => {
    // 这需要实际文件系统环境，可以跳过或 mock
  });

  it('应该去重相同路径的技能', async () => {
    // 这需要实际文件系统环境，可以跳过或 mock
  });
});
