<script setup>
import { computed, onMounted, ref } from 'vue';
import MarkdownIt from 'markdown-it';
import { useSkillsStore } from './stores/skills.js';
import { useI18nStore } from './stores/i18n.js';
import { translateText, getCacheStats } from './lib/translator.js';
import { getSourceBranding, getBrandColor } from './lib/branding.js';
import SkillTree from './components/SkillTree.vue';
import DirectoryTree from './components/DirectoryTree.vue';
import AppTree from './components/AppTree.vue';

const store = useSkillsStore();
const i18n = useI18nStore();
const t = i18n.t;
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const viewMode = ref('list');
const translating = ref(false);
const translatedFields = ref({});
const listCollapsed = ref(false);
const showMoreFilters = ref(false);

const viewModeLabel = computed(() => {
  const labels = {
    'list': '列表',
    'tree': '分类',
    'path-tree': '目录结构',
    'app-tree': '应用分组',
  };
  return labels[viewMode.value] || '列表';
});

onMounted(() => {
  store.load();
  window.addEventListener('keydown', handleKeydown);
});

const detailHtml = computed(() => {
  const raw = store.selected?.raw || store.selected?.preview || '';
  return md.render(raw);
});

const activeFilterChips = computed(() => {
  const chips = [];
  if (store.filters.editor) chips.push({ key: 'editor', label: t('editor'), value: getLabel('editor', store.filters.editor) });
  if (store.filters.kind) chips.push({ key: 'kind', label: t('kind'), value: getLabel('kind', store.filters.kind) });
  if (store.filters.source) chips.push({ key: 'source', label: t('source'), value: getLabel('source', store.filters.source) });
  if (store.filters.product) chips.push({ key: 'product', label: t('product'), value: store.filters.product });
  if (store.filters.brand) chips.push({ key: 'brand', label: t('brand'), value: getLabel('brand', store.filters.brand) });
  if (store.query.trim()) chips.push({ key: 'query', label: 'q', value: store.query.trim() });
  return chips;
});

const detailMeta = computed(() => {
  const s = store.selected || {};
  return [
    [t('editor'), getLabel('editor', s.editor || s.source)],
    [t('source'), getLabel('source', s.source)],
    [t('kind'), getLabel('kind', s.kind)],
    [t('product'), s.product],
    [t('brand'), getLabel('brand', s.brand)],
    [t('category'), getLabel('category', s.category || t('uncategorized'))],
    [t('rootKind'), s.paths?.rootKind],
    [t('relativePath'), s.paths?.rel],
    [t('fileSize'), formatBytes((s.raw || s.preview || '').length)],
    [t('updated'), s.updatedAt],
  ].filter(([, value]) => value);
});

const detailBadges = computed(() => {
  const s = store.selected || {};
  const badges = [
    getLabel('kind', s.kind),
    getLabel('source', s.source),
    getLabel('editor', s.editor),
    getLabel('product', s.product),
    getLabel('brand', s.brand),
  ].filter(Boolean);
  if (s.raw?.includes('[REDACTED]') || s.preview?.includes('[REDACTED]')) badges.push(t('redacted'));
  if (s.parseError) badges.push(t('parseError'));
  return [...new Set(badges)];
});

const usagePrompt = computed(() => buildUsagePrompt(store.selected));

const filteredSources = computed(() => {
  const all = store.filterSources;
  return showMoreFilters.value ? all : all.slice(0, 3);
});

