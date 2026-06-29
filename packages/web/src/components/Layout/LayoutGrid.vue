<template>
  <div class="layout-container">
    <!-- Header -->
    <header class="layout-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="header-title">HuHaa-MySkills</h1>
          <div class="header-stats">
            <span class="stat-item">{{ stats.total }} 项</span>
            <span class="stat-separator">·</span>
            <span class="stat-item">{{ stats.sources }} 源</span>
            <span class="stat-separator">·</span>
            <span class="stat-item">{{ stats.brands }} 品牌</span>
          </div>
        </div>
        <div class="header-right">
          <button @click="toggleSidebar" class="btn-icon" :title="sidebarOpen ? '关闭侧栏' : '打开侧栏'">
            <svg class="icon" :style="{ transform: sidebarOpen ? '' : 'scaleX(-1)' }">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <button @click="toggleViewMode" class="btn-icon" :title="`当前: ${viewModeLabel}`">
            <svg class="icon">
              <path d="M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
      </div>
    </header>

    <!-- Search Bar -->
    <div class="search-section">
      <input 
        v-model="searchQuery" 
        type="text" 
        class="search-input" 
        placeholder="搜索名称、描述... (Cmd+K)"
        @keydown.escape="searchQuery = ''"
      />
      <div v-if="activeFilters.length > 0" class="filter-chips">
        <div 
          v-for="chip in activeFilters" 
          :key="`${chip.key}-${chip.value}`"
          class="chip"
        >
          <span class="chip-label">{{ chip.label }}:</span>
          <span class="chip-value">{{ chip.value }}</span>
          <button @click="removeFilter(chip.key)" class="chip-close" type="button">×</button>
        </div>
        <button v-if="hasFilters" @click="clearAllFilters" class="chip chip-clear">
          清除全部
        </button>
      </div>
    </div>

    <!-- Main Layout -->
    <div class="layout-main">
      <!-- Sidebar: Filters -->
      <aside 
        class="layout-sidebar" 
        :class="{ 'sidebar-open': sidebarOpen }"
        role="navigation"
        aria-label="过滤条件"
      >
        <!-- Sidebar Toggle for Mobile -->
        <button @click="toggleSidebar" class="btn-close-sidebar">
          <svg class="icon" viewBox="0 0 24 24" fill="none">
            <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>

        <!-- Source Filter -->
        <FilterSection 
          title="数据源"
          :items="sourceItems"
          :selected="filters.source"
          @select="selectFilter('source', $event)"
          icon="📂"
        />

        <!-- Editor Filter -->
        <FilterSection 
          title="编辑器"
          :items="editorItems"
          :selected="filters.editor"
          @select="selectFilter('editor', $event)"
          icon="✏️"
        />

        <!-- Kind Filter -->
        <FilterSection 
          title="类型"
          :items="kindItems"
          :selected="filters.kind"
          @select="selectFilter('kind', $event)"
          icon="📋"
        />

        <!-- Brand Filter -->
        <FilterSection 
          title="品牌"
          :items="brandItems"
          :selected="filters.brand"
          @select="selectFilter('brand', $event)"
          icon="🎨"
        />

        <!-- Category Filter -->
        <FilterSection 
          title="分类"
          :items="categoryItems"
          :selected="filters.category"
          @select="selectFilter('category', $event)"
          icon="📁"
        />
      </aside>

      <!-- Sidebar Overlay for Mobile -->
      <div 
        v-if="sidebarOpen" 
        class="sidebar-overlay" 
        @click="toggleSidebar"
      />

      <!-- Main Content -->
      <main class="layout-content">
        <!-- List View -->
        <section class="content-list" role="region" aria-label="技能列表">
          <div class="list-header">
            <h2 class="list-title">
              {{ filteredItems.length }}/{{ totalItems }} 条
            </h2>
            <div class="list-actions">
              <button 
                v-for="mode in viewModes"
                :key="mode"
                @click="setViewMode(mode)"
                :class="['view-btn', { active: currentViewMode === mode }]"
                :title="`${mode} 视图`"
              >
                {{ modeLabel(mode) }}
              </button>
            </div>
          </div>

          <div class="list-container">
            <div v-if="filteredItems.length === 0" class="list-empty">
              <p>未找到匹配的技能</p>
            </div>
            <div v-else class="list-items" :class="`list-${currentViewMode}`">
              <div 
                v-for="item in filteredItems"
                :key="item.id"
                @click="selectItem(item)"
                :class="['list-item', { 'item-selected': selectedItem?.id === item.id }]"
                role="button"
                :tabindex="0"
                @keydown.enter="selectItem(item)"
              >
                <div class="item-brand" v-if="item.brand">
                  <span :style="{ backgroundColor: getBrandColor(item.brand) }" class="brand-dot"/>
                </div>
                <div class="item-content">
                  <h3 class="item-title">{{ item.name }}</h3>
                  <p class="item-desc">{{ item.preview }}</p>
                  <div class="item-tags">
                    <span v-for="tag in getItemTags(item)" :key="tag" class="tag">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Detail Panel -->
        <aside 
          v-if="selectedItem" 
          class="content-detail" 
          role="region"
          aria-label="详细信息"
        >
          <div class="detail-header">
            <div class="detail-title-bar">
              <h2 class="detail-title">{{ selectedItem.name }}</h2>
              <button 
                @click="selectedItem = null" 
                class="btn-close"
                aria-label="关闭详情面板"
              >
                ×
              </button>
            </div>
            <div class="detail-badges">
              <span 
                v-for="badge in getDetailBadges(selectedItem)" 
                :key="badge"
                class="badge"
              >
                {{ badge }}
              </span>
            </div>
          </div>

          <div class="detail-body">
            <!-- Brand Banner -->
            <div 
              v-if="selectedItem.brand"
              class="brand-banner"
              :style="{ backgroundColor: getBrandColor(selectedItem.brand) }"
            >
              <div class="brand-info">
                <h3 class="brand-name">{{ selectedItem.brand }}</h3>
              </div>
            </div>

            <!-- Description -->
            <section class="detail-section">
              <h4 class="section-title">描述</h4>
              <p class="section-content">{{ selectedItem.preview }}</p>
            </section>

            <!-- Metadata -->
            <section class="detail-section">
              <h4 class="section-title">信息</h4>
              <dl class="meta-list">
                <template v-for="[label, value] in detailMetadata" :key="label">
                  <dt class="meta-label">{{ label }}</dt>
                  <dd class="meta-value">{{ value }}</dd>
                </template>
              </dl>
            </section>

            <!-- Quick Actions -->
            <div class="detail-actions">
              <button class="btn-action" @click="copyPath">
                📋 复制路径
              </button>
              <button class="btn-action" @click="openInFinder">
                📁 在 Finder 中打开
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import FilterSection from './FilterSection.vue';

