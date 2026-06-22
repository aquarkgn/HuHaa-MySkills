<script setup>
import { computed, reactive } from 'vue';
import { useSkillsStore } from '../stores/skills.js';

const store = useSkillsStore();
const treeState = reactive(new Map());

const sourceGroups = computed(() => {
  const groups = new Map();
  for (const skill of store.filtered) {
    const source = skill.source || 'other';
    if (!groups.has(source)) groups.set(source, []);
    groups.get(source).push(skill);
  }
  return [...groups.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
});

function toggleGroup(source) {
  treeState.set(source, !treeState.get(source));
}

function getSourceIcon(source) {
  const icons = {
    'hermes': '🤖',
    'claude-code': '💬',
    'cursor': '🖱️',
    'mcp-config': '⚙️',
    'mcp': '⚙️',
    'codex': '📖',
    'project-runbook': '📚',
    'hermes-plugin': '🔌',
    'skills': '✨',
  };
  return icons[source] || '📄';
}
</script>

<template>
  <div class="skill-tree">
    <div v-for="[source, skills] in sourceGroups" :key="source" class="tree-group">
      <button
        class="tree-group-header"
        :class="{ expanded: treeState.get(source) }"
        @click="toggleGroup(source)"
        :title="`${source} (${skills.length})`"
      >
        <span class="tree-arrow">{{ treeState.get(source) ? '▼' : '▶' }}</span>
        <span class="source-icon">{{ getSourceIcon(source) }}</span>
        <span class="source-name">{{ source }}</span>
        <span class="skill-count">{{ skills.length }}</span>
      </button>

      <div v-if="treeState.get(source)" class="tree-group-items">
        <button
          v-for="skill in skills"
          :key="skill.id"
          class="skill-tree-item"
          :class="{ active: skill.id === store.selectedId }"
          @click="store.loadDetail(skill.id)"
          :title="skill.description"
        >
          <span class="icon">{{ getSourceIcon(skill.source) }}</span>
          <span class="name">{{ skill.name }}</span>
          <span v-if="skill.category" class="category-tag">{{ skill.category }}</span>
        </button>
      </div>
    </div>

    <div v-if="sourceGroups.length === 0" class="empty-tree">
      <p>没有找到匹配的技能</p>
    </div>
  </div>
</template>

<style scoped>
.skill-tree {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  font-size: 13px;
  border-right: 1px solid #ddd;
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
  justify-content: flex-start;
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

.source-icon {
  width: 16px;
  text-align: center;
  flex-shrink: 0;
  font-size: 14px;
}

.source-name {
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
  transition: background-color 0.1s ease;
  text-align: left;
  color: inherit;
  justify-content: flex-start;
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

.category-tag {
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