function buildUsagePrompt(item) {
  if (!item) return '';

  const locale = i18n.locale;
  const name = i18n.skillText(item, 'name');
  const path = item.paths?.abs || '';
  const source = item.source || '';

  const templates = {
    zh: {
      hermes: `使用 Hermes 技能 ${name}：skill_view(name='${name}')`,
      'claude-code': `使用 Claude Code 技能 ${name}。本地路径：${path}`,
      codex: `使用 Codex 指令。路径：${path}`,
      cursor: `使用 Cursor 规则 ${name}。路径：${path}`,
      'mcp-config': `使用 MCP 工具 ${name}。配置：${path}`,
      'project-runbook': `使用项目手册 ${name}。路径：${path}`,
      'hermes-plugin': `使用 Hermes 插件 ${name}。路径：${path}`,
      'skills': `使用技能 ${name}。路径：${path}`,
      'mcp': `使用 MCP ${name}。路径：${path}`,
      default: `使用 ${name}。路径：${path}`,
    },
    en: {
      hermes: `Use Hermes skill ${name}: skill_view(name='${name}')`,
      'claude-code': `Use Claude Code skill ${name}. Local path: ${path}`,
      codex: `Use Codex instructions. Path: ${path}`,
      cursor: `Use Cursor rule ${name}. Path: ${path}`,
      'mcp-config': `Use MCP tool ${name}. Config: ${path}`,
      'project-runbook': `Use runbook ${name}. Path: ${path}`,
      'hermes-plugin': `Use Hermes plugin ${name}. Path: ${path}`,
      'skills': `Use skill ${name}. Path: ${path}`,
      'mcp': `Use MCP ${name}. Path: ${path}`,
      default: `Use ${name}. Path: ${path}`,
    },
  };

  const localizedTemplates = templates[locale] || templates.en;
  return localizedTemplates[source] || localizedTemplates.default;
}

function clearFilterChip(key) {
  if (key === 'query') {
    store.query = '';
    return;
  }
  store.setFilter(key, '');
}

function highlighted(text) {
  const source = String(text || '');
  const terms = searchTerms(store.query);
  if (!terms.length) return escapeHtml(source);
  const escapedTerms = terms
    .filter(term => term.length >= 2)
    .map(escapeRegExp);
  if (!escapedTerms.length) return escapeHtml(source);
  const re = new RegExp(`(${escapedTerms.join('|')})`, 'ig');
  return escapeHtml(source).replace(re, '<mark>$1</mark>');
}

