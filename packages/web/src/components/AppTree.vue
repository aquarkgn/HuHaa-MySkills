<script setup>
import { computed, reactive } from 'vue';
import { useSkillsStore } from '../stores/skills.js';

const store = useSkillsStore();
const treeState = reactive(new Map());

const appGroups = computed(() => {
  const groups = new Map();

  for (const skill of store.filtered) {
    const app = skill.editor || skill.source || 'Other';
    if (!groups.has(app)) groups.set(app, []);
    groups.get(app).push(skill);
  }

  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
});

function toggleApp(app) {
  treeState.set(app, !treeState.get(app));
}

function getAppIcon(app) {
  const icons = {
    'cursor': '🖱️',
    'vs-code': '⚙️',
    'vscode': '⚙️',
    'code': '⚙️',
    'vim': '🎹',
    'neovim': '🎹',
    'nvim': '🎹',
    'emacs': '📝',
    'sublime': '🎨',
    'sublime-text': '🎨',
    'zed': '⚡',
    'helix': '⚡',
    'hermes': '🤖',
    'claude-code': '💬',
    'codex': '📖',
    'atom': '⚛️',
    'jetbrains': '🦾',
    'kate': '📄',
    'gedit': '📝',
    'textmate': '🎸',
    'bbedit': '✏️',
    'openclaw': '🦾',
    'windsurf': '🌊',
    'trae': '🎯',
    'trae-cn': '🎯',
  };

  const lower = String(app || '').toLowerCase();
  for (const [key, icon] of Object.entries(icons)) {
    if (lower.includes(key)) return icon;
  }
  return '📦';
}
</script>

<template>
  <div class="app-tree">
    <div v-for="[app, skills] in appGroups" :key="app" class="tree-group">
      <button
        class="tree-group-header"
        :class="{ expanded: treeState.get(app) }"
        @click="toggleApp(app)"
        :title="`${app} (${skills.length})`"
      >
        <span class="tree-arrow">{{ treeState.get(app) ? '▼' : '▶' }}</span>
        <span class="app-icon">{{ getAppIcon(app) }}</span>
        <span class="app-name">{{ app }}</span>
        <span class="skill-count">{{ skills.length }}</span>
      </button>

      <div v-if="treeState.get(app)" class="tree-group-items">
        <button
          v-for="skill in skills"
          :key="skill.id"
          class="skill-tree-item"
          :class="{ active: skill.id === store.selectedId }"
          @click="store.loadDetail(skill.id)"
          :title="skill.description"
        >
          <span class="icon">{{ getAppIcon(skill.source) }}</span>
          <span class="name">{{ skill.name }}</span>
          <span v-if="skill.source" class="source-tag">{{ skill.source }}</span>
        </button>
      </div>
    </div>

    <div v-if="appGroups.length === 0" class="empty-tree">
      <p>没有找到匹配的技能</p>
    </div>
  </div>
</template>

<style scoped>
.app-tree {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-size: 13px;
  user-select: none;
}

.tree-group {
  border-bottom: 1px solid #f0f0f0;
}

.tree-group-header {
  width: 100%;
  padding: 8px 10px;
  background: #f8f8f8;
  border: none;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  text-align: left;
  transition: all 0.15s ease;
}

.tree-group-header:hover {
  background: #f0f0f0;
}

.tree-group-header.expanded {
  background: #e8e8e8;
}

.tree-arrow {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 11px;
  color: #666;
}

.app-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 14px;
}

.app-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skill-count {
  margin-left: auto;
  color: #999;
  font-size: 11px;
  font-weight: normal;
  flex-shrink: 0;
}

.tree-group-items {
  background: #fafafa;
  display: flex;
  flex-direction: column;
}

.skill-tree-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  text-align: left;
  transition: background-color 0.1s ease;
  color: inherit;
}

.skill-tree-item:hover {
  background: #f0f0f0;
}

.skill-tree-item.active {
  background: #e3f2fd;
  color: #1976d2;
  font-weight: 500;
}

.icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 12px;
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.source-tag {
  margin-left: 4px;
  padding: 1px 4px;
  background: #f0f0f0;
  border-radius: 2px;
  font-size: 10px;
  color: #666;
  flex-shrink: 0;
}

.empty-tree {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100px;
  color: #999;
  font-size: 12px;
}
</style>