const props = defineProps({
  items: { type: Array, default: () => [] },
  stats: { type: Object, default: () => ({ total: 0, sources: 0, brands: 0 }) },
});

const searchQuery = ref('');
const sidebarOpen = ref(true);
const currentViewMode = ref('card');
const selectedItem = ref(null);
const filters = ref({
  source: null,
  editor: null,
  kind: null,
  brand: null,
  category: null,
});

const viewModes = ['card', 'list', 'tree', 'compact'];

const modeLabel = (mode) => ({
  card: '卡片',
  list: '列表',
  tree: '分类',
  compact: '紧凑',
})[mode];

const totalItems = computed(() => props.items.length);

const filteredItems = computed(() => {
  return props.items.filter(item => {
    const matchSearch = !searchQuery.value || 
      item.name?.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.preview?.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchFilters = 
      (!filters.value.source || item.source === filters.value.source) &&
      (!filters.value.editor || item.editor === filters.value.editor) &&
      (!filters.value.kind || item.kind === filters.value.kind) &&
      (!filters.value.brand || item.brand === filters.value.brand) &&
      (!filters.value.category || item.category === filters.value.category);
    
    return matchSearch && matchFilters;
  });
});

const hasFilters = computed(() => 
  Object.values(filters.value).some(f => f !== null)
);

const activeFilters = computed(() => {
  const active = [];
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value) active.push({ key, value });
  });
  return active;
});

const sourceItems = computed(() => 
  [...new Set(props.items.map(i => i.source))].filter(Boolean).map(s => ({ id: s, label: s }))
);
const editorItems = computed(() => 
  [...new Set(props.items.map(i => i.editor))].filter(Boolean).map(e => ({ id: e, label: e }))
);
const kindItems = computed(() => 
  [...new Set(props.items.map(i => i.kind))].filter(Boolean).map(k => ({ id: k, label: k }))
);
const brandItems = computed(() => 
  [...new Set(props.items.map(i => i.brand))].filter(Boolean).map(b => ({ id: b, label: b }))
);
const categoryItems = computed(() => 
  [...new Set(props.items.map(i => i.category))].filter(Boolean).map(c => ({ id: c, label: c }))
);