function searchTerms(q) {
  return (q || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function handleKeydown(e) {
  if (e.key === 'Escape') {
    store.selected = null;
  }
}

function selectSkill(skill) {
  store.selected = skill;
}

function copyPath(path) {
  if (!path) return;
  navigator.clipboard.writeText(path).then(() => {
    alert('路径已复制到剪贴板');
  });
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getLabel(key, value) {
  if (!value) return '';
  return i18n.t(key === 'editor' ? 'editor' : key === 'kind' ? 'kind' : key === 'source' ? 'source' : key === 'product' ? 'product' : key === 'brand' ? 'brand' : key === 'category' ? 'category' : value) || value;
}
</script>

<template>
  <div class="shell-v2">
    <!-- 顶部搜索栏 -->
    <header class="topbar-v2">
      <div class="search-section">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="store.query"
            type="search"
            :placeholder="t('searchPlaceholder')"
            class="search-input"
          />
          <button
            v-if="store.query"
            class="search-clear-btn"
            @click="store.query = ''"
            title="清空搜索"
          >✕</button>
        </div>
      </div>

      <div class="action-buttons">
        <button
          class="btn-action"
          @click="store.clearFilters"
          title="清除所有过滤"
        >清空</button>
        <button
          class="btn-action btn-action-primary"
          :disabled="store.reloadState?.scanning"
          @click="store.reload({ done: t('reloadDone') })"
        >
          {{ store.reloadState?.scanning ? '扫描中...' : '重新扫描' }}
        </button>
      </div>
    </header>

    <!-- 快速过滤 Chips -->
    <div class="filter-chips-section">
      <div class="chips-container">
        <!-- 来源快速选择 -->
        <button
          v-for="source in filteredSources"
          :key="`src-${source.name}`"
          class="chip"
          :class="{ 'chip-active': store.filters.source === source.name }"
          @click="store.setFilter('source', store.filters.source === source.name ? '' : source.name)"
        >
          {{ getSourceBranding(source.name).icon }} {{ getLabel('source', source.name) }} ({{ source.count }})
        </button>

        <!-- 更多过滤按钮 -->
        <button
          v-if="store.filterSources.length > 3"
          class="chip chip-more"
          @click="showMoreFilters = !showMoreFilters"
        >
          {{ showMoreFilters ? '收起' : '+更多' }} ({{ store.filterSources.length - 3 }})
        </button>

        <!-- 活跃过滤条件显示 -->
        <div v-if="activeFilterChips.length" class="active-filters">
          <span class="filters-label">活跃过滤:</span>
          <button
            v-for="chip in activeFilterChips"
            :key="`${chip.key}-${chip.value}`"
            class="chip-filter"
          >
            {{ chip.value }}
            <button
              class="chip-remove"
              @click.stop="clearFilterChip(chip.key)"
            >✕</button>
          </button>
        </div>
      </div>
    </div>

    <!-- 主要布局：列表 + 侧面板 -->
    <div class="main-layout">
      <!-- 列表区域 -->
      <section class="list-area">
        <div class="list-header">
          <span class="list-title">
            {{ store.filtered.length }} 条结果
          </span>
          <span class="list-view-mode">{{ viewModeLabel }}</span>
        </div>

        <div class="list-content-container">
          <!-- List 视图 -->
          <div v-if="viewMode === 'list'" class="list-grid">
            <div
              v-for="skill in store.filtered"
              :key="skill.id"
              class="skill-card"
              :class="{ 'skill-card-selected': store.selected?.id === skill.id }"
              @click="selectSkill(skill)"
            >
              <div class="card-header">
                <span class="card-source">{{ getSourceBranding(skill.source).icon }}</span>
                <span class="card-name">{{ i18n.skillText(skill, 'name') }}</span>
              </div>
              <div class="card-description">
                {{ i18n.skillText(skill, 'desc') }}
              </div>
              <div class="card-footer">
                <span class="card-kind">{{ getLabel('kind', skill.kind) }}</span>
                <span class="card-product">{{ skill.product }}</span>
              </div>
            </div>
          </div>

          <!-- Tree 视图 -->
          <div v-else-if="viewMode === 'tree'" class="tree-view">
            <SkillTree @select="selectSkill" />
          </div>

          <!-- 路径树视图 -->
          <div v-else-if="viewMode === 'path-tree'" class="tree-view">
            <DirectoryTree @select="selectSkill" />
          </div>

          <!-- 应用树视图 -->
          <div v-else-if="viewMode === 'app-tree'" class="tree-view">
            <AppTree @select="selectSkill" />
          </div>
        </div>
      </section>

      <!-- 右侧侧面板（Detail Drawer） -->
      <aside class="detail-drawer" :class="{ 'detail-drawer-show': store.selected }">
        <div v-if="store.selected" class="detail-content">
          <!-- 关闭按钮 -->
          <button
            class="detail-close-btn"
            @click="store.selected = null"
            title="关闭详情 (ESC)"
          >✕</button>

          <!-- 标题 -->
          <h2 class="detail-title">{{ i18n.skillText(store.selected, 'name') }}</h2>

          <!-- 描述 -->
          <div class="detail-description">
            {{ i18n.skillText(store.selected, 'desc') }}
          </div>

          <!-- 路径信息（新增） -->
          <div v-if="store.selected.paths?.abs" class="detail-path-section">
            <label class="detail-label">📁 路径</label>
            <div class="path-display">
              <code class="path-code">{{ store.selected.paths.abs }}</code>
              <button
                class="btn-copy"
                @click="copyPath(store.selected.paths.abs)"
                title="复制路径"
              >📋</button>
            </div>
          </div>

          <!-- 标签 -->
          <div v-if="detailBadges.length" class="detail-badges">
            <span v-for="badge in detailBadges" :key="badge" class="badge">{{ badge }}</span>
          </div>

          <!-- 元数据 -->
          <div class="detail-meta">
            <div v-for="[key, value] in detailMeta" :key="key" class="meta-row">
              <dt>{{ key }}</dt>
              <dd>{{ value }}</dd>
            </div>
          </div>

          <!-- 用法示例 -->
          <div class="detail-usage">
            <label class="detail-label">💡 使用方法</label>
            <code class="usage-code">{{ usagePrompt }}</code>
          </div>

          <!-- 内容预览 -->
          <div v-if="detailHtml" class="detail-markdown">
            <label class="detail-label">📄 内容</label>
            <div class="markdown" v-html="detailHtml"></div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else class="detail-empty">
          <p>选择一个技能查看详情</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
/* === 整体布局 === */
.shell-v2 {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  color: #182033;
}

/* === 顶部搜索栏 === */
.topbar-v2 {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.search-section {
  flex: 1;
  min-width: 0;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #f3f4f6;
}

.search-icon {
  flex: 0 0 auto;
  color: #9ca3af;
  font-size: 14px;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  outline: none;
  color: #374151;
  font-size: 14px;
}

.search-input::placeholder {
  color: #d1d5db;
}

.search-clear-btn {
  flex: 0 0 auto;
  background: none;
  border: none;
  color: #9ca3af;
  cursor: pointer;
  font-size: 14px;
  padding: 0;
  transition: color 0.2s;
}

.search-clear-btn:hover {
  color: #374151;
}

.action-buttons {
  flex: 0 0 auto;
  display: flex;
  gap: 8px;
}

.btn-action {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-action:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-action-primary {
  background: #8b5cf6;
  color: #fff;
  border-color: #8b5cf6;
}

.btn-action-primary:hover:not(:disabled) {
  background: #7c3aed;
  border-color: #7c3aed;
}

/* === 快速过滤 Chips === */
.filter-chips-section {
  flex: 0 0 auto;
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  overflow-x: auto;
  overflow-y: hidden;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 16px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  flex-shrink: 0;
}

.chip:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.chip-active {
  background: #8b5cf6;
  color: #fff;
  border-color: #8b5cf6;
}

.chip-more {
  font-size: 11px;
  color: #6b7280;
}

.active-filters {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-wrap: wrap;
}

.filters-label {
  font-size: 11px;
  color: #9ca3af;
  font-weight: 600;
}

.chip-filter {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-filter:hover {
  background: #fca5a5;
  border-color: #ef4444;
}

.chip-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  line-height: 1;
}

/* === 主要布局 === */
.main-layout {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 0;
  gap: 0;
  overflow: hidden;
  transition: grid-template-columns 0.3s ease;
}

.main-layout:has(.detail-drawer-show) {
  grid-template-columns: 1fr 350px;
}

/* === 列表区域 === */
.list-area {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid #e5e7eb;
}

.list-header {
  flex: 0 0 auto;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.list-title {
  font-weight: 600;
  color: #374151;
}

.list-view-mode {
  font-size: 11px;
  color: #9ca3af;
}

.list-content-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 12px;
  padding: 12px;
  align-content: flex-start;
}

/* === 技能卡片 === */
.skill-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 120px;
  overflow: hidden;
}

.skill-card:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-2px);
}

.skill-card-selected {
  background: #f3f0ff;
  border: 2px solid #8b5cf6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
  padding: 11px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}

.card-source {
  flex: 0 0 auto;
  font-size: 14px;
}

.card-name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  font-size: 13px;
  color: #182033;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2;
}

.card-description {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}

.card-footer {
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 11px;
}

.card-kind {
  padding: 2px 6px;
  border-radius: 3px;
  background: #f0f1f3;
  color: #6b7280;
}

.card-product {
  padding: 2px 6px;
  border-radius: 3px;
  background: #f0f1f3;
  color: #6b7280;
}

/* === 树视图 === */
.tree-view {
  padding: 12px;
}

/* === 右侧侧面板 === */
.detail-drawer {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border-left: 1px solid #e5e7eb;
  width: 0;
  opacity: 0;
  transition: all 0.3s ease;
}

.detail-drawer-show {
  width: 350px;
  opacity: 1;
}

.detail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.detail-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  z-index: 10;
}

