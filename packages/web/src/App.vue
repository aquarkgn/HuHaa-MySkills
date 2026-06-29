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

function handleKeydown(e) {
  if (e.key === 'Escape') {
    store.selected = null;
  }
}

function selectSkill(skill) {
  store.selected = skill;
}

function closeDetail() {
  store.selected = null;
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

function getLabel(type, value) {
  if (!store.stats?.labels || !value) return value;
  const labels = store.stats.labels;
  switch(type) {
    case 'source': return labels.sources?.[value] || value;
    case 'editor': return labels.editors?.[value] || value;
    case 'kind': return labels.kinds?.[value] || value;
    case 'category': return labels.categories?.[value] || value;
    case 'brand': return labels.brands?.[value] || value;
    default: return value;
  }
}
</script>

<template>
  <div class="app-v3">
    <!-- 顶部搜索和过滤栏 -->
    <header class="app-header">
      <div class="header-top">
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
            {{ store.reloadState?.scanning ? '扫描中...' : '扫描' }}
          </button>
        </div>
      </div>

      <!-- 快速过滤 Chips -->
      <div class="filter-chips">
        <div class="chips-row">
          <!-- 来源快速选择 -->
          <button
            v-for="source in filteredSources"
            :key="`src-${source.name}`"
            class="chip"
            :class="{ 'chip-active': store.filters.source === source.name }"
            @click="store.setFilter('source', store.filters.source === source.name ? '' : source.name)"
          >
            {{ getSourceBranding(source.name).icon }} {{ getLabel('source', source.name) }}
          </button>

          <!-- 更多过滤按钮 -->
          <button
            v-if="store.filterSources.length > 3"
            class="chip chip-more"
            @click="showMoreFilters = !showMoreFilters"
          >
            {{ showMoreFilters ? '收起' : '+' }}
          </button>

          <!-- 清除过滤 -->
          <button
            v-if="activeFilterChips.length"
            class="chip chip-clear"
            @click="store.clearFilters"
          >
            🗑️ 清除过滤
          </button>
        </div>

        <!-- 活跃过滤显示 -->
        <div v-if="activeFilterChips.length" class="chips-row chips-active">
          <button
            v-for="chip in activeFilterChips"
            :key="`${chip.key}-${chip.value}`"
            class="chip-tag"
          >
            {{ chip.value }}
            <button
              class="chip-tag-remove"
              @click.stop="clearFilterChip(chip.key)"
            >✕</button>
          </button>
        </div>
      </div>
    </header>

    <!-- 列表区域 -->
    <main class="app-main">
      <div class="list-header">
        <span>{{ store.filtered.length }} 个技能</span>
        <span class="list-mode">{{ viewModeLabel }}</span>
      </div>

      <div class="list-container">
        <!-- Grid 列表 -->
        <div v-if="viewMode === 'list'" class="skills-grid">
          <button
            v-for="skill in store.filtered"
            :key="skill.id"
            class="skill-card"
            @click="selectSkill(skill)"
          >
            <div class="card-icon">{{ getSourceBranding(skill.source).icon }}</div>
            <div class="card-name">{{ i18n.skillText(skill, 'name') }}</div>
            <div class="card-kind">{{ getLabel('kind', skill.kind) }}</div>
          </button>
        </div>

        <!-- 树视图 -->
        <div v-else class="tree-container">
          <SkillTree v-if="viewMode === 'tree'" @select="selectSkill" />
          <DirectoryTree v-else-if="viewMode === 'path-tree'" @select="selectSkill" />
          <AppTree v-else-if="viewMode === 'app-tree'" @select="selectSkill" />
        </div>
      </div>
    </main>

    <!-- 全屏详情弹窗 -->
    <div v-if="store.selected" class="modal-overlay" @click.self="closeDetail">
      <div class="modal-dialog">
        <!-- 头部 -->
        <div class="modal-header">
          <h2 class="modal-title">{{ i18n.skillText(store.selected, 'name') }}</h2>
          <button
            class="modal-close-btn"
            @click="closeDetail"
            title="关闭 (ESC)"
          >✕</button>
        </div>

        <!-- 内容区 -->
        <div class="modal-content">
          <!-- 描述 -->
          <section class="detail-section" v-if="i18n.skillText(store.selected, 'desc')">
            <p class="detail-text">{{ i18n.skillText(store.selected, 'desc') }}</p>
          </section>

          <!-- 路径信息 -->
          <section class="detail-section" v-if="store.selected.paths?.abs">
            <div class="info-block">
              <label class="info-label">📁 路径</label>
              <div class="path-row">
                <code class="path-code">{{ store.selected.paths.abs }}</code>
                <button
                  class="btn-copy-path"
                  @click="copyPath(store.selected.paths.abs)"
                  title="复制路径"
                >📋 复制</button>
              </div>
            </div>
          </section>

          <!-- 标签 -->
          <section class="detail-section" v-if="detailBadges.length">
            <label class="info-label">🏷️ 标签</label>
            <div class="badge-group">
              <span v-for="badge in detailBadges" :key="badge" class="badge">{{ badge }}</span>
            </div>
          </section>

          <!-- 元数据 -->
          <section class="detail-section" v-if="detailMeta.length">
            <label class="info-label">ℹ️ 信息</label>
            <div class="meta-table">
              <div v-for="[key, value] in detailMeta" :key="key" class="meta-row">
                <dt>{{ key }}</dt>
                <dd>{{ value }}</dd>
              </div>
            </div>
          </section>

          <!-- 使用方法 -->
          <section class="detail-section" v-if="usagePrompt">
            <label class="info-label">💡 使用方法</label>
            <div class="code-block">
              <code>{{ usagePrompt }}</code>
            </div>
          </section>

          <!-- 完整内容 -->
          <section class="detail-section" v-if="detailHtml">
            <label class="info-label">📄 完整内容</label>
            <div class="markdown-content" v-html="detailHtml"></div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* === 整体容器 === */
.app-v3 {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #fff;
  color: #182033;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* === 顶部栏 === */
.app-header {
  flex: 0 0 auto;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
}

.header-top {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
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
  white-space: nowrap;
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

/* === Chips 过滤 === */
.filter-chips {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chips-row {
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
  font-weight: 500;
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
  font-size: 13px;
  padding: 5px 8px;
}

.chip-clear {
  background: #fee2e2;
  color: #991b1b;
  border-color: #fecaca;
}

.chip-clear:hover {
  background: #fca5a5;
  border-color: #ef4444;
}

.chips-active {
  margin-top: 4px;
  gap: 6px;
}

.chip-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid #fecaca;
  border-radius: 12px;
  background: #fef2f2;
  color: #991b1b;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.chip-tag:hover {
  background: #fee2e2;
}

.chip-tag-remove {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  line-height: 1;
  transition: transform 0.2s;
}

.chip-tag-remove:hover {
  transform: scale(1.2);
}

/* === 主内容区 === */
.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  flex: 0 0 auto;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
}

.list-mode {
  font-size: 11px;
  color: #9ca3af;
}

.list-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}

/* === 技能卡片网格 === */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  align-content: flex-start;
}

