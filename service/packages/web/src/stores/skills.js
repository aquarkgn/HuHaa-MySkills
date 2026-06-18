import { defineStore } from 'pinia';
import Fuse from 'fuse.js';
import { getJson, postJson } from '../lib/api.js';

export const useSkillsStore = defineStore('skills', {
  state: () => ({
    loading: false,
    error: '',
    skills: [],
    stats: null,
    selectedId: '',
    selectedDetail: null,
    reloadState: null,
    reloadConnected: false,
    reloadTimer: null,
    query: '',
    sortKey: 'default',
    filters: {
      editor: '',
      kind: '',
      source: '',
      product: '',
      brand: '',
    },
    notice: '',
  }),

  getters: {
    sources(state) {
      return Object.keys(state.stats?.bySource || {}).sort();
    },
    editors(state) {
      return Object.entries(state.stats?.byEditor || state.stats?.bySource || {})
        .sort((a, b) => {
          if (state.filters.editor && a[0] === state.filters.editor) return -1;
          if (state.filters.editor && b[0] === state.filters.editor) return 1;
          return a[0].localeCompare(b[0], 'zh-CN');
        })
        .map(([name, count]) => ({ name, count }));
    },
    kinds(state) {
      return countOptions(state.skills, x => x.kind);
    },
    filterSources(state) {
      return countOptions(state.skills, x => x.source);
    },
    products(state) {
      return countOptions(state.skills, x => x.product);
    },
    brands(state) {
      return countOptions(state.skills, x => x.brand);
    },
    activeFilterCount(state) {
      return Object.values(state.filters).filter(Boolean).length + (state.query.trim() ? 1 : 0);
    },
    filtered(state) {
      let arr = state.skills;
      const { editor, kind, source, product, brand } = state.filters;
      if (editor) arr = arr.filter(x => (x.editor || x.source) === editor);
      if (kind) arr = arr.filter(x => x.kind === kind);
      if (source) arr = arr.filter(x => x.source === source);
      if (product) arr = arr.filter(x => x.product === product);
      if (brand) arr = arr.filter(x => x.brand === brand);

      const parsed = parseQuery(state.query);
      arr = applyStructuredFilters(arr, parsed.filters);
      const q = parsed.text;
      if (!q) return sortItems(arr, state.sortKey);
      const fuse = new Fuse(arr, {
        threshold: 0.25,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: 'name', weight: 0.40 },
          { name: 'description', weight: 0.30 },
          { name: 'category', weight: 0.15 },
          { name: 'editor', weight: 0.08 },
          { name: 'source', weight: 0.05 },
          { name: 'product', weight: 0.05 },
          { name: 'brand', weight: 0.02 },
        ],
      });
      return sortItems(fuse.search(q).map(r => r.item), state.sortKey);
    },
    selected(state) {
      return state.selectedDetail || state.skills.find(x => x.id === state.selectedId) || null;
    },
  },

  actions: {
    async load() {
      this.loading = true;
      this.error = '';
      try {
        const [skills, stats, reloadState] = await Promise.all([
          getJson('/api/skills'),
          getJson('/api/stats'),
          getJson('/api/reload-state'),
        ]);
        this.applySnapshot(skills, stats);
        this.reloadState = reloadState;
        if (!this.selectedId && skills.length) {
          this.selectedId = skills[0].id;
          await this.loadDetail(skills[0].id);
        }
        this.connectEvents();
      } catch (e) {
        this.error = e.message;
      } finally {
        this.loading = false;
      }
    },
    applySnapshot(skills, stats) {
      this.skills = skills;
      this.stats = stats;
    },
    async refreshSnapshot() {
      const currentId = this.selectedId;
      const [skills, stats, reloadState] = await Promise.all([
        getJson('/api/skills'),
        getJson('/api/stats'),
        getJson('/api/reload-state'),
      ]);
      this.applySnapshot(skills, stats);
      this.reloadState = reloadState;
      if (currentId && skills.some(x => x.id === currentId)) {
        this.selectedId = currentId;
        await this.loadDetail(currentId);
      } else if (skills.length) {
        this.selectedId = skills[0].id;
        await this.loadDetail(skills[0].id);
      } else {
        this.selectedId = '';
        this.selectedDetail = null;
      }
    },
    async loadDetail(id) {
      this.selectedId = id;
      this.error = '';
      try {
        this.selectedDetail = await getJson(`/api/skills/${encodeURIComponent(id)}`);
      } catch (e) {
        this.selectedDetail = this.skills.find(x => x.id === id) || null;
        this.error = e.message;
      }
    },
    async reload(labels = {}) {
      this.error = '';
      this.reloadState = { ...(this.reloadState || {}), scanning: true, lastError: '' };
      try {
        this.reloadState = await postJson('/api/reload', {});
        await this.refreshSnapshot();
        this.flash(labels.done || 'Reloaded');
      } catch (e) {
        this.error = e.message;
        this.reloadState = { ...(this.reloadState || {}), scanning: false, lastError: e.message };
      }
    },
    connectEvents() {
      if (this.reloadConnected || typeof EventSource === 'undefined') return;
      const es = new EventSource('/api/events');
      this.reloadConnected = true;
      es.addEventListener('hello', ev => {
        this.reloadState = JSON.parse(ev.data);
      });
      es.addEventListener('reload-start', ev => {
        this.reloadState = JSON.parse(ev.data);
      });
      es.addEventListener('reload-done', ev => {
        this.reloadState = JSON.parse(ev.data);
        clearTimeout(this.reloadTimer);
        this.reloadTimer = setTimeout(() => {
          this.refreshSnapshot().catch(e => { this.error = e.message; });
        }, 150);
      });
      es.addEventListener('reload-error', ev => {
        this.reloadState = JSON.parse(ev.data);
        this.error = this.reloadState.lastError || 'reload failed';
      });
      es.onerror = () => {
        this.reloadConnected = false;
        es.close();
        setTimeout(() => this.connectEvents(), 1500);
      };
    },
    setFilter(key, value) {
      this.filters[key] = this.filters[key] === value ? '' : value;
    },
    clearFilters() {
      this.query = '';
      this.filters = { editor: '', kind: '', source: '', product: '', brand: '' };
    },
    async copySelected(what, labels = {}) {
      if (!this.selectedId) return;
      const r = await postJson('/api/copy', { id: this.selectedId, what });
      this.flash(`${labels.copied || 'Copied'} ${what} (${r.bytes} ${labels.bytes || 'bytes'})`);
    },
    async openSelected(withWhat, labels = {}) {
      if (!this.selectedId) return;
      await postJson('/api/open', { id: this.selectedId, with: withWhat });
      this.flash(`${labels.opened || 'Opened'} ${withWhat}`);
    },
    flash(msg) {
      this.notice = msg;
      setTimeout(() => {
        if (this.notice === msg) this.notice = '';
      }, 1600);
    },
  },
});