.detail-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.detail-title {
  flex: 0 0 auto;
  margin: 0;
  padding: 16px 12px 12px 12px;
  font-size: 16px;
  font-weight: 600;
  color: #182033;
  border-bottom: 1px solid #f0f1f3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.detail-description {
  flex: 0 0 auto;
  padding: 12px;
  font-size: 13px;
  color: #6b7280;
  line-height: 1.4;
  border-bottom: 1px solid #f0f1f3;
}

.detail-label {
  display: block;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 12px;
  margin-bottom: 6px;
  padding: 0 12px;
}

.detail-path-section {
  flex: 0 0 auto;
  padding: 12px;
  border-bottom: 1px solid #f0f1f3;
}

.path-display {
  display: flex;
  align-items: center;
  gap: 8px;
}

.path-code {
  flex: 1;
  min-width: 0;
  display: block;
  padding: 6px 8px;
  border-radius: 4px;
  background: #f9fafb;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  border: 1px solid #e5e7eb;
}

.btn-copy {
  flex: 0 0 auto;
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 4px 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-copy:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.detail-badges {
  flex: 0 0 auto;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  border-bottom: 1px solid #f0f1f3;
}

.badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 3px;
  background: #f0f1f3;
  color: #6b7280;
  font-size: 11px;
  font-weight: 500;
}

