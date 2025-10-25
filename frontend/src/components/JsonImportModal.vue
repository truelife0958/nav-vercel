<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>JSON文件导入</h3>
        <button class="modal-close" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="import-section">
          <label>JSON格式说明：</label>
          <div class="format-help">
            <p>支持以下JSON格式：</p>
            <p>1. 数组格式：<code>[{"title": "标题", "url": "网址", "logo_url": "logo", "desc": "描述"}]</code></p>
            <p>2. 书签格式：Chrome/Firefox导出的书签文件</p>
            <p>3. 自定义格式：包含网站信息的JSON文件</p>
          </div>
        </div>
        <div class="import-section">
          <label>选择目标分类：</label>
          <div class="category-selector">
            <select v-model="jsonImportTargetMenuId" class="input category-select" @change="onJsonImportMenuChange">
              <option value="">选择主分类...</option>
              <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
            </select>
            <select v-model="jsonImportTargetSubMenuId" class="input category-select">
              <option value="">主菜单</option>
              <option v-for="subMenu in jsonImportTargetSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
            </select>
          </div>
        </div>
        <div class="import-section">
          <label>上传JSON文件：</label>
          <input type="file" @change="handleJsonFileUpload" accept=".json" class="input wide" />
        </div>
        <div class="import-section" v-if="jsonPreview.length > 0">
          <label>预览数据（前5条）：</label>
          <div class="json-preview">
            <div v-for="(item, index) in jsonPreview.slice(0, 5)" :key="index" class="preview-item">
              <div><strong>标题:</strong> {{ item.title }}</div>
              <div><strong>网址:</strong> {{ item.url }}</div>
              <div v-if="item.logo_url"><strong>Logo:</strong> {{ item.logo_url }}</div>
              <div v-if="item.desc"><strong>描述:</strong> {{ item.desc }}</div>
            </div>
          </div>
          <p class="preview-count">共解析到 {{ jsonPreview.length }} 个网站</p>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn" @click="importFromJson" :disabled="!jsonImportTargetMenuId || jsonPreview.length === 0">
          导入 {{ jsonPreview.length }} 个网站
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { addCard as apiAddCard } from '@/api';

const props = defineProps({
  visible: Boolean,
  menus: Array
});

const emit = defineEmits(['close', 'imported']);

const jsonImportTargetMenuId = ref('');
const jsonImportTargetSubMenuId = ref('');
const jsonPreview = ref([]);

const jsonImportTargetSubMenus = computed(() => {
  if (!jsonImportTargetMenuId.value) return [];
  const menu = props.menus.find(m => m.id === jsonImportTargetMenuId.value);
  return menu?.subMenus || [];
});

function onJsonImportMenuChange() {
  jsonImportTargetSubMenuId.value = '';
}

function close() {
  emit('close');
}

function handleJsonFileUpload(event) {
  const file = event.target.files;
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const content = e.target.result;
      let data = JSON.parse(content);

      let parsedData = [];

      if (Array.isArray(data)) {
        parsedData = data.map(item => ({
          title: item.title || item.name || '未命名',
          url: item.url || item.href || '',
          logo_url: item.logo_url || item.icon || '',
          desc: item.desc || item.description || ''
        }));
      } else if (data.roots) {
        parsedData = extractBookmarks(data.roots);
      } else if (data.children) {
        parsedData = extractBookmarks(data.children);
      } else {
        parsedData = [{
          title: data.title || data.name || '未命名',
          url: data.url || data.href || '',
          logo_url: data.logo_url || data.icon || '',
          desc: data.desc || data.description || ''
        }];
      }

      jsonPreview.value = parsedData.filter(item => item.url && item.url.startsWith('http'));

      if (jsonPreview.value.length === 0) {
        alert('未找到有效的网站链接');
      }
    } catch (error) {
      alert('JSON文件格式错误：' + error.message);
    }
  };
  reader.readAsText(file);
}

function extractBookmarks(bookmarks) {
  let results = [];

  function traverse(items) {
    for (const item of items) {
      if (item.type === 'url') {
        results.push({
          title: item.name || item.title || '未命名',
          url: item.url,
          logo_url: '',
          desc: ''
        });
      }
      if (item.children) {
        traverse(item.children);
      }
    }
  }

  traverse(bookmarks);
  return results;
}

async function importFromJson() {
  if (!jsonImportTargetMenuId.value || jsonPreview.value.length === 0) return;

  const targetMenuId = parseInt(jsonImportTargetMenuId.value);
  const targetSubMenuId = jsonImportTargetSubMenuId.value ? parseInt(jsonImportTargetSubMenuId.value) : null;

  try {
    for (const item of jsonPreview.value) {
      await apiAddCard({
        menu_id: targetMenuId,
        sub_menu_id: targetSubMenuId,
        title: item.title,
        url: item.url,
        logo_url: item.logo_url,
        desc: item.desc,
        order: 0
      });
    }

    const importedCount = jsonPreview.value.length;
    emit('imported');
    alert(`成功导入 ${importedCount} 个网站`);
    close();
  } catch (error) {
    alert('JSON导入失败：' + error.message);
  }
}
</script>

<style scoped>
/* Styles are identical to BatchImportModal.vue, so they are omitted for brevity. You can copy them from the previous component. */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e5e7eb;
}
.import-section {
  margin-bottom: 20px;
}

.import-section label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.format-help {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  margin-top: 8px;
}

.format-help p {
  margin: 4px 0;
  font-size: 0.85rem;
  color: #6b7280;
}

.format-help code {
  background: #e5e7eb;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.8rem;
}
.json-preview{
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  max-height: 200px;
  overflow-y: auto;
}
.preview-item {
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}
.preview-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}
.preview-item div {
  font-size: 0.85rem;
  margin: 2px 0;
}
.preview-count {
  margin-top: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
}
.category-selector {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.category-select {
  flex: 1;
  min-width: 140px;
}
.input.wide {
  width: 200px;
}
.btn {
  padding: 10px 8px;
  border: none;
  border-radius: 8px;
  background: #399dff;
  color: white;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}
.btn-secondary:hover {
  background: #4b5563;
}
.btn:hover {
  background: #2d7dd2;
  transform: translateY(-1px);
}
.input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #d0d7e2;
  background: #fff;
  color: #222;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}
</style>