const detailMetadata = computed(() => {
  if (!selectedItem.value) return [];
  const item = selectedItem.value;
  return [
    ['来源', item.source],
    ['编辑器', item.editor],
    ['类型', item.kind],
    ['品牌', item.brand],
    ['分类', item.category],
    ['路径', item.paths?.rel],
    ['大小', formatBytes(item.raw?.length || 0)],
  ].filter(([, v]) => v);
});

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

const toggleViewMode = () => {
  const idx = viewModes.indexOf(currentViewMode.value);
  currentViewMode.value = viewModes[(idx + 1) % viewModes.length];
};

const setViewMode = (mode) => {
  currentViewMode.value = mode;
};

const selectFilter = (key, value) => {
  filters.value[key] = filters.value[key] === value ? null : value;
};

const removeFilter = (key) => {
  filters.value[key] = null;
};

const clearAllFilters = () => {
  Object.keys(filters.value).forEach(key => {
    filters.value[key] = null;
  });
};

const selectItem = (item) => {
  selectedItem.value = item;
};

const getItemTags = (item) => {
  return [item.kind, item.source, item.editor, item.brand].filter(Boolean).slice(0, 3);
};

const getDetailBadges = (item) => {
  return [item.kind, item.source, item.editor, item.brand, item.category].filter(Boolean);
};

const getBrandColor = (brand) => {
  const colors = {
    'Docker': '#2496ED',
    'GitHub': '#333333',
    'Python': '#3776AB',
    'JavaScript': '#F7DF1E',
    'TypeScript': '#3178C6',
  };
  return colors[brand] || '#6B7280';
};

const copyPath = () => {
  if (selectedItem.value?.paths?.abs) {
    navigator.clipboard.writeText(selectedItem.value.paths.abs);
  }
};

const openInFinder = () => {
  // 触发打开文件夹的事件
};

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

onMounted(() => {
  // 响应式调整
  const handleResize = () => {
    if (window.innerWidth < 768) {
      sidebarOpen.value = false;
    }
  };
  window.addEventListener('resize', handleResize);
  handleResize();
});
</script>

<style scoped>
:root {
  --color-primary: #7c3aed;
  --color-bg: #ffffff;
  --color-bg-alt: #f9fafb;
  --color-border: #e5e7eb;
  --color-text: #1f2937;
  --color-text-secondary: #6b7280;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}

* {
  box-sizing: border-box;
}

.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--color-bg);
  color: var(--color-text);
}

/* Header */
.layout-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1600px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--color-primary);
}

.header-stats {
  display: flex;
  gap: var(--spacing-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
}

.stat-separator {
  opacity: 0.5;
}

.header-right {
  display: flex;
  gap: var(--spacing-sm);
}

.btn-icon {
  padding: var(--spacing-sm);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--color-text);
  transition: all 200ms ease;
}

.btn-icon:hover {
  background-color: var(--color-bg-alt);
  border-color: var(--color-primary);
}

.icon {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  fill: none;
}

/* Search Section */
.search-section {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg);
}

.search-input {
  width: 100%;
  padding: 10px var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 14px;
  transition: all 200ms ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-sm);
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease;
}

.chip:hover:not(.chip-clear) {
  border-color: var(--color-primary);
  background-color: rgba(124, 58, 237, 0.05);
}

.chip-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.chip-value {
  color: var(--color-text);
}

.chip-close {
  background: none;
  border: none;
  padding: 0;
  margin-left: 4px;
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 14px;
  line-height: 1;
}

.chip-close:hover {
  color: var(--color-text);
}

.chip-clear {
  background-color: transparent !important;
  border-color: var(--color-border);
  color: var(--color-text-secondary);
  font-weight: 500;
}

/* Main Layout */
.layout-main {
  display: grid;
  grid-template-columns: 200px 1fr;
  flex: 1;
  overflow: hidden;
  gap: 0;
}

/* Sidebar */
.layout-sidebar {
  background-color: var(--color-bg-alt);
  border-right: 1px solid var(--color-border);
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.btn-close-sidebar {
  display: none;
  width: 100%;
  padding: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
}

.sidebar-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
}

/* Content Area */
.layout-content {
  display: grid;
  grid-template-columns: 1fr 450px;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
  overflow: hidden;
}

.content-list {
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  overflow: hidden;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
}

.list-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0;
}

.list-actions {
  display: flex;
  gap: var(--spacing-sm);
}

.view-btn {
  padding: 4px 12px;
  background-color: transparent;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 150ms ease;
  color: var(--color-text-secondary);
}