.detail-meta {
  flex: 0 0 auto;
  padding: 12px;
  font-size: 12px;
  border-bottom: 1px solid #f0f1f3;
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.meta-row {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 8px;
  font-size: 11px;
}

.meta-row dt {
  color: #6b7280;
  font-weight: 600;
  word-break: break-word;
}

.meta-row dd {
  margin: 0;
  color: #374151;
  word-break: break-word;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-usage {
  flex: 0 0 auto;
  padding: 12px;
  border-bottom: 1px solid #f0f1f3;
}

.usage-code {
  display: block;
  padding: 8px;
  border-radius: 4px;
  background: #f9fafb;
  font-family: 'Courier New', monospace;
  font-size: 11px;
  color: #374151;
  border: 1px solid #e5e7eb;
  word-break: break-all;
  white-space: pre-wrap;
}

.detail-markdown {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  font-size: 12px;
}

.markdown {
  line-height: 1.6;
  color: #374151;
}

.markdown h1, .markdown h2, .markdown h3, .markdown h4, .markdown h5, .markdown h6 {
  margin: 12px 0 6px;
  color: #182033;
  font-weight: 600;
}

.markdown h1 { font-size: 18px; }
.markdown h2 { font-size: 16px; }
.markdown h3 { font-size: 14px; }
.markdown h4 { font-size: 13px; }

.markdown p {
  margin: 6px 0;
}

.markdown pre {
  background: #1f2937;
  color: #f3f4f6;
  padding: 8px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 11px;
  line-height: 1.4;
  margin: 6px 0;
}

.markdown code {
  background: #f9fafb;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
  font-size: 12px;
  color: #7c3aed;
}

.markdown pre code {
  background: transparent;
  color: #f3f4f6;
  padding: 0;
}

.detail-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  font-size: 13px;
  text-align: center;
  padding: 40px 20px;
}

/* === 响应式 === */
@media (max-width: 1024px) {
  .main-layout:has(.detail-drawer-show) {
    grid-template-columns: 0.5fr 350px;
  }
}

@media (max-width: 768px) {
  .topbar-v2 {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
    padding: 8px 12px;
  }

  .search-section {
    flex: 1;
  }

  .action-buttons {
    flex: 1;
  }

  .filter-chips-section {
    padding: 6px 12px;
  }

  .main-layout:has(.detail-drawer-show) {
    grid-template-columns: 0;
  }

  .list-area {
    border-right: none;
  }

  .detail-drawer-show {
    width: 100%;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
}

@media (max-width: 480px) {
  .list-grid {
    grid-template-columns: 1fr;
  }

  .detail-drawer-show {
    animation: slideUp 0.3s ease;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}
</style>
