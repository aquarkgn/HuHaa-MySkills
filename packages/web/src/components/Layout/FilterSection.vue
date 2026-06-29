<template>
  <div class="filter-section">
    <h3 class="section-header">
      <span class="section-icon">{{ icon }}</span>
      <span class="section-title">{{ title }}</span>
      <span class="section-count">({{ selected ? 1 : 0 }}/{{ items.length }})</span>
    </h3>
    <div class="filter-items">
      <div 
        v-for="item in items" 
        :key="item.id"
        class="filter-item"
      >
        <input
          :id="`filter-${title}-${item.id}`"
          type="checkbox"
          :checked="selected === item.id"
          @change="() => $emit('select', selected === item.id ? null : item.id)"
          class="filter-checkbox"
        />
        <label :for="`filter-${title}-${item.id}`" class="filter-label">
          {{ item.label }}
        </label>
      </div>
      <div v-if="items.length === 0" class="filter-empty">
        无项目
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  icon: { type: String, default: '📋' },
  items: { type: Array, default: () => [] },
  selected: { type: [String, Number], default: null },
});

defineEmits(['select']);
</script>

<style scoped>
.filter-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  margin: 0;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
}

.section-icon {
  font-size: 14px;
}

.section-count {
  margin-left: auto;
  font-weight: 400;
  color: #9ca3af;
}

.filter-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px;
  border-radius: 4px;
  transition: background-color 150ms ease;
}

.filter-item:hover {
  background-color: #f3f4f6;
}

.filter-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #7c3aed;
}

.filter-label {
  flex: 1;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  user-select: none;
}

.filter-empty {
  font-size: 12px;
  color: #9ca3af;
  font-style: italic;
}
</style>