.view-btn.active {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

.view-btn:hover:not(.active) {
  border-color: var(--color-primary);
}

.list-container {
  flex: 1;
  overflow-y: auto;
}

.list-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.list-items {
  display: grid;
}

.list-items.list-card {
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--spacing-sm);
  padding: var(--spacing-sm);
}

.list-items.list-list {
  grid-template-columns: 1fr;
}

.list-items.list-tree {
  grid-template-columns: 1fr;
}

.list-items.list-compact {
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: var(--spacing-xs);
  padding: var(--spacing-xs);
}

.list-item {
  padding: var(--spacing-md);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 200ms ease;
  display: flex;
  gap: var(--spacing-sm);
}

.list-item:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.1);
}

.list-item.item-selected {
  border-color: var(--color-primary);
  background-color: rgba(124, 58, 237, 0.05);
}

.item-brand {
  flex-shrink: 0;
}

.brand-dot {
  display: block;
  width: 8px;
  height: 32px;
  border-radius: 4px;
  opacity: 0.8;
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  margin: 0 0 4px 0;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  display: inline-block;
  padding: 2px 6px;
  background-color: var(--color-bg-alt);
  border-radius: 3px;
  font-size: 10px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}

/* Detail Panel */
.content-detail {
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-alt);
}

.detail-title-bar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-sm);
}

.detail-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  flex: 1;
  word-break: break-word;
}

.btn-close {
  padding: 0;
  width: 32px;
  height: 32px;
  background-color: transparent;
  border: none;
  border-radius: 4px;
  font-size: 24px;
  cursor: pointer;
  color: var(--color-text);
  transition: all 150ms ease;
}

.btn-close:hover {
  background-color: var(--color-border);
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  background-color: var(--color-border);
  border-radius: 4px;
  font-size: 11px;
  color: var(--color-text);
  white-space: nowrap;
}

.detail-body {
  flex: 1;
  overflow-y: auto;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.brand-banner {
  padding: var(--spacing-lg);
  border-radius: 8px;
  color: white;
  margin: 0 calc(-var(--spacing-md));
  margin-top: calc(-var(--spacing-md));
  margin-bottom: 0;
  padding-bottom: var(--spacing-xl);
}

.brand-info {
  text-align: center;
}

.brand-name {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  letter-spacing: 0.5px;
}

.section-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0;
}

.meta-list {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: var(--spacing-sm);
  font-size: 13px;
}

.meta-label {
  font-weight: 500;
  color: var(--color-text-secondary);
}

.meta-value {
  color: var(--color-text);
  word-break: break-word;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
}

.detail-actions {
  display: flex;
  gap: var(--spacing-sm);
  padding-top: var(--spacing-md);
  border-top: 1px solid var(--color-border);
}

.btn-action {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms ease;
  color: var(--color-text);
}

.btn-action:hover {
  background-color: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .layout-main {
    grid-template-columns: 1fr;
  }

  .layout-sidebar {
    position: fixed;
    left: 0;
    top: 0;
    width: 250px;
    height: 100%;
    z-index: 20;
    border-radius: 0;
    transform: translateX(-100%);
    transition: transform 300ms ease;
  }

  .layout-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .btn-close-sidebar {
    display: block;
  }

  .sidebar-overlay {
    display: block;
  }

  .layout-sidebar.sidebar-open ~ .sidebar-overlay {
    z-index: 15;
  }

  .layout-content {
    grid-template-columns: 1fr;
  }

  .content-detail {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 60vh;
    border-radius: 16px 16px 0 0;
    z-index: 25;
  }
}

@media (max-width: 768px) {
  .layout-header {
    padding: var(--spacing-sm);
  }

  .header-content {
    flex-wrap: wrap;
  }

  .header-stats {
    display: none;
  }

  .layout-main {
    grid-template-columns: 1fr;
  }

  .layout-content {
    grid-template-columns: 1fr;
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }

  .content-detail {
    position: fixed;
    right: 0;
    bottom: 0;
    width: 100%;
    max-height: 50vh;
    border-radius: 12px 12px 0 0;
  }

  .list-items.list-card {
    grid-template-columns: 1fr;
  }

  .list-items.list-compact {
    grid-template-columns: repeat(2, 1fr);
  }

  .meta-list {
    grid-template-columns: 80px 1fr;
  }
}

@media (max-width: 480px) {
  .layout-content {
    grid-template-columns: 1fr;
  }

  .detail-body {
    padding: var(--spacing-sm);
  }

  .meta-list {
    grid-template-columns: 1fr;
    gap: var(--spacing-xs);
  }

  .detail-actions {
    flex-direction: column;
  }
}
</style>