function countOptions(items, pick) {
  const counts = new Map();
  for (const it of items) {
    const value = pick(it);
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'))
    .map(([name, count]) => ({ name, count }));
}

function parseQuery(input) {
  const filters = {};
  const textParts = [];
  const re = /(editor|kind|source|product|brand):("[^"]+"|'[^']+'|\S+)/gi;
  let last = 0;
  let match;
  while ((match = re.exec(input || ''))) {
    const before = input.slice(last, match.index).trim();
    if (before) textParts.push(before);
    filters[match[1].toLowerCase()] = match[2].replace(/^['"]|['"]$/g, '');
    last = re.lastIndex;
  }
  const rest = (input || '').slice(last).trim();
  if (rest) textParts.push(rest);
  return { text: textParts.join(' ').trim(), filters };
}

function applyStructuredFilters(items, filters) {
  let arr = items;
  for (const [key, value] of Object.entries(filters || {})) {
    const needle = String(value || '').toLowerCase();
    if (!needle) continue;
    arr = arr.filter(it => String(fieldValue(it, key) || '').toLowerCase() === needle);
  }
  return arr;
}

function fieldValue(item, key) {
  if (key === 'editor') return item.editor || item.source;
  return item[key];
}

function sortItems(items, sortKey) {
  const arr = [...items];
  const text = v => String(v || '').toLowerCase();
  const time = v => Date.parse(v || '') || 0;

  switch (sortKey) {
    case 'name':
      return arr.sort((a, b) => text(a.name).localeCompare(text(b.name), 'zh-CN'));
    case 'updated':
      return arr.sort((a, b) => time(b.updatedAt) - time(a.updatedAt));
    case 'kind':
      return arr.sort((a, b) => `${text(a.kind)}\u0000${text(a.name)}`.localeCompare(`${text(b.kind)}\u0000${text(b.name)}`, 'zh-CN'));
    case 'source':
      return arr.sort((a, b) => `${text(a.source)}\u0000${text(a.name)}`.localeCompare(`${text(b.source)}\u0000${text(b.name)}`, 'zh-CN'));
    case 'product':
      return arr.sort((a, b) => `${text(a.product)}\u0000${text(a.name)}`.localeCompare(`${text(b.product)}\u0000${text(b.name)}`, 'zh-CN'));
    case 'default':
    default:
      return arr.sort((a, b) => `${text(a.editor || a.source)}\u0000${text(a.name)}`.localeCompare(`${text(b.editor || b.source)}\u0000${text(b.name)}`, 'zh-CN'));
  }
}