.skill-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 90px;
  text-align: center;
}

.skill-card:hover {
  background: #f9fafb;
  border-color: #9ca3af;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

.skill-card:active {
  transform: translateY(0);
}

.card-icon {
  font-size: 24px;
  line-height: 1;
}

.card-name {
  font-weight: 600;
  font-size: 11px;
  color: #182033;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  width: 100%;
  line-height: 1.2;
}

.card-kind {
  font-size: 10px;
  color: #9ca3af;
  background: #f0f1f3;
  padding: 2px 4px;
  border-radius: 2px;
}

/* === 树视图 === */
.tree-container {
  padding: 0;
  font-size: 13px;
}

/* === 模态窗口（全屏） === */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-dialog {
  display: flex;
  flex-direction: column;
  width: 95vw;
  max-width: 900px;
  height: 90vh;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #182033;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.modal-close-btn {
  flex: 0 0 auto;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  font-size: 18px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background: #e5e7eb;
  color: #374151;
}

.modal-close-btn:active {
  background: #d1d5db;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  font-size: 14px;
  color: #374151;
  line-height: 1.6;
}

/* === 详情区块 === */
.detail-section {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f1f3;
}

.detail-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.detail-text {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  line-height: 1.6;
}

.info-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.info-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.path-code {
  flex: 1;
  display: block;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f9fafb;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #374151;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.btn-copy-path {
  flex: 0 0 auto;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.btn-copy-path:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  background: #f0f1f3;
  color: #6b7280;
  font-size: 12px;
  font-weight: 500;
}

.meta-table {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  font-size: 13px;
}

.meta-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
}

.meta-row dt {
  color: #6b7280;
  font-weight: 600;
}

.meta-row dd {
  margin: 0;
  color: #374151;
  word-break: break-word;
}

.code-block {
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: #f9fafb;
}

.code-block code {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #374151;
  word-break: break-all;
  white-space: pre-wrap;
}

/* === Markdown === */
.markdown-content {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3,
.markdown-content h4,
.markdown-content h5,
.markdown-content h6 {
  margin: 16px 0 8px;
  color: #182033;
  font-weight: 600;
}

.markdown-content h1 { font-size: 24px; }
.markdown-content h2 { font-size: 20px; }
.markdown-content h3 { font-size: 16px; }
.markdown-content h4 { font-size: 14px; }
.markdown-content h5 { font-size: 13px; }
.markdown-content h6 { font-size: 12px; }

.markdown-content p {
  margin: 8px 0;
}

.markdown-content ul,
.markdown-content ol {
  margin: 8px 0;
  padding-left: 20px;
}

.markdown-content li {
  margin: 4px 0;
}

.markdown-content pre {
  background: #1f2937;
  color: #f3f4f6;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  line-height: 1.5;
  margin: 12px 0;
}

.markdown-content code {
  background: #f9fafb;
  padding: 2px 4px;
  border-radius: 2px;
  font-family: monospace;
  font-size: 13px;
  color: #7c3aed;
}

.markdown-content pre code {
  background: transparent;
  color: #f3f4f6;
  padding: 0;
}

.markdown-content a {
  color: #8b5cf6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

/* === 响应式 === */
@media (max-width: 768px) {
  .header-top {
    flex-direction: column;
    gap: 8px;
  }

  .search-section {
    width: 100%;
  }

  .action-buttons {
    width: 100%;
  }

  .skills-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }

  .modal-dialog {
    width: 98vw;
    height: 95vh;
  }

  .modal-header {
    padding: 16px;
  }

  .modal-content {
    padding: 16px;
  }

  .meta-row {
    grid-template-columns: 80px 1fr;
  }
}

@media (max-width: 480px) {
  .skills-grid {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 6px;
  }

  .skill-card {
    padding: 6px;
    min-height: 80px;
    gap: 4px;
  }

  .card-icon {
    font-size: 20px;
  }

  .card-name {
    font-size: 10px;
  }

  .modal-dialog {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }

  .path-row {
    flex-direction: column;
  }

  .btn-copy-path {
    width: 100%;
  }

  .meta-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

/* === 滚动条 === */
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
