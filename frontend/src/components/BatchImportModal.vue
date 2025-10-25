<template>
  <div v-if="visible" class="modal-overlay" @click="close">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>批量导入卡片</h3>
        <button class="modal-close" @click="close">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="modal-body">
        <div class="import-section">
          <label>导入格式说明：</label>
          <div class="format-help">
            <p>每行一个卡片，格式：<code>标题|网址|logo链接|描述</code></p>
            <p>示例：<code>GitHub|https://github.com|https://github.com/favicon.ico|代码托管平台</code></p>
          </div>
        </div>
        <div class="import-section">
          <label>选择目标分类：</label>
          <div class="category-selector">
            <select v-model="importTargetMenuId" class="input category-select" @change="onImportMenuChange">
              <option value="">选择主分类...</option>
              <option v-for="menu in menus" :value="menu.id" :key="menu.id">{{ menu.name }}</option>
            </select>
            <select v-model="importTargetSubMenuId" class="input category-select">
              <option value="">主菜单</option>
              <option v-for="subMenu in importTargetSubMenus" :value="subMenu.id" :key="subMenu.id">{{ subMenu.name }}</option>
            </select>
          </div>
        </div>
        <div class="import-section">
          <label>卡片数据：</label>
          <textarea
            v-model="importData"
            placeholder="请输入卡片数据，每行一个..."
            class="import-textarea"
            rows="10"
          ></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">取消</button>
        <button class="btn" @click="importCards" :disabled="!importTargetMenuId || !importData.trim()">导入卡片</button>
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

const importData = ref('');
const importTargetMenuId = ref('');
const importTargetSubMenuId = ref('');

const importTargetSubMenus = computed(() => {
  if (!importTargetMenuId.value) return [];
  const menu = props.menus.find(m => m.id === importTargetMenuId.value);
  return menu?.subMenus || [];
});

function onImportMenuChange() {
  importTargetSubMenuId.value = '';
}

function close() {
  emit('close');
}

async function importCards() {
  if (!importTargetMenuId.value || !importData.value.trim()) return;

  const targetMenuId = parseInt(importTargetMenuId.value);
  const targetSubMenuId = importTargetSubMenuId.value ? parseInt(importTargetSubMenuId.value) : null;

  const lines = importData.value.trim().split('\n');
  const cardsToImport = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split('|');
    if (parts.length < 2) {
      alert(`第 ${i + 1} 行格式错误，至少需要标题和网址`);
      return;
    }

    cardsToImport.push({
      menu_id: targetMenuId,
      sub_menu_id: targetSubMenuId,
      title: (parts || '').trim(),
      url: (parts || '').trim(),
      logo_url: (parts || '').trim(),
      desc: (parts || '').trim(),
      order: 0
    });
  }

  try {
    for (const cardData of cardsToImport) {
      await apiAddCard(cardData);
    }
    
    emit('imported');
    alert(`成功导入 ${cardsToImport.length} 张卡片`);
    close();
  } catch (error) {
    alert('批量导入失败：' + error.message);
  }
}
</script>

<style scoped>
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

.import-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: monospace;
  font-size: 0.85rem;
  resize: vertical;
  min-height: 200px;
}

.import-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
</style